import { payout2JBSplit } from "@/utils/functions/juicebox";
import { Action, getPayoutCountAmount } from "@nance/nance-sdk";
import JBSplitEntry from "@/components/JuiceboxCard/JBSplitEntry";
import GovernanceCyclesInfoLabel from "./GovernanceCyclesInfoLabel";

export default function PayoutActionLabel({ action }: { action: Action }) {
  const { amount, count } = getPayoutCountAmount(action);
  const total = (amount * count).toLocaleString();

  return (
    <span className="">
      ${Number(amount).toLocaleString()}
      &nbsp;to
      <JBSplitEntry mod={payout2JBSplit(action)} />
      <GovernanceCyclesInfoLabel action={action} />
    </span>
  );
}
