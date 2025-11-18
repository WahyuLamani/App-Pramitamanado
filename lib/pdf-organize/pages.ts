import { pdfjsLib } from './pdf-config';

export async function extractPDFPages(file: File): Promise<{
  pageNumber: number;
  thumbnail: string;
}[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const pages = [];
    const numPages = pdf.numPages;

    // Extract semua halaman
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const thumbnail = await generatePageThumbnail(page);
      
      pages.push({
        pageNumber: i,
        thumbnail,
      });
    }

    await pdf.destroy();
    return pages;
  } catch (error) {
    console.error('Error extracting PDF pages:', error);
    return [];
  }
}

async function generatePageThumbnail(page: any): Promise<string> {
  const scale = 0.5;
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Cannot get canvas 2D context');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  }).promise;

  const dataUrl = canvas.toDataURL('image/png');
  canvas.remove();
  
  return dataUrl;
}