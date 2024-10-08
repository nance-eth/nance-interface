import { TenderlySimulationAPIResponse } from "@/utils/hooks/TenderlyHooks";
import { NextApiRequest, NextApiResponse } from "next";

const TENDERLY_USER = "jigglyjams";
const TENDERLY_PROJECT = "nance";
const TENDERLY_ACCESS_KEY = process.env.TENDERLY_ACCESS_KEY;
const SIMULATE_API_URL = `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method, body } = req;

    const headers = {
      'X-Access-Key': TENDERLY_ACCESS_KEY as string,
    };

    // Forward the request to the destination URL
    console.debug("/api/tenderly forwarding", method, body);
    const response = await fetch(`${SIMULATE_API_URL}/simulate`, {
      method,
      headers,
      body
    });

    // Parse the response data as JSON
    const responseData = await response.json() as TenderlySimulationAPIResponse;

    // make the simulation shareable
    if (responseData?.simulation?.id) {
      await fetch(`${SIMULATE_API_URL}/simulations/${responseData.simulation.id}/share`, {
        method: "POST",
        headers
      });
    }

    // Return the response from the destination URL
    res.status(response.status).json(responseData);
  } catch (error) {
    // Handle any errors that occur during the forwarding process
    console.error('Error forwarding request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
