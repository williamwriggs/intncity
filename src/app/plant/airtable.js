import { useState }  from 'react';
import { v4 as uuidv4 } from 'uuid';
import Airtable from 'airtable';

const API_KEY = 'keyXYRXQVx9uUgYSX';
const BASE_ID = 'appTdrMAIaYDa7one';

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: API_KEY
});
const base = Airtable.base(BASE_ID);

// Custom React Hook for fetching Tree List from Airtable
export function useTreeList() {
    const [treeList, setTreeList] = useState(null);
   
    const fetchTreeList = async () => {
      return base('Tree List').select({
        maxRecords: 500,
        view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.
          const transformed = records.map((p) => {
            return {
                id: p.id,
                approved: p.fields['Approved Street Tree'] == 'Yes',
                name: p.fields['Common Name'],
                botanical: p.fields['Botanical Name*'],
                minTreeWellSize: p.fields['Minimum Tree-Well Size'],
                height: p.fields['Approximate Height'],
                foliage: p.fields['Foliage (Deciduous or Evergreen) '],
                image: p.fields['Image'] ? p.fields['Image'][0].url : null,
                notes: p.fields['Notes'],
            };              
          });
          
          setTreeList(transformed);

      }, function done(err) {
          if (err) { console.error(err); return; }
      });
    }
    
    return { fetchTreeList, plants: treeList }
}

export async function createTreePlantingRequest(pr) {
  let requestId = uuidv4();
  base('Tree Request').create([
    {
      "fields": {
        "Request ID": requestId,
        "Request Date": Date.now(),
        "Requestor Email": pr.email,
        "Requested Tree": [
          pr.treeid
        ],
        "Location Longitude": pr.longitude,
        "Location Latitude": pr.latitude,
        "Questions": pr.questions,
        "Status": "Request Received",
        "Location Image": pr.images,
      }
    },
  ], function(err, records) {
    if (err) {
      console.error(err);
      return;
    }
    let appId = "";
    records?.forEach(function (record) {
      appId = record.fields['Request ID'];
      console.log("Created request ID: " + appId);
    });
  });
  return requestId;
}

