/* eslint-disable max-lines */
import { useAccount } from "wagmi";
import { useProposalsByID } from "@/utils/hooks/snapshot/Proposals";
import { SnapshotProposal, SnapshotVotedData } from "@/models/SnapshotTypes";
import { Proposal, ProposalsPacket } from "@nance/nance-sdk";
import ProposalRowSkeleton from "./card/ProposalRowSkeleton";
import RecommendAction from "./card/RecommendAction";
import SortableTableHeader from "./card/SortableTableHeader";
import {
  BooleanParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from "next-query-params";
import { useProposalsInfinite } from "@/utils/hooks/NanceHooks";
import { useRouter } from "next/router";
import LoadMoreButton from "./card/LoadMoreButton";
import getVotedIcon from "./card/VoteIcon";
import NewVoteButton from "@/components/Vote/NewVoteButton";
import VotesBar from "./card/VotesBar";
import ProposalRow from "./card/ProposalRow";
import { AnimatePresence } from "motion/react";

const SortOptionsArr = ["status", "title", "approval", "participants", "voted"];
const StatusValue: { [key: string]: number } = {
  Revoked: 0,
  Cancelled: 1,
  Approved: 2,
  Draft: 3,
  Implementation: 4,
  Finished: 5,
  Discussion: 6,
  "Temperature Check": 7,
  Voting: 8,
};
function getValueOfStatus(status: string) {
  return StatusValue[status] ?? -1;
}

/**
 * Merge the snapshot proposal vote results into proposals.voteResults
 */
function mergeSnapshotVotes(
  proposals: Proposal[] | undefined,
  snapshotProposalDict: { [id: string]: SnapshotProposal }
) {
  return proposals?.map((p) => {
    const snapshotProposal = snapshotProposalDict[p.voteURL!];
    if (snapshotProposal) {
      return {
        ...p,
        voteResults: {
          choices: snapshotProposal.choices,
          scores: snapshotProposal.scores,
          votes: snapshotProposal.votes,
        },
      };
    } else {
      return p;
    }
  });
}

function sortProposals(
  proposals: Proposal[],
  sortBy: string | null | undefined,
  sortDesc: boolean | null | undefined,
  keyword: string | null | undefined,
  snapshotProposalDict: { [id: string]: SnapshotProposal },
  votedData: { [id: string]: SnapshotVotedData } | undefined
) {
  if (!sortBy || !SortOptionsArr.includes(sortBy)) {
    proposals.sort(
      (a, b) => getValueOfStatus(b.status) - getValueOfStatus(a.status)
    );

    // fall back to default sorting
    // if no keyword
    if (!keyword) {
      proposals.sort(
        (a, b) => (b.governanceCycle ?? 0) - (a.governanceCycle ?? 0)
      );
    }
  }

  switch (sortBy) {
    case "status":
      proposals.sort(
        (a, b) => getValueOfStatus(b.status) - getValueOfStatus(a.status)
      );
      break;
    case "approval":
      const sumScores = (p: Proposal) => {
        return (p?.voteResults?.scores ?? []).reduce(
          (partialSum, a) => partialSum + a,
          0
        );
      };
      proposals.sort((a, b) => sumScores(b) - sumScores(a));
      break;
    case "participants":
      proposals.sort(
        (a, b) => (b.voteResults?.votes ?? 0) - (a.voteResults?.votes ?? 0)
      );
      break;
    case "voted":
      const votedWeightOf = (p: Proposal) => {
        const voted = votedData?.[p.voteURL!] !== undefined;
        const hasSnapshotVoting = snapshotProposalDict[p.voteURL!];

        if (hasSnapshotVoting) {
          if (voted) return 2;
          else return 1;
        } else {
          return 0;
        }
      };
      proposals.sort((a, b) => votedWeightOf(b) - votedWeightOf(a));
      break;
    case "title":
      proposals.sort((a, b) => {
        const nameA = a.title;
        const nameB = b.title;
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
      break;
    case "date":
      proposals.sort((a, b) => {
        const bD = b.createdTime || "";
        const aD = a.createdTime || "";
        return bD.localeCompare(aD);
      });
      break;
    default:
      proposals.sort();
      break;
  }

  if (!sortDesc) {
    proposals.reverse();
  }
}

function VoteActionOrLabel({
  snapshotSpace,
  votedData,
  snapshotProposal,
  refetch,
}: {
  snapshotSpace: string;
  votedData: SnapshotVotedData | undefined;
  snapshotProposal: SnapshotProposal | undefined;
  refetch: () => void;
}) {
  if (votedData || snapshotProposal?.state !== "active") {
    return (
      <div className="flex justify-center">
        {getVotedIcon(votedData?.choice)}
      </div>
    );
  } else {
    return (
      <NewVoteButton
        snapshotSpace={snapshotSpace}
        snapshotProposal={snapshotProposal}
        refetch={refetch}
        isSmall
      />
    );
  }
}

export default function ProposalCards({
  space,
  maxCycle,
  clearKeywordInput,
}: {
  space: string;
  maxCycle: number;
  clearKeywordInput: () => void;
}) {
  const { address } = useAccount();
  const router = useRouter();
  const [query] = useQueryParams({
    keyword: StringParam,
    limit: withDefault(NumberParam, 10),
    cycle: withDefault(StringParam, "All"),
    sortBy: withDefault(StringParam, ""),
    sortDesc: withDefault(BooleanParam, true),
  });
  const { keyword, cycle, limit } = query;

  const {
    data: proposalDataArray,
    isLoading: proposalsLoading,
    size,
    setSize,
  } = useProposalsInfinite({ space, cycle, keyword, limit }, router.isReady);

  // concat proposal responses
  const firstRes = proposalDataArray?.[0].data;
  let proposalsPacket: ProposalsPacket | undefined;
  if (firstRes) {
    proposalsPacket = {
      proposalInfo: firstRes.proposalInfo,
      proposals:
        proposalDataArray.map((data) => data?.data.proposals).flat() || [],
      hasMore: proposalDataArray[proposalDataArray.length - 1].data.hasMore,
    };
  }

  // for those proposals with no results cached by nance, we need to fetch them from snapshot
  const snapshotProposalIds: string[] =
    proposalsPacket?.proposals
      ?.filter((p) => p.voteURL)
      .map((p) => p.voteURL!) || [];
  const skipSnapshotProposalsQuery = snapshotProposalIds.length === 0;
  const {
    data,
    loading: snapshotLoading,
    error,
    refetch,
  } = useProposalsByID(
    snapshotProposalIds,
    address ?? "",
    skipSnapshotProposalsQuery
  );

  // it takes some time to enable votesQuery after proposalQuery succeed
  //   this should be consider as loading state.
  const willLoadSnapshotProposalsQuery =
    proposalsPacket !== undefined &&
    !skipSnapshotProposalsQuery &&
    data?.proposalsData === undefined;
  const isLoading =
    // if we have proposalDataArray, we are only loading more pages, no need to display loading state
    proposalDataArray === undefined &&
    (proposalsLoading || snapshotLoading || willLoadSnapshotProposalsQuery);

  // convert proposalsData to dict with proposal id as key
  const snapshotProposalDict: { [id: string]: SnapshotProposal } = {};
  data?.proposalsData?.forEach((p) => (snapshotProposalDict[p.id] = p));

  const mergedProposals = mergeSnapshotVotes(
    proposalsPacket?.proposals,
    snapshotProposalDict
  );

  // Filter out proposals in "Draft" stage unless the user is the author
  const filteredProposals = mergedProposals?.filter((proposal) => {
    return proposal.status !== "Draft" || proposal.authorAddress === address;
  });

  const votedData = data?.votedData;

  // sort proposals
  // FIXME this can only sort proposals in current page
  let sortedProposals = filteredProposals || [];
  sortProposals(
    sortedProposals,
    query.sortBy,
    query.sortDesc,
    query.keyword,
    snapshotProposalDict,
    votedData
  );

  if (!isLoading && sortedProposals.length === 0) {
    return (
      <RecommendAction
        maxCycle={maxCycle}
        clearKeywordInput={clearKeywordInput}
      />
    );
  }

  return (
    <div>
      <div className="mt-6 bg-white">
        <div className="rounded-lg ring-1 ring-gray-300 sm:mx-0">
          <table
            className="min-w-full divide-y divide-gray-300"
            id="proposals-table"
          >
            <thead id="proposals-table-head">
              <tr>
                <th
                  scope="col"
                  className="hidden py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 md:table-cell"
                >
                  <SortableTableHeader val="status" label="Status" />
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 md:table-cell"
                >
                  <SortableTableHeader val="title" label="Title" />
                </th>
                <th
                  scope="col"
                  className="table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900 md:hidden"
                >
                  <SortableTableHeader val="title" label="Proposals" />
                </th>
                <th
                  scope="col"
                  className="hidden py-3.5 text-left text-sm font-semibold text-gray-900 md:table-cell"
                >
                  <SortableTableHeader val="date" label="Date" />
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 md:table-cell"
                >
                  <SortableTableHeader val="approval" label="Approval" />
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 md:table-cell"
                >
                  <SortableTableHeader
                    val="participants"
                    label="Participants"
                  />
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 md:table-cell"
                >
                  <SortableTableHeader val="voted" label="Voted" />
                </th>
              </tr>
            </thead>
            <AnimatePresence>
              <tbody>
                {isLoading && (
                  <>
                    <ProposalRowSkeleton isFirst />
                    <ProposalRowSkeleton />
                    <ProposalRowSkeleton />
                  </>
                )}
                {!isLoading &&
                  sortedProposals.map((proposal, proposalIdx) => (
                    <ProposalRow
                      key={proposal.uuid}
                      proposal={proposal}
                      snapshotProposal={snapshotProposalDict[proposal.voteURL!]}
                      isFirst={proposalIdx === 0}
                      proposalIdPrefix={
                        proposalsPacket?.proposalInfo?.proposalIdPrefix || ""
                      }
                      votesBar={
                        <VotesBar
                          snapshotProposal={
                            snapshotProposalDict[proposal.voteURL!]
                          }
                          proposal={proposal}
                          threshold={
                            proposalsPacket?.proposalInfo
                              ?.minTokenPassingAmount ?? 0
                          }
                        />
                      }
                      voteActionOrStatus={
                        <VoteActionOrLabel
                          snapshotProposal={
                            snapshotProposalDict[proposal.voteURL!]
                          }
                          snapshotSpace={
                            proposalsPacket?.proposalInfo?.snapshotSpace || ""
                          }
                          votedData={votedData?.[proposal.voteURL!]}
                          refetch={refetch}
                        />
                      }
                    />
                  ))}
              </tbody>
            </AnimatePresence>
          </table>
        </div>
      </div>

      <div className="m-6 flex justify-center">
        <LoadMoreButton
          dataLength={sortedProposals.length}
          fetchMore={() => setSize(size + 1)}
          // 2 pages with 5 limit will have 6 proposals loaded at least
          // so we can safely assume that if the number of proposals loaded
          loading={(size - 1) * limit + 1 > sortedProposals.length}
          hasMore={proposalsPacket?.hasMore}
        />
      </div>
    </div>
  );
}
