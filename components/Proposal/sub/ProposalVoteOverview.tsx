import { useContext } from "react";
import { ProposalContext } from "../context/ProposalContext";
import { classNames } from "@/utils/functions/tailwind";
import {
  NumberParam,
  createEnumParam,
  useQueryParams,
  withDefault,
} from "next-query-params";
import ColorBar from "@/components/common/ColorBar";
import { formatNumber } from "@/utils/functions/NumberFormatter";

export default function ProposalVoteOverview({
  temperatureCheckVotes,
}: {
  temperatureCheckVotes?: number[];
}) {
  const { proposalInfo, commonProps } = useContext(ProposalContext);
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    filterBy: withDefault(createEnumParam(["for", "against", "abstain"]), ""),
  });

  const proposalType = proposalInfo?.type ?? "";
  const threshold = commonProps?.minTokenPassingAmount ?? 0;

  const isSimpleVoting = ![
    "approval",
    "ranked-choice",
    "quadratic",
    "weighted",
  ].includes(proposalType);

  if (!proposalInfo) {
    return (
      <div>
        <>
          <div className="flex justify-between">
            <p
              className={classNames(
                "cursor-pointer text-sm text-green-500",
                query.filterBy === "for" ? "underline" : ""
              )}
              onClick={() => {
                if (query.filterBy === "for") setQuery({ filterBy: "" });
                else setQuery({ filterBy: "for" });
              }}
            >
              FOR {temperatureCheckVotes?.[0] || 0}
            </p>

            <p
              className={classNames(
                "cursor-pointer text-sm text-red-500",
                query.filterBy === "against" ? "underline" : ""
              )}
              onClick={() => {
                if (query.filterBy === "against") setQuery({ filterBy: "" });
                else setQuery({ filterBy: "against" });
              }}
            >
              AGAINST {temperatureCheckVotes?.[1] || 0}
            </p>
          </div>

          <div className="p-3 text-sm text-gray-500">
            <ColorBar
              greenScore={temperatureCheckVotes?.[0] || 0}
              redScore={temperatureCheckVotes?.[1] || 0}
              threshold={10}
              noTooltip
            />
          </div>
        </>

        <div className="flex justify-between">
          <p className="text-sm">QUORUM {10}</p>
          <p className="text-sm">VOTERS {temperatureCheckVotes?.length || 0}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {isSimpleVoting && (
        <>
          <div className="flex justify-between">
            <p
              className={classNames(
                "cursor-pointer text-sm text-green-500",
                query.filterBy === "for" ? "underline" : ""
              )}
              onClick={() => {
                if (query.filterBy === "for") setQuery({ filterBy: "" });
                else setQuery({ filterBy: "for" });
              }}
            >
              FOR {formatNumber(proposalInfo?.scores[0] || 0)}
            </p>

            <p
              className={classNames(
                "cursor-pointer text-sm text-gray-500",
                query.filterBy === "abstain" ? "underline" : ""
              )}
              onClick={() => {
                if (query.filterBy === "abstain") setQuery({ filterBy: "" });
                else setQuery({ filterBy: "abstain" });
              }}
            >
              ABSTAIN {formatNumber(proposalInfo?.scores[2] || 0)}
            </p>

            <p
              className={classNames(
                "cursor-pointer text-sm text-red-500",
                query.filterBy === "against" ? "underline" : ""
              )}
              onClick={() => {
                if (query.filterBy === "against") setQuery({ filterBy: "" });
                else setQuery({ filterBy: "against" });
              }}
            >
              AGAINST {formatNumber(proposalInfo?.scores[1] || 0)}
            </p>
          </div>

          <div className="p-3 text-sm text-gray-500">
            <ColorBar
              greenScore={proposalInfo?.scores[0] || 0}
              redScore={proposalInfo?.scores[1] || 0}
              blueScore={proposalInfo?.scores[2] || 0}
              threshold={threshold}
              noTooltip
            />
          </div>
        </>
      )}

      {!isSimpleVoting && (
        <>
          <div className="flex justify-between">
            <p className="text-sm text-green-500">
              VOTES {formatNumber(proposalInfo?.scores_total || 0)}
            </p>
          </div>

          <div className="p-3 text-sm text-gray-500">
            <ColorBar
              greenScore={proposalInfo?.scores_total || 0}
              redScore={0}
              threshold={threshold}
              noTooltip
            />
          </div>
        </>
      )}

      <div className="flex justify-between">
        <p className="text-sm">QUORUM {formatNumber(threshold)}</p>
        <p className="text-sm">
          VOTERS {formatNumber(proposalInfo?.votes || 0)}
        </p>
      </div>
    </div>
  );
}
