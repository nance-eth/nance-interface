import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import ENSAddressInput from "./ENSAddressInput";
import { useEffect } from "react";
import { classNames } from "@/utils/functions/tailwind";
import { isAddress, zeroAddress } from "viem";
import TooltipInfo from "@/components/common/TooltipInfo";

interface AddressFormProps {
  /**
   * The label for the input
   */
  label: string;
  /**
   * The name of the field in the form
   */
  fieldName: any;
  /**
   * The default value for the input
   */
  defaultValue?: string;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * A function that validates the input. It should return true if the input is valid, or a message if it's invalid.
   */
  validate?: ((v: string) => boolean) | object;
  /**
   * Whether to show the type as "address" in front of the input.
   */
  showType?: boolean;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * The tooltip to show when the input is disabled
   */
  disabledTooltip?: string;
  tooltip?: string;
}

/**
 * A form component for entering an Ethereum address. It supports ENS names and plain addresses.
 * By default, it validates that the address is a valid Ethereum address.
 * @param label The label for the input
 * @param fieldName The name of the field in the form
 * @param defaultValue The default value for the input
 * @param disabled Whether the input is disabled
 * @param validate A function that validates the input. It should return true if the input is valid, or a message if it's invalid.
 * @usage <AddressForm fieldName="safeAddress" validate={async (e) => {
     const isSafe = await isValidSafe(e);
     if (!isSafe) {
       return "Invalid Safe address";
     }
   }}
 />
 */
export default function AddressForm({
  label,
  fieldName,
  defaultValue = "",
  disabled = false,
  disabledTooltip,
  validate = undefined,
  showType = true,
  required = true,
  tooltip = "",
}: AddressFormProps) {
  const {
    control,
    formState: { errors, isValidating },
    setValue,
    getValues,
  } = useFormContext();

  // Controller doesn't support default values, so we need to set it manually
  // Here's the trick: we only set the default value if the field is empty
  useEffect(() => {
    if (defaultValue && !getValues(fieldName)) {
      setValue(fieldName, defaultValue);
    }
  }, [defaultValue, getValues, setValue, fieldName]);

  return (
    <div>
      <div className="mb-1 text-sm font-medium text-gray-700 flex space-x-1 items-center">
        <span>{label}</span> {tooltip && <TooltipInfo content={tooltip} />}
      </div>
      <div className="mt-1 flex rounded-md shadow-sm">
        {showType && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            address
          </span>
        )}

        <Controller
          name={fieldName}
          control={control}
          rules={{
            required: required && "Can't be empty",
            pattern: {
              value: /^0x[a-fA-F0-9]{40}$/,
              message: "Not a valid address",
            },
            validate: validate as any,
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <ENSAddressInput
              val={value}
              setVal={onChange}
              inputStyle={classNames(
                "h-10",
                showType ? "rounded-none rounded-r-md" : "rounded-md",
              )}
              disabled={disabled}
              disabledTooltip={disabledTooltip}
            />
          )}
          shouldUnregister={true}
        />
      </div>

      {isValidating && (
        <p className="mt-1 animate-pulse text-sm text-gray-500">
          Checking if Safe address is valid on this network...
        </p>
      )}

      {!isValidating && (
        <ErrorMessage
          errors={errors}
          name={fieldName}
          render={({ message }) => (
            <p className="mt-1 text-red-500">{message}</p>
          )}
        />
      )}
    </div>
  );
}
