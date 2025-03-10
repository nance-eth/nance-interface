import { Tooltip } from "flowbite-react";
import { classNames } from "@/utils/functions/tailwind";

export const JB_THRESHOLD = 80_000_000;

const COLOR_VARIANTS: { [key: string]: string } = {
  green: "bg-green-500",
  red: "bg-red-500",
  gray: "bg-gray-200",
  blue: "bg-gray-500",
};
const WIDTH_VARIANTS: { [key: number]: string } = {
  0: "w-0",
  1: "w-1/12",
  2: "w-2/12",
  3: "w-3/12",
  4: "w-4/12",
  5: "w-5/12",
  6: "w-6/12",
  7: "w-7/12",
  8: "w-8/12",
  9: "w-9/12",
  10: "w-10/12",
  11: "w-11/12",
  12: "w-full",
};
const TOTAL_WIDTH = 12;

const formatter = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  compactDisplay: "short",
});
const formatNumber = (num: number) => formatter.format(num);

function ColorDiv({ color, width }: { color: string; width: number }) {
  if (!width) return null;

  return (
    <div
      className={classNames(
        COLOR_VARIANTS[color],
        WIDTH_VARIANTS[width],
        "h-3 first:rounded-l-full last:rounded-r-full",
      )}
    />
  );
}

interface ColorBarProps {
  /**
   * The number of for votes for the proposal.
   */
  greenScore: number;
  /**
   * The number of against votes for the proposal.
   */
  redScore: number;
  /**
   * Whether to show the tooltip.
   */
  noTooltip?: boolean;
  /**
   * The threshold of greenScore+redScore for the proposal to pass. Defaults to @see JB_THRESHOLD.
   */
  threshold?: number;
  /**
   * The min percent of greenScore/(greenScore+redScore) for the proposal to pass. Defaults to 0.66
   */
  approvalPercent?: number;
  /**
   * The number of abstain votes for the proposal. If present, count it in quorum.
   */
  blueScore?: number;
}

/**
 * ColorBar which shows the votes weight of a proposal and the progress towards the threshold.
 * @param greenScore The number of for votes for the proposal.
 * @param redScore The number of against votes for the proposal.
 * @param noTooltip Whether to show the tooltip.
 * @param threshold The threshold of greenScore+redScore for the proposal to pass. Defaults to @see JB_THRESHOLD.
 * @param approvalPercent The min percent of greenScore/(greenScore+redScore) for the proposal to pass. Defaults to 0.66.
 * @param blueScore The number of abstain votes for the proposal. If present, count it in quorum.
 */
export default function ColorBar({
  greenScore,
  redScore,
  noTooltip = false,
  threshold = JB_THRESHOLD,
  approvalPercent = 0.66,
  blueScore = 0
}: ColorBarProps) {
  const totalScore = greenScore + redScore + blueScore;
  const baseTotalScore = greenScore + redScore;
  const hasPass =
    totalScore >= threshold && greenScore / baseTotalScore >= approvalPercent;
  const shouldDisplayVerticalLine =
    totalScore >= threshold && greenScore / baseTotalScore < approvalPercent;
  const colorWidth = Math.min(
    TOTAL_WIDTH,
    Math.round((totalScore / threshold) * TOTAL_WIDTH),
  );
  const grayWidth = TOTAL_WIDTH - colorWidth;

  const greenWidth = Math.round((greenScore / totalScore) * colorWidth);
  const redWidth = Math.round((redScore / totalScore) * colorWidth);
  const blueWidth = Math.round((blueScore / totalScore) * colorWidth);

  const renderBar = () => (
    <>
      <div className="flex h-3 w-full min-w-[5rem] flex-row rounded-full bg-gray-200 dark:bg-gray-700">
        <ColorDiv color="green" width={greenWidth} />
        <ColorDiv color="red" width={redWidth} />
        <ColorDiv color="blue" width={blueWidth} />
        <ColorDiv color="gray" width={grayWidth} />
      </div>
      {shouldDisplayVerticalLine && (
        <div className="relative z-10 -mt-3 h-3 w-8/12 border-r-2" />
      )}
    </>
  );

  if (noTooltip) {
    return renderBar();
  }

  return (
    <Tooltip
      content={
        <div className="flex flex-col">
          <div>
            {`${hasPass ? "✅" : "❌"}
            For ${formatNumber(greenScore)}
            (${(greenScore / baseTotalScore * 100).toFixed()}%)`}
          </div>
          <div>
            {`Against ${formatNumber(redScore)}
            (${(redScore / baseTotalScore * 100).toFixed()}%)`}
          </div>
          <div>
            {`Total ${formatNumber(totalScore)}
            (${((totalScore / threshold) * 100).toFixed()}% of quorum)`}
          </div>
        </div>
      }
      trigger="hover"
      aria-multiline="true"
    >
      {renderBar()}
    </Tooltip>
  );
}
