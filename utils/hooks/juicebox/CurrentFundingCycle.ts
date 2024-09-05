import useControllerOfProject from "./ControllerOfProject";
import { useReadContract } from "wagmi";

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_projectId",
        type: "uint256",
      },
    ],
    name: "currentFundingCycleOf",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "number",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "configuration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "basedOn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "start",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "duration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "weight",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "discountRate",
            type: "uint256",
          },
          {
            internalType: "contract IJBFundingCycleBallot",
            name: "ballot",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "metadata",
            type: "uint256",
          },
        ],
        internalType: "struct JBFundingCycle",
        name: "fundingCycle",
        type: "tuple",
      },
      {
        components: [
          {
            components: [
              {
                internalType: "bool",
                name: "allowSetTerminals",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetController",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "pauseTransfers",
                type: "bool",
              },
            ],
            internalType: "struct JBGlobalFundingCycleMetadata",
            name: "global",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "reservedRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "redemptionRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "ballotRedemptionRate",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "pausePay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseDistributions",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseRedeem",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseBurn",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowMinting",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowTerminalMigration",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowControllerMigration",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "holdFees",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "preferClaimedTokenOverride",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useTotalOverflowForRedemptions",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataSourceForPay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataSourceForRedeem",
            type: "bool",
          },
          {
            internalType: "address",
            name: "dataSource",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "metadata",
            type: "uint256",
          },
        ],
        internalType: "struct JBFundingCycleMetadata",
        name: "metadata",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useCurrentFundingCycle(projectId: number | undefined) {
  const { data: controllerAddress } = useControllerOfProject(projectId);
  return useReadContract({
    abi,
    address: controllerAddress,
    functionName: "currentFundingCycleOf",
    args: projectId ? [BigInt(projectId)] : undefined,
    query: {
      enabled: !!projectId,
    },
  });
}
