import { NextApiRequest, NextApiResponse } from "next";
import { redis } from "../../../utils/functions/redis";

// delete discord user from redis
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query as Record<string, string>;
  if (!address) return res.status(400).send("Missing address");
  const del = await redis.del(address);
  res.status(200).json({ success: true });
}