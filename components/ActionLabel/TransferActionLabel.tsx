import { getContractLabel } from "@/constants/Contract";
import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import { Transfer } from "@/models/NanceTypes";
import FormattedAddress from "@/components/Address/FormattedAddress";

export default function TransferActionLabel({
  transfer,
}: {
  transfer: Transfer;
}) {
  return (
    <span className="line-clamp-5">
      {numToPrettyString(Number(transfer.amount))}
      &nbsp;{getContractLabel(transfer.contract)}
      &nbsp;to
      <FormattedAddress address={transfer.to} style="inline ml-1" />
    </span>
  );
}