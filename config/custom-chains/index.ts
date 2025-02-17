import { gnosis, mainnet, optimism, base, sepolia } from "wagmi/chains";

export const customChains = [
  mainnet,
  base,
  optimism,
  { ...gnosis, iconUrl: "/images/chains/gnosis.png" }, // no icon built in for some reason
  sepolia,
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
