import Airtable from "airtable";
/** type imports */
import type { VercelRequest, VercelResponse } from "@vercel/node";

const { AIRTABLE_KEY } = process.env;

export default async (request: VercelRequest, response: VercelResponse) => {
  try {
    const { recordId } = request.query;

    const base = new Airtable({ apiKey: AIRTABLE_KEY }).base(
      "appFrSqohBPuXh5o0"
    );
    const table = base("Distributions");

    if (typeof recordId === "string") {
      const record = await table.find(recordId);
      response.status(200).json({
        success: true,
        record: record._rawJson,
      });
    } else {
      let allRecords: any[] = [];
      // TODO(mgraczyk): Implement pagination on the frontend.
      await table
        .select({
          maxRecords: 100,
          view: "Grid view",
        })
        .eachPage(function page(records, fetchNextPage) {
          allRecords = [...allRecords, ...records.map((r) => r._rawJson)];
          fetchNextPage();
        });

      response.status(200).json({
        success: true,
        records: allRecords,
      });
    }
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
