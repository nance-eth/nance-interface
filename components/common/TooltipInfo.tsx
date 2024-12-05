import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { PropsWithChildren } from "react";

export default function TooltipInfo({
  content,
  children,
}: PropsWithChildren<{ content: string }>) {
  return (
    <div
      className="tooltip cursor-pointer flex items-center gap-x-1"
      data-tip={content}
    >
      {children}
      <InformationCircleIcon className="w-4 h-4 inline" />
    </div>
  );
}
