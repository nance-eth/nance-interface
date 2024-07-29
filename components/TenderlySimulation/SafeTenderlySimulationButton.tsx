import TenderlySimulationButton from "./TenderlySimulationButton";
import { useCreateTransaction } from "@/utils/hooks/Safe/SafeHooks";
import { TenderlySimulateArgs } from "@/utils/hooks/TenderlyHooks";
import { useContext, useEffect, useState } from "react";
import { GenericTransactionData } from "../Transaction/TransactionCreator";
import { NetworkContext } from "@/context/NetworkContext";
import { getChainByNetworkName } from "config/custom-chains";

const SAFE_SINGLETON_1_3_0 = "0xd9db270c1b5e3bd161e8c8503c55ceabee709552";

export default function SafeTenderlySimulationButton({
  address,
  transactions,
}: {
  address: string;
  transactions: GenericTransactionData[];
}) {
  const [shouldSimulate, setShouldSimulate] = useState<boolean>(false);

  const { value: safeTransaction } = useCreateTransaction(
    address,
    transactions
  );

  const network = useContext(NetworkContext).toLowerCase() as string;
  const networkId = getChainByNetworkName(network)?.id;
  const isMultiSend = transactions.length > 1;

  const simulationArgs: TenderlySimulateArgs = {
    from: address,
    to: isMultiSend ? SAFE_SINGLETON_1_3_0 : safeTransaction?.data.to || "",
    value: parseInt(safeTransaction?.data.value || "0"),
    input: safeTransaction?.data.data || "",
    networkId,
  };

  useEffect(() => {
    if (shouldSimulate) {
      setShouldSimulate(false);
    }
  }, [transactions]);

  return (
    <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
      <TenderlySimulationButton
        simulationArgs={simulationArgs}
        shouldSimulate={shouldSimulate}
        setShouldSimulate={setShouldSimulate}
      />
    </div>
  );
}
