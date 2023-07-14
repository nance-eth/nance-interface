export const DISCORD_OAUTH_URL = 'https://discord.com/api/oauth2/token';

export const discordRedirectBaseUrl = "http://localhost:3001/api/discord/auth"

export const discordScope = ["identify", "guilds"].join(" ");

export const discordAuthUrl = (from: string) => {
  const url = "https://discord.com/api/oauth2/authorize" +
  "?client_id=1093511877813870592&" +
  `redirect_uri=${encodeURIComponent(`${discordRedirectBaseUrl}?from=${from}`)}&` +
  `response_type=code&scope=${encodeURIComponent(discordScope)}`
  return url
}

export const avatarBaseUrl = "https://cdn.discordapp.com/avatars"

export const guildIconBaseUrl = "https://cdn.discordapp.com/icons"

export const DISCORD_PROXY_API_URL = "/api/discord"

export const DISCORD_PROXY_FETCH_URL = `${DISCORD_PROXY_API_URL}/fetch`

export const DISCORD_PROXY_LOGOUT_URL = `${DISCORD_PROXY_API_URL}/logout`