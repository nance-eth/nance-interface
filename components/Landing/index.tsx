import Contact from "./Contact";
import FeatureSection from "./FeatureSection";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import Testimonials from "./Testimonials";

import { useAllSpaceInfo } from "@/utils/hooks/NanceHooks";
const DEFAULT_TOP4SPACES = [
  {
    id: "juicebox",
    name: "juicebox",
    snapshotSpace: "jbdao.eth",
    avatarURL: "https://nance.infura-ipfs.io/ipfs/bafkreigutpsftjqf7jkxjva4bschpezwvlgjvboufcwie4elembuikzjei"
  },
  {
    id: "moondao",
    name: "moondao",
    snapshotSpace: "tomoondao.eth",
    avatarURL: "https://nance.infura-ipfs.io/ipfs/QmeNcmMfUmoW59245qNSXnMFAW4xnWmBC3iG7MNqPF7SUF"
  },
  {
    id: "thirstythirsty",
    name: "thirstythirsty",
    snapshotSpace: "gov.thirstythirsty.eth",
    avatarURL: "https://nance.infura-ipfs.io/ipfs/bafkreichagj2usyj6an6tz4m3wh2fqth6dnv3aheqzlsf4oiajr3aosbkq"
  },
  {
    id: "daosquare",
    name: "DAOSquare",
    snapshotSpace: "community.daosquare.eth",
    avatarURL: "https://nance.infura-ipfs.io/ipfs/Qmdqpn34Q4xr6JWvEPzSf3b9YQ35rqTFkweqLMGtGA89WG"
  },
];

export interface SimpleSpaceEntry {
  id: string;
  name: string;
  snapshotSpace: string;
  avatarURL: string;
}

export default function Landing() {
  const { data } = useAllSpaceInfo();
  const top4Spaces: SimpleSpaceEntry[] = data?.data
  // filter test spaces
    ?.filter((s) => !["gnance", "waterbox", "nance"].includes(s.name))
  // sort by proposal count
    .sort((a, b) => b.nextProposalId - a.nextProposalId)
  // top 4
    .slice(0, 4)
    .map((s) => {
      return {
        id: s.name,
        name: s.displayName,
        snapshotSpace: s.snapshotSpace,
        avatarURL: s.avatarURL,
      };
    }) || DEFAULT_TOP4SPACES;
  return (
    <>
      <HeroSection top4Spaces={top4Spaces} />
      <StatsSection data={data?.data}/>
      <FeatureSection />
      <Testimonials />
      <Contact />
    </>
  );
}
