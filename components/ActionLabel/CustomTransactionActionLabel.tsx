import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { BigNumber } from "ethers";
import { NANCE_API_URL } from "@/constants/Nance";
import { Action, CustomTransaction } from "@nance/nance-sdk";
import {
  extractFunctionName,
  parseFunctionAbiWithNamedArgs,
} from "@/utils/functions/nance";
import ResolvedContract from "../AddressCard/ResolvedContract";
import { DEPLOY_CONTRACT_FAKE_ADDRESS } from "@/constants/Contract";
import GovernanceCyclesInfoLabel from "./GovernanceCyclesInfoLabel";

export default function CustomTransactionActionLabel({
  action,
  space,
  uuid,
}: {
  action: Action;
  space: string;
  uuid: string | undefined;
}) {
  const customTransaction = action.payload as CustomTransaction;
  if (customTransaction.contract === DEPLOY_CONTRACT_FAKE_ADDRESS) {
    return (
      <span className="">
        deployContract
        <span>{`(${customTransaction.args[0].value})`}</span>
        {BigNumber.from(customTransaction.value).gt(0) && (
          <span>
            <span>{"{"}</span>
            <span className="text-gray-500">value</span>
            <span>{`: ${customTransaction.value}`}</span>
            <span>{"}"}</span>
          </span>
        )}
        <GovernanceCyclesInfoLabel action={action} />
      </span>
    );
  }

  return (
    <span className="">
      <ResolvedContract
        address={customTransaction.contract}
        style="inline ml-1"
      />
      &#46;
      <a
        href={`https://etherfunk.io/address/${
          customTransaction.contract
        }?fn=${extractFunctionName(customTransaction.functionName)}`}
        rel="noopener noreferrer"
        target="_blank"
        className="inline hover:underline"
      >
        {extractFunctionName(customTransaction.functionName)}
      </a>
      <span>{"("}</span>
      <span>
        {parseFunctionAbiWithNamedArgs(
          customTransaction.functionName,
          customTransaction.args
        ).map((pair: any, index: number) => (
          <span
            key={index}
            className="ml-1 text-gray-500 after:content-[','] first:ml-0 last:after:content-[''] "
          >
            <span className="inline-block">{pair[0]}</span>
            <span>{`: ${pair[1]}`}</span>
          </span>
        ))}
      </span>
      <span>{")"}</span>
      {BigNumber.from(customTransaction.value).gt(0) && (
        <span>
          <span>{"{"}</span>
          <span className="text-gray-500">value</span>
          <span>{`: ${customTransaction.value}`}</span>
          <span>{"}"}</span>
        </span>
      )}
      <div>
        <GovernanceCyclesInfoLabel action={action} />
      </div>
    </span>
  );
}
