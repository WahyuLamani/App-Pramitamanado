'use client';

import { useState, useEffect } from 'react';
import FileUploader from '@/components/ui/FileUploader';
import FileList from '@/components/ui/FileList';
import AllPagesView from '@/components/features/AllPagesView';
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

  const handlePagesChange = (updatedPages: PDFPage[]) => {
    setAllPages(updatedPages);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <FileUploader onFilesSelected={handleFilesSelected} />

        {files.length > 0 && (
          <FileList 
            files={files} 
            onRemove={removeFile}
            onPagesExtracted={handlePagesExtracted}
          />
        )}
      </div>

      {allPages.length > 0 && (
        <AllPagesView 
          pages={allPages}
          onPagesChange={handlePagesChange}
        />
      )}
    </div>
  );
}