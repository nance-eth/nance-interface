import { useContext } from "react";
import { ProposalContext } from "./context/ProposalContext";
import { formatNumber } from "@/utils/functions/NumberFormatter";
import TooltipInfo from "../common/TooltipInfo";
import FormattedAddress from "../AddressCard/FormattedAddress";
import { RequestingTokensOfProposal } from "../Space/sub/card/ProposalRow";
import { HomeIcon } from "@heroicons/react/24/solid";
import ProposalHistory from "./sub/ProposalHistory";
import ProposalMenu from "./sub/ProposalMenu";
import ProposalStatusMenu from "./sub/ProposalStatusMenu";
import Link from "next/link";
import { classNames } from "@/utils/functions/tailwind";

/**
 Including title, author, create/edit time and requesting tokens
 */
// IFXME proposal menu fail to work
export default function ProposalHeader() {
  const { commonProps, proposalIdPrefix, isLoading } =
    useContext(ProposalContext);
  const proposalId = commonProps.proposalId;
  const preTitleDisplay =
    proposalIdPrefix && proposalId ? `${proposalIdPrefix}${proposalId}` : "";

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="inline-block">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href={`/s/${commonProps.space}`}>
                  <HomeIcon className="w-4 h-4" />
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: `/s/${commonProps.space}`,
                    query: { cycle: commonProps.governanceCycle },
                  }}
                >
                  Cycle&nbsp;{commonProps.governanceCycle}
                </Link>
              </li>
              <li>
                {preTitleDisplay}
                <div className="ml-2">
                  <ProposalStatusMenu />
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-row items-center space-x-5">
          <ProposalMenu />
        </div>
      </div>
      <h1
        id="applicant-information-title"
        className={classNames(
          "text-2xl font-medium mt-2",
          isLoading && "skeleton h-16 w-80"
        )}
      >
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

      {commonProps.actions.filter(
        (a) => a.type === "Payout" || a.type === "Transfer"
      ).length > 0 && (
        <div className="rounded-md border bg-gray-100 shadow p-2 mt-2">
          Requesting
          <div className="ml-1 inline font-medium">
            <RequestingTokensOfProposal actions={commonProps.actions} />
          </div>
        </div>
      )}
    </div>
  );
}
