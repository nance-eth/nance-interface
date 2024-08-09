import { payout2JBSplit } from "@/utils/functions/juicebox";
import { Action, getPayoutCountAmount } from "@nance/nance-sdk";
import JBSplitEntry from "@/components/JuiceboxCard/JBSplitEntry";
import GovernanceCyclesInfoLabel from "./GovernanceCyclesInfoLabel";

export default function PayoutActionLabel({ action }: { action: Action }) {
  const { amount, count } = getPayoutCountAmount(action);
  const total = (amount * count).toLocaleString();

  return (
    <div className="flex flex-col">
      <span className="line-clamp-5">
        ${Number(amount).toLocaleString()}
        &nbsp;to
        <JBSplitEntry mod={payout2JBSplit(action)} />
        <GovernanceCyclesInfoLabel action={action} />
      </span>
      <div className="font-semibold italic text-emerald-600">
        Total Amount: ${total}
      </div>
    </div>
  );
}
