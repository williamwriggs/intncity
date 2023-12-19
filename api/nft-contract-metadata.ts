/** type imports */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (request: VercelRequest, response: VercelResponse) => {
  // Metadata for OpenSea.
  // https://docs.opensea.io/docs/contract-level-metadata
  const metadata = {
    name: "OakTown Trees",
    description: "Trees planted in Oakland to sequester carbon.",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
    external_link: "https://oaktown.vercel.app/",
    seller_fee_basis_points: 0,
    fee_recipient: "",
  };
  response.status(200).json(metadata);
};
