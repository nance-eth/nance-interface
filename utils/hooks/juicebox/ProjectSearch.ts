import useSWR, { Fetcher } from "swr";
import { subgraphOf } from "../../../constants/Juicebox";
import { NetworkContext } from "../../../context/NetworkContext";
import { useContext } from "react";

const projectQueryByHandle = `query Project($first: Int, $keyword: String) {
    projects(
      first: $first,
      where: {
        handle_contains: $keyword
        pv: "2"
      },
      orderBy: trendingScore,
      orderDirection: desc
    ) {
      id
      pv
      owner
      handle
      projectId
      createdAt
      metadataUri
    }
}`;

const projectQueryByProjectId = `query Project($first: Int, $keyword: Int) {
    projects(
      first: $first,
      where: {
        projectId: $keyword
        pv: "2"
      },
      orderBy: trendingScore,
      orderDirection: desc
    ) {
      id
      pv
      owner
      handle
      projectId
      createdAt
      metadataUri
    }
}`;

export interface ProjectSearchEntry {
  id: string
  pv: string
  owner: string
  handle: string
  projectId: number
  createdAt: number
  metadataUri: string
}

const fetcher: Fetcher<ProjectSearchEntry[], { keyword: string, limit: number, network: string }> = ({ keyword, limit, network }) => fetch(subgraphOf(network), {
  method: "POST",
  body: JSON.stringify({
    query: isNaN(parseInt(keyword)) ? projectQueryByHandle : projectQueryByProjectId,
    variables: {
      first: limit,
      keyword: isNaN(parseInt(keyword)) ? keyword : parseInt(keyword)
    }
  }),
}).then(res => res.json()).then(res => res.data.projects);

export default function useProjectSearch(keyword: string, limit: number = 10) {
  const network = useContext(NetworkContext);
  const { data, error } = useSWR({ keyword, limit }, fetcher);
  const loading = !error && !data;

  return { data, loading, error };
}
