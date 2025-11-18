import { PDFDocument, degrees, rgb } from 'pdf-lib';
import type { PDFPage } from '@/types/pdforg';
import { convertImageToPngOrJpeg } from '@/lib/pdf-organize/imageConverter';

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

    // ✅ Handle PDF files
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
    // ✅ Handle Image files
    else if (file.type.startsWith('image/')) {
      const page = mergedPdf.addPage();
      let image;
    
      try {
        let imageData = arrayBuffer;
        let imageType = file.type;
    
        // ✅ Convert unsupported formats (GIF, WEBP, etc) to PNG
        if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
          console.log(`Converting ${file.type} to PNG...`);
          const converted = await convertImageToPngOrJpeg(file);
          imageData = converted.data;
          imageType = `image/${converted.type}`;
        }
    
        // Embed image
        if (imageType === 'image/png') {
          image = await mergedPdf.embedPng(imageData);
        } else if (imageType === 'image/jpeg' || imageType === 'image/jpg') {
          image = await mergedPdf.embedJpg(imageData);
        } else {
          throw new Error(`Unsupported image type: ${imageType}`);
        }
    
        const { width, height } = page.getSize();
        
        // Scale image to fit page
        const scale = Math.min(
          (width * 0.9) / image.width,
          (height * 0.9) / image.height
        );
    
        const imgWidth = image.width * scale;
        const imgHeight = image.height * scale;
    
        // Center and draw
        const x = (width - imgWidth) / 2;
        const y = (height - imgHeight) / 2;
    
        page.drawImage(image, {
          x: x,
          y: y,
          width: imgWidth,
          height: imgHeight,
          rotate: degrees(rotation),
        });
    
        // Optional: Add page numbers
        if (addPageNumbers) {
          page.drawText(`${i + 1}`, {
            x: width / 2 - 10,
            y: 20,
            size: 12,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      } catch (error) {
        console.error(`Error embedding image ${file.name}:`, error);
        mergedPdf.removePage(mergedPdf.getPageCount() - 1);
        alert(`Gagal memproses gambar: ${file.name}. File akan dilewati.`);
      }
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

      try {
        if (file.type === 'image/png') {
          image = await mergedPdf.embedPng(arrayBuffer);
        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await mergedPdf.embedJpg(arrayBuffer);
        } else {
          console.warn(`Unsupported image type: ${file.type}`);
          mergedPdf.removePage(mergedPdf.getPageCount() - 1);
          continue;
        }

        const { width, height } = page.getSize();
        const scale = Math.min(
          (width * 0.9) / image.width,
          (height * 0.9) / image.height
        );

        const imgWidth = image.width * scale;
        const imgHeight = image.height * scale;

        page.drawImage(image, {
          x: (width - imgWidth) / 2,
          y: (height - imgHeight) / 2,
          width: imgWidth,
          height: imgHeight,
          rotate: degrees(rotation),
        });
      } catch (error) {
        console.error(`Error processing image ${file.name}:`, error);
        mergedPdf.removePage(mergedPdf.getPageCount() - 1);
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