import { useRef, useEffect } from 'react';
import { Editor } from '@toast-ui/react-editor';
import { imageUpload } from '../../../../hooks/ImageUpload';
import { handleDrop } from '../../../../hooks/FileDrop';
import '@nance/nance-editor/lib/editor.css';

function TextEditor({
  onChange,
  initialValue,
}: {
  onChange: (value: string) => void,
  initialValue?: string,
}) {
  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    const editor = editorRef.current?.getInstance();
    const initDropHandler = async () => {
      const md = await handleDrop();
      if (editor && md) editor.setMarkdown(md);
    };
    initDropHandler();

  }, []);

  return (
    <Editor
      ref={editorRef}
      initialValue={initialValue}
      previewStyle="tab"
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
