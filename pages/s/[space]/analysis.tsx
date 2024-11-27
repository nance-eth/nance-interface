import { Footer, SiteNav } from "@/components/Site";
import SpaceHeader from "@/components/Space/sub/SpaceHeader";
import { SpaceContext } from "@/context/SpaceContext";
import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import { useProposals, useProposalsInfinite, useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { useProposalsWithFilter } from "@/utils/hooks/snapshot/Proposals";
import { Proposal } from "@nance/nance-sdk";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useContext, useMemo } from "react";
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
  ResponsiveContainer
} from "recharts";

export default function Analysis() {
  const params = useParams<{ space: string; proposal: string }>();
  const args = { space: params?.space };
  const space = args.space;
  const { data: spaceInfoData } = useSpaceInfo({ space }, !!params);
  const spaceInfo = spaceInfoData?.data;
  const all = Array.from({ length: spaceInfo?.currentCycle || 0 }, (_, i) => i ).join(",");

  const { data: proposalData } = useProposals({ space, cycle: all });
  const { data: snapshotData } = useProposalsWithFilter({ space: spaceInfo?.snapshotSpace, first: 1_000 });

  const voteData = useMemo(() => {
    if (!snapshotData?.proposalsData) return [];

    const allProposals = [
      ...snapshotData.proposalsData.map(d => ({...d, space: "jbdao.eth"})),
    ].sort((a, b) => a.created - b.created)
      .map(d => ({
        date: d.created,
        space: d.space,
        votes: d.votes,
        tokens: d.scores_total,
        title: d.title
      }));

    return allProposals;
  }, [snapshotData?.proposalsData]);

  const { pieData, totalProposals } = useMemo(() => {
    if (!proposalData) return { pieData: [], totalProposals: 0 };
    const statusCounts = {
      "Approved": 0,
      "Cancelled": 0,
    };

    proposalData.data.proposals.forEach((proposal: Proposal) => {
      const { status } = proposal as any;
      if (status === "Approved") {
        statusCounts["Approved"] += 1;
      } else if (status === "Cancelled") {
        statusCounts["Cancelled"] += 1;
      }
    });

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    return {
      pieData: Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%"
      })),
      totalProposals: total
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
        <div className="fixed z-50 bg-white p-4 border rounded shadow max-w-[300px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="italic text-xs">{format(new Date(data.date * 1000), 'MMMM d yyyy')}</p>
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
    "Approved": "#bae09d",
    "Cancelled": "#ed9595",
  } as const;

  return (
    <>
      <SpaceContext.Provider value={spaceInfo}>
        <SiteNav pageTitle="Governance Analysis" withProposalButton={false} withWallet />
        <div className="flex flex-col items-center">
          <SpaceHeader />
          <div className="flex flex-col lg:flex-row items-center min-h-[calc(100vh-300px)] w-full max-w-[1800px] px-4">
            <div className="flex flex-col items-center w-full lg:w-1/2">
              <h1 className="text-2xl font-bold mt-12 mb-8">Proposal Status Distribution</h1>
              <PieChart width={400} height={400}>
                <Pie
                  data={pieData}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
              <div className="text-lg">Total Proposals: {totalProposals}</div>
            </div>

            <div className="flex flex-col items-center w-full lg:w-1/2">
              <h1 className="text-2xl font-bold mt-12 mb-8">Proposal Voter Turnout</h1>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={voteData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={(str) => format(new Date(str * 1000), 'MMM yyyy')}
                      minTickGap={30}
                    />
                    <YAxis
                      width={80}
                      label={{ value: "Voters", angle: -90, position: "insideLeft", offset: 10 }}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.1)" }} />
                    <Bar dataKey="votes" fill="#8884d8" />
                    <Brush
                      dataKey="date"
                      height={30}
                      stroke="#8884d8"
                      tickFormatter={(str) => format(new Date(str * 1000), 'MMM yyyy')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </SpaceContext.Provider>
    </>
  );
}
