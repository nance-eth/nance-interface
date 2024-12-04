import { SiteNav } from "@/components/Site";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import { ZERO_ADDRESS } from "@/constants/Contract";
import { getParagraphOfMarkdown } from "@/utils/functions/markdown";
import { useProposalVersion } from "@/utils/hooks/NanceHooks";
import { Switch } from "@headlessui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";

export default function ProposalVersionDiffPage() {
  const [splitView, setSplitView] = useState(false);
  const params = useParams<{
    space: string;
    proposal: string;
    hash: string;
  }>();
  const { data } = useProposalVersion(
    {
      space: params?.space,
      uuid: params?.proposal,
      hash: params?.hash,
    },
    !!params
  );
  const diff = data?.data;

  return (
    <>
      <SiteNav
        pageTitle={`Diff of ${diff?.toTitle} | ${params?.space}`}
        description={getParagraphOfMarkdown(diff?.toBody || "") || "No content"}
        image={`https://cdn.stamp.fyi/avatar/${ZERO_ADDRESS}?w=1200&h=630`}
        space={params?.space}
        withSiteSuffixInTitle={false}
      />

      <div className="flex flex-col items-center p-4 sm:p-6 bg-gray-50">
        <div className="breadcrumbs text-xl font-medium">
          <ul>
            {diff?.fromTitle !== diff?.toTitle && <li>{diff?.fromTitle}</li>}
            <li>
              <Link href={`/s/${params?.space}/${params?.proposal}`}>
                {diff?.toTitle}
              </Link>
            </li>
            {diff?.fromTitle === diff?.toTitle && <li>Diff</li>}
          </ul>
        </div>

        <ToggleSwitch
          label="Split view"
          enabled={splitView}
          setEnabled={setSplitView}
        />

        <div className="w-full max-w-screen-lg bg-white shadow-md rounded-lg overflow-auto mt-2">
          <ReactDiffViewer
            oldValue={diff?.fromBody}
            newValue={diff?.toBody}
            compareMethod={DiffMethod.WORDS}
            splitView={splitView}
            useDarkTheme={false}
            renderContent={(str) => (
              <span className="whitespace-pre-wrap break-words text-sm sm:text-base">
                {str}
              </span>
            )}
            styles={{
              diffContainer: {
                lineHeight: "1.5",
              },
              line: {
                padding: "0.5rem",
              },
            }}
          />
        </div>
      </div>
    </>
  );
}
