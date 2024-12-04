import { SparklesIcon } from "@heroicons/react/24/solid";
import { ProposalContext } from "./context/ProposalContext";
import { useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { classNames } from "@/utils/functions/tailwind";
import { NANCE_API_URL } from "@/constants/Nance";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function ProposalSummaries() {
  const { proposalSummary, threadSummary } = useContext(ProposalContext);
  const { status: walletStatus } = useSession();
  const authenticated = walletStatus === "authenticated";

  const cantGetSummary = !proposalSummary && !threadSummary && !authenticated;

  return (
    <dialog id="summary_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        {cantGetSummary && <p className="text-error">No wallet connected</p>}

        {!cantGetSummary && (
          <div role="tablist" className="tabs tabs-lifted tabs-lg">
            <Summary type="Proposal" markdown={proposalSummary} />
            {!threadSummary && !authenticated ? null : (
              <Summary type="Discussion" markdown={threadSummary} />
            )}
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

const Summary = ({ type, markdown }: { type: string; markdown?: string }) => {
  const [summary, setSummary] = useState<string | undefined>(markdown);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const { commonProps } = useContext(ProposalContext);
  const { uuid, space } = commonProps;
  const _type = type === "Proposal" ? "proposal" : "thread";
  const { status: walletStatus } = useSession();
  const authenticated = walletStatus === "authenticated";

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummary(undefined);
    try {
      const res = await fetch(
        `${NANCE_API_URL}/${space}/summary/${_type}/${uuid}`
      );
      const { data, error } = await res.json();
      if (error) throw Error(error);
      setSummary(data);
    } catch (e: any) {
      toast.error(e.toString());
    }
    setSummaryLoading(false);
  };

  return (
    <>
      <input
        type="radio"
        name="summary_tabs"
        role="tab"
        className="tab"
        aria-label={type}
      />
      <div role="tabpanel" className="tab-content p-2">
        {summary && (
          <article className="prose mx-auto break-words text-gray-500">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
            >
              {summary?.replace(/^#/gm, "###")}
            </ReactMarkdown>
          </article>
        )}
        <div
          className={classNames(
            "mt-2 ml-2 justify-center text-cyan-500",
            !summaryLoading && "hover:cursor-pointer",
            authenticated ? "" : "hidden"
          )}
          onClick={async () => handleGenerateSummary()}
        >
          {summaryLoading ? (
            <SummarySkeleton />
          ) : (
            <div className="flex flex-row space-x-1">
              <SparklesIcon width={20} height={20} /> <p>Nancearize</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const SummarySkeleton = () => {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      <div className="w-full h-3 bg-gray-300 rounded-full" />
      <div className="w-full h-3 bg-gray-300 rounded-full" />
      <div className="w-full h-3 bg-gray-300 rounded-full" />
      <div className="w-full h-3 bg-gray-300 rounded-full" />
      <div className="w-full h-3 bg-gray-300 rounded-full" />
      <div className="w-full h-3 bg-gray-300 rounded-full" />
      <div className="w-full h-3 bg-gray-300 rounded-full" />
    </div>
  );
};
