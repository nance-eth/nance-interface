import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { classNames } from "@/utils/functions/tailwind";
import ProposalBadgeLabel from "./ProposalBadgeLabel";
import {
  Action,
  Proposal,
  Transfer,
  getActionsFromBody,
  getPayoutCountAmount,
} from "@nance/nance-sdk";
import { SpaceContext } from "@/context/SpaceContext";
import { useContext } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDaysIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import { formatNumber } from "@/utils/functions/NumberFormatter";
import TokenSymbol from "@/components/AddressCard/TokenSymbol";
import TooltipInfo from "@/components/common/TooltipInfo";
import Image from "next/image";

export function RequestingTokensOfProposal({ actions }: { actions: Action[] }) {
  // we only parse Payout and Transfer actions here
  const usd =
    actions
      ?.filter((action) => action.type === "Payout")
      .map((action) => {
        const { count, amount } = getPayoutCountAmount(action);
        return count * amount;
      })
      ?.reduce((sum, val) => sum + val, 0) || 0;
  const transferMap: { [key: string]: number } = {};
  actions
    ?.filter((action) => action.type === "Transfer")
    .map((action) => action.payload as Transfer)
    .forEach((transfer) => {
      return (transferMap[transfer.contract] =
        (transferMap[transfer.contract] || 0) + Number(transfer.amount));
    });

  if (usd === 0 && Object.entries(transferMap).length === 0) return null;

  const tokens = [];
  if (usd > 0) tokens.push(`$${formatNumber(usd)}`);
  Object.entries(transferMap).forEach((val) => {
    const [contract, amount] = val;
    if (tokens.length > 0) tokens.push(" + ");
    tokens.push(
      <span key={contract}>
        {formatNumber(amount)} <TokenSymbol address={contract} />
      </span>
    );
  });

  return (
    <div className="flex items-center gap-x-1">
      <BanknotesIcon className="h-6 w-6 flex-none rounded-full bg-gray-50" />
      <div>
        <p className="text-gray-500">Requesting</p>
        <div className="text-center text-black">{tokens}</div>
      </div>
    </div>
  );
}

export default function ProposalRow({
  proposal,
  snapshotProposal,
  isFirst = false,
  isDraft = false,
  proposalIdPrefix,
  votesBar = <></>,
  voteActionOrStatus = <></>,
}: {
  proposal: Proposal;
  snapshotProposal: SnapshotProposal | undefined;
  isFirst?: boolean;
  isDraft?: boolean;
  proposalIdPrefix?: string;
  votesBar?: JSX.Element;
  voteActionOrStatus?: JSX.Element;
}) {
  const spaceInfo = useContext(SpaceContext);

  const { proposalId, uuid, governanceCycle, status, authorAddress, title } =
    proposal;
  const actions = proposal?.actions || getActionsFromBody(proposal.body) || [];

  const votes = proposal.voteResults?.votes || "-";
  const proposalUrl = `/s/${spaceInfo?.name}/${proposalId || uuid}`;
  const proposalDate = proposal.createdTime
    ? format(new Date(proposal?.createdTime), "MM/dd/yy")
    : "";

  let votingInfo = "";
  if (snapshotProposal) {
    const quorumProgress = (
      (snapshotProposal.scores_total * 100) /
      snapshotProposal.quorum
    ).toFixed(0);
    const quorumLabel =
      snapshotProposal.quorum !== 0 ? `${quorumProgress}% of quorum, ` : "";
    const scoresLabel = snapshotProposal.choices
      .map((choice, index) => {
        const score = snapshotProposal.scores[index] ?? 0;
        const total = snapshotProposal.scores_total;
        const div = score / total;
        const percent = isNaN(div) ? 0 : div * 100;
        return (
          `${choice} ${formatNumber(score)} (${(percent).toFixed(0)}%)`
        );
      })
      .slice(0, 3)
      .join(", ");
    votingInfo = `${quorumLabel}${scoresLabel}`;
  } else if (
    proposal.status === "Cancelled" &&
    proposal.temperatureCheckVotes
  ) {
    const [yes, no] = proposal.temperatureCheckVotes;
    const quorum = yes + no;
    votingInfo = `${((quorum / 10) * 100).toFixed(
      0
    )}% of quorum, 👍 ${yes}, 👎 ${no}`;
  }

  return (
    <tr className="hover:bg-slate-100">
      <td
        className={classNames(
          isFirst ? "" : "border-t border-transparent",
          "relative hidden text-sm md:table-cell"
        )}
      >
        <Link href={proposalUrl}>
          <div className="py-7 pl-6 pr-3">
            <ProposalBadgeLabel status={status} />
          </div>
        </Link>

        {!isFirst ? (
          <div className="absolute -top-px left-6 right-0 h-px bg-gray-200" />
        ) : null}
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "text-sm text-gray-500"
        )}
      >
        <Link href={proposalUrl}>
          <div className="flex flex-col space-y-1 px-3 py-3.5 max-w-md">
            <div className="block text-gray-900 md:hidden">
              <ProposalBadgeLabel status={status} />
            </div>

            <p className="break-words text-base text-black">{title}</p>

            <div className="mt-2 flex flex-nowrap items-center gap-x-6 text-xs">
              {/* Author */}
              <div className="flex items-center gap-x-1">
                {!authorAddress ? (
                  <Image
                    src={`/images/unknown.png`}
                    alt=""
                    className="h-6 w-6 flex-none rounded-full bg-gray-50"
                  />
                ) : (
                  <Image
                    src={`https://cdn.stamp.fyi/avatar/${authorAddress}`}
                    alt=""
                    className="h-6 w-6 flex-none rounded-full bg-gray-50"
                  />
                )}
                <div>
                  <p className="text-gray-500">Author</p>
                  <div className="text-center text-black">
                    {!authorAddress ? (
                      <div className="mb-1 text-sm font-medium text-gray-700 flex space-x-1 items-center">
                        <span>Sponsor required</span>
                        <TooltipInfo
                          content={`The intended author does not have sufficient voting power to submit a proposal.\
                            An address with atleast\
                            ${formatNumber(
                        spaceInfo?.proposalSubmissionValidation
                          ?.minBalance || 0
                      )}\
                            voting power must sponsor the proposal.`}
                        />
                      </div>
                    ) : (
                      <FormattedAddress
                        address={authorAddress}
                        minified
                        copyable={false}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* Due / Cycle */}
              <div className="flex items-center gap-x-1">
                <CalendarDaysIcon className="h-6 w-6 flex-none rounded-full bg-gray-50" />
                <div>
                  <p className="text-gray-500">Cycle</p>
                  <div className="text-center text-black">
                    {governanceCycle}
                  </div>
                </div>
              </div>
              {/* Tokens */}
              <RequestingTokensOfProposal actions={actions} />
            </div>

            <p className="flex-wrap gap-x-1 text-xs text-gray-500 hidden md:flex">
              {votingInfo}
            </p>

            <div className="md:hidden">{votesBar}</div>
          </div>
        </Link>
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden text-left text-sm text-gray-500 md:table-cell"
        )}
      >
        <Link href={proposalUrl}>
          <div className="py-3.5 text-xs text-left text-gray-500 md:table-cell">
            {proposalDate}
          </div>
        </Link>
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden text-center text-sm text-gray-500 md:table-cell"
        )}
      >
        <Link href={proposalUrl}>
          <div className="px-3 py-8">{votesBar}</div>
        </Link>
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden text-center text-sm text-gray-500 md:table-cell"
        )}
      >
        <Link href={proposalUrl}>
          <div className="px-3 py-7">{votes}</div>
        </Link>
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden px-3 py-3.5 text-center text-sm text-gray-500 md:table-cell"
        )}
      >
        {voteActionOrStatus}
      </td>
    </tr>
  );
}
