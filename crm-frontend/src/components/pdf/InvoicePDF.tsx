import React, { useEffect, useState } from 'react';
import { Button, Space, Spin } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { generateQRCode, downloadPDF, printDocument } from '../../utils/pdfGenerator';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { signaturesApi } from '../../services/salesApi';

interface InvoicePDFProps { data: any; companyInfo?: any; config?: any; }

const DEFAULT_CONFIG = {
  termsText: '',
  headerNote: '',
  footerNote: '',
  fields: {} as Record<string, boolean>,
  itemsPerPage: 15,
  showSignature: true,
};

export default function InvoicePDF({ data, companyInfo, config }: InvoicePDFProps) {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState<any>(null);

  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };
  const show = (key: string) => cfg.fields?.[key] !== false;

  useEffect(() => {
    let active = true;
    const tasks: Promise<any>[] = [
      generateQRCode({
        'Doc Type': 'TAX INVOICE',
        'Number': data.invoiceNumber,
        'Date': data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString() : '',
        'Due Date': data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '',
        'Customer': data.customerName,
        'TRN': data.customerTrn || '',
        'Taxable Amt': `OMR ${Number(data.subtotal || 0).toFixed(3)}`,
        'VAT (5%)': `OMR ${Number(data.vatAmount || 0).toFixed(3)}`,
        'Total': `OMR ${Number(data.totalAmount || 0).toFixed(3)}`,
        'Status': data.status,
      }).then((qr) => { if (active) setQrCode(qr); }),
    ];
    if (data.invoiceId) {
      tasks.push(
        signaturesApi.getOne('INVOICE', data.invoiceId)
          .then((r: any) => { if (active) setSignature((r.data && r.data[0]) || null); })
          .catch(() => {}),
      );
    }
    Promise.allSettled(tasks).then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [data]);

  const { settings: companySettings } = useCompanySettings();
  const company = companyInfo || {
    name: companySettings.companyName,
    address: [companySettings.addressLine1, companySettings.city, companySettings.country].filter(Boolean).join(', '),
    phone: companySettings.phone,
    email: companySettings.email,
    trn: companySettings.trn,
    logoUrl: companySettings.logoUrl,
    primaryColor: companySettings.primaryColor || '#52c41a',
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<PrinterOutlined />} onClick={() => printDocument('invoice-pdf-content')}>Print</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('invoice-pdf-content', `${data.invoiceNumber}.pdf`)}>Download PDF</Button>
      </Space>

      <div id="invoice-pdf-content" style={{ width: '210mm', minHeight: '297mm', background: '#fff', padding: '15mm', fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#333', margin: '0 auto', border: '1px solid #e0e0e0' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '3px solid #52c41a', paddingBottom: 16 }}>
          <div>
            {company.logoUrl && <img src={company.logoUrl} alt="logo" style={{ height: 48, objectFit: 'contain', marginBottom: 6, display: 'block' }} />}
            <div style={{ fontSize: 22, fontWeight: 700, color: company.primaryColor || '#52c41a', marginBottom: 4 }}>{company.name}</div>
            <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>
              {company.address}<br />
              {company.phone && `Tel: ${company.phone}`}{company.phone && company.email && ' | '}{company.email && `Email: ${company.email}`}<br />
              {company.trn && `VAT TRN: ${company.trn}`}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#52c41a', marginBottom: 4 }}>TAX INVOICE</div>
            <div style={{ fontSize: 11, color: '#666' }}>
              <strong>{data.invoiceNumber}</strong><br />
              Date: {data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString() : '—'}<br />
              {show('dueDate') && <>Due: {data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '—'}<br /></>}
              <span style={{ color: data.status === 'PAID' ? '#52c41a' : data.status === 'OVERDUE' ? '#ff4d4f' : '#fa8c16', fontWeight: 700 }}>{data.status}</span>
            </div>
          </div>
        </div>

        {/* Header note from config */}
        {cfg.headerNote && <div style={{ fontSize: 10, color: '#555', marginBottom: 16, padding: '8px 12px', background: '#f6ffed', borderRadius: 4 }}>{cfg.headerNote}</div>}

        {/* Bill To & QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#52c41a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Bill To</div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{data.customerName}</div>
            {show('customerAddress') && data.customerAddress && <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{data.customerAddress}</div>}
            {data.customerEmail && <div style={{ color: '#666', fontSize: 10 }}>Email: {data.customerEmail}</div>}
            {show('customerTrn') && data.customerTrn && <div style={{ color: '#666', fontSize: 10, fontWeight: 600 }}>TRN: {data.customerTrn}</div>}
            {show('salesman') && data.salesmanName && <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>Salesman: {data.salesmanName}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            {qrCode && <img src={qrCode} alt="QR" style={{ width: 90, height: 90 }} />}
            <div style={{ fontSize: 9, color: '#999', marginTop: 4 }}>Scan to verify</div>
          </div>
        </div>

        {/* Line Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#52c41a', color: '#fff' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, width: 30 }}>#</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10 }}>Description</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 10, width: 50 }}>UOM</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 60 }}>Qty</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 80 }}>Unit Price</th>
              {show('discount') && <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 60 }}>Disc%</th>}
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
                {show('discount') && <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10 }}>{Number(item.discountPct || 0).toFixed(1)}%</td>}
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10, fontWeight: 600 }}>{Number(item.lineTotal).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <table style={{ width: 300 }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '5px 10px', fontSize: 10, color: '#666' }}>Subtotal (Taxable Amount):</td><td style={{ padding: '5px 10px', textAlign: 'right', fontSize: 10 }}>OMR {Number(data.subtotal || 0).toFixed(3)}</td></tr>
              {Number(data.discountAmount || 0) > 0 && <tr><td style={{ padding: '5px 10px', fontSize: 10, color: '#ff4d4f' }}>Discount:</td><td style={{ padding: '5px 10px', textAlign: 'right', fontSize: 10, color: '#ff4d4f' }}>-OMR {Number(data.discountAmount).toFixed(3)}</td></tr>}
              {show('vat') && <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '5px 10px', fontSize: 10, color: '#666' }}>VAT ({data.vatRate || 5}%):</td><td style={{ padding: '5px 10px', textAlign: 'right', fontSize: 10 }}>OMR {Number(data.vatAmount || 0).toFixed(3)}</td></tr>}
              <tr style={{ background: '#52c41a', color: '#fff' }}>
                <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700 }}>Total Amount:</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>OMR {Number(data.totalAmount || 0).toFixed(3)}</td>
              </tr>
              {Number(data.paidAmount || 0) > 0 && <>
                <tr><td style={{ padding: '5px 10px', fontSize: 10, color: '#52c41a' }}>Amount Paid:</td><td style={{ padding: '5px 10px', textAlign: 'right', fontSize: 10, color: '#52c41a' }}>OMR {Number(data.paidAmount).toFixed(3)}</td></tr>
                <tr style={{ background: Number(data.balanceDue || 0) > 0 ? '#fff2f0' : '#f6ffed' }}>
                  <td style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, color: Number(data.balanceDue || 0) > 0 ? '#ff4d4f' : '#52c41a' }}>Balance Due:</td>
                  <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: Number(data.balanceDue || 0) > 0 ? '#ff4d4f' : '#52c41a' }}>OMR {Number(data.balanceDue || 0).toFixed(3)}</td>
                </tr>
              </>}
            </tbody>
          </table>
        </div>

        {/* Payment Terms */}
        {show('paymentTerms') && data.paymentTerms && <div style={{ fontSize: 10, color: '#666', marginBottom: 8 }}><strong>Payment Terms:</strong> {data.paymentTerms}</div>}
        {show('notes') && data.notes && <div style={{ fontSize: 10, color: '#666', marginBottom: 16, borderTop: '1px solid #eee', paddingTop: 8 }}><strong>Notes:</strong> {data.notes}</div>}

        {/* Terms & Conditions from config */}
        {cfg.termsText && (
          <div style={{ fontSize: 9, color: '#666', marginBottom: 16, padding: '10px 12px', background: '#fafafa', borderRadius: 4, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: '#52c41a', marginBottom: 4, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Terms &amp; Conditions</div>
            {cfg.termsText}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '2px solid #52c41a', paddingTop: 12, marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#999' }}>
          <div>{company.name}{company.trn ? ` | VAT TRN: ${company.trn}` : ''}</div>
          <div>{cfg.footerNote || 'This is a computer-generated Tax Invoice'}</div>
          <div>Page 1 of 1</div>
        </div>

        {/* Signatures */}
        {cfg.showSignature && (
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
              {signature ? (
                <>
                  <img src={signature.signatureImage} alt="signature" style={{ height: 44, objectFit: 'contain', marginBottom: 2 }} />
                  <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Received By (Customer)</div>
                  <div style={{ fontSize: 10, color: '#333', marginTop: 4, fontWeight: 600 }}>{signature.signerName}</div>
                  <div style={{ fontSize: 8, color: '#999' }}>
                    {new Date(signature.signedAt).toLocaleString('en-GB')}
                    {signature.gpsLat != null && signature.gpsLng != null && (
                      <> · {Number(signature.gpsLat).toFixed(4)}, {Number(signature.gpsLng).toFixed(4)}</>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ height: 44 }} />
                  <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Received By</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>________________</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
