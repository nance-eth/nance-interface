import { gnosis, goerli, mainnet, optimism } from "wagmi/chains";

export const customChains = [
  { ...mainnet, iconUrl: "/images/chains/ethereum.svg" },
  { ...optimism, iconUrl: "/images/chains/optimism.svg" },
  { ...gnosis, iconUrl: "/images/chains/gnosis.png" },
  { ...goerli, iconUrl: "" },
];

export const getChainByNetworkName = (networkName?: string) => {
  if (!networkName) return customChains[0];
  return (
    customChains.find(
      (c) => c.name.toLowerCase() === networkName.toLowerCase(),
    ) || customChains[0]
  );
};

export const getChainById = (chainId?: number) => {
  return customChains.find((c) => c.id === chainId) || customChains[0];
};
