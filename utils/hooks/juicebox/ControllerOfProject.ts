import { useReadContract } from "wagmi";
import JBDirectory from "@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBDirectory.json";

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "controllerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function useControllerOfProject(projectId: number | undefined) {
  return useReadContract({
    abi,
    address: JBDirectory.address,
    functionName: "controllerOf",
    args: projectId ? [BigInt(projectId)] : undefined,
    query: {
      enabled: !!projectId,
    },
  });
}
