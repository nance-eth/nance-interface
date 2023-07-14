import useSWR, { Fetcher } from 'swr'

const DISCORD_PROXY_API_URL = "/api/discord/fetch"

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

export function useFetchDiscordUser(args: any, shouldFetch: boolean = true) {
  console.log('fetch:', args);
  shouldFetch = args.address ? true : false;
    return useSWR<any, string>(
        shouldFetch ? `${DISCORD_PROXY_API_URL}?address=${args.address}&command=${commands.user}` : null,
        jsonFetcher(),
    );
}