import Airtable from "airtable";
import { uploadTokenDataAndGetTokenURI } from "../src/nft_storage";

const { AIRTABLE_API_KEY, AIRTABLE_TABLE_ID } = process.env;

async function main() {
  if (!AIRTABLE_TABLE_ID) {
    throw new Error("Missing AIRTABLE_TABLE_ID from env");
  }
  if (!AIRTABLE_API_KEY) {
    throw new Error("Missing AIRTABLE_API_KEY from env");
  }

  // TODO(mgraczyk): Pass this in argv.
  const treeRequestRecordId = "receGNafjOKKTgtxi";

  const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_TABLE_ID);
  const treeRequestTable = base("Tree Request");
  const treeRequestRecord = await treeRequestTable.find(treeRequestRecordId);
  if (!treeRequestRecord) {
    throw new Error(`No record for ID: "${treeRequestRecordId}"`);
  }

  const tokenUri = await uploadTokenDataAndGetTokenURI(treeRequestRecord)
  const url = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  console.log("ipfs URL", url);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
