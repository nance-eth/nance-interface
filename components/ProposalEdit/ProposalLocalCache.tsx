import { classNames } from "@/utils/functions/tailwind";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import {
  fromUnixTime,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
} from "date-fns";

export interface ProposalCache {
  version: number;
  timestamp: number;
  title: string;
  body: string;
}

function getMinimalTimeDifference(date: Date, now = new Date()) {
  const secondsDiff = differenceInSeconds(now, date);
  if (secondsDiff < 60) {
    return "just now";
  }
  const minutesDiff = differenceInMinutes(now, date);
  if (minutesDiff < 60) {
    return `${minutesDiff} ${minutesDiff === 1 ? "minute" : "minutes"} ago`;
  }
  const hoursDiff = differenceInHours(now, date);
  if (hoursDiff < 24) {
    return `${hoursDiff} ${hoursDiff === 1 ? "hour" : "hours"} ago`;
  }
  const daysDiff = differenceInDays(now, date);
  if (daysDiff < 30) {
    return `${daysDiff} ${daysDiff === 1 ? "day" : "days"} ago`;
  }
  const monthsDiff = differenceInMonths(now, date);
  if (monthsDiff < 12) {
    return `${monthsDiff} ${monthsDiff === 1 ? "month" : "months"} ago`;
  }
}

export default function ProposalLocalCache({
  proposalCache,
  clearProposalCache,
  restoreProposalCache,
}: {
  proposalCache?: ProposalCache;
  clearProposalCache: () => void;
  restoreProposalCache: (t: string, b: string) => void;
}) {
  const isCacheEmpty =
    proposalCache === undefined || proposalCache.timestamp === 0;

  return (
    <div
      className={classNames(
        "text-xs text-gray-400 mb-1 flex flex-row space-x-2",
        !isCacheEmpty ? "flex" : "hidden"
      )}
    >
      <div>
        saved locally (
        {getMinimalTimeDifference(fromUnixTime(proposalCache?.timestamp || 0))})
        <CheckCircleIcon className="ml-1 h-4 w-4 inline-block" />
      </div>
      <div className="flex flex-row space-x-2">
        <button
          type="button"
          onClick={() =>
            restoreProposalCache(
              proposalCache?.title || "",
              proposalCache?.body || ""
            )
          }
          className="text-blue-500 hover:underline"
        >
          restore
        </button>
        <button
          type="button"
          onClick={clearProposalCache}
          className="text-yellow-500 hover:underline"
        >
          clear
        </button>
      </div>
    </div>
  );
}
