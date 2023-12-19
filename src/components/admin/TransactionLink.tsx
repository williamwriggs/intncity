import React from "react";

import { Link } from "@mui/material";

type BlockchainNetwork = "MATIC" | "MUMBAI";

interface PropsType {
  transactionHash: string;
  network: BlockchainNetwork
}

function getBaseUrlForNetwork(network: BlockchainNetwork): string | null {
  if (network === "MATIC") {
    return "https://polygonscan.com"
  } else if (network === "MUMBAI") {
    return "https://mumbai.polygonscan.com"
  }

  return null;
}


function getTokenWalletUrl(address: string, tokenAddress: string, network: BlockchainNetwork): string | null {
  const baseUrl = getBaseUrlForNetwork(network);
  if (baseUrl === null) {
    return null;
  }

  return `${baseUrl}/token/${tokenAddress}?a=${address}`
}

function getTransactionUrl(transactionHash: string, network: BlockchainNetwork): string | null {
  const baseUrl = getBaseUrlForNetwork(network);
  if (baseUrl === null) {
    return null;
  }

  return `${baseUrl}/tx/${transactionHash}`;
}


interface TokenWalletLinkPropsType {
  address: string;
  tokenAddress: string;
  network: BlockchainNetwork
}

export function TokenWalletLink({
  address,
  tokenAddress,
  network,
}: TokenWalletLinkPropsType): React.ReactElement {
  const url = getTokenWalletUrl(address, tokenAddress, network);
  if (url === null) {
    return <span>{address}</span>
  }

  return <Link href={url} target="_blank">Wallet for {address}</Link>
}

interface PropsType {
  transactionHash: string;
  network: BlockchainNetwork
}

export function TransactionLink({
  transactionHash,
  network,
}: PropsType): React.ReactElement {
  const url = getTransactionUrl(transactionHash, network);
  if (url === null) {
    return <span>{transactionHash}</span>
  }

  return <Link href={url} target="_blank">{transactionHash}</Link>
}
