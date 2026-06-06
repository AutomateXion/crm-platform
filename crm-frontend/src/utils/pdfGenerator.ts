import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export async function generateQRCode(data: object): Promise<string> {
  const text = Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return QRCode.toDataURL(text, { width: 120, margin: 1 });
}

export async function downloadPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  pdf.save(filename);
}

export async function printDocument(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<html><head><title>Print</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; background: white; }
      @page { size: A4; margin: 0; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    </style>
    </head><body>${element.innerHTML}</body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); }, 500);
}

// ── Multi-page output: each pageId is a pre-sized A4 div, rendered as its own page ──
export async function downloadMultiPagePDF(pageIds: string[], filename: string) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let first = true;
  for (const id of pageIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    if (!first) pdf.addPage();
    first = false;
    // Fit the page image to A4 (each div is already A4-proportioned)
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
  }
  pdf.save(filename);
}

export function printMultiPage(pageIds: string[]) {
  const win = window.open('', '_blank');
  if (!win) return;
  const html = pageIds
    .map((id) => {
      const el = document.getElementById(id);
      return el ? `<div class="print-page">${el.innerHTML}</div>` : '';
    })
    .join('');
  win.document.write(`<html><head><title>Print</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; background: white; }
      @page { size: A4; margin: 12mm; }
      .print-page { width: 100%; min-height: 273mm; page-break-after: always; position: relative; }
      .print-page:last-child { page-break-after: auto; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    </style>
    </head><body>${html}</body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); }, 500);
}
