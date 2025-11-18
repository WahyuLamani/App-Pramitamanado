export interface UploadedFile {
    id: string;
    file: File;
    name: string;
    size: number;
    type: 'pdf' | 'image';
    thumbnail?: string;
    pageCount?: number;
  }

  // Type baru untuk halaman individual
export interface PDFPage {
  id: string;
  fileId: string; // Reference ke file asli
  file: File; // untuk reference ke file asli
  fileName: string;
  pageNumber: number; // Halaman ke berapa (1-based)
  thumbnail: string;
  rotation: 0 | 90 | 180 | 270;
}