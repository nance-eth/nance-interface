/** eslint-disable max-lines */
import { Footer, SiteNav } from "@/components/Site";
import SpaceHeader from "@/components/Space/sub/SpaceHeader";
import { SpaceContext } from "@/context/SpaceContext";
import {
  formatNumber,
  numToPrettyString,
} from "@/utils/functions/NumberFormatter";
import { useProposals, useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { useProposalsWithFilter } from "@/utils/hooks/snapshot/Proposals";
import { Proposal } from "@nance/nance-sdk";
import { format } from "date-fns";
import { Spinner } from "flowbite-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import {
  Tooltip,
  Pie,
  PieChart,
  Cell,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Brush,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import PoweredByNance from "@/components/Analysis/PoweredByNance";
import { classNames } from "@/utils/functions/tailwind";

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

  const CustomPieTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded shadow max-w-[300px]">
          <p className="italic text-xs">{data.name}</p>
          <p>
            {data.value}{" "}
            <span className="text-xs text-gray-500 font-bold">PROPOSALS</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 lg:static lg:transform-none z-50 bg-white p-4 border rounded shadow max-w-[300px]">
          <p className="italic text-xs">
            {format(new Date(data.date * 1000), "MMMM d yyyy")}
          </p>
          <p className="text-sm font-semibold break-words">{data.title}</p>
          <p>
            {data.votes}{" "}
            <span className="text-xs text-gray-500 font-bold">VOTERS</span>
          </p>
          <p>
            {numToPrettyString(data.tokens)}{" "}
            <span className="text-xs text-gray-500 font-bold">$JBX</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    name,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <text
          x={x}
          y={y - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight={"bold"}
        >
          {name}
        </text>
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
        >
          {value} ({(percent * 100).toFixed(1)}%)
        </text>
      </g>
    );
  };

  const STATUS_COLORS = {
    Approved: "#bae09d",
    Cancelled: "#ed9595",
  } as const;

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
            <div className="stats w-[90vw] mx-4 max-w-5xl">
              <div className="stat">
                <div className="stat-title">Total Proposals</div>
                <div className="stat-value">{totalProposals}</div>
                <div className="stat-desc">
                  {format(new Date((voteData[0]?.date || 1) * 1000), "y MMM")} -{" "}
                  {format(new Date(), "y MMM")}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">Total Authors</div>
                <div className="stat-value">{totalAuthors}</div>
                <div className="stat-desc">
                  {totalProposals / (totalAuthors ?? 1)} proposed avg
                </div>
              </div>

              {maxVotesInfo && (
                <div className="stat">
                  <div className="stat-title">Most Voters</div>
                  <div className="stat-value">{maxVotesInfo?.votes}</div>
                  <div className="stat-desc">{maxVotesInfo?.title}</div>
                </div>
              )}

              {maxTokensInfo && (
                <div className="stat">
                  <div className="stat-title">Highest Voting Power</div>
                  <div className="stat-value">
                    {formatNumber(maxTokensInfo?.tokens)}
                  </div>
                  <div className="stat-desc">{maxTokensInfo?.title}</div>
                </div>
              )}
            </div>
          </div>
          <div className="max-w-5xl flex flex-wrap gap-6 w-full px-4">
            <div className="card bg-base-100 w-80 sm:w-96 grow">
              <div className="card-body">
                <h2 className="card-title">Proposal Status Distribution</h2>
                <div className="absolute top-6 right-6 flex items-center">
                  <PoweredByNance />
                </div>
              </div>
              <figure className={classNames("h-80", loading && "skeleton")}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      outerRadius={"80%"}
                      fill="#8884d8"
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[
                              entry.name as keyof typeof STATUS_COLORS
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </figure>
            </div>
            <div className="card bg-base-100 w-80 sm:w-96 grow">
              <div className="card-body">
                <h2 className="card-title">Top Authors</h2>
                <div className="absolute top-6 right-6 flex items-center">
                  <PoweredByNance />
                </div>
              </div>
              <figure className={classNames("h-80", loading && "skeleton")}>
                <div className="overflow-x-auto">
                  <table className="table">
                    {/* head */}
                    <thead>
                      <tr>
                        <th>Author</th>
                        <th>Count</th>
                        <th>Approval Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topAuthors.map((author, index) => (
                        <tr key={index}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="mask mask-squircle h-8 w-8">
                                  <Image
                                    src={`https://cdn.stamp.fyi/avatar/${author.author}`}
                                    alt=""
                                    width={500}
                                    height={500}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">
                                  <FormattedAddress
                                    address={author.author}
                                    copyable={false}
                                    link
                                    style="mt-1"
                                    minified
                                  />
                                </div>
                                <div className="text-sm opacity-50"></div>
                              </div>
                            </div>
                          </td>
                          <td>{author.count}</td>
                          <td>{author.approvalRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </figure>
            </div>
            <div className="card bg-base-100 w-80 sm:w-96 grow">
              <div className="card-body">
                <h2 className="card-title">Proposal Voter Turnout</h2>
                <div className="absolute top-8 right-8 flex items-center">
                  <PoweredByNance size={100} />
                </div>
              </div>
              <figure className={classNames("h-80", loading && "skeleton")}>
                <ResponsiveContainer>
                  <BarChart data={voteData} width={400} height={400}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(str) =>
                        format(new Date(str * 1000), "MMM yyyy")
                      }
                      minTickGap={30}
                    />
                    <YAxis
                      width={80}
                      label={{
                        value: "Voters",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                      }}
                    />
                    <Tooltip
                      content={<CustomBarTooltip />}
                      cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                    />
                    <Bar
                      dataKey="votes"
                      fill="rgba(136, 132, 216, 0.7)"
                      isAnimationActive={false}
                    />
                    <Brush
                      dataKey="date"
                      height={30}
                      stroke="rgba(136, 132, 216, 0.7)"
                      tickFormatter={(str) =>
                        format(new Date(str * 1000), "MMM yyyy")
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </figure>
            </div>
          </div>
        </div>
        <Footer />
      </SpaceContext.Provider>
    </>
  );
}
