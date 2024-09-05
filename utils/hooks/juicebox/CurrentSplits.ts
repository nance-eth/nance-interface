import { useReadContract } from "wagmi";
import JBSplitsStore from "@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBSplitsStore.json";

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_projectId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_domain",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_group",
        type: "uint256",
      },
    ],
    name: "splitsOf",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "preferClaimed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "preferAddToBalance",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "percent",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "projectId",
            type: "uint256",
          },
          {
            internalType: "address payable",
            name: "beneficiary",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "lockedUntil",
            type: "uint256",
          },
          {
            internalType: "contract IJBSplitAllocator",
            name: "allocator",
            type: "address",
          },
        ],
        internalType: "struct JBSplit[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useCurrentSplits(
  projectId: number | undefined,
  // funding cycle configuration
  domain: bigint | undefined,
  // ETH_PAYOUT_SPLIT_GROUP or RESERVED_TOKEN_SPLIT_GROUP
  group: bigint | undefined
) {
  const argsNotEnough =
    projectId === undefined || domain === undefined || group === undefined;

  return useReadContract({
    abi,
    address: JBSplitsStore.address,
    functionName: "splitsOf",
    args: !argsNotEnough ? [BigInt(projectId), domain, group] : undefined,
    query: {
      enabled: !argsNotEnough,
    },
  });
}
