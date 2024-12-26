import { useContext } from "react";
import Image from "next/image";
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
import { discordUserAvatarUrlOf } from "@/utils/functions/discord";
import { useDiscordChannelMessages } from "@/utils/hooks/DiscordHooks";

type ActivityItem = ProgressActivity | VoteActivity | CommentActivity;

interface BaseActivity {
  id: string;
  date: string; // Formatted date, e.g., "MMM dd"
  time: number; // Unix timestamp
}

interface ProgressActivity extends BaseActivity {
  type: "progress";
  label: string;
  link?: string; // Optional, for edited proposals
}

interface VoteActivity extends BaseActivity {
  type: "vote";
  address: string; // Voter address
  comment?: string; // Optional comment by the voter
  choice: string | string[]; // Processed choice
  vp: number; // Voting power
}

interface CommentActivity extends BaseActivity {
  type: "comment";
  userId: string;
  avatar: string;
  username: string;
  comment: string;
}

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

  const { data: messages } = useDiscordChannelMessages(
    commonProps.discussion.split("/").pop(),
    50
  );

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
  const editActivity: ActivityItem[] = data.versions.map((v) => {
    return {
      id: "proposalEdit" + v.hash,
      type: "progress",
      label: "Proposal edited",
      date: format(new Date(v.date), "MMM dd"),
      time: getUnixTime(new Date(v.date)),
      link: `/s/${commonProps.space}/${commonProps.uuid}/diff/${v.hash}`,
    };
  });
  const voteActivity: ActivityItem[] = votes.map((v) => {
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
  });
  const messageActivity: ActivityItem[] =
    messages
      // dont display messages from nance-bot
      ?.filter((v) => v.author.id !== "1093511877813870592")
      .map((v) => {
        let comment = v.content;
        if (v.mentions) {
          v.mentions.forEach((u) => {
            comment = comment.replaceAll(`<@${u.id}>`, `@${u.username}`);
          });
        }

        return {
          id: v.id,
          type: "comment",
          userId: v.author.id,
          avatar: v.author.avatar,
          username: v.author.username,
          comment,
          date: format(new Date(v.timestamp), "MMM dd"),
          time: getUnixTime(new Date(v.timestamp)),
        };
      }) || [];
  const progressActivity: ActivityItem[] = [
    {
      id: "proposalCreate",
      type: "progress",
      label: "Proposal created",
      date: format(toDate(data.proposal.create * 1000), "MMM dd"),
      time: data.proposal.create,
    },
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
  ];
  const activity: ActivityItem[] = [
    ...editActivity,
    ...voteActivity,
    ...progressActivity,
    ...messageActivity,
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
                      <Image
                        alt=""
                        width={100}
                        height={100}
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
                        <div className="text-sm flex items-center gap-x-1 flex-wrap">
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
                          {(activityItem.choice as string[]).map(
                            (choice, idx) => (
                              <p key={`${activityItem.address} - ${idx}`}>
                                {choice}
                              </p>
                            )
                          )}
                        </div>
                      )}
                      <div className="mt-2 text-sm text-gray-700 break-words">
                        <p>{activityItem.comment}</p>
                      </div>
                    </div>
                  </>
                ) : activityItem.type === "comment" ? (
                  <>
                    <div className="relative">
                      <Image
                        alt=""
                        width={100}
                        height={100}
                        src={discordUserAvatarUrlOf(
                          activityItem.userId,
                          activityItem.avatar
                        )}
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
                        <div className="text-sm flex items-center gap-x-1 flex-wrap">
                          <span>{activityItem.username}</span>
                          <span className="text-gray-500">commented</span>
                          <span className="text-gray-500">
                            ·&nbsp;{activityItem.date}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700 break-words">
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
