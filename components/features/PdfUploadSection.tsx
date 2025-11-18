'use client';

import { useState } from 'react';
import FileUploader from '@/components/ui/FileUploader';
import FileList from '@/components/ui/FileList';
import type { UploadedFile } from '@/types/pdforg';

export default function PDFUploadSection() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFilesSelected = (selectedFiles: UploadedFile[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <FileUploader onFilesSelected={handleFilesSelected} />

      {files.length > 0 && (
        <FileList files={files} onRemove={removeFile} />
      )}
    </div>
  );
}