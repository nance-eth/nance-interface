import { useContext, useEffect, useState } from "react";
import SiteNav from "../components/SiteNav";
import { useForm, FormProvider, useFormContext, Controller, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import { useAccount, useSigner } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { JsonRpcSigner } from "@ethersproject/providers";
import { signPayload } from "../libs/signer";
import { CreateFormValues } from "../models/NanceTypes";
import { useCreateSpace } from "../hooks/NanceHooks";


export default function TreasuryPage() {
  return (
    <>
      <SiteNav pageTitle='nance control panel' />
      
      <div className="m-12">
        <div className="flex justify-between">
          <h1 className="text-lg font-bold leading-6 text-gray-900">Create New nance Instance</h1>

        </div>
      </div>
    </>
  );
}

function Form({ space }: { space: string }) {
  // query and context
  const router = useRouter();

  // state
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState(undefined);

  // hooks
  const { isMutating, error: uploadError, trigger, data, reset } = useCreateSpace(space as string, router.isReady);
  const { data: signer, isError, isLoading } = useSigner()
  const jrpcSigner = signer as JsonRpcSigner;
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // form
  const methods = useForm<CreateFormValues>();
  const { register, handleSubmit, control, formState: { errors } } = methods;
  const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
    const payload = { };
    console.debug("📚 Nance.createSpace.onSubmit ->", { formData, payload })

    setSigning(true);

    signPayload(
      jrpcSigner, space as string,
      "config",
      payload
    ).then((signature) => {

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
    </FormProvider>
  )
}
