import { useContext } from "react";
import MarkdownViewer from "@/components/Markdown/MarkdownViewer";
import { ProposalContext } from "./context/ProposalContext";
import ProposalNavigator from "./sub/ProposalNavigator";

export default function ProposalContent() {
  const { commonProps } = useContext(ProposalContext);
  const sourceSnapshot = commonProps.uuid === "snapshot"; // hack
  const { body } = commonProps;

  return (
    <div className="">
      <MarkdownViewer body={body} />

      {!sourceSnapshot && <ProposalNavigator />}
    </div>
  );
}
