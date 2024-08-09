import { payout2JBSplit } from "@/utils/functions/juicebox";
import { Action, getPayoutCountAmount } from "@nance/nance-sdk";
import JBSplitEntry from "@/components/JuiceboxCard/JBSplitEntry";
import { useContext } from "react";
import { ProposalContext } from "../Proposal/context/ProposalContext";
import { dateRangesOfCycles } from "@/utils/functions/GovernanceCycle";
import { SpaceContext } from "@/context/SpaceContext";

export default function PayoutActionLabel({ action }: { action: Action }) {
  const { commonProps } = useContext(ProposalContext);
  const spaceInfo = useContext(SpaceContext);

  const cycle = commonProps.governanceCycle || 0;
  const cycleStartDate = spaceInfo?.cycleStartDate;
  const { amount, count } = getPayoutCountAmount(action);
  const dateRanges = dateRangesOfCycles({
    cycle: cycle + 1,
    length: count,
    currentCycle: spaceInfo?.currentCycle,
    cycleStartDate: cycleStartDate as string,
  });
  const total = (amount * count).toLocaleString();

  return (
    <div className="flex flex-col">
      <span className="line-clamp-5">
        ${Number(amount).toLocaleString()}
        &nbsp;to
        <JBSplitEntry mod={payout2JBSplit(action)} />
        {`for ${count} cycles`} (
        <span className="font-mono text-sm">{dateRanges}</span>)
      </span>
      <div className="font-semibold italic text-emerald-600">
        Total Amount: ${total}
      </div>
    </div>
  );
}
