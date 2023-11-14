import { SpaceConfig } from "@/models/NanceTypes";
import { useSession } from "next-auth/react";
import ConnectWalletButton from "@/components/common/ConnectWalletButton";
import DiscordUser from "@/components/CreateSpace/sub/DiscordUser";
import { DiscordForm } from "@/components/CreateSpace";

export default function Dialog({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  const { data: session } = useSession();
  // FIXME: to load discordConfig into DiscordForm with useForm(defaultValues)

  return (
    <div className="flex flex-col">
      {session ? (
        <>
          <DiscordUser address={session.user?.name || ""} />
          <DiscordForm />
        </>
      ) : (
        <div className="flex flex-col">
          <ConnectWalletButton />
        </div>
      )}
    </div>
  );
}
