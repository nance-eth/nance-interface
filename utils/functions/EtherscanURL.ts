import { customChains } from "config/custom-chains";

export function getAddressLink(address: string, network: string) {
  const findNetwork =
    customChains.find((chain) => chain.name === network) || customChains[0];
  return `${findNetwork?.blockExplorers?.default?.url}/address/${address}`;
}

export function getTxLink(txHash: string, network: string) {
  const networkPrefix =
    network !== "mainnet" ? network.toLowerCase() + "." : "";
  return `https://${networkPrefix}etherscan.io/tx/${txHash}`;
}
