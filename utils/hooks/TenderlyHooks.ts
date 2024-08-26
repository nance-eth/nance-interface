import { Interface } from "ethers/lib/utils";
import useSWR from "swr";

export interface TenderlySimulateArgs {
  from: string;
  to?: string;
  input: string;
  value: number;
  networkId?: number;
  state_objects?: {
    [contractAddress: string]: { storage: { [slot: string]: string } };
  };
}

export interface TenderlySimulationAPIResponse {
  transaction: {
    status: boolean;
    transaction_info: {
      call_trace: {
        logs: {
          raw: {
            address: string;
            topics: string[];
            data: string;
          };
        }[];
      };
    };
  };
  simulation: {
    error_message: string;
    id: string;
    project_id: string;
    owner_id: string;
    network_id: string;
    block_number: number;
    transaction_index: number;
    status: boolean;
    shared: boolean;
    created_at: string;
  };
}

async function fetchWithArgs([url, args]: [string, TenderlySimulateArgs]) {
  const simulationConfig = {
    save: true,
    save_if_fails: true,
    simulation_type: "quick",
    network_id: String(args.networkId) || "1",
    from: args.from,
    to: args.to,
    input: args.input,
    gas: 8000000,
    gas_price: 0,
    value: args.value,
    state_objects: args.state_objects,
  };

  const resp = await fetch(url, {
    method: "POST",
    body: JSON.stringify(simulationConfig),
  });
  const json: any = await resp.json();
  if (json.error) {
    throw new Error(json.error.message);
  }

  return json as TenderlySimulationAPIResponse;
}

export function useTenderlySimulate(
  args: TenderlySimulateArgs,
  shouldFetch: boolean = false
) {
  const { data, isLoading, error, mutate } =
    useSWR<TenderlySimulationAPIResponse>(
      shouldFetch ? ["/api/tenderly", args] : null,
      fetchWithArgs
    );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

export function encodeTransactionInput(functionName: string, args: any[]) {
  if (!functionName || !args) {
    return "";
  }

  try {
    const iface = new Interface([functionName]);
    return iface.encodeFunctionData(functionName.split("function ")[1], args);
  } catch (e) {
    console.warn("❎ encodeCustomTransaction", e, functionName, args);
    return "";
  }
}
