import { useFormContext } from "react-hook-form";
import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import ProjectForm from "../form/ProjectForm";
import SelectForm from "../form/SelectForm";
import {
  dateRangesOfCycles,
  getEarliestStartCycle,
} from "@/utils/functions/GovernanceCycle";
import { useContext } from "react";
import { SpaceContext } from "@/context/SpaceContext";
import BooleanForm from "../form/BooleanForm";

export default function PayoutActionForm({
  genFieldName,
  projectOwner,
}: {
  genFieldName: (field: string) => any;
  projectOwner: string;
}) {
  const { watch, getValues } = useFormContext();
  const spaceInfo = useContext(SpaceContext);

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
          showType={false}
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
      <div className="col-span-4 sm:col-span-1">
        <UIntForm
          label="Amount"
          fieldName={genFieldName("amount")}
          fieldType="$"
          defaultValue={1}
          min={1}
          tooltip="Amount in USD to be paid to the receiver each funding cycle"
          step={0.001}
        />
        <span className="text-xs text-gray-400">
          Total:{" "}
          {(
            watch(genFieldName("count")) * watch(genFieldName("amount"))
          ).toFixed(2)}
        </span>
      </div>

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
          showType={false}
          tooltip="Send funds to a Juicebox project or EOA?"
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
            showType={false}
            tooltip={`You've selected your payout to be sent to another Juicebox project. When a Juicebox project is paid, tokens are sent to the payer. The multisig of the space you are proposing to is the beneficiary of the tokens by default.`}
          />
        )}

        {watch(genFieldName("type")) !== "project" && (
          <AddressForm
            label="Receiver Address"
            fieldName={genFieldName("address")}
            showType={false}
          />
        )}
      </div>
    </div>
  );
}
