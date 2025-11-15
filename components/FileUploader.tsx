"use client";
import { useState } from 'react';
import { mergeDocuments, downloadPdf } from '@/lib/pdfMerger';
import { Upload, FileText, Image, X, GripVertical, RotateCw, Monitor, Download } from 'lucide-react';

// show or hide oriented toggle
const SHOW_ORIENTATION_TOGGLE = false;
// Types untuk file yang diupload (Updated Step 3)
type UploadedFile = {
  id: string;
  file: File;
  type: 'pdf' | 'image';
  preview?: string;
  name: string;
  size: number;
  rotation: 0 | 90 | 180 | 270;  // Step 3: Rotation
  orientation: 'portrait' | 'landscape'; // Step 3: Orientation
};

// Client Component: FileUploader
function FileUploader({ onFilesChange }: { onFilesChange: (files: UploadedFile[]) => void }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isMerging, setIsMerging] = useState(false)

  // Handle file selection
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) {
        alert(`File ${file.name} bukan PDF atau gambar`);
        continue;
      }

      let preview: string | undefined;
      if (isImage) {
        preview = await createImagePreview(file);
      }

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        type: isPdf ? 'pdf' : 'image',
        preview,
        name: file.name,
        size: file.size,
        rotation: 0,  // Default rotation
        orientation: 'portrait' // Default orientation
      });
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Drag & Drop Reorder
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newFiles = [...files];
      const draggedItem = newFiles[draggedIndex];
      newFiles.splice(draggedIndex, 1);
      newFiles.splice(dragOverIndex, 0, draggedItem);
      setFiles(newFiles);
      onFilesChange(newFiles);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // === STEP 3: ROTATION & ORIENTATION FUNCTIONS ===
  
  // 1. Rotate file (tambah 90° setiap kali)
  const rotateFile = (id: string) => {
    const updatedFiles = files.map(file => {
      if (file.id === id) {
        // Rotate 90° clockwise: 0 → 90 → 180 → 270 → 0
        const newRotation = ((file.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...file, rotation: newRotation };
      }
      return file;
    });
    
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  // 2. Toggle orientation
  const toggleOrientation = (id: string) => {
    const updatedFiles = files.map(file => {
      if (file.id === id) {
        // const newOrientation = file.orientation === 'portrait' ? 'landscape' : 'portrait';
        const newOrientation: 'portrait' | 'landscape' = file.orientation === 'portrait' ? 'landscape' : 'portrait';
        return { ...file, orientation: newOrientation };
      }
      return file;
    });
    
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  // 3. Merge and download
  const handleMerge = async () => {
    if (files.length === 0) {
      alert('Please upload at least one file');
      return;
    }
    
    setIsMerging(true);
    
    try {
      const filesToMerge = files.map(f => ({
        file: f.file,
        type: f.type,
        rotation: f.rotation,
        orientation: f.orientation
      }));
      
      const mergedPdf = await mergeDocuments(filesToMerge);
      downloadPdf(mergedPdf, 'merged-document.pdf');
      
      alert('✓ Documents merged successfully!');
    } catch (error) {
      console.error('Merge error:', error);
      alert('Failed to merge documents. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">
          Drop your files here
        </h3>
        <p className="text-gray-600 mb-4">
          or click to browse (PDF & Images supported)
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Select Files
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">
            Uploaded Files ({files.length})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            💡 Drag to reorder • Click rotate to change orientation
          </p>
          
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={file.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-4 p-4 border rounded-lg bg-white transition-all cursor-move
                  ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                  ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-500 border-2' : ''}
                  hover:shadow-md
                `}
              >
                {/* Drag Handle */}
                <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Preview dengan Rotation Applied */}
                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  {file.type === 'image' && file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-300"
                      style={{ transform: `rotate(${file.rotation}deg)` }}
                    />
                  ) : (
                    <div 
                      className="transition-transform duration-300"
                      style={{ transform: `rotate(${file.rotation}deg)` }}
                    >
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      {file.type === 'pdf' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <Image className="w-4 h-4" />
                      )}
                      {file.type.toUpperCase()}
                    </span>
                    <span>{formatFileSize(file.size)}</span>
                    <span className="text-blue-600">#{index + 1}</span>
                    {file.rotation !== 0 && (
                      <span className="text-purple-600 text-xs">↻{file.rotation}°</span>
                    )}
                  </div>
                </div>

                {/* Controls: Rotation & Orientation */}
                <div className="flex items-center gap-2">
                  {/* Rotate Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rotateFile(file.id);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  {SHOW_ORIENTATION_TOGGLE && (
                      <>
                        {/* Orientation Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrientation(file.id);
                          }}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            file.orientation === 'portrait'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                          title="Toggle orientation"
                        >
                          <span className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            {file.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                          </span>
                        </button>
                      </>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merge Button */}
      <div className="mt-6">
        <button
          onClick={handleMerge}
          disabled={isMerging}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isMerging ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Merging documents...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Merge & Download PDF
            </>
          )}
        </button>
        
        {!isMerging && (
          <p className="text-center text-sm text-gray-600 mt-3">
            All {files.length} file(s) will be merged into one PDF
          </p>
        )}
      </div>
    </div>
  );
}

// Main App Component
export default function MergeAsPDF() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Merge Documents</h1>
        <p className="text-gray-600">
          Drag and Drop your Document below ! 
        </p>
      </div>

      <FileUploader onFilesChange={setUploadedFiles} />

      {/* Debug Info */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8 max-w-4xl mx-auto p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">Debug - File Settings:</p>
          <div className="text-xs text-gray-600 space-y-1">
            {uploadedFiles.map((file, i) => (
              <div key={file.id} className="flex gap-2">
                <span className="font-medium">#{i + 1}</span>
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-purple-600">{file.rotation}°</span>
                {/* <span className="text-blue-600">{file.orientation}</span> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}