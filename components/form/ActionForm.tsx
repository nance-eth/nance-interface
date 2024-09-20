import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import ActionSearch from "../ActionSearch";

export default function ActionForm({
  label,
  fieldName,
  defaultValue,
  showType = true,
  required = true,
}: {
  label?: string;
  fieldName: any;
  defaultValue?: string;
  showType?: boolean;
  required?: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex">
        {showType && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            project
          </span>
        )}
        <Controller
          name={fieldName}
          control={control}
          rules={{
            required: required && "Can't be empty",
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <ActionSearch
              val={value}
              setVal={onChange}
              inputStyle={`${
                showType ? "rounded-none rounded-r-md" : "rounded-md"
              } h-10`}
            />
          )}
          defaultValue={defaultValue}
          shouldUnregister
        />
      </div>
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="mt-1 text-red-500">{message}</p>}
      />
    </div>
  );
}
