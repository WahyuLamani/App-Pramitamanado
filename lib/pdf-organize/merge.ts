import { PDFDocument, degrees, rgb } from 'pdf-lib';
import type { PDFPage } from '@/types/pdforg';

export interface MergeOptions {
  addPageNumbers?: boolean;
  fileName?: string;
}

export async function mergePDFPages(
  pages: PDFPage[],
  options: MergeOptions = {}
): Promise<Uint8Array> {
  const { addPageNumbers = false } = options;
  
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < pages.length; i++) {
    const pageData = pages[i];
    const { file, pageNumber, rotation } = pageData;

    // Load original PDF
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);

    // Get specific page
    const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [pageNumber - 1]);

    // Apply rotation
    if (rotation !== 0) {
      copiedPage.setRotation(degrees(rotation));
    }

    // Add page to merged document
    mergedPdf.addPage(copiedPage);

    // Optional: Add page numbers
    if (addPageNumbers) {
      const { width, height } = copiedPage.getSize();
      copiedPage.drawText(`${i + 1}`, {
        x: width / 2 - 10,
        y: 20,
        size: 12,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  return await mergedPdf.save();
}

export async function mergeMultipleFiles(
  files: Array<{ file: File; rotation?: number }>,
  options: MergeOptions = {}
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const fileData of files) {
    const { file, rotation = 0 } = fileData;
    const arrayBuffer = await file.arrayBuffer();

    // Handle PDF files
    if (file.type === 'application/pdf') {
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());

      for (const page of pages) {
        if (rotation !== 0) {
          page.setRotation(degrees(rotation));
        }
        mergedPdf.addPage(page);
      }
    }
    // Handle image files
    else if (file.type.startsWith('image/')) {
      const page = mergedPdf.addPage();
      let image;

      if (file.type === 'image/png') {
        image = await mergedPdf.embedPng(arrayBuffer);
      } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await mergedPdf.embedJpg(arrayBuffer);
      } else {
        continue; // Skip unsupported image types
      }

      const { width, height } = page.getSize();
      const imgDims = image.scale(
        Math.min(width / image.width, height / image.height) * 0.9
      );

      page.drawImage(image, {
        x: (width - imgDims.width) / 2,
        y: (height - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height,
        rotate: degrees(rotation),
      });
    }
  }

  return await mergedPdf.save();
}

export function downloadPDF(pdfBytes: Uint8Array, fileName: string = 'merged.pdf') {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}