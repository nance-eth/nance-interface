import useTerminalOfProject from "./TerminalOfProject";
import { useReadContract } from "wagmi";

const abi = [
  {
    inputs: [],
    name: "fee",
    outputs: [
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

export default function useTerminalFee(projectId: number | undefined) {
  const { data: terminalAddress } = useTerminalOfProject(projectId);

  const argsNotEnough = terminalAddress === undefined;

  return useReadContract({
    abi,
    address: terminalAddress,
    functionName: "fee",
    query: {
      enabled: !argsNotEnough,
    },
  });
}
