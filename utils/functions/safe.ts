import { getContractLabel } from "@/constants/Contract";
import { Action, CustomTransaction, Transfer } from "@nance/nance-sdk";
import { SafeTransactionBuilderTxn } from "@/models/SafeTypes";
import { parseUnits } from "viem";
import { Interface } from "ethers/lib/utils";
import { extractFunctionName } from "./nance";
import { BigNumber } from "ethers";

const safeUINetworkPrefix: { [k: string]: string } = {
  mainnet: "eth",
  // [goerli.name]: 'goerli',
  // [optimism.name]: 'optimism',
  // [gnosis.name]: 'gnosis-chain',
};

export function getSafeTxUrl(address: string, hash: string, network?: string) {
  const networkPrefix =
    network && safeUINetworkPrefix[network]
      ? safeUINetworkPrefix[network]
      : "eth";
  return `https://app.safe.global/transactions/tx?safe=${networkPrefix}:${address}&id=multisig_${address}_${hash}`;
}

const safeBatchTransactionHeader = (
  space: string,
  chainId: number,
  governanceCycle: string,
  safeAddress: string
) => {
  return {
    version: "1.0",
    chainId: chainId.toString(),
    createdAt: Date.now(),
    meta: {
      name: `${space} Transactions Batch GC${governanceCycle}`,
      description: "",
      txBuilderVersion: "1.16.5",
      createdFromSafeAddress: safeAddress,
      createdFromOwnerAddress: "",
      checksum: "",
    },
  };
};

export const safeBatchTransactionBuilder = (
  space: string,
  chainId: number,
  governanceCycle: string,
  safeAddress: string,
  actions: Action[]
) => {
  const header = safeBatchTransactionHeader(
    space,
    chainId,
    governanceCycle,
    safeAddress
  );
  const safeBatchTransactions = actions.map((action) => {
    if (action.type === "Transfer") {
      const payload = action.payload as Transfer;
      const amount = String(payload.amount);
      const value =
        getContractLabel(payload.contract) === "ETH"
          ? parseUnits(amount, payload.decimals || 18).toString()
          : "0";
      const to =
        getContractLabel(payload.contract) === "ETH"
          ? payload.to
          : payload.contract;
      return {
        to,
        value,
        data: null,
        contractMethod:
          getContractLabel(payload.contract) === "ETH"
            ? null
            : {
                inputs: [
                  { name: "to", type: "address", internalType: "address" },
                  { name: "value", type: "uint256", internalType: "uint256" },
                ],
                name: "transfer",
                payable: false,
              },
        contractInputsValues:
          getContractLabel(payload.contract) === "ETH"
            ? null
            : {
                to: payload.to,
                amount: parseUnits(amount, payload.decimals).toString(),
              },
      } as SafeTransactionBuilderTxn;
    } else if (action.type === "Custom Transaction") {
      const customTransaction = action.payload as CustomTransaction;
      const contractInterface = new Interface([customTransaction.functionName]);

      const functionName = extractFunctionName(customTransaction.functionName);
      const fragment = contractInterface.getFunction(functionName);
      const inputs = fragment.inputs.map((input) => {
        return { name: input.name, type: input.type, internalType: input.type };
      });
      const inputValues: { [name: string]: string } = {};
      inputs.map((input, index) => {
        let value: any = customTransaction.args[index].value;
        if (value.type === "BigNumber") {
          value = BigNumber.from(value).toString();
        }
        inputValues[input.name] = value;
      });

      return {
        to: customTransaction.contract,
        value: customTransaction.value,
        data: null,
        contractMethod: {
          inputs,
          name: functionName,
          payable: fragment.payable,
        },
        contractInputsValues: inputValues,
      } as SafeTransactionBuilderTxn;
    }
  });
  return {
    ...header,
    transactions: safeBatchTransactions,
  };
};
