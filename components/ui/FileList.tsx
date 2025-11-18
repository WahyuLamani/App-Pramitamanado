'use client';

import type { UploadedFile } from '@/types/pdforg';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}

export default function FileList({ files, onRemove }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">
        File yang diupload ({files.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            {/* Thumbnail Preview */}
            <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
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

            {/* Remove Button */}
            <button
              onClick={() => onRemove(file.id)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              aria-label="Hapus file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}