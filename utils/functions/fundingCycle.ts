import {
  JBConstants,
  JBSplit,
  V2V3FundingCycleMetadata,
} from "@/models/JuiceboxTypes";
import { formatCurrency } from "@/utils/functions/juicebox";

export interface FundingCycleArgs {
  configuration: bigint;
  discountRate: bigint;
  ballot: string;
  currency: bigint;
  target: bigint;
  duration: bigint;
  fee: bigint;
  weight: bigint;
}

export interface MetadataArgs {
  // also bonding curve
  redemptionRate: bigint;
  reservedRate: bigint;
  // also payIsPaused
  pausePay: boolean;
  // also ticketPrintingIsAllowed
  allowMinting: boolean;
  allowTerminalMigration: boolean;
  allowControllerMigration: boolean;
  global: {
    pauseTransfers?: boolean;
  };
}

export interface FundingCycleConfigProps {
  version: number;
  fundingCycle: FundingCycleArgs;
  metadata: V2V3FundingCycleMetadata | undefined;
  payoutMods: JBSplit[];
  ticketMods: JBSplit[];
}

export function calculateSplitAmount(percent: bigint, target: bigint) {
  const _totalPercent = JBConstants.TotalPercent.Splits[2];
  const amount = (target * percent) / BigInt(_totalPercent);
  const ret = amount / ETHER;
  return Number(ret);
}

const ETHER = BigInt("1000000000000000000");

export function splitAmount2Percent(target: bigint, amount: number) {
  if (amount <= 0) {
    return BigInt(0);
  }
  const totalPercent = BigInt(JBConstants.TotalPercent.Splits[2]);
  const percent = (ETHER * totalPercent * BigInt(amount)) / target;
  return percent;
}

export function isEqualPayoutSplit(
  percent: bigint,
  currency: bigint,
  target: bigint,
  newPercent: bigint,
  newCurrency: bigint,
  newTarget: bigint
) {
  if (!percent || !newPercent) return undefined;

  const _totalPercent = BigInt(JBConstants.TotalPercent.Splits[2]);

  if (target == JBConstants.UintMax && newTarget == JBConstants.UintMax) {
    return percent == newPercent;
  } else if (
    target != JBConstants.UintMax &&
    newTarget != JBConstants.UintMax
  ) {
    const amount = formatCurrency(currency, (target * percent) / _totalPercent);
    const newAmount = formatCurrency(
      newCurrency,
      (newTarget * newPercent) / _totalPercent
    );
    return amount === newAmount;
  } else {
    return false;
  }
}

function divAndToFixed2(a: bigint, b: bigint) {
  const mul10k = a * BigInt(10000);
  const divByB = Number(mul10k / b);
  return (divByB / 100).toFixed(2);
}

export function formattedSplit(
  percent: bigint,
  currency: bigint,
  target: bigint,
  version: number
) {
  if (!percent) return undefined;

  const _totalPercent = BigInt(JBConstants.TotalPercent.Splits[version - 1]);

  if (target == JBConstants.UintMax) {
    return `${divAndToFixed2(percent, _totalPercent)}%`;
  }

  const finalAmount = (target * percent) / _totalPercent;
  return `${divAndToFixed2(percent, _totalPercent)}% (${formatCurrency(
    currency,
    finalAmount
  )})`;
}
