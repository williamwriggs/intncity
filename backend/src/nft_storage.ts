import { NFTStorage, File } from "nft.storage";
import axios from "axios";
import { generateSlug } from "random-word-slugs";
import type { Attachment, Record, FieldSet } from "airtable";
import type { RandomWordOptions } from "random-word-slugs";

const { NFT_STORAGE_KEY } = process.env;

interface SpeciesAttribute {
  trait_type: "Species";
  value: string;
}
interface LocationAttribute {
  trait_type: "Location";
  value: string;
}

interface BotanicalNameAttribute {
  trait_type: "Botanical Name";
  value: string;
}

interface RequestDateAttribute {
  display_type: "date";
  trait_type: "Request Date";
  value: number;
}
interface ApprovalDateAttribute {
  display_type: "date";
  trait_type: "Approval Date";
  value: number;
}

interface ApproverIdAttribute {
  trait_type: "Approver";
  value: string;
}

type TreeNftAttribute =
  | SpeciesAttribute
  | BotanicalNameAttribute
  | LocationAttribute
  | RequestDateAttribute
  | ApprovalDateAttribute
  | ApproverIdAttribute;

function getArrayField(record: Record<FieldSet>, fieldName: string): string {
  const field = record.get(fieldName);
  if (!Array.isArray(field) || field.length === 0 || typeof field[0] !== "string" || !field[0]) {
    throw new Error(`missing "${fieldName}"`);
  }
  if (field.length > 1) {
    throw new Error(`invalid value for "${fieldName}"`);
  }
  return field[0];
}

function getTreeNftAttributes(treeRequestRecord: Record<FieldSet>): TreeNftAttribute[] {
  // TODO(mgraczyk,dcgudeman): Determine what tree metadata to store on chain.
  // location, etc
  const attributes: TreeNftAttribute[] = [];
  const treeSpecies = getArrayField(treeRequestRecord, "Tree Species");
  attributes.push({
    trait_type: "Species",
    value: treeSpecies,
  });

  const botanicalName = getArrayField(treeRequestRecord, "Botanical Name");
  attributes.push({
    trait_type: "Botanical Name",
    value: botanicalName,
  });

  const longitude = treeRequestRecord.get("Location Longitude");
  const latitude = treeRequestRecord.get("Location Latitude");
  if (typeof longitude !== "number" || typeof latitude !== "number") {
    throw new Error('missing "Location Longitude" or "Location Latitude"');
  }
  attributes.push({
    trait_type: "Location",
    value: `${longitude}, ${latitude}`,
  });
  const requestDateStr = treeRequestRecord.get("Request Date");
  if (typeof requestDateStr !== "string" || !requestDateStr) {
    throw new Error('missing "Request Date"');
  }
  const requestDate = new Date(requestDateStr);
  attributes.push({
    display_type: "date",
    trait_type: "Request Date",
    value: Math.floor(requestDate.getTime() / 1000),
  });
  const approvalDateStr = treeRequestRecord.get("Approval Date");
  if (typeof approvalDateStr !== "string" || !approvalDateStr) {
    throw new Error('missing "Approval Date"');
  }
  const approvalDate = new Date(approvalDateStr);
  attributes.push({
    display_type: "date",
    trait_type: "Approval Date",
    value: Math.floor(approvalDate.getTime() / 1000),
  });
  return attributes;
}

function getNFTName(treeRequestRecord: Record<FieldSet>): string {
  // TODO(dcgudeman): Add random adjective.
  const treeSpecies = getArrayField(treeRequestRecord, "Tree Species");

  // TODO(mgraczyk): Use the planted date instead. Needs to be added to
  // airtable.
  const approvalDateStr = treeRequestRecord.get("Approval Date");
  if (typeof approvalDateStr !== "string" || !approvalDateStr) {
    throw new Error('missing "Approval Date"');
  }
  const approvalDate = new Date(approvalDateStr);
  const datestamp = approvalDate.toISOString().slice(0, 10);
  const options: RandomWordOptions<1> = {
    format: "title",
    partsOfSpeech: ["adjective"],
  };
  const adjective = generateSlug(1, options);

  const name = `${adjective} ${treeSpecies} ${datestamp}`;
  return name;
}

function isAttachments(numArray: any): numArray is readonly Attachment[] {
  if (!Array.isArray(numArray)) {
    return false;
  }
  for (const el of numArray) {
    if (typeof el.url !== "string") {
      return false;
    }
  }
  return true;
}

export async function uploadTokenDataAndGetTokenURI(
  treeRequestRecord: Record<FieldSet>
): Promise<string> {
  if (typeof NFT_STORAGE_KEY !== "string") {
    throw new Error("missing NFT_STORAGE_KEY");
  }

  const attachedImgs = treeRequestRecord.get("Location Image");
  if (!isAttachments(attachedImgs) || attachedImgs.length === 0) {
    throw new Error("invalid tree request, missing image");
  }
  const requestId = treeRequestRecord.get("Request ID");
  if (typeof requestId !== "string") {
    throw new Error("missing Request ID");
  }
  const [firstImage] = attachedImgs;
  const { data, headers } = await axios.get(firstImage.url, {
    responseType: "arraybuffer",
  });
  const contentType = headers["content-type"];
  if (!(typeof contentType === "string" && contentType.startsWith("image"))) {
    throw new Error("invalid tree response, contentType should start with image");
  }
  if (!(data instanceof Buffer)) {
    throw new Error("invalid tree response, data should be of type buffer");
  }

  const file = new File([data], requestId, { type: contentType });

  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

  const name = getNFTName(treeRequestRecord);

  const nftToken = await nftstorage.store({
    image: file,
    name,
    description: "A beautiful tree.",
    attributes: getTreeNftAttributes(treeRequestRecord),
  });
  const { url } = nftToken;
  return url.toString();
}
