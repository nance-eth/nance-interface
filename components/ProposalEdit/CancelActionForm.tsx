import SelectForm from "../form/SelectForm";
import { useContext } from "react";
import { SpaceContext } from "@/context/SpaceContext";
import { useActions } from "@/utils/hooks/NanceHooks";
import StringForm from "../form/StringForm";
import ActionLabel from "../ActionLabel/ActionLabel";

export default function CancelActionForm({
  genFieldName,
}: {
  genFieldName: (field: string) => any;
}) {
  const spaceInfo = useContext(SpaceContext);
  const spaceName = spaceInfo?.name || "";

  const { data } = useActions({ space: spaceName }, !!spaceName);

  const options =
    data?.data?.map((r) => {
      return {
        value: r.action.uuid,
        displayValue: `${JSON.stringify(r.action.payload)}`,
        displayComponent: <ActionLabel action={r.action} space={spaceName} />,
      };
    }) || [];

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-1">
        <SelectForm
          label="Action to cancel"
          fieldName={genFieldName("targetActionUuid")}
          options={options}
          defaultValue={options[0]?.value || "-- select --"}
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
    </div>
  );
}
