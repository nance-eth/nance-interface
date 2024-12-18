import { Footer, SiteNav } from "@/components/Site";
import SpaceHeader from "@/components/Space/sub/SpaceHeader";
import { SpaceContext } from "@/context/SpaceContext";
import { useProposals, useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { useProposalsWithFilter } from "@/utils/hooks/snapshot/Proposals";
import { Proposal } from "@nance/nance-sdk";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { TextStatisticsBar } from "@/components/Analysis/TextStatisticsBar";
import { StatusPieChart } from "@/components/Analysis/StatusPieChart";
import { TopAuthorTable } from "@/components/Analysis/TopAuthorTable";
import { VoterTurnoutChart } from "@/components/Analysis/VoterTurnoutChart";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import SnapshotSearch from "@/components/CreateSpace/sub/SnapshotSearch";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SnapshotBadge } from "@/components/common/SnapshotBadge";
import { TypePieChart } from "@/components/Analysis/TypePieChart";
import { StringParam, useQueryParam, withDefault } from "next-query-params";

export default function Analysis() {
  const [showBanner, setShowBanner] = useState(true);
  const [selectedSnapshotSpace, setSelectedSnapshotSpace] = useQueryParam(
    "spaceId",
    withDefault(StringParam, "")
  );
  const params = useParams<{ space: string; proposal: string }>();
  const args = { space: params?.space };
  const space = args.space;
  const isGenericMode = space === "snapshot"; // load a generic interface for spaces not in Nance
  const { data: spaceInfoData, isLoading: isSpaceInfoLoading } = useSpaceInfo(
    { space },
    !isGenericMode && !!params
  );

  const spaceInfo = spaceInfoData?.data;
  const all = Array.from(
    { length: spaceInfo?.currentCycle || 0 },
    (_, i) => i
  ).join(",");

  const { data: proposalData, isLoading: isProposalLoading } = useProposals(
    {
      space,
      cycle: all,
    },
    !!spaceInfo?.snapshotSpace
  );
  const { data: snapshotData, loading: isSnapshotLoading } =
    useProposalsWithFilter({
      space: spaceInfo?.snapshotSpace || selectedSnapshotSpace,
      first: 1_000,
    });
  const loading = isProposalLoading || isSnapshotLoading || isSpaceInfoLoading;

  // block data if noSpaceSelected
  const noSpaceSelected = isGenericMode && !selectedSnapshotSpace;
  const nanceProposalData = noSpaceSelected
    ? undefined
    : proposalData?.data.proposals;
  const snapshotProposalData = noSpaceSelected
    ? undefined
    : snapshotData?.proposalsData;

  const {
    allProposals: voteData,
    maxVotesInfo,
    maxTokensInfo,
  } = useMemo(() => {
    if (!snapshotProposalData)
      return {
        allProposals: [],
        maxVotesInfo: undefined,
        maxTokensInfo: undefined,
      };

    const allProposals = [
      ...snapshotProposalData.map((d) => ({
        ...d,
        space: spaceInfo?.snapshotSpace || selectedSnapshotSpace,
      })),
    ].map((d) => ({
      date: d.created,
      space: d.space,
      votes: d.votes,
      tokens: d.scores_total,
      title: d.title,
      author: d.author,
      type: d.type,
    }));
    const maxVotesInfo = allProposals.sort((a, b) => b.votes - a.votes)[0];
    const maxTokensInfo = allProposals.sort((a, b) => b.tokens - a.tokens)[0];
    allProposals.sort((a, b) => a.date - b.date);

    return { allProposals, maxVotesInfo, maxTokensInfo };
  }, [snapshotProposalData]);

  const { pieData, totalProposals, topAuthors, totalAuthors } = useMemo(() => {
    if (!snapshotProposalData)
      return {
        pieData: [],
        totalProposals: 0,
        topAuthors: [],
        totalAuthors: 0,
      };
    const statusCounts = {
      Approved: 0,
      Cancelled: 0,
      Unknown: 0,
    };

    const authorCounts: Record<string, number> = {};
    const authorApprovals: Record<string, { approved: number; total: number }> =
      {};

    if (isGenericMode) {
      snapshotProposalData.forEach((proposal) => {
        const author = proposal.author || "unknown";
        authorCounts[author] = (authorCounts[author] || 0) + 1;

        if (!authorApprovals[author]) {
          authorApprovals[author] = { approved: 0, total: 0 };
        }
        authorApprovals[author].total += 1;

        const { type, scores, scores_total } = proposal as SnapshotProposal;
        if (type === "basic") {
          if (scores[0] / scores_total > 0.5) {
            // basic approval check
            statusCounts["Approved"] += 1;
            authorApprovals[author].approved++;
          } else {
            statusCounts["Cancelled"] += 1;
          }
        } else {
          statusCounts["Unknown"] += 1;
        }
      });
    } else {
      // we have Nance Proposal data
      nanceProposalData?.forEach((proposal: Proposal) => {
        const author = proposal.authorAddress || "unknown";
        authorCounts[author] = (authorCounts[author] || 0) + 1;

        if (!authorApprovals[author]) {
          authorApprovals[author] = { approved: 0, total: 0 };
        }
        authorApprovals[author].total += 1;

        const { status } = proposal as any;
        if (status === "Approved") {
          statusCounts["Approved"] += 1;
          authorApprovals[author].approved++;
        } else if (status === "Cancelled") {
          statusCounts["Cancelled"] += 1;
        }
      });
    }

    const total = Object.values(statusCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const topAuthors = Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([author, count]) => ({
        author,
        count,
        approvalRate: authorApprovals[author]
          ? ((authorApprovals[author].approved /
                authorApprovals[author].total) *
              100
          ).toFixed(1) + "%"
          : "0%",
      }))
      .filter((a) => a.author !== "unknown");
    const totalAuthors = Object.keys(authorCounts).length;

    return {
      pieData: Object.entries(statusCounts)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value,
          percentage:
            total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%",
        })),
      totalProposals: total,
      topAuthors,
      totalAuthors,
    };
  }, [snapshotProposalData, nanceProposalData, isGenericMode]);

  return (
    <>
      <SpaceContext.Provider value={spaceInfo}>
        <SiteNav
          pageTitle="Governance Analysis"
          withProposalButton={false}
          withWallet
        />

        {!spaceInfo?.name && showBanner && (
          <div className="relative isolate flex items-center gap-x-6 overflow-hidden px-6 py-2.5 sm:px-3.5 sm:before:flex-1 bg-gradient-to-r from-indigo-400 via-purple-200 to-pink-400">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href="https://juicebox.money/@nance-app"
                className="text-sm/6 text-gray-900"
              >
                Like this governance analysis?{" "}
                <span className="font-medium">Support us</span> on
                Juicebox!&nbsp;
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            <div className="flex flex-1 justify-end">
              <button
                type="button"
                className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
                onClick={() => setShowBanner(false)}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center ">
          <div className="w-full max-w-5xl mt-8">
            {spaceInfo?.name ? (
              <SpaceHeader />
            ) : (
              <div className="flex flex-row items-center gap-6 mb-10">
                <SnapshotSearch
                  val={selectedSnapshotSpace}
                  setVal={setSelectedSnapshotSpace}
                  showAddNanceButton={false}
                />
                {selectedSnapshotSpace && (
                  <SnapshotBadge space={selectedSnapshotSpace} />
                )}
              </div>
            )}
          </div>
          <div className="mb-4 overflow-x-scroll">
            <TextStatisticsBar
              totalProposals={totalProposals}
              voteData={voteData}
              totalAuthors={totalAuthors}
              maxVotesInfo={maxVotesInfo}
              maxTokensInfo={maxTokensInfo}
            />
          </div>
          <div className="max-w-5xl flex flex-wrap gap-6 w-full px-4">
            <TopAuthorTable loading={loading} topAuthors={topAuthors} />
            <TypePieChart loading={loading} pieData={voteData} />
            <StatusPieChart loading={loading} pieData={pieData} />
            <div className="max-w-5xl flex w-full">
              <VoterTurnoutChart
                loading={loading}
                voteData={voteData}
                spaceId={spaceInfo?.snapshotSpace || selectedSnapshotSpace}
              />
            </div>
          </div>
        </div>
        <Footer />
      </SpaceContext.Provider>
    </>
  );
}
