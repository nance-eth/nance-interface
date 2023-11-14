import GenericListbox from "@/components/common/GenericListbox";
import { DiscordRole } from "@/models/DiscordTypes";
import { formatRoles } from "@/utils/functions/discord";
import { useDiscordGuildRoles } from "@/utils/hooks/DiscordHooks";
import { Controller, useFormContext } from "react-hook-form";

/**
 * Load all channels from the guild, list them in a dropdown and set the selected channel id into the form
 */
export default function DiscordRoleForm({
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
  const { data } = useDiscordGuildRoles(guildId);

  const roles = formatRoles(data);

  return (
    <Controller
      name={fieldName}
      control={control}
      rules={{
        required: "Can't be empty",
      }}
      render={({ field: { onChange, value } }) => (
        <GenericListbox<DiscordRole>
          value={
            roles.find((c) => c.id === value) ||
            ({ name: "-", id: null } as unknown as DiscordRole)
          }
          onChange={(c) => onChange(c.id)}
          label={label}
          disabled={disabled}
          items={roles}
        />
      )}
      shouldUnregister
    />
  );
}
