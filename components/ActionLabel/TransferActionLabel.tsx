import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import { Action, Transfer } from "@nance/nance-sdk";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import TokenSymbol from "../AddressCard/TokenSymbol";
import GovernanceCyclesInfoLabel from "./GovernanceCyclesInfoLabel";

export default function TransferActionLabel({ action }: { action: Action }) {
  const transfer = action.payload as Transfer;
  const { data } = useReadContract({
    address: transfer.contract as `0x${string}`,
    abi: erc20Abi,
    functionName: "symbol",
    chainId: action.chainId || 1,
  });

  const amount = transfer.amount.toString(); // transfer.amount can be number type, use toString to make sure it be string
  return (
    <span className="line-clamp-5">
      {numToPrettyString(amount, "auto")}
      &nbsp;
      <TokenSymbol address={transfer.contract} />
      &nbsp;to
      <div className="mx-1 inline-block">
        <FormattedAddress
          address={transfer.to}
          style="inline"
          minified
          copyable
        />
      </div>
      <GovernanceCyclesInfoLabel action={action} />
    </span>
  );
}
