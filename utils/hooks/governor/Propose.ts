import { useSimulateContract, useWriteContract } from "wagmi";

export const PROPOSE_ABI = [
  {
    inputs: [
      { internalType: "address[]", name: "targets", type: "address[]" },
      { internalType: "uint256[]", name: "values", type: "uint256[]" },
      { internalType: "bytes[]", name: "calldatas", type: "bytes[]" },
      { internalType: "string", name: "description", type: "string" },
    ],
    name: "propose",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function usePropose(
  governorAddress: `0x${string}` | undefined,
  targets: `0x${string}`[],
  values: string[],
  calldatas: string[],
  description: string,
) {
  const { data } = useSimulateContract({
    address: governorAddress,
    abi: PROPOSE_ABI,
    functionName: "propose",
    args: [targets, values, calldatas, description],
  });
  return {
    ...useWriteContract(),
    request: data?.request,
  };
}
