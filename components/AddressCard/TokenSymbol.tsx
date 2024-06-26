import { classNames } from "@/utils/functions/tailwind";
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
  const isETH = address === "ETH";
  const tokenSymbol = isETH ? "ETH" : data?.symbol;

  return (
    <a
      href={isETH ? undefined : `${chain.blockExplorers?.default.url}/address/${address}`}
      className={classNames("break-all", !isETH && "hover:underline")}
    >
      {tokenSymbol || "TOKEN"}
    </a>
  );
}
