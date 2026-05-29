import React, { useEffect, useState } from 'react';
import { Button, Space, Spin } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { generateQRCode, downloadPDF, printDocument } from '../../utils/pdfGenerator';
import { useCompanySettings } from '../../hooks/useCompanySettings';

interface QuotationPDFProps {
  data: any;
  companyInfo?: any;
}

export default function QuotationPDF({ data, companyInfo }: QuotationPDFProps) {
  const { settings: companySettings } = useCompanySettings();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode({
      'Doc Type': 'QUOTATION',
      'Number': data.quotationNumber,
      'Date': data.quotationDate ? new Date(data.quotationDate).toLocaleDateString() : '',
      'Valid Until': data.validUntil ? new Date(data.validUntil).toLocaleDateString() : '',
      'Customer': data.customerName,
      'Total': `OMR ${Number(data.totalAmount || 0).toFixed(3)}`,
      'VAT': `OMR ${Number(data.vatAmount || 0).toFixed(3)}`,
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
        <Button icon={<PrinterOutlined />} onClick={() => printDocument('quotation-pdf-content')}>Print</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('quotation-pdf-content', `${data.quotationNumber}.pdf`)}>Download PDF</Button>
      </Space>

      <div id="quotation-pdf-content" style={{ width: '210mm', minHeight: '297mm', background: '#fff', padding: '15mm', fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#333', margin: '0 auto', border: '1px solid #e0e0e0' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '3px solid #1890ff', paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1890ff', marginBottom: 4 }}>{company.name}</div>
            <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>
              {company.address}<br />
              {company.phone && `Tel: ${company.phone}`}{company.phone && company.email && ' | '}{company.email && `Email: ${company.email}`}<br />
              {company.trn && `TRN: ${company.trn}`}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1890ff', marginBottom: 4 }}>QUOTATION</div>
            <div style={{ fontSize: 11, color: '#666' }}>
              <strong>{data.quotationNumber}</strong><br />
              Date: {data.quotationDate ? new Date(data.quotationDate).toLocaleDateString() : '—'}<br />
              Valid Until: {data.validUntil ? new Date(data.validUntil).toLocaleDateString() : '—'}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1890ff', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Bill To</div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{data.customerName}</div>
            {data.customerAddress && <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{data.customerAddress}</div>}
            {data.customerEmail && <div style={{ color: '#666', fontSize: 10 }}>Email: {data.customerEmail}</div>}
            {data.customerPhone && <div style={{ color: '#666', fontSize: 10 }}>Tel: {data.customerPhone}</div>}
            {data.customerTrn && <div style={{ color: '#666', fontSize: 10 }}>TRN: {data.customerTrn}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            {qrCode && <img src={qrCode} alt="QR" style={{ width: 90, height: 90 }} />}
            <div style={{ fontSize: 9, color: '#999', marginTop: 4 }}>Scan to verify</div>
          </div>
        </div>

        {/* Subject */}
        {data.subject && (
          <div style={{ background: '#f5f5f5', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 11 }}>
            <strong>Subject:</strong> {data.subject}
          </div>
        )}

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#1890ff', color: '#fff' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, width: 30 }}>#</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10 }}>Description</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 10, width: 50 }}>UOM</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 60 }}>Qty</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 80 }}>Unit Price</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 60 }}>Disc%</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 90 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map((item: any, i: number) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '7px 10px', fontSize: 10 }}>{i + 1}</td>
                <td style={{ padding: '7px 10px', fontSize: 10 }}>{item.description}</td>
                <td style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10 }}>{item.unitOfMeasure}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10 }}>{Number(item.quantity).toFixed(3)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10 }}>{Number(item.unitPrice).toFixed(3)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10 }}>{Number(item.discountPct || 0).toFixed(1)}%</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10, fontWeight: 600 }}>{Number(item.lineTotal).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <table style={{ width: 280 }}>
            <tbody>
              <tr><td style={{ padding: '4px 10px', fontSize: 10, color: '#666' }}>Subtotal:</td><td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 10 }}>OMR {Number(data.subtotal || 0).toFixed(3)}</td></tr>
              {Number(data.discountAmount || 0) > 0 && <tr><td style={{ padding: '4px 10px', fontSize: 10, color: '#ff4d4f' }}>Discount:</td><td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 10, color: '#ff4d4f' }}>-OMR {Number(data.discountAmount).toFixed(3)}</td></tr>}
              <tr><td style={{ padding: '4px 10px', fontSize: 10, color: '#666' }}>VAT ({data.vatRate || 5}%):</td><td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 10 }}>OMR {Number(data.vatAmount || 0).toFixed(3)}</td></tr>
              <tr style={{ background: '#1890ff', color: '#fff' }}>
                <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700 }}>Total Amount:</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>OMR {Number(data.totalAmount || 0).toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms */}
        {data.termsConditions && (
          <div style={{ marginBottom: 16, fontSize: 10, borderTop: '1px solid #eee', paddingTop: 12 }}>
            <strong>Terms & Conditions:</strong><br />
            <span style={{ color: '#666' }}>{data.termsConditions}</span>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '2px solid #1890ff', paddingTop: 12, marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#999' }}>
          <div>{company.name} — {company.address}</div>
          <div>This is a computer-generated document</div>
          <div>Page 1 of 1</div>
        </div>

        {/* Signature */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <div style={{ textAlign: 'center', width: 180 }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Prepared By</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{data.preparedByName || '________________'}</div>
          </div>
          <div style={{ textAlign: 'center', width: 180 }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Authorized Signature</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>________________</div>
          </div>
          <div style={{ textAlign: 'center', width: 180 }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Customer Acceptance</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>________________</div>
          </div>
        </div>
      </div>
    </div>
  );
}
