import { SpaceContext } from "@/context/SpaceContext";
import { customChains } from "config/custom-chains";
import { useContext } from "react";

export default function useChainConfigOfSpace() {
  const spaceInfo = useContext(SpaceContext);
  const network = spaceInfo?.transactorAddress?.network;
  return (
    customChains.find((chain) => chain.name.toLowerCase() === network) ||
    customChains[0]
  );
}
