import { Interface } from "ethers/lib/utils";
import useSWR from "swr";

export interface TenderlySimulateArgs {
  from: string;
  to?: string;
  input: string;
  value: number;
  networkId?: number;
}

export interface TenderlySimulationAPIResponse {
  transaction: {
    status: boolean;
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

export function useTendelySimulate(
  args: TenderlySimulateArgs,
  shouldFetch: boolean = false,
) {
  const { data, isLoading, error } = useSWR<TenderlySimulationAPIResponse>(
    shouldFetch ? ["/api/tenderly", args] : null,
    fetchWithArgs,
  );

  return {
    data,
    isLoading,
    error,
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
