import { BigNumber } from "ethers";
import { useCurrentFundingCycle } from "./CurrentFundingCycle";
import { useDistributionLimit } from "./DistributionLimit";
import { useCurrentSplits } from "./CurrentSplits";
import { JBConstants } from "../../../models/JuiceboxTypes";
import { FundingCycleConfigProps } from "@/utils/functions/fundingCycle";

export function useReconfigurationOfProject(projectId: number) {
  const { data: _fc, isLoading: fcIsLoading } =
    useCurrentFundingCycle(projectId);
  const [fc, metadata] = _fc || [];

  const { data: _limit, isLoading: targetIsLoading } = useDistributionLimit(
    projectId,
    fc?.configuration
  );
  const [target, currency] = _limit || [];
  const { data: payoutMods, isLoading: payoutModsIsLoading } = useCurrentSplits(
    projectId,
    fc?.configuration,
    BigInt(JBConstants.SplitGroup.ETH)
  );
  const { data: ticketMods, isLoading: ticketModsIsLoading } = useCurrentSplits(
    projectId,
    fc?.configuration,
    BigInt(JBConstants.SplitGroup.RESERVED_TOKEN)
  );

  const currentConfig: FundingCycleConfigProps = {
    version: 2,
    //@ts-ignore
    fundingCycle: {
      ...fc,
      fee: BigInt(0),
      currency: (currency || BigInt(0)) - BigInt(1),
      target: target || BigInt(0),
      configuration: fc?.configuration || BigInt(0),
    },
    metadata: metadata,
    payoutMods: [...(payoutMods || [])],
    ticketMods: [...(ticketMods || [])],
  };

  return {
    value: currentConfig,
    loading:
      fcIsLoading ||
      metadata === undefined ||
      targetIsLoading ||
      payoutModsIsLoading ||
      ticketModsIsLoading,
  };
}
