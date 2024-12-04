import Link from "next/link";
import { useContext } from "react";
import ProposalNavigator from "./ProposalNavigator";
import ProposalMetadata from "./ProposalMetadata";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import MarkdownViewer from "@/components/Markdown/MarkdownViewer";
import { ProposalContext } from "./context/ProposalContext";
import ProposalMenu from "./ProposalMenu";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import ProposalStatusMenu from "./ProposalStatusMenu";
import TooltipInfo from "../common/TooltipInfo";
import { formatNumber } from "@/utils/functions/NumberFormatter";
import ProposalHistory from "./ProposalHistory";

export default function ProposalContent() {
  const { commonProps, proposalIdPrefix } = useContext(ProposalContext);
  const proposalId = commonProps.proposalId;
  const sourceSnapshot = commonProps.uuid === "snapshot"; // hack
  const preTitleDisplay =
    proposalIdPrefix && proposalId ? `${proposalIdPrefix}${proposalId}: ` : "";
  const { body } = commonProps;

  return (
    <div className="">
      <div className="flex flex-col px-4 py-1 lg:py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="inline-block">
            <ProposalStatusMenu />
          </div>
          <div className="flex flex-row items-center space-x-5">
            <Link
              href={`/s/${commonProps.space}`}
              className="text-sm flex flex-row"
            >
              <ArrowLongLeftIcon className="h-5 w-5" /> &nbsp; back
            </Link>
            <ProposalMenu />
          </div>
        </div>
        <h1
          id="applicant-information-title"
          className="text-2xl font-medium mt-2"
        >
          {preTitleDisplay}
          {commonProps.title}
        </h1>

        <div className="mt-2 flex text-sm text-gray-500">
          by&nbsp;
          <span>
            {commonProps.author === "" ? (
              <div className="mb-1 text-sm font-medium text-gray-700 flex space-x-1 items-center">
                <span>Sponsor required</span>
                <TooltipInfo
                  content={`The intended author does not have sufficient voting power to submit a proposal.\
                    An address with atleast ${formatNumber(
                      commonProps.minVotingPowerSubmissionBalance
                    )}\
                    voting power must sponsor the proposal.`}
                />
              </div>
            ) : (
              <div className="flex flex-wrap">
                <FormattedAddress
                  address={commonProps.author}
                  style="text-gray-500"
                  overrideURLPrefix="/u/"
                  openInNewWindow={false}
                  minified
                  link
                />
                {commonProps.coauthors.map((coauthor, i) => (
                  <span key={coauthor} className="inline-flex">
                    {","}
                    <FormattedAddress
                      address={coauthor}
                      style="ml-1 text-gray-500"
                      openInNewWindow={false}
                      minified
                      link
                    />
                  </span>
                ))}
                <ProposalHistory />
              </div>
            )}
          </span>
        </div>
        {commonProps.status !== "Draft" && (
          <ProposalMetadata />
        )}
      </div>

      <div className="px-4 sm:px-6">
        <MarkdownViewer body={body} />
      </div>

      <div className="mt-4 px-4 py-5 sm:px-6">
        {!sourceSnapshot && <ProposalNavigator />}
      </div>
    </div>
  );
}
