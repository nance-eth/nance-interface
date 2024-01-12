import { useState } from "react";
import { useSafeInject } from "./context/SafeInjectedContext";
import { useDebounce } from "@/utils/hooks/UseDebounce";
import { isAddress } from "viem";

export default function SafeInjectIframeCard() {
  const { appUrl, iframeRef, address, setAppUrl } = useSafeInject();
  const [urlInput, setUrlInput] = useState<string>("");

  useDebounce<string | undefined>(urlInput, 500, (k: string | undefined) => {
    if (k !== appUrl) {
      setAppUrl(k);
    }
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {"Input app url you want to load"}
      </label>
      <p className="text-xs text-gray-500">
        {
          "You can visit any dApps that supports Safe, interact with interface and get transaction you need to sign here."
        }
      </p>
      <div className="mt-1 flex rounded-md shadow-sm">
        <input
          type="text"
          className="block h-10 w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={!isAddress(address || "")}
          placeholder={
            isAddress(address || "")
              ? "Input app url you want to load"
              : "No project owner address founded"
          }
        />
      </div>

      {appUrl && (
        <div className="mt-2 overflow-y-auto">
          <iframe
            ref={iframeRef}
            src={appUrl}
            className="h-[40vw] w-full p-2"
          />
        </div>
      )}
    </div>
  );
}
