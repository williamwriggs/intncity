import chai from "chai";
import { ethers, waffle } from "hardhat";
import { baseURI, setupDistributionManagerWithAllowance } from "./distribution_lib";

chai.config.includeStack = true;
const loadFixture = waffle.loadFixture;
const expect = chai.expect;

describe("distributeERC20AndERC721", function () {
  const recipientId1 = ethers.utils.id("test recipient id 1");
  const distributionId1 = ethers.utils.id("test distribution id 1");
  const tokenURI = "test_token_uri";

  async function setupOneDistributionToAddress() {
    const { owner, recipient, distributionManager, nftToken, erc20, initialErc20Amount } =
      await loadFixture(setupDistributionManagerWithAllowance);

    // Everything is set up, owner has tokens, manager is allowed to move
    // them and allowed to mint.
    const distributionAmount = 100n * 1_000_000_000_000_000_000n;
    const tx = await distributionManager
      .connect(owner)
      .distributeERC20AndERC721(
        recipient.address,
        recipientId1,
        distributionId1,
        erc20.address,
        distributionAmount,
        nftToken.address,
        tokenURI
      );
    await tx.wait();

    return {
      owner,
      recipient,
      distributionManager,
      nftToken,
      erc20,
      initialErc20Amount,
      distributionAmount,
    };
  }

  async function setupOneDistributionToRecipientId() {
    const { owner, distributionManager, nftToken, erc20, initialErc20Amount } = await loadFixture(
      setupDistributionManagerWithAllowance
    );

    // Everything is set up, owner has tokens, manager is allowed to move
    // them and allowed to mint.
    const distributionAmount = 100n * 1_000_000_000_000_000_000n;
    const tx = await distributionManager
      .connect(owner)
      .distributeERC20AndERC721ToOffChainId(
        recipientId1,
        distributionId1,
        erc20.address,
        distributionAmount,
        nftToken.address,
        tokenURI
      );
    await tx.wait();

    return { owner, distributionManager, nftToken, erc20, initialErc20Amount, distributionAmount };
  }

  it("Distribute to address has correct info", async function () {
    const { owner, recipient, distributionManager, nftToken, erc20 } = await loadFixture(
      setupOneDistributionToAddress
    );

    // Check that things happened.
    const distributionInfo = await distributionManager.getDistributionInfo(distributionId1);
    expect(distributionInfo.recipient).to.equal(recipient.address);
    expect(distributionInfo.recipientId).to.equal(recipientId1);
    expect(distributionInfo.erc721TokenId).to.equal(0);
  });

  it("Distribute to address has correct ERC20 balances", async function () {
    const {
      owner,
      recipient,
      distributionManager,
      nftToken,
      erc20,
      initialErc20Amount,
      distributionAmount,
    } = await loadFixture(setupOneDistributionToAddress);

    expect(await erc20.balanceOf(owner.address)).to.equal(initialErc20Amount - distributionAmount);
    expect(await erc20.balanceOf(recipient.address)).to.equal(distributionAmount);
  });

  it("Distribute to address has correct ERC20 balances", async function () {
    const {
      owner,
      recipient,
      distributionManager,
      nftToken,
      erc20,
      initialErc20Amount,
      distributionAmount,
    } = await loadFixture(setupOneDistributionToAddress);

    expect(await erc20.balanceOf(owner.address)).to.equal(initialErc20Amount - distributionAmount);
    expect(await erc20.balanceOf(recipient.address)).to.equal(distributionAmount);
  });

  it("Distribute to address has correct ERC721 balances", async function () {
    const { owner, recipient, distributionManager, nftToken, erc20 } = await loadFixture(
      setupOneDistributionToAddress
    );
    const tokenId = 0;

    expect(await nftToken.balanceOf(owner.address)).to.equal(0);
    expect(await nftToken.balanceOf(distributionManager.address)).to.equal(0);
    expect(await nftToken.balanceOf(recipient.address)).to.equal(1);
    expect(await nftToken.ownerOf(tokenId)).to.equal(recipient.address);
  });

  it("Distribute to address has correct ERC721 tokenURI", async function () {
    const { owner, recipient, distributionManager, nftToken, erc20 } = await loadFixture(
      setupOneDistributionToAddress
    );
    const fullTokenURI = `${baseURI}${tokenURI}`;
    const tokenId = 0;

    const actualTokenURI = await nftToken.tokenURI(tokenId);
    expect(actualTokenURI).to.equal(fullTokenURI);
  });

  it("Distribute to recipientId has correct info", async function () {
    const { owner, distributionManager, nftToken, erc20 } = await loadFixture(
      setupOneDistributionToRecipientId
    );

    const recipient = await distributionManager.getRecipientAddress(recipientId1);
    expect(recipient).to.not.equal("0x0000000000000000000000000000000000000000");

    const distributionInfo = await distributionManager.getDistributionInfo(distributionId1);
    expect(distributionInfo.recipient).to.equal(recipient);
    expect(distributionInfo.recipientId).to.equal(recipientId1);
    expect(distributionInfo.erc721TokenId).to.equal(0);

    expect(recipient).to.equal(distributionInfo.recipient);
  });

  it("Distribute to recipientId has correct ERC20 balances", async function () {
    const { owner, distributionManager, nftToken, erc20, initialErc20Amount, distributionAmount } =
      await loadFixture(setupOneDistributionToRecipientId);

    const recipient = await distributionManager.getRecipientAddress(recipientId1);
    expect(await erc20.balanceOf(owner.address)).to.equal(initialErc20Amount - distributionAmount);
    expect(await erc20.balanceOf(recipient)).to.equal(distributionAmount);
  });

  it("Distribute to recipientId has correct ERC20 balances", async function () {
    const { owner, distributionManager, nftToken, erc20, initialErc20Amount, distributionAmount } =
      await loadFixture(setupOneDistributionToRecipientId);

    const recipient = await distributionManager.getRecipientAddress(recipientId1);
    expect(await erc20.balanceOf(owner.address)).to.equal(initialErc20Amount - distributionAmount);
    expect(await erc20.balanceOf(recipient)).to.equal(distributionAmount);
  });

  it("Distribute to recipientId has correct ERC721 balances", async function () {
    const { owner, distributionManager, nftToken, erc20 } = await loadFixture(
      setupOneDistributionToRecipientId
    );
    const tokenId = 0;

    const recipient = await distributionManager.getRecipientAddress(recipientId1);
    expect(await nftToken.balanceOf(owner.address)).to.equal(0);
    expect(await nftToken.balanceOf(distributionManager.address)).to.equal(0);
    expect(await nftToken.balanceOf(recipient)).to.equal(1);
    expect(await nftToken.ownerOf(tokenId)).to.equal(recipient);
  });

  it("Distribute to recipientId has correct ERC721 tokenURI", async function () {
    const { owner, distributionManager, nftToken, erc20 } = await loadFixture(
      setupOneDistributionToRecipientId
    );
    const fullTokenURI = `${baseURI}${tokenURI}`;
    const tokenId = 0;

    expect(await nftToken.baseURI()).to.equal(baseURI);
    const actualTokenURI = await nftToken.tokenURI(tokenId);
    expect(actualTokenURI).to.equal(fullTokenURI);
  });

  it("Distribute to recipientId creates correct wallet", async function () {
    const { owner, distributionManager, nftToken, erc20 } = await loadFixture(
      setupOneDistributionToRecipientId
    );

    const recipient = await distributionManager.getRecipientAddress(recipientId1);
    const WalletFactory = await ethers.getContractFactory("Wallet");
    const wallet = await WalletFactory.attach(recipient);

    expect(await wallet.owner()).to.equal(owner.address);
    expect(await wallet.recipientId()).to.equal(recipientId1);
  });
});
