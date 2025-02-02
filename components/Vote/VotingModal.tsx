/* eslint-disable max-lines */
import { useState, Fragment, useEffect } from "react";
import useVotingPower from "@/utils/hooks/snapshot/VotingPower";
import { Dialog, RadioGroup, Transition } from "@headlessui/react";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import { XMarkIcon } from "@heroicons/react/24/solid";
import useVote from "@/utils/hooks/snapshot/Vote";
import { useForm } from "react-hook-form";
import { classNames } from "@/utils/functions/tailwind";
import Notification from "@/components/common/Notification";
import useVoteValidate from "@/utils/hooks/snapshot/Validate";
import useSnapshotSpaceInfo from "@/utils/hooks/snapshot/SpaceInfo";

const formatter = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  compactDisplay: "short",
});
const formatNumber = (num: number) => formatter.format(num);

interface VotingProps {
  modalIsOpen: boolean;
  closeModal: () => void;
  address: string | undefined;
  spaceId: string;
  spaceHideAbstain: boolean;
  proposal: SnapshotProposal;
  refetch: (option?: any) => void;
}

const SUPPORTED_VOTING_TYPES = [
  "single-choice",
  "basic",
  "weighted",
  "ranked-choice",
];

export default function VotingModal({
  modalIsOpen,
  closeModal,
  address,
  spaceId,
  spaceHideAbstain,
  proposal,
  refetch,
}: VotingProps) {
  // state
  const [choice, setChoice] = useState();
  const [reason, setReason] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  // external
  const { data: spaceInfo } = useSnapshotSpaceInfo(spaceId);
  const { data: vp } = useVotingPower(address, spaceId, proposal?.id || "");
  const { value: voteValidationResult } = useVoteValidate(
    spaceId,
    parseInt(proposal?.snapshot) || "latest",
    address,
    spaceInfo
  );
  const { trigger, value, loading, error, reset } = useVote(
    spaceId,
    proposal?.id,
    proposal?.type,
    choice as any,
    reason
  );

  // shorthand functions
  const submitVote = () => {
    //setNotificationEnabled(true);
    trigger().then(close).then(refetch);
  };
  const close = () => {
    setNotificationEnabled(false);
    reset();
    closeModal();
  };

  if (proposal === undefined) {
    return <div className="hidden">Proposal not selected</div>;
  }

  const hideAbstain = spaceHideAbstain && proposal.type === "basic";
  const totalScore = hideAbstain
    ? proposal.scores_total - (proposal?.scores[2] ?? 0)
    : proposal.scores_total;
  const symbol = spaceInfo?.symbol || "Tokens";

  const renderVoteButton = () => {
    let canVote = false;
    let label = "Close";

    if (address == "") {
      label = "Wallet not connected";
    } else if (loading) {
      label = "Loading...";
    } else if (!SUPPORTED_VOTING_TYPES.includes(proposal.type)) {
      label = "Not supported";
    } else if (choice === undefined) {
      label = "You need to select a choice";
    } else if (
      !voteValidationResult?.isValid &&
      voteValidationResult?.invalidMessage
    ) {
      label = voteValidationResult?.invalidMessage;
    } else if (vp > 0 && voteValidationResult?.isValid) {
      label = "Submit vote";
      canVote = true;
    } else {
      label = "Close";
    }

    return (
      <button
        type="button"
        disabled={!canVote}
        onClick={canVote ? submitVote : close}
        className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:bg-gray-400"
      >
        {label}
      </button>
    );
  };

  return (
    <Transition.Root show={modalIsOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        open={modalIsOpen}
        onClose={close}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 hidden bg-gray-500 bg-opacity-75 transition-opacity md:block" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              enterTo="opacity-100 translate-y-0 md:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 md:scale-100"
              leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
            >
              <Dialog.Panel className="flex w-full transform text-left text-base transition md:my-8 md:max-w-xl md:px-4">
                <div className="relative flex w-full items-center overflow-hidden rounded-lg bg-white px-4 pb-8 pt-14 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                  <button
                    type="button"
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 sm:right-6 sm:top-8 md:right-6 md:top-6 lg:right-8 lg:top-8"
                    onClick={close}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                    {!!value && (
                      <Notification
                        title="Vote result"
                        description="Success!"
                        show={notificationEnabled}
                        close={close}
                        checked={true}
                        autoClose={true}
                      />
                    )}
                    {error && (
                      <Notification
                        title="Vote result"
                        description={error.error_description || error.message}
                        show={notificationEnabled}
                        close={() => {
                          setNotificationEnabled(false);
                          reset();
                        }}
                        checked={false}
                      />
                    )}
                    <div className="sm:col-span-12 lg:col-span-12">
                      <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">
                        {proposal.title}
                      </h2>

                      <section
                        aria-labelledby="information-heading"
                        className="mt-4"
                      >
                        <h3 id="information-heading" className="sr-only">
                          Proposal information
                        </h3>

                        <div className="flex items-center">
                          <p className="text-lg text-gray-900 sm:text-xl">
                            Votes: {proposal.votes}
                          </p>

                          <div className="ml-4 border-l border-gray-300 pl-4">
                            <h4 className="sr-only">Scores</h4>
                            <div className="flex items-center">
                              <div className="flex items-center">
                                Scores: {formatNumber(totalScore)}
                              </div>
                              <p className="sr-only">
                                {totalScore} out of {proposal.quorum} quorum
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center">
                          <p className="ml-1 font-medium text-gray-500">
                            Voting power: {formatNumber(vp)} {symbol}
                          </p>
                        </div>

                        {!voteValidationResult?.isValid && (
                          <div className="mt-1 flex items-center">
                            <XMarkIcon
                              className="h-5 w-5 flex-shrink-0 text-red-500"
                              aria-hidden="true"
                            />
                            <p className="ml-1 font-medium text-gray-500">
                              Validation:{" "}
                              {voteValidationResult?.voteValidation.name}
                            </p>
                          </div>
                        )}
                      </section>

                      <section
                        aria-labelledby="options-heading"
                        className="mt-6"
                      >
                        <h3 id="options-heading" className="sr-only">
                          Voting options
                        </h3>

                        <form>
                          <div className="">
                            {/* Option selector */}
                            {(proposal.type == "single-choice" ||
                              proposal.type == "basic") && (
                              <BasicChoiceSelector
                                value={choice}
                                setValue={setChoice}
                                choices={proposal.choices}
                              />
                            )}
                            {proposal.type == "weighted" && (
                              <WeightedChoiceSelector
                                value={choice}
                                setValue={setChoice}
                                choices={proposal.choices}
                              />
                            )}
                            {proposal.type == "ranked-choice" && (
                              <RankedChoiceSelector
                                value={choice || []}
                                setValue={setChoice}
                                choices={proposal.choices}
                              />
                            )}
                          </div>
                          <div className="mt-2">
                            <label
                              htmlFor="comment"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Reason
                            </label>
                            <div className="mt-1">
                              <textarea
                                rows={3}
                                maxLength={140}
                                name="reason"
                                id="reason"
                                className="block w-full resize-none rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Vote button and error info */}
                          <div className="mt-6">{renderVoteButton()}</div>
                          {/* <div className="mt-6 text-center">
                            <a href="#" className="group inline-flex text-base font-medium">
                              <ShieldCheckIcon
                                className="flex-shrink-0 mr-2 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              <span className="text-gray-500 group-hover:text-gray-700">Lifetime Guarantee</span>
                            </a>
                          </div> */}
                        </form>
                      </section>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

interface SelectorProps {
  value: any;
  setValue: (value: any) => void;
  choices: string[];
}

function BasicChoiceSelector({ value, setValue, choices }: SelectorProps) {
  return (
    <RadioGroup value={value} onChange={setValue}>
      <RadioGroup.Label className="block text-sm font-medium text-gray-700">
        Options
      </RadioGroup.Label>
      <div className="mt-1 grid w-full grid-cols-1 gap-4">
        {choices.map((choice, index) => (
          <RadioGroup.Option
            as="div"
            key={choice}
            value={index + 1}
            className={({ active }) =>
              classNames(
                active ? "ring-2 ring-indigo-500" : "",
                "relative block cursor-pointer rounded-lg border border-gray-300 p-4 text-center focus:outline-none"
              )
            }
          >
            {({ active, checked }) => (
              <>
                <RadioGroup.Label
                  as="p"
                  className="text-base font-medium text-gray-900"
                >
                  {choice}
                </RadioGroup.Label>
                {/* <RadioGroup.Description as="p" className="mt-1 text-sm text-gray-500">
                  {size.description}
                </RadioGroup.Description> */}
                <div
                  className={classNames(
                    active ? "border" : "border-2",
                    checked ? "border-indigo-500" : "border-transparent",
                    "pointer-events-none absolute -inset-px rounded-lg"
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}

function WeightedChoiceSelector({
  value,
  setValue,
  choices,
}: Omit<SelectorProps, "value"> & {
  value: { [key: string]: number } | undefined;
}) {
  const { register, getValues, watch } = useForm();

  useEffect(() => {
    // sync form state
    const subscription = watch((_) => {
      const values = getValues();
      const newValue: { [key: string]: any } = {};
      // remove empty values
      for (const key in values) {
        const val = values[key];
        if (!isNaN(val) && val > 0) {
          newValue[key] = val;
        }
      }
      setValue(newValue);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const totalUnits = Object.values(value ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-1 grid grid-cols-1 gap-4">
      {choices.map((choice, index) => (
        <div
          key={choice}
          className="border-1 flex gap-2 rounded-lg border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <label className="w-3/5">{choice}</label>
          <input
            className="w-1/5 rounded-lg"
            type="number"
            placeholder="0"
            min={0}
            step={1}
            {...register((index + 1).toString(), {
              shouldUnregister: true,
              valueAsNumber: true,
            })}
          />
          <span className="w-1/5 italic">
            {isNaN(getValues((index + 1).toString())) || totalUnits == 0
              ? "0%"
              : `${Math.round(
                (getValues((index + 1).toString()) / totalUnits) * 100
              )}%`}
          </span>
        </div>
      ))}
    </div>
  );
}

function RankedChoiceSelector({
  value,
  setValue,
  choices,
}: Omit<SelectorProps, "value"> & {
  value: number[];
}) {
  function getOrderNumber(val: number) {
    const index = value.findIndex((v) => v === val);
    return index !== -1 ? `(No.${index + 1})` : "";
  }

  return (
    <div className="space-y-2">
      {choices.map((choice, index) => (
        <div
          key={choice}
          aria-label={choice}
          onClick={() => {
            const choiceVal = index + 1;
            if (value.includes(choiceVal)) {
              const newValue = value.filter((val) => val !== choiceVal);
              setValue(newValue);
            } else {
              const newValue = [...value, choiceVal];
              setValue(newValue);
            }
          }}
          className="group flex justify-between cursor-pointer rounded-lg border border-gray-300 px-6 py-4 shadow-sm focus:outline-none data-[focus]:border-indigo-600 data-[focus]:ring-2 data-[focus]:ring-indigo-600"
        >
          <p className="text-gray-500">{getOrderNumber(index + 1)}</p>

          <p className="font-medium text-gray-900 dark:text-white">{choice}</p>

          <p className="">
            {value.findIndex((v) => v === index + 1) !== -1 && (
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </p>

          <p
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-600"
          />
        </div>
      ))}
    </div>
  );
}
