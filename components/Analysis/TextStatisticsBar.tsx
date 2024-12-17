import { format, differenceInWeeks } from "date-fns";
import { formatNumber, numToPrettyString } from "@/utils/functions/NumberFormatter";
import { SimpleVoteData } from "./types";

const calculateAvg = (totalProposals: number, totalAuthors?: number) => {
  return numToPrettyString(totalProposals / (totalAuthors ?? 1), 2);
};

const calculateProposalsPerWeek = (totalProposals: number, startDate: number) => {
  const weeks = differenceInWeeks(new Date(), new Date(startDate * 1000)) || 1;
  return numToPrettyString(totalProposals / weeks, 2);
};

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
          <div className="stat-desc flex flex-col">
            <div>
              {format(new Date((voteData[0]?.date || 1) * 1000), "y MMM")} -{" "}
              {format(new Date(), "y MMM")}
            </div>
            <div>
              {calculateProposalsPerWeek(totalProposals, voteData[0]?.date)} per week
            </div>
          </div>
        )}
      </div>

      <div className="stat">
        <div className="stat-title">Total Authors</div>
        <div className="stat-value">{totalAuthors || 0}</div>
        {!!totalAuthors && totalProposals > 0 && (
          <div className="stat-desc">
            {calculateAvg(totalProposals, totalAuthors)} proposed avg
          </div>
        )}
      </div>

      {voteData[voteData.length - 1]?.date && (
        <div className="stat">
          <div className="stat-title">Latest Proposal</div>
          <div className="stat-value">
            {format(new Date(voteData[voteData.length - 1].date * 1000), "MMM d")}
          </div>
          <div className="stat-desc">
            {format(new Date(voteData[voteData.length - 1].date * 1000), "yyyy")}
          </div>
        </div>
      )}

      {maxVotesInfo && (
        <div className="stat">
          <div className="stat-title">Most Voters</div>
          <div className="stat-value">{numToPrettyString(maxVotesInfo?.votes, "auto")}</div>
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
