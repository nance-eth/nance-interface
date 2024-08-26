import { Tooltip } from "flowbite-react";
import {
  TenderlySimulateArgs,
  TenderlySimulationAPIResponse,
  useTenderlySimulate,
} from "@/utils/hooks/TenderlyHooks";
import { classNames } from "@/utils/functions/tailwind";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  CursorArrowRaysIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useEffect } from "react";

export default function TenderlySimulationButton({
  simulationArgs,
  shouldSimulate,
  setShouldSimulate,
  onSimulated,
}: {
  simulationArgs: TenderlySimulateArgs;
  shouldSimulate: boolean;
  setShouldSimulate: (shouldSimulate: boolean) => void;
  onSimulated?: (
    data: TenderlySimulationAPIResponse | undefined,
    shouldSimulate: boolean
  ) => void;
}) {
  const { data, isLoading, error } = useTenderlySimulate(
    simulationArgs,
    shouldSimulate
  );

  useEffect(() => {
    onSimulated?.(data, shouldSimulate);
  }, [data, shouldSimulate, onSimulated]);

  const tenderlyUrl = data?.simulation?.id
    ? `https://www.tdly.co/shared/simulation/${data.simulation.id}`
    : null;

  return (
    <div className="isolate col-span-4 inline-flex rounded-md">
      <button
        type="button"
        className={classNames(
          "relative inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300",
          shouldSimulate ? "" : "hover:bg-gray-50 focus:z-10"
        )}
        onClick={() => {
          if (shouldSimulate) {
            setShouldSimulate(false);
          }
          setShouldSimulate(true);
        }}
      >
        Simulate
      </button>
      <div className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
        {shouldSimulate ? (
          isLoading ? (
            <ArrowPathIcon
              className="-ml-0.5 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          ) : data?.simulation?.status ? (
            <div className="flex items-center">
              <CheckCircleIcon
                className="-ml-0.5 h-5 w-5 text-green-400"
                aria-hidden="true"
              />
              {tenderlyUrl && (
                <a
                  href={tenderlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500 hover:text-blue-600"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <Tooltip
                content={`Error: ${
                  error
                    ? error.message
                    : data?.simulation?.error_message || "Not enough args"
                }`}
              >
                <XCircleIcon
                  className="-ml-0.5 h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </Tooltip>
              {tenderlyUrl && (
                <a
                  href={tenderlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500 hover:text-blue-600"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          )
        ) : (
          <CursorArrowRaysIcon
            className="-ml-0.5 h-5 w-5 text-blue-400"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
