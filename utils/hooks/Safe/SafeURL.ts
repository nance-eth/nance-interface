import { useContext } from "react";
import { NetworkContext } from "@/context/NetworkContext";
import { mainnet, optimism, gnosis, sepolia, base } from "wagmi/chains";

export const safeServiceURL = {
  [mainnet.name]: "mainnet",
  [base.name]: "base",
  [optimism.name]: "optimism",
  [gnosis.name]: "gnosis-chain",
  [sepolia.name]: "sepolia",
};

export const safeChainId = {
  [mainnet.name]: mainnet.id,
  [base.name]: base.id,
  [optimism.name]: optimism.id,
  [gnosis.name]: gnosis.id,
  [sepolia.name]: sepolia.id,
};

export type SupportedSafeNetwork = keyof typeof safeServiceURL;

export const safeNetworkAPI = (network: SupportedSafeNetwork) => {
  return `https://safe-client.safe.global/v1/chains/${safeChainId[network]}`;
};

export const useSafeNetworkAPI = () => {
  const network = useContext(NetworkContext) as SupportedSafeNetwork;
  //return `https://safe-transaction-${safeServiceURL[network]}.safe.global`;
  return safeNetworkAPI(network);
};
