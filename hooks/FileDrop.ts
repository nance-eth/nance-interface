export const handleDrop = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const handleFileDrop = async (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (file && file.name.endsWith('.md')) {
        try {
          const md = await file.text();
          window.removeEventListener('drop', handleFileDrop);
          resolve(md);
        } catch (error) {
          window.removeEventListener('drop', handleFileDrop);
          resolve(null);
        }
      }
    };

    window.addEventListener('drop', handleFileDrop);
  });
};
