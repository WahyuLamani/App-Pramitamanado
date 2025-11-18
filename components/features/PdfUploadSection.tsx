'use client';

import { useState } from 'react';
import FileUploader from '@/components/ui/FileUploader';
import FileList from '@/components/ui/FileList';
import type { UploadedFile, PDFPage } from '@/types/pdforg';

export default function PDFUploadSection() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [allPages, setAllPages] = useState<PDFPage[]>([]);

  const handleFilesSelected = (selectedFiles: UploadedFile[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setAllPages(prev => prev.filter(p => p.fileId !== id));
  };

  const handlePagesExtracted = (fileId: string, pages: PDFPage[]) => {
    setAllPages(prev => {
      // Remove old pages dari file ini
      const filtered = prev.filter(p => p.fileId !== fileId);
      // Add pages baru
      return [...filtered, ...pages];
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <FileUploader onFilesSelected={handleFilesSelected} />

      {files.length > 0 && (
        <FileList 
          files={files} 
          onRemove={removeFile}
          onPagesExtracted={handlePagesExtracted}
        />
      )}

      {allPages.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Total {allPages.length} halaman siap untuk diproses
          </p>
        </div>
      )}
    </div>
  );
}