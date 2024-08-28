import { getAddress, isAddress } from "viem";
import { ContractType, useContractType } from "@/utils/hooks/ContractHooks";
import SafeTenderlySimulationButton from "./SafeTenderlySimulationButton";
import GovernorTenderlySimulationButton from "./GovernorTenderlySimulationButton";
import { Tooltip } from "flowbite-react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { GenericTransactionData } from "../Transaction/TransactionCreator";
import { TenderlySimulationAPIResponse } from "@/utils/hooks/TenderlyHooks";

export default function GenericTenderlySimulationButton({
  rawAddress,
  transactions,
  onSimulated,
}: {
  rawAddress: string;
  transactions: GenericTransactionData[];
  onSimulated?: (
    data: TenderlySimulationAPIResponse | undefined,
    shouldSimulate: boolean
  ) => void;
}) {
  const contractType = useContractType(rawAddress);

  if (contractType === ContractType.Unknown) {
    return (
      <div className="isolate col-span-4 inline-flex rounded-md">
        <button
          type="button"
          className="relative inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300"
        >
          Simulate
        </button>
        <div className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
          <Tooltip content="Unknown contract address">
            <XCircleIcon
              className="-ml-0.5 h-5 w-5 text-red-400"
              aria-hidden="true"
            />
          </Tooltip>
        </div>
      </div>
    );
  }

  const address = getAddress(rawAddress);
  if (contractType === ContractType.Safe) {
    return (
      <SafeTenderlySimulationButton
        address={address}
        transactions={transactions}
        onSimulated={onSimulated}
      />
    );
  } else if (contractType === ContractType.Governor) {
    return (
      <GovernorTenderlySimulationButton
        address={address}
        transactions={transactions}
        onSimulated={onSimulated}
      />
    );
  }
}
