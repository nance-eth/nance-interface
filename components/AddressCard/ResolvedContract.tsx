import { useEffect, useState } from "react";
import { useEtherscanContract } from "@/utils/hooks/EtherscanHooks";
import { classNames } from "@/utils/functions/tailwind";
import { getAddressLink } from "@/utils/functions/EtherscanURL";
import useChainConfigOfSpace from "@/utils/hooks/ChainOfSpace";

interface Props {
  address: string;
  style?: string;
  overrideURLPrefix?: string;
  openInNewWindow?: boolean;
  noLink?: boolean;
}

export default function ResolvedContract({
  address,
  style,
  overrideURLPrefix,
  openInNewWindow = true,
  noLink = false,
}: Props) {
  const addr = address as `0x${string}`;
  const hasAddr = addr && addr.length == 42;
  const anchorTarget = openInNewWindow ? "_blank" : "_self";

  const [label, setLabel] = useState<string>(address);
  const { data: contractSources } = useEtherscanContract(addr, hasAddr);

  const chain = useChainConfigOfSpace();
  const urlPrefix = overrideURLPrefix || getAddressLink("", chain.name);

  useEffect(() => {
    if (contractSources?.[0].ContractName) {
      setLabel(contractSources[0].ContractName);
    }
  }, [contractSources]);

  if (noLink) {
    return <span className={style}>{label}</span>;
  }

  return (
    <a
      target={anchorTarget}
      rel="noopener noreferrer"
      className={classNames(style, "hover:underline")}
      href={`${urlPrefix}${encodeURIComponent(address)}`}
    >
      {label}
    </a>
  );
}
