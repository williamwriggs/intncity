import { NFTStorage, File } from "nft.storage";
import Airtable from "airtable";
import axios from "axios";
/** type imports */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Attachment } from "airtable";

const { NFT_STORAGE_KEY, AIRTABLE_KEY } = process.env;
/**
 * steps:
 * 1) read all verified unsent (status === "Verified Unsent") from "Tree Request" table
 * 2) fetch images and store on ipfs via nft.storage and generate ipfs ID
 * 3) create NFT metadata json and store it in ipfs via nft.storage (will contain )
 *    { "image": "ipfs://<image IPFS CID",
 *      "attributes": [{"name": "treeType", "value": "Fir (etc)"},
 *                      ... maybe also coordinates]},
 *      "version": version number,
 *       ... other shit, see what metadata we should add
 *    }
 * 4) write to pending distribution table:
 *    recipientId = keccak256(salt + email)
 *    distributionId = Request ID from the Tree Request table
 *    createdAt = current timestamp
 *    tokenURI = the ipfs CID (not including the ipfs:// prefix)
 * 5) update status to "Verified Sending"
 *
 */
// interface VerifiedUnsentRequest {
//   "Request ID": string; // "d37ecaff-ce0f-4bf7-9959-c3b9b0573705";
//   "Request Date": string; // "2022-06-01T23:40:00.000Z";
//   "Requestor Email": string; // "billy.riggs@gmail.com";
//   "Approval Date": string; // "2022-06-08T23:42:00.000Z";
//   Approver: string; // "admin1";
//   "Location Longitude": number; // 37.8104122;
//   "Location Latitude": number; // -122.2771465;
//   "Location Image": Attachment[];
//   "Requested Tree": string[];
//   Status: string;
// }

interface UpdateRequest {
  id: string;
  fields: {
    Status: "Verified Sending";
    tokenURI: string;
    "NFT Uploaded At": string;
  };
}
export default (request: VercelRequest, response: VercelResponse) => {
  if (typeof NFT_STORAGE_KEY !== "string") {
    throw new Error("missing NFT_STORAGE_KEY");
  }
  if (typeof AIRTABLE_KEY !== "string") {
    throw new Error("missing AIRTABLE_KEY");
  }
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });
  const base = new Airtable({ apiKey: AIRTABLE_KEY }).base("appFrSqohBPuXh5o0");
  const nftRecords: Promise<UpdateRequest | null>[] = [];
  function isNotNull<T>(item: T | null): item is T {
    return !!item;
  }

  base("Tree Request")
    .select({
      maxRecords: 10,
      view: "Verified Unsent Records",
    })
    .eachPage(
      (records, fetchNextPage) => {
        // This function (`page`) will get called for each page of records.
        for (const record of records) {
          const attachedImgs: readonly Attachment[] | undefined = record.get(
            "Location Image"
          ) as readonly Attachment[] | undefined;
          const requestId = record.get("Request ID") as string | undefined;
          if (attachedImgs && requestId) {
            const [first] = attachedImgs;
            if (first) {
              nftRecords.push(
                axios
                  .get(first.url, {
                    responseType: "arraybuffer",
                  })
                  .then((res) => {
                    const { data, headers } = res;
                    const type = headers["content-type"];
                    if (data instanceof Buffer && type?.startsWith("image")) {
                      const file = new File([data], requestId, { type });
                      return nftstorage
                        .store({
                          image: file,
                          name: requestId,
                          description: "tree nft",
                          properties: {}, // store tree metadata in here
                        })
                        .then((token) => {
                          const { ipnft } = token;
                          const createdAt = new Date();
                          return {
                            id: requestId,
                            fields: {
                              Status: "Verified Sending",
                              tokenURI: ipnft.toString(),
                              "NFT Uploaded At": createdAt.toISOString(),
                            },
                          };
                        });
                    } else {
                      return null;
                    }
                  })
              );
            }
          }
        }

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
      },
      async (err) => {
        if (err) {
          console.error(err);
          response.status(500).json({
            error: err,
          });
        }
        const processedRequests = (await Promise.all(nftRecords)).filter(
          isNotNull
        );
        base("Tree Request").update(processedRequests, (err, records) => {
          if (err) {
            console.error(err);
            return;
          }
          records?.forEach(function (record) {
            console.log(record.get("Request ID"), "updated");
          });
          response.status(200).json({
            success: true,
            updatedRecords: records,
          });
        });
      }
    );
};
