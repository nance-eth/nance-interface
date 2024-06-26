import { classNames } from "@/utils/functions/tailwind";
import useJBMSearch from "@/utils/hooks/juicebox/ProjectSmartSearch";
import BasicFormattedCard from "../common/BasicFormattedCard";
import { cidFromUrl, ipfsUrlOf, JBDAO_LOGO } from "@/constants/Juicebox";
import Link from "next/link";
import { Tooltip } from "flowbite-react";

interface Props {
  /**
   * The ID of the project to link to.
   */
  projectId: number | undefined;
  subText?: string;
  /**
   * The style of the link.
   */
  style?: string;
  /**
   * Whether or not the project deployed on testnet (goerli).
   */
  isTestnet?: boolean;
  /**
   * Whether or not to minify the link.
   */
  minified?: boolean;
}

/**
 * Displays a link to a project on Juicebox.
 */
export default function ProjectLink({
  projectId,
  subText,
  style,
  isTestnet = false,
  minified = false,
}: Props) {
  const { projects } = useJBMSearch(
    { pv: "2", projectId },
    !!projectId && !isTestnet,
  );

  if (!projectId || projectId <= 0) {
    return (
      <a className={classNames(style, "cursor-not-allowed")} href="#">
        No project
      </a>
    );
  }

  const handle = projects?.[0]?.handle;
  const host = isTestnet
    ? "https://goerli.juicebox.money"
    : "https://juicebox.money";
  const projectUrl = handle
    ? `${host}/@${handle}`
    : `${host}/v2/p/${projectId}`;
  const projectLabel = handle ? `@${handle}` : `#${projectId}`;

  const logoUri = projects?.[0]?.logo_uri;
  const imgSrc = logoUri ? ipfsUrlOf(cidFromUrl(logoUri)) : JBDAO_LOGO;

  const networkSuffix = isTestnet ? " (goerli)" : "";
  const name = (projects?.[0]?.name || "Untitled") + networkSuffix;
  const displayMinifiedName =
    (projects?.[0]?.name || projectLabel) + networkSuffix;

  if (minified) {
    return (
      <Link
        target="_blank"
        rel="noopener noreferrer"
        className={classNames(style, "hover:underline")}
        href={projectUrl}
      >
        {subText ? (
          <Tooltip content={subText}>
            @{displayMinifiedName}{" "}
          </Tooltip>
        ): (
          <p>@{displayMinifiedName}{" "} </p>
        )}
      </Link>
    );
  }

  return (
    <Link
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(style, "hover:underline")}
      href={projectUrl}
    >
      <BasicFormattedCard
        imgSrc={imgSrc}
        imgAlt={`Logo of juicebox project ${projectId}`}
      >
        <>
          <p>{name}</p>
          <p className="text-xs text-gray-400">{projectLabel}</p>
          <p className="text-xs text-gray-400">{subText}</p>
        </>
      </BasicFormattedCard>
    </Link>
  );
}
