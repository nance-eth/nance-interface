export default function TooltipInfo({ content }: { content: string }) {
  return (
    <div className="tooltip cursor-pointer" data-tip={content}>
      <span className="font-xs text-gray-400">[ ? ]</span>
    </div>
  );
}
