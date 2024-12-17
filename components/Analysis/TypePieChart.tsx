import { classNames } from "@/utils/functions/tailwind";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import PoweredByNance from "./PoweredByNance";
import { SimpleVoteData } from "./types";
import { useMemo } from "react";
import { capitalize } from "./utils";

const TYPE_COLORS = {
  "basic": "#10B981",
  "single-choice": "#3B82F6",
  "approval": "#8B5CF6",
  "ranked-choice": "#F59E0B",
  "weighted": "#EF4444",
  "quadratic": "#6B7280"
} as const;

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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Don't show label if percentage is less than 5%
  if (percent < 0.05) return null;

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
        {capitalize(name)}
      </text>
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
      >
        {value} ({(percent * 100).toFixed(1)}%)
      </text>
    </g>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border rounded shadow max-w-[300px]">
        <p className="italic text-xs">{capitalize(data.name)}</p>
        <p>
          {data.value}{" "}
          <span className="text-xs text-gray-500 font-bold">PROPOSALS</span>
        </p>
      </div>
    );
  }
  return null;
};

export function TypePieChart({
  loading,
  pieData,
}: {
  loading: boolean;
  pieData: SimpleVoteData[]
}) {
  const processedData = useMemo(() => {
    const counts: {[key: string]: number} = {};
    pieData.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, value]) => ({
        type,
        name: type,
        value
      }))
      .sort((a, b) => b.value - a.value);
  }, [pieData]);

  return (
    <div className="card bg-base-100 w-80 sm:w-96 grow pb-4">
      {/* Title */}
      <div className="card-body">
        <h2 className="card-title">Proposal Vote Type Distribution</h2>
        <div className="absolute top-6 right-6 flex items-center">
          <PoweredByNance />
        </div>
      </div>
      {/* Figure */}
      <figure className={classNames("h-80", loading && "skeleton")}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={processedData}
              outerRadius={"90%"}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
              isAnimationActive={false}
              fillOpacity={0.7}
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    TYPE_COLORS[
                    entry.type as keyof typeof TYPE_COLORS
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
  );
}
