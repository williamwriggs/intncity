import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTreeToken", function () {
  it("Should be able to create and read basic things.", async function () {
    const tokenName = "TestToken";
    const tokenSymbol = "TEST";
    const contractURI = "";

    const NFTreeTokenFactory = await ethers.getContractFactory("NFTreeToken");
    const token = await NFTreeTokenFactory.deploy(tokenName, tokenSymbol, contractURI);
    await token.deployed();

    expect(await token.name()).to.equal(tokenName);
    expect(await token.symbol()).to.equal(tokenSymbol);
  });
});
