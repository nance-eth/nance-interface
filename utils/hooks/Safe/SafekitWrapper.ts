import { useContext, useEffect, useState } from "react";
import SafeApiKit from "@safe-global/api-kit";
import { NetworkContext } from "@/context/NetworkContext";
import { getChainByNetworkName } from "config/custom-chains";

export function useSafeAPIKit() {
  const [value, setValue] = useState<SafeApiKit>();
  const network = useContext(NetworkContext);

  useEffect(() => {
    const chain = getChainByNetworkName(network);
    const safeApiKit = new SafeApiKit({
      chainId: BigInt(chain.id),
    });
    setValue(safeApiKit);
  }, [network]);

  return { value, loading: !value };
}
