import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { classNames } from "@/utils/functions/tailwind";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import GenericTenderlySimulationButton from "../TenderlySimulation/GenericTenderlySimulationButton";

export interface TransactionEntry {
  title: JSX.Element;
  proposal: string;
  transactionData: SafeTransactionDataPartial;
}

// FIXME: selected entry only influence simulation button inside this table,
//   but not queue and export button.
export default function OrderCheckboxTable({
  address,
  entries,
  isLoading = false,
}: {
  address: string;
  entries: TransactionEntry[];
  isLoading: boolean;
}) {
  const checkbox = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedEntry, setSelectedEntry] =
    useState<TransactionEntry[]>(entries);

  useEffect(() => {
    setSelectedEntry(entries);
  }, [entries]);

  useLayoutEffect(() => {
    const isIndeterminate =
      selectedEntry.length > 0 && selectedEntry.length < entries.length;
    setChecked(selectedEntry.length === entries.length);
    setIndeterminate(isIndeterminate);
    checkbox.current!.indeterminate = isIndeterminate;
  }, [selectedEntry]);

  function toggleAll() {
    setSelectedEntry(checked || indeterminate ? [] : entries);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              {selectedEntry.length > 0 && (
                <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                  <GenericTenderlySimulationButton
                    rawAddress={address}
                    transactions={selectedEntry.map((e) => e.transactionData)}
                  />
                </div>
              )}
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        ref={checkbox}
                        checked={checked}
                        onChange={toggleAll}
                      />
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Proposal
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading && entries.length === 0 && (
                    <tr>
                      <td className="relative px-7 sm:w-12 sm:px-6"></td>
                      <td className="text-gray-900 max-w-[5rem] sm:max-w-sm py-4 pr-3 text-sm font-medium">
                        <div className="h-6 w-10 animate-pulse rounded bg-slate-200 text-sm leading-6 text-gray-900"></div>
                      </td>
                      <td className="break-words px-3 py-4 text-sm text-gray-500">
                        <div className="h-6 w-10 animate-pulse rounded bg-slate-200 text-sm leading-6 text-gray-900"></div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div className="h-6 w-10 animate-pulse rounded bg-slate-200 text-sm leading-6 text-gray-900"></div>
                      </td>
                    </tr>
                  )}

                  {!isLoading && entries.length === 0 && (
                    <tr>
                      <td className="relative px-7 sm:w-12 sm:px-6"></td>
                      <td className="text-gray-900 max-w-[5rem] sm:max-w-sm py-4 pr-3 text-sm font-medium"></td>
                      <td className="break-words px-3 py-4 text-sm text-gray-500">
                        No data
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500"></td>
                    </tr>
                  )}

                  {entries.map((entry, index) => (
                    <tr
                      key={index}
                      className={
                        selectedEntry.includes(entry) ? "bg-gray-50" : undefined
                      }
                    >
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        {selectedEntry.includes(entry) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                        )}
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          value={entry.transactionData.data}
                          checked={selectedEntry.includes(entry)}
                          onChange={(e) =>
                            setSelectedEntry(
                              e.target.checked
                                ? [...selectedEntry, entry]
                                : selectedEntry.filter((p) => p !== entry)
                            )
                          }
                        />
                      </td>
                      <td
                        className={classNames(
                          "max-w-[5rem] sm:max-w-sm py-4 pr-3 text-sm font-medium",
                          selectedEntry.includes(entry)
                            ? "text-indigo-600"
                            : "text-gray-900"
                        )}
                      >
                        {selectedEntry.includes(entry) && (
                          <span className="mr-2 underline">
                            {"No."}
                            {selectedEntry.indexOf(entry) + 1}
                          </span>
                        )}
                        {entry.title}
                      </td>
                      <td className="break-words px-3 py-4 text-sm text-gray-500">
                        {entry.proposal}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {entry.transactionData.data.slice(0, 8)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
