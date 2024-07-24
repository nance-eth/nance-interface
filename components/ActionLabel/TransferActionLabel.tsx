import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import { Transfer } from "@nance/nance-sdk";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { useReadContract } from "wagmi";
import { getChainById } from "config/custom-chains";
import { erc20Abi } from "viem";

export default function TransferActionLabel({
  transfer,
}: {
  transfer: Transfer;
}) {
  const { data } = useReadContract({
    address: transfer.contract as `0x${string}`,
    abi: erc20Abi,
    functionName: "symbol",
    chainId: transfer.chainId,
  });

  const chain = getChainById(transfer.chainId);
  const explorer = `${chain.blockExplorers?.default?.url}/token/${transfer.contract}`;
  const symbol = transfer.contract !== "ETH" ? `$${data}` : "ETH";
  const fixed = transfer.amount.includes(".")
    ? transfer.amount.split(".")[1].replace(/0+$/, "").length
    : 0; // get mantissa length
  return (
    <span className="line-clamp-5">
      {numToPrettyString(Number(transfer.amount), fixed)}
      &nbsp;
      <a href={explorer} target="_blank" rel="noreferrer">
        {symbol}
      </a>
      &nbsp;to
      <div className="mx-1 inline-block">
        <FormattedAddress
          address={transfer.to}
          style="inline ml-1"
          minified
          copyable
        />
      </div>
    </span>
  );
}
