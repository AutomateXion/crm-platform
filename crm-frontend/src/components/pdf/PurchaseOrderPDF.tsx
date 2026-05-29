import React, { useEffect, useState } from 'react';
import { Button, Space, Spin } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { generateQRCode, downloadPDF, printDocument } from '../../utils/pdfGenerator';
import { useCompanySettings } from '../../hooks/useCompanySettings';

interface Props { data: any; companyInfo?: any; }

export default function PurchaseOrderPDF({ data, companyInfo }: Props) {
  const { settings: companySettings } = useCompanySettings();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode({
      'Doc Type': 'PURCHASE ORDER',
      'Number': data.poNumber,
      'Date': data.poDate ? new Date(data.poDate).toLocaleDateString() : '',
      'Expected': data.expectedDate ? new Date(data.expectedDate).toLocaleDateString() : '',
      'Supplier': data.supplierName,
      'TRN': data.supplierTrn || '',
      'Total': `OMR ${Number(data.totalAmount || 0).toFixed(3)}`,
      'Status': data.status,
    }).then(qr => { setQrCode(qr); setLoading(false); });
  }, [data]);

  const company = companyInfo || {
    name: companySettings.companyName,
    address: [companySettings.addressLine1, companySettings.city, companySettings.country].filter(Boolean).join(', '),
    phone: companySettings.phone,
    email: companySettings.email,
    trn: companySettings.trn,
    logoUrl: companySettings.logoUrl,
    primaryColor: companySettings.primaryColor,
  };
  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<PrinterOutlined />} onClick={() => printDocument('po-pdf-content')}>Print</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('po-pdf-content', `${data.poNumber}.pdf`)}>Download PDF</Button>
      </Space>
      <div id="po-pdf-content" style={{ width: '210mm', minHeight: '297mm', background: '#fff', padding: '15mm', fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#333', margin: '0 auto', border: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '3px solid #fa8c16', paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fa8c16', marginBottom: 4 }}>{company.name}</div>
            <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>{company.address}<br />{company.phone && `Tel: ${company.phone}`}{company.trn && ` | TRN: ${company.trn}`}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fa8c16', marginBottom: 4 }}>PURCHASE ORDER</div>
            <div style={{ fontSize: 11, color: '#666' }}>
              <strong>{data.poNumber}</strong><br />
              Date: {data.poDate ? new Date(data.poDate).toLocaleDateString() : '—'}<br />
              Expected: {data.expectedDate ? new Date(data.expectedDate).toLocaleDateString() : '—'}<br />
              <span style={{ color: '#fa8c16', fontWeight: 700 }}>{data.status}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#fa8c16', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Vendor / Supplier</div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{data.supplierName}</div>
            {data.supplierAddress && <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{data.supplierAddress}</div>}
            {data.supplierEmail && <div style={{ color: '#666', fontSize: 10 }}>Email: {data.supplierEmail}</div>}
            {data.supplierTrn && <div style={{ color: '#666', fontSize: 10 }}>TRN: {data.supplierTrn}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            {qrCode && <img src={qrCode} alt="QR" style={{ width: 90, height: 90 }} />}
            <div style={{ fontSize: 9, color: '#999', marginTop: 4 }}>Scan to verify</div>
          </div>
        </div>
        {data.subject && <div style={{ background: '#fff7e6', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 11 }}><strong>Subject:</strong> {data.subject}</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#fa8c16', color: '#fff' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, width: 30 }}>#</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10 }}>Description</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 10, width: 50 }}>UOM</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 60 }}>Qty</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 80 }}>Unit Price</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 90 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map((item: any, i: number) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fffbe6', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '7px 10px', fontSize: 10 }}>{i + 1}</td>
                <td style={{ padding: '7px 10px', fontSize: 10 }}>{item.description}</td>
                <td style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10 }}>{item.unitOfMeasure}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10 }}>{Number(item.quantity).toFixed(3)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10 }}>{Number(item.unitPrice).toFixed(3)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10, fontWeight: 600 }}>{Number(item.lineTotal).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <table style={{ width: 280 }}>
            <tbody>
              <tr><td style={{ padding: '4px 10px', fontSize: 10, color: '#666' }}>Subtotal:</td><td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 10 }}>OMR {Number(data.subtotal || 0).toFixed(3)}</td></tr>
              <tr><td style={{ padding: '4px 10px', fontSize: 10, color: '#666' }}>VAT ({data.vatRate || 5}%):</td><td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 10 }}>OMR {Number(data.vatAmount || 0).toFixed(3)}</td></tr>
              <tr style={{ background: '#fa8c16', color: '#fff' }}>
                <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700 }}>Total Amount:</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>OMR {Number(data.totalAmount || 0).toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {data.termsConditions && <div style={{ fontSize: 10, color: '#666', marginBottom: 8 }}><strong>Terms & Conditions:</strong> {data.termsConditions}</div>}
        {data.notes && <div style={{ fontSize: 10, color: '#666', marginBottom: 16 }}><strong>Notes:</strong> {data.notes}</div>}
        <div style={{ borderTop: '2px solid #fa8c16', paddingTop: 12, marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#999' }}>
          <div>{company.name}</div><div>This is a computer-generated Purchase Order</div><div>Page 1 of 1</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          <div style={{ textAlign: 'center', width: 180 }}><div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Prepared By</div><div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{data.preparedByName || '________________'}</div></div>
          <div style={{ textAlign: 'center', width: 180 }}><div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Approved By</div><div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{data.approvedByName || '________________'}</div></div>
          <div style={{ textAlign: 'center', width: 180 }}><div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Supplier Acknowledgment</div><div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>________________</div></div>
        </div>
      </div>
    </div>
  );
}
