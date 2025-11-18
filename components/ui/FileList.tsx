'use client';

import type { UploadedFile } from '@/types/pdforg';
import FileCard from './FileCard';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}

export default function FileList({ files, onRemove }: FileListProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">
        File yang diupload ({files.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}