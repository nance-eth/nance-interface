import { formatDistanceToNowStrict, toDate } from "date-fns";
import { useMultisigTransactions } from "@/utils/hooks/Safe/SafeHooks";
import SearchableComboBox, {
  Option,
} from "@/components/common/SearchableComboBox";
import {
  SafeTransactionsResponse,
  SafetransactionsResponseResult,
} from "@/models/SafeTypes";
import { useQueryParams, withDefault, StringParam } from "next-query-params";
import { useEffect } from "react";

export type TxOption = Option & { tx: SafetransactionsResponseResult };
export type AddressMap = { [address: string]: string };

export function SafeTransactionSelector({
  safeAddress,
  val,
  setVal,
  addressMap = {},
}: {
  safeAddress: string;
  val: TxOption | undefined;
  setVal: (val: TxOption) => void;
  addressMap?: AddressMap;
}) {
  const [query, setQuery] = useQueryParams({
    safeTxHash: withDefault(StringParam, ""),
  });

  const { data: txns, isLoading } = useMultisigTransactions(safeAddress, 20);

  const convertToOptions = (
    res: SafeTransactionsResponse | undefined,
    status: boolean
  ) => {
    if (!res) return [];
    return res.results.map((tx) => {
      const txTo = tx.transaction.txInfo.to.value;
      const addressLabel = addressMap[txTo] ? `${addressMap[txTo]}.` : "";
      return {
        id: tx.transaction.id,
        label: `Tx ${tx.transaction.executionInfo.nonce} ${addressLabel}${
          tx.transaction.txInfo.methodName || "unknown"
        }`,
        extraLabel: formatDistanceToNowStrict(
          toDate(tx.transaction.timestamp),
          {
            addSuffix: true,
          }
        ),
        status,
        tx: tx,
      };
    });
  };
  const options = convertToOptions(txns, true);

  // read safeTxHash from query and setSelected if it's not already selected
  useEffect(() => {
    if (query.safeTxHash !== "" && val?.id !== query.safeTxHash) {
      const tx = options.find((o) => o.id === query.safeTxHash);
      if (tx) {
        setVal(tx);
      }
    }
  }, [query.safeTxHash, options]);

  return (
    <SearchableComboBox
      val={val}
      setVal={(v) => {
        setVal(v);
        setQuery({ safeTxHash: v?.id });
      }}
      options={options}
      label={isLoading ? "loading..." : "Load Safe Transaction"}
    />
  );
}
