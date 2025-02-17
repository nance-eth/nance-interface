import { useContext } from "react";
import { NetworkContext } from "@/context/NetworkContext";
import {
  mainnet,
  optimism,
  gnosis,
  sepolia,
  base,
} from "wagmi/chains";

export const safeServiceURL = {
  [mainnet.name]: "mainnet",
  [base.name]: "base",
  [optimism.name]: "optimism",
  [gnosis.name]: "gnosis-chain",
  [sepolia.name]: "sepolia",
};

export type SupportedSafeNetwork = keyof typeof safeServiceURL;

export const V1 = "api/v1";

export const useSafeNetworkAPI = () => {
  const network = useContext(NetworkContext) as SupportedSafeNetwork;
  return `https://safe-transaction-${safeServiceURL[network]}.safe.global`;
};

export const safeNetworkAPI = (name: SupportedSafeNetwork) => {
  return `https://safe-transaction-${safeServiceURL[name]}.safe.global`;
};
