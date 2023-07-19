import { NextApiRequest, NextApiResponse } from "next";

const DISCORD_API = "https://discord.com/api/v10";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, command } = req.query as Record<string, string>;
  if (!address) return res.status(400).send("Missing address");
  if (!command) return res.status(400).send("Missing command");
  const token = process.env.DISCORD_NANCE_BOT_KEY;
  if (!token) return res.status(400).send("Missing token");
  const url = `${DISCORD_API}/${command}`;
  console.log(url)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
     'Authorization': `Bot ${token}`
    }
  });
  const user = await response.json();
  res.status(200).json(user);
}
