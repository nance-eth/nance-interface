import { useRef, useEffect, useState } from 'react';
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

  const [imageUploading, setImageUploading] = useState(0);

  const simulateLoading = (setLoading: (progress: number) => void, fileSize: number) => {
    const time = Math.round(fileSize / (10 * 1000)) * 10;
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress > 100) {
        clearInterval(interval);
      } else {
        setLoading(progress);
      }
    }, time);
    return interval;
  };

  useEffect(() => {
    const editor = editorRef.current?.getInstance();
    const initDropHandler = async () => {
      const md = await handleDrop();
      if (editor && md) editor.setMarkdown(md);
    };
    initDropHandler();

  }, []);

  return (
    <>
      <LoadingBar progress={imageUploading} />
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
            const loading = simulateLoading(setImageUploading, blob.size);
            imageUpload(blob).then((url) => {
              cb(url);
              clearInterval(loading);
              setImageUploading(0);
            });
          },
        }}
      />
    </>
  );
}


const LoadingBar = ({ progress }: { progress: number }) => {
  return (
    <div>
      <div aria-hidden="true">
        <div className="overflow-hidden rounded-full bg-white">
          <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
