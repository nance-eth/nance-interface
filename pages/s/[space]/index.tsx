import ContentNotFound from "@/components/ContentNotFound";
import { Footer, SiteNav } from "@/components/Site";
import Space from "@/components/Space";
import { calculateRemainingTime } from "@/components/Space/sub/SpaceHeader";

import { SpaceContext } from "@/context/SpaceContext";
import { useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { SpaceInfo } from "@nance/nance-sdk";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SPACE_NOT_FOUND_IMAGE = "/images/character/Empty_Orange_2.png";
const JBDAO_OPENGRAPH_IMAGE = "/images/opengraph/homepage.png";

export default function SpacePage() {
  const params = useParams<{ space: string }>();
  const space = params?.space;
  const [overrideSpaceInfo, setOverrideSpaceInfo] = useState<SpaceInfo>();
  const { data, isLoading, mutate } = useSpaceInfo({ space }, !!space);
  const spaceInfo = overrideSpaceInfo || data?.data;

  useEffect(() => {
    let _window = window as any;
    if (_window.Nance === undefined) {
      _window.Nance = {};
    }
    // Use these by typing Nance into dev console
    _window.Nance.updateSpaceInfo = setOverrideSpaceInfo;
    _window.Nance.spaceInfo = spaceInfo;
  }, [spaceInfo, mutate]);

  if (isLoading || !space) {
    return (
      <>
        <SiteNav
          pageTitle="Nance"
          description="Governance Automated"
          withProposalButton={false}
        />
      </>
    );
  }

  if (!spaceInfo) {
    return (
      <>
        <SiteNav
          pageTitle="Not Found"
          description="Space not found"
          image={SPACE_NOT_FOUND_IMAGE}
          withProposalButton={false}
        />
        <ContentNotFound
          title="Space Not Found"
          reason="The space you are looking for does not exist."
          recommendationText="Do you want to create a new space?"
          recommendationActionHref="/create"
          recommendationActionText="Create Space"
          fallbackActionHref="/s"
          fallbackActionText="See All Spaces"
        />
        <Footer />
      </>
    );
  }

  const { name, snapshotSpace, avatarURL } = spaceInfo;
  const spaceImage =
    name === "juicebox"
      ? JBDAO_OPENGRAPH_IMAGE
      : avatarURL;
  const pageTitle = `${spaceInfo.name} Governance`;

  const { formattedEndTime } = calculateRemainingTime(
    spaceInfo.currentEvent?.end ?? ""
  );

  return (
    <>
      <SiteNav
        pageTitle={pageTitle}
        description={pageTitle}
        image={spaceImage}
        space={name}
        withWallet
        withProposalButton={false}
        mobileHeaderCenter={
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {spaceInfo.currentEvent?.title || "Unknown"} of GC
              {spaceInfo.currentCycle}
            </p>
            <p className="text-sm">Ends {formattedEndTime}</p>
          </div>
        }
      />

      <SpaceContext.Provider value={spaceInfo}>
        <Space />
      </SpaceContext.Provider>

      <Footer />
    </>
  );
}
