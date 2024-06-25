import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import { useSafeBalances } from "@/utils/hooks/Safe/SafeHooks";
import GenericListbox from "../common/GenericListbox";
import { Controller, useFormContext } from "react-hook-form";
import { SafeBalanceUsdResponse } from "@/models/SafeTypes";
import { formatUnits } from "ethers/lib/utils";
import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import { ETH_MOCK_CONTRACT } from "@/constants/Nance";
import { useEffect } from "react";

type ListBoxItems = {
  id?: string;
  name?: string;
};

const safeBalanceToItems = (b: SafeBalanceUsdResponse[]): ListBoxItems[] => {
  return b.map((b) => {
    const token = b.token?.symbol || 'ETH';
    const balance = numToPrettyString(
      formatUnits(b.balance, b.token?.decimals || 18),
      2
    );
    return {
      id: (b.tokenAddress as string) || ETH_MOCK_CONTRACT,
      name: `${token} (${balance})`
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
  const {
    control,
    formState: { errors },
    setValue
  } = useFormContext();

  const { data, isLoading, error } = useSafeBalances(address, !!address);
  const items = data
    ? safeBalanceToItems(data)
    : [{ id: undefined, name: isLoading ? "loading..." : "no tokens found in Safe" }];
  console.debug("safe", data, items);

  useEffect(() => {
    if (data && data.length > 0) {
      setValue(genFieldName("contract"), data[0].tokenAddress || ETH_MOCK_CONTRACT);
    }
  }, [data, setValue, genFieldName]);

  return (
    <div className="grid grid-cols-4 gap-6">
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
          step={1E-18}
        />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <>
          <Controller
            name={genFieldName("contract")}
            control={control}
            defaultValue={items[0]?.id}
            render={({ field: { onChange, value } }) => (
              <GenericListbox<ListBoxItems>
                value={
                  items.find((i) => i.id === value) ||
                    items[0] || {
                    id: undefined,
                    name: "no tokens found in Safe",
                  }
                }
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
