import { BigNumber } from "ethers";
import { hexToBigInt } from "viem";

// === V2 ===

enum V2SplitGroup {
  ETH = 1,
  RESERVED_TOKEN = 2,
}

export type JBGroupedSplits = {
  group: bigint;
  splits: JBSplit[];
};

export type JBSplit = {
  preferClaimed: boolean;
  preferAddToBalance: boolean;
  percent: bigint;
  lockedUntil: bigint;
  beneficiary: string;
  projectId: bigint;
  allocator: string | undefined; // address, If an allocator is specified, funds will be sent to the allocator contract along with the projectId, beneficiary, preferClaimed properties.
};

export type JBFundingCycleData = {
  duration: bigint;
  weight: bigint;
  discountRate: bigint;
  ballot: string;
};

export type JBFundAccessConstraints = {
  terminal: string;
  token: string;
  distributionLimit: bigint;
  distributionLimitCurrency: bigint;
  overflowAllowance: bigint;
  overflowAllowanceCurrency: bigint;
};

export type V2V3FundingCycleData = {
  duration: bigint;
  weight: bigint;
  discountRate: bigint;
  ballot: string; // hex, contract address
};

export type V2V3FundingCycle = V2V3FundingCycleData & {
  number: bigint;
  configuration: bigint;
  basedOn: bigint;
  start: bigint;
  metadata: bigint; // encoded FundingCycleMetadata
};

export type BaseV2V3FundingCycleMetadata = {
  version?: number;
  reservedRate: bigint;
  redemptionRate: bigint;
  ballotRedemptionRate: bigint;
  pausePay: boolean;
  pauseDistributions: boolean;
  pauseRedeem: boolean;
  pauseBurn: boolean;
  allowMinting: boolean;
  allowTerminalMigration: boolean;
  allowControllerMigration: boolean;
  holdFees: boolean;
  useTotalOverflowForRedemptions: boolean;
  useDataSourceForPay: boolean;
  useDataSourceForRedeem: boolean;
  dataSource: string; // hex, contract address
};

export type BaseV2V3FundingCycleMetadataGlobal = {
  allowSetController: boolean;
  allowSetTerminals: boolean;
};

export type V2FundingCycleMetadataGlobal = BaseV2V3FundingCycleMetadataGlobal;

export type V2FundingCycleMetadata = BaseV2V3FundingCycleMetadata & {
  global: BaseV2V3FundingCycleMetadataGlobal;
  allowChangeToken: boolean;
};

export type V3FundingCycleMetadataGlobal =
  BaseV2V3FundingCycleMetadataGlobal & {
    pauseTransfers?: boolean;
  };

export type V3FundingCycleMetadata = BaseV2V3FundingCycleMetadata & {
  global: V3FundingCycleMetadataGlobal;
  preferClaimedTokenOverride?: boolean;
  metadata?: bigint;
};

export type V2V3FundingCycleMetadata =
  | V2FundingCycleMetadata
  | V3FundingCycleMetadata;

// Generic

export const JBConstants = {
  SplitGroup: V2SplitGroup,
  TotalPercent: {
    Splits: [10000, 1000000000, 1000000000],
    ReservedRate: [200, 10000, 10000],
    RedemptionRate: [200, 10000, 10000],
    DiscountRate: [1000, 1000000000, 1000000000],
  },
  UintMax: hexToBigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  ),
  DurationUnit: [1, 86400, 86400],
};

export const ETH_TOKEN_ADDRESS = "0x000000000000000000000000000000000000eeee";
export const CURRENCY_ETH = BigNumber.from(1);
export const CURRENCY_USD = BigNumber.from(2);
