import { format } from "date-fns";
import { formatNumber, numToPrettyString } from "@/utils/functions/NumberFormatter";
import { SimpleVoteData } from "./types";

export function TextStatisticsBar({
  totalProposals,
  voteData,
  totalAuthors,
  maxVotesInfo,
  maxTokensInfo,
}: {
  totalProposals: number;
  voteData: SimpleVoteData[];
  totalAuthors?: number;
  maxVotesInfo?: SimpleVoteData;
  maxTokensInfo?: SimpleVoteData;
}) {
  return (
    <div className="stats w-[90vw] mx-4 max-w-5xl">
      <div className="stat">
        <div className="stat-title">Total Proposals</div>
        <div className="stat-value">{totalProposals}</div>
        {voteData[0]?.date && (
          <div className="stat-desc">
            {format(new Date((voteData[0]?.date || 1) * 1000), "y MMM")} -{" "}
            {format(new Date(), "y MMM")}
          </div>
        )}
      </div>

      <div className="stat">
        <div className="stat-title">Total Authors</div>
        <div className="stat-value">{totalAuthors}</div>
        {totalAuthors && totalProposals > 0 && (
          <div className="stat-desc">
            {(totalProposals / (totalAuthors ?? 1)).toFixed(2)} proposed avg
          </div>
        )}
      </div>

      {maxVotesInfo && (
        <div className="stat">
          <div className="stat-title">Most Voters</div>
          <div className="stat-value">{numToPrettyString(maxVotesInfo?.votes)}</div>
          <div className="stat-desc">{maxVotesInfo?.title}</div>
        </div>
      )}

      {maxTokensInfo && (
        <div className="stat">
          <div className="stat-title">Highest Voting Power</div>
          <div className="stat-value">
            {formatNumber(maxTokensInfo?.tokens)}
          </div>
          <div className="stat-desc">{maxTokensInfo?.title}</div>
        </div>
      )}
    </div>
  );
}
