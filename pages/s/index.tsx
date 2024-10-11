import { Footer, SiteNav } from "@/components/Site";
import AllSpace from "@/components/SpaceCards";

export default function NanceAllSpacePage() {
  return (
    <>
      <SiteNav
        pageTitle="All Spaces"
        description="All spaces created and hosted on Nance platform."
        withWallet
        withProposalButton={false}
      />
      <AllSpace />
      <Footer />
    </>
  );
}
