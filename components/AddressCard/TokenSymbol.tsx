import useChainConfigOfSpace from "@/utils/hooks/ChainOfSpace";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";

export default function TokenSymbol({
  address,
}: {
  address: string | undefined;
}) {
  const chain = useChainConfigOfSpace();
  const { data } = useReadContract({
    address: address as `0x${string}`,
    abi: erc20Abi,
    functionName: "symbol",
    chainId: chain?.id,
  });
  const isETH = address === "ETH";
  const tokenSymbol = isETH ? "ETH" : data;

  return (
    <span className="break-all">
      {isETH ? "" : "$"}
      {tokenSymbol || "TOKEN"}
    </span>
  );
}
