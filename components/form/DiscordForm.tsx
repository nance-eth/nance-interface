import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import DiscordSelector from "../DiscordSelector";
import { Session } from "next-auth";

export default function DiscordForm(
  { session } : { session: Session }
) {
  const { control, formState: { errors } } = useFormContext();
  const fieldName = 'discord';
  return (
    <div>
      <Controller
        name={fieldName}
        control={control}
        rules={{
          required: "Can't be empty",
        }}
        render={({ field: { onChange, value } }) =>
          <DiscordSelector session={session} val={value} setVal={onChange} />
        }
        shouldUnregister
      />
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
      />
    </div>
  )
}