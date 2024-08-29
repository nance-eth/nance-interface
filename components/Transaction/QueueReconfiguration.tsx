import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BigNumber, utils } from "ethers";
import { useReconfig } from "@/utils/hooks/NanceHooks";
import {
  calcDiffTableData,
  compareReserves,
  comparePayouts,
} from "@/utils/functions/juicebox";
import useControllerOfProject from "@/utils/hooks/juicebox/ControllerOfProject";
import useProjectInfo from "@/utils/hooks/juicebox/ProjectInfo";
import { useReconfigurationOfProject } from "@/utils/hooks/juicebox/ReconfigurationOfProject";
import parseSafeJuiceboxTx from "@/utils/functions/SafeJuiceboxParser";
import TransactionCreator from "@/components/Transaction/TransactionCreator";
import DiffTableWithSection from "../form/DiffTableWithSection";
import GenericTenderlySimulationButton from "../TenderlySimulation/GenericTenderlySimulationButton";

export default function QueueReconfigurationModal({
  open,
  setOpen,
  juiceboxProjectId,
  space,
  currentCycle,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  juiceboxProjectId: number;
  space: string;
  currentCycle: number | undefined;
}) {
  const cancelButtonRef = useRef(null);

  // Get configuration of current fundingCycle
  const projectId = juiceboxProjectId;
  const { data: projectInfo, loading: infoIsLoading } = useProjectInfo(
    3,
    projectId
  );
  const owner = projectInfo?.owner ? utils.getAddress(projectInfo.owner) : "";
  const { value: controller } = useControllerOfProject(projectId);
  const { value: currentConfig, loading: configIsLoading } =
    useReconfigurationOfProject(projectId);
  const { data: newConfigResponse } = useReconfig(space);

  const encodeReconfiguration = newConfigResponse?.data.encoded || "";
  const newConfig = parseSafeJuiceboxTx(
    encodeReconfiguration,
    "",
    currentConfig.fundingCycle.fee,
    BigNumber.from(Math.floor(Date.now() / 1000))
  );

  // Get registered payouts
  const previousCycle = currentCycle
    ? (currentCycle - 1).toString()
    : undefined;

  // Splits with changes
  const payoutsDiff = comparePayouts(
    currentConfig,
    newConfig,
    currentConfig.payoutMods || [],
    newConfig?.payoutMods || []
  );

  const reservesDiff = compareReserves(
    currentConfig.ticketMods || [],
    newConfig?.ticketMods || []
  );

  const loading = infoIsLoading || configIsLoading;

  const tableData = calcDiffTableData(
    currentConfig,
    newConfig,
    payoutsDiff,
    reservesDiff
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Queue Juicebox Cycle
                    </Dialog.Title>

                    <div className="flex h-12 items-center space-x-3 bg-white sm:ml-3 justify-center sm:justify-start">
                      <GenericTenderlySimulationButton
                        rawAddress={owner}
                        transactions={[
                          {
                            to: controller?.address || "",
                            value: "0",
                            data: encodeReconfiguration,
                          },
                        ]}
                      />
                    </div>

                    <DiffTableWithSection
                      space={space}
                      tableData={tableData}
                      loading={loading}
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <div className="sm:ml-3 sm:w-auto">
                    <TransactionCreator
                      address={owner}
                      transactions={[
                        {
                          to: controller?.address || "",
                          value: "0",
                          data: encodeReconfiguration,
                        },
                      ]}
                    />
                  </div>

                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
