import {
  useQueryParams,
  withDefault,
  createEnumParam,
} from "next-query-params";
import { useContext } from "react";
import ColorBar from "@/components/common/ColorBar";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import type { Proposal } from "@nance/nance-sdk";
import ProposalVotes from "./ProposalVotes";
import { ProposalContext } from "./context/ProposalContext";
import { classNames } from "@/utils/functions/tailwind";
import ProposalContent from "./ProposalContent";
import ProposalMetadata from "./sub/ProposalMetadata";

export default function ProposalTabs({
  proposal,
  snapshotProposal,
}: {
  proposal: Proposal | undefined;
  snapshotProposal: SnapshotProposal | undefined;
}) {
  const [query, setQuery] = useQueryParams({
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    tab: withDefault(
      createEnumParam(["activity", "actions", "content"]),
      "content"
    ),
  });

  const { commonProps } = useContext(ProposalContext);

  return (
    <div role="tablist" className="tabs tabs-bordered font-medium">
      <a
        role="tab"
        className={classNames(
          "tab lg:hidden",
          query.tab === "content" && "max-lg:first:tab-active"
        )}
        onClick={() => setQuery({ tab: "content" })}
      >
        Content
      </a>
      <div role="tabpanel" className="tab-content lg:hidden mt-4 w-[90vw]">
        <ProposalContent />
      </div>

      <a
        role="tab"
        className={classNames(
          "tab",
          query.tab === "content" && "lg:tab-active",
          query.tab === "activity" && "tab-active"
        )}
        onClick={() => setQuery({ tab: "activity" })}
      >
        Activity
      </a>
      <div role="tabpanel" className="tab-content mt-4">
        <button
          onClick={() => {
            if (query.sortBy === "time") {
              setQuery({ sortBy: "vp" });
            } else {
              setQuery({ sortBy: "time" });
            }
          }}
          className="text-lg font-medium"
        >
          <span className="ml-2 text-center text-xs text-gray-300">
            sort by {query.sortBy === "vp" ? "voting power" : "time"}
          </span>
        </button>

        {!snapshotProposal && (
          <div className="mt-2 space-y-4">
            <ColorBar
              noTooltip={true}
              greenScore={proposal?.temperatureCheckVotes?.[0] || 0}
              redScore={proposal?.temperatureCheckVotes?.[1] || 0}
              threshold={10}
            />
          </div>
        )}

        {snapshotProposal && (
          <ProposalVotes snapshotSpace={commonProps.snapshotSpace} expand />
        )}
      </div>

      <a
        role="tab"
        className={classNames("tab", query.tab === "actions" && "tab-active")}
        onClick={() => setQuery({ tab: "actions" })}
      >
        Actions
      </a>
      <div role="tabpanel" className="tab-content mt-4">
        {commonProps.status !== "Draft" && <ProposalMetadata />}
      </div>
    </div>
  );
}
