import { SafeMultisigTransactionResponse } from "@safe-global/types-kit";

export interface SafeMultisigConfirmation {
  owner: string;
  submissionDate: string;
  transactionHash?: string;
  signature: string;
  signatureType?: string;
}

export interface SafeMultisigTransaction {
  safe: string;
  to: string;
  value: string;
  data?: string;
  nonce: number;
  submissionDate: string;
  executionDate: string;
  safeTxHash: string;
  transactionHash: string;
  origin: string;
  dataDecoded: {
    method: string;
    parameters: object[];
  } | null;
  isExecuted: boolean;
  confirmations?: SafeMultisigConfirmation[];
}

export interface SafeMultisigTransactionRequest {
  address: string;
  limit?: number;
  offset?: number;
  nonceGte?: number;
}

export interface SafeTransactionPartial {
  to: string;
  value: number;
  data: string;
  nonce: string;
}

export interface QueueSafeTransaction extends SafeTransactionPartial {
  address: string;
  safeTxGas: string;
  transactionHash: string;
  signature: string;
}

export interface SafeBalanceUsdResponseItem {
  balance: string;
  fiatBalance: string;
  fiatConversion: string;
  tokenInfo: {
    address: string;
    decimals: number;
    logoUri: string;
    name: string;
    symbol: string;
    type: "NATIVE_TOKEN" | "ERC20";
  };
}

export interface SafeBalanceUsdResponse {
  fiatTotal: string;
  items: SafeBalanceUsdResponseItem[];
}

export interface SafeInfoResponse {
  address: string;
  nonce: number;
  threshold: number;
  owners: string[];
  masterCopy: string;
  modules: string[];
  fallbackHandler: string;
  version: string;
  guard: string;
}

export interface SafeDelegatesResponse {
  count: number;
  results: SafeDelegateResponse[];
}

export interface SafeDelegateResponse {
  delegate: string;
  delegator: string;
  safe: string;
  label: string;
}

export type RevisedSafeMultisigTransactionResponse = Omit<
  SafeMultisigTransactionResponse,
  "dataDecoded"
> & {
  dataDecoded: {
    method: string;
    parameters: {
      name: string;
      type: string;
      value: string | string[];
    }[];
  };
};

export interface SafeTransactionBuilderTxn {
  to: string;
  value: string;
  data: string | null;
  contractMethod: {
    inputs: {
      name: string;
      type: string;
      internalType: string;
    }[];
    name: string;
    payable: boolean;
  };
  contractInputsValues: Record<
    SafeTransactionBuilderTxn["contractMethod"]["inputs"][number]["name"],
    string
  >;
}
