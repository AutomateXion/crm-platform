import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ── PDF Export (clean HTML capture) ──────────────────────────
export async function exportToPDF(elementId: string, filename: string, orientation: 'portrait' | 'landscape' = 'portrait') {
  const element = document.getElementById(elementId);
  if (!element) { alert('Report element not found'); return; }

  try {
    // Temporarily make element full width for clean capture
    const originalStyle = element.getAttribute('style') || '';
    element.style.width = orientation === 'landscape' ? '1100px' : '794px';
    element.style.padding = '20px';
    element.style.background = '#ffffff';
    element.style.fontFamily = 'Arial, sans-serif';

    const canvas = await html2canvas(element, {
      scale: 2, useCORS: true, allowTaint: true,
      backgroundColor: '#ffffff', logging: false,
      windowWidth: orientation === 'landscape' ? 1100 : 794,
    });

    element.setAttribute('style', originalStyle);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - margin);

    while (heightLeft > 0) {
      pdf.addPage();
      position = -(imgHeight - heightLeft) - margin;
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin);
    }

    pdf.save(`${filename}-${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (e) {
    console.error('PDF export failed:', e);
    alert('PDF export failed. Please try again.');
  }
}

// ── Excel Export ──────────────────────────────────────────────
export function exportToExcel(data: any[], filename: string, sheetName = 'Report', headers?: string[]) {
  try {
    const wb = XLSX.utils.book_new();
    let wsData: any[][] = [];

    // Add title rows
    wsData.push([filename.replace(/-/g,' ').toUpperCase()]);
    wsData.push([`Generated: ${new Date().toLocaleString()}`]);
    wsData.push([]); // blank row

    // Add headers
    if (headers) {
      wsData.push(headers);
    } else if (data.length > 0) {
      wsData.push(Object.keys(data[0]));
    }

    // Add data rows
    data.forEach(row => {
      if (headers) {
        wsData.push(headers.map(h => {
          const key = h.toLowerCase().replace(/\s+/g, '');
          const val = row[key] !== undefined ? row[key] : row[Object.keys(row).find(k => k.toLowerCase().replace(/\s+/g,'') === key) || ''];
          return val ?? '';
        }));
      } else {
        wsData.push(Object.values(row));
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Style header row
    ws['!cols'] = headers ? headers.map(() => ({ wch: 20 })) : [];

    // Merge title cell
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: (headers?.length || Object.keys(data[0] || {}).length) - 1 } }];

    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, `${filename}-${new Date().toISOString().slice(0,10)}.xlsx`);
  } catch (e) {
    console.error('Excel export failed:', e);
    alert('Excel export failed.');
  }
}

// ── Multi-sheet Excel Export ──────────────────────────────────
export function exportToExcelMultiSheet(sheets: { name: string, data: any[], headers: string[] }[], filename: string) {
  try {
    const wb = XLSX.utils.book_new();
    sheets.forEach(sheet => {
      const wsData: any[][] = [];
      wsData.push([filename.replace(/-/g,' ').toUpperCase() + ' - ' + sheet.name]);
      wsData.push([`Generated: ${new Date().toLocaleString()}`]);
      wsData.push([]);
      wsData.push(sheet.headers);
      sheet.data.forEach(row => {
        wsData.push(sheet.headers.map(h => row[h] ?? ''));
      });
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = sheet.headers.map(() => ({ wch: 18 }));
      XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
    });
    XLSX.writeFile(wb, `${filename}-${new Date().toISOString().slice(0,10)}.xlsx`);
  } catch (e) {
    console.error('Excel export failed:', e);
  }
}

// ── XML Export ────────────────────────────────────────────────
export function exportToXML(data: any[], filename: string, rootElement = 'Report', itemElement = 'Row') {
  try {
    const escapeXML = (val: any) => {
      if (val === null || val === undefined) return '';
      return String(val).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
    };

    const toTag = (key: string) => key.replace(/[^a-zA-Z0-9_]/g, '_');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<${rootElement} generated="${new Date().toISOString()}" company="My Company">\n`;
    data.forEach(row => {
      xml += `  <${itemElement}>\n`;
      Object.entries(row).forEach(([key, val]) => {
        xml += `    <${toTag(key)}>${escapeXML(val)}</${toTag(key)}>\n`;
      });
      xml += `  </${itemElement}>\n`;
    });
    xml += `</${rootElement}>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}-${new Date().toISOString().slice(0,10)}.xml`;
    a.click();
  } catch (e) {
    console.error('XML export failed:', e);
  }
}

// ── CSV Export ────────────────────────────────────────────────
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  try {
    const keys = headers || (data.length > 0 ? Object.keys(data[0]) : []);
    const rows = [
      keys.join(','),
      ...data.map(row => keys.map(k => {
        const val = row[k] ?? '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(','))
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  } catch (e) {
    console.error('CSV export failed:', e);
  }
}

// ── Export Button Component Data ──────────────────────────────
export interface ExportConfig {
  elementId?: string;         // for PDF
  filename: string;
  data?: any[];               // for Excel/XML/CSV
  headers?: string[];         // column headers
  sheetName?: string;
  orientation?: 'portrait' | 'landscape';
  xmlRoot?: string;
  xmlItem?: string;
}
