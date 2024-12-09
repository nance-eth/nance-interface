import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { NANCE_API_URL } from "@/constants/Nance";
import { getDomain, openInDiscord } from "@/utils/functions/discord";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import ActionLabel from "@/components/ActionLabel/ActionLabel";
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
import { ProposalContext } from "../context/ProposalContext";

export default function ProposalMetadata() {
  const { address } = useAccount();
  const { commonProps } = useContext(ProposalContext);
  const { data } = useSpaceInfo({ space: commonProps.space });
  const spaceInfo = data?.data;

  // refresh discussion link
  const [discussionThreadURL, setDiscussionThreadURL] = useState<
    string | undefined
  >(commonProps.discussion);
  const [retries, setRetries] = useState(0);
  const retryLimit = 3;

  useEffect(() => {
    if (!discussionThreadURL || discussionThreadURL === "") {
      const interval = setInterval(async () => {
        if (
          (!discussionThreadURL && commonProps.status !== "Draft") ||
          commonProps.status !== "Archived"
        ) {
          if (retries >= retryLimit) {
            setDiscussionThreadURL("ERROR");
            clearInterval(interval);
            setRetries(0);
            return;
          }
          try {
            console.log(`fetch Discussion try ${retries}/${retryLimit}`);
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
              clearInterval(interval); // Clear the interval if the URL is found
            }
          } catch (e) {
            console.error(e);
          } finally {
            setRetries((prev) => prev + 1);
          }
        }
      }, 1500);

      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(interval);
    }
  }, [discussionThreadURL, retries, commonProps.status]);

  return (
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

          {!discussionThreadURL && commonProps.status === "Discussion" && (
            <>
              <span className="font-medium">Discussion:</span>
              <Spinner size={"sm"} />
            </>
          )}

          {discussionThreadURL && discussionThreadURL !== "ERROR" && (
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

          {commonProps.snapshotSpace && commonProps.snapshotHash && (
            <>
              <span className="font-medium">Snapshot view:</span>
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
      </SpaceContext.Provider>
    </div>
  );
}
