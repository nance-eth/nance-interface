import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import { useSafeBalances } from "@/utils/hooks/Safe/SafeHooks";
import GenericListbox from "../common/GenericListbox";
import { Controller, useFormContext } from "react-hook-form";
import { SafeBalanceUsdResponseItem } from "@/models/SafeTypes";
import { formatUnits } from "ethers/lib/utils";
import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import { ETH_MOCK_CONTRACT } from "@/constants/Nance";
import { useContext } from "react";
import { SpaceContext } from "@/context/SpaceContext";
import {
  dateRangesOfCycles,
  getEarliestStartCycle,
} from "@/utils/functions/GovernanceCycle";
import BooleanForm from "../form/BooleanForm";
import { ProposalMetadataContext } from "./context/ProposalMetadataContext";

type ListBoxItem = {
  id: string;
  name: string;
  decimals: number;
};

const safeBalanceToItems = (b: SafeBalanceUsdResponseItem[]): ListBoxItem[] => {
  return b.map((b) => {
    const token = b.tokenInfo?.symbol || "ETH";
    const balance = numToPrettyString(
      formatUnits(b.balance, b.tokenInfo.decimals || 18),
      2
    );
    return {
      id: b.tokenInfo.address || ETH_MOCK_CONTRACT,
      name: `${token} (${balance})`,
      decimals: b.tokenInfo.decimals || 18,
    };
  });
};

export default function TransferActionForm({
  genFieldName,
  address,
}: {
  genFieldName: (field: string) => any;
  address: string;
}) {
  const { control, watch, setValue } = useFormContext();
  const spaceInfo = useContext(SpaceContext);

  const { data, isLoading } = useSafeBalances(address, !!address);
  const items: ListBoxItem[] = data?.items
    ? safeBalanceToItems(data.items)
    : [
        {
          id: ETH_MOCK_CONTRACT,
          name: "ETH",
          decimals: 18,
        },
      ];

  const metadata = useContext(ProposalMetadataContext);
  const isNew = metadata.fork || metadata.loadedProposal === undefined;
  const earliestStartCycle = getEarliestStartCycle(
    spaceInfo?.currentCycle || 1,
    !isNew
  );

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-1">
        <BooleanForm
          label={`Milestone Based`}
          fieldName={genFieldName("pollRequired")}
          tooltip="It will only get executed after the milestone has been met"
        />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <UIntForm
          label="Governance Cycle Start"
          fieldName={genFieldName("cycleStart")}
          defaultValue={earliestStartCycle}
          min={earliestStartCycle}
          showType={false}
          tooltip="When should this action start to take effect?"
        />
        <span className="text-xs text-gray-400">
          Current: GC-{spaceInfo?.currentCycle} (
          {spaceInfo?.currentEvent.title || "Unknown"})
        </span>
      </div>
      <div className="col-span-4 sm:col-span-1">
        <UIntForm
          label="Duration"
          fieldName={genFieldName("count")}
          fieldType="cycles"
          defaultValue={1}
          min={1}
          tooltip="How many Juicebox funding cycles will this payout last?"
        />
        <span className="text-xs text-gray-400">
          Date:{" "}
          {dateRangesOfCycles({
            cycle: parseInt(watch(genFieldName("cycleStart"))),
            length: parseInt(watch(genFieldName("count"))),
            currentCycle: spaceInfo?.currentCycle,
            cycleStartDate: spaceInfo?.cycleStartDate,
          })}
        </span>
      </div>

      <div className="col-span-4 sm:col-span-2">
        <AddressForm
          label="Receiver"
          fieldName={genFieldName("to")}
          showType={false}
        />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <UIntForm
          label="Amount"
          fieldName={genFieldName("amount")}
          showType={false}
          step={1e-18}
        />
        <span className="text-xs text-gray-400">
          Total:{" "}
          {numToPrettyString(
            watch(genFieldName("count")) * watch(genFieldName("amount")),
            "auto"
          )}
        </span>
      </div>

      <div className="col-span-4 sm:col-span-1">
        <>
          <Controller
            name={genFieldName("contract")}
            control={control}
            defaultValue={items[0].id}
            render={({ field: { onChange, value } }) => (
              <GenericListbox<ListBoxItem>
                value={items.find((i) => i.id === value) || items[0]}
                onChange={(c) => {
                  onChange(c.id);
                  setValue(genFieldName("decimals"), c.decimals);
                }}
                label="Token (Balance)"
                items={items}
                disabled={isLoading || items.length === 0}
                loading={isLoading}
              />
            )}
            shouldUnregister
          />
        </>
      </div>
    </div>
  );
}
