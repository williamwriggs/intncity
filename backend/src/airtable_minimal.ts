import fetch from "node-fetch";
import type { Response } from "node-fetch";
import { BigNumber } from "@ethersproject/bignumber";
import { DistributionState } from "./types";

const _TREE_REQUEST_TABLE = "Tree Request";
const _DISTRIBUTIONS_TABLE = "Distributions";

export interface AirtableConfig {
  tableId: string;
  apiKey: string;
}

// A distribution that may not yet be in Airtable.
export interface DistributionForCreate {
  distributionId: string;
  state: DistributionState;
  recipientId: string;
  onChainDistributionId?: string;
  onChainRecipientId?: string;
  tokenURI: string;
  erc20Amount: BigNumber | null;
  recipientAddress?: string;
  erc721TokenId?: string;
  transactionHash?: string;
  transactionSendTime?: string;
  failureReason?: string;
  treeRequestRecordId?: string[];
}

// A distribution in Airtable.
export interface Distribution extends DistributionForCreate {
  id: string; // The hidden Airtable record ID.
  createdTime?: string;
}

interface AirtableRecordForCreate {
  fields: { [k: string]: string | undefined };
}

interface AirtableRecord extends AirtableRecordForCreate {
  id: string;
  createdTime?: string;
}

interface AirtableResponse {
  error?: string;
  records?: AirtableRecord[];
}

export function assertStringField(obj: any, fieldName: string): string {
  const v = obj[fieldName];
  if (v === undefined) {
    throw new Error(`Missing field: "${fieldName}"`);
  }
  if (typeof v !== "string") {
    throw Error(`Not a string: "${fieldName}`);
  }
  return v;
}

function parseDistribution(r: AirtableRecord): Distribution {
  return {
    id: r.id,
    createdTime: r.createdTime,
    // TODO(mgraczyk): Runtime checks.
    distributionId: r.fields.distributionId || "",
    state: (r.fields.state || DistributionState.Start) as DistributionState,
    recipientId: r.fields.recipientId || "",
    onChainDistributionId: r.fields.onChainDistributionId || "",
    onChainRecipientId: r.fields.onChainRecipientId || "",
    tokenURI: r.fields.tokenURI || "",
    erc20Amount: r.fields.erc20Amount ? BigNumber.from(r.fields.erc20Amount) : null,
    recipientAddress: r.fields.recipientAddress,
    erc721TokenId: r.fields.erc721TokenId,
    transactionHash: r.fields.transactionHash,
    transactionSendTime: r.fields.transactionSendTime,
    failureReason: r.fields.failureReason,
    treeRequestRecordId: r.fields.treeRequestRecordId
      ? (r.fields.treeRequestRecordId as unknown as string[])
      : [],
  };
}

function distributionToRecordForCreate(
  distribution: DistributionForCreate
): AirtableRecordForCreate {
  // TODO(mgraczyk): Do we need to explicitly unpack fields here?
  return {
    fields: Object.fromEntries(
      Object.entries(distribution)
        // Remove unknown keys so airtable doesn't complain.
        .filter(([k, v]) => v !== undefined && k !== "id" && k !== "createdTime")
        .map(([k, v]) => [k, Array.isArray(v) ? v.map((vv) => vv.toString()) : v.toString()])
    ),
  };
}

function distributionToRecordForUpdate(id: string, fields: DistributionForCreate): AirtableRecord {
  return {
    id,
    ...distributionToRecordForCreate(fields),
  };
}

async function recordsOrThrow(result: Response): Promise<AirtableRecord[]> {
  const jsonResult = (await result.json()) as AirtableResponse;
  if (jsonResult.error !== undefined) {
    throw new Error(JSON.stringify(jsonResult.error));
  }
  return jsonResult.records as AirtableRecord[];
}

async function airtableGet(
  airtableConfig: AirtableConfig,
  path: string,
  params: { [k: string]: string }
): Promise<AirtableRecord[]> {
  const url = new URL(`https://api.airtable.com/v0/${airtableConfig.tableId}/${path}`);
  for (const [param, value] of Object.entries(params)) {
    url.searchParams.append(param, value);
  }
  const result = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: "Bearer " + airtableConfig.apiKey },
  });
  return await recordsOrThrow(result);
}

async function airtablePost(
  airtableConfig: AirtableConfig,
  path: string,
  data: { [k: string]: unknown }
): Promise<AirtableRecord[]> {
  const url = new URL(`https://api.airtable.com/v0/${airtableConfig.tableId}/${path}`);
  const result = await fetch(url.toString(), {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + airtableConfig.apiKey,
      "Content-Type": "application/json",
    },
  });
  return await recordsOrThrow(result);
}

async function airtablePatch(
  airtableConfig: AirtableConfig,
  path: string,
  data: { [k: string]: unknown }
): Promise<AirtableRecord[]> {
  const url = new URL(`https://api.airtable.com/v0/${airtableConfig.tableId}/${path}`);
  const result = await fetch(url.toString(), {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + airtableConfig.apiKey,
      "Content-Type": "application/json",
    },
  });
  return await recordsOrThrow(result);
}

async function airtablePostOne(
  airtableConfig: AirtableConfig,
  tableName: string,
  record: AirtableRecordForCreate
): Promise<AirtableRecord> {
  const result = await airtablePost(airtableConfig, tableName, {
    records: [record],
  });
  return result[0];
}

async function airtablePatchOne(
  airtableConfig: AirtableConfig,
  tableName: string,
  updateRecord: AirtableRecord
): Promise<AirtableRecord> {
  const result = await airtablePatch(airtableConfig, tableName, {
    records: [updateRecord],
  });
  return result[0];
}

async function airtableDelete(airtableConfig: AirtableConfig, path: string, recordIds: string[]) {
  const url = new URL(`https://api.airtable.com/v0/${airtableConfig.tableId}/${path}`);
  for (const recordId of recordIds) {
    url.searchParams.append("records[]", recordId);
  }

  const result = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + airtableConfig.apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return await recordsOrThrow(result);
}

export function getAirtableConfig(): AirtableConfig {
  return {
    tableId: assertStringField(process.env, "AIRTABLE_TABLE_ID"),
    apiKey: assertStringField(process.env, "AIRTABLE_API_KEY"),
  };
}

export function isDoneState(state: DistributionState): boolean {
  return state === DistributionState.DoneSuccess;
}

export function isReadyForWorkState(state: DistributionState): boolean {
  return state !== DistributionState.DoneSuccess
          && state !== DistributionState.Failed;
}

// Everything is a CRUD app.
export async function createDistribution(
  airtableConfig: AirtableConfig,
  distribution: DistributionForCreate
): Promise<Distribution> {
  const result = await airtablePostOne(
    airtableConfig,
    _DISTRIBUTIONS_TABLE,
    distributionToRecordForCreate(distribution)
  );

  return parseDistribution(result);
}

export async function getDistributions(
  airtableConfig: AirtableConfig,
  maxRecords: number
): Promise<Distribution[]> {
  const result = await airtableGet(airtableConfig, _DISTRIBUTIONS_TABLE, {
    view: "Grid view",
    maxRecords: maxRecords.toString(),
  });

  return result.map(parseDistribution);
}

export async function updateDistribution(
  airtableConfig: AirtableConfig,
  distributionToUpdate: Distribution,
  distributionUpdate: DistributionForCreate
): Promise<Distribution> {
  const result = await airtablePatchOne(
    airtableConfig,
    _DISTRIBUTIONS_TABLE,
    distributionToRecordForUpdate(distributionToUpdate.id, distributionUpdate)
  );

  return parseDistribution(result);
}

export async function deleteDistribution(
  airtableConfig: AirtableConfig,
  distribution: Distribution
): Promise<void> {
  await airtableDelete(airtableConfig, _DISTRIBUTIONS_TABLE, [distribution.id]);
}

export async function updateTreeRequest(
  airtableConfig: AirtableConfig,
  treeRequestId: string,
  treeRequestUpdate: { [key: string]: string }
): Promise<void> {
  const result = await airtablePatchOne(airtableConfig, _TREE_REQUEST_TABLE, {
    id: treeRequestId,
    fields: treeRequestUpdate,
  });
}
