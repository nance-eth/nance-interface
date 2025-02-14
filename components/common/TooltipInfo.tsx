import { Tooltip } from "flowbite-react";
import { PropsWithChildren } from "react";

export default function TooltipInfo({
  content,
  children,
}: PropsWithChildren<{ content: string }>) {
  return (
    <Tooltip
      content={content}
      className="cursor-pointer flex items-center gap-x-1"
    >
      {children}
      <span className="font-xs text-gray-400">[ ? ]</span>
    </Tooltip>
  );
}
