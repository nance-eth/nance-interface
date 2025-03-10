/* eslint-disable max-lines */
import { BigNumber, Contract, utils } from "ethers";
import {
  FundingCycleConfigProps,
  formattedSplit,
  calculateSplitAmount,
  splitAmount2Percent,
  isEqualPayoutSplit,
} from "./fundingCycle";
import { ZERO_ADDRESS } from "../../constants/Contract";
import {
  CURRENCY_USD,
  ETH_TOKEN_ADDRESS,
  JBConstants,
  JBFundingCycleData,
  JBSplit,
} from "../../models/JuiceboxTypes";
import {
  SQLPayout,
  Action,
  Payout,
  JBSplitStruct,
  getPayoutCountAmount,
} from "@nance/nance-sdk";
import { getAddress, parseEther } from "viem";
import { SectionTableData } from "../../components/form/DiffTableWithSection";
import { diff2TableEntry } from "@/components/JuiceboxCard/JBSplitEntry";

function mulDiv(a: bigint, b: bigint, denominator: bigint) {
  return (a * b) / denominator;
}

function formatEtherCommify(wei: bigint) {
  return utils.commify(Math.round(Number(wei / parseEther("0.01")) / 100));
}

// In v1, ETH = 0, USD = 1
// In v2, ETH = 1, USD = 2, we subtract 1 to get the same value
export const formatCurrency = (currency: bigint, amount: bigint) => {
  const symbol = currency == BigInt(0) ? "Ξ" : "$";
  const formatted =
    amount > JBConstants.UintMax ? "∞" : formatEtherCommify(amount ?? 0);
  return symbol + formatted;
};

function compareBN(a: bigint | undefined, b: bigint | undefined) {
  a = a ?? BIG_ZERO;
  b = b ?? BIG_ZERO;

  return a == b ? "Keep" : "Edit";
}

function getBooleanLabel(enable: boolean | undefined) {
  return enable ? "Enabled" : "Disabled";
}

function compareBoolean(a: boolean | undefined, b: boolean | undefined) {
  return a === b ? "Keep" : "Edit";
}

// ====== Split ======

export function isEqualJBSplit(a: JBSplit, b: JBSplit) {
  return (
    a.allocator === b.allocator &&
    a.beneficiary === b.beneficiary &&
    a.lockedUntil == b.lockedUntil &&
    a.percent == b.percent &&
    a.preferAddToBalance === b.preferAddToBalance &&
    a.preferClaimed === b.preferClaimed &&
    a.projectId == b.projectId
  );
}

export const keyOfSplit = (mod: JBSplit) =>
  `${getAddress(mod.beneficiary || ZERO_ADDRESS)}-${mod.projectId}-${
    mod.allocator
  }`;
export const keyOfPayout2Split = (mod: Payout) =>
  `${getAddress(mod.address || ZERO_ADDRESS)}-${
    mod.project ?? 0
  }-${ZERO_ADDRESS}`;
export const keyOfNanceSplit2Split = (mod: JBSplitStruct) =>
  `${getAddress(mod.beneficiary || ZERO_ADDRESS)}-${mod.projectId}-${
    mod.allocator
  }`;
export const keyOfNancePayout2Split = (mod: SQLPayout) =>
  `${getAddress(mod.payAddress || ZERO_ADDRESS)}-${mod.payProject ?? 0}-${
    mod.payAllocator || ZERO_ADDRESS
  }`;

// ====== Split Diff ======

export interface SplitDiffEntry {
  split: JBSplit;
  oldVal: string;
  newVal: string;
  proposalId: number;
  amount: number;
}

interface SplitDiff {
  expire: {
    [key: string]: SplitDiffEntry;
  };
  new: {
    [key: string]: SplitDiffEntry;
  };
  change: {
    [key: string]: SplitDiffEntry;
  };
  keep: {
    [key: string]: SplitDiffEntry;
  };
  newTotal: bigint;
}

const BIG_ZERO = BigInt(0);

// Update percent in JBSplit struct, because we have new distributionLimit
function percentUpdaterFrom(
  newLimitBG: bigint,
  currency: bigint,
  version: number
) {
  return (entry: SplitDiffEntry) => {
    const newPercent = splitAmount2Percent(newLimitBG, entry.amount);
    entry.split = {
      ...entry.split,
      percent: newPercent,
    };
    entry.newVal =
      formattedSplit(newPercent, currency, newLimitBG, version) || "";
  };
}

export function compareRules(
  config: FundingCycleConfigProps,
  newConfig: FundingCycleConfigProps | undefined
): SectionTableData[] {
  if (!newConfig) return [];

  const discountRateDenominator = BigInt(
    JBConstants.TotalPercent.DiscountRate[2]
  );
  const reservedRateDenominator = BigInt(
    JBConstants.TotalPercent.ReservedRate[2]
  );

  const weight = config.fundingCycle.weight || BIG_ZERO;
  const discountRate = config.fundingCycle.discountRate || BIG_ZERO;
  const reservedRate = config.metadata?.reservedRate || BIG_ZERO;
  const redemptionRate = config.metadata?.redemptionRate || BIG_ZERO;
  let newWeight = newConfig.fundingCycle.weight || BIG_ZERO;
  const newDiscountRate = newConfig.fundingCycle.discountRate || BIG_ZERO;
  const newReservedRate = newConfig.metadata?.reservedRate || BIG_ZERO;
  const newRedemptionRate = newConfig.metadata?.redemptionRate || BIG_ZERO;

  // weight 0 means inherit from last cycle
  // weight 1 means set the weight to actually 0
  const weightSpecified = newWeight !== BigInt(0);
  const weightNotChangeWithMagicOne =
    weight == BigInt(0) && newWeight == BigInt(1);
  newWeight = weightSpecified
    ? newWeight
    : mulDiv(
      weight,
      discountRateDenominator - discountRate,
      discountRateDenominator
    );

  // Payer gets what left after reserved tokens are issued.
  const payerWeight =
    weight - mulDiv(weight, reservedRate, reservedRateDenominator);
  const newPayerWeight =
    newWeight - mulDiv(newWeight, newReservedRate, reservedRateDenominator);
  // For display, 0.01 % precision
  const discountRateLabel =
    (
      (Number(discountRate) / JBConstants.TotalPercent.DiscountRate[2]) *
      100
    ).toFixed(2) + "%";
  const reservedRateLabel =
    (
      (Number(reservedRate) / JBConstants.TotalPercent.ReservedRate[2]) *
      100
    ).toFixed(2) + "%";
  const redemptionRateLabel =
    (
      (Number(redemptionRate) / JBConstants.TotalPercent.RedemptionRate[2]) *
      100
    ).toFixed(2) + "%";
  const newDiscountRateLabel =
    (
      (Number(newDiscountRate) / JBConstants.TotalPercent.DiscountRate[2]) *
      100
    ).toFixed(2) + "%";
  const newReservedRateLabel =
    (
      (Number(newReservedRate) / JBConstants.TotalPercent.ReservedRate[2]) *
      100
    ).toFixed(2) + "%";
  const newRedemptionRateLabel =
    (
      (Number(newRedemptionRate) / JBConstants.TotalPercent.RedemptionRate[2]) *
      100
    ).toFixed(2) + "%";

  return [
    {
      section: "Cycle",
      entries: [
        {
          id: "duration",
          title: "Duration",
          proposal: 0,
          oldVal:
            (config.fundingCycle.duration / BigInt(86400)).toString() + " days",
          newVal:
            (newConfig.fundingCycle.duration / BigInt(86400)).toString() +
            " days",
          status: compareBN(
            config.fundingCycle.duration,
            newConfig.fundingCycle.duration
          ),
          valueToBeSorted: 0,
        },
        {
          id: "payouts",
          title: "Payouts",
          proposal: 0,
          oldVal: formatCurrency(
            config.fundingCycle.currency,
            config.fundingCycle.target
          ),
          newVal: formatCurrency(
            newConfig.fundingCycle.currency,
            newConfig.fundingCycle.target
          ),
          status:
            config.fundingCycle.currency == newConfig.fundingCycle.currency &&
            config.fundingCycle.target == newConfig.fundingCycle.target
              ? "Keep"
              : "Edit",
          valueToBeSorted: 0,
        },
        {
          id: "editDeadline",
          title: "Edit Deadline",
          proposal: 0,
          oldVal: config.fundingCycle.ballot,
          newVal: newConfig.fundingCycle.ballot,
          status:
            config.fundingCycle.ballot === newConfig.fundingCycle.ballot
              ? "Keep"
              : "Edit",
          valueToBeSorted: 0,
        },
      ],
    },
    {
      section: "Token",
      entries: [
        {
          id: "totalIssuanceRate",
          title: "Total issuance rate",
          proposal: 0,
          oldVal: formatEtherCommify(weight),
          newVal: formatEtherCommify(newWeight),
          status: weightNotChangeWithMagicOne
            ? "Keep"
            : compareBN(weight, newWeight),
          valueToBeSorted: 0,
        },
        {
          id: "payerIssuanceRate",
          title: "Payer issuance rate",
          proposal: 0,
          oldVal: formatEtherCommify(payerWeight),
          newVal: formatEtherCommify(newPayerWeight),
          status: weightNotChangeWithMagicOne
            ? "Keep"
            : compareBN(payerWeight, newPayerWeight),
          valueToBeSorted: 0,
        },
        {
          id: "reservedRate",
          title: "Reserved rate",
          proposal: 0,
          oldVal: reservedRateLabel,
          newVal: newReservedRateLabel,
          status: compareBN(reservedRate, newReservedRate),
          valueToBeSorted: 0,
        },
        {
          id: "issuanceReductionRate",
          title: "Issuance reduction rate",
          proposal: 0,
          oldVal: discountRateLabel,
          newVal: newDiscountRateLabel,
          status: compareBN(discountRate, newDiscountRate),
          valueToBeSorted: 0,
        },
        {
          id: "redemptionRate",
          title: "Redemption rate",
          proposal: 0,
          oldVal: redemptionRateLabel,
          newVal: newRedemptionRateLabel,
          status: compareBN(redemptionRate, newRedemptionRate),
          valueToBeSorted: 0,
        },
        {
          id: "ownerTokenMinting",
          title: "Owner token minting",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.allowMinting),
          newVal: getBooleanLabel(newConfig.metadata?.allowMinting),
          status: compareBoolean(
            config.metadata?.allowMinting,
            newConfig.metadata?.allowMinting
          ),
          valueToBeSorted: 0,
        },
        {
          id: "tokenTransfers",
          title: "Token transfers",
          proposal: 0,
          // @ts-ignore we do have pauseTransfers
          oldVal: getBooleanLabel(!config.metadata?.global.pauseTransfers),
          // @ts-ignore
          newVal: getBooleanLabel(!newConfig.metadata?.global.pauseTransfers),
          status: compareBoolean(
            // @ts-ignore
            config.metadata?.global.pauseTransfers,
            // @ts-ignore
            newConfig.metadata?.global.pauseTransfers
          ),
          valueToBeSorted: 0,
        },
      ],
    },
    {
      section: "Other Rules",
      entries: [
        {
          id: "paymentToThisProject",
          title: "Payment to this project",
          proposal: 0,
          oldVal: getBooleanLabel(!config.metadata?.pausePay),
          newVal: getBooleanLabel(!newConfig.metadata?.pausePay),
          status: compareBoolean(
            config.metadata?.pausePay,
            newConfig.metadata?.pausePay
          ),
          valueToBeSorted: 0,
        },
        {
          id: "holdFees",
          title: "Hold fees",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.holdFees),
          newVal: getBooleanLabel(newConfig.metadata?.holdFees),
          status: compareBoolean(
            config.metadata?.holdFees,
            newConfig.metadata?.holdFees
          ),
          valueToBeSorted: 0,
        },
        {
          id: "setPaymentTerminals",
          title: "Set payment terminals",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.global.allowSetTerminals),
          newVal: getBooleanLabel(newConfig.metadata?.global.allowSetTerminals),
          status: compareBoolean(
            config.metadata?.global.allowSetTerminals,
            newConfig.metadata?.global.allowSetTerminals
          ),
          valueToBeSorted: 0,
        },
        {
          id: "setController",
          title: "Set controller",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.global.allowSetController),
          newVal: getBooleanLabel(
            newConfig.metadata?.global.allowSetController
          ),
          status: compareBoolean(
            config.metadata?.global.allowSetController,
            newConfig.metadata?.global.allowSetController
          ),
          valueToBeSorted: 0,
        },
        {
          id: "migratePaymentTerminal",
          title: "Migrate payment terminal",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.allowTerminalMigration),
          newVal: getBooleanLabel(newConfig.metadata?.allowTerminalMigration),
          status: compareBoolean(
            config.metadata?.allowTerminalMigration,
            newConfig.metadata?.allowTerminalMigration
          ),
          valueToBeSorted: 0,
        },
        {
          id: "migrateController",
          title: "Migrate controller",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.allowControllerMigration),
          newVal: getBooleanLabel(newConfig.metadata?.allowControllerMigration),
          status: compareBoolean(
            config.metadata?.allowControllerMigration,
            newConfig.metadata?.allowControllerMigration
          ),
          valueToBeSorted: 0,
        },
      ],
    },
  ];
}

export function comparePayouts(
  config: FundingCycleConfigProps,
  newConfig: FundingCycleConfigProps | undefined,
  oldPayouts: JBSplit[],
  newPayouts: JBSplit[]
) {
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: newConfig?.fundingCycle.target || BIG_ZERO,
  };
  if (!newConfig) return diff;

  const newPayoutsMap = new Map<string, JBSplit>();
  newPayouts.forEach((payout) => newPayoutsMap.set(keyOfSplit(payout), payout));

  const isInfiniteLimit = config.fundingCycle.target >= JBConstants.UintMax;

  // Calculate diff
  oldPayouts.forEach((split) => {
    const key = keyOfSplit(split);
    const newSplit = newPayoutsMap.get(key);
    const entry = {
      split: newSplit || split,
      proposalId: 0,
      oldVal:
        formattedSplit(
          split.percent || BIG_ZERO,
          config.fundingCycle.currency,
          config.fundingCycle.target,
          config.version
        ) || "",
      newVal: "",
      amount: 0,
    };

    if (newSplit) {
      // keep or change
      const equal = isEqualPayoutSplit(
        split.percent,
        config.fundingCycle.currency,
        config.fundingCycle.target,
        newSplit.percent,
        newConfig.fundingCycle.currency,
        newConfig.fundingCycle.target
      );

      const newEntry = {
        ...entry,
        newVal:
          formattedSplit(
            newSplit.percent || BIG_ZERO,
            newConfig.fundingCycle.currency,
            newConfig.fundingCycle.target,
            newConfig.version
          ) || "",
        amount: calculateSplitAmount(
          newSplit.percent,
          newConfig.fundingCycle.target
        ),
      };

      if (equal) {
        diff.keep[key] = newEntry;
      } else {
        diff.change[key] = newEntry;
      }
    } else {
      // expire
      diff.expire[key] = entry;
    }

    // Remove map entry so it won't get calculated twice later
    newPayoutsMap.delete(key);
  });

  newPayoutsMap.forEach((split, key) => {
    // New entry
    const amount = calculateSplitAmount(
      split.percent,
      newConfig.fundingCycle.target
    );
    diff.new[key] = {
      split,
      proposalId: 0,
      oldVal: "",
      newVal:
        formattedSplit(
          split.percent || BIG_ZERO,
          newConfig.fundingCycle.currency,
          newConfig.fundingCycle.target,
          newConfig.version
        ) || "",
      amount,
    };
  });

  //console.debug("payoutsCompare.final", { diff, isInfiniteLimit });
  return diff;
}

export function mergePayouts(
  config: FundingCycleConfigProps,
  currentCycle: number | undefined,
  onchainPayouts: JBSplit[],
  registeredPayouts: SQLPayout[],
  actionPayouts: { pid: number; action: Action }[] = []
) {
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: config.fundingCycle.target,
  };

  // Maps
  const registeredPayoutMap = new Map<string, SQLPayout>();
  const actionPayoutMap = new Map<string, { pid: number; action: Action }>();
  registeredPayouts.forEach((payout) =>
    registeredPayoutMap.set(keyOfNancePayout2Split(payout), payout)
  );
  actionPayouts.forEach((action) =>
    actionPayoutMap.set(
      keyOfPayout2Split(action.action.payload as Payout),
      action
    )
  );
  //console.debug("payoutsDiffOf.start", onchainPayouts, registeredPayoutMap, actionPayoutMap);

  // Calculate diff
  //  abc.eth 20% => 100u
  //  1. expired: numberOfPayouts == (currentCycle - governanceCycleStart + 1)
  //  2. added: split not existed before
  //  3. changed: payouts amount changed
  onchainPayouts.forEach((split) => {
    const key = keyOfSplit(split);
    const registeredPayout = registeredPayoutMap.get(key);
    const actionPayout = actionPayoutMap.get(key);

    const defaultSplitDiffEntry = {
      split,
      proposalId: 0,
      oldVal:
        formattedSplit(
          split.percent || BIG_ZERO,
          config.fundingCycle.currency,
          config.fundingCycle.target,
          config.version
        ) || "",
      newVal: "",
      amount: calculateSplitAmount(split.percent, config.fundingCycle.target),
    };

    if (actionPayout) {
      // Amount change or refresh
      const { amount } = getPayoutCountAmount(actionPayout.action);
      diff.change[key] = {
        ...defaultSplitDiffEntry,
        proposalId: actionPayout.pid,
        amount,
      };
    } else if (registeredPayout) {
      // Will it expire?
      const willExpire =
        currentCycle &&
        registeredPayout.numberOfPayouts <
          currentCycle - registeredPayout.governanceCycleStart + 1;
      if (willExpire) {
        diff.expire[key] = {
          ...defaultSplitDiffEntry,
          proposalId: registeredPayout.proposalId || 0,
        };
      } else {
        // We have registered payout
        // Let's see if it matched
        const onchainAmount = calculateSplitAmount(
          split.percent,
          config.fundingCycle.target
        );
        const registeredAmount = registeredPayout.amount;
        if (onchainAmount === registeredAmount) {
          // keep it
          diff.keep[key] = {
            ...defaultSplitDiffEntry,
            proposalId: registeredPayout.proposalId || 0,
          };
        } else {
          // correct it
          diff.change[key] = {
            ...defaultSplitDiffEntry,
            proposalId: registeredPayout.proposalId || 0,
            amount: registeredAmount,
          };
        }
      }
    } else {
      // keep it
      diff.keep[key] = defaultSplitDiffEntry;
    }

    // Remove map entry so it won't get calculated twice later
    actionPayoutMap.delete(key);
  });

  actionPayoutMap.forEach((action, key) => {
    // New entry
    const payout = action.action.payload as Payout;
    const { amount } = getPayoutCountAmount(action.action);
    const split: JBSplit = {
      preferClaimed: false,
      preferAddToBalance: false,
      percent: BIG_ZERO,
      lockedUntil: BIG_ZERO,
      beneficiary: payout.address || "",
      projectId: BigInt(payout.project || 0),
      allocator: ZERO_ADDRESS,
    };
    diff.new[key] = {
      split,
      proposalId: action.pid,
      oldVal: "",
      newVal: "",
      amount: amount,
    };
  });

  // Calculate new distributionLimit and percentages for all payouts if there are changes.
  // FIXME here we assume all project will use USD-based payout, otherwise we need to handle currency
  const isInfiniteLimit = config.fundingCycle.target >= JBConstants.UintMax;
  const oldLimit = parseInt(utils.formatEther(config.fundingCycle.target ?? 0));
  let newLimit = oldLimit;
  Object.entries(diff.new).forEach((v) => (newLimit += v[1].amount));
  Object.entries(diff.expire).forEach((v) => (newLimit -= v[1].amount));
  Object.entries(diff.change).forEach((v) => {
    newLimit -= calculateSplitAmount(
      v[1].split.percent,
      config.fundingCycle.target
    );
    newLimit += v[1].amount;
  });
  const newLimitBG = parseEther(newLimit.toFixed(0));
  diff.newTotal = newLimitBG;

  // FIXME: remining funds should be allocated to project owner
  const updatePercentAndNewVal = percentUpdaterFrom(
    newLimitBG,
    config.fundingCycle.currency,
    config.version
  );
  Object.values(diff.keep).forEach(updatePercentAndNewVal);
  Object.values(diff.new).forEach(updatePercentAndNewVal);
  Object.values(diff.change).forEach(updatePercentAndNewVal);
  ensureSplitsSumTo100Percent(
    diff,
    newLimitBG,
    config.fundingCycle.currency,
    config.version
  );

  //console.debug("payoutsDiffOf.final", { diff, isInfiniteLimit, oldLimit, newLimit });
  return diff;
}

// Modified from https://github.com/jbx-protocol/juice-interface/blob/f17617de9577e4bf3f9d6208a51a2a2a3444188c/src/utils/v2v3/distributions.ts#L108
function ensureSplitsSumTo100Percent(
  diff: SplitDiff,
  newLimitBG: bigint,
  currency: bigint,
  version: number
) {
  // Calculate the percent total of the splits
  const allValues = Object.values(diff.keep)
    .concat(Object.values(diff.new))
    .concat(Object.values(diff.change));
  const currentTotal = Number(
    allValues.reduce((sum, entry) => sum + entry.split.percent, BigInt(0))
  );
  const SPLITS_TOTAL_PERCENT = JBConstants.TotalPercent.Splits[2];
  // If the current total is already equal to SPLITS_TOTAL_PERCENT, no adjustment needed
  if (currentTotal === SPLITS_TOTAL_PERCENT) {
    return;
  }
  //console.debug("ensureSplitsSumTo100Percent", { noAdjustment: currentTotal === SPLITS_TOTAL_PERCENT, currentTotal, SPLITS_TOTAL_PERCENT });

  // Calculate the ratio to adjust each split by
  const ratio = SPLITS_TOTAL_PERCENT / currentTotal;

  // Adjust each split
  allValues.forEach((entry) => {
    const newPercent = BigInt(Math.round(Number(entry.split.percent) * ratio));
    //const oldPercent = entry.split.percent;
    entry.split.percent = newPercent;
    entry.newVal = entry.newVal =
      formattedSplit(newPercent, currency, newLimitBG, version) || "";
    //console.debug("adjustPercent", { oldPercent, newPercent, ratio, entry })
  });

  // Calculate the total after adjustment
  const adjustedTotal = Number(
    allValues.reduce((sum, entry) => sum + entry.split.percent, BigInt(0))
  );
  if (adjustedTotal === SPLITS_TOTAL_PERCENT) {
    return;
  }

  // If there's STILL a difference due to rounding errors, adjust the largest split
  const difference = BigInt(SPLITS_TOTAL_PERCENT - adjustedTotal);
  const largestSplitIndex = allValues.findIndex(
    (entry) =>
      Number(entry.split.percent) ===
      Math.max(...allValues.map((e) => Number(e.split.percent)))
  );
  if (allValues[largestSplitIndex]) {
    const newPercent = allValues[largestSplitIndex].split.percent + difference;
    //const oldPercent = allValues[largestSplitIndex].split.percent;
    allValues[largestSplitIndex].split.percent = newPercent;
    allValues[largestSplitIndex].newVal =
      formattedSplit(newPercent, currency, newLimitBG, version) || "";
    //console.debug("after difference", { oldPercent, newPercent, difference, entry: allValues[largestSplitIndex] });
  }
}

export function compareReserves(
  oldReserves: JBSplit[],
  newReserves: JBSplit[],
  pid: number = 0
) {
  const newReserveMap = new Map<string, JBSplit>();
  newReserves.forEach((split) => newReserveMap.set(keyOfSplit(split), split));
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: BIG_ZERO,
  };

  oldReserves.forEach((ticket) => {
    const key = keyOfSplit(ticket);
    const reserve = newReserveMap.get(key);

    if (reserve) {
      const equal = isEqualJBSplit(ticket, reserve);
      diff.newTotal = diff.newTotal + reserve.percent;

      if (equal) {
        // keep
        diff.keep[key] = {
          split: ticket,
          oldVal: `${(
            (Number(ticket.percent) / JBConstants.TotalPercent.Splits[2]) *
            100
          ).toFixed(2)}%`,
          newVal: `${(
            (Number(ticket.percent) / JBConstants.TotalPercent.Splits[2]) *
            100
          ).toFixed(2)}%`,
          proposalId: 0,
          amount: Number(ticket.percent),
        };
      } else {
        // change
        diff.change[key] = {
          split: reserve,
          oldVal: `${(
            (Number(ticket.percent) / JBConstants.TotalPercent.Splits[2]) *
            100
          ).toFixed(2)}%`,
          newVal: `${(
            (Number(reserve.percent) / JBConstants.TotalPercent.Splits[2]) *
            100
          ).toFixed(2)}%`,
          proposalId: pid,
          amount: Number(reserve.percent),
        };
      }
    } else {
      // remove
      diff.expire[key] = {
        split: ticket,
        oldVal: `${(
          (Number(ticket.percent) / JBConstants.TotalPercent.Splits[2]) *
          100
        ).toFixed(2)}%`,
        newVal: "",
        proposalId: pid,
        amount: Number(ticket.percent),
      };
    }

    newReserveMap.delete(key);
  });

  newReserveMap.forEach((v, k) => {
    diff.newTotal = diff.newTotal + BigInt(v.percent);
    diff.new[k] = {
      split: v,
      oldVal: "",
      newVal: `${(
        (Number(v.percent) / JBConstants.TotalPercent.Splits[2]) *
        100
      ).toFixed(2)}%`,
      proposalId: pid,
      amount: Number(v.percent),
    };
  });

  //console.debug("reservesDiffOf.final", diff);
  return diff;
}

export function payout2JBSplit(action: Action) {
  // FIXME: this may not work for allocator
  const { amount: _amount } = getPayoutCountAmount(action);
  const amount = _amount || 0; // handle potential NaN
  const payout = action.payload as Payout;
  const split: JBSplit = {
    preferClaimed: false,
    preferAddToBalance: false,
    percent: BigInt(Math.floor(amount)), // HACK FOR FLOAT VALUES
    lockedUntil: BIG_ZERO,
    beneficiary: payout.address || "",
    projectId: BigInt(payout.project || 0),
    allocator: ZERO_ADDRESS,
  };
  return split;
}

export function calcDiffTableData(
  config: FundingCycleConfigProps,
  newConfig: FundingCycleConfigProps | undefined,
  payoutsDiff: SplitDiff,
  reservesDiff: SplitDiff
) {
  // Table data
  //console.debug("calcDiffTableData", { config, newConfig, payoutsDiff, reservesDiff });

  const tableData: SectionTableData[] = [
    ...compareRules(config, newConfig),
    {
      section: "Distribution",
      entries: [],
    },
    {
      section: "Reserve Token",
      entries: [],
    },
  ];

  const payoutIndex = tableData.length - 2;
  const reserveIndex = tableData.length - 1;
  // Payout Diff
  Object.values(payoutsDiff.new).forEach(
    diff2TableEntry(payoutIndex, "Add", tableData)
  );
  Object.values(payoutsDiff.change).forEach(
    diff2TableEntry(payoutIndex, "Edit", tableData)
  );
  Object.values(payoutsDiff.expire).forEach(
    diff2TableEntry(payoutIndex, "Remove", tableData)
  );
  Object.values(payoutsDiff.keep).forEach(
    diff2TableEntry(payoutIndex, "Keep", tableData)
  );
  tableData[payoutIndex].entries.sort(
    (a, b) => b.valueToBeSorted - a.valueToBeSorted
  );
  // Reserve Diff
  Object.values(reservesDiff.new).forEach(
    diff2TableEntry(reserveIndex, "Add", tableData)
  );
  Object.values(reservesDiff.change).forEach(
    diff2TableEntry(reserveIndex, "Edit", tableData)
  );
  Object.values(reservesDiff.expire).forEach(
    diff2TableEntry(reserveIndex, "Remove", tableData)
  );
  Object.values(reservesDiff.keep).forEach(
    diff2TableEntry(reserveIndex, "Keep", tableData)
  );
  tableData[reserveIndex].entries.sort(
    (a, b) => b.valueToBeSorted - a.valueToBeSorted
  );

  return tableData;
}

export function encodedReconfigureFundingCyclesOf(
  config: FundingCycleConfigProps,
  payoutsDiff: SplitDiff,
  reservesDiff: SplitDiff,
  projectId: number,
  controller: Contract | undefined,
  terminalAddress: string | undefined = ZERO_ADDRESS
) {
  const BIG_ZERO = BigInt(0);
  const fc = config.fundingCycle;
  const jbFundingCycleData: JBFundingCycleData = {
    duration: fc?.duration || BIG_ZERO,
    // discountRate is a percent by how much the weight of the subsequent funding cycle should be reduced,
    //   if the project owner hasn't configured the subsequent funding cycle with an explicit weight.
    weight: BIG_ZERO,
    discountRate: fc?.discountRate || BIG_ZERO,
    ballot: fc?.ballot || ZERO_ADDRESS,
  };
  const reconfigurationRawData = [
    BigNumber.from(projectId), // _projectId
    jbFundingCycleData, // _data
    config.metadata, // _metadata
    BigNumber.from(Math.floor(Date.now() / 1000)), // _mustStartAtOrAfter
    [
      // _groupedSplits
      {
        group: JBConstants.SplitGroup.ETH,
        // gather JBSplit of payoutsDiff.new .change .keep
        splits: Object.values(payoutsDiff.new)
          .concat(Object.values(payoutsDiff.change))
          .concat(Object.values(payoutsDiff.keep))
          .map((v) => v.split),
      },
      {
        group: JBConstants.SplitGroup.RESERVED_TOKEN,
        // gather JBSplit of reservesDiff.new .change .keep
        splits: Object.values(reservesDiff.new)
          .concat(Object.values(reservesDiff.change))
          .concat(Object.values(reservesDiff.keep))
          .map((v) => v.split),
      },
    ],
    [
      {
        // _fundAccessConstraints
        terminal: terminalAddress,
        token: ETH_TOKEN_ADDRESS,
        distributionLimit: payoutsDiff.newTotal,
        distributionLimitCurrency: CURRENCY_USD,
        overflowAllowance: BIG_ZERO,
        overflowAllowanceCurrency: BIG_ZERO,
      },
    ],
    "Queued from Nance.QueueExecutionFlow", // _memo
  ];
  console.debug("reconfigurationRawData", reconfigurationRawData);

  return controller?.interface?.encodeFunctionData(
    "reconfigureFundingCyclesOf",
    reconfigurationRawData
  );
}
