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

    const arrayBuffer = await file.arrayBuffer();

    // Handle PDF files
    if (file.type === 'application/pdf') {
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [pageNumber - 1]);

      // Apply rotation
      if (rotation !== 0) {
        copiedPage.setRotation(degrees(rotation));
      }

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
    // ✅ Handle Image files - SIMPLIFIED
    else if (file.type.startsWith('image/')) {
      let image;

      try {
        // Embed image based on type
        if (file.type === 'image/png') {
          image = await mergedPdf.embedPng(arrayBuffer);
        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await mergedPdf.embedJpg(arrayBuffer);
        } else {
          // For unsupported formats, try to convert
          const converted = await convertImageToPng(file);
          image = await mergedPdf.embedPng(converted);
        }

        // Create page with image dimensions (or standard A4)
        const imgWidth = image.width;
        const imgHeight = image.height;
        
        // Use image aspect ratio for page size
        const maxWidth = 595; // A4 width in points
        const maxHeight = 842; // A4 height in points
        
        let pageWidth, pageHeight;
        
        if (imgWidth / imgHeight > maxWidth / maxHeight) {
          // Image is wider, fit to width
          pageWidth = maxWidth;
          pageHeight = (maxWidth * imgHeight) / imgWidth;
        } else {
          // Image is taller, fit to height
          pageHeight = maxHeight;
          pageWidth = (maxHeight * imgWidth) / imgHeight;
        }

        const page = mergedPdf.addPage([pageWidth, pageHeight]);

        // Draw image to fill the page (no rotation here)
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });

        // ✅ Apply rotation to the PAGE itself (bukan image)
        if (rotation !== 0) {
          page.setRotation(degrees(rotation));
        }

        // Optional: Add page numbers
        if (addPageNumbers) {
          page.drawText(`${i + 1}`, {
            x: pageWidth / 2 - 10,
            y: 20,
            size: 12,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      } catch (error) {
        console.error(`Error embedding image ${file.name}:`, error);
      }
    }
  }

  return await mergedPdf.save();
}

// Helper function to convert unsupported images to PNG
async function convertImageToPng(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert image'));
          return;
        }

        const arrayBuffer = await blob.arrayBuffer();
        resolve(arrayBuffer);
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.readAsDataURL(file);
  });
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
      let image;

      try {
        if (file.type === 'image/png') {
          image = await mergedPdf.embedPng(arrayBuffer);
        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await mergedPdf.embedJpg(arrayBuffer);
        } else {
          const converted = await convertImageToPng(file);
          image = await mergedPdf.embedPng(converted);
        }

        const imgWidth = image.width;
        const imgHeight = image.height;
        
        const maxWidth = 595;
        const maxHeight = 842;
        
        let pageWidth, pageHeight;
        
        if (imgWidth / imgHeight > maxWidth / maxHeight) {
          pageWidth = maxWidth;
          pageHeight = (maxWidth * imgHeight) / imgWidth;
        } else {
          pageHeight = maxHeight;
          pageWidth = (maxHeight * imgWidth) / imgHeight;
        }

        const page = mergedPdf.addPage([pageWidth, pageHeight]);

        page.drawImage(image, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });

        // ✅ Rotate page, not image
        if (rotation !== 0) {
          page.setRotation(degrees(rotation));
        }
      } catch (error) {
        console.error(`Error processing image ${file.name}:`, error);
      }
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