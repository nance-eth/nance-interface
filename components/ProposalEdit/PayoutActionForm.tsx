import { useFormContext } from "react-hook-form";
import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import ProjectForm from "../form/ProjectForm";
import SelectForm from "../form/SelectForm";
import { dateRangesOfCycles } from "@/utils/functions/GovernanceCycle";
import { useContext } from "react";
import { SpaceContext } from "@/context/SpaceContext";
import { addDays } from "date-fns";

export default function PayoutActionForm({
  genFieldName,
  projectOwner,
}: {
  genFieldName: (field: string) => any;
  projectOwner: string;
}) {
  const { watch, getValues } = useFormContext();
  const spaceInfo = useContext(SpaceContext);
  const nextCycleStartDate = addDays(new Date(spaceInfo?.cycleStartDate || ""), 14).toISOString();
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-1">
        <SelectForm
          label="Receiver Type"
          fieldName={genFieldName("type")}
          options={[
            { displayValue: "Address", value: "address" },
            { displayValue: "Project", value: "project" },
          ]}
          defaultValue={
            getValues(genFieldName("project")) > 0 ? "project" : "address"
          }
        />
      </div>
      <div className="col-span-4 sm:col-span-1">
        <UIntForm
          label="Duration(Cycles)"
          fieldName={genFieldName("count")}
          decimal={1}
        />
        <span className="text-xs text-gray-400">
          {dateRangesOfCycles({
            cycle: spaceInfo?.currentCycle,
            length: watch(genFieldName("count")),
            currentCycle: spaceInfo?.currentCycle,
            cycleStartDate: nextCycleStartDate,
          })}
        </span>
      </div>
      <div className="col-span-4 sm:col-span-2">
        <UIntForm
          label="Amount"
          fieldName={genFieldName("amountUSD")}
          fieldType="$"
        />
      </div>

      {watch(genFieldName("type")) === "project" && (
        <div className="col-span-4 sm:col-span-2">
          <ProjectForm
            label="Project Receiver"
            fieldName={genFieldName("project")}
            showType={false}
          />
        </div>
      )}
      <div className="col-span-4 sm:col-span-2">
        {watch(genFieldName("type")) === "project" && (
          <AddressForm
            label="Token Beneficiary"
            fieldName={genFieldName("address")}
            defaultValue={projectOwner}
            disabled
            disabledTooltip="The token beneficiary must be the project owner"
          />
        )}

        {watch(genFieldName("type")) !== "project" && (
          <AddressForm
            label="Receiver Address"
            fieldName={genFieldName("address")}
          />
        )}
      </div>
    </div>
  );
}
