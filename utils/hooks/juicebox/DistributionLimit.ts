import useTerminalOfProject from "./TerminalOfProject";
import JBFundAccessConstraintsStore from "@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBFundAccessConstraintsStore.json";
import { useReadContract } from "wagmi";
import { ETH_TOKEN_ADDRESS } from "@/models/JuiceboxTypes";

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
        name: "_configuration",
        type: "uint256",
      },
      {
        internalType: "contract IJBPaymentTerminal",
        name: "_terminal",
        type: "address",
      },
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "distributionLimitOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useDistributionLimit(
  projectId: number | undefined,
  configured: bigint | undefined
) {
  const { data: terminalAddress } = useTerminalOfProject(projectId);

  const argsNotEnough =
    terminalAddress === undefined ||
    projectId === undefined ||
    configured === undefined;

  return useReadContract({
    abi,
    address: JBFundAccessConstraintsStore.address,
    functionName: "distributionLimitOf",
    args: !argsNotEnough
      ? [BigInt(projectId), configured, terminalAddress, ETH_TOKEN_ADDRESS]
      : undefined,
    query: {
      enabled: !argsNotEnough,
    },
  });
}
