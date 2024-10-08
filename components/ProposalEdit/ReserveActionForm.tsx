import { Disclosure } from "@headlessui/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ZERO_ADDRESS } from "@/constants/Contract";
import { useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { useCurrentFundingCycle } from "@/utils/hooks/juicebox/CurrentFundingCycle";
import { useCurrentSplits } from "@/utils/hooks/juicebox/CurrentSplits";
import { JBConstants } from "@/models/JuiceboxTypes";
import { JBSplitStruct } from "@nance/nance-sdk";
import AddressForm from "../form/AddressForm";
import BooleanForm from "../form/BooleanForm";
import UIntForm from "../form/UIntForm";
import ProjectForm from "../form/ProjectForm";
import JBSplitEntryDetailed from "@/components/JuiceboxCard/JBSplitEntryDetailed";
import GenericButton from "@/components/common/GenericButton";
import { ProposalMetadataContext } from "./context/ProposalMetadataContext";

export default function ReserveActionForm({
  genFieldName,
}: {
  genFieldName: (field: string) => any;
}) {
  const { space } = useContext(ProposalMetadataContext);

  const {
    watch,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove, prepend } = useFieldArray<{
    splits: JBSplitStruct[];
    [key: string]: any;
  }>({ name: genFieldName("splits") });

  const { data: spaceInfo } = useSpaceInfo({ space });
  const projectId = parseInt(spaceInfo?.data?.juiceboxProjectId || "0");
  const { data: _fc, isLoading: fcIsLoading } =
    useCurrentFundingCycle(projectId);
  const [fc, metadata] = _fc || [];
  const { data: ticketMods, isLoading: ticketModsIsLoading } = useCurrentSplits(
    projectId,
    fc?.configuration,
    BigInt(JBConstants.SplitGroup.RESERVED_TOKEN)
  );
  // TODO: reserve rate, percent / total_percentage JBConstants

  useEffect(() => {
    if (fields.length === 0) {
      // if no splits in proposal (not editing) then load from JB project
      const arr = ticketMods ? [...ticketMods] : [];
      arr.sort((a, b) => {
        if (a.percent > b.percent) {
          return -1;
        } else if (a.percent < b.percent) {
          return 1;
        } else {
          return 0;
        }
      });
      arr.forEach((ticket) => {
        const split: JBSplitStruct = {
          preferClaimed: ticket.preferClaimed,
          preferAddToBalance: ticket.preferAddToBalance,
          percent: ticket.percent.toString(),
          projectId: ticket.projectId.toString(),
          beneficiary: ticket.beneficiary,
          lockedUntil: ticket.lockedUntil.toString(),
          allocator: ticket.allocator || "",
        };
        append(split);
      });
    }
  }, [ticketMods, append, fields]);

  return (
    <div className="flex flex-col gap-6">
      <GenericButton
        onClick={() =>
          prepend({
            preferClaimed: false,
            preferAddToBalance: false,
            percent: 0,
            projectId: 0,
            beneficiary: ZERO_ADDRESS,
            lockedUntil: 0,
            allocator: ZERO_ADDRESS,
          })
        }
        className="mt-6"
      >
        <PlusIcon className="h-5 w-5" />
        <p className="ml-1">Add a receipient</p>
      </GenericButton>

      {ticketModsIsLoading && (
        <>
          <div className="h-12 w-full animate-pulse rounded-md bg-blue-100 p-4 shadow-sm"></div>
          <div className="h-12 w-full animate-pulse rounded-md bg-blue-100 p-4 shadow-sm"></div>
          <div className="h-12 w-full animate-pulse rounded-md bg-blue-100 p-4 shadow-sm"></div>
        </>
      )}

      {(fields as any)?.map(
        (field: JBSplitStruct & { id: string }, index: number) => (
          <Disclosure
            key={field.id}
            as="div"
            className="rounded-md bg-blue-100 p-4 shadow-sm"
            defaultOpen={field.beneficiary === ZERO_ADDRESS}
          >
            <Disclosure.Button as="div" className="flex space-x-6">
              <span>No.{index}</span>
              <JBSplitEntryDetailed
                beneficiary={
                  watch(genFieldName(`splits.${index}.beneficiary`)) ||
                  field.beneficiary
                }
                projectId={
                  watch(genFieldName(`splits.${index}.projectId`)) ||
                  field.projectId.toString()
                }
                allocator={
                  watch(genFieldName(`splits.${index}.allocator`)) ||
                  field.allocator
                }
                percent={
                  watch(genFieldName(`splits.${index}.percent`)) ||
                  field.percent.toString()
                }
                preferAddToBalance={
                  watch(genFieldName(`splits.${index}.preferAddToBalance`)) ||
                  field.preferAddToBalance
                }
                preferClaimed={
                  watch(genFieldName(`splits.${index}.preferClaimed`)) ||
                  field.preferClaimed
                }
              />
              <TrashIcon
                className="h-5 w-5 cursor-pointer"
                onClick={() => remove(index)}
              />
            </Disclosure.Button>
            <Disclosure.Panel
              as="div"
              className="mt-2 grid grid-cols-4 gap-6"
              unmount={false}
            >
              <div className="col-span-4 sm:col-span-3">
                <AddressForm
                  label="Beneficiary"
                  fieldName={genFieldName(`splits.${index}.beneficiary`)}
                  defaultValue={field.beneficiary}
                />
              </div>
              <div className="col-span-4 sm:col-span-1">
                <UIntForm
                  label="Percent"
                  fieldName={genFieldName(`splits.${index}.percent`)}
                  fieldType="per billion"
                  defaultValue={Number(field.percent)}
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                <ProjectForm
                  label="Project ID"
                  fieldName={genFieldName(`splits.${index}.projectId`)}
                  defaultValue={Number(field.projectId)}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <AddressForm
                  label="Allocator"
                  fieldName={genFieldName(`splits.${index}.allocator`)}
                  defaultValue={field.allocator}
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                {/* todo date timestamp param */}
                <UIntForm
                  label="lockedUntil"
                  fieldName={genFieldName(`splits.${index}.lockedUntil`)}
                  fieldType="timestamp"
                  defaultValue={Number(field.lockedUntil)}
                />
              </div>
              <div className="col-span-4 sm:col-span-1">
                <BooleanForm
                  label="preferClaimed"
                  fieldName={genFieldName(`splits.${index}.preferClaimed`)}
                  checked={field.preferClaimed}
                />
              </div>
              <div className="col-span-4 sm:col-span-1">
                <BooleanForm
                  label="preferAddToBalance"
                  fieldName={genFieldName(`splits.${index}.preferAddToBalance`)}
                  checked={field.preferAddToBalance}
                />
              </div>
            </Disclosure.Panel>
          </Disclosure>
        )
      )}
    </div>
  );
}
