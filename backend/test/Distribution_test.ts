import chai from "chai";
import { v4 as uuidv4 } from "uuid";
import { ethers, waffle } from "hardhat";
import { baseURI, setupDistributionManager } from "./distribution_lib";
import { BigNumber } from "@ethersproject/bignumber";
import { DistributionState } from "../src/types";
import Airtable from "airtable";
import {
  assertStringField,
  getAirtableConfig,
  createDistribution,
  getDistributions,
  deleteDistribution,
} from "../src/airtable_minimal";

import { distributeOneToRecipient, makeDistributionObject } from "../src/distribution";

chai.config.includeStack = true;
const expect = chai.expect;

const airtableConfig = getAirtableConfig();

describe("distributeFromAirtable", function () {
  it("distributeOneToRecipient", async function () {
    const { owner, distributionManager, nftToken, erc20, initialErc20Amount } =
      await setupDistributionManager();

    // Allowance should not be increased before first distribution.
    expect(await erc20.allowance(owner.address, distributionManager.address)).to.equal(0);

    const requestId = uuidv4();

    const base = new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.tableId);
    const treeRequestTable = base("Tree Request");
    const treeRequest = await treeRequestTable.create({
      "Request ID": requestId,
    });

    const erc20Amount = 10n;
    const distributionForCreate = makeDistributionObject(
      requestId,
      uuidv4(),
      `${baseURI}${uuidv4()}`,
      BigNumber.from(erc20Amount),
      treeRequest.id // A real record id from the table.
    );
    const distribution = await createDistribution(airtableConfig, distributionForCreate);

    const resultDistribution = await distributeOneToRecipient(
      distribution,
      airtableConfig,
      owner,
      erc20.address,
      nftToken.address,
      distributionManager.address,
      ethers.provider,
      true
    );

    // Check that the results of the transaction make sense.
    const recipientAddress = assertStringField(resultDistribution, 'recipientAddress');
    expect(await erc20.balanceOf(owner.address)).to.equal(initialErc20Amount - erc20Amount);
    expect(await erc20.balanceOf(recipientAddress)).to.equal(erc20Amount);

    // Allowance should not be increased before first distribution.
    expect(await erc20.allowance(owner.address, distributionManager.address)).to.equal(
      2n ** 256n - 1n
    );

    expect(await nftToken.balanceOf(owner.address)).to.equal(0);
    expect(await nftToken.balanceOf(distributionManager.address)).to.equal(0);
    expect(await nftToken.balanceOf(recipientAddress)).to.equal(1);
    expect(await nftToken.totalSupply()).to.equal(1);
    expect(await nftToken.ownerOf(assertStringField(resultDistribution, 'erc721TokenId'))).to.equal(
      recipientAddress
    );

    const WalletFactory = await ethers.getContractFactory("Wallet");
    const wallet = WalletFactory.attach(recipientAddress);
    expect(await wallet.owner()).to.equal(owner.address);
    expect(await wallet.recipientId()).to.equal(distribution.onChainRecipientId);

    const gottenDistributions = await getDistributions(airtableConfig, 1000);
    const filtered = gottenDistributions.filter((d) => d.id === distribution.id);
    expect(filtered).to.have.lengthOf(1);
    const gottenDistribution = filtered[0];

    // TODO(mgraczyk): Check other airtable state.
    expect(gottenDistribution.state).to.equal(DistributionState.DoneSuccess);
    expect(gottenDistribution.erc721TokenId).to.equal(resultDistribution.erc721TokenId);

    // TODO(mgraczyk): Check transaction hash on chain, maybe check receipts?
    expect(gottenDistribution.transactionHash).to.not.be.empty;

    // TODO(mgraczyk): Check that tree request status was updated.
    const treeRequestAfter = await treeRequestTable.find(treeRequest.id);
    expect(treeRequestAfter.get("Status")).to.equal("Verified Sent");

    await deleteDistribution(airtableConfig, distribution);
    await treeRequestTable.destroy(treeRequest.id);
  });

  // TODO(mgraczyk): Add test for error handling, duplicate distributions,
  // insufficient funds to pay tx fee, transaction timeout, transaction fee
  // insufficient, send with invalid nonce, missing data in airtable....
});
