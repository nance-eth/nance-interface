import { GovernanceEvent, GovernanceEventName } from "@nance/nance-sdk";
import { addDays, format } from "date-fns";

// FIXME: this may only works for juicebox space, try replace it with cycleStageLengths
const CYCLE_LENGTH = 14; // days

export function dateRangesOfCycles({
  cycle,
  length,
  currentCycle,
  cycleStartDate: nextCycleStartDate,
}: {
  cycle?: number;
  length?: number;
  currentCycle?: number;
  cycleStartDate?: string;
}) {
  if (!cycle || !nextCycleStartDate || !length || !currentCycle) return "";

  const startDate = addDays(
    new Date(nextCycleStartDate),
    (cycle - currentCycle - 1) * CYCLE_LENGTH
  );
  const endDate = addDays(startDate, length * CYCLE_LENGTH);
  console.debug("dateRanges", {
    cycle,
    length,
    currentCycle,
    currentCycleStartDate: nextCycleStartDate,
    startDate,
    endDate,
  });

  return `${format(startDate, "MM/dd/yy")} - ${format(endDate, "MM/dd/yy")}`;
}

export function getEarliestStartCycle(
  currentCycle: number,
  currentDateEvent: GovernanceEvent
) {
  // we may still get proposal passed this cycle if we are still at Temp-check stage
  //   otherwise the proposal may only passed next cycle and take effect next next cycle
  return currentDateEvent === GovernanceEventName[0]
    ? currentCycle + 1
    : currentCycle + 2;
}
