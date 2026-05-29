import * as XLSX from 'xlsx';

export function downloadTemplate(templateName: string, headers: string[], sampleRows: any[][]) {
  const wb = XLSX.utils.book_new();
  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style header row width
  ws['!cols'] = headers.map(() => ({ wch: 20 }));

  XLSX.utils.book_append_sheet(wb, ws, templateName);
  XLSX.writeFile(wb, `${templateName}_template.xlsx`);
}

export function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        if (rows.length < 2) { resolve([]); return; }
        const headers = rows[0] as string[];
        const result = rows.slice(1)
          .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          .map(row => {
            const obj: any = {};
            headers.forEach((h, i) => { if (h) obj[h] = row[i] ?? ''; });
            return obj;
          });
        resolve(result);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export const TEMPLATES = {
  products: {
    name: 'Products_Services',
    headers: ['Product Code*', 'Product Name*', 'Description', 'Category', 'Unit of Measure*', 'Unit Price (OMR)', 'Cost Price (OMR)', 'Is Inventory Item (Yes/No)', 'Track Stock (Yes/No)', 'Min Stock Qty', 'Reorder Point', 'Reorder Qty', 'Brand', 'Manufacturer', 'Country of Origin', 'Part Number', 'Model Number', 'Tax Category', 'HS Code', 'Weight (KG)', 'Opening Stock', 'Opening Stock Value', 'Opening Stock Date', 'Notes'],
    sample: [['PROD-001', 'Office Chair', 'Ergonomic office chair', 'Furniture', 'PCS', '85.000', '60.000', 'Yes', 'Yes', '5', '10', '20', 'Brand A', 'Manufacturer X', 'China', 'OC-001', 'MODEL-X', 'STANDARD', '9401.30', '5', '50', '3000.000', '2026-01-01', 'Sample product']],
  },
  chartOfAccounts: {
    name: 'Chart_of_Accounts',
    headers: ['Account Code*', 'Account Name*', 'Account Type*', 'Account Subtype', 'Description', 'Is Active (Yes/No)'],
    sample: [
      ['1010', 'Cash on Hand', 'ASSET', 'CURRENT', 'Cash and cash equivalents', 'Yes'],
      ['4001', 'Sales Revenue', 'REVENUE', '', 'Revenue from sales', 'Yes'],
      ['5001', 'Cost of Goods Sold', 'EXPENSE', 'COGS', 'Direct cost of products sold', 'Yes'],
    ],
  },
  suppliers: {
    name: 'Suppliers',
    headers: ['Supplier Code*', 'Supplier Name*', 'Category', 'Contact Person', 'Phone', 'Email', 'Website', 'Address', 'City', 'Country', 'P.O. Box', 'TRN', 'Payment Terms', 'Credit Limit (OMR)', 'Currency', 'Bank Name', 'Bank Account No.', 'IBAN', 'Notes'],
    sample: [['SUP-001', 'ABC Trading LLC', 'General Supplier', 'Ahmed Ali', '+968 9999 8888', 'ahmed@abc.com', 'www.abc.com', 'Way 123, Block 4', 'Muscat', 'Oman', '100', '1234567890', 'Net 30', '10000.000', 'OMR', 'Bank Muscat', '0123456789', 'OM12BMUS0000000123456789', '']],
  },
  accounts: {
    name: 'Accounts_Customers',
    headers: ['Account Name*', 'Account Code', 'Is Customer (Yes/No)', 'Is Supplier (Yes/No)', 'Phone', 'Email', 'Website', 'Contact Person', 'TRN', 'Address Line 1', 'Address Line 2', 'City', 'State', 'P.O. Box', 'Country', 'Payment Terms', 'Credit Limit (OMR)', 'Currency', 'Bank Name', 'Bank Account No.', 'IBAN', 'Notes'],
    sample: [['Shell Oman Marketing', 'ACC-001', 'Yes', 'No', '+968 2469 0000', 'info@shell.com', 'www.shell.com.om', 'John Smith', '1234567890', 'Mina Al-Fahal', '', 'Muscat', '', '38', 'Oman', 'Net 30', '50000.000', 'OMR', 'HSBC Oman', '9876543210', 'OM12HSBC0000000987654321', '']],
  },
  contacts: {
    name: 'Contacts',
    headers: ['First Name*', 'Last Name*', 'Account Name', 'Job Title', 'Email', 'Phone', 'Mobile', 'Department', 'Notes'],
    sample: [['John', 'Smith', 'Shell Oman Marketing', 'Procurement Manager', 'john@shell.com', '+968 9999 7777', '+968 9888 6666', 'Procurement', '']],
  },
  masterData: {
    name: 'Master_Data',
    headers: ['Category Code*', 'Category Name', 'Value Code*', 'Value Label*', 'Sort Order', 'Is Active (Yes/No)'],
    sample: [
      ['product_categories', 'Product Categories', 'ELECTRONICS', 'Electronics', '1', 'Yes'],
      ['product_categories', 'Product Categories', 'FURNITURE', 'Furniture', '2', 'Yes'],
      ['brands', 'Brands', 'SAMSUNG', 'Samsung', '1', 'Yes'],
    ],
  },
};
