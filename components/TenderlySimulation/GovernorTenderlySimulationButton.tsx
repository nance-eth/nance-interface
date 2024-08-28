import { useAccount } from "wagmi";
import {
  TenderlySimulateArgs,
  TenderlySimulationAPIResponse,
} from "@/utils/hooks/TenderlyHooks";
import TenderlySimulationButton from "./TenderlySimulationButton";
import { encodeFunctionData } from "viem";
import { PROPOSE_ABI } from "@/utils/hooks/governor/Propose";
import { useEffect, useState } from "react";
import { GenericTransactionData } from "../Transaction/TransactionCreator";

export default function GovernorTenderlySimulationButton({
  address,
  transactions,
  onSimulated,
}: {
  address: string;
  transactions: GenericTransactionData[];
  onSimulated?: (
    data: TenderlySimulationAPIResponse | undefined,
    shouldSimulate: boolean
  ) => void;
}) {
  const [shouldSimulate, setShouldSimulate] = useState<boolean>(false);

  const { address: userAddress } = useAccount();

  const proposeData = encodeFunctionData({
    abi: PROPOSE_ABI,
    functionName: "propose",
    args: [
      transactions.map(
        (transactionData) => transactionData.to as `0x${string}`
      ),
      transactions.map((transactionData) => transactionData.value),
      transactions.map((transactionData) => transactionData.data),
      "Queued from nance.app",
    ],
  });

  const simulationArgs: TenderlySimulateArgs = {
    from: userAddress || "",
    to: address,
    value: "0",
    input: proposeData || "",
  };

  useEffect(() => {
    if (shouldSimulate) {
      setShouldSimulate(false);
    }
  }, [transactions]);

  return (
    <TenderlySimulationButton
      simulationArgs={simulationArgs}
      shouldSimulate={shouldSimulate}
      setShouldSimulate={setShouldSimulate}
      onSimulated={onSimulated}
    />
  );
}
