import { StringParam, useQueryParams, withDefault } from "next-query-params";
import SpaceAction from "./SpaceAction";
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import FlyoutMenu, { MenuEntry } from "@/components/FlyoutMenu/FlyoutMenu";

function genOptions(
  setCycle: (c: string) => void,
  currentCycle: number | undefined
): MenuEntry[] {
  const allCycle: MenuEntry = {
    name: "All",
    description: "No filter",
    href: "#",
    onClick: () => setCycle("All"),
  };
  const newOptions: MenuEntry[] = [allCycle];
  if (currentCycle) {
    const nextCycle = currentCycle + 1;
    newOptions.push({
      name: `GC-${nextCycle} (Next)`,
      description: "Next cycle",
      href: "#",
      onClick: () => setCycle(`${nextCycle}`),
    });
    newOptions.push({
      name: `GC-${currentCycle} (Current)`,
      description: "Current cycle",
      href: "#",
      onClick: () => setCycle(`${currentCycle}`),
    });
    for (let i = currentCycle - 1; i >= 1; i--) {
      newOptions.push({
        name: `GC-${i}`,
        description: "",
        href: "#",
        onClick: () => setCycle(`${i}`),
      });
    }

    return newOptions;
  } else {
    return [{ name: "Loading", description: "", href: "#" }];
  }
}

export default function CycleSelectorAndSearchBar({
  currentCycle,
  keywordInput,
  setKeywordInput,
}: {
  currentCycle: number | undefined;
  keywordInput: string | undefined;
  setKeywordInput: (s: string) => void;
}) {
  const [query, setQuery] = useQueryParams({
    cycle: withDefault(StringParam, "All"),
  });
  const { cycle } = query;
  const options = genOptions(
    (c: string) => setQuery({ cycle: c }),
    currentCycle
  );

  return (
    <div className="flex flex-col space-x-0 space-y-2 md:flex-row md:justify-between md:space-x-8 md:space-y-0">
      <div className="flex grow">
        <div
          className="relative flex grow items-stretch focus-within:z-10"
          id="search-bar"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            name="keyword"
            id="keyword"
            className="block w-full rounded-l-md border-gray-300 pl-10 focus:border-[#0E76FD] focus:ring-[#0E76FD] sm:text-sm"
            placeholder="Search"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
          {keywordInput && keywordInput !== "" && (
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setKeywordInput("")}
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="-ml-px flex items-center rounded-r-md border-[1px] border-gray-300 bg-white p-3">
          <FlyoutMenu placement="left" entries={options}>
            <div className="flex items-center">
              <CalendarDaysIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <span className="text-xs text-gray-400">{cycle}</span>
            </div>
          </FlyoutMenu>
        </div>
      </div>

      <div className="flex space-x-4">
        <SpaceAction />
      </div>
    </div>
  );
}
