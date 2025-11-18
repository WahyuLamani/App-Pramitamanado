'use client';

import { useState, useRef, useEffect } from 'react';
import FileUploader from '@/components/ui/FileUploader';
import FileList from '@/components/ui/FileList';
import AllPagesView from './AllPagesView';
import type { UploadedFile, PDFPage } from '@/types/pdforg';

export default function PDFUploadSection() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [allPages, setAllPages] = useState<PDFPage[]>([]);
  const allPagesRef = useRef<HTMLDivElement>(null);

  // ✅ Auto scroll ke "Semua Halaman" saat ada pages baru
  useEffect(() => {
    if (allPages.length > 0 && allPagesRef.current) {
      setTimeout(() => {
        allPagesRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [allPages.length]);

  const handleFilesSelected = (selectedFiles: UploadedFile[], pages: PDFPage[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
    setAllPages(prev => [...prev, ...pages]); // ✅ Langsung tambahkan pages
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setAllPages(prev => prev.filter(p => p.fileId !== id));
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
          />
        )}
      </div>

      {/* ✅ Tambahkan ref untuk auto scroll */}
      <div ref={allPagesRef}>
        {allPages.length > 0 && (
          <AllPagesView 
            pages={allPages}
            onPagesChange={handlePagesChange}
          />
        )}
      </div>
    </div>
  );
}