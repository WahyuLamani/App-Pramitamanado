'use client';

import { useState } from 'react';
import type { UploadedFile, PDFPage } from '@/types/pdforg';
import { extractPDFPages } from '@/lib/pdf-organize/pages';

interface FileCardProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
  onPagesExtracted?: (fileId: string, pages: PDFPage[]) => void;
}

export default function FileCard({ file, onRemove, onPagesExtracted }: FileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleExpand = async () => {
    if (file.type !== 'pdf') return;
    
    if (!isExpanded && pages.length === 0) {
      setIsLoading(true);
      setLoadingProgress({ current: 0, total: file.pageCount || 0 });
      
      try {
        const extractedPages = await extractPDFPages(
          file.file,
          // Callback untuk update progress
          (current, total) => {
            setLoadingProgress({ current, total });
          }
        );
        
        const pdfPages: PDFPage[] = extractedPages.map((p) => ({
          id: `${file.id}-page-${p.pageNumber}`,
          fileId: file.id,
          file: file.file, // ✅ Tambahkan reference ke file asli
          fileName: file.name,
          pageNumber: p.pageNumber,
          thumbnail: p.thumbnail,
          rotation: 0,
        }));

        setPages(pdfPages);
        if (onPagesExtracted) {
          onPagesExtracted(file.id, pdfPages);
        }
      } catch (error) {
        console.error('Error expanding pages:', error);
        alert('Gagal memuat halaman PDF. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
        setLoadingProgress({ current: 0, total: 0 });
      }
    }
    
    setIsExpanded(!isExpanded);
  };

  const rotatePage = (pageId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id === pageId) {
        const newRotation = ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...p, rotation: newRotation };
      }
      return p;
    }));
  };

  const deletePage = (pageId: string) => {
    setPages(prev => prev.filter(p => p.id !== pageId));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* File Header */}
      <div className="relative group">
        {/* Thumbnail Preview */}
        <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
          {file.thumbnail ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* File Info */}
        <div className="p-3">
          <p className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              {file.type === 'pdf' ? (
                <>
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  {file.pageCount && `${file.pageCount} hal`}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Gambar
                </>
              )}
            </span>
            <span>{formatFileSize(file.size)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          {/* ✅ FIX: Hapus kondisi pageCount > 1, semua PDF bisa di-expand */}
          {file.type === 'pdf' && file.pageCount && (
            <button
              onClick={handleExpand}
              disabled={isLoading}
              className="p-1.5 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isExpanded ? "Tutup halaman" : "Lihat semua halaman"}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isExpanded ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={() => onRemove(file.id)}
            disabled={isLoading}
            className="p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
            aria-label="Hapus file"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Pages View */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {isLoading ? (
            <div className="space-y-4">
              {/* Loading Header */}
              <div className="flex items-center justify-center py-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="ml-3">
                  <p className="text-gray-700 font-medium">Memuat halaman...</p>
                  <p className="text-sm text-gray-500">
                    {loadingProgress.current} / {loadingProgress.total} halaman
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${loadingProgress.total > 0 
                      ? (loadingProgress.current / loadingProgress.total) * 100 
                      : 0}%`
                  }}
                />
              </div>

              {/* Skeleton Loader */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: Math.min(8, file.pageCount || 4) }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded mt-2 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">
                Semua Halaman ({pages.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pages.map((page) => (
                  <div key={page.id} className="relative group">
                    <div className="aspect-[3/4] bg-white border rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={page.thumbnail}
                        alt={`Halaman ${page.pageNumber}`}
                        className="w-full h-full object-contain transition-transform duration-200"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                      />
                    </div>
                    
                    {/* Action Buttons Overlay */}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => rotatePage(page.id)}
                        className="p-1 bg-white rounded shadow-md hover:bg-blue-50 border border-gray-200"
                        title="Rotate 90°"
                      >
                        <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deletePage(page.id)}
                        className="p-1 bg-white rounded shadow-md hover:bg-red-50 border border-gray-200"
                        title="Hapus halaman"
                      >
                        <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Page Number */}
                    <p className="text-xs text-center mt-1 text-gray-600 font-medium">
                      Hal. {page.pageNumber}
                    </p>
                    
                    {/* Rotation Indicator */}
                    {page.rotation !== 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                        ↻{page.rotation}°
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}