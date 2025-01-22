import { SiteNav } from "@/components/Site";
import { useCreateSpace } from "@/utils/hooks/NanceHooks";
import { CreateFormValues } from "@nance/nance-sdk";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function CreatePage() {
  const [spaceName, setSpaceName] = useState("");
  const [proposalIdPrefix, setProposalIdPrefix] = useState("");
  const { trigger, isMutating } = useCreateSpace(true);

  const handleCreateSpace = async () => {
    if (spaceName.trim() === "") {
      toast.error("Please enter a name for your space.");
      return;
    }
    if (proposalIdPrefix.trim() === "") {
      toast.error("Please enter a prefix for your proposals.");
      return;
    }
    if (!/^[A-Z]{3,4}$/.test(proposalIdPrefix)) {
      toast.error("Proposal prefix should be 3-4 letters and all capital.");
      return;
    }
    const payload = { config: { name: spaceName, proposalIdPrefix } };
    const toastId = toast.loading("Creating space...");
    try {
      const response = await trigger(payload as unknown as CreateFormValues);
      if (!response || response.error) {
        throw new Error(response?.error || 'Failed to create space');
      }
      toast.dismiss(toastId);
      toast.success("Space created successfully!");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error instanceof Error ? error.message : "Failed to create space.");
    }
  };

  return (
    <>
      <SiteNav
        pageTitle="nance control panel"
        withProposalButton={false}
        withWallet
      />
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 pt-14">
        <h1 className="text-2xl font-bold mb-4">What do you want to call your space?</h1>
        <input
          type="text"
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
          className="p-3 text-xl text-center border border-gray-300 rounded-md shadow-sm w-1/2 max-w-sm mb-4 focus:ring-0"
        />
        <h1 className="text-2xl font-bold mb-2 mt-4">What do you want to prefix your proposals with?</h1>
        <p className="text-sm text-gray-500 mb-1">3-4 letters. Example: {'"'}EIP-{'"'}</p>
        <div className="mt-1 text-xl flex">
          <input
            type="text"
            value={proposalIdPrefix}
            onChange={(e) => setProposalIdPrefix(e.target.value)}
            maxLength={4}
            className="p-3 text-xl text-center border border-gray-300 rounded-l-md shadow-sm focus:ring-0 w-20"
          />
          <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
            -
          </span>
        </div>
        <button
          onClick={handleCreateSpace}
          disabled={isMutating}
          className="p-3 mt-4 text-xl font-semibold bg-blue-500 text-white rounded-md shadow-sm w-1/2 max-w-sm"
        >
          {isMutating ? "Creating..." : "Create!"}
        </button>
      </div>
    </>
  );
}


{/* <div className="mt-1 text-xl flex rounded-md shadow-sm">
<input
  type="text"
  value={proposalPrefix}
  onChange={(e) => setProposalPrefix(e.target.value)}
  maxLength={4}
  className="block h-10 w-20 flex-1 border-gray-300 rounded-none rounded-l-md focus:outline-none"
/>
<span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
  -
</span>
</div> */}
