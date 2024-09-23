import { useContext, useEffect } from "react";
import { SpaceContext } from "@/context/SpaceContext";
import StringForm from "../form/StringForm";
import { getEarliestStartCycle } from "@/utils/functions/GovernanceCycle";
import UIntForm from "../form/UIntForm";
import { useFormContext } from "react-hook-form";
import ActionForm from "../form/ActionForm";
import { ProposalMetadataContext } from "./context/ProposalMetadataContext";

export default function CancelActionForm({
  genFieldName,
}: {
  genFieldName: (field: string) => any;
}) {
  const { setValue } = useFormContext();
  const spaceInfo = useContext(SpaceContext);

  const metadata = useContext(ProposalMetadataContext);
  const isNew = metadata.fork || metadata.loadedProposal === undefined;
  const earliestStartCycle = getEarliestStartCycle(
    spaceInfo?.currentCycle || 1,
    !isNew
  );

  useEffect(() => {
    setValue(genFieldName("count"), 1);
  }, [setValue]);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <ActionForm
          label="Action to cancel"
          fieldName={genFieldName("targetActionUuid")}
          showType={false}
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
