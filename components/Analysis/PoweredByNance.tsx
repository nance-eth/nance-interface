import Image from "next/image";

interface PoweredByNanceProps {
  size?: number;
}

export default function PoweredByNance({ size = 50 }: PoweredByNanceProps) {
  const textSize = size <= 50 ? 'text-[8px]' : 'text-xs';
  const nanceSize = size <= 50 ? 'text-[15px]' : 'text-2xl';

  return (
    <>
      <Image
        src="/images/logo-min.svg"
        alt="Logo"
        width={size}
        height={size}
        className="opacity-20"
      />
      <div className="flex flex-col select-none cursor-default">
        <span className={`ml-2 text-gray-400 ${textSize} font-medium`}>powered by</span>
        <span className={`ml-2 text-gray-400 ${nanceSize} font-medium`}>Nance</span>
      </div>
    </>
  );
}
