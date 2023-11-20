import { shortenAddress } from "@/utils/functions/address";
import { Address, useEnsName } from "wagmi";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { classNames } from "@/utils/functions/tailwind";
import { getAddressLink } from "@/utils/functions/EtherscanURL";
import { NetworkContext } from "@/context/NetworkContext";
import CopyableTooltip from "../common/CopyableTooltip";

interface Props {
  /**
   * Address to be formatted.
   */
  address: string | undefined;
  /**
   * Style of the address.
   */
  style?: string;
  /**
   * Override the URL prefix. Default is `https://[goerli.]etherscan.io/address/`.
   */
  overrideURLPrefix?: string;
  /**
   * Open the link in a new window. Default is `true`.
   */
  openInNewWindow?: boolean;
  /**
   * Don't render the link.
   */
  noLink?: boolean;
}

/**
 * Address will be resolved to ENS name if available.
 * @param address Address to be formatted.
 * @param style Style of the address.
 * @param overrideURLPrefix Override the URL prefix. Default is `https://[goerli.]etherscan.io/address/`.
 * @param openInNewWindow Open the link in a new window. Default is `true`.
 * @param noLink Don't render the link.
 */
export default function FormattedAddress({
  address,
  style,
  overrideURLPrefix,
  openInNewWindow = true,
  noLink = false,
}: Props) {
  const addr = address as Address;
  const hasAddr = addr && addr.length == 42;
  const anchorTarget = openInNewWindow ? "_blank" : "_self";

  const [label, setLabel] = useState(shortenAddress(address) || "Anon");
  const { data: ensName } = useEnsName({ address: addr, enabled: hasAddr });

  const network = useContext(NetworkContext);
  const urlPrefix = overrideURLPrefix || getAddressLink("", network);

  useEffect(() => {
    if (ensName) {
      setLabel(ensName);
    } else {
      setLabel(shortenAddress(address) || "Anon");
    }
  }, [ensName, address]);

  if (noLink) {
    return (
      <CopyableTooltip text={address || ""}>
        <ImageAndLabel address={address} label={label} />
      </CopyableTooltip>
    );
  }

  return (
    <CopyableTooltip text={address || ""}>
      <a
        target={anchorTarget}
        rel="noopener noreferrer"
        className={classNames(style, "flex hover:underline")}
        href={`${urlPrefix}${address ? encodeURIComponent(address) : ""}`}
      >
        <ImageAndLabel address={address} label={label} />
      </a>
    </CopyableTooltip>
  );
}

function ImageAndLabel({
  address,
  label,
}: {
  address: string | undefined;
  label: string;
}) {
  return (
    <>
      <Image
        src={`https://cdn.stamp.fyi/avatar/${address}?w=24&h=24`}
        alt={`Avatar of ${label}`}
        width={24}
        height={24}
        className="mr-1 rounded-full"
      />
      {label}
    </>
  );
}
