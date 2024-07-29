import { useContext, useEffect, useState } from "react";
import SafeApiKit from "@safe-global/api-kit";
import { useSafeNetworkAPI } from "@/utils/hooks/Safe/SafeURL";
import { NetworkContext } from "@/context/NetworkContext";
import { getChainByNetworkName } from "config/custom-chains";

export function useSafeAPIKit() {
  const [value, setValue] = useState<SafeApiKit>();
  const network = useContext(NetworkContext);
  const txServiceUrl = useSafeNetworkAPI();

  useEffect(() => {
    const chain = getChainByNetworkName(network);
    const safeApiKit = new SafeApiKit({
      chainId: BigInt(chain.id),
      txServiceUrl,
    });
    setValue(safeApiKit);
  }, [network]);

  return { value, loading: !value };
}
