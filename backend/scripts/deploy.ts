// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { deployEverything } from "../src/deploy";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const relayerAddress = process.env.POLYGON_TESTNET_RELAYER_ADDRESS;
  if (typeof relayerAddress !== "string") {
    throw new Error("missing relayer address");
  }
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("no deployer, make sure you have a private key in ./.env");
  }

  // 5M tokens.
  const initialErc20Amount = 5000000n * 1_000_000_000_000_000_000n;
  const { erc20, nftToken, distributionManager } = await deployEverything(
    deployer,
    relayerAddress,
    initialErc20Amount
  );
  console.log("Deployed successfully");
  const addresses = {
    govTokenAddress: erc20.address,
    nfTreeAddress: nftToken.address,
    distributionManagerAddress: distributionManager.address,
  };
  console.log(addresses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
