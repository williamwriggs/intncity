import { ethers } from "ethers";
import { DistributionManager__factory } from "../typechain-types/factories/contracts/DistributionManager__factory";
import { GovToken__factory } from "../typechain-types/factories/contracts/GovToken__factory";
import { BigNumber } from "@ethersproject/bignumber";
import { Logger } from "@ethersproject/logger";
import { DistributionState, TreeRequestState } from "./types";
import {
  assertStringField,
  AirtableConfig,
  isReadyForWorkState,
  Distribution,
  DistributionForCreate,
  updateDistribution,
  getDistributions,
  updateTreeRequest,
} from "./airtable_minimal";
/** type imports */
import type { Signer, providers } from "ethers";
import type { AutotaskSecretsMap } from "defender-autotask-utils";
import type { DistributionManager } from "../typechain-types/contracts/DistributionManager";
type Provider = providers.Provider;

export type Address = string;

const baseURI = "ipfs://";

export function idToOnChainId(offChainId: string): string {
  // TODO(mgraczyk): Should store the salt in airtable, otherwise this is a
  // privacy problem.
  // Random global salt.
  const salt = "OakTree__E2C7C61B";
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(offChainId + salt));
}

export function makeDistributionObject(
  distributionId: string,
  recipientId: string,
  tokenURI: string,
  erc20Amount: BigNumber,
  treeRequestRecordId: string
): DistributionForCreate {
  if (!tokenURI.startsWith(baseURI)) {
    throw new Error(`tokenURI does not start with baseURI: ${tokenURI} vs ${baseURI}`);
  }

  return {
    distributionId,
    recipientId,
    tokenURI,
    erc20Amount: erc20Amount,
    state: DistributionState.Start,
    onChainDistributionId: idToOnChainId(distributionId),
    onChainRecipientId: idToOnChainId(recipientId),
    treeRequestRecordId: [treeRequestRecordId],
  };
}

interface DistributionStateStepResult {
  // Distribution is done.
  done: boolean;

  // If the caller runs the state machine again, it may make progress without
  // waiting too long.
  again: boolean;

  // The updated distribution.
  distribution: Distribution;
}

function logTxResult(distribution: Distribution, txResult: any) {
  const txResultForLogging = {
    hash: txResult.hash,
    to: txResult.to,
    from: txResult["from"],
    blockNumber: txResult.blockNumber,
    status: txResult["status"],
    confirmations: txResult.confirmations,
    gasUsed: txResult.gasUsed,
  };
  console.log(`txResult for distribution ${distribution.distributionId}`, txResultForLogging);
}

async function stepDistributionStateMachine(
  distribution: Distribution,
  airtableConfig: AirtableConfig,
  sender: Signer,
  erc20Address: Address,
  nftAddress: Address,
  distributionManager: DistributionManager,
  provider: Provider
): Promise<DistributionStateStepResult> {
  if (
    distribution.state === DistributionState.Start ||
    distribution.state === DistributionState.StartEmpty ||
    distribution.state === undefined
  ) {
    console.log("sending distribution", distribution);
    if (distribution.erc20Amount === null) {
      throw new Error("distribution missing erc20Amount");
    }
    if (!distribution.distributionId) {
      throw new Error("distribution missing distributionId");
    }
    if (!distribution.recipientId) {
      throw new Error("distribution missing recipientId");
    }

    let needsUpdate = false;
    if (!distribution.onChainRecipientId) {
      distribution.onChainRecipientId = idToOnChainId(distribution.recipientId);
      needsUpdate = true;
    }
    if (!distribution.onChainDistributionId) {
      distribution.onChainDistributionId = idToOnChainId(distribution.distributionId);
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log("updating distribution with on chain metadata", distribution);
      await updateDistribution(airtableConfig, distribution, distribution);
    }

    const erc20 = GovToken__factory.connect(erc20Address, provider);
    const senderAddress = await sender.getAddress();

    const allowance = await erc20.allowance(senderAddress, distributionManager.address);
    if (allowance.lt(distribution.erc20Amount)) {
      const maxAllowance = BigNumber.from(2n ** 256n - 1n);
      const trx = await erc20
        .connect(sender)
        .increaseAllowance(distributionManager.address, maxAllowance);
      console.log("increase limit transaction", trx.hash);
      const transactionSendTime = new Date().toISOString();
      distribution = await updateDistribution(airtableConfig, distribution, {
        ...distribution,
        transactionHash: trx.hash,
        transactionSendTime,
        state: DistributionState.AwaitingAllowanceIncrease,
      });

      return {
        done: false,
        again: false,
        distribution,
      };
    }

    const fullTokenUri = assertStringField(distribution, "tokenURI");
    if (!fullTokenUri.startsWith(baseURI)) {
      throw new Error(`tokenURI does not start with baseURI: ${fullTokenUri} vs ${baseURI}`);
    }
    const onChainTokenURI = fullTokenUri.slice(baseURI.length);

    // TODO(mgraczyk): Write tx to airtable before attempting to send to mempool.
    const distributeTx = await distributionManager
      .connect(sender)
      .distributeERC20AndERC721ToOffChainId(
        distribution.onChainRecipientId,
        distribution.onChainDistributionId,
        erc20Address,
        distribution.erc20Amount,
        nftAddress,
        onChainTokenURI
      );
    const transactionSendTime = new Date().toISOString();
    console.log("distribute transaction", distributeTx.hash);
    distribution = await updateDistribution(airtableConfig, distribution, {
      ...distribution,
      transactionHash: distributeTx.hash,
      transactionSendTime,
      state: DistributionState.AwaitingDistribution,
    });

    return {
      done: false,
      again: false,
      distribution,
    };
  } else if (distribution.state === DistributionState.AwaitingAllowanceIncrease) {
    const transactionHash = assertStringField(distribution, "transactionHash");

    const confirmsRequired = 1;
    const timeoutMs = 100;
    let txResult;
    try {
      txResult = await provider.waitForTransaction(transactionHash, confirmsRequired, timeoutMs);
    } catch (e: any) {
      if (e.code === Logger.errors.TIMEOUT) {
        console.log(`Transaction ${transactionHash} timed out, trying again later`);
        return {
          done: false,
          again: false,
          distribution,
        };
      }
      throw e;
    }
    logTxResult(distribution, txResult);
    const updatedDistribution = await updateDistribution(airtableConfig, distribution, {
      ...distribution,
      state: DistributionState.Start,
    });

    return {
      done: false,
      again: true,
      distribution: updatedDistribution,
    };
  } else if (distribution.state === DistributionState.AwaitingDistribution) {
    // TODO(mgraczyk): Need to resend if the transaction fails or if it times
    // out.
    const transactionHash = assertStringField(distribution, "transactionHash");

    const confirmsRequired = 1;
    const timeoutMs = 100;
    let txResult;
    try {
      txResult = await provider.waitForTransaction(transactionHash, confirmsRequired, timeoutMs);
    } catch (e: any) {
      if (e.code === Logger.errors.TIMEOUT) {
        console.log(`Transaction ${transactionHash} timed out, trying again later`);
        return {
          done: false,
          again: false,
          distribution,
        };
      }
      throw e;
    }

    logTxResult(distribution, txResult);
    if (!distribution.onChainDistributionId) {
      throw new Error("distribution missing onChainDistributionId");
    }

    console.log("getting distribution info");
    const rawDistributionInfo = await distributionManager.getDistributionInfo(
      distribution.onChainDistributionId
    );
    if (rawDistributionInfo.recipientId !== distribution.onChainRecipientId) {
      throw new Error(
        "distribution failed, bad recipient ID: " +
          `"${rawDistributionInfo.recipientId}" != "${distribution.onChainRecipientId}"`
      );
    }

    const distributionInfo = {
      recipientAddress: rawDistributionInfo.recipient,
      erc721TokenId: rawDistributionInfo.erc721TokenId.toString(),
    };
    console.log("got distribution info", distributionInfo);

    const completedDistribution = await updateDistribution(airtableConfig, distribution, {
      ...distribution,
      ...distributionInfo,
      state: DistributionState.DoneSuccess,
    });

    // Update the original tree request record as well.
    if (!distribution.treeRequestRecordId) {
      throw new Error(
        `Distribution ${distribution.distributionId} missing treeRequestRecordIds array`
      );
    }
    const [treeRequestRecordId] = distribution.treeRequestRecordId;
    if (!treeRequestRecordId) {
      throw new Error(`Distribution ${distribution.distributionId} missing treeRequestRecordId`);
    }
    await updateTreeRequest(airtableConfig, treeRequestRecordId, {
      Status: TreeRequestState.VerifiedSent,
    });

    return {
      done: true,
      again: false,
      distribution: completedDistribution,
    };
  } else if (distribution.state === DistributionState.DoneSuccess) {
    return {
      done: true,
      again: false,
      distribution,
    };
  }

  throw new Error(`Unknown state: "${(distribution.state as any).toString}"`);
}

// Processes a distribution until it is done.
export async function distributeOneToRecipient(
  distribution: Distribution,
  airtableConfig: AirtableConfig,
  sender: Signer,
  erc20Address: Address,
  nftAddress: Address,
  distributionManagerAddress: Address,
  provider: Provider,
  loopUntilDone: boolean

): Promise<Distribution> {
  const distributionManager = DistributionManager__factory.connect(
    distributionManagerAddress,
    provider
  );

  try {
    while (true) {
      const {
        done,
        again,
        distribution: nextDistribution,
      } = await stepDistributionStateMachine(
        distribution,
        airtableConfig,
        sender,
        erc20Address,
        nftAddress,
        distributionManager,
        provider
      );
      distribution = nextDistribution;
      if (done || (!loopUntilDone && !again)) {
        break;
      }
    }
  } catch (err: any) {
    console.error(`Error processing distribution ${distribution.id}`, err);
    const failureReason = err.message || err.toString();
    distribution = await updateDistribution(airtableConfig, distribution, {
      ...distribution,
      state: DistributionState.Failed,
      failureReason,
    });
  }

  return distribution;
}

// Try to make progress on a list of distributions.
// Updates airtable but does not wait for blockchain events.
export async function processDistributionBatch(
  distributionsToProcess: Distribution[],
  airtableConfig: AirtableConfig,
  sender: Signer,
  erc20Address: Address,
  nftAddress: Address,
  distributionManagerAddress: Address,
  provider: Provider
): Promise<void> {
  // Keep stepping the state machine for each distribution until it is no longer
  // ready to be processed.
  //
  // TODO(mgraczyk): Some of this can be done in parallel.
  for (let distribution of distributionsToProcess) {
    await distributeOneToRecipient(
      distribution,
      airtableConfig,
      sender,
      erc20Address,
      nftAddress,
      distributionManagerAddress,
      provider,
      false
    );
  }
}

export interface Context {
  airtableConfig: AirtableConfig;
  erc20Address: string;
  nftAddress: string;
  distributionManagerAddress: string;
}

export function getContextFromSecrets(secrets: AutotaskSecretsMap): Context {
  return {
    airtableConfig: {
      tableId: assertStringField(secrets, "AIRTABLE_TABLE_ID"),
      apiKey: assertStringField(secrets, "AIRTABLE_API_KEY"),
    },
    erc20Address: assertStringField(secrets, "ERC20_ADDRESS"),
    nftAddress: assertStringField(secrets, "NFT_ADDRESS"),
    distributionManagerAddress: assertStringField(secrets, "DISTRIBUTION_MANAGER_ADDRESS"),
  };
}

// Fetch in-progress disitributions from airtable and iterate the state machine
// for each of them, updating airtable with the results.
export async function doWorkLoop(
  context: Context,
  sender: Signer,
  provider: Provider
): Promise<void> {
  // TODO(mgraczyk): Filter in the query.
  const allDistributions = await getDistributions(context.airtableConfig, 100);
  const distributionsToProcess = allDistributions.filter((d: Distribution) =>
    isReadyForWorkState(d.state)
  );

  return await processDistributionBatch(
    distributionsToProcess,
    context.airtableConfig,
    sender,
    context.erc20Address,
    context.nftAddress,
    context.distributionManagerAddress,
    provider
  );
}
