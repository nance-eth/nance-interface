import {
  compareDesc,
  format,
  formatDistanceToNowStrict,
  toDate,
} from "date-fns";
import { useContext } from "react";
import { useProposalVersionList } from "@/utils/hooks/NanceHooks";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { ProposalContext } from "../context/ProposalContext";

export default function ProposalHistory() {
  const { commonProps } = useContext(ProposalContext);
  const edited = commonProps.edited !== commonProps.created;
  const editedDate = toDate(commonProps.edited * 1000);
  const editedDateFormatted = format(editedDate, "MM/dd/yy hh:mm a");

  const { data } = useProposalVersionList({
    space: commonProps.space,
    uuid: commonProps.uuid,
  });
  const versions = data?.data?.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

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
            <div key={v.hash} className="flex justify-between pt-2">
              <p>
                {"Edited "}
                {formatDistanceToNowStrict(new Date(v.date), {
                  addSuffix: true,
                  unit: "day",
                })}
              </p>
              <Link
                href={`/s/${commonProps.space}/${commonProps.uuid}/diff/${v.hash}`}
                className="flex items-center gap-x-1"
              >
                View diff
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </Link>
            </div>
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
