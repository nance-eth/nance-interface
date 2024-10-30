import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import { ProposalStatusNames } from "@nance/nance-sdk";
import toast from "react-hot-toast";
import ProposalBadgeLabel from "../Space/sub/card/ProposalBadgeLabel";
import { useContext } from "react";
import { ProposalContext } from "./context/ProposalContext";
import { useProposalPatchStatus, useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { useSession } from "next-auth/react";

export default function ProposalStatusMenu() {
  const { commonProps, mutateNanceProposal } = useContext(ProposalContext);
  const { trigger } = useProposalPatchStatus(
    commonProps.space,
    commonProps.uuid
  );

  const { data: session } = useSession();
  const { data } = useSpaceInfo({ space: commonProps.space });

  if (data?.data.spaceOwners.includes(session?.user?.name || "")) {
    return (
      <Menu as="div" className="relative inline-block">
        <div>
          <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            {commonProps.status}
            <ChevronDownIcon
              className="-mr-1 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Menu.Items className="absolute mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          {ProposalStatusNames.filter((s) => s !== commonProps.status).map(
            (s) => (
              <div key={s} className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-blue-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      onClick={() => {
                        toast.promise(trigger(s), {
                          loading: "Updating status",
                          success: (data) => {
                            mutateNanceProposal?.({ status: s });
                            return `Status updated to ${s}`;
                          },
                          error: (err) => `${err.toString()}`,
                        });
                      }}
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
    );
  }

  return <ProposalBadgeLabel status={commonProps.status} />;
}
