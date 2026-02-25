import { SpaceConfig } from "@nance/nance-sdk";

export default function Dialog({ spaceConfig, edit }: { spaceConfig: SpaceConfig; edit?: boolean }) {
  return (
    <div className="flex flex-col">
      <p className="text-sm text-gray-500">Discord settings are currently unavailable.</p>
    </div>
  );
}
