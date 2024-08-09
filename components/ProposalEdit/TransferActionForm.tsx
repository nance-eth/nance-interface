import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import { useSafeBalances } from "@/utils/hooks/Safe/SafeHooks";
import GenericListbox from "../common/GenericListbox";
import { Controller, useFormContext } from "react-hook-form";
import { SafeBalanceUsdResponse } from "@/models/SafeTypes";
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

type ListBoxItems = {
  id?: string;
  name?: string;
};

const safeBalanceToItems = (b: SafeBalanceUsdResponse[]): ListBoxItems[] => {
  return b.map((b) => {
    const token = b.token?.symbol || "ETH";
    const balance = numToPrettyString(
      formatUnits(b.balance, b.token?.decimals || 18),
      2
    );
    return {
      id: b.tokenAddress || ETH_MOCK_CONTRACT,
      name: `${token} (${balance})`,
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
  const { control, watch } = useFormContext();
  const spaceInfo = useContext(SpaceContext);

  const { data, isLoading } = useSafeBalances(address, !!address);
  const items = data
    ? safeBalanceToItems(data)
    : [
        {
          id: ETH_MOCK_CONTRACT,
          name: "ETH",
        },
      ];

  const earliestStartCycle = getEarliestStartCycle(
    spaceInfo?.currentCycle || 1,
    spaceInfo?.currentEvent.title || "Unknown"
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
            cycle: watch(genFieldName("cycleStart")),
            length: watch(genFieldName("count")),
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
          {(
            watch(genFieldName("count")) * watch(genFieldName("amount"))
          ).toFixed(4)}
        </span>
      </div>

      <div className="col-span-4 sm:col-span-1">
        <>
          <Controller
            name={genFieldName("contract")}
            control={control}
            defaultValue={items[0].id}
            render={({ field: { onChange, value } }) => (
              <GenericListbox<ListBoxItems>
                value={items.find((i) => i.id === value) || items[0]}
                onChange={(c) => onChange(c.id)}
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
