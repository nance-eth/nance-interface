import { useRef } from 'react';
import { Editor } from '@toast-ui/react-editor';
import { imageUpload } from '../../../../hooks/ImageUpload';
import '@nance/nance-editor/lib/editor.css';

function TextEditor({
  onChange,
  initialValue,
}: {
  onChange: (value: string) => void,
  initialValue?: string,
}) {
  const editorRef = useRef<Editor>(null);
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
