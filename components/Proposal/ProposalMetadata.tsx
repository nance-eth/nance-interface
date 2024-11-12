import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { NANCE_API_URL } from "@/constants/Nance";
import { getDomain, openInDiscord } from "@/utils/functions/discord";
import { useContext, useState } from "react";
import Link from "next/link";
import ActionLabel from "@/components/ActionLabel/ActionLabel";
import { ProposalContext } from "./context/ProposalContext";
import { useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { SpaceContext } from "@/context/SpaceContext";
import { Spinner } from "flowbite-react";
import {
  APIResponse,
  ProposalPacket,
  getOrRefreshProposalDiscussion,
} from "@nance/nance-sdk";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { canEditProposal } from "@/utils/functions/nance";
import { Disclosure } from "@headlessui/react";
import { BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/24/solid";

export default function ProposalMetadata() {
  const { address } = useAccount();
  const { commonProps } = useContext(ProposalContext);
  const { data } = useSpaceInfo({ space: commonProps.space });
  const spaceInfo = data?.data;

  // refresh discussion link
  const [discussionThreadURL, setDiscussionThreadURL] = useState<
    string | undefined
  >(commonProps.discussion);

  // set interval to refresh discussion link, couldn't get it to work with useProposal hook
  let retries = 0;
  const retryLimit = 2;
  const interval = setInterval(async () => {
    if (
      (!discussionThreadURL && commonProps.status !== "Draft") ||
      commonProps.status !== "Archived"
    ) {
      if (retries >= retryLimit) {
        setDiscussionThreadURL("ERROR");
        clearInterval(interval);
      }
      try {
        const res = await fetch(
          `${NANCE_API_URL}/${commonProps.space}/proposal/${commonProps.uuid}`
        );
        const { data } = (await res.json()) as APIResponse<ProposalPacket>;
        const refreshedDiscussionURL = data?.discussionThreadURL;
        if (
          refreshedDiscussionURL !== "" &&
          refreshedDiscussionURL !== undefined
        ) {
          setDiscussionThreadURL(refreshedDiscussionURL);
          clearInterval(interval);
        }
      } catch (e) {
        console.error(e);
      } finally {
        retries += 1;
      }
    }
  }, 1500);

  return (
    <div className="my-4 rounded-md border bg-gray-100 px-4 py-5 sm:px-6">
      <Link
        target="_blank"
        href={`${NANCE_API_URL}/${commonProps.space}/proposal/${commonProps.uuid}`}
        className="mb-3 text-gray-500"
      >
        Metadata
      </Link>
      <div className="gaps-4">
        {commonProps.actions && commonProps.actions.length > 0 && (
          <p className="col-span-2 font-medium">Actions: </p>
        )}

        <SpaceContext.Provider value={spaceInfo}>
          <div className="col-span-2 mt-2 flex w-full flex-col space-y-2">
            {commonProps.actions.slice(0, 2).map((action, index) => (
              <ActionLabel
                action={action}
                space={commonProps.space}
                key={index}
              />
            ))}
          </div>
          <Disclosure as="div" className="">
            {({ open }) => (
              <>
                <dt>
                  <Disclosure.Button className="flex w-full justify-center items-center bg-gradient-to-b from-gray-100 to-blue-100 rounded-md">
                    {!open && (
                      <>
                        More&nbsp;
                        <BarsArrowDownIcon className="w-5 h-5 my-2" />
                      </>
                    )}
                  </Disclosure.Button>
                </dt>
                <Disclosure.Panel as="dd" className="">
                  <div className="col-span-2 mt-2 flex w-full flex-col space-y-2">
                    {commonProps.actions.slice(2).map((action, index) => (
                      <ActionLabel
                        action={action}
                        space={commonProps.space}
                        key={index}
                      />
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-3">
                    {commonProps.governanceCycle && (
                      <>
                        <span className="font-medium">Cycle:</span>
                        <span className="col-span-2">
                          <Link
                            className="col-span-2"
                            href={`/s/${commonProps.space}/?cycle=${commonProps.governanceCycle}`}
                          >
                            {commonProps.governanceCycle}
                            <ArrowTopRightOnSquareIcon className="ml-1 mb-1 inline h-3 w-3" />
                          </Link>
                        </span>
                      </>
                    )}

                    {!discussionThreadURL &&
                      commonProps.status === "Discussion" && (
                        <>
                          <span className="font-medium">Discussion:</span>
                          <Spinner size={"sm"} />
                        </>
                      )}

                    {discussionThreadURL &&
                      discussionThreadURL !== "ERROR" && (
                        <>
                          <span className="font-medium">Discussion:</span>
                          <div className="flex flex-row items-center space-x-1">
                            <a
                              className="col-span-2 w-fit"
                              target="_blank"
                              rel="noreferrer"
                              href={openInDiscord(discussionThreadURL)}
                            >
                              {getDomain(discussionThreadURL)}
                              <ArrowTopRightOnSquareIcon className="ml-1 mb-1 inline h-3 w-3 text-xs" />
                            </a>
                            {address &&
                              spaceInfo?.spaceOwners.includes(address) &&
                              canEditProposal(commonProps.status) && (
                                <ArrowPathIcon
                                  className="h-3 w-3 hover:cursor-pointer"
                                  onClick={async () => {
                                    toast.promise(
                                      getOrRefreshProposalDiscussion(
                                        commonProps.space,
                                        commonProps.uuid,
                                        NANCE_API_URL
                                      ),
                                      {
                                        loading: "Updating Discord",
                                        success: "Discord updated!",
                                        error: (err) => `${err.toString()}`,
                                      }
                                    );
                                  }}
                                />
                              )}
                          </div>
                          <div></div>
                        </>
                      )}

                    {discussionThreadURL === "ERROR" &&
                      commonProps.status === "Discussion" && (
                        <>
                          <span className="font-medium">Discussion:</span>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="col-span-2 cursor-pointer text-sky-800"
                            onClick={async () => {
                              try {
                                setDiscussionThreadURL(undefined);
                                await getOrRefreshProposalDiscussion(
                                  commonProps.space,
                                  commonProps.uuid,
                                  NANCE_API_URL
                                );
                              } catch (e: any) {
                                toast.error(e.toString());
                              }
                            }}
                          >
                            start discussion
                            <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
                          </a>
                        </>
                      )}

                    {commonProps.snapshotSpace &&
                      commonProps.snapshotHash && (
                        <>
                          <span className="font-medium">
                            Snapshot view:
                          </span>
                          <a
                            className="col-span-2 w-fit"
                            target="_blank"
                            rel="noreferrer"
                            href={`https://snapshot.org/#/${commonProps.snapshotSpace}/proposal/${commonProps.snapshotHash}`}
                          >
                            {commonProps.snapshotHash.substring(0, 8)}
                            <ArrowTopRightOnSquareIcon className="ml-1 mb-1 inline h-3 w-3 text-xs" />
                          </a>
                        </>
                      )}
                  </div>
                  <Disclosure.Button className="flex w-full justify-center items-center bg-gradient-to-t from-gray-100 to-blue-100 rounded-md">
                    Less&nbsp;
                    <BarsArrowUpIcon className="w-5 h-5 my-2" />
                  </Disclosure.Button>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </SpaceContext.Provider>
      </div>
    </div>
  );
}
