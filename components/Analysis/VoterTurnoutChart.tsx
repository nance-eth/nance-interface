import { useEffect, useRef } from "react";
import { Time, createChart, IChartApi } from "lightweight-charts";
import { format } from "date-fns";
import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import { classNames } from "@/utils/functions/tailwind";
import { SimpleVoteData } from "./types";
import useSnapshotSpaceInfo from "@/utils/hooks/snapshot/SpaceInfo";

export function VoterTurnoutChart({
  loading,
  voteData,
  spaceId,
}: {
  loading: boolean;
  voteData: SimpleVoteData[];
  spaceId: string;
}) {
  const { data: spaceInfo } = useSnapshotSpaceInfo(spaceId);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !voteData?.length) return;

    try {
      // Clean and sort data first
      const cleanedData = voteData
        .map((data) => ({
          ...data,
          time: new Date(data.date * 1000).getTime(),
        }))
        .sort((a, b) => a.time - b.time)
        .map((data, index, array) => {
          if (index > 0 && data.time === array[index - 1].time) {
            data.time += 1;
          }
          return data;
        });

      // Create chart instance
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          background: { color: "#ffffff" },
          textColor: "#333",
          attributionLogo: false,
        },
        watermark: {
          visible: true,
          fontSize: 24,
          horzAlign: "center",
          vertAlign: "center",
          color: "#D6DCDE",
          text: "powered by Nance",
        },
        leftPriceScale: {
          visible: true,
          borderColor: "#D6DCDE",
          scaleMargins: {
            top: 0.2,
            bottom: 0,
          },
          ticksVisible: true,
        },
        rightPriceScale: {
          visible: false,
          alignLabels: false,
        },
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            visible: false,
          },
        },
        crosshair: {
          horzLine: {
            visible: false,
            labelVisible: false,
          },
          vertLine: {
            labelVisible: false,
          },
        },
        timeScale: {
          borderColor: "#D6DCDE",
          tickMarkFormatter: (time: number) => {
            const date = new Date(time);
            return format(date, "MMM yyyy");
          },
          fixLeftEdge: true,
          fixRightEdge: true,
          allowBoldLabels: false,
          ticksVisible: true,
        },
      });

      const volumeSeries = chartRef.current.addHistogramSeries({
        color: "rgba(136, 132, 216, 0.7)",
        priceFormat: {
          type: "volume",
          precision: 2,
        },
        priceScaleId: "left",
        priceLineVisible: false,
      });

      const formattedData = cleanedData.map((data) => ({
        time: data.time as Time,
        value: data.votes,
        title: data.title,
        tokens: data.tokens,
      }));

      volumeSeries.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
      const toolTip = document.createElement("div");
      const chartHeight = chartContainerRef.current.clientHeight;
      const chartWidth = chartContainerRef.current.clientWidth;

      const toolTipWidth = 200;
      toolTip.className = classNames(
        "absolute hidden p-2 pointer-events-none",
        `w-[${toolTipWidth}px]`, "z-[1000]",
        "border border-gray-300 rounded",
        "bg-white text-sm font-sans antialiased"
      );
      chartContainerRef.current.appendChild(toolTip);

      const xMargin = 50;
      const yMargin = 30;
      chartRef.current.subscribeCrosshairMove((param) => {
        const toolTipHeight = toolTip.clientHeight;

        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > chartContainerRef.current!.clientWidth ||
          param.point.y < 0 ||
          param.point.y > chartContainerRef.current!.clientHeight
        ) {
          toolTip.style.display = "none";
        } else {
          const data = formattedData.find((d) => d.time === param.time);
          if (data) {
            toolTip.style.display = "block";
            toolTip.innerHTML = `
              <div class="text-gray-600 italic">
                ${format(new Date(data.time as number), "MMMM d, yyyy")}
              </div>
              <div class="text-sm my-1 font-bold">
                ${data.title}
              </div>
              <div>
                ${numToPrettyString(
                  data.value,
                  data.value < 1_000 ? "auto" : 2
                )} <span class="text-xs text-gray-600">VOTERS</span>
              </div>
              <div>
                ${numToPrettyString(
                  data.tokens
                )} <span class="text-xs text-gray-600">
                  $${spaceInfo?.symbol}</span>
              </div>
            `;
            let left = param.point.x - toolTipWidth + xMargin;
            if (param.point.x < chartWidth / 2) {
              left = param.point.x + (2 * xMargin);
            }

            let top = 0;
            if (param.point.y > chartHeight / 2) {
              top = param.point.y - toolTipHeight + yMargin;
            }

            toolTip.style.left = left + "px";
            toolTip.style.top = top + "px";
          }
        }
      });

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error creating chart:", error);
      console.error("Data causing error:", voteData);
    }
  }, [voteData]);

  return (
    <div className="card bg-base-100 w-full sm:w-96 grow pb-12">
      <div className="card-body">
        <h2 className="card-title">Proposal Voter Turnout</h2>
      </div>
      <figure className={classNames("h-80 relative p-4", loading && "skeleton")}>
        {voteData?.length > 0 && <div className="w-full h-full" ref={chartContainerRef} />}
      </figure>
    </div>
  );
}
