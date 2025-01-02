import {
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { ProposalContext } from "./context/ProposalContext";
import { useRouter } from "next/router";
import { classNames } from "@/utils/functions/tailwind";
import ProposalContent from "./ProposalContent";
import ProposalActivityFeeds from "./sub/ProposalActivityFeeds";
import ProposalMetadata from "./sub/ProposalMetadata";


const TABS = ["Content", "Activity", "Actions"] as const;
const LG_MIN_WIDTH = 1024;

export default function ProposalTabs() {
  const router = useRouter();
  const [query, setQuery] = useState<typeof TABS[number]>("Content");
  const { commonProps } = useContext(ProposalContext);

  // Memoize filtered tabs
  const filteredTabs = useMemo(() => {
    const tabs = TABS.filter(t => t !== "Content");
    if (commonProps.actions.length === 0) {
      return tabs.filter(t => t !== "Actions");
    }
    return tabs;
  }, [commonProps.actions]);

  useEffect(() => {
    const correctContentTab = () => {
      if (window.innerWidth >= LG_MIN_WIDTH && query === "Content" && router.isReady) {
        handleTabChange("Activity");
      }
    };

    correctContentTab();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(correctContentTab, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [query, router.isReady]);

  const handleTabChange = (tab: typeof TABS[number]) => {
    setQuery(tab);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab },
    });
  };

  const getTabClasses = useMemo(() => (isActive: boolean) =>
    classNames(
      isActive
        ? "border-indigo-500 text-indigo-600"
        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
      "whitespace-nowrap border-b-2 p-1 text-sm font-medium cursor-pointer"
    ),
    []
  );

  return (
    <div>
      <div className="border-b border-gray-200">
        {/* Large screen nav */}
        <nav aria-label="Tabs" className="-mb-px hidden lg:flex space-x-8">
          {filteredTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              aria-current={tab === query ? "page" : undefined}
              className={getTabClasses(tab === query)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Small screen nav */}
        <nav aria-label="Tabs" className="-mb-px flex lg:hidden space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              aria-current={tab === query ? "page" : undefined}
              className={getTabClasses(tab === query)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {(query === "Content" || (!query && window.innerWidth < LG_MIN_WIDTH)) && (
          <div className="hidden mt-4 w-[90vw] max-lg:block">
            <ProposalContent />
          </div>
        )}

        {(query === "Activity" || (!query && window.innerWidth >= LG_MIN_WIDTH)) && (
          <div className="mt-4 max-lg:w-[90vw] block">
            <ProposalActivityFeeds />
          </div>
        )}

        {query === "Actions" && commonProps.status !== "Draft" && (
          <div className="mt-4 max-lg:w-[90vw] overflow-x-auto block">
            <ProposalMetadata />
          </div>
        )}
      </div>
    </div>
  );
}
