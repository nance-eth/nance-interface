import { useContext } from "react";
import MarkdownViewer from "@/components/Markdown/MarkdownViewer";
import { ProposalContext } from "./context/ProposalContext";
import { classNames } from "@/utils/functions/tailwind";

export default function ProposalContent() {
  const { commonProps, isLoading } = useContext(ProposalContext);
  //const sourceSnapshot = commonProps.uuid === "snapshot"; // hack
  const { body } = commonProps;

  return (
    <div className={classNames(isLoading && "skeleton w-full h-[70vh]")}>
      <MarkdownViewer body={body} />
    </div>
  );
}
