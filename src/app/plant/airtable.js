import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Airtable from "airtable";
import signedFetch from "@/auth/signedFetch";
import { useAppContext } from "@/context/appContext";
import sign from "@/auth/sign";
import Web3 from "web3";
import prToRawData from "@/auth/prToRawData";
import exifr from "exifr";

// Custom React Hook for fetching Tree List from Airtable
export function useTreeList() {
  const [treeList, setTreeList] = useState(null);

  const fetchTreeList = async () => {
    return base("Tree List")
      .select({
        maxRecords: 500,
        view: "Grid view",
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.
          const transformed = records.map((p) => {
            return {
              id: p.id,
              approved: p.fields["Approved Street Tree"] == "Yes",
              name: p.fields["Common Name"],
              botanical: p.fields["Botanical Name*"],
              minTreeWellSize: p.fields["Minimum Tree-Well Size"],
              height: p.fields["Approximate Height"],
              foliage: p.fields["Foliage (Deciduous or Evergreen) "],
              image: p.fields["Image"] ? p.fields["Image"][0].url : null,
              notes: p.fields["Notes"],
            };
          });

          setTreeList(transformed);
        },
        function done(err) {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
  };

  return { fetchTreeList, plants: treeList };
}

export function useTreeListNew() {
  const {treeList, setTreeList} = useAppContext();
  const url = "/api/trees";

  const fetchTreeList = async () => {
    if(!treeList.length) {
      const res = await fetch(url, {
        method: "GET",
      });
      const trees = await res.json();
      setTreeList(trees);
    }
  };

  return { fetchTreeList, plants: treeList };
}

export async function createTreePlantingRequest(prs, provider) {
  if(prs.length === 0) throw new Error("no requests given")
  
  let requests = []

  for (const i in prs) {
    const web3 = new Web3(provider)
    const address = (await web3.eth.getAccounts())[0]
    const pr = prs[i]
    const treeId = uuidv4()
    const formatted = {
      "Request Date": Date.now(),
      "Tree Id": treeId,
      "Tree Name": pr.name,
      "Tree Category": pr.category,
      "Location Longitude": pr.longitude,
      "Location Latitude": pr.latitude,
      "Questions": pr.questions,
      "Status": "Request Received",
      "Images": [],
      "Location Address": pr.address,
      "Raw Data": null,
      "Signature": null,
      "Manual Location": pr.manualLocation || false
    }

    let gps
    
    for(const image of pr.images) {
      formatted["Images"].push({url: image, filename: pr.name + "_" + formatted["Request Date"] + "_" + i})
      if(!pr?.manualLocation) {
        gps = await exifr.gps(image)
        if(gps?.latitude) {
          formatted["Location Longitude"] = gps.longitude
          formatted["Location Latitude"] = gps.latitude
        }
      } else {
        gps = { longitude: pr.longitude, latitude: pr.latitude}
      }
    }
    const rawData = prToRawData(pr, treeId, address, gps)
    const sig = await sign(provider, rawData)
    formatted["Raw Data"] = rawData
    formatted["Signature"] = sig
    
    
    requests.push(formatted)
  }



  const res = await signedFetch("/api/request", {
    method: "POST",
    provider,
    body: JSON.stringify(requests)
  }).catch(console.error)
  let body = await res.json()


  return body.id;
}
