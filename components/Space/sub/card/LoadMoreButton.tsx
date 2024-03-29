import { classNames } from "@/utils/functions/tailwind";
import LoadingArrowSpiner from "@/components/common/LoadingArrowSpiner";

export default function LoadMoreButton({
  dataLength,
  fetchMore,
  loading,
  hasMore = true,
}: {
  dataLength: number;
  fetchMore: any;
  loading: boolean;
  hasMore?: boolean;
}) {
  return (
    <div className="col-span-4 inline-flex rounded-md">
      <button
        type="button"
        className={classNames(
          "inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 disabled:cursor-not-allowed",
          loading ? "" : "hover:bg-gray-50 focus:z-10",
        )}
        disabled={loading || !hasMore}
        onClick={fetchMore}
      >
        Load more
      </button>
      <div className="-ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
        {loading ? <LoadingArrowSpiner /> : dataLength}
      </div>
    </div>
  );
}
