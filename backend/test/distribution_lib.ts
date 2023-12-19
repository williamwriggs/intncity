import chai from "chai";
import { ethers, waffle } from "hardhat";
import { deployEverything } from "../src/deploy";

export const baseURI = "ipfs://";

export async function setupDistributionManager() {
  const DistributionManagerFactory = await ethers.getContractFactory("DistributionManager");

  const [owner, recipient] = await ethers.getSigners();

  // 5M tokens.
  const initialErc20Amount = 5000000n * 1_000_000_000_000_000_000n;
  const { erc20, nftToken, distributionManager } = await deployEverything(
    owner,
    owner.address,
    initialErc20Amount
  );
  console.log("owner address", owner.address);

  return { owner, recipient, distributionManager, nftToken, erc20, initialErc20Amount };
}

export async function setupDistributionManagerWithAllowance() {
  const { owner, recipient, distributionManager, nftToken, erc20, initialErc20Amount } =
    await setupDistributionManager();

  const maxAllowance = 2n ** 256n - 1n;
  const increaseAllowanceTx = await erc20
    .connect(owner)
    .increaseAllowance(distributionManager.address, maxAllowance);
  await increaseAllowanceTx.wait();

  return { owner, recipient, distributionManager, nftToken, erc20, initialErc20Amount };
}
