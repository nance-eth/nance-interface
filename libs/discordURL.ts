export const DISCORD_OAUTH_URL = 'https://discord.com/api/oauth2/token';

export const discordRedirectBaseUrl = `${process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI_BASE}/api/discord/auth`

export const discordScope = ["identify", "guilds"].join(" ");

export const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID

export const discordAuthUrl = (from: string) => {
  const url = "https://discord.com/api/oauth2/authorize" +
  "?client_id=1093511877813870592&" +
  `redirect_uri=${encodeURIComponent(`${discordRedirectBaseUrl}?from=${from}`)}&` +
  `response_type=code&scope=${encodeURIComponent(discordScope)}`
  return url
}
export const addBotUrl = (guildId: string) => {
  return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&guild_id=${guildId}&permissions=326418033728&scope=bot`
}

export const avatarBaseUrl = "https://cdn.discordapp.com/avatars"

export const guildIconBaseUrl = "https://cdn.discordapp.com/icons"

export const DISCORD_PROXY_API_URL = "/api/discord"

export const DISCORD_PROXY_USER_URL = `${DISCORD_PROXY_API_URL}/user`

export const DISCORD_PROXY_BOT_URL = `${DISCORD_PROXY_API_URL}/bot`

export const DISCORD_PROXY_LOGOUT_URL = `${DISCORD_PROXY_API_URL}/logout`