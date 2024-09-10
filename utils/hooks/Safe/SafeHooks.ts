import useSWR from "swr";
import { SafeBalanceUsdResponse, SafeInfoResponse } from "@/models/SafeTypes";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import Safe, {
  EthSafeSignature,
  SafeTransactionOptionalProps,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  SafeSignature,
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
import { toBytes, zeroAddress } from "viem";

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
    if (!address) {
      setError("no wallet connected");
      return;
    }
    if (!safeAddress) {
      setError("safeAddress can't be empty");
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

const MAX_REFUND_GAS_PRICE = "60000000000"; // 60 Gwei

function generatePreValidatedSignature(ownerAddress: string): SafeSignature {
  const signature =
    "0x000000000000000000000000" +
    ownerAddress.slice(2) +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "01";

  return new EthSafeSignature(ownerAddress, signature);
}

function calculateBaseGas(signatureLength: number, data: string = "") {
  // based on https://help.safe.global/en/articles/40828-gas-estimation
  const baseTxGas = 21000;
  //Each non-zero byte costs 16 gas and each zero byte 4 gas.
  const dataGas = toBytes(data).length * 4;
  const signatureCheckGas = 7000 * signatureLength;
  const refundGas = 22000;

  return baseTxGas + dataGas + signatureCheckGas + refundGas;
}

export function useCreateTransactionForSimulation(
  safeAddress: string,
  safeTransactionData: MetaTransactionData[],
  refundGas: boolean = true
) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  //const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();
  const [encodedTransaction, setEncodedTransaction] = useState<string>();

  const { value: safe, error: safeError } = useSafe(safeAddress);
  const { data: safeInfo } = useSafeInfo(safeAddress, !!safeAddress);
  const firstOwnerAddress = safeInfo?.owners?.[0] || zeroAddress;

  useEffect(() => {
    if (!safe) {
      setError(safeError || "Not connected to wallet or safe not found.");
      return;
    }

    setLoading(true);
    setError(undefined);
    setEncodedTransaction(undefined);

    const options: SafeTransactionOptionalProps = {
      gasPrice: refundGas ? MAX_REFUND_GAS_PRICE || "0" : undefined, // If gasPrice > 0, Safe contract will refund gasUsed.
      baseGas: calculateBaseGas(
        1,
        safeTransactionData
          .map((d) => d.data)
          .reduce((sum, current) => sum + current, "")
      ).toString(), // to cover gas cost for operations other than execute, like signature check
    };

    safe
      .createTransaction({
        transactions: safeTransactionData,
        options,
        onlyCalls: true,
      })
      .then((safeTransaction) => {
        safeTransaction.addSignature(
          generatePreValidatedSignature(firstOwnerAddress)
        );
        return safe.getEncodedTransaction(safeTransaction);
      })
      .then((encoded) => setEncodedTransaction(encoded))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [safe, safeTransactionData]);

  return {
    encodedTransaction,
    error,
    loading,
  };
}

export function useQueueTransaction(
  safeAddress: string,
  safeTransactionData: MetaTransactionData[],
  nonce?: number,
  refundGas: boolean = true
) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<{ safeTxHash: string; nonce: string }>();

  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { value: safeApiKit } = useSafeAPIKit();
  const { value: safe } = useSafe(safeAddress);
  const { data: safeInfo } = useSafeInfo(safeAddress, !!safeAddress);

  const trigger = async () => {
    if (!safe || !walletClient || !safeApiKit || !address) {
      setError("Not connected to wallet or safe not found.");
      return;
    }

    setLoading(true);
    setError(undefined);
    setValue(undefined);

    const options: SafeTransactionOptionalProps = {
      nonce, // Optional
      gasPrice: refundGas ? MAX_REFUND_GAS_PRICE || "0" : undefined, // If gasPrice > 0, Safe contract will refund gasUsed.
      baseGas: calculateBaseGas(
        safeInfo?.threshold || 1,
        safeTransactionData
          .map((d) => d.data)
          .reduce((sum, current) => sum + current, "")
      ).toString(), // to cover gas cost for operations other than execute, like signature check
    };

    try {
      const safeTransaction = await safe.createTransaction({
        transactions: safeTransactionData,
        options,
        onlyCalls: true,
      });
      const senderAddress = address;
      const safeTxHash = await safe.getTransactionHash(safeTransaction);
      const signature = await safe.signTypedData(safeTransaction);

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
