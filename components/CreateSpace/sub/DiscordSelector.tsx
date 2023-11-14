import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import { DiscordGuild, DiscordRole } from "@/models/DiscordTypes";
import { addBotUrl, getGuildIconUrl } from "@/utils/functions/discordURL";
import {
  managedGuildsOf,
  formatRoles,
  fetchDiscordInitialValues,
} from "@/utils/functions/discord";
import {
  useFetchDiscordGuilds,
  useIsBotMemberOfGuild,
  useFetchDiscordGuildRoles,
} from "@/utils/hooks/DiscordHooks";
import { DiscordConfig } from "@/models/NanceTypes";
import GenericListbox from "@/components/common/GenericListbox";
import DiscordChannelForm from "./DiscordChannelForm";

export default function DiscordSelector({
  session,
  val,
  setVal,
  discordConfig,
}: {
  session: Session;
  val: DiscordConfig;
  setVal: (v: Partial<DiscordConfig>) => void;
  discordConfig?: DiscordConfig;
}) {
  const router = useRouter();

  // state
  const [selectedGuild, setSelectedGuild] = useState<
    DiscordGuild | undefined
  >();
  const [selectedAlertRole, setSelectedAlertRole] = useState<
    DiscordRole | undefined
  >();
  const [configLoaded, setConfigLoaded] = useState<boolean>(false);

  // hooks
  const { data: guilds } = useFetchDiscordGuilds({
    address: session.user?.name,
  });
  const { data: botIsMember, trigger: memberTrigger } = useIsBotMemberOfGuild(
    { guildId: selectedGuild?.id },
    router.isReady,
  );
  const { data: roles, trigger: rolesTrigger } = useFetchDiscordGuildRoles({
    guildId: selectedGuild?.id,
  });

  const resetRolesAndChannels = () => {
    setSelectedAlertRole(undefined);
  };

  // TODO: Extract into smaller components, use props changes to trigger re-renders instead of these effects
  useEffect(() => {
    if (selectedGuild && !botIsMember) {
      memberTrigger();
    }
    if (botIsMember && !discordConfig) {
      rolesTrigger();
    }
    if (discordConfig && !configLoaded && guilds) {
      (async () => {
        const { guild, proposalChannel, alertChannel, role } =
          await fetchDiscordInitialValues({
            address: session.user?.name,
            discordConfig: discordConfig!,
            guilds,
          });
        setSelectedGuild(guild);
        setSelectedAlertRole(role);
        setConfigLoaded(true);
      })();
    }
  }, [selectedGuild, botIsMember, guilds]);

  return (
    <div className="w-100">
      <GenericListbox<DiscordGuild>
        value={selectedGuild || ({ icon: getGuildIconUrl() } as DiscordGuild)}
        onChange={(guild) => {
          resetRolesAndChannels();
          setSelectedGuild(guild);
          // TODO: use config.discord.guildId instead we bundle them in a big val which can be hard to matain
          setVal({ ...val, guildId: guild.id });
        }}
        label="Select a Discord Server"
        disabled={!guilds || !!discordConfig}
        items={managedGuildsOf(guilds)}
      />
      {/* add bot to server button */}
      {selectedGuild && !botIsMember && (
        <>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                window.open(
                  addBotUrl(selectedGuild.id),
                  "_blank",
                  "width=400,height=700,noopener,noreferrer",
                );
                if (selectedGuild && !botIsMember) {
                  const interval = setInterval(memberTrigger, 1000);
                  if (botIsMember) {
                    clearInterval(interval);
                  }
                }
              }}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium leading-5 text-white hover:bg-indigo-500 focus:outline-none"
            >
              Add bot to server
            </button>
          </div>
        </>
      )}

      <DiscordChannelForm
        guildId={selectedGuild?.id}
        label="Select a channel to post proposals"
        fieldName="config.discord.channelIds.proposals"
        disabled={!selectedGuild || !botIsMember || !!discordConfig}
      />

      <DiscordChannelForm
        guildId={selectedGuild?.id}
        label="Select a channel to send daily alerts"
        fieldName="config.discord.reminder.channelIds.[0]"
        disabled={!selectedGuild || !botIsMember || !!discordConfig}
      />

      <GenericListbox<DiscordRole>
        value={
          selectedAlertRole ||
          ({ name: "-", id: null } as unknown as DiscordRole)
        }
        onChange={(role) => {
          setSelectedAlertRole(role);
          setVal({ ...val, roles: { governance: role.id } });
        }}
        label="Select a role to alert to participate in your governance"
        disabled={!selectedGuild || !botIsMember || !roles || !!discordConfig}
        items={formatRoles(roles)}
      />
    </div>
  );
}
