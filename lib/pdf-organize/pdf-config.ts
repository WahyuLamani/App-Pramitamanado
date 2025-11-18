import * as pdfjsLib from 'pdfjs-dist';

// Konfigurasi worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export { pdfjsLib };