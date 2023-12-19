import Airtable from "airtable";
import { DistributionState, TreeRequestState } from "../backend/src/types";
import { uploadTokenDataAndGetTokenURI } from "../backend/src/nft_storage";
/** type imports */
import type { Record, FieldSet } from "airtable";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const { AIRTABLE_KEY } = process.env;

function computeErc20AmountString(treeRequestRecord: Record<FieldSet>): string {
  // TODO(mgraczyk,dcgudeman): Implement
  return "1000000000000000000";
}

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method === "OPTIONS") {
    response.status(200).end();
    return;
  }
  try {
    const { treeRequestRecordId } = request.body;
    if (typeof treeRequestRecordId !== "string") {
      throw new Error("Missing treeRequestRecordId");
    }
    const base = new Airtable({ apiKey: AIRTABLE_KEY }).base(
      "appFrSqohBPuXh5o0"
    );
    const treeRequestTable = base("Tree Request");

    const treeRequestRecord = await treeRequestTable.find(treeRequestRecordId);

    const distributionRecordId = treeRequestRecord.get("distributionRecordId");
    if (distributionRecordId) {
      // Already created distribution.
      response.status(200).json({
        success: true,
        record: treeRequestRecord._rawJson,
      });
      return;
    }

    const tokenURI = await uploadTokenDataAndGetTokenURI(treeRequestRecord);
    const erc20Amount = computeErc20AmountString(treeRequestRecord);
    const distributionId = treeRequestRecord.get("Request ID");
    if (typeof distributionId !== "string") {
      throw new Error("missing Request ID");
    }
    const recipientId = treeRequestRecord.get("Requestor Email");
    if (typeof recipientId !== "string") {
      throw new Error("missing Requestor Email");
    }

    const distribution = {
      distributionId,
      state: DistributionState.Start,
      recipientId,
      tokenURI,
      erc20Amount,
      treeRequestRecordId: [treeRequestRecordId],
    };
    const createdDistribution = await base("Distributions").create(
      distribution
    );

    // Update state only after creating the distribution so that we handle
    // failures correctly.
    const updatedRecord = await treeRequestTable.update(treeRequestRecordId, {
      Status: TreeRequestState.VerifiedSending,
      distributionRecordId: [createdDistribution.id],
    });

    response.status(200).json({
      success: true,
      record: updatedRecord._rawJson,
    });
  } catch (err: any) {
    response.status(400).json({
      success: false,
      error:
        typeof err !== "object" || err instanceof Error
          ? err.toString()
          : JSON.stringify(err),
    });
  }
};
