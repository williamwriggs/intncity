import React, { useState, useEffect } from "react";

import { Box, Link, TextField } from "@mui/material";
import { TransactionLink, TokenWalletLink } from "./TransactionLink";

interface LocationLinkPropsType {
  longitude: string;
  latitude: string;
}

function LocationLink({ longitude, latitude }: LocationLinkPropsType) {
  const url = `https://www.google.com/maps/search/${longitude},${latitude}`;
  return (
    <Link href={url} target="_blank">
      {longitude}, {latitude}
    </Link>
  );
}

interface PropsType {
  contents: Record<string, any>;
}

export default function RequestDetailForm({
  contents,
}: PropsType): React.ReactElement {
  const fieldComponents = Object.entries(contents).map(
    ([k, v]: [string, any]) => {
      if (
        [
          "Location Longitude",
          "Location Latitude",
          "tokenURI",
          "erc721TokenId",
          "Location Image",
          "transactionHash",
          "erc20Amount",
          "distributionRecordId",
          "recaAYD7q4Ib9Oet2",
          "recipientAddress",
          "distributionState",
          "Tree Species",
          "Botanical Name",
        ].includes(k)
      ) {
        // Skip these, rendered below.
        return null;
      }

      if (Array.isArray(v) && v.length === 1) {
        v = v[0];
      }
      if (!(typeof v === "string")) {
        v = JSON.stringify(v, null, 2);
      }

      return <TextField disabled key={k} id={k} label={k} defaultValue={v} value={v} />;
    }
  );

  // TODO(mgraczyk): Don't hard code these.
  const network = "MATIC";
  const erc20Address = "0x2b83F94d6d98eC46CDd95D56C0E09A1c09A08024";
  const erc20Symbol = "CARBON";
  const erc721Address = "0x3737c9af42446a0236549148488bfc8b9ae5bd91";
  const openseaUrl = `https://opensea.io/assets/${network.toLowerCase()}/${erc721Address}/${
    contents["erc721TokenId"]
  }`;
  const erc20Amount = contents["erc20Amount"]
    ? Number.parseFloat(contents["erc20Amount"]) / 1e18
    : 0;

  const distributionState = {
    DONE_SUCCESS: (
      <span style={{ backgroundColor: "lightgreen" }}>
        Distributed Successfully
      </span>
    ),
    FAILED: (
      <span style={{ backgroundColor: "lightred" }}>
        Failed, needs attention
      </span>
    ),
  }[contents["distributionState"] as string] || (
    <span style={{ backgroundColor: "lightblue" }}>In Progress</span>
  );

  let distributionInfo;
  if (contents["distributionRecordId"]) {
    distributionInfo = (
      <>
        <div>
          <h4 className="MuiTypography-h4">Distribution</h4>
          <div>Distribution State: {distributionState}</div>
          {contents["transactionHash"] ? (
            <>
              <span>Transaction: </span><TransactionLink
                transactionHash={contents["transactionHash"]}
                network={network}
              />
            </>
          ) : (
            <span>Not yet sent</span>
          )}
        </div>
        <div>
          <h4 className="MuiTypography-h4">ERC20 Tokens</h4>
          <div>
            Amount: {erc20Amount} {erc20Symbol}
          </div>
          {contents["recipientAddress"] && (
            <TokenWalletLink
              address={contents["recipientAddress"] as string}
              tokenAddress={erc20Address}
              network={network}
            />
          )}
        </div>
        <div>
          <h4 className="MuiTypography-h4">NFT Token</h4>
          {contents["erc721TokenId"] ? (
            <>
              <div>ID: {contents["erc721TokenId"]}</div>
              <Link href={openseaUrl}>View on OpenSea</Link>
            </>
          ) : (
            <span>Not yet created</span>
          )}
        </div>
      </>
    );
  } else {
    distributionInfo = (
      <div>
        <h4 className="MuiTypography-h4">Not Distributed</h4>
      </div>
    );
  }

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off"
    >
      <h3>A {contents["Tree Species"]}</h3>
      <h4 style={{ fontStyle: "italic" }}>{contents["Botanical Name"]}</h4>
      <div>
        {contents["Location Image"] &&
          contents["Location Image"].length > 0 && (
            <img src={contents["Location Image"][0].url} width={128} />
          )}
      </div>
      {fieldComponents}
      <div>
        Location:&nbsp;
        <LocationLink
          longitude={contents["Location Longitude"]}
          latitude={contents["Location Latitude"]}
        />
      </div>
      {distributionInfo}
    </Box>
  );
}
