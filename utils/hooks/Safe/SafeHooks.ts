import useSWR from "swr";
import { SafeBalanceUsdResponse, SafeInfoResponse } from "@/models/SafeTypes";
import { useEffect, useState } from "react";
import { useAccount, useGasPrice, useWalletClient } from "wagmi";
import Safe, { SafeTransactionOptionalProps } from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  SafeTransaction,
} from "@safe-global/safe-core-sdk-types";
import {
  safeNetworkAPI,
  useSafeNetworkAPI,
  V1,
  SupportedSafeNetwork,
} from "@/utils/hooks/Safe/SafeURL";
import { useSafeAPIKit } from "./SafekitWrapper";
import {
  jsonFetcher,
  delegatesJsonFetcher,
  safeInfoJsonFetcher,
  validSafeFetcher,
  fetchSafeWithAddress,
  basicFetcher,
} from "./SafeFetchers";
import useChainConfigOfSpace from "../ChainOfSpace";

export function useMultisigTransactionOf(
  address: string,
  safeTxHash: string,
  shouldFetch: boolean = true
) {
  const api = useSafeNetworkAPI();
  return useSWR(
    shouldFetch
      ? `${api}/${V1}/safes/${address}/multisig-transactions/?safe_tx_hash=${safeTxHash}`
      : null,
    jsonFetcher()
  );
}

export function useHistoryTransactions(
  address: string,
  limit: number = 10,
  shouldFetch: boolean = true
) {
  const api = useSafeNetworkAPI();
  return useSWR(
    shouldFetch
      ? `${api}/${V1}/safes/${address}/multisig-transactions/?executed=true&trusted=true&limit=${limit}`
      : null,
    jsonFetcher()
  );
}

export function useQueuedTransactions(
  address: string,
  nonceGte: number,
  limit: number = 10,
  shouldFetch: boolean = true
) {
  const api = useSafeNetworkAPI();
  return useSWR(
    shouldFetch
      ? `${api}/${V1}/safes/${address}/multisig-transactions/?nonce__gte=${nonceGte}&trusted=true&limit=${limit}`
      : null,
    jsonFetcher()
  );
}

export function useMultisigTransactions(
  address: string,
  limit: number = 10,
  shouldFetch: boolean = true
) {
  const api = useSafeNetworkAPI();
  return useSWR(
    shouldFetch
      ? `${api}/${V1}/safes/${address}/multisig-transactions/?trusted=true&limit=${limit}`
      : null,
    jsonFetcher()
  );
}

export function useSafeInfo(address: string, shouldFetch: boolean = true) {
  const api = useSafeNetworkAPI();
  return useSWR<SafeInfoResponse, Error>(
    shouldFetch ? `${api}/${V1}/safes/${address}` : null,
    safeInfoJsonFetcher(),
    { shouldRetryOnError: false }
  );
}

export function useSafeDelegates(address: string, shouldFetch: boolean = true) {
  const api = useSafeNetworkAPI();
  return useSWR(
    shouldFetch ? `${api}/${V1}/delegates/?safe=${address}` : null,
    delegatesJsonFetcher()
  );
}

export function useSafe(safeAddress: string) {
  const [error, setError] = useState<string>();
  const [value, setValue] = useState<Safe>();
  const { address } = useAccount();

  useEffect(() => {
    if (!address || !safeAddress) {
      return;
    }

    Safe.init({
      provider: window.ethereum,
      signer: address,
      safeAddress,
    })
      .then((safe) => setValue(safe))
      .catch((err) => setError(err));
  }, [address, safeAddress]);

  return { value, loading: !value, error };
}

export function useCreateTransaction(
  safeAddress: string,
  safeTransactionData: MetaTransactionData[]
) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<SafeTransaction>();

  const { value: safe } = useSafe(safeAddress);

  const chain = useChainConfigOfSpace();
  const { data: gasPrice } = useGasPrice({
    chainId: chain.id,
    query: { refetchInterval: 10000 }, // refetch every 10s
  });

  const options: SafeTransactionOptionalProps = {
    gasPrice: gasPrice?.toString() || "0", // If gasPrice > 0, Safe contract will refund gasUsed.
    // safeTxGas will be max tx gas can be used, should we set this?
  };

  useEffect(() => {
    if (!safe) {
      setError("Not connected to wallet or safe not found.");
      return;
    }

    setLoading(true);

    safe
      .createTransaction({
        transactions: safeTransactionData,
        options,
        onlyCalls: true,
      })
      .then((safeTransaction) => setValue(safeTransaction))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [safe, safeTransactionData]);

  return {
    value,
    error,
    loading,
    gasPrice,
  };
}

export function useQueueTransaction(
  safeAddress: string,
  safeTransactionData: MetaTransactionData[],
  nonce?: number
) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<{ safeTxHash: string; nonce: string }>();

  const { data: walletClient } = useWalletClient();
  const { address, isConnecting, isDisconnected } = useAccount();
  const { value: safeApiKit } = useSafeAPIKit();
  const { value: safe } = useSafe(safeAddress);
  const chain = useChainConfigOfSpace();
  const { refetch } = useGasPrice({
    chainId: chain.id,
  });

  const trigger = async () => {
    if (!safe || !walletClient || !safeApiKit || !address) {
      setError("Not connected to wallet or safe not found.");
      return;
    }

    setLoading(true);
    setError(undefined);

    const { data: gasPrice } = await refetch(); // get newest gasPrice
    const options: SafeTransactionOptionalProps = {
      nonce, // Optional
      gasPrice: gasPrice?.toString() || "0", // If gasPrice > 0, Safe contract will refund gasUsed.
      // safeTxGas will be max tx gas can be used, should we set this?
    };

    try {
      const safeTransaction = await safe.createTransaction({
        transactions: safeTransactionData,
        options,
        onlyCalls: true,
      });
      const senderAddress = address;
      const safeTxHash = await safe.getTransactionHash(safeTransaction);
      const signature = await safe.signHash(safeTxHash);

      // Propose transaction to the service
      await safeApiKit.proposeTransaction({
        safeAddress: await safe.getAddress(),
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress,
        senderSignature: signature.data,
      });

      setValue({
        safeTxHash: safeTxHash,
        nonce: safeTransaction.data.nonce.toString(),
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    value,
    error,
    loading,
    trigger,
  };
}

export function useIsValidAddress(
  address: string,
  shouldFetch: boolean = true
) {
  const api = useSafeNetworkAPI();
  return useSWR(
    shouldFetch ? `${api}/${V1}/safes/${address}` : null,
    validSafeFetcher()
  );
}

export async function isValidSafe(
  address: string,
  network = "Ethereum" as SupportedSafeNetwork
) {
  const api = safeNetworkAPI(network);
  return fetchSafeWithAddress(`${api}/${V1}/safes/${address}`);
}

export function useSafeBalances(address: string, shouldFetch: boolean = true) {
  const api = useSafeNetworkAPI();
  return useSWR<SafeBalanceUsdResponse[], Error>(
    shouldFetch
      ? `${api}/${V1}/safes/${address}/balances?trusted=true&exclude_spam=true`
      : null,
    basicFetcher(),
    { shouldRetryOnError: false }
  );
}
