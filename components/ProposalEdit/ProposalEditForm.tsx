/* eslint-disable max-lines */
"use client";
import { CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useContext, useState, useEffect } from "react";
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from "react-hook-form";
import { useProposalUpload } from "@/utils/hooks/NanceHooks";
import {
  CustomTransaction,
  Proposal,
  ProposalStatus,
  ProposalUploadRequest,
  actionsToYaml,
  // ===== SIGNATURE BASED AUTHENTICATION =====
  // formatSnapshotProposalMessage,
  // domain,
  // SnapshotTypes,
  // ==========================================
  getActionsFromBody,
  trimActionsFromBody,
} from "@nance/nance-sdk";
import MiddleStepModal from "../modal/MiddleStepModal";
import Actions from "./Actions";
import { driverSteps } from "./GuideSteps";
import useLocalStorage from "@/utils/hooks/LocalStorage";
import { getUnixTime } from "date-fns";
import { ProposalMetadataContext } from "./context/ProposalMetadataContext";
import { NANCE_DEFAULT_IPFS_GATEWAY, TEMPLATE } from "@/constants/Nance";
import { SpaceContext } from "@/context/SpaceContext";
import { useAccount } from "wagmi";
import "@nance/nance-editor/lib/css/editor.css";
import "@nance/nance-editor/lib/css/dark.css";
import { GetMarkdown, SetMarkdown } from "@nance/nance-editor";
import ProposalLocalCache, { ProposalCache } from "./ProposalLocalCache";
import { discordMessage } from "@/utils/functions/discord";
import { fetchVotingPowerWithoutProposal } from "@/utils/hooks/snapshot/VotingPower";
import { useSWRConfig } from "swr";

// Have to use dynamic import to avoid SSR issues (maybe theres a better way??)
let getMarkdown: GetMarkdown;
let setMarkdown: SetMarkdown;

const NanceEditor = dynamic(
  async () => {
    getMarkdown = (await import("@nance/nance-editor")).getMarkdown;
    setMarkdown = (await import("@nance/nance-editor")).setMarkdown;
    return import("@nance/nance-editor").then((mod) => mod.NanceEditor);
  },
  {
    ssr: false,
  }
);

const fileUploadIPFS = {
  gateway: NANCE_DEFAULT_IPFS_GATEWAY,
  auth: `Basic ${Buffer.from(
    `${process.env.NEXT_PUBLIC_INFURA_IPFS_ID}:${process.env.NEXT_PUBLIC_INFURA_IPFS_SECRET}`
  ).toString("base64")}`,
};

const ResultModal = dynamic(() => import("../modal/ResultModal"), {
  ssr: false,
});

const UIGuide = dynamic(() => import("@/components/common/UIGuide"), {
  ssr: false,
});

type ProposalFormValues = { proposal: Proposal };

type ICustomTransaction = CustomTransaction & { tenderlyStatus: string };

interface MiddleStepInfo {
  title: string;
  description: string;
  warning?: boolean;
  onContinue: () => void;
}

const CACHE_VERSION = 1;

export default function ProposalEditForm({ space }: { space: string }) {
  // query and context
  const router = useRouter();
  const metadata = useContext(ProposalMetadataContext);
  const spaceInfo = useContext(SpaceContext);

  // state
  const [formErrors, setFormErrors] = useState<string>("");
  const [proposalUploadStatus, setProposalUploadStatus] =
    useState<ProposalStatus>("Discussion");
  const [middleStepInfo, setMiddleStepInfo] = useState<MiddleStepInfo>();
  const [submitError, setSubmitError] = useState<Error>();
  const [processingSubmission, setProcessingSubmission] = useState(false);

  // hooks
  const { address } = useAccount();
  // const { signTypedDataAsync } = useSignTypedData(); // ===== SIGNATURE BASED AUTHENTICATION =====
  const [proposalCache, setProposalCache] = useLocalStorage<ProposalCache>(
    "ProposalCache",
    CACHE_VERSION,
    { version: CACHE_VERSION, title: "", body: "", timestamp: 0 }
  );
  const { mutate } = useSWRConfig();

  const proposalId = metadata.fork ? undefined : metadata.loadedProposal?.uuid;
  const {
    isMutating,
    error: uploadError,
    trigger,
    data,
    reset,
  } = useProposalUpload(space, proposalId, router.isReady);

  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();

  const isNew = metadata.fork || metadata.loadedProposal === undefined;

  // form
  const methods = useForm<ProposalFormValues>({ mode: "onBlur" });
  const { register, handleSubmit, control, formState, getValues, setValue } =
    methods;

  const onSubmit: SubmitHandler<ProposalFormValues> = async (formData) => {
    try {
      const minVp = spaceInfo?.proposalSubmissionValidation?.minBalance || 0;
      let vpMiddleStep: MiddleStepInfo | undefined = undefined;
      if (minVp > 0) {
        const vp = await fetchVotingPowerWithoutProposal(
          address || "",
          spaceInfo?.snapshotSpace || ""
        );
        if (vp < minVp && !metadata.loadedProposal?.authorAddress) {
          vpMiddleStep = {
            title: "You can only save as Draft",
            description: `You don't have enough voting power (${minVp} Token) to publish, but you can save this proposal as Draft for now.`,
            warning: true,
            onContinue: () => {
              // save as Draft so user won't lost the changes
              setProposalUploadStatus("Draft");
              processAndUploadProposal(formData, "Draft");
            },
          };
        }
      }

      // check if actions all passed simulation
      const _allSimulated =
        getValues("proposal.actions")?.filter(
          (a) =>
            a.type === "Custom Transaction" &&
            (a.payload as ICustomTransaction).tenderlyStatus !== "true"
        ).length === 0;

      if (
        formData.proposal.body.toLowerCase().includes("pay" || "send") &&
        formData.proposal?.actions?.length === 0
      ) {
        setMiddleStepInfo({
          title: "Did you forget to add an action?",
          description:
            "You mention doing something but didn't attach an action. Consider adding one!",
          warning: true,
          onContinue: vpMiddleStep
            ? () => setMiddleStepInfo(vpMiddleStep)
            : () => processAndUploadProposal(formData),
        });
        return;
      }

      if (_allSimulated) {
        if (vpMiddleStep) {
          setMiddleStepInfo(vpMiddleStep);
        } else {
          processAndUploadProposal(formData);
        }
      } else {
        setMiddleStepInfo({
          title: "Submit will fail, please check the following",
          description:
            "You have some transactions may failed based on simulations.\n",
          onContinue: vpMiddleStep
            ? () => setMiddleStepInfo(vpMiddleStep)
            : () => processAndUploadProposal(formData),
        });
      }
    } catch (e) {
      setSubmitError(e as Error);
    }
  };
  const processAndUploadProposal: (
    formData: ProposalFormValues,
    overrideStatus?: ProposalStatus
  ) => void = async (formData, overrideStatus) => {
    let uuid;
    if (!isNew && metadata?.loadedProposal) {
      uuid = metadata.loadedProposal.uuid;
    }

    // transform cycleStart and count to governanceCycles
    const actions = formData.proposal.actions?.map((action) => {
      const payloadForm = action.payload as any as {
        count: string;
        cycleStart: string;
        pollRequired: boolean;
      };
      const count = parseInt(payloadForm.count);
      const cycleStart = parseInt(payloadForm.cycleStart);

      const newAction = {
        ...action,
        governanceCycles: Array.from(
          { length: count },
          (_, i) => cycleStart + i
        ),
        pollRequired: payloadForm.pollRequired,
        payload: action.payload,
      };
      // These two values has been transformed to governanceCycles
      delete (action.payload as any).count;
      delete (action.payload as any).cycleStart;
      // This value has been moved to upper level
      delete (action.payload as any).pollRequired;
      return newAction;
    });

    // To resolve wrong escaped dot after hyphen
    const originalBody = formData.proposal.body;
    const proposalBody = originalBody.replaceAll("\\.", ".");
    if (originalBody !== proposalBody) {
      console.debug("Replaced escaped dot", {
        original: originalBody,
        new: proposalBody,
      });
    }

    const body = `${proposalBody}\n\n${actionsToYaml(actions)}`;
    const proposal = {
      ...formData.proposal,
      body,
      status:
        overrideStatus ||
        (metadata.loadedProposal?.status === "Temperature Check" && !isNew
          ? "Temperature Check"
          : proposalUploadStatus),
    };

    if (!address) {
      throw new Error("Please connect the wallet first.");
    }
    if (!spaceInfo?.snapshotSpace) {
      throw new Error(
        "Please contact support to configure snapshotSpace for this space."
      );
    }
    // ===== SIGNATURE BASED AUTHENTICATION =====
    // const message = formatSnapshotProposalMessage(address, proposal, spaceInfo.snapshotSpace, new Date(), new Date());
    // signTypedDataAsync({
    //   types: SnapshotTypes.proposalTypes,
    //   primaryType: "Proposal",
    //   domain,
    //   message: message as SnapshotTypes.Proposal as any,
    // }).then(async (signature) => {
    // ==========================================
    const req: ProposalUploadRequest = {
      proposal,
      // ===== SIGNATURE BASED AUTHENTICATION =====
      // signature,
      // address,
      // ==========================================
    };

    setProcessingSubmission(true);
    trigger(req)
      .then(async (res) => {
        // clear local cache
        setProposalCache({
          version: CACHE_VERSION,
          title: "",
          body: "",
          timestamp: 0,
        });
        console.debug("📗 Nance.editProposal.onSignSuccess ->", res);

        // revalidate proposalId path of this proposal for useSWR
        //   since the uuid path will be revalidated by useSWRMutation
        //   related doc: https://swr.vercel.app/docs/mutation
        const proposalId = metadata.loadedProposal?.proposalId;
        if (proposalId) {
          const _url = `/${space}/proposal/${proposalId}`;
          console.debug("mutate", _url);
          await mutate(_url);
        }

        if (res?.data && res.data.uuid) {
          // this is assuming updating existed proposal won't update the proposalId
          router.push(
            `/s/${space}/${res.data.uuid}`,
            `/s/${space}/${proposalId || res.data.uuid}`
          );
        }
      })
      .catch((err) => {
        console.warn("📗 Nance.editProposal.onSignError ->", err);
        setProcessingSubmission(false);
        // let next catch work, display error in modal.
        throw err;
      });
    // }); // ===== SIGNATURE BASED AUTHENTICATION =====
  };

  // shortcut
  const error = uploadError || submitError;

  useEffect(() => {
    if (formState.errors && Object.keys(formState.errors).length > 0) {
      const actionErrors = formState.errors.proposal?.actions || [];
      const arr: any = [];
      actionErrors.forEach?.((e, i) => {
        if (e) {
          arr.push(i);
        }
      });
      setFormErrors("in actions " + arr.join(", "));
    } else {
      setFormErrors("");
    }
  }, [formState.errors]);

  return (
    <FormProvider {...methods}>
      {error && (
        <ResultModal
          title="Error"
          description={error.message || error}
          buttonText="Send Support Alert"
          onClick={async () => {
            const discordSupportResponse = await fetch("/api/discord/contact", {
              method: "POST",
              body: JSON.stringify(
                discordMessage({
                  page: "edit",
                  space: space,
                  author: address,
                  error: error.message,
                })
              ),
            });
            const url = await discordSupportResponse.json();
            console.log(url);
            reset();
            setSubmitError(
              new Error("Message sent our team will take a look!")
            );
          }}
          isSuccessful={false}
          shouldOpen={true}
          close={() => {
            reset();
            setSubmitError(undefined);
          }}
        />
      )}

      <UIGuide name="EditPage" steps={driverSteps} />
      {middleStepInfo && (
        <MiddleStepModal
          open={middleStepInfo !== undefined}
          setOpen={(v) => {
            if (!v) {
              setMiddleStepInfo(undefined);
            }
          }}
          title={middleStepInfo.title}
          warning={middleStepInfo.warning}
          description={middleStepInfo.description}
          onContinue={middleStepInfo.onContinue}
        />
      )}
      <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Actions
          loadedActions={
            (metadata.fork
              ? metadata.loadedProposal?.actions
              : getActionsFromBody(metadata?.loadedProposal?.body)) || []
          }
        />

        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div>
            <div>
              <div className="mb-2">
                <ProposalLocalCache
                  proposalCache={proposalCache}
                  clearProposalCache={() => {
                    setProposalCache({
                      version: CACHE_VERSION,
                      title: "",
                      body: "",
                      timestamp: 0,
                    });
                  }}
                  restoreProposalCache={(title, body) => {
                    setValue("proposal.title", title);
                    setMarkdown(body);
                  }}
                />
              </div>

              <div className="gap-6">
                <div id="proposal-title">
                  <input
                    type="text"
                    {...register("proposal.title", {
                      value: metadata.loadedProposal?.title || "Proposal Title",
                      onChange: async (e) => {
                        setProposalCache({
                          version: CACHE_VERSION,
                          title: e.target.value,
                          body: getMarkdown() || "",
                          timestamp: getUnixTime(new Date()),
                        });
                      },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 text-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="mt-4" id="proposal-body">
                  <Controller
                    name="proposal.body"
                    control={control}
                    defaultValue={
                      trimActionsFromBody(metadata.loadedProposal?.body) ||
                      TEMPLATE
                    }
                    render={({ field: { onChange } }) => (
                      <NanceEditor
                        initialValue={
                          trimActionsFromBody(metadata.loadedProposal?.body) ||
                          TEMPLATE
                        }
                        onEditorChange={(value) => {
                          setProposalCache({
                            version: CACHE_VERSION,
                            title: getValues("proposal.title"),
                            body: value,
                            timestamp: getUnixTime(new Date()),
                          });

                          onChange(value);
                        }}
                        fileUploadIPFS={fileUploadIPFS}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            <CheckCircleIcon className="mr-1 inline h-5 w-5" />
            Drag and drop markdown file or image to attach content (images are
            pinned to IPFS)
          </p>
        </div>

        <div className="flex flex-col justify-end" id="submit-button-div">
          {status === "unauthenticated" && (
            <div className="flex w-full space-x-2 justify-end">
              <button
                type="button"
                onClick={() => openConnectModal?.()}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {status !== "unauthenticated" && (
            <div className="flex w-full space-x-4 justify-end pr-8">
              <button
                type="submit"
                disabled={processingSubmission}
                onClick={() => {
                  setProposalUploadStatus("Draft");
                }}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:text-white disabled:bg-gray-400"
              >
                {processingSubmission && proposalUploadStatus === "Draft" && (
                  <ArrowPathIcon
                    className="mr-1 h-5 w-5 animate-spin text-white"
                    aria-hidden="true"
                  />
                )}
                Save Draft
              </button>

              <button
                type="submit"
                disabled={processingSubmission}
                onClick={() => {
                  setProposalUploadStatus("Discussion");
                }}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                {processingSubmission &&
                  proposalUploadStatus === "Discussion" && (
                    <ArrowPathIcon
                      className="mr-1 h-5 w-5 animate-spin text-white"
                      aria-hidden="true"
                    />
                  )}
                Publish
              </button>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
