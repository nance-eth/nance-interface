import {
  useQueryParams,
  withDefault,
  createEnumParam,
} from "next-query-params";
import { useContext, useEffect } from "react";
import { ProposalContext } from "./context/ProposalContext";
import { classNames } from "@/utils/functions/tailwind";
import ProposalContent from "./ProposalContent";
import ProposalMetadata from "./sub/ProposalMetadata";
import ProposalActivityFeeds from "./sub/ProposalActivityFeeds";
import { useRouter } from "next/router";

export default function ProposalTabs() {
  const tabs = ["Content", "Activity", "Actions"];
  const router = useRouter();
  const [query, setQuery] = useQueryParams({
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    tab: withDefault(createEnumParam(tabs), "Content"),
  });

  const { commonProps } = useContext(ProposalContext);

  useEffect(() => {
    function correctContentTabOnLgScreen(
      width: number,
      tab: string,
      ready: boolean
    ) {
      const lgMinWidth = 1024;
      if (width >= lgMinWidth && tab === "Content" && ready) {
        setQuery({ tab: "Activity" });
      }
    }

    correctContentTabOnLgScreen(window.innerWidth, query.tab, router.isReady);
    // Handler to update screen size
    const handleResize = () => {
      correctContentTabOnLgScreen(window.innerWidth, query.tab, router.isReady);
    };

    // Add event listener on mount
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [query.tab, router.isReady]);

  return (
    <>
      <div>
        <div className="">
          <div className="border-b border-gray-200">
            {/* Activity tab is by default "active" on Large screen */}
            <nav aria-label="Tabs" className="-mb-px hidden lg:flex space-x-8">
              {tabs
                .filter((t) => t !== "Content")
                .map((tab) => (
                  <a
                    key={tab}
                    onClick={() => setQuery({ tab })}
                    aria-current={tab === query.tab ? "page" : undefined}
                    className={classNames(
                      tab === query.tab
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "whitespace-nowrap border-b-2 p-1 text-sm font-medium"
                    )}
                  >
                    {tab}
                  </a>
                ))}
            </nav>
            {/* Content tab is by default "active" otherwise */}
            <nav aria-label="Tabs" className="-mb-px flex lg:hidden space-x-8">
              {tabs.map((tab) => (
                <a
                  key={tab}
                  onClick={() => setQuery({ tab })}
                  aria-current={tab === query.tab ? "page" : undefined}
                  className={classNames(
                    tab === query.tab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 p-1 text-sm font-medium"
                  )}
                >
                  {tab}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div>
          <div
            className={classNames(
              "hidden mt-4 w-[90vw]",
              !query.tab && "max-lg:block",
              query.tab === "Content" && "max-lg:block"
            )}
          >
            <ProposalContent />
          </div>
          <div
            className={classNames(
              "mt-4 max-lg:w-[90vw]",
              !query.tab && "lg:block",
              query.tab === "Activity" && "block",
              query.tab !== "Activity" && "hidden"
            )}
          >
            <ProposalActivityFeeds />
          </div>
          <div
            className={classNames(
              "mt-4 max-lg:w-[90vw] overflow-x-auto",
              query.tab === "Actions" && "block",
              query.tab !== "Actions" && "hidden"
            )}
          >
            {commonProps.status !== "Draft" && <ProposalMetadata />}
          </div>
        </div>
      </div>
    </>
  );
}
