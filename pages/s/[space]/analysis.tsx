import { Footer, SiteNav } from "@/components/Site";
import SpaceHeader from "@/components/Space/sub/SpaceHeader";
import { SpaceContext } from "@/context/SpaceContext";
import { useProposals, useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { useProposalsWithFilter } from "@/utils/hooks/snapshot/Proposals";
import { Proposal } from "@nance/nance-sdk";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { TextStatisticsBar } from "@/components/Analysis/TextStatisticsBar";
import { StatusPieChart } from "@/components/Analysis/StatusPieChart";
import { TopAuthorTable } from "@/components/Analysis/TopAuthorTable";
import { VoterTurnoutChart } from "@/components/Analysis/VoterTurnoutChart";

export default function Analysis() {
  const params = useParams<{ space: string; proposal: string }>();
  const args = { space: params?.space };
  const space = args.space;
  const { data: spaceInfoData, isLoading: isSpaceInfoLoading } = useSpaceInfo(
    { space },
    !!params
  );
  const spaceInfo = spaceInfoData?.data;
  const all = Array.from(
    { length: spaceInfo?.currentCycle || 0 },
    (_, i) => i
  ).join(",");

  const { data: proposalData, isLoading: isProposalLoading } = useProposals({
    space,
    cycle: all,
  });
  const { data: snapshotData, loading: isSnapshotLoading } =
    useProposalsWithFilter({ space: spaceInfo?.snapshotSpace, first: 1_000 });
  const loading = isProposalLoading || isSnapshotLoading || isSpaceInfoLoading;
  const {
    allProposals: voteData,
    maxVotesInfo,
    maxTokensInfo,
  } = useMemo(() => {
    if (!snapshotData?.proposalsData)
      return {
        allProposals: [],
        maxVotesInfo: undefined,
        maxTokensInfo: undefined,
      };

    const allProposals = [
      ...snapshotData.proposalsData.map((d) => ({ ...d, space: "jbdao.eth" })),
    ].map((d) => ({
      date: d.created,
      space: d.space,
      votes: d.votes,
      tokens: d.scores_total,
      title: d.title,
      author: d.author,
    }));
    const maxVotesInfo = allProposals.sort((a, b) => b.votes - a.votes)[0];
    const maxTokensInfo = allProposals.sort((a, b) => b.tokens - a.tokens)[0];
    allProposals.sort((a, b) => a.date - b.date);

    return { allProposals, maxVotesInfo, maxTokensInfo };
  }, [snapshotData?.proposalsData]);

  const { pieData, totalProposals, topAuthors, totalAuthors } = useMemo(() => {
    if (!proposalData)
      return { pieData: [], totalProposals: 0, topAuthors: [] };
    const statusCounts = {
      Approved: 0,
      Cancelled: 0,
    };

    const authorCounts: Record<string, number> = {};
    const authorApprovals: Record<string, { approved: number; total: number }> =
      {};

    proposalData.data.proposals.forEach((proposal: Proposal) => {
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

    const total = Object.values(statusCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const topAuthors = Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Get top 5 authors
      .map(([author, count]) => ({
        author,
        count,
        approvalRate: authorApprovals[author]
          ? (
            (authorApprovals[author].approved /
                authorApprovals[author].total) *
              100
          ).toFixed(1) + "%"
          : "0%",
      }))
      .filter((a) => a.author !== "unknown");
    const totalAuthors = Object.keys(authorCounts).length;

    return {
      pieData: Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%",
      })),
      totalProposals: total,
      topAuthors,
      totalAuthors,
    };
  }, [proposalData]);

  return (
    <>
      <SpaceContext.Provider value={spaceInfo}>
        <SiteNav
          pageTitle="Governance Analysis"
          withProposalButton={false}
          withWallet
        />
        <div className="flex flex-col items-center ">
          <div className="w-full max-w-5xl mt-8">
            <SpaceHeader />
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
            <StatusPieChart loading={loading} pieData={pieData} />
            <TopAuthorTable loading={loading} topAuthors={topAuthors} />
            <VoterTurnoutChart loading={loading} voteData={voteData} />
          </div>
        </div>
        <Footer />
      </SpaceContext.Provider>
    </>
  );
}
