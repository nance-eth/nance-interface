import { gnosis, mainnet, optimism, base, sepolia } from "wagmi/chains";

export const customChains = [
  { ...mainnet, iconUrl: "/images/chains/mainnet.svg" },
  { ...base, iconUrl: "/images/chains/base.svg" },
  { ...optimism, iconUrl: "/images/chains/optimism.svg" },
  { ...gnosis, iconUrl: "/images/chains/gnosis.png" }, // no icon built in for some reason
  { ...sepolia, iconUrl: "/images/chains/sepolia.svg" },
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
