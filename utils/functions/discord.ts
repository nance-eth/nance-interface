import {
  MANAGE_GUILD,
  GUILD_TEXT_CHANNEL,
  BOT_COMMANDS,
  GUILD_ANNOUNCEMENT_CHANNEL,
  avatarBaseUrl,
} from "@/constants/Discord";
import {
  discordAuthUrl,
  getGuildIconUrl,
  DISCORD_PROXY_BOT_URL,
} from "@/utils/functions/discordURL";
import {
  DiscordGuild,
  DiscordRole,
  DiscordChannel,
} from "@/models/DiscordTypes";
import { DiscordConfig } from "@nance/nance-sdk";

export const DiscordChannelLinkPrefix = "https://discord.com/channels/";
export const DiscordInAppChannelLinkPrefix = "discord://discord.com/channels/";
export function openInDiscord(url: string) {
  try {
    if (url.includes("discord")) {
      const splitUrl = url.split(DiscordChannelLinkPrefix)[1].split("/");
      const newUrl = splitUrl.join("/");
      return `${DiscordInAppChannelLinkPrefix}${newUrl}`;
    }
    return url;
  } catch (e) {
    console.error("Error opening Discord URL", e);
    return url;
  }
}

export function getDomain(url: string) {
  // parse data between https:// and .<ending> to get name of domain, dont include www. or .<ending> in the name
  const domain = url.replace(/(https?:\/\/)?(www\.)?/i, "").split(".")[0];
  return domain;
}

export function discordMessage(form: Record<string, any>) {
  const body = {
    embeds: [
      {
        title: "New Message from nance.app",
        description: `At <t:${Math.floor(Date.now() / 1000)}>:`,
        color: 0xeff6ff,
        fields: Object.entries(form).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value ? value.toString() : `No ${key} provided.`,
          inline: false,
        })),
      },
    ],
  };
  return body;
}

export const discordAuthWindow = (csrf: string, address: string) => {
  return window.open(
    discordAuthUrl(csrf, address),
    "_blank",
    "width=400,height=700,noopener,noreferrer"
  );
};

const appendSymbol = (str: string, append: string) => {
  if (str.startsWith(append)) return str;
  return `${append}${str}`;
};

// Discord API returns a message object if there is an error,
// using the detection of the message object to determine if there is an error, could be done better
export const managedGuildsOf = (guilds?: DiscordGuild[]): DiscordGuild[] => {
  if (!guilds || guilds.length === 0 || (guilds as any).message) return []; // error from Discord API
  return guilds
    .filter(
      (guild) => (Number(guild.permissions) & MANAGE_GUILD) === MANAGE_GUILD
    )
    .map((guild) => {
      return { ...guild, icon: getGuildIconUrl(guild) };
    });
};

export const formatRoles = (roles?: DiscordRole[]): DiscordRole[] => {
  if (!roles || roles.length === 0 || (roles as any).message) return []; // error from Discord API
  return roles
    .map((role) => {
      return { ...role, name: appendSymbol(role.name, "@") };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // sort alphabetically
};

export const formatChannels = (
  channels?: DiscordChannel[]
): DiscordChannel[] => {
  if (!channels || channels.length === 0 || (channels as any).message)
    // error from Discord API
    return [];
  return channels
    .filter(
      (channel) =>
        channel.type === GUILD_TEXT_CHANNEL ||
        channel.type === GUILD_ANNOUNCEMENT_CHANNEL
    )
    .map((channel) => {
      return { ...channel, name: appendSymbol(channel.name, "# ") };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // sort alphabetically
};

// TODO: what can this be used?
export async function fetchDiscordInitialValues(args: {
  address?: string | null;
  discordConfig: DiscordConfig;
  guilds?: DiscordGuild[];
}) {
  const { guildId } = args?.discordConfig;
  let guild = args?.guilds?.find((guild) => guild.id === guildId);
  if (guild) guild = managedGuildsOf([guild])[0];

  const channelsCommand = BOT_COMMANDS.channels.replace("{guildId}", guildId);
  const channels: DiscordChannel[] = await fetch(
    `${DISCORD_PROXY_BOT_URL}?command=${channelsCommand}`
  ).then((res) => res.json());
  let proposalChannel = channels.find(
    (channel) => channel.id === args?.discordConfig.channelIds.proposals
  );
  if (proposalChannel)
    proposalChannel = { ...proposalChannel, name: `# ${proposalChannel.name}` };

  let alertChannel = channels.find(
    (channel) => channel.id === args?.discordConfig.reminder.channelIds[0]
  );
  if (alertChannel)
    alertChannel = { ...alertChannel, name: `# ${alertChannel.name}` };

  const rolesCommand = BOT_COMMANDS.roles.replace("{guildId}", guildId);
  const roles: DiscordRole[] = await fetch(
    `${DISCORD_PROXY_BOT_URL}?command=${rolesCommand}`
  ).then((res) => res.json());
  let role = roles.find(
    (role) => role.id === args?.discordConfig.roles.governance
  );
  if (role) role = formatRoles([role])[0];

  return { guild, proposalChannel, alertChannel, role };
}

export function discordUserAvatarUrlOf(userId: string, avatar: string) {
  return `${avatarBaseUrl}/${userId}/${avatar}.png`;
}
