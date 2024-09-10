import TenderlySimulationButton from "./TenderlySimulationButton";
import {
  TenderlySimulateArgs,
  TenderlySimulationAPIResponse,
} from "@/utils/hooks/TenderlyHooks";
import { useEffect, useState } from "react";
import { GenericTransactionData } from "../Transaction/TransactionCreator";
import { zeroAddress } from "viem";
import useChainConfigOfSpace from "@/utils/hooks/ChainOfSpace";
import {
  useCreateTransactionForSimulation,
  useSafeInfo,
} from "@/utils/hooks/Safe/SafeHooks";

export default function SafeTenderlySimulationButton({
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

  const chain = useChainConfigOfSpace();
  const { data: safeInfo } = useSafeInfo(address, !!address);
  const firstOwnerAddress = safeInfo?.owners?.[0] || zeroAddress;
  const { encodedTransaction, safeTransaction } =
    useCreateTransactionForSimulation(address, transactions, true);

  const state_objects: { [contract: string]: any } = {};
  // override Safe slot 4 to be value 0x01,
  //   so we can simulate with all signatures that Safe.execTransaction required
  state_objects[address] = {
    storage: {
      "0x0000000000000000000000000000000000000000000000000000000000000004":
        "0x0000000000000000000000000000000000000000000000000000000000000001",
    },
  };

  // calculate gas_limit like Safe UI does
  const safeTxGas = Number(BigInt(safeTransaction?.data.safeTxGas || 0));
  const baseGas = Number(BigInt(safeTransaction?.data.baseGas || 0));
  const gasLimit = parseInt(((safeTxGas + baseGas) * 1.1).toFixed());

  const simulationArgs: TenderlySimulateArgs = {
    from: firstOwnerAddress,
    to: address || "",
    value: "0",
    input: encodedTransaction || "",
    networkId: chain.id.toString(),
    gasPrice: "100000000", // 0.1 Gwei
    state_objects,
    gasLimit,
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
