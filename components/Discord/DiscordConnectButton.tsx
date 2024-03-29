import { LOCAL_STORAGE_KEY_DISCORD_STATUS } from "@/utils/functions/discordURL";
import { discordAuthWindow } from "@/utils/functions/discord";
import { useState } from "react";

export function DiscordConnectButton() {
  const [initError, setInitError] = useState<string>("");

  return (
    <div>
      <button
        type="button"
        className="inline-flex w-fit items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black disabled:opacity-50"
        onClick={async () => {
          localStorage.removeItem(LOCAL_STORAGE_KEY_DISCORD_STATUS);
          const init = await fetch("/api/discord/init");
          if (init.ok) {
            setInitError("");
            const { csrf, address } = await init.json();
            discordAuthWindow(csrf, address);
          } else {
            setInitError(await init.text());
          }
        }}
      >
        Connect Discord
      </button>
      {initError && <p className="mt-1 text-red-500">{initError}</p>}
    </div>
  );
}
