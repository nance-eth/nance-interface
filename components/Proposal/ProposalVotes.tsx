import {
  useQueryParams,
  withDefault,
  NumberParam,
  createEnumParam,
} from "next-query-params";
import { useContext } from "react";
import {
  useProposalVotes,
  VOTES_PER_PAGE,
} from "@/utils/hooks/snapshot/Proposals";
import { formatNumber } from "@/utils/functions/NumberFormatter";
import { processChoices } from "@/utils/functions/snapshotUtil";
import { classNames } from "@/utils/functions/tailwind";
import NewVoteButton from "@/components/Vote/NewVoteButton";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { ProposalContext } from "./context/ProposalContext";

const getColorOfChoice = (choice: string) => {
  if (choice == "For") {
    return "text-green-500";
  } else if (choice == "Against") {
    return "text-red-500";
  } else if (choice == "Abstain") {
    return "text-gray-500";
  } else {
    return "";
  }
};

export default function ProposalVotes({
  snapshotSpace,
  limitedHeight = true,
}: {
  snapshotSpace: string;
  limitedHeight?: boolean;
}) {
  const { proposalInfo, commonProps, isLoading } = useContext(ProposalContext);
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    filterBy: withDefault(createEnumParam(["for", "against", "abstain"]), ""),
  });

  const {
    loading,
    data,
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

  let votes = data?.votesData;
  if (query.filterBy === "for") {
    votes = votes.filter((v) => v.choice === "For");
  } else if (query.filterBy === "against") {
    votes = votes.filter((v) => v.choice === "Against");
  } else if (query.filterBy === "abstain") {
    votes = votes.filter((v) => v.choice === "Abstain");
  }

  const threshold = commonProps?.minTokenPassingAmount ?? 0;

  return (
    <div
      className="flex flex-col"
      style={
        limitedHeight
          ? {
              maxHeight: "calc(100vh - 20rem)",
            }
          : undefined
      }
    >
      <NewVoteButton
        snapshotSpace={snapshotSpace}
        snapshotProposal={proposalInfo}
        refetch={() => {
          refetchProposalVotes();
        }}
      />

      <div className="overflow-y-scroll pt-2">
        <ul
          role="list"
          className={classNames(
            "space-y-2 pt-2",
            (isLoading || loading) && "skeleton h-[50vh] w-full"
          )}
        >
          {votes?.map((vote) => (
            <li key={vote.id}>
              <div className="flex flex-col">
                {isSimpleVoting && (
                  <div className="flex justify-between text-sm">
                    <div className="flex">
                      <div className="inline">
                        <FormattedAddress
                          address={vote.voter}
                          style="text-gray-900"
                          minified
                          copyable={false}
                        />
                      </div>
                      &nbsp;
                      <span
                        className={classNames(
                          getColorOfChoice(
                            processChoices(
                              proposalInfo?.type,
                              vote.choice
                            ) as string
                          ),
                          ""
                        )}
                      >
                        voted{" "}
                        {
                          processChoices(
                            proposalInfo?.type,
                            vote.choice
                          ) as string
                        }
                      </span>
                    </div>

                    <div>
                      {`${formatNumber(vote.vp)} (${(
                        (vote.vp * 100) /
                        (proposalInfo?.scores_total ?? 1)
                      ).toFixed()}%)`}
                    </div>
                  </div>
                )}

                {!isSimpleVoting && (
                  <div className="flex flex-col text-sm">
                    <div>
                      <FormattedAddress
                        address={vote.voter}
                        style="text-gray-900"
                        minified
                        copyable={false}
                      />
                    </div>

                    <div className="text-xs font-semibold text-slate-700">
                      {`${formatNumber(vote.vp)} (${(
                        (vote.vp * 100) /
                        (proposalInfo?.scores_total ?? 1)
                      ).toFixed()}%)`}{" "}
                      total
                    </div>

                    <div className="py-2 text-sm text-gray-600">
                      {(
                        processChoices(
                          proposalInfo?.type,
                          vote.choice
                        ) as string[]
                      ).map((choice, idx) => (
                        <p key={`${vote.id} - ${idx}`}>{choice}</p>
                      ))}
                    </div>
                  </div>
                )}

                {vote.reason && (
                  <div className="ml-1 flex flex-row">
                    <div className="text-lg">↳</div>
                    <div className="text-xs text-gray-600 ml-1 w-3/4 mt-1 border border-dashed border-gray-300 bg-gray-100 px-2 py-1 rounded-lg">
                      {vote.reason}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
