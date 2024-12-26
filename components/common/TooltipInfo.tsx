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
      <span className="font-xs text-gray-400">[ ? ]</span>
    </div>
  );
}
