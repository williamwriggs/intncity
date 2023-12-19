import { ethers } from "hardhat";
import type { Signer } from "ethers";

export async function deployEverything(
  deployer: Signer,
  ownerAddress: string,
  initialErc20Amount: bigint
) {
  console.log("Deploying contracts with the account:", await deployer.getAddress());
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // We get the contract to deploy
  const DistributionManagerFactory = await ethers.getContractFactory("DistributionManager");
  const distributionManager = await DistributionManagerFactory.deploy();
  await distributionManager.deployed();

  // Prepare NFT, must be owned by distributionManager.
  const contractMetadataURI = "https://oaktown.vercel.app/api/nft-contract-metadata.json";
  const NFTreeTokenFactory = await ethers.getContractFactory("NFTreeToken");
  const nftToken = await NFTreeTokenFactory.deploy("NFTree", "TREE", contractMetadataURI);
  const transferOwnerTx = await nftToken
    .connect(deployer)
    .transferOwnership(distributionManager.address);
  await transferOwnerTx.wait();

  // Setup ERC20.
  const GovTokenFactory = await ethers.getContractFactory("GovToken");
  const erc20 = await GovTokenFactory.deploy("Carbon", "CRBN");
  await erc20.deployed();
  const mintTx = await erc20.connect(deployer).mint(ownerAddress, initialErc20Amount);
  await mintTx.wait();

  // transfer ownership to defender relayer
  const erc20TranfserTrx = await erc20.connect(deployer).transferOwnership(ownerAddress);
  await erc20TranfserTrx.wait();
  const distributionManagerTransferTrx = await distributionManager
    .connect(deployer)
    .transferOwnership(ownerAddress);
  await distributionManagerTransferTrx.wait();
  return {
    erc20,
    nftToken,
    distributionManager,
  };
}
