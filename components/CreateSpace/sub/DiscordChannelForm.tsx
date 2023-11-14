import GenericListbox from "@/components/common/GenericListbox";
import { DiscordChannel } from "@/models/DiscordTypes";
import { formatChannels } from "@/utils/functions/discord";
import { useFetchDiscordChannels } from "@/utils/hooks/DiscordHooks";
import { Controller, useFormContext } from "react-hook-form";

/**
 * Load all channels from the guild, list them in a dropdown and set the selected channel id into the form
 */
export default function DiscordChannelForm({
  guildId,
  label,
  fieldName,
  disabled = false,
}: {
  guildId: string | undefined;
  label: string;
  fieldName: string;
  disabled?: boolean;
}) {
  const { control } = useFormContext();
  const { data } = useFetchDiscordChannels(guildId, !disabled);

  const channels = formatChannels(data);

  return (
    <Controller
      name={fieldName}
      control={control}
      rules={{
        required: "Can't be empty",
      }}
      render={({ field: { onChange, value } }) => (
        <GenericListbox<DiscordChannel>
          value={
            channels.find((c) => c.id === value) ||
            ({ name: "-", id: null } as unknown as DiscordChannel)
          }
          onChange={(c) => onChange(c.id)}
          label={label}
          disabled={disabled}
          items={channels}
        />
      )}
      shouldUnregister
    />
  );
}
