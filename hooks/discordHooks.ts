import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { DiscordGuild, DiscordUser } from '../models/DiscordTypes'
import { DISCORD_PROXY_FETCH_URL, DISCORD_PROXY_LOGOUT_URL } from "../libs/discordURL"

const commands = {
  user: "users/@me",
  guilds: "users/@me/guilds",
}

function jsonFetcher(): Fetcher<any, string> {
  return async (url) => {
      const res = await fetch(url)
      const json = await res.json()
      if (json?.success === 'false') {
          throw new Error(`An error occurred while fetching the data: ${json?.error}`)
      }
      return json
  }
}

export function useFetchDiscordUser(args: { address: string }, shouldFetch: boolean = true) {
  shouldFetch = args.address ? true : false;
    return useSWR<DiscordUser, string>(
        shouldFetch ? `${DISCORD_PROXY_FETCH_URL}?address=${args.address}&command=${commands.user}` : null,
        jsonFetcher(),
    );
}

export function useLogoutDiscordUser(args: { address: string }, shouldFetch: boolean = true) {
  shouldFetch = args.address ? true : false;
    return useSWRMutation<DiscordUser, string>(
        shouldFetch ? `${DISCORD_PROXY_LOGOUT_URL}?address=${args.address}` : null,
        jsonFetcher(),
    );
}

export function useFetchDiscordGuilds(args: { address: string }, shouldFetch: boolean = true) {
  shouldFetch = args.address ? true : false;
    return useSWR<DiscordGuild[], string>(
        shouldFetch ? `${DISCORD_PROXY_FETCH_URL}?address=${args.address}&command=${commands.guilds}` : null,
        jsonFetcher(),
    );
}