import { SpaceContext } from "@/context/SpaceContext";
import { useAction, useCreateActionPoll } from "@/utils/hooks/NanceHooks";
import { useContext } from "react";
import toast from "react-hot-toast";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Action } from "@nance/nance-sdk";
import { getDomain, openInDiscord } from "@/utils/functions/discord";

export default function MilestonePollLink({ action }: { action: Action }) {
  const spaceInfo = useContext(SpaceContext);
  const spaceName = spaceInfo?.name || "";
  const payload = { space: spaceName, aid: action.uuid };
  const { trigger } = useCreateActionPoll(payload, !!spaceName);

  const actionTracking = action.actionTracking?.find(
    (t) => t.governanceCycle === spaceInfo?.currentCycle || 0
  );

  if (actionTracking?.pollId) {
    // polling
    return (
      <a
        className="w-fit"
        target="_blank"
        rel="noreferrer"
        href={openInDiscord(actionTracking.pollId)}
      >
        {getDomain(actionTracking.pollId)}
        <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
      </a>
    );
  }

  if (actionTracking?.status === "Active") {
    // no existed poll, can start a new one
    return (
      <a
        target="_blank"
        rel="noreferrer"
        className="cursor-pointer text-sky-800"
        onClick={async () => {
          toast.promise(trigger(), {
            loading: "Creating",
            success: (data) => `Successfully created poll ${data}`,
            error: (err) => `${err.toString()}`,
          });
        }}
      >
        start milestone poll
        <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
      </a>
    );
  }

  if (
    actionTracking?.status === "Cancelled" ||
    actionTracking?.status === "Executed" ||
    actionTracking?.status === "Queued"
  ) {
    // not initiated
    return null;
  }

  return <span className="text-yellow-500">milestone poll required</span>;
}
