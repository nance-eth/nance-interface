import { useQuery } from 'graphql-hooks'

const QUERY = `
query Ranking($search: String) {
  ranking(
    first: 20
    skip: 0
    where: {search: $search }
  ) {
    items {
      id
      name
      avatar
    }
  }
}
`

export interface SpaceSearch {
    id: string,
    name: string,
    avatar: string,
}

export async function fetchSnapshotSearch(search: string): Promise<SpaceSearch> {
    return fetch('https://hub.snapshot.org/graphql', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: QUERY, 
        variables: { search } 
      }),
    }).then(res => res.json()).then(json => json.data.space)
}

export default function useSnapshotSearch(search: string): {data: SpaceSearch[] | undefined, loading: boolean} {
    const { loading, data } = useQuery<{ranking: { items: SpaceSearch[] }}>(QUERY, {
        variables: {
          search
        }
    });
    return { loading, data: data?.ranking.items };
}