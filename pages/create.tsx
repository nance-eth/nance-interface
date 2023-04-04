import { useState } from "react";
import SiteNav from "../components/SiteNav";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import { useAccount, useSigner } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { JsonRpcSigner } from "@ethersproject/providers";
import { signPayload } from "../libs/signer";
import { CreateFormValues, CreateFormKeys } from "../models/NanceTypes";
import { useCreateSpace } from "../hooks/NanceHooks";

type TextInputProps = {
  label: string;
  name: CreateFormKeys;
  register: any;
  placeholder: string;
  required: boolean;
  defaultValue: string | number;
  type: string;
}

export default function CreateSpacePage() {
  return (
    <>
      <SiteNav pageTitle='nance control panel' withWallet/>
      
      <div className="m-12">
        <div className="w-64 justify-left">
          <h1 className="text-lg font-bold leading-6 text-gray-900">Create New nance Instance</h1>
          <Form />
        </div>
      </div>
    </>
  );
}

function Form() {
  // query and context
  const router = useRouter();

  // state
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState(undefined);
  const [spaceConfig, setSpaceConfig] = useState<CreateFormValues>(undefined);

  // hooks
  const { isMutating, error: uploadError, trigger, data, reset } = useCreateSpace(spaceConfig?.name as string, router.isReady);
  const { data: signer, isError, isLoading } = useSigner()
  const jrpcSigner = signer as JsonRpcSigner;
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // form
  const methods = useForm<CreateFormValues>();
  const { register, handleSubmit, control, formState: { errors } } = methods;
  const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
    console.log(formData);
    const payload = { };
    console.debug("📚 Nance.createSpace.onSubmit ->", { formData, payload })

    setSigning(true);

    signPayload(jrpcSigner, "nanceish", "config", payload).then((signature) => {
      setSigning(false);
      // send to API endpoint
      reset();
      const req = {
        signature,
        config: formData
      }
      console.debug("📗 Nance.createSpace.submit ->", req);
      return trigger(req);
    })
      .then(res => router.push(`/overrideSpace=${res.data}`))
      .catch((err) => {
        setSigning(false);
        setSignError(err);
        console.warn("📗 Nance.editProposal.onSignError ->", err);
      });
  }

  // shortcut
  const isSubmitting = signing || isMutating;
  const error = signError || uploadError;
  const resetSignAndUpload = () => {
    setSignError(undefined);
    reset();
  }

  return (
    <FormProvider {...methods} >
      <form className="m-4 lg:m-6 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Nance space name" name="name" register={register} />
        <FormInput label="Discord Guild ID #" name="discord.guildId" register={register} />
        <FormInput label="Discord Alert Role ID #" name="discord.roleIds.governance" register={register} />
        <FormInput label="Proposal Channel ID #" name="discord.channelIds.proposals" register={register} />
        <FormInput label="Snapshot space key" name="snapshot.space" register={register} />
        <FormInput label="Snapshot minimum passing token amount" name="snapshot.minTokenPassingAmount" register={register} type="number" defaultValue={80E6} />
        <button type="submit"
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium
          text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400">
          Submit
        </button>
      </form>
    </FormProvider>
  )
}

const FormInput = ({ label, name, defaultValue, register, required = true, type = "text" }: Partial<TextInputProps>) => {
  return (
    <div className="flex flex-col mb-4 w-80">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        {...register(name, { required, shouldUnregister: true })}
      />
    </div>
  );
}
