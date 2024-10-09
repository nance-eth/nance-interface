import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CustomTransaction, SpaceInfo, Transfer } from "@nance/nance-sdk";
import { extractFunctionName } from "@/utils/functions/nance";
import { getContractLabel } from "@/constants/Contract";
import { Interface, parseUnits } from "ethers/lib/utils";
import { useActions } from "@/utils/hooks/NanceHooks";
import OrderCheckboxTable, {
  TransactionEntry,
} from "../form/OrderCheckboxTable";
import TransferActionLabel from "../ActionLabel/TransferActionLabel";
import CustomTransactionActionLabel from "../ActionLabel/CustomTransactionActionLabel";
import TransactionCreator from "./TransactionCreator";
import { safeBatchTransactionBuilder } from "@/utils/functions/safe";
import { downloadJSON } from "@/utils/functions/fileDownload";
import { getChainByNetworkName } from "config/custom-chains";
import { deepStringify } from "@/utils/functions/stringify";

const TOKEN_DECIMALS: { [contract: string]: number } = {
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": 6, // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": 6, // USDT
};

export default function QueueTransactionsModal({
  open,
  setOpen,
  transactorAddress,
  spaceInfo,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  transactorAddress?: string;
  spaceInfo: SpaceInfo;
}) {
  const space = spaceInfo?.name || "";
  const cycle = spaceInfo?.currentCycle.toString();

  //const [selectAllActions, setSelectAllActions] = useState(false);

  const { data: allActions, isLoading } = useActions({ space });

  // useEffect(() => {
  //   let _window = window as any;
  //   if (_window.Nance === undefined) {
  //     _window.Nance = {};
  //   }

  //   _window.Nance.selectAllActions = setSelectAllActions;
  // }, []);

  // Gather all actions in current fundingCycle
  const actionWithPIDArray = allActions?.data.map((p) => {
    return {
      pid: p.proposal.id,
      action: p.action,
    };
  });
  const transferActions = actionWithPIDArray?.filter(
    (v) => v.action.type === "Transfer"
  );
  const customTransactionActions = actionWithPIDArray?.filter(
    (v) => v.action.type === "Custom Transaction"
  );

  // Turn them into entries with constructed transaction data
  const erc20 = new Interface([
    "function transfer(address to, uint256 amount) external returns (bool)",
  ]);
  const transferEntries: TransactionEntry[] =
    transferActions?.map((v) => {
      const transfer = v.action.payload as Transfer;
      const amount = String(transfer.amount);
      let decimals = transfer.decimals;
      if (!decimals) {
        decimals = TOKEN_DECIMALS[transfer.contract] || 18;
      }
      return {
        title: <TransferActionLabel action={v.action} />,
        proposal: v.pid.toString(),
        transactionData: {
          to:
            getContractLabel(transfer.contract) === "ETH"
              ? transfer.to
              : transfer.contract,
          value:
            getContractLabel(transfer.contract) === "ETH"
              ? parseUnits(amount, decimals).toString()
              : "0",
          data:
            getContractLabel(transfer.contract) === "ETH"
              ? "0x"
              : erc20.encodeFunctionData("transfer", [
                  transfer.to,
                  parseUnits(amount, decimals),
                ]),
        },
      };
    }) || [];

  const customTransactionEntries: TransactionEntry[] =
    customTransactionActions?.map((v) => {
      const customTransaction = v.action.payload as CustomTransaction;
      const contractInterface = new Interface([customTransaction.functionName]);
      const functionName = extractFunctionName(customTransaction.functionName);
      const args = customTransaction.args.map((arg) => {
        return arg.value;
      });

      return {
        title: (
          <CustomTransactionActionLabel
            action={v.action}
            space={space}
            uuid={v.action.uuid}
          />
        ),
        proposal: v.pid.toString(),
        transactionData: {
          to: customTransaction.contract,
          value: customTransaction.value,
          data: contractInterface.encodeFunctionData(functionName, args),
        },
      };
    }) || [];
  const entries = transferEntries.concat(customTransactionEntries);
  const actions = (transferActions || []).concat(
    customTransactionActions || []
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:p-6 md:max-w-2xl">
                <div className="sm:flex sm:justify-center">
                  <div className="mt-3 text-left sm:mx-4 xl:mx-6 sm:mt-0">
                    <div className="flex justify-between">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900 px-2 md:px-4"
                      >
                        Queue Transactions
                      </Dialog.Title>

                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                      </button>
                    </div>

                    <OrderCheckboxTable
                      address={transactorAddress || ""}
                      entries={entries}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <div className="w-full sm:w-auto sm:ml-3">
                    <TransactionCreator
                      address={transactorAddress || ""}
                      transactions={entries.map((e) => e.transactionData)}
                    />
                  </div>

                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => {
                      const chainId = getChainByNetworkName(
                        spaceInfo.transactorAddress?.network
                      )?.id;
                      const json = safeBatchTransactionBuilder(
                        space,
                        chainId || 1,
                        cycle || "",
                        transactorAddress || "",
                        actions
                          ?.filter((x) => x?.action !== undefined)
                          .map((x) => x!.action) || []
                      );
                      downloadJSON(
                        `${space}_GC${cycle}_safe_batch`,
                        deepStringify(json)
                      );
                    }}
                  >
                    Export
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
