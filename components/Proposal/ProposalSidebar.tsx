import {
  useQueryParams,
  withDefault,
  NumberParam,
  createEnumParam,
} from "next-query-params";
import { useContext, useState } from "react";
import ColorBar from "@/components/common/ColorBar";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import type { Proposal } from "@nance/nance-sdk";
import { useRouter } from "next/router";
import ProposalVotes from "./ProposalVotes";
import { ProposalContext } from "./context/ProposalContext";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

export default function ProposalSidebar({
  proposal,
  snapshotProposal,
}: {
  proposal: Proposal | undefined;
  snapshotProposal: SnapshotProposal | undefined;
}) {
  const router = useRouter();
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    filterBy: withDefault(createEnumParam(["for", "against"]), ""),
  });
  const [shouldExpand, setShouldExpand] = useState(false);

  const { commonProps } = useContext(ProposalContext);

  function Common({ isLgScreen = false }: { isLgScreen?: boolean }) {
    const shouldDisplay = isLgScreen || shouldExpand;

    return (
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
          Votes
          {shouldDisplay && (
            <span className="ml-2 text-center text-xs text-gray-300">
              sort by {query.sortBy === "vp" ? "voting power" : "time"}
            </span>
          )}
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
          <ProposalVotes
            snapshotSpace={commonProps.snapshotSpace}
            expand={shouldDisplay}
          />
        )}
      </>
    );
  }

  const mobileBarStyle = shouldExpand
    ? {
      maxHeight: "calc(100vh - 1rem)",
      height: "calc(100vh - 10rem)",
      width: "calc(100vw - 2rem)",
    }
    : {
      maxHeight: "calc(100vh - 1rem)",
      //height: "calc(100vh - 10rem)",
      width: "calc(100vw - 2rem)",
    };

  return (
    <>
      <div
        className="hidden lg:block sticky lg:mt-5 bottom-6 top-6 bg-white px-4 py-5 opacity-100 shadow sm:rounded-lg sm:px-6"
        style={{
          maxHeight: "calc(100vh - 1rem)",
        }}
      >
        <Common isLgScreen />
      </div>

      <div
        className="fixed lg:hidden mx-4 bottom-1 max-w-3xl bg-white px-4 py-5 opacity-100 shadow rounded-lg"
        style={mobileBarStyle}
      >
        <div
          className="absolute p-2 -top-5 rounded-full bg-white shadow"
          style={{
            left: "calc(50% - 1rem)",
          }}
          onClick={() => setShouldExpand(!shouldExpand)}
        >
          <ChevronUpDownIcon className="w-5 h-5" />
        </div>
        <Common />
      </div>
    </>
  );
}
