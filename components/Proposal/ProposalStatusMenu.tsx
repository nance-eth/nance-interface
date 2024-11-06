import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import { ProposalStatus, ProposalStatusNames } from "@nance/nance-sdk";
import toast from "react-hot-toast";
import ProposalBadgeLabel from "../Space/sub/card/ProposalBadgeLabel";
import { useContext, useState } from "react";
import { ProposalContext } from "./context/ProposalContext";
import { useProposalPatchStatus, useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { useSession } from "next-auth/react";
import { classNames } from "@/utils/functions/tailwind";
import TooltipInfo from "../common/TooltipInfo";

export default function ProposalStatusMenu() {
  const { commonProps, mutateNanceProposal } = useContext(ProposalContext);
  const { trigger, isMutating } = useProposalPatchStatus(
    commonProps.space,
    commonProps.uuid
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<ProposalStatus>()

  const { data: session } = useSession();
  const { data } = useSpaceInfo({ space: commonProps.space });

  if (data?.data.spaceOwners.includes(session?.user?.name || "")) {
    if (!isEditing && !isMutating) {
      return (
        <div className="flex flex-row items-center space-x-2 text-xs">
          <ProposalBadgeLabel status={commonProps.status} />
          <div
            className="underline hover:cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            edit
          </div>
          <TooltipInfo content="space owners can edit the status" />
        </div>
      );
    }

    return (
      <div className="flex flex-row items-center space-x-2">
        <Menu as="div" className="relative inline-block">
          <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            {editStatus || commonProps.status}
            <ChevronDownIcon
              className="-mr-1 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Menu.Button>
          <Menu.Items className="absolute mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            {ProposalStatusNames.filter((s) => s !== commonProps.status).map(
              (s) => (
                <div key={s} className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-blue-500 text-white" : "text-gray-900"
                        } group flex w-full items-center text-left rounded-md px-2 py-2 text-sm`}
                        onClick={ () => setEditStatus(s) }
                      >
                        {s}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              )
            )}
          </Menu.Items>
        </Menu>
        <div
          className={classNames(
            "text-xs underline hover:cursor-pointer",
            (editStatus && commonProps.status !== editStatus) && "animate-pulse text-blue-600 font-bold"
          )}
          onClick={() => {
            toast.promise(trigger(editStatus), {
              loading: "Updating status",
              success: (data) => {
                mutateNanceProposal?.({ status: editStatus });
                return `Status updated to ${editStatus}`;
              },
              error: (err) => `${err.toString()}`,
            });
            setIsEditing(false);
          }}
        >
          save
        </div>
        <div
          className={classNames("text-xs underline hover:cursor-pointer text-gray-500")}
          onClick={() => {
            setEditStatus(undefined);
            setIsEditing(false);
          }}
        >
          cancel
        </div>
      </div>
    );
  }

  return <ProposalBadgeLabel status={commonProps.status} />;
}
