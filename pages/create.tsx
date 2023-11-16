/* eslint-disable react/jsx-no-undef */
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Notification from "@/components/common/Notification";
import { CreateFormValues } from "@/models/NanceTypes";
import { useCreateSpace } from "@/utils/hooks/NanceHooks";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import ProjectForm from "@/components/form/ProjectForm";
import AddressForm from "@/components/form/AddressForm";

import {
  DiscordForm,
  GovernanceCycleForm,
  SnapshotForm,
  TextForm,
} from "@/components/CreateSpace";
import { SiteNav } from "@/components/Site";
import DiscordUser from "@/components/CreateSpace/sub/DiscordUser";
import WalletConnectWrapper from "@/components/WalletConnectWrapper/WalletConnectWrapper";
import MultipleStep from "@/components/MultipleStep/MultipleStep";
import AestheticsStep from "@/components/CreateSpace/AestheticsStep";
import BasicDisclosure from "@/components/common/BasicDisclosure";
import { isValidSafe } from "@/utils/hooks/SafeHooks";

export default function CreateSpacePage() {
  // hooks
  const { data: session, status } = useSession();
  const address = session?.user?.name || "";

  return (
    <>
      <SiteNav
        pageTitle="nance control panel"
        withProposalButton={false}
        withWallet
      />

      <div className="m-6">
        <MultipleStep
          steps={[
            {
              name: "Aesthetics",
              content: <AestheticsStep />,
            },
            {
              name: "Integrations",
              content: (
                <div className="flex justify-center">
                  <div className="w-100">
                    <h1 className="mb-5 mt-8 text-center text-lg font-bold text-gray-900">
                      Create New Nance Instance
                    </h1>

                    <WalletConnectWrapper>
                      <DiscordUser address={address} />
                      <Form session={session!} />
                    </WalletConnectWrapper>
                  </div>
                </div>
              ),
            },
            {
              name: "Governance Rules",
              content: <div>governance rules placeholder</div>,
            },
          ]}
          enableDefaultStyle={false}
        />
      </div>
    </>
  );
}

function Form({ session }: { session: Session }) {
  // query and context
  const router = useRouter();
  const dryrun = router.query.dryrun === "true";
  // hooks
  const {
    isMutating,
    error: uploadError,
    trigger,
    data,
    reset,
  } = useCreateSpace(router.isReady);
  // state
  const [juiceboxProjectDisabled, setJuiceboxProjectDisabled] = useState(false);
  // form
  const methods = useForm<CreateFormValues>({ mode: "onChange" });
  const {
    register,
    handleSubmit,
    formState: { isValid },
    watch,
  } = methods;
  const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
    console.log(formData);
    const payload = { ...formData, dryrun };
    console.debug("📚 Nance.createSpace.onSubmit ->", { formData, payload });
    return trigger(payload).then((res) => {
      if (dryrun) console.debug("📚 Nance.createSpace.onSubmit -> ", res);
      else router.push(`/s/${formData.config.name}`);
    });
  };

  useEffect(() => {
    console.debug("📝 Nance.create ->", watch());
  });

  return (
    <FormProvider {...methods}>
      <Notification
        title="Success"
        description={dryrun ? JSON.stringify(data) : "Space created!"}
        show={data !== undefined}
        close={() => {
          reset();
        }}
        checked={true}
      />
      {uploadError && (
        <Notification
          title="Error"
          description={"error"}
          show={true}
          close={() => {
            reset();
          }}
          checked={false}
        />
      )}
      <form className="flex flex-col lg:m-6" onSubmit={handleSubmit(onSubmit)}>
        <TextForm
          label="Nance space name"
          name="config.name"
          register={register}
        />

        <BasicDisclosure title="Setup Discord" defaultOpen className="mt-6">
          <DiscordForm />
        </BasicDisclosure>

        <BasicDisclosure title="Setup Snapshot" defaultOpen className="mt-6">
          <SnapshotForm session={session} />
        </BasicDisclosure>

        <BasicDisclosure title="Integrate Juicebox" className="mt-6">
          <ProjectForm
            label="Juicebox projectId"
            fieldName="config.juicebox.projectId"
            showType={false}
          />
        </BasicDisclosure>

        <BasicDisclosure title="Integrate Safe" className="mt-6">
          <AddressForm
            label="Safe address"
            fieldName="config.juicebox.gnosisSafeAddress"
            showType={false}
            validate={async (e) => {
              const isSafe = await isValidSafe(e);
              if (!isSafe) {
                return "Invalid Safe address";
              }
            }}
          />
        </BasicDisclosure>

        <BasicDisclosure title="Governance Rules" className="mt-6">
          <TextForm
            label="Proposal ID Prefix"
            name="config.proposalIdPrefix"
            register={register}
            maxLength={3}
            placeHolder="JBP"
            className="w-16"
            tooltip="Text prepended to proposal ID numbers, usually 3 letters representing your organization"
          />
          <GovernanceCycleForm />
        </BasicDisclosure>

        {
          <button
            type="submit"
            disabled={!isValid || isMutating}
            className="ml-300 mt-5 inline-flex w-20 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white
              shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            Submit
          </button>
        }
      </form>
    </FormProvider>
  );
}
