import { ETH_TOKEN_ADDRESS } from "../../../models/JuiceboxTypes";
import { useReadContract } from "wagmi";
import JBDirectory from "@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBDirectory.json";

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_projectId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "primaryTerminalOf",
    outputs: [
      {
        internalType: "contract IJBPaymentTerminal",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function useTerminalOfProject(projectId: number | undefined) {
  const argsNotEnough = projectId === undefined;

  return useReadContract({
    abi,
    address: JBDirectory.address,
    functionName: "primaryTerminalOf",
    args: !argsNotEnough ? [BigInt(projectId), ETH_TOKEN_ADDRESS] : undefined,
    query: {
      enabled: !argsNotEnough,
    },
  });
}
