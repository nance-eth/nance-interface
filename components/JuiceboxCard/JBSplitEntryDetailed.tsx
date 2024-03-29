import { JBConstants } from "@/models/JuiceboxTypes";
import FormattedAddress from "../AddressCard/FormattedAddress";
import ProjectLink from "../ProjectLink";

export default function JBSplitEntryDetailed({
  beneficiary,
  projectId,
  allocator,
  percent,
  preferAddToBalance,
  preferClaimed,
  style = "flex space-x-6",
}: {
  beneficiary: string;
  projectId: string;
  allocator: string;
  percent: string;
  preferAddToBalance: boolean;
  preferClaimed: boolean;
  style?: string;
}) {
  const project = parseInt(projectId);
  let splitMode = "address";
  if (allocator !== "0x0000000000000000000000000000000000000000")
    splitMode = "allocator";
  else if (project !== 0) splitMode = "project";

  const mainStyle = "text-sm font-semibold";
  const subStyle = "text-xs italic";

  return (
    <div className={style}>
      {splitMode === "allocator" && (
        <>
          <FormattedAddress address={allocator} style={mainStyle} />
          <a
            href="https://info.juicebox.money/dev/learn/glossary/split-allocator/"
            target="_blank"
            rel="noreferrer"
          >
            (Allocator)
          </a>
          <ProjectLink projectId={project} style={subStyle} />
          <FormattedAddress address={beneficiary} style={subStyle} minified />
        </>
      )}

      {splitMode === "project" && (
        <>
          <ProjectLink projectId={project} style={mainStyle} />
          <FormattedAddress address={beneficiary} style={subStyle} minified />
        </>
      )}

      {/* Address mode */}
      {splitMode === "address" && (
        <>
          <FormattedAddress address={beneficiary} style={mainStyle} minified />
        </>
      )}

      <span>
        {(
          (parseInt(percent) / JBConstants.TotalPercent.Splits[2]) *
          100
        ).toFixed(2)}
        %
      </span>

      {preferAddToBalance && <span>preferAddToBalance</span>}
      {preferClaimed && <span>preferClaimed</span>}
    </div>
  );
}
