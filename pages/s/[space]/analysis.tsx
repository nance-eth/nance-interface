import { Footer, SiteNav } from "@/components/Site";
import SpaceHeader from "@/components/Space/sub/SpaceHeader";
import { SpaceContext } from "@/context/SpaceContext";
import { useProposals, useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { useProposalsWithFilter } from "@/utils/hooks/snapshot/Proposals";
import { Proposal } from "@nance/nance-sdk";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { TextStatisticsBar } from "@/components/Analysis/TextStatisticsBar";
import { StatusPieChart } from "@/components/Analysis/StatusPieChart";
import { TopAuthorTable } from "@/components/Analysis/TopAuthorTable";
import { VoterTurnoutChart } from "@/components/Analysis/VoterTurnoutChart";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import Custom404 from "pages/404";
import SnapshotSearch from "@/components/CreateSpace/sub/SnapshotSearch";
import { SnapshotBadge } from "@/components/common/SnapshotBadge";
import { TypePieChart } from "@/components/Analysis/TypePieChart";

export default function Analysis() {
  const [initialized, setInitialized] = useState(false);
  const [snapshotSearch, setSnapshotSearch] = useState("");
  const params = useParams<{ space: string; proposal: string }>();
  const args = { space: params?.space };
  const space = args.space;
  const snapshot = space === "snapshot"; // load a generic interface for spaces not in Nance
  const { data: spaceInfoData, isLoading: isSpaceInfoLoading } = useSpaceInfo(
    { space },
    !snapshot && !!params
  );

  const spaceInfo = spaceInfoData?.data;
  const all = Array.from(
    { length: spaceInfo?.currentCycle || 0 },
    (_, i) => i
  ).join(",");

  const { data: proposalData, isLoading: isProposalLoading } = useProposals({
    space,
    cycle: all,
  }, !!spaceInfo?.snapshotSpace);
  const { data: snapshotData, loading: isSnapshotLoading } =
    useProposalsWithFilter({ space: spaceInfo?.snapshotSpace || snapshotSearch, first: 1_000 });
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
      ...snapshotData.proposalsData.map((d) => (
        {
          ...d,
          space: spaceInfo?.snapshotSpace || snapshotSearch
        }
      ))
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
  }, [snapshotData?.proposalsData]);

  const { pieData, totalProposals, topAuthors, totalAuthors } = useMemo(() => {
    if (!snapshotData?.proposalsData)
      return { pieData: [], totalProposals: 0, topAuthors: [], totalAuthors: 0 };
    const statusCounts = {
      Approved: 0,
      Cancelled: 0,
      Unknown: 0,
    };

    const authorCounts: Record<string, number> = {};
    const authorApprovals: Record<string, { approved: number; total: number }> =
      {};

    if (snapshot) {
      snapshotData.proposalsData.forEach((proposal) => {
        const author = proposal.author || "unknown";
        authorCounts[author] = (authorCounts[author] || 0) + 1;

        if (!authorApprovals[author]) {
          authorApprovals[author] = { approved: 0, total: 0 };
        }
        authorApprovals[author].total += 1;

        const { type, scores, scores_total } = proposal as SnapshotProposal;
        if (type === "basic") {
          if (scores[0] / scores_total > 0.5) { // basic approval check
            statusCounts["Approved"] += 1;
            authorApprovals[author].approved++;
          } else {
            statusCounts["Cancelled"] += 1;
          }
        } else {
          statusCounts["Unknown"] += 1;
        }
      });
    } else { // we have Nance Proposal data
      proposalData?.data.proposals.forEach((proposal: Proposal) => {
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
      pieData: Object.entries(statusCounts)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%",
        })),
      totalProposals: total,
      topAuthors,
      totalAuthors,
    };
  }, [snapshotData?.proposalsData, proposalData?.data.proposals, snapshot]);

  // 404, is there a better way?
  useEffect(() => {
    setInitialized(true);
  }, []);

  if (initialized && !snapshot && !loading && !spaceInfo) {
    return <Custom404 />;
  }

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
            { spaceInfo?.name ? (
              <SpaceHeader />
            ): (
              <div className="flex flex-row items-center gap-6 mb-10">
                <SnapshotSearch setVal={setSnapshotSearch} showAddNanceButton={false} />
                {snapshotSearch && <SnapshotBadge space={snapshotSearch} />}
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
              <VoterTurnoutChart loading={loading} voteData={voteData} />
            </div>
          </div>
        </div>
        <Footer />
      </SpaceContext.Provider>
    </>
  );
}
