import { Tooltip } from "flowbite-react";
import { useProposalVotes } from "@/utils/hooks/snapshot/Proposals";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import { formatNumber } from "@/utils/functions/NumberFormatter";
import { processChoicesCount } from "@/utils/functions/snapshotUtil";

function merge(arrayOfObjects: { [choice: string]: number }[]) {
  return arrayOfObjects.reduce((result, currentObj) => {
    for (let key in currentObj) {
      if (result.hasOwnProperty(key)) {
        // If key exists, add values
        result[key] += currentObj[key];
      } else {
        // If key doesn't exist, create new key-value pair
        result[key] = currentObj[key];
      }
    }
    return result;
  }, {});
}

export default function ProposalOptions({
  proposal,
  isOverview = false,
}: {
  proposal: SnapshotProposal;
  isOverview?: boolean;
}) {
  const { loading, data, error } = useProposalVotes(
    proposal,
    0,
    "created",
    "",
    isOverview,
    proposal.votes
  );

  let scores = proposal?.scores
    ?.map((score, index) => {
      return { score, index };
    })
    .filter((o) => o.score > 0)
    // sort by score desc
    .sort((a, b) => b.score - a.score);

  const displayVotesByGroup = true;
  let votesGroupByChoice: { [choice: string]: number } = {};
  if (!isOverview && displayVotesByGroup) {
    // iterate votesData and group by choice
    votesGroupByChoice = merge(
      data?.votesData.map((d) => processChoicesCount(proposal.type, d.choice))
    );
  }

  return (
    <dl className="m-2 grid grid-cols-1 gap-5">
      {/* Vote choice data */}
      {!isOverview &&
        proposal.scores_total > 0 &&
        scores.map(({ score, index }) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg bg-white p-3 shadow"
          >
            <Tooltip content={proposal?.choices[index]} trigger="hover">
              <dt className="truncate text-sm font-medium text-gray-500">
                {proposal?.choices[index]}
              </dt>
            </Tooltip>
            <div>
              {/* <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{(proposal.voteByChoice[choice]*100/proposal.scores_total).toFixed(2)}%</dd> */}
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {formatNumber(score)}
              </dd>
              {displayVotesByGroup && (
                <span className="text-sm font-medium text-gray-500">
                  {votesGroupByChoice?.[proposal?.choices[index]] ?? 0} votes
                </span>
              )}
              {!displayVotesByGroup && (
                <span className="text-sm font-medium text-gray-500">
                  {((score * 100) / proposal.scores_total).toFixed()}%
                </span>
              )}
            </div>
          </div>
        ))}
    </dl>
  );
}
