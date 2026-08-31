import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

export interface InvoiceExportOptions {
  invoiceNo: string;
  customerName?: string;
  type?: 'quotations' | 'event' | 'sales' | 'rental' | 'purchase' | string;
  date?: string;
}

export interface InvoiceExportResult {
  success: boolean;
  fileName: string;
  blob?: Blob;
  file?: File;
  dataUrl?: string;
  error?: string;
}

/**
 * 🌟 Generates clean, standard sanitized filename for invoices/quotations
 */
export function getInvoiceFileName(options: InvoiceExportOptions, extension = 'pdf'): string {
  const cleanId = (options.invoiceNo || 'INV').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanName = (options.customerName || 'Client')
    .replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')
    .slice(0, 25);
  const typeTag = options.type === 'quotations' ? 'Quotation' : 'Invoice';
  const dateTag = options.date ? `_${options.date.replace(/[^0-9-]/g, '')}` : '';
  return `Rittika_${typeTag}_${cleanId}_${cleanName}${dateTag}.${extension}`;
}

/**
 * 🌟 Helper to render DOM node to HTMLCanvasElement using native browser rasterization
 * Configured with skipFonts: true to prevent cross-origin stylesheet (Google Fonts) security errors
 */
async function renderElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const options: NonNullable<Parameters<typeof htmlToImage.toCanvas>[1]> = {
    quality: 0.98,
    pixelRatio: 2.2, // Crisp Retina resolution for printing
    backgroundColor: '#ffffff',
    cacheBust: false,
    skipFonts: true, // Prevents "Not allowed to access cross-origin stylesheet" error
    fontEmbedCSS: '', // Avoids cross-origin CSS inspection
    filter: (node) => {
      // Exclude non-print or hidden elements if marked
      if (node instanceof HTMLElement && node.classList.contains('no-print')) {
        return false;
      }
      return true;
    }
  };

  try {
    return await htmlToImage.toCanvas(element, options);
  } catch (err: any) {
    console.warn('Canvas render fallback triggered:', err);
    return await htmlToImage.toCanvas(element, {
      ...options,
      pixelRatio: 1.8
    });
  }
}

/**
 * 🌟 Direct PDF Exporter for Printable Invoices & Quotations
 * Uses html-to-image + jsPDF with intelligent multi-page pagination and direct fallback triggers
 */
export async function downloadInvoicePDF(
  elementOrId: HTMLElement | string,
  options: InvoiceExportOptions
): Promise<InvoiceExportResult> {
  const fileName = getInvoiceFileName(options, 'pdf');
  
  try {
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId) 
      : elementOrId;

    if (!element) {
      throw new Error(`Invoice element not found: ${elementOrId}`);
    }

    // Scroll to top temporarily to ensure complete render
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Render DOM to high-resolution canvas using native browser engine
    const canvas = await renderElementToCanvas(element);
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    
    // A4 dimensions in mm
    const pdfWidth = 210;
    const pageHeight = 297;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate total height in PDF mm units
    const pdfTotalHeight = (canvasHeight * pdfWidth) / canvasWidth;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Handle single-page vs multi-page documents
    if (pdfTotalHeight <= pageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfTotalHeight, undefined, 'FAST');
    } else {
      let heightLeft = pdfTotalHeight;
      let position = 0;

      // Page 1
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfTotalHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Additional pages if needed
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfTotalHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    // Generate output blob and file
    const blob = pdf.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });
    const dataUrl = URL.createObjectURL(blob);

    // Direct download trigger (robust against sandboxed iframes)
    try {
      pdf.save(fileName);
    } catch (e) {
      // Fallback via anchor click
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 1000);
    }

    return {
      success: true,
      fileName,
      blob,
      file,
      dataUrl
    };
  } catch (err: any) {
    console.error('Failed to generate and download Invoice PDF:', err);
    return {
      success: false,
      fileName,
      error: err?.message || 'PDF Generation failed'
    };
  }
}

/**
 * 🌟 Direct High-Definition JPG/PNG Image Downloader for Invoices
 */
export async function downloadInvoiceImage(
  elementOrId: HTMLElement | string,
  options: InvoiceExportOptions,
  format: 'jpg' | 'png' = 'jpg'
): Promise<InvoiceExportResult> {
  const fileName = getInvoiceFileName(options, format);

  try {
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId) 
      : elementOrId;

    if (!element) {
      throw new Error(`Invoice element not found: ${elementOrId}`);
    }

    const canvas = await renderElementToCanvas(element);
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, 0.98);

    // Convert dataURL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: mimeType });

    // Download trigger
    const aImg = document.createElement('a');
    aImg.href = dataUrl;
    aImg.download = fileName;
    document.body.appendChild(aImg);
    aImg.click();
    setTimeout(() => {
      if (document.body.contains(aImg)) {
        document.body.removeChild(aImg);
      }
    }, 1000);

    return {
      success: true,
      fileName,
      blob,
      file,
      dataUrl
    };
  } catch (err: any) {
    console.error('Failed to export Invoice Image:', err);
    return {
      success: false,
      fileName,
      error: err?.message || 'Image Generation failed'
    };
  }
}

/**
 * 🌟 Smart Native Web Share with Attached PDF File (Supported on Mobile WhatsApp/Gmail)
 */
export async function shareInvoiceFileNative(
  file: File,
  shareData: { title: string; text: string }
): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: shareData.title,
        text: shareData.text
      });
      return true;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.warn('Native file share failed:', e);
      }
      return false;
    }
  }
  return false;
}
