import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useAsyncEffect from "../utilities/useAsyncEffect";
import RequestDetailForm from "./RequestDetailForm";

export default function Requests() {
  const [requests, setRequests] = useState<any[] | null>(null);

  useAsyncEffect(async () => {
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_BASE_URL || ""}/api/tree-requests`
    );
    const responseJson = await response.json();
    if (responseJson.error) {
      console.log("Error fetching tree requests", responseJson.error);
      // TODO(mgraczyk): Error handling in UI.
      throw new Error(responseJson.error);
      return;
    }

    setRequests(responseJson.records);
  }, []);

  const renderRequest = (request: any) => {
    return (
      <div
        key={request.id}
        style={{
          border: "1px solid black",
          marginBottom: "2px",
          padding: "5px",
        }}
      >
        <RequestDetailForm contents={request.fields} />
        <Link to={`/admin/requests/${request.id}`}>Go to page</Link>
      </div>
    );
  };

  return (
    <div>
      <h3>Tree Requests</h3>
      {requests === null ? "loading" : <ul>{requests.map(renderRequest)}</ul>}
    </div>
  );
}
