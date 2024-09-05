import { getUnixTime } from "date-fns";
import { JBConstants } from "../../models/JuiceboxTypes";
import { FundingCycleConfigProps } from "./fundingCycle";
import { decodeFunctionData } from "viem";

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_projectId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "duration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "weight",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "discountRate",
            type: "uint256",
          },
          {
            internalType: "contract IJBFundingCycleBallot",
            name: "ballot",
            type: "address",
          },
        ],
        internalType: "struct JBFundingCycleData",
        name: "_data",
        type: "tuple",
      },
      {
        components: [
          {
            components: [
              {
                internalType: "bool",
                name: "allowSetTerminals",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetController",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "pauseTransfers",
                type: "bool",
              },
            ],
            internalType: "struct JBGlobalFundingCycleMetadata",
            name: "global",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "reservedRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "redemptionRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "ballotRedemptionRate",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "pausePay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseDistributions",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseRedeem",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseBurn",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowMinting",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowTerminalMigration",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowControllerMigration",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "holdFees",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "preferClaimedTokenOverride",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useTotalOverflowForRedemptions",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataSourceForPay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataSourceForRedeem",
            type: "bool",
          },
          {
            internalType: "address",
            name: "dataSource",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "metadata",
            type: "uint256",
          },
        ],
        internalType: "struct JBFundingCycleMetadata",
        name: "_metadata",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "_mustStartAtOrAfter",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "group",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "preferClaimed",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "preferAddToBalance",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "percent",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "projectId",
                type: "uint256",
              },
              {
                internalType: "address payable",
                name: "beneficiary",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "lockedUntil",
                type: "uint256",
              },
              {
                internalType: "contract IJBSplitAllocator",
                name: "allocator",
                type: "address",
              },
            ],
            internalType: "struct JBSplit[]",
            name: "splits",
            type: "tuple[]",
          },
        ],
        internalType: "struct JBGroupedSplits[]",
        name: "_groupedSplits",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "contract IJBPaymentTerminal",
            name: "terminal",
            type: "address",
          },
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "distributionLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "distributionLimitCurrency",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "overflowAllowance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "overflowAllowanceCurrency",
            type: "uint256",
          },
        ],
        internalType: "struct JBFundAccessConstraints[]",
        name: "_fundAccessConstraints",
        type: "tuple[]",
      },
      {
        internalType: "string",
        name: "_memo",
        type: "string",
      },
    ],
    name: "reconfigureFundingCyclesOf",
    outputs: [
      {
        internalType: "uint256",
        name: "configuration",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function parseSafeJuiceboxTx(
  rawData: string,
  submissionDate: string,
  fallbackFee: bigint,
  fallbackConfiguration: bigint
): FundingCycleConfigProps | undefined {
  try {
    const { functionName, args } = decodeFunctionData({
      abi,
      data: rawData as `0x${string}`,
    });

    const [
      _projectId,
      _data,
      _metadata,
      _mustStartAtOrAfter,
      _groupedSplits,
      _fundAccessConstraints,
      _memo,
    ] = args;

    const fac = _fundAccessConstraints[0];

    const txDate =
      getUnixTime(new Date(submissionDate)) || getUnixTime(new Date());
    const payoutMods = _groupedSplits.find(
      (s) => Number(s.group) == JBConstants.SplitGroup.ETH
    )?.splits;
    const ticketMods = _groupedSplits.find(
      (s) => Number(s.group) == JBConstants.SplitGroup.RESERVED_TOKEN
    )?.splits;
    const newConfig: FundingCycleConfigProps = {
      version: 3,
      fundingCycle: {
        ..._data,
        fee: fallbackFee,
        configuration: txDate ? BigInt(txDate) : fallbackConfiguration,
        currency: fac?.distributionLimitCurrency - BigInt(1) || BigInt(0),
        target: fac?.distributionLimit || BigInt(0),
      },
      metadata: _metadata,
      payoutMods: [...(payoutMods || [])],
      ticketMods: [...(ticketMods || [])],
    };
    return newConfig;
  } catch (e) {
    console.debug("parseSafeJuiceboxTx.error", e);
  }
}
