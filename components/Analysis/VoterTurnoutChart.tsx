import {
  Bar,
  BarChart,
  Brush,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { format } from "date-fns";
import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import PoweredByNance from "./PoweredByNance";
import { classNames } from "@/utils/functions/tailwind";
import { SimpleVoteData } from "./types";

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

export function VoterTurnoutChart({
  loading,
  voteData,
}: {
  loading: boolean;
  voteData: SimpleVoteData[]
}) {
  return (
    <div className="card bg-base-100 w-80 sm:w-96 grow">
      <div className="card-body">
        <h2 className="card-title">Proposal Voter Turnout</h2>
        <div className="absolute top-8 right-8 flex items-center">
          <PoweredByNance size={100} />
        </div>
      </div>
      <figure className={classNames("h-80", loading && "skeleton")}>
        { voteData?.length > 0 && (
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
                stroke="#CCE5FF"
                tickFormatter={(str) =>
                  format(new Date(str * 1000), "MMM yyyy")
                }
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </figure>
    </div>
  );
}
