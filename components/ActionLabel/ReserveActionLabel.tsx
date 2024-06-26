import { Reserve } from "@nance/nance-sdk";
import JBSplitEntryDetailed from "@/components/JuiceboxCard/JBSplitEntryDetailed";

export function ReserveActionLabel({ reserve }: { reserve: Reserve }) {
  return (
    <div className="flex flex-col">
      {reserve.splits
        .sort((a, b) => Number(b.percent) - Number(a.percent))
        .map((split, index) => (
          <JBSplitEntryDetailed
            key={index}
            beneficiary={split.beneficiary}
            allocator={split.allocator}
            projectId={split.projectId.toString()}
            percent={split.percent.toString()}
            preferAddToBalance={split.preferAddToBalance}
            preferClaimed={split.preferClaimed}
            style="grid grid-cols-3 gap-6"
          />
        ))}
    </div>
  );
}
