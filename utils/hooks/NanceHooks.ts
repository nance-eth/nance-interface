import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import useSWRInfinite from "swr/infinite";
import { NANCE_API_URL, NANCE_PROXY_API_URL } from "../../constants/Nance";
import {
  APIResponse,
  ProposalsRequest,
  SpaceInfoRequest,
  ProposalRequest,
  ProposalUploadRequest,
  SpaceInfo,
  ProposalUploadPayload,
  ProposalDeleteRequest,
  ProposalsPacket,
  SQLPayout,
  ConfigSpacePayload,
  CreateFormValues,
  SpaceConfig,
  ProposalQueryResponse,
  Action,
  BaseRequest,
} from "@nance/nance-sdk";
import { FundingCycleArgs } from "../functions/fundingCycle";
import { JBSplit, V2V3FundingCycleMetadata } from "@/models/JuiceboxTypes";

export async function getFetch(url: string) {
  const res = await fetch(url);
  const json = await res.json();
  if (json?.success === "false" || json?.error) {
    throw new Error(`${JSON.stringify(json?.error)}`);
  }
  return json as APIResponse<any>;
}

export async function postFetch(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json?.success === "false" || json?.error) {
    throw new Error(`${JSON.stringify(json?.error)}`);
  }
  return json as APIResponse<any>;
}

export function useAllSpaceInfo(shouldFetch: boolean = true) {
  return useSWR<APIResponse<SpaceInfo[]>>(
    shouldFetch ? `${NANCE_API_URL}/ish/all` : null,
    getFetch
  );
}

export function useSpaceConfig(space: string, shouldFetch: boolean = true) {
  return useSWR<APIResponse<SpaceConfig>, string>(
    shouldFetch ? `${NANCE_API_URL}/ish/config/${space}` : null,
    getFetch
  );
}

export function useSpaceInfo(
  args: SpaceInfoRequest,
  shouldFetch: boolean = true
) {
  return useSWR<APIResponse<SpaceInfo>, string>(
    shouldFetch ? `${NANCE_API_URL}/${args.space}` : null,
    getFetch
  );
}

export type GroupedSplit = {
  group: string;
  splits: JBSplit[];
};

export type FundAccessConstraint = {
  terminal: string;
  token: string;
  distributionLimit: string;
  distributionLimitCurrency: string;
  overflowAllowance: string;
  overflowAllowanceCurrency: string;
};

export type ReconfigData = {
  encoded: string;
  decoded: {
    projectId: number;
    data: FundingCycleArgs;
    metadata: V2V3FundingCycleMetadata;
    groupedSplits: GroupedSplit[];
  };
  mustStartOnOrAfter: string;
  fundAccessConstraints: FundAccessConstraint[];
  memo: string;
};

export function useReconfig(space: string, shouldFetch: boolean = true) {
  return useSWR<APIResponse<ReconfigData>, string>(
    shouldFetch ? `${NANCE_API_URL}/${space}/reconfig` : null,
    getFetch
  );
}

export function useCurrentPayouts(
  space: string,
  cycle: string | undefined,
  shouldFetch: boolean = true
) {
  const urlParams = new URLSearchParams();
  if (cycle) {
    urlParams.set("cycle", cycle);
  }

  return useSWR<APIResponse<SQLPayout[]>, string>(
    shouldFetch
      ? `${NANCE_API_URL}/${space}/payouts?` + urlParams.toString()
      : null,
    getFetch
  );
}

export function useProposals(
  args: ProposalsRequest,
  shouldFetch: boolean = true
) {
  const urlParams = new URLSearchParams();
  if (args.cycle) {
    urlParams.set("cycle", args.cycle);
  }
  if (args.keyword) {
    urlParams.set("keyword", args.keyword);
  }
  if (args.limit) {
    urlParams.set("limit", args.limit.toString());
  }
  if (args.page) {
    urlParams.set("page", args.page.toString());
  }

  return useSWR<APIResponse<ProposalsPacket>, string>(
    shouldFetch
      ? `${NANCE_API_URL}/${args.space}/proposals?` + urlParams.toString()
      : null,
    getFetch
  );
}

export function useProposalsInfinite(
  args: ProposalsRequest,
  shouldFetch: boolean = true
) {
  const urlParams = new URLSearchParams();
  if (args.cycle) {
    urlParams.set("cycle", args.cycle);
  }
  if (args.keyword) {
    urlParams.set("keyword", args.keyword);
  }
  if (args.limit) {
    urlParams.set("limit", args.limit.toString());
  }
  if (args.page) {
    urlParams.set("page", args.page.toString());
  }

  const getKey = (
    pageIndex: number,
    previousPageData: APIResponse<ProposalsPacket>
  ) => {
    if (!shouldFetch || (previousPageData && !previousPageData.data.hasMore))
      return null; // reached the end
    urlParams.set("page", (pageIndex + 1).toString());
    return `${NANCE_API_URL}/${args.space}/proposals?` + urlParams.toString(); // SWR key
  };

  return useSWRInfinite<APIResponse<ProposalsPacket>, string>(getKey, getFetch);
}

export function useProposal(
  args: ProposalRequest,
  shouldFetch: boolean = true
) {
  return useSWR<ProposalQueryResponse>(
    shouldFetch ? `${NANCE_API_URL}/${args.space}/proposal/${args.uuid}` : null,
    getFetch
  );
}

// TODO move these two types into nance-sdk
interface ActionRequest extends BaseRequest {
  aid: string;
}
export interface ActionPayload {
  action: Action;
  proposal: {
    id: string;
    title: string;
  };
}

export function useAction(args: ActionRequest, shouldFetch: boolean = true) {
  return useSWR<APIResponse<ActionPayload>>(
    shouldFetch ? `${NANCE_API_URL}/${args.space}/actions/${args.aid}` : null,
    getFetch
  );
}

export function useActions(args: BaseRequest, shouldFetch: boolean = true) {
  return useSWR<APIResponse<ActionPayload[]>>(
    shouldFetch ? `${NANCE_API_URL}/${args.space}/actions` : null,
    getFetch
  );
}

async function emptyCreator(url: RequestInfo | URL) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json: APIResponse<string> = await res.json();
  if (json.success === false) {
    throw new Error(`${JSON.stringify(json?.error)}`);
  }

  return json;
}
export function useCreateActionPoll(
  args: ActionRequest,
  shouldFetch: boolean = true
) {
  return useSWRMutation(
    shouldFetch
      ? `${NANCE_API_URL}/${args.space}/actions/${args.aid}/poll`
      : null,
    emptyCreator
  );
}

async function uploader(
  url: RequestInfo | URL,
  { arg }: { arg: ProposalUploadRequest }
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(`${JSON.stringify(json?.error)}`);
  }

  return json;
}

async function creator(
  url: RequestInfo | URL,
  { arg }: { arg: CreateFormValues }
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });
  const json: APIResponse<ConfigSpacePayload> = await res.json();
  if (json.success === false) {
    throw new Error(`${JSON.stringify(json?.error)}`);
  }

  return json;
}

export function useProposalUpload(
  space: string,
  proposalId: string | undefined,
  shouldFetch: boolean = true
) {
  let url = `${NANCE_PROXY_API_URL}/${space}/proposals`;
  let fetcher = uploader;
  if (proposalId) {
    url = `${NANCE_PROXY_API_URL}/${space}/proposal/${proposalId}`;
    fetcher = editor;
  }
  return useSWRMutation(shouldFetch ? url : null, fetcher);
}

export function useProposalDelete(
  space: string,
  uuid: string | undefined,
  shouldFetch: boolean = true
) {
  let url = `${NANCE_PROXY_API_URL}/${space}/proposal/${uuid}`;
  let fetcher = deleter;
  return useSWRMutation(shouldFetch ? url : null, fetcher);
}

async function editor(
  url: RequestInfo | URL,
  { arg }: { arg: ProposalUploadRequest }
) {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(`${JSON.stringify(json?.error)}`);
  }

  return json;
}

async function deleter(
  url: RequestInfo | URL,
  { arg }: { arg: ProposalDeleteRequest }
) {
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(`${JSON.stringify(json?.error)}`);
  }

  return json;
}

export function useCreateSpace(shouldFetch: boolean = true) {
  const url = `${NANCE_PROXY_API_URL}/ish/config`;
  let fetcher = creator;
  return useSWRMutation(shouldFetch ? url : null, fetcher);
}

export function getNanceEndpointPath(space: string, command: string) {
  return `${NANCE_PROXY_API_URL}/${space}/${command}`;
}

export async function fetchCreatedProposals(
  space: string | undefined,
  author: string | undefined,
  prefix: string = ""
) {
  if (!space || !author) {
    return {
      success: true,
      data: {
        proposalInfo: {
          snapshotSpace: "",
          proposalIdPrefix: "",
          minTokenPassingAmount: 0,
          nextProposalId: 0,
        },
        proposals: [],
        hasMore: false,
      },
    } as APIResponse<ProposalsPacket>;
  }

  const url = `${NANCE_API_URL}/${space}/proposals/?author=${author}`;
  const res = await fetch(prefix + url);
  const json: APIResponse<ProposalsPacket> = await res.json();
  if (json.success === false) {
    console.warn("fetchCreatedProposals errors occurred: ", json.error);
  }

  return json;
}
