import { Disclosure } from "@headlessui/react";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";
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
  {
    if (!proposalSummary && !threadSummary && !authenticated) return null;
  }
  return (
    <div className="rounded-md border bg-gray-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <dl className="mb-2 space-y-2 divide-y divide-gray-900/10">
            <Summary type="Proposal" markdown={proposalSummary} />
            {!threadSummary && !authenticated ? null : (
              <Summary type="Discussion" markdown={threadSummary} />
            )}
          </dl>
        </div>
      </div>
    </div>
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
    <Disclosure as="div" className="pt-2">
      {({ open }) => (
        <>
          <dt>
            <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
              <span className="text-base font-semibold leading-7">{`${type} Summary `}</span>
              <span className="ml-6 flex h-7 items-center">
                {open ? (
                  <MinusSmallIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </span>
            </Disclosure.Button>
          </dt>
          <Disclosure.Panel as="dd" className="mt-2 pr-12">
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
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
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
