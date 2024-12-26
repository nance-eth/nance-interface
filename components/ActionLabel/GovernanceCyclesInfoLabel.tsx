import { SpaceContext } from "@/context/SpaceContext";
import { dateRangesOfCycles } from "@/utils/functions/GovernanceCycle";
import { Action, getPayoutCountAmount } from "@nance/nance-sdk";
import { useContext } from "react";
import { ProposalContext } from "../Proposal/context/ProposalContext";
import TooltipInfo from "../common/TooltipInfo";

export default function GovernanceCyclesInfoLabel({
  action,
}: {
  action: Action;
}) {
  const { commonProps } = useContext(ProposalContext);
  const spaceInfo = useContext(SpaceContext);

  const proposalCycle = commonProps.governanceCycle || 0;
  const actionCycleStart = action?.governanceCycles?.[0];
  const cycle = actionCycleStart || proposalCycle + 1;

  const cycleStartDate = spaceInfo?.cycleStartDate;
  const { count: payoutCount } = getPayoutCountAmount(action);
  const count = payoutCount || 1;
  const dateRanges = dateRangesOfCycles({
    cycle,
    length: count,
    currentCycle: spaceInfo?.currentCycle,
    cycleStartDate: cycleStartDate as string,
  });

  if (action.pollRequired) {
    return null;
  }

  return (
    <div className="inline-block">
      <TooltipInfo content={dateRanges}>
        {count > 1 && `for ${count} cycles`}
      </TooltipInfo>
    </div>
  );
}
