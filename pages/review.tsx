import { utils } from "ethers";
import { useState } from "react";
import { Footer, SiteNav } from "@/components/Site";
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from "next-query-params";
import useProjectInfo from "../utils/hooks/juicebox/ProjectInfo";
import { SafetransactionsResponseResult } from "../models/SafeTypes";
import parseSafeJuiceboxTx from "../utils/functions/SafeJuiceboxParser";
import { useReconfigurationOfProject } from "../utils/hooks/juicebox/ReconfigurationOfProject";
import DiffTableWithSection from "../components/form/DiffTableWithSection";
import {
  calcDiffTableData,
  comparePayouts,
  compareReserves,
} from "../utils/functions/juicebox";
import LoadingArrowSpiner from "@/components/common/LoadingArrowSpiner";
import {
  AddressMap,
  SafeTransactionSelector,
  TxOption,
} from "@/components/Transaction/SafeTransactionSelector";
import ProjectSearch from "@/components/ProjectSearch";
import JBProjectInfo from "@/components/JuiceboxCard/JBProjectInfo";
import { toDate } from "date-fns";

const CONTRACT_MAP: AddressMap = {
  "0xFFdD70C318915879d5192e8a0dcbFcB0285b3C98": "JBController_V3",
  "0x4e3ef8AFCC2B52E4e704f4c8d9B7E7948F651351": "JBController_V2",
  "0x7Ae63FBa045Fec7CaE1a75cF7Aa14183483b8397": "JBETHPaymentTerminal_V2",
  "0xd569D3CCE55b71a8a3f3C418c329A66e5f714431": "TerminalV1",
  "0xB9E4B658298C7A36BdF4C2832042A5D6700c3Ab8": "ModStore",
};

export default function ReviewReconfigurationPage() {
  // router
  const [query, setQuery] = useQueryParams({
    project: withDefault(NumberParam, 1),
    safeTxHash: withDefault(StringParam, ""),
  });
  const projectId = query.project;

  // state
  const [selectedSafeTx, setSelectedSafeTx] = useState<TxOption>();

  // hooks
  const { data: projectInfo, loading, error } = useProjectInfo(3, projectId);

  const owner = projectInfo?.owner ? utils.getAddress(projectInfo.owner) : "";
  const txForComponent = selectedSafeTx?.tx;

  function ReviewArea() {
    if (error) {
      return <p className="flex justify-center pb-2 text-red-500">{error}</p>;
    } else if (loading) {
      return (
        <div className="flex justify-center pb-2">
          <LoadingArrowSpiner />
        </div>
      );
    } else if (txForComponent) {
      return <Compare projectId={projectId} tx={txForComponent} />;
    } else {
      return (
        <p className="flex justify-center pb-2 text-green-500">
          Select txn to compare
        </p>
      );
    }
  }

  return (
    <>
      <SiteNav pageTitle="Juicebox Reconfiguration Reviewer" withWallet />
      <div className="bg-white">
        {projectInfo && <JBProjectInfo metadataUri={projectInfo.metadataUri} />}

        <div
          id="project-selector"
          className="mx-6 flex flex-col items-center gap-x-3 pt-2"
        >
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">
              Seach project
            </label>
            <ProjectSearch
              val={projectId}
              setVal={(p) => setQuery({ project: p })}
            />
          </div>
        </div>
        <div id="safetx-loader" className="mx-6 flex justify-center pt-2">
          <div className="w-1/2">
            <SafeTransactionSelector
              val={selectedSafeTx}
              setVal={setSelectedSafeTx}
              safeAddress={owner}
              addressMap={CONTRACT_MAP}
            />
          </div>
        </div>
        <br />

        <ReviewArea />
      </div>
      <Footer />
    </>
  );
}

function Compare({
  projectId,
  tx,
}: {
  projectId: number;
  tx: SafetransactionsResponseResult;
}) {
  const { value: currentConfig, loading: loading } =
    useReconfigurationOfProject(projectId);
  const newConfig = parseSafeJuiceboxTx(
    //tx.data || "",
    // FIXME new Safe endpoint doesn't return data anymore
    //   which makes Review page no longer working
    "",
    toDate(tx.transaction.timestamp).toISOString() || "",
    currentConfig.fundingCycle.fee || BigInt(0),
    currentConfig.fundingCycle.configuration || BigInt(0)
  );

  const payoutsDiff = comparePayouts(
    currentConfig,
    newConfig,
    currentConfig.payoutMods,
    newConfig?.payoutMods || []
  );
  const reservesDiff = compareReserves(
    currentConfig.ticketMods,
    newConfig?.ticketMods || []
  );
  const tableData = calcDiffTableData(
    currentConfig,
    newConfig,
    payoutsDiff,
    reservesDiff
  );

  return (
    <DiffTableWithSection
      space="juicebox"
      tableData={tableData}
      loading={loading}
    />
  );
}
