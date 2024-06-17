import useChainConfigOfSpace from "@/utils/hooks/ChainOfSpace";
import { useToken } from "wagmi";

export default function TokenSymbol({
  address,
}: {
  address: string | undefined;
}) {
  const chain = useChainConfigOfSpace();
  const { data } = useToken({
    address: address as `0x${string}`,
    chainId: chain?.id,
  });
  const tokenSymbol = data?.symbol;

  return (
    <a
      href={`${chain.blockExplorers?.default.url}/address/${address}`}
      className="break-all hover:underline"
    >
      {tokenSymbol || "TOKEN"}
    </a>
  );
}
