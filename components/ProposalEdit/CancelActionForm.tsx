import SelectForm from "../form/SelectForm";
import { useContext, useEffect } from "react";
import { SpaceContext } from "@/context/SpaceContext";
import { useActions } from "@/utils/hooks/NanceHooks";
import StringForm from "../form/StringForm";
import ActionLabel from "../ActionLabel/ActionLabel";
import { getEarliestStartCycle } from "@/utils/functions/GovernanceCycle";
import UIntForm from "../form/UIntForm";
import { useFormContext } from "react-hook-form";

export default function CancelActionForm({
  genFieldName,
}: {
  genFieldName: (field: string) => any;
}) {
  const { setValue } = useFormContext();
  const spaceInfo = useContext(SpaceContext);
  const spaceName = spaceInfo?.name || "";

  const { data } = useActions({ space: spaceName }, !!spaceName);

  const earliestStartCycle = getEarliestStartCycle(
    spaceInfo?.currentCycle || 1,
    spaceInfo?.currentEvent.title || "Unknown"
  );

  const options =
    data?.data?.map((r) => {
      return {
        value: r.action.uuid,
        displayValue: `${JSON.stringify(r.action.payload)}`,
        // FIXME this ActionLabel doesn't render properly in single line, it lacks spaces
        displayComponent: <ActionLabel action={r.action} space={spaceName} />,
      };
    }) || [];

  useEffect(() => {
    setValue(genFieldName("count"), 1);
  }, [setValue]);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-1">
        <SelectForm
          label="Action to cancel"
          fieldName={genFieldName("targetActionUuid")}
          options={options}
          showType={false}
          tooltip="Which action do you want to cancel?"
        />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <StringForm
          label={`Description`}
          fieldName={genFieldName("targetActionDescription")}
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
    </div>
  );
}
