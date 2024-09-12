import { SpaceContext } from "@/context/SpaceContext";
import { Action, Cancel } from "@nance/nance-sdk";
import { useContext } from "react";
import ActionLabel from "./ActionLabel";
import { useActions } from "@/utils/hooks/NanceHooks";

export default function CancelActionLabel({ cancel }: { cancel: Cancel }) {
  const spaceInfo = useContext(SpaceContext);
  const spaceName = spaceInfo?.name || "";

  const { data } = useActions({ space: spaceName }, !!spaceName);
  const actions = data?.data || [];
  const targetAction = actions.find(
    (v) => v.action.uuid === cancel.targetActionUuid
  );

  return (
    <div className="flex flex-col">
      <span className="line-clamp-5">{cancel.targetActionDescription}</span>

      {targetAction && (
        <div className="rounded-md mt-2 outline-1 outline-offset-2 outline-dashed p-1">
          <ActionLabel space={spaceName} action={targetAction.action} />
        </div>
      )}
      {!targetAction && <span>Target: {cancel.targetActionUuid}</span>}
    </div>
  );
}
