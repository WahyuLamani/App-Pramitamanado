export async function convertImageToPngOrJpeg(file: File): Promise<{ data: ArrayBuffer; type: 'png' | 'jpeg' }> {
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
  
        // Convert ke PNG atau JPEG
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image'));
            return;
          }
  
          const arrayBuffer = await blob.arrayBuffer();
          
          // Return as PNG for better quality
          resolve({ 
            data: arrayBuffer, 
            type: 'png' 
          });
        }, 'image/png');
      };
  
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
  
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
  
      reader.readAsDataURL(file);
    });
  }