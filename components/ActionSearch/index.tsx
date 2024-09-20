import { useContext, useEffect, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { Combobox } from "@headlessui/react";
import { classNames } from "@/utils/functions/tailwind";
import { SpaceContext } from "@/context/SpaceContext";
import { ActionPayload, useActions } from "@/utils/hooks/NanceHooks";
import ActionLabel from "../ActionLabel/ActionLabel";

interface ActionOption {
  value: string;
  payload: ActionPayload;
  stringValue: string;
  displayComponent: JSX.Element;
}

export default function ActionSearch({
  val,
  setVal,
  inputStyle = "",
}: {
  val: string | undefined;
  setVal: (v: string | undefined) => void;
  inputStyle?: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<ActionPayload | null>(
    null
  );

  const spaceInfo = useContext(SpaceContext);
  const spaceName = spaceInfo?.name || "";

  const { data, isLoading: loading } = useActions(
    { space: spaceName },
    !!spaceName
  );
  const options =
    data?.data?.map((r) => {
      return {
        value: r.action.uuid,
        payload: r,
        stringValue: `${JSON.stringify(r).toLowerCase()}`,
        displayComponent: (
          <ActionLabel action={r.action} space={spaceName} readonly />
        ),
      };
    }) || [];
  const filterOptions = options.filter((o) =>
    o.stringValue.includes(query.toLowerCase())
  );

  useEffect(() => {
    // sync selectedAction if val is present and query is empty
    const valPresent = !!val;
    if (
      valPresent &&
      selectedAction === null &&
      query.length === 0 &&
      !loading
    ) {
      const action = options.find((o) => o.value === val);
      if (action) {
        setSelectedAction(action.payload);
      } else {
        setVal("");
      }
    }
  }, [val, selectedAction, query, options, loading]);

  return (
    <>
      {selectedAction && (
        <div className="w-fit rounded-md border border-gray-300 bg-white p-2">
          <div className="flex items-center">
            <div className="flex flex-col">
              <ActionLabel
                action={selectedAction.action}
                space={spaceName}
                readonly
              />
              <p className="ml-4 text-gray-700">
                Proposal {selectedAction.proposal.id}-
                {selectedAction.proposal.title}
              </p>
            </div>
            <XCircleIcon
              onClick={() => {
                setSelectedAction(null);
                setVal("");
              }}
              className="ml-3 h-10 w-10 cursor-pointer text-gray-400"
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {!selectedAction && (
        <Combobox
          as="div"
          value={selectedAction}
          onChange={(a: ActionOption) => {
            setVal(a.payload.action.uuid);
            setSelectedAction(a.payload);
          }}
          className="w-full"
        >
          <div className="relative">
            <Combobox.Input
              className={classNames(
                "w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm",
                loading && "animate-pulse",
                inputStyle
              )}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>

            {(filterOptions?.length ?? 0) > 0 && (
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filterOptions?.map((o) => (
                  <Combobox.Option
                    key={o.payload.action.uuid}
                    value={o}
                    className={({ active }) =>
                      classNames(
                        "relative cursor-default select-none py-2 pl-3 pr-9",
                        active ? "bg-indigo-600 text-white" : "text-gray-900"
                      )
                    }
                  >
                    {({ active, selected }) => (
                      <>
                        <ActionLabel
                          action={o.payload.action}
                          space={spaceName}
                          readonly
                        />
                        <p className="ml-4 text-gray-700">
                          Proposal {o.payload.proposal.id}-
                          {o.payload.proposal.title}
                        </p>

                        {selected && (
                          <span
                            className={classNames(
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                              active ? "text-white" : "text-indigo-600"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        </Combobox>
      )}
    </>
  );
}
