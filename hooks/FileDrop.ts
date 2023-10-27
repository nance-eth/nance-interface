import { Editor } from "@toast-ui/react-editor";

export const fileDrop = (editor: Editor) => {
  editor.getInstance().on('drop', async function(e) {
    e.preventDefault(); // prevent default drop behavior
    const file = e.dataTransfer?.items[0].getAsFile();
    if (file?.name.endsWith('.md')) {
      const md = await file.text();
      editor.getInstance().setMarkdown(md + '\n\n' + editor.getInstance().getMarkdown());
    }
  });
};
