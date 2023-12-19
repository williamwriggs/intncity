import { expect } from "chai";
import { ethers } from "hardhat";

describe("GovToken", function () {
  it("Should be able to create and read basic things.", async function () {
    const tokenName = "TestToken";
    const tokenSymbol = "TEST";

    const GovTokenFactory = await ethers.getContractFactory("GovToken");
    const token = await GovTokenFactory.deploy(tokenName, tokenSymbol);
    await token.deployed();

    expect(await token.name()).to.equal(tokenName);
    expect(await token.symbol()).to.equal(tokenSymbol);
  });
});
