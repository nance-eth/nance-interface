import { useEffect, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { Combobox } from "@headlessui/react";
import { useEtherscanContractABI } from "@/utils/hooks/EtherscanHooks";
import { FunctionFragment, Interface } from "ethers/lib/utils";
import { classNames } from "@/utils/functions/tailwind";

export default function FunctionSelector({
  address,
  val,
  setVal,
  setFunctionFragment,
  inputStyle = "",
  functionData = "",
}: {
  address: string;
  val: string;
  setVal: (v: any) => void;
  setFunctionFragment: (v: FunctionFragment) => void;
  inputStyle?: string;
  functionData?: string;
}) {
  const [query, setQuery] = useState("");
  const {
    data: abi,
    isLoading,
    error,
    isProxy,
  } = useEtherscanContractABI(address, address.length === 42);

  const ethersInterface = new Interface(abi || []);
  const fragmentMap: { [key: string]: FunctionFragment } = {};
  Object.values(ethersInterface.functions || {}).forEach(
    (f) => (fragmentMap[f.format("full")] = f),
  );

  const filteredOption =
    query === ""
      ? Object.keys(fragmentMap)
      : Object.keys(fragmentMap).filter((functionName) => {
        return functionName.toLowerCase().includes(query.toLowerCase());
      });

  useEffect(() => {
    if (functionData && abi) {
      try {
        const functionFragment = ethersInterface.getFunction(
          functionData.slice(0, 10),
        );
        const newVal = functionFragment.format("full");
        setVal(newVal);
        setFunctionFragment(functionFragment);
      } catch (e) {
        console.warn("FunctionSelector.getFunction error", e);
      }
    }
  }, [functionData, abi]);

  return (
    <Combobox
      as="div"
      value={val}
      onChange={(val: string) => {
        console.debug("set functionSelector val", val);
        setVal(val);
        try {
          setFunctionFragment(fragmentMap[val]);
        } catch (e) {
          console.warn("FunctionSelector.getFunction error", e);
        }
      }}
    >
      <div className="relative">
        <Combobox.Input
          className={classNames(
            "w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm",
            isLoading && "animate-pulse",
            inputStyle,
          )}
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(option: string) => option}
          placeholder={isLoading ? "Loading..." : error || "Select a function"}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredOption.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOption.map((option) => (
              <Combobox.Option
                key={option}
                value={option}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-indigo-600 text-white" : "text-gray-900",
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <span
                        className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-green-400"
                        aria-hidden="true"
                      />
                      <span
                        className={classNames(
                          "ml-3 truncate",
                          selected && "font-semibold",
                        )}
                      >
                        {option}
                      </span>
                    </div>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600",
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
  );
}
