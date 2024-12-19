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
        width: 800,
        height: 320,
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

      toolTip.className = classNames(
        "absolute hidden p-2 pointer-events-none",
        "w-[200px] z-[1000]",
        "border border-gray-300 rounded",
        "bg-white text-sm font-sans antialiased"
      );
      chartContainerRef.current.appendChild(toolTip);

      const toolTipHeight = 100;
      const toolTipWidth = 200;
      const toolTipMargin = -70;

      chartRef.current.subscribeCrosshairMove((param) => {
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

            let left = param.point.x + toolTipMargin;
            if (param.point.x < chartContainerRef.current!.clientWidth / 2) {
              left = param.point.x + toolTipWidth + toolTipMargin / 2;
            }
            let top = param.point.y + toolTipMargin;
            if (param.point.y > chartContainerRef.current!.clientHeight / 2) {
              top = param.point.y - toolTipHeight + toolTipMargin;
            } else if (
              param.point.y <
              chartContainerRef.current!.clientHeight / 4
            ) {
              top = param.point.y + toolTipHeight + toolTipMargin;
            }
            console.log("top", param.point.y);
            // top = Math.min(, 320)

            toolTip.style.left = left + "px";
            toolTip.style.top = top + "px";
          }
        }
      });

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
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
    <div className="card bg-base-100 w-80 sm:w-96 grow pb-12">
      <div className="card-body">
        <h2 className="card-title">Proposal Voter Turnout</h2>
      </div>
      <figure className={classNames("h-80 relative", loading && "skeleton")}>
        {voteData?.length > 0 && <div ref={chartContainerRef} />}
      </figure>
    </div>
  );
}
