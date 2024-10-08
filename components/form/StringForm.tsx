import { classNames } from "@/utils/functions/tailwind";
import { ErrorMessage } from "@hookform/error-message";
import { useFormContext } from "react-hook-form";

export default function StringForm({
  label,
  fieldName,
  fieldType = "string",
  showType = true,
}: {
  label: string;
  fieldName: any;
  fieldType?: string;
  defaultValue?: string;
  showType?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex rounded-md shadow-sm">
        {showType && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            {fieldType}
          </span>
        )}
        <input
          type="text"
          {...register(fieldName, { shouldUnregister: true })}
          className={classNames(
            "block h-10 w-full flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
            showType ? "rounded-none rounded-r-md" : "rounded-md"
          )}
        />
      </div>
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
      />
    </div>
  );
}
