'use client';

import { useState, useRef, useEffect } from 'react';
import FileUploader from '@/components/ui/FileUploader';
import FileList from '@/components/ui/FileList';
import AllPagesView from './AllPagesView';
import type { UploadedFile, PDFPage } from '@/types/pdforg';

export default function PDFUploadSection() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [allPages, setAllPages] = useState<PDFPage[]>([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const allPagesRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke "Semua Halaman" saat ada pages baru
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
    setAllPages(prev => [...prev, ...pages]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setAllPages(prev => prev.filter(p => p.fileId !== id));
  };

  const handlePagesChange = (updatedPages: PDFPage[]) => {
    setAllPages(updatedPages);
  };

  // ✅ Reset/Reload function
  const handleReset = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = () => {
    setFiles([]);
    setAllPages([]);
    setShowConfirmReset(false);
  };

  const cancelReset = () => {
    setShowConfirmReset(false);
  };

  return (
    <div className="space-y-8">
      {/* Header dengan tombol Reset */}
      {(files.length > 0 || allPages.length > 0) && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              {files.length} file diupload • {allPages.length} halaman
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Organize dokumen Anda
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Semua
          </button>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <FileUploader onFilesSelected={handleFilesSelected} />

        {files.length > 0 && (
          <FileList 
            files={files} 
            onRemove={removeFile}
          />
        )}
      </div>

      {/* All Pages View */}
      <div ref={allPagesRef}>
        {allPages.length > 0 && (
          <AllPagesView 
            pages={allPages}
            onPagesChange={handlePagesChange}
          />
        )}
      </div>

      {/* ✅ Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Icon */}
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Reset Semua File?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Semua file yang sudah diupload dan halaman yang sudah diatur akan dihapus. 
              Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Info */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-red-800">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Yang akan dihapus:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• {files.length} file yang diupload</li>
                    <li>• {allPages.length} halaman yang sudah diatur</li>
                    <li>• Semua rotasi dan urutan halaman</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelReset}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}