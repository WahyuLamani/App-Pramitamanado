'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { UploadedFile, PDFPage } from '@/types/pdforg';
import { generatePDFThumbnail, getPDFPageCount } from '@/lib/pdf-organize/thumbnail';
import { extractPDFPages } from '@/lib/pdf-organize/pages';

interface FileUploaderProps {
  onFilesSelected: (files: UploadedFile[], pages: PDFPage[]) => void; // ✅ Tambah pages
  accept?: string;
  maxFiles?: number;
}

export default function FileUploader({ 
  onFilesSelected, 
  accept = 'application/pdf,image/*',
  maxFiles = 10 
}: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const processFiles = async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    const processedFiles: UploadedFile[] = [];
    const allPages: PDFPage[] = [];

    for (let fileIndex = 0; fileIndex < acceptedFiles.length; fileIndex++) {
      const file = acceptedFiles[fileIndex];
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');

      setProcessingStatus(`Memproses file ${fileIndex + 1}/${acceptedFiles.length}: ${file.name}`);

      let thumbnail = '';
      let pageCount = undefined;

      if (isPdf) {
        // Generate thumbnail untuk file card
        thumbnail = await generatePDFThumbnail(file);
        pageCount = await getPDFPageCount(file);

        // ✅ Auto extract semua halaman
        const extractedPages = await extractPDFPages(file);
        
        const fileId = `${Date.now()}-${Math.random()}`;
        
        // Convert ke PDFPage format
        const pdfPages: PDFPage[] = extractedPages.map((p) => ({
          id: `${fileId}-page-${p.pageNumber}`,
          fileId: fileId,
          file: file,
          fileName: file.name,
          pageNumber: p.pageNumber,
          thumbnail: p.thumbnail,
          rotation: 0,
        }));

        allPages.push(...pdfPages);

        processedFiles.push({
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          type: 'pdf',
          thumbnail,
          pageCount,
        });

      } else if (isImage) {
        thumbnail = await createImagePreview(file);
        
        const fileId = `${Date.now()}-${Math.random()}`;

        // ✅ Tambahkan gambar sebagai "page"
        allPages.push({
          id: `${fileId}-page-1`,
          fileId: fileId,
          file: file,
          fileName: file.name,
          pageNumber: 1,
          thumbnail: thumbnail,
          rotation: 0,
        });

        processedFiles.push({
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          type: 'image',
          thumbnail,
          pageCount: 1,
        });
      }
    }

    setProcessingStatus('');
    onFilesSelected(processedFiles, allPages);
    setIsProcessing(false);
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles,
    disabled: isProcessing,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        {isProcessing ? (
          <>
            <div className="mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Memproses file...
              </p>
              {processingStatus && (
                <p className="text-sm text-gray-500 mt-2">
                  {processingStatus}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop file di sini' : 'Drag & drop file PDF atau gambar'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                atau klik untuk memilih file (max {maxFiles} files)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Support: PDF, PNG, JPG, JPEG, GIF, WEBP
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}