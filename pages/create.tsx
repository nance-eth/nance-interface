/* eslint-disable react/jsx-no-undef */
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";
import SiteNav from "../components/SiteNav";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import Notification from "../components/Notification";
import { CreateFormValues, CreateFormKeys } from "../models/NanceTypes";
import { useCreateSpace } from "../hooks/NanceHooks";
import { discordAuthUrl, avatarBaseUrl } from "../libs/discordURL";
import { useFetchDiscordUser, useLogoutDiscordUser } from "../hooks/discordHooks";
import DiscordSelector from "../components/DiscordSelector";
import SnapshotSearch from "../components/SnapshotSearch";
import { Session } from "next-auth";
import { useState } from "react";

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
  const router = useRouter();
  // hooks
  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();
  const { data: discordUser, isLoading: discordLoading } = useFetchDiscordUser({address: session?.user?.name || ''}, router.isReady);
  const { trigger: discordLogoutTrigger  } = useLogoutDiscordUser({address: session?.user?.name || ''}, router.isReady);

  return (
    <>
      <SiteNav pageTitle='nance control panel' withWallet/>

      <div className="flex justify-center">
        <div className="w-100">
          <h1 className="text-lg text-center font-bold text-gray-900 mt-8 mb-5">Create New Nance Instance</h1>
          {status === "unauthenticated" && (
            <button type="button" onClick={() => openConnectModal?.()}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium
            text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              Connect Wallet
            </button>
          )}

          {status === "authenticated" && (
            <>
              { !discordUser && !discordLoading && (
                <div className="flex justify-center">
                  <button
                    className="w-fit inline-flex items-center justify-center rounded-xl border border-transparent bg-purple-800 px-3 py-2 text-md font-bold disabled:text-black text-white shadow-sm hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                    onClick={() => router.push(discordAuthUrl('create'))}
                  >
                    Connect Discord
                  </button>
                </div>
              )}
              <div className="flex justify-center">
                { discordLoading && <FaSpinner className="animate-spin" /> }
              </div>
              { !discordLoading && discordUser && (
                <>
                  <div className="flex justify-center">
                    <div className="block text-center">
                      <p className="">{`${discordUser?.username}`}</p>
                      <a className="text-xs underline hover:cursor-pointer" onClick={ () => {
                        discordLogoutTrigger()
                        window.location.reload()
                      }
                      }>disconnect</a>
                    </div>
                    <Image className="rounded-full overflow-hidden ml-4" src={`${avatarBaseUrl}/${discordUser?.id}/${discordUser?.avatar}.png`} alt={discordUser?.username || ''} width={50} height={50} />
                  </div>
                </>
              )}
              { discordUser && (
                <Form session={session} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Form({ session }: { session: Session }) {
  // query and context
  const router = useRouter();

  // hooks
  const { isMutating, error: uploadError, trigger, data, reset } = useCreateSpace(router.isReady);
  // state
  const [discordComplete, setDiscordComplete] = useState(false);
  // form
  const methods = useForm<CreateFormValues>({ mode: 'onChange' });
  const { register, handleSubmit, control, formState: { errors, isValid } } = methods;
  const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
    console.log(formData);
    const payload = { ...formData };
    console.debug("📚 Nance.createSpace.onSubmit ->", { formData, payload })
      const req = {
          config: formData
      }
      console.debug("📗 Nance.createSpace.submit ->", req);
      return trigger(req);
  }

  return (
      <FormProvider {...methods} >
        <Notification title="Success" description="Created" show={data !== undefined} close={() => {}} checked={true} />
        {( uploadError) &&
          <Notification title="Error" description={'error'} show={true} close={() => {}} checked={false} />
        }
        <form className="lg:m-6 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
          <FormInput label="Nance space name" name="name" register={register} />
          <DiscordSelector session={session} setComplete={setDiscordComplete}/>
          <SnapshotSearch session={session} />
          {(
            <button
              type="submit"
              disabled={ !isValid || isMutating }
              className="mt-5 ml-300 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 w-20"
            >
              Submit
            </button>
          )}
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
