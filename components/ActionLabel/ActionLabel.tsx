import { Action, Cancel, Reserve } from "@nance/nance-sdk";
import CustomTransactionActionLabel from "./CustomTransactionActionLabel";
import PayoutActionLabel from "./PayoutActionLabel";
import { ReserveActionLabel } from "./ReserveActionLabel";
import TransferActionLabel from "./TransferActionLabel";
import CancelActionLabel from "./CancelActionLabel";
import MilestonePollLink from "./MilestonePollLink";

export default function ActionLabel({
  action,
  space,
  readonly = false,
}: {
  action: Action;
  space: string;
  readonly?: boolean;
}) {
  return (
    <div className="ml-2 flex w-full space-x-2 break-words">
      <span className="inline-flex h-min items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 w-min">
        {action.type}

        {/* {action.type === "Reserve" && (
          <span>
            (Total: {(action.payload as Reserve).splits.reduce((acc, obj) => acc + obj.percent, 0) * 100 / JBConstants.TotalPercent.Splits[2]}%)
          </span>
        )} */}
      </span>

      <div className="flex flex-col w-1/2 grow">
        <div>
          {action.type === "Transfer" && (
            <TransferActionLabel action={action} />
          )}

          {action.type === "Payout" && <PayoutActionLabel action={action} />}

          {action.type === "Custom Transaction" && (
            <CustomTransactionActionLabel
              action={action}
              space={space}
              uuid={action.uuid}
            />
          )}

          {action.type === "Reserve" && (
            <ReserveActionLabel reserve={action.payload as Reserve} />
          )}

          {action.type === "Cancel" && (
            <CancelActionLabel cancel={action.payload as Cancel} />
          )}
        </div>

        {action.pollRequired && !readonly && (
          <div>
            <MilestonePollLink action={action} />
          </div>
        )}
      </div>
    </div>
  );
}
