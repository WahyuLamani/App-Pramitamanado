import { pdfjsLib } from './pdf-config';

export async function generatePDFThumbnail(file: File): Promise<string> {
  let canvas: HTMLCanvasElement | null = null;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    // Scale untuk thumbnail (bisa disesuaikan)
    const scale = 0.5;
    const viewport = page.getViewport({ scale });
    
    canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Cannot get canvas 2D context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    const dataUrl = canvas.toDataURL('image/png');
    
    // Cleanup
    canvas.remove();
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    
    // Cleanup jika ada error
    if (canvas) {
      canvas.remove();
    }
    
    return '';
  }
}

export async function getPDFPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    
    // Cleanup
    await pdf.destroy();
    
    return pageCount;
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    return 0;
  }
}