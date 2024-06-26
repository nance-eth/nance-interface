import { NextApiRequest, NextApiResponse } from "next";
import { fetchDelegators } from "../../utils/hooks/snapshot/Delegations";
import { fetchAllVotesOfAddress } from "@/utils/hooks/snapshot/Vote";
import { AllVotes } from "@/models/SnapshotTypes";
import { fetchVotingPower } from "../../utils/hooks/snapshot/VotingPower";
import { fetchCreatedProposals } from "../../utils/hooks/NanceHooks";
import { Proposal } from "@nance/nance-sdk";

export type ProfileResponse = {
  vp: number
  delegators: string[]
  proposals: Pick<Proposal, "title" | "uuid" | "proposalId">[],
  votes: AllVotes
}

// FIXME retrieve from API instead of fix values here
const NANCE_MAPPING: {[key: string]: string} = {
  "jbdao.eth": "juicebox",
  "gov.thirstythirsty.eth": "thirstythirsty",
  "jigglyjams.eth": "waterbox"
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const voter = req.query.voter as string;
  const space = req.query.space as string;
  const proposal = req.query.proposal as string;
  const prefix = process.env.NODE_ENV === "production" ? `https://${req.headers.host}` : `http://${req.headers.host}`;
  console.debug("api.profile", { query: req.query, prefix: prefix });

  const nanceSpace = NANCE_MAPPING[space];

  try {
    const vp = await fetchVotingPower(voter, space, proposal);
    const votes = await fetchAllVotesOfAddress(voter, 1000, space);
    const delegators = await fetchDelegators(voter, space);
    const proposals = await fetchCreatedProposals(nanceSpace, voter, prefix);

    const response: ProfileResponse = {
      vp: vp?.vp ?? 0,
      delegators: delegators?.map(o => o.delegator) ?? [],
      proposals: proposals?.data?.proposals.map(p => {
        return { title: p.title, uuid: p.uuid, proposalId: p.proposalId };
      }) ?? [],
      votes
    };

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=172800"
    );
    res.status(200).json(response);
  } catch (err) {
    console.debug("api.profile.error", err);
    if (err instanceof Error) {
      res.status(500).json({ err: err.message });
    } else {
      res.status(500).json({ err: `Something wrong happened: ${JSON.stringify(err)}` });
    }
  }
}
