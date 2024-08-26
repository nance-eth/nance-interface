import TenderlySimulationButton from "./TenderlySimulationButton";
import { TenderlySimulateArgs } from "@/utils/hooks/TenderlyHooks";
import { useEffect, useState } from "react";
import { GenericTransactionData } from "../Transaction/TransactionCreator";
import { encodeFunctionData, zeroAddress } from "viem";
import useChainConfigOfSpace from "@/utils/hooks/ChainOfSpace";
import {
  useCreateTransaction,
  useSafeInfo,
} from "@/utils/hooks/Safe/SafeHooks";

const SafeExecTransactionAbi = [
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
      {
        internalType: "enum Enum.Operation",
        name: "operation",
        type: "uint8",
      },
      { internalType: "uint256", name: "safeTxGas", type: "uint256" },
      { internalType: "uint256", name: "baseGas", type: "uint256" },
      { internalType: "uint256", name: "gasPrice", type: "uint256" },
      { internalType: "address", name: "gasToken", type: "address" },
      {
        internalType: "address payable",
        name: "refundReceiver",
        type: "address",
      },
      { internalType: "bytes", name: "signatures", type: "bytes" },
    ],
    name: "execTransaction",
    outputs: [{ internalType: "bool", name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function SafeTenderlySimulationButton({
  address,
  transactions,
}: {
  address: string;
  transactions: GenericTransactionData[];
}) {
  const [shouldSimulate, setShouldSimulate] = useState<boolean>(false);

  const chain = useChainConfigOfSpace();
  const { data: safeInfo } = useSafeInfo(address, !!address);
  const firstOwnerAddress = safeInfo?.owners?.[0] || zeroAddress;
  const { value: safeTransaction } = useCreateTransaction(
    address,
    transactions,
    true
  );

  // safe tx gas not enough
  const functionData = encodeFunctionData({
    abi: SafeExecTransactionAbi,
    functionName: "execTransaction",
    args: [
      safeTransaction?.data.to || zeroAddress, // to
      BigInt(0), // value
      safeTransaction?.data.data || "0x", //data
      1, //operation
      BigInt(safeTransaction?.data.safeTxGas || 0), //safeTxGas
      BigInt(0), //baseGas
      BigInt(safeTransaction?.data.gasPrice || 0), // gasPrice
      zeroAddress, // gasToken
      zeroAddress, // refundReceiver
      `0x000000000000000000000000${
        firstOwnerAddress.split("0x")[1]
      }000000000000000000000000000000000000000000000000000000000000000001`, // include signature
    ],
  });

  const state_objects: { [contract: string]: any } = {};
  // override Safe slot 4 to be value 0x01,
  //   so we can simulate with all signatures that Safe.execTransaction required
  state_objects[address] = {
    storage: {
      "0x0000000000000000000000000000000000000000000000000000000000000004":
        "0x0000000000000000000000000000000000000000000000000000000000000001",
    },
  };

  const simulationArgs: TenderlySimulateArgs = {
    from: firstOwnerAddress,
    to: address || "",
    value: 0,
    input: functionData,
    networkId: chain.id,
    state_objects,
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
