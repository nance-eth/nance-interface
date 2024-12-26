import { useContext } from "react";
import {
  ChatBubbleLeftEllipsisIcon,
  LinkIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { ProposalContext } from "../context/ProposalContext";
import { useProposalVersionList } from "@/utils/hooks/NanceHooks";
import { compareDesc, format, getUnixTime, toDate } from "date-fns";
import {
  NumberParam,
  createEnumParam,
  useQueryParams,
  withDefault,
} from "next-query-params";
import {
  VOTES_PER_PAGE,
  useProposalVotes,
} from "@/utils/hooks/snapshot/Proposals";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import {
  getColorOfChoice,
  processChoices,
} from "@/utils/functions/snapshotUtil";
import { formatNumber } from "@/utils/functions/NumberFormatter";
import NewVoteButton from "@/components/Vote/NewVoteButton";

export default function ProposalActivityFeeds() {
  const { proposalInfo, commonProps, isLoading } = useContext(ProposalContext);
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    filterBy: withDefault(createEnumParam(["for", "against", "abstain"]), ""),
  });

  const { data: verionsData } = useProposalVersionList({
    space: commonProps.space,
    uuid: commonProps.uuid,
  });
  const versions = verionsData?.data?.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  const {
    loading,
    data: votesData,
    error,
    refetch: refetchProposalVotes,
  } = useProposalVotes(
    proposalInfo,
    Math.max((query.page - 1) * VOTES_PER_PAGE, 0),
    query.sortBy as "created" | "vp",
    query.withField as "reason" | "app" | ""
  );
  const proposalType = proposalInfo?.type ?? "";
  const isSimpleVoting = ![
    "approval",
    "ranked-choice",
    "quadratic",
    "weighted",
  ].includes(proposalType);
  let votes = votesData?.votesData;
  if (query.filterBy === "for") {
    votes = votes.filter((v) => v.choice === "For");
  } else if (query.filterBy === "against") {
    votes = votes.filter((v) => v.choice === "Against");
  } else if (query.filterBy === "abstain") {
    votes = votes.filter((v) => v.choice === "Abstain");
  }

  const data = {
    versions: versions || [],
    snapshot: {
      // Snapshot voting started
      start: commonProps.voteStart,
      // Snapshot voting ended
      end: commonProps.voteEnd,
    },
    proposal: {
      create: commonProps.created,
    },
    votes,
  };
  const activity = [
    {
      id: "proposalCreate",
      type: "progress",
      label: "Proposal created",
      date: format(toDate(data.proposal.create * 1000), "MMM dd"),
      time: data.proposal.create,
    },
    ...data.versions.map((v) => {
      return {
        id: "proposalEdit" + v.hash,
        type: "progress",
        label: "Proposal edited",
        date: format(new Date(v.date), "MMM dd"),
        time: getUnixTime(new Date(v.date)),
        link: `/s/${commonProps.space}/${commonProps.uuid}/diff/${v.hash}`,
      };
    }),
    {
      id: "snapshotStart",
      type: "progress",
      label: "Voting started",
      date: format(toDate(data.snapshot.start * 1000), "MMM dd"),
      time: data.snapshot.start,
      link: `https://snapshot.org/#/${commonProps.snapshotSpace}/proposal/${commonProps.snapshotHash}`,
    },
    {
      id: "snapshotEnd",
      type: "progress",
      label: "Voting ended",
      date: format(toDate(data.snapshot.end * 1000), "MMM dd"),
      time: data.snapshot.end,
      link: `https://snapshot.org/#/${commonProps.snapshotSpace}/proposal/${commonProps.snapshotHash}`,
    },
    ...votes.map((v) => {
      return {
        id: v.id,
        type: "vote",
        address: v.voter,
        comment: v.reason,
        choice: processChoices(proposalType, v.choice),
        date: format(toDate(v.created * 1000), "MMM dd"),
        time: v.created,
        vp: v.vp,
      };
    }),
  ];
  activity.sort((a, b) => b.time - a.time);

  return (
    <div className="flow-root">
      <NewVoteButton
        snapshotSpace={commonProps.snapshotSpace}
        snapshotProposal={proposalInfo}
        refetch={() => {
          refetchProposalVotes();
        }}
      />

      <ul role="list" className="-mb-8">
        {activity.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id}>
            <div className="relative pb-2">
              {activityItemIdx !== activity.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-5 top-5 -ml-2 h-full w-0.5 bg-gray-200"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                {activityItem.type === "vote" ? (
                  <>
                    <div className="relative">
                      <img
                        alt=""
                        src={`https://cdn.stamp.fyi/avatar/${activityItem.address}?h=100&w=100`}
                        className="flex w-6 h-6 items-center justify-center rounded-full bg-gray-400"
                      />

                      {activityItem.comment && (
                        <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
                          <ChatBubbleLeftEllipsisIcon
                            aria-hidden="true"
                            className="w-3 h-3 text-gray-400"
                          />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm flex items-center gap-x-1">
                          <FormattedAddress
                            address={activityItem.address}
                            style="text-gray-900"
                            minified
                            copyable={false}
                          />
                          <span
                            className={getColorOfChoice(activityItem.choice)}
                          >
                            voted {isSimpleVoting && activityItem.choice} (
                            {formatNumber(activityItem.vp)})
                          </span>
                          <span className="text-gray-500">
                            ·&nbsp;{activityItem.date}
                          </span>
                        </div>
                      </div>
                      {!isSimpleVoting && (
                        <div className="mt-2 text-sm text-gray-700 break-words">
                          {activityItem.choice.map((choice, idx) => (
                            <p key={`${activityItem.address} - ${idx}`}>
                              {choice}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{activityItem.comment}</p>
                      </div>
                    </div>
                  </>
                ) : activityItem.type === "progress" ? (
                  <>
                    <div className="relative">
                      {activityItem.link ? (
                        <LinkIcon className="flex w-6 h-6 p-1 items-center justify-center rounded-full bg-gray-100 text-gray-500" />
                      ) : (
                        <TagIcon className="flex w-6 h-6 p-1 items-center justify-center rounded-full bg-gray-100 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm flex items-center gap-x-1">
                          {activityItem.link ? (
                            <a
                              className="text-gray-500 hover:underline"
                              href={activityItem.link}
                            >
                              {activityItem.label}
                            </a>
                          ) : (
                            <span className="text-gray-500">
                              {activityItem.label}
                            </span>
                          )}

                          <span className="text-gray-500">
                            ·&nbsp;{activityItem.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
