import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { classNames } from "@/utils/functions/tailwind";

interface Includes {
  name?: string;
  id?: string;
  icon?: string;
}
interface GenericListboxProps<T> {
  /**
   * The selected value of the listbox
   */
  value: T;
  /**
   * The available items to display in the listbox
   */
  items: T[];
  /**
   * The function to call when the value of the listbox changes
   */
  onChange: (value: T) => void;
  /**
   * Whether the listbox is disabled
   */
  disabled?: boolean;
  /**
   * Whether the listbox is loading
   */
  loading?: boolean;
  /**
   * The label of the listbox
   */
  label: string;
}

/**
 * GenericListbox which supports icons
 */
export default function GenericListbox<T extends Includes>({
  value,
  items,
  onChange,
  disabled,
  loading,
  label,
}: GenericListboxProps<T>) {
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <>
          <Listbox.Label
            className={classNames(
              "block text-sm font-medium leading-6 text-gray-900",
              loading && "animate-pulse"
            )}
          >
            {label}
          </Listbox.Label>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                {value?.icon?.includes("https://") && (
                  <Image
                    src={value.icon}
                    alt=""
                    className="h-10 w-10 flex-shrink-0 rounded-full"
                    width={100}
                    height={100}
                  />
                )}
                <span className="ml-3 block truncate">{value?.name}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {items &&
                  items.length > 0 &&
                  items.map((item) => (
                    <Listbox.Option
                      key={item.id || "unknown"}
                      className={({ active }) =>
                        classNames(
                          active ? "bg-indigo-600 text-white" : "text-gray-900",
                          "relative cursor-default select-none py-2 pl-3 pr-9"
                        )
                      }
                      value={item}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            {item?.icon?.includes("https://") && (
                              <Image
                                src={item.icon}
                                alt=""
                                className="h-10 w-10 flex-shrink-0 rounded-full"
                                width={100}
                                height={100}
                              />
                            )}
                            <span
                              className={classNames(
                                selected ? "font-semibold" : "font-normal",
                                "ml-3 block truncate"
                              )}
                            >
                              {item.name}
                            </span>
                          </div>

                          {selected ? (
                            <span
                              className={classNames(
                                active ? "text-#2ecc71" : "text-indigo-600",
                                "absolute inset-y-0 right-0 flex items-center pr-4"
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
