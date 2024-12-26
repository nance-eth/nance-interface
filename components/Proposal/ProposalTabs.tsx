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
  const tabs = ["Content", "Activity", "Actions"];
  const [query, setQuery] = useQueryParams({
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    tab: withDefault(createEnumParam(tabs), "Content"),
  });

  const { commonProps } = useContext(ProposalContext);

  return (
    <>
      <div>
        <div className="grid grid-cols-1 sm:hidden">
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            value={query.tab}
            onChange={(v) => setQuery({ tab: v.target.value })}
            aria-label="Select a tab"
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
          >
            {tabs.map((tab) => (
              <option key={tab}>{tab}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              {tabs
                .filter((t) => t !== "Content")
                .map((tab) => (
                  <a
                    key={tab}
                    onClick={() => setQuery({ tab })}
                    aria-current={tab === query.tab ? "page" : undefined}
                    className={classNames(
                      tab === query.tab
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "whitespace-nowrap border-b-2 p-1 text-sm font-medium"
                    )}
                  >
                    {tab}
                  </a>
                ))}
            </nav>
          </div>
        </div>

        <div>
          <div
            className={classNames(
              "hidden mt-4 w-[90vw]",
              query.tab === "Content" && "max-lg:block"
            )}
          >
            <ProposalContent />
          </div>
          <div
            className={classNames(
              "mt-4 max-lg:w-[90vw]",
              query.tab === "Activity" && "block",
              query.tab !== "Activity" && "hidden"
            )}
          >
            {!snapshotProposal && (
              <>
                <p>No snapshot voting</p>
                <div className="mt-2 space-y-4">
                  <ColorBar
                    noTooltip={true}
                    greenScore={proposal?.temperatureCheckVotes?.[0] || 0}
                    redScore={proposal?.temperatureCheckVotes?.[1] || 0}
                    threshold={10}
                  />
                </div>
              </>
            )}

            {snapshotProposal && (
              <>
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

                <div className="hidden lg:block">
                  <ProposalVotes snapshotSpace={commonProps.snapshotSpace} />
                </div>
                <div className="block lg:hidden">
                  <ProposalVotes
                    snapshotSpace={commonProps.snapshotSpace}
                    limitedHeight={false}
                  />
                </div>
              </>
            )}
          </div>
          <div
            className={classNames(
              "mt-4 max-lg:w-[90vw] overflow-x-auto",
              query.tab === "Actions" && "block",
              query.tab !== "Actions" && "hidden"
            )}
          >
            {commonProps.status !== "Draft" && <ProposalMetadata />}
          </div>
        </div>
      </div>
    </>
  );
}
