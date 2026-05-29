import React, { useEffect, useState } from 'react';
import { Button, Space, Spin } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { generateQRCode, downloadPDF, printDocument } from '../../utils/pdfGenerator';
import { useCompanySettings } from '../../hooks/useCompanySettings';

interface Props { data: any; companyInfo?: any; }

export default function ReceiptPDF({ data, companyInfo }: Props) {
  const { settings: companySettings } = useCompanySettings();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode({
      'Doc Type': 'RECEIPT',
      'Number': data.receiptNumber,
      'Date': data.receiptDate ? new Date(data.receiptDate).toLocaleDateString() : '',
      'Customer': data.customerName,
      'Amount': `OMR ${Number(data.amount || 0).toFixed(3)}`,
      'Method': data.paymentMethod,
      'Reference': data.paymentReference || '',
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
        <Button icon={<PrinterOutlined />} onClick={() => printDocument('receipt-pdf-content')}>Print</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('receipt-pdf-content', `${data.receiptNumber}.pdf`)}>Download PDF</Button>
      </Space>
      <div id="receipt-pdf-content" style={{ width: '210mm', minHeight: '150mm', background: '#fff', padding: '15mm', fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#333', margin: '0 auto', border: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '3px solid #52c41a', paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#52c41a' }}>{company.name}</div>
            <div style={{ fontSize: 10, color: '#666' }}>{company.address}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#52c41a' }}>RECEIPT</div>
            <div style={{ fontSize: 11, color: '#666' }}><strong>{data.receiptNumber}</strong><br />Date: {data.receiptDate ? new Date(data.receiptDate).toLocaleDateString() : '—'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#52c41a', marginBottom: 6, textTransform: 'uppercase' }}>Received From</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{data.customerName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {qrCode && <img src={qrCode} alt="QR" style={{ width: 80, height: 80 }} />}
          </div>
        </div>
        <div style={{ background: '#f6ffed', border: '2px solid #52c41a', borderRadius: 8, padding: 20, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Amount Received</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#52c41a' }}>OMR {Number(data.amount || 0).toFixed(3)}</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Payment Method: {data.paymentMethod?.replace('_', ' ')}</div>
          {data.paymentReference && <div style={{ fontSize: 11, color: '#666' }}>Reference: {data.paymentReference}</div>}
          {data.chequeNumber && <div style={{ fontSize: 11, color: '#666' }}>Cheque #: {data.chequeNumber}</div>}
        </div>
        {data.notes && <div style={{ fontSize: 10, color: '#666', marginBottom: 12 }}><strong>Notes:</strong> {data.notes}</div>}
        <div style={{ borderTop: '2px solid #52c41a', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#999' }}>
          <div>{company.name}</div><div>This is a computer-generated Receipt</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <div style={{ textAlign: 'center', width: 180 }}><div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Received By</div></div>
          <div style={{ textAlign: 'center', width: 180 }}><div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Customer Signature</div></div>
        </div>
      </div>
    </div>
  );
}
