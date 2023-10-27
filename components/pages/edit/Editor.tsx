import { useRef } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { fileDrop } from "../../../hooks/FileDrop";
import { imageUpload } from "../../../hooks/ImageUpload";

function TextEditor({ onChange, initialValue }: { onChange: (value: string) => void, initialValue?: string }) {
  const editorRef = useRef<Editor>(null);

  return (
    <Editor
      ref={editorRef}
      initialValue={initialValue}
      previewStyle="vertical"
      height="600px"
      initialEditType="wysiwyg"
      useCommandShortcut={true}
      onChange={() => {
        if (editorRef.current) onChange(editorRef.current.getInstance().getMarkdown());
      }}
      hooks={{
        addImageBlobHook(blob, cb) {
          imageUpload(blob).then((url) => cb(url));
        },
      }}
    />
  );
}

export default TextEditor;
