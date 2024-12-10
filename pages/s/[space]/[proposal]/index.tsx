import { useProposalsByID } from "@/utils/hooks/snapshot/Proposals";
import { getLastSlash } from "@/utils/functions/nance";
import Custom404 from "../../../404";
import ProposalContent from "@/components/Proposal/ProposalContent";
import ProposalLoading from "@/components/Proposal/ProposalLoading";
import { getParagraphOfMarkdown } from "@/utils/functions/markdown";
import { ZERO_ADDRESS } from "@/constants/Contract";
import { Footer, SiteNav } from "@/components/Site";
import {
  ProposalCommonProps,
  ProposalContext,
} from "@/components/Proposal/context/ProposalContext";
import { STATUS } from "@/constants/Nance";
import { useProposal } from "@/utils/hooks/NanceHooks";
import { useParams } from "next/navigation";
import ProposalTabs from "@/components/Proposal/ProposalTabs";
import ProposalHeader from "@/components/Proposal/ProposalHeader";
import ProposalOptions from "@/components/Proposal/sub/ProposalOptions";
import ProposalVoteOverview from "@/components/Proposal/sub/ProposalVoteOverview";

export default function NanceProposalPage() {
  const params = useParams<{ space: string; proposal: string }>();
  const args = { space: params?.space, uuid: params?.proposal };
  const space = args.space;
  const {
    data,
    isLoading: nanceProposalLoading,
    mutate: mutateNanceProposal,
  } = useProposal(args, !!params);
  const proposal = data?.data;
  const proposalHash = getLastSlash(proposal?.voteURL);

  const skipSnapshotProposalsQuery = proposalHash === "";
  const {
    data: { proposalsData },
    loading: proposalsLoading,
    refetch: refetchSnapshotProposal,
  } = useProposalsByID([proposalHash], "", skipSnapshotProposalsQuery);

  // it takes some time to enable votesQuery after proposalQuery succeed
  //   this should be consider as loading state.
  const willLoadSnapshotProposalsQuery =
    data !== undefined &&
    !skipSnapshotProposalsQuery &&
    proposalsData === undefined;
  const isLoading =
    nanceProposalLoading ||
    proposalsLoading ||
    willLoadSnapshotProposalsQuery ||
    // If used in Pages Router, useParams will return null on the initial render
    //   and updates with properties following the rules above once the router is ready.
    !params;

  const snapshotProposal = proposalsData?.[0];

  if (isLoading) {
    return <ProposalLoading />;
  }

  if (!proposal) {
    return (
      <Custom404 errMsg="Proposal not found on Nance platform, you can reach out in Discord or explore on the home page." />
    );
  }

  const status = () => {
    if (proposal.uuid === "snapshot" && snapshotProposal) {
      const pass = snapshotProposal.scores[0] > snapshotProposal.scores[1];
      if (snapshotProposal?.state === "closed" && pass) {
        return STATUS.APPROVED;
      } else if (snapshotProposal?.state === "closed" && !pass) {
        return STATUS.CANCELLED;
      } else {
        return STATUS.VOTING;
      }
    }
    return proposal.status;
  };
  const commonProps: ProposalCommonProps = {
    space,
    snapshotSpace: proposal.proposalInfo.snapshotSpace || "",
    status: status(),
    title: proposal.title,
    author: proposal.authorAddress || snapshotProposal?.author || "",
    coauthors: proposal.coauthors || [],
    body: proposal.body || "",
    created: proposal.createdTime
      ? Math.floor(new Date(proposal.createdTime).getTime() / 1000)
      : snapshotProposal?.start || 0,
    edited: Math.floor(
      new Date(proposal?.lastEditedTime || "").getTime() / 1000
    ),
    voteStart: snapshotProposal?.start || 0,
    voteEnd: snapshotProposal?.end || 0,
    snapshot: snapshotProposal?.snapshot || "",
    snapshotHash: proposal.voteURL || "",
    ipfs: snapshotProposal?.ipfs || proposal.ipfsURL || "",
    discussion: proposal.discussionThreadURL || "",
    governanceCycle: proposal.governanceCycle,
    uuid: proposal.uuid || "",
    actions: proposal.actions || [],
    proposalId: proposal.proposalId ? String(proposal.proposalId) : undefined,
    minTokenPassingAmount: proposal.proposalInfo.minTokenPassingAmount || 0,
    minVotingPowerSubmissionBalance:
      proposal.proposalInfo.minVotingPowerSubmissionBalance || 0,
  };

  return (
    <>
      <SiteNav
        pageTitle={`${proposal.title} | ${space}`}
        description={getParagraphOfMarkdown(commonProps.body) || "No content"}
        image={`https://cdn.stamp.fyi/avatar/${
          commonProps.author || ZERO_ADDRESS
        }?w=1200&h=630`}
        space={space}
        proposalId={proposal?.voteURL}
        withWallet
        withSiteSuffixInTitle={false}
      />
      <div className="min-h-full">
        <main className="py-2">
          <ProposalContext.Provider
            value={{
              commonProps,
              proposalInfo: snapshotProposal || undefined,
              proposalIdPrefix: proposal.proposalInfo.proposalIdPrefix,
              nextProposalId: proposal.proposalInfo.nextProposalId,
              proposalSummary: proposal.proposalSummary,
              threadSummary: proposal.threadSummary,
              mutateNanceProposal: (d) => {
                mutateNanceProposal({ ...data, data: { ...data.data, ...d } });
              },
              refetchSnapshotProposal,
            }}
          >
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2 lg:block hidden">
                {/* Content */}
                <div className="space-y-4">
                  <ProposalHeader />
                  <ProposalContent />
                </div>

                {/* Display Options if not basic (For Against) */}
                <div>
                  {snapshotProposal &&
                    [
                      "approval",
                      "ranked-choice",
                      "quadratic",
                      "weighted",
                    ].includes(snapshotProposal.type) && (
                      <div className="mt-6 flow-root">
                        <ProposalOptions proposal={snapshotProposal} />
                      </div>
                    )}
                </div>
              </div>

              <section
                aria-labelledby="tabs"
                className="col-span-3 lg:col-span-1"
              >
                <>
                  <div
                    className="hidden lg:block sticky lg:mt-5 bottom-6 top-6 bg-white px-4 py-5 opacity-100 shadow sm:rounded-lg sm:px-6"
                    style={{
                      maxHeight: "calc(100vh - 1rem)",
                    }}
                  >
                    <ProposalVoteOverview />
                    <div className="mt-4">
                      <ProposalTabs
                        proposal={proposal}
                        snapshotProposal={snapshotProposal}
                      />
                    </div>
                  </div>

                  <div className="block lg:hidden">
                    <div className="p-4 space-y-4">
                      <ProposalHeader />

                      <div className="">
                        <ProposalVoteOverview />
                      </div>
                      <ProposalTabs
                        proposal={proposal}
                        snapshotProposal={snapshotProposal}
                      />
                    </div>
                  </div>
                </>
              </section>
            </div>
          </ProposalContext.Provider>
        </main>
      </div>

      <Footer />
    </>
  );
}
