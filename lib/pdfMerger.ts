import { PDFDocument, degrees } from 'pdf-lib';

type FileToMerge = {
  file: File;
  type: 'pdf' | 'image';
  rotation: 0 | 90 | 180 | 270;
  orientation: 'portrait' | 'landscape';
};

// Convert image to PDF
async function imageToPdf(imageFile: File, rotation: number, orientation: string): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    
    // Read image as ArrayBuffer
    const imageBytes = await imageFile.arrayBuffer();
    
    // Embed image based on type
    let image;
    if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (imageFile.type === 'image/png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      throw new Error('Unsupported image type');
    }
    
    // Get original image dimensions
    const imgWidth = image.width;
    const imgHeight = image.height;
    
    // Determine base page size (before rotation)
    let baseWidth = imgWidth;
    let baseHeight = imgHeight;
    
    // Apply orientation preference to base size
    if (orientation === 'landscape') {
      baseWidth = Math.max(imgWidth, imgHeight);
      baseHeight = Math.min(imgWidth, imgHeight);
    } else { // portrait
      baseWidth = Math.min(imgWidth, imgHeight);
      baseHeight = Math.max(imgWidth, imgHeight);
    }
    
    // Create page with base dimensions
    const page = pdfDoc.addPage([baseWidth, baseHeight]);
    
    // Calculate scale to fit image in page
    const scaleX = baseWidth / imgWidth;
    const scaleY = baseHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    // Center the image on page
    const x = (baseWidth - scaledWidth) / 2;
    const y = (baseHeight - scaledHeight) / 2;
    
    // Draw image WITHOUT rotation first
    page.drawImage(image, {
      x: x,
      y: y,
      width: scaledWidth,
      height: scaledHeight,
    });
    
    // THEN apply rotation to the entire page
    if (rotation !== 0) {
      page.setRotation(degrees(rotation));
    }
    
    return await pdfDoc.save();
  }
// Main merge function
export async function mergeDocuments(files: FileToMerge[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (const fileData of files) {
    let pdfBytes: Uint8Array;
    
    if (fileData.type === 'image') {
      // Convert image to PDF first
      pdfBytes = await imageToPdf(fileData.file, fileData.rotation, fileData.orientation);
    } else {
      // Read PDF file
      const arrayBuffer = await fileData.file.arrayBuffer();
      pdfBytes = new Uint8Array(arrayBuffer);
    }
    
    // Load the PDF
    const pdf = await PDFDocument.load(pdfBytes);
    
    // Copy all pages
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    
    // Add pages with rotation
    copiedPages.forEach(page => {
      if (fileData.type === 'pdf' && fileData.rotation !== 0) {
        page.setRotation(degrees(fileData.rotation));
      }
      mergedPdf.addPage(page);
    });
  }
  
  return await mergedPdf.save();
}

// Download helper
export function downloadPdf(pdfBytes: Uint8Array, filename: string = 'merged-document.pdf') {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}