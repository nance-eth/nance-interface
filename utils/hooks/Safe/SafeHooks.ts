import useSWR from "swr";
import { SafeBalanceUsdResponse, SafeInfoResponse } from "@/models/SafeTypes";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import Safe, {
  EthSafeSignature,
  SafeTransactionOptionalProps,
  estimateTxBaseGas,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  SafeSignature,
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
import { zeroAddress } from "viem";

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

// check https://github.com/safe-global/safe-core-sdk/blob/a9e595af13d1b8b8190c7088dcedd8d90b003c27/packages/protocol-kit/src/utils/transactions/gas.ts#L44
const GAS_COST_PER_SIGNATURE = 7040;

const BUFFER = 5000;

export function useCreateTransactionForSimulation(
  safeAddress: string,
  safeTransactionData: MetaTransactionData[],
  refundGas: boolean = true
) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();
  const [encodedTransaction, setEncodedTransaction] = useState<string>();

  const { value: safe, error: safeError } = useSafe(safeAddress);
  const { data: safeInfo } = useSafeInfo(safeAddress, !!safeAddress);
  const firstOwnerAddress = safeInfo?.owners?.[0] || zeroAddress;

  useEffect(() => {
    const fetch = async () => {
      // check
      if (!safe) {
        setError(safeError || "Not connected to wallet or safe not found.");
        return;
      }

      // reset state
      setLoading(true);
      setError(undefined);
      setSafeTransaction(undefined);
      setEncodedTransaction(undefined);

      // core logic
      const optionsFirstPass: SafeTransactionOptionalProps = {
        gasPrice: refundGas ? MAX_REFUND_GAS_PRICE || "0" : undefined, // If gasPrice > 0, Safe contract will refund gasUsed.
      };
      // this pass we can get safeTxGas
      const transactionFirstPass = await safe.createTransaction({
        transactions: safeTransactionData,
        options: optionsFirstPass,
        onlyCalls: true,
      });
      const baseGas = Number(
        await estimateTxBaseGas(safe, transactionFirstPass)
      );
      const extraSignatureGas =
        GAS_COST_PER_SIGNATURE * ((safeInfo?.threshold || 1) - 1);
      const options: SafeTransactionOptionalProps = {
        ...optionsFirstPass,
        // The final recommended gas limit is based on the total of the above plus a buffer.
        // For the buffer we double the total, as some internal calls require a higher intermediate gas limit
        //   as not all gas can be forwarded to the next internal call (“all but one 64th” of EIP-150)
        safeTxGas: (
          BigInt(2) * BigInt(transactionFirstPass.data.safeTxGas)
        ).toString(),
        baseGas: (baseGas - extraSignatureGas + BUFFER).toFixed(), // to cover gas cost for operations other than execute, like signature check
      };
      const transaction = await safe.createTransaction({
        transactions: safeTransactionData,
        options,
        onlyCalls: true,
      });
      transaction.addSignature(
        generatePreValidatedSignature(firstOwnerAddress)
      );
      const encoded = await safe.getEncodedTransaction(transaction);

      // set state
      setSafeTransaction(transaction);
      setEncodedTransaction(encoded);
    };

    fetch()
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [safe, safeTransactionData]);

  return {
    safeTransaction,
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

    try {
      // core logic
      const optionsFirstPass: SafeTransactionOptionalProps = {
        gasPrice: refundGas ? MAX_REFUND_GAS_PRICE || "0" : undefined, // If gasPrice > 0, Safe contract will refund gasUsed.
      };
      // this pass we can get safeTxGas
      const transactionFirstPass = await safe.createTransaction({
        transactions: safeTransactionData,
        options: optionsFirstPass,
        onlyCalls: true,
      });
      const baseGas = Number(
        await estimateTxBaseGas(safe, transactionFirstPass)
      );
      const options: SafeTransactionOptionalProps = {
        ...optionsFirstPass,
        // The final recommended gas limit is based on the total of the above plus a buffer.
        // For the buffer we double the total, as some internal calls require a higher intermediate gas limit
        //   as not all gas can be forwarded to the next internal call (“all but one 64th” of EIP-150)
        safeTxGas: (
          BigInt(2) * BigInt(transactionFirstPass.data.safeTxGas)
        ).toString(),
        baseGas: (baseGas + BUFFER).toFixed(), // to cover gas cost for operations other than execute, like signature check
      };
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
