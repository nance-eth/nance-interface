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
  address: {
    value: string;
  };
  nonce: number;
  chainId: string;
  threshold: number;
  owners: { value: string }[];
  modules: string[] | null;
  fallbackHandler: {
    name: string;
    value: string;
  };
  version: string;
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

export interface SafetransactionsResponseResult {
  transaction: {
    // multisig_0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e
    //  _0x2b2a3167b4912af385fd1f6096e752e1b6cd91acb2bfb07914851399b03637cd
    id: string;
    timestamp: number;
    txHash: string;
    executionInfo: {
      nonce: number;
    };
    txInfo: {
      methodName: string;
      humanDescription: string | null;
      to: {
        value: string;
        name: string;
      };
    };
  };
}

export interface SafeTransactionsResponse {
  // https://safe-client.safe.global/v1/chains/1/safes
  //   /0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e/multisig-transactions
  //   /?trusted=true&limit=10&cursor=limit%3D20%26offset%3D20
  next: string;
  previous: string;
  results: SafetransactionsResponseResult[];
}
