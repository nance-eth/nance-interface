import { format, formatDistanceToNowStrict, toDate } from "date-fns";
import { useContext } from "react";
import { ProposalContext } from "./context/ProposalContext";
import { useProposalHistory } from "@/utils/hooks/NanceHooks";

export default function ProposalHistory() {
  const { commonProps } = useContext(ProposalContext);
  const edited = commonProps.edited !== commonProps.created;
  const editedDate = toDate(commonProps.edited * 1000);
  const editedDateFormatted = format(editedDate, "MM/dd/yy hh:mm a");

  const { data } = useProposalHistory({
    space: commonProps.space,
    uuid: commonProps.uuid,
  });
  const versions = data?.data?.sort((a, b) => b.version - a.version);

  return (
    <>
      <span
        className="tooltip cursor-pointer"
        data-tip={editedDateFormatted}
        onClick={() =>
          (
            document.getElementById("history_modal") as HTMLDialogElement
          ).showModal()
        }
      >
        &nbsp;{edited ? "edited" : "created"}&nbsp;
        {formatDistanceToNowStrict(editedDate, {
          addSuffix: true,
        })}
      </span>
      <dialog id="history_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg pb-2">Edit history</h3>
          {versions?.map((v, index) => (
            <p key={v.version} className="pt-2">
              {v.version === 0
                ? "Created "
                : !v.body && !v.title && v.status
                ? `${v.status.to} `
                : "Edited "}
              {formatDistanceToNowStrict(new Date(v.datetime), {
                addSuffix: true,
                unit: "day",
              })}
            </p>
          ))}

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
