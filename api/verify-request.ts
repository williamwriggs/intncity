import Airtable from "airtable";
import { TreeRequestState } from "../backend/src/types";
/** type imports */
import type { Record, FieldSet } from "airtable";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const { AIRTABLE_KEY } = process.env;

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
    if (!treeRequestRecord) {
      throw new Error(
        `Missing treeRequestRecord for id ${treeRequestRecordId}`
      );
    }

    const state = treeRequestRecord.get("Status");

    if (state !== TreeRequestState.PlantingComplete) {
      throw new Error(
        `Can only verify in state ${TreeRequestState.PlantingComplete},` +
          ` state of ${treeRequestRecordId} is ${state}`
      );
    }

    const updatedRecord = await treeRequestTable.update(treeRequestRecordId, {
      Status: TreeRequestState.VerifiedUnsent,
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
