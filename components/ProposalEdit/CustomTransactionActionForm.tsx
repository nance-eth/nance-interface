import { ErrorMessage } from "@hookform/error-message";
import { FunctionFragment, FormatTypes, Interface } from "ethers/lib/utils";
import { useState, useEffect, useCallback, useContext } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import {
  TenderlySimulationAPIResponse,
  encodeTransactionInput,
} from "@/utils/hooks/TenderlyHooks";
import FunctionSelector from "./FunctionSelector";
import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import StringForm from "../form/StringForm";
import BooleanForm from "../form/BooleanForm";
import SafeInjectIframeCard from "../SafeInjectIframeCard";
import { useSafeInject } from "../SafeInjectIframeCard/context/SafeInjectedContext";
import { BigNumber } from "ethers";
import { CustomTransactionArg } from "@nance/nance-sdk";
import { DEPLOY_CONTRACT_FAKE_ADDRESS } from "@/constants/Contract";
import { classNames } from "@/utils/functions/tailwind";
import { SpaceContext } from "@/context/SpaceContext";
import {
  dateRangesOfCycles,
  getEarliestStartCycle,
} from "@/utils/functions/GovernanceCycle";
import GenericTenderlySimulationButton from "../TenderlySimulation/GenericTenderlySimulationButton";
import { GenericTransactionData } from "../Transaction/TransactionCreator";
import { extractFunctionName } from "@/utils/functions/nance";

export default function CustomTransactionActionForm({
  genFieldName,
  projectOwner,
}: {
  genFieldName: (field: string) => any;
  projectOwner: string | undefined;
}) {
  const [functionData, setFunctionData] = useState<string>();

  const spaceInfo = useContext(SpaceContext);
  const earliestStartCycle = getEarliestStartCycle(
    spaceInfo?.currentCycle || 1,
    spaceInfo?.currentEvent.title || "Unknown"
  );

  const { latestTransaction, setAddress, address } = useSafeInject();
  const {
    watch,
    control,
    formState: { errors },
    getValues,
    getFieldState,
    setValue,
  } = useFormContext();
  const { replace, fields } = useFieldArray({ name: genFieldName("args") });

  const functionName: string = getValues(genFieldName("functionName"));
  let fragmentFromName = undefined;
  try {
    const _i = new Interface([functionName]);
    fragmentFromName = _i.getFunction(extractFunctionName(functionName));
  } catch (e) {
    console.warn("fragmentFromName.parseError", e);
  }
  const [functionFragment, setFunctionFragment] = useState<
    FunctionFragment | undefined
  >(fragmentFromName);

  const args = functionFragment?.inputs?.map((param, index) =>
    getValues(genFieldName(`args.${index}.value`))
  );
  const to = getValues(genFieldName("contract")) as string;
  // FIXME: Safe can use https://github.com/safe-global/safe-smart-account/blob/main/contracts/libraries/CreateCall.sol
  //   to deploy contract on Safe behalf.
  const input =
    to === DEPLOY_CONTRACT_FAKE_ADDRESS
      ? (fields[0] as unknown as CustomTransactionArg)?.value || ""
      : encodeTransactionInput(
          functionFragment?.format(FormatTypes.minimal) || "",
          args || []
        );

  const transaction: GenericTransactionData =
    to === DEPLOY_CONTRACT_FAKE_ADDRESS
      ? {
          to: "",
          value: getValues(genFieldName("value")),
          data: input,
        }
      : {
          to: getValues(genFieldName("contract")) as string,
          value: getValues(genFieldName("value")),
          data: input,
        };

  useEffect(() => {
    if (latestTransaction) {
      setValue(genFieldName("contract"), latestTransaction.to);
      setValue(
        genFieldName("value"),
        BigNumber.from(latestTransaction.value).toString()
      );

      if (latestTransaction.to) {
        setValue(genFieldName("contract"), latestTransaction.to);
        setFunctionData(latestTransaction.data);
      } else {
        setValue(genFieldName("contract"), DEPLOY_CONTRACT_FAKE_ADDRESS);
        // no to, then it's a deploy contract transaction
        setFunctionData(latestTransaction.data);
        replace([
          {
            value: latestTransaction.data,
            type: "bytes",
            name: "deployData",
          },
        ]);
      }

      // decode function name and args from data
      console.debug("latestTransaction", latestTransaction);
    }
  }, [latestTransaction, setValue]);

  const onSimulated = useCallback(
    (
      data: TenderlySimulationAPIResponse | undefined,
      shouldSimulate: boolean
    ) => {
      const simulationId = data?.simulation?.id;
      const simulationStatus = data?.simulation?.status;

      if (simulationId) {
        setValue(genFieldName("tenderlyId"), simulationId);
      }

      if (shouldSimulate) {
        setValue(
          genFieldName("tenderlyStatus"),
          simulationStatus ? "true" : "false"
        );
      } else {
        setValue(genFieldName("tenderlyStatus"), "false");
      }
    },
    [setValue]
  );

  return (
    <div>
      <div className="mt-6 grid grid-cols-4 gap-6">
        {!!projectOwner && !!input && (
          <GenericTenderlySimulationButton
            rawAddress={projectOwner || ""}
            transactions={[transaction]}
            onSimulated={onSimulated}
          />
        )}

        <div className="col-span-4 sm:col-span-1">
          <BooleanForm
            label={`Milestone Based`}
            fieldName={genFieldName("pollRequired")}
            tooltip="It will only get executed after the milestone has been met"
          />
        </div>

        <div className="col-span-4 sm:col-span-1">
          <UIntForm
            label="Governance Cycle Start"
            fieldName={genFieldName("cycleStart")}
            defaultValue={earliestStartCycle}
            min={earliestStartCycle}
            showType={false}
            tooltip="When should this action start to take effect?"
          />
          <span className="text-xs text-gray-400">
            Current: GC-{spaceInfo?.currentCycle} (
            {spaceInfo?.currentEvent.title || "Unknown"})
          </span>
        </div>
        <div className="col-span-4 sm:col-span-1">
          <UIntForm
            label="Duration"
            fieldName={genFieldName("count")}
            fieldType="cycles"
            defaultValue={1}
            min={1}
            tooltip="How many Juicebox funding cycles will this payout last?"
          />
          <span className="text-xs text-gray-400">
            Date:{" "}
            {dateRangesOfCycles({
              cycle: parseInt(watch(genFieldName("cycleStart"))),
              length: parseInt(watch(genFieldName("count"))),
              currentCycle: spaceInfo?.currentCycle,
              cycleStartDate: spaceInfo?.cycleStartDate,
            })}
          </span>
        </div>

        <div
          className={classNames(
            "col-span-4 sm:col-span-2",
            watch(genFieldName("contract")) === DEPLOY_CONTRACT_FAKE_ADDRESS &&
              "hidden"
          )}
        >
          <AddressForm label="Contract" fieldName={genFieldName("contract")} />
        </div>

        <div className="col-span-4 sm:col-span-1">
          <UIntForm label="ETH Value" fieldName={genFieldName("value")} />
        </div>

        {watch(genFieldName("contract"))?.length === 42 &&
          watch(genFieldName("contract")) !== DEPLOY_CONTRACT_FAKE_ADDRESS && (
            <div className="col-span-4 sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Function
              </label>
              <Controller
                name={genFieldName("functionName")}
                control={control}
                rules={{
                  required: "Can't be empty",
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <FunctionSelector
                    address={watch(genFieldName("contract"))}
                    val={value}
                    setVal={onChange}
                    setFunctionFragment={(f) => {
                      setFunctionFragment(f);

                      if (functionData) {
                        // load args from latest transaction
                        const iface = new Interface([f]);
                        const decoded = iface.decodeFunctionData(
                          f.name,
                          functionData
                        );
                        const args = decoded.map((v) => v);

                        args.forEach((arg, index) => {
                          setValue(genFieldName(`args.${index}`), arg);
                        });
                        replace(
                          args.map((v, index) => ({
                            value: v,
                            type: f.inputs[index].type,
                            name: f.inputs[index].name,
                          }))
                        );
                        // clear this one-time data that we got from latest transaction
                        setFunctionData(undefined);
                      } else {
                        // reset args
                        replace(
                          f.inputs?.map((param) => {
                            return {
                              value: "",
                              type: param.type,
                              name: param.name,
                            };
                          }) || []
                        );
                      }
                    }}
                    inputStyle="h-10"
                    functionData={functionData}
                  />
                )}
              />
              <ErrorMessage
                errors={errors}
                name={genFieldName("functionName")}
                render={({ message }) => (
                  <p className="mt-1 text-red-500">{message}</p>
                )}
              />
            </div>
          )}

        {(fields as unknown as CustomTransactionArg[]).map((field, index) => (
          <div key={field.id} className="col-span-4 sm:col-span-1">
            {field.type === "address" && (
              <AddressForm
                label={`Param: ${field.name || "_"}`}
                fieldName={genFieldName(`args.${index}.value`)}
              />
            )}

            {field.type.includes("int") && (
              <UIntForm
                label={`Param: ${field.name || "_"}`}
                fieldName={genFieldName(`args.${index}.value`)}
                fieldType={field.type}
              />
            )}

            {field.type === "bool" && (
              <BooleanForm
                label={`Param: ${field.name || "_"}`}
                fieldName={genFieldName(`args.${index}.value`)}
              />
            )}

            {field.type !== "address" &&
              !field.type.includes("int") &&
              field.type !== "bool" && (
                <StringForm
                  label={`Param: ${field.name || "_"}`}
                  fieldName={genFieldName(`args.${index}.value`)}
                  fieldType={field.type}
                />
              )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <SafeInjectIframeCard />
      </div>
    </div>
  );
}
