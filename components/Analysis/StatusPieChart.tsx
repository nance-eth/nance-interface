import { classNames } from "@/utils/functions/tailwind";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import PoweredByNance from "./PoweredByNance";

type PieData = {
  name: string;
  value: number;
  percentage: string;
}

const STATUS_COLORS = {
  Approved: "#bae09d",
  Cancelled: "#ed9595",
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

const CustomPieTooltip = ({ active, payload }: any) => {
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

export function StatusPieChart({
  loading,
  pieData,
}: {
  loading: boolean;
  pieData: PieData[]
}) {
  return (
    <div className="card bg-base-100 w-80 sm:w-96 grow">
      {/* Title */}
      <div className="card-body">
        <h2 className="card-title">Proposal Status Distribution</h2>
        <div className="absolute top-6 right-6 flex items-center">
          <PoweredByNance />
        </div>
      </div>
      {/* Figure */}
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
  );
}
