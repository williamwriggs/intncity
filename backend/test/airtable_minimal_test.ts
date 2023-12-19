import chai from "chai";
import { v4 as uuidv4 } from "uuid";
import { waffle } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { DistributionState } from "../src/types";
import {
  getAirtableConfig,
  Distribution,
  DistributionForCreate,
  createDistribution,
  getDistributions,
  updateDistribution,
  deleteDistribution,
} from "../src/airtable_minimal";

chai.config.includeStack = true;
const loadFixture = waffle.loadFixture;
const expect = chai.expect;

const airtableConfig = getAirtableConfig();

describe("airtable_Distribution", function () {
  const distributionForCreate: DistributionForCreate = {
    distributionId: uuidv4(),
    state: DistributionState.Start,
    recipientId: uuidv4(),
    onChainDistributionId: uuidv4(),
    onChainRecipientId: uuidv4(),
    tokenURI: uuidv4(),
    erc20Amount: BigNumber.from(100),
  };

  async function setupDistribution() {
    // Create a distribution airtable.
    const distribution = await createDistribution(airtableConfig, distributionForCreate);
    return { distribution };
  }

  it("createDistribution", async function () {
    const { distribution } = await loadFixture(setupDistribution);

    expect(distribution.distributionId).to.equal(distributionForCreate.distributionId);
    expect(distribution.state).to.equal(distributionForCreate.state);
    expect(distribution.recipientId).to.equal(distributionForCreate.recipientId);
    expect(distribution.onChainDistributionId).to.equal(
      distributionForCreate.onChainDistributionId
    );
    expect(distribution.onChainRecipientId).to.equal(distributionForCreate.onChainRecipientId);
    expect(distribution.tokenURI).to.equal(distributionForCreate.tokenURI);
  });

  it("getDistributions", async function () {
    const { distribution } = await loadFixture(setupDistribution);

    const gottenDistributions = await getDistributions(airtableConfig, 1000);
    const filtered = gottenDistributions.filter(
      (d) => d.distributionId === distribution.distributionId
    );

    expect(filtered).to.have.lengthOf(1);

    const gottenDistribution = filtered[0];
    expect(gottenDistribution.distributionId).to.equal(distributionForCreate.distributionId);
    expect(gottenDistribution.state).to.equal(distributionForCreate.state);
    expect(gottenDistribution.recipientId).to.equal(distributionForCreate.recipientId);
    expect(gottenDistribution.onChainDistributionId).to.equal(
      distributionForCreate.onChainDistributionId
    );
    expect(gottenDistribution.onChainRecipientId).to.equal(
      distributionForCreate.onChainRecipientId
    );
    expect(gottenDistribution.tokenURI).to.equal(distributionForCreate.tokenURI);
  });

  it("updateDistribution", async function () {
    const { distribution } = await loadFixture(setupDistribution);

    const distributionUpdate = {
      ...distribution,
      state: DistributionState.AwaitingDistribution,
      transactionHash: "fake_test_hash",
    };

    expect(distribution.state).to.equal(DistributionState.Start);
    expect(distribution.transactionHash).to.equal(undefined);

    const updateResult = await updateDistribution(airtableConfig, distribution, distributionUpdate);
    expect(updateResult.id).to.equal(distribution.id);
    expect(updateResult.state).to.equal(distributionUpdate.state);
    expect(updateResult.transactionHash).to.equal(distributionUpdate.transactionHash);
    expect(updateResult.recipientId).to.equal(distributionUpdate.recipientId);

    // Make sure we can get it.
    const gottenDistributions = await getDistributions(airtableConfig, 1000);
    const filtered = gottenDistributions.filter((d) => d.id === distribution.id);
    expect(filtered).to.have.lengthOf(1);

    const gottenDistribution = filtered[0];
    expect(gottenDistribution.id).to.equal(distribution.id);
    expect(gottenDistribution.state).to.equal(distributionUpdate.state);
    expect(gottenDistribution.transactionHash).to.equal(distributionUpdate.transactionHash);
    expect(gottenDistribution.recipientId).to.equal(distributionUpdate.recipientId);
  });

  after(async function () {
    const { distribution } = await loadFixture(setupDistribution);
    await deleteDistribution(airtableConfig, distribution);
  });
});
