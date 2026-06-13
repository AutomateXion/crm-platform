import React, { useEffect, useState } from 'react';
import { Button, Space, Spin } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { generateQRCode, downloadMultiPagePDF, printMultiPage } from '../../utils/pdfGenerator';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { signaturesApi } from '../../services/salesApi';

interface QuotationPDFProps { data: any; companyInfo?: any; config?: any; }

const DEFAULT_CONFIG = {
  termsText: '', headerNote: '', footerNote: '',
  fields: {} as Record<string, boolean>, itemsPerPage: 16, showSignature: true,
};

const C = '#1890ff';

export default function QuotationPDF({ data, companyInfo, config }: QuotationPDFProps) {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState<any>(null);

  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };
  const show = (key: string) => cfg.fields?.[key] !== false;
  const perPage = Number(cfg.itemsPerPage) || 16;

  useEffect(() => {
    let active = true;
    const tasks: Promise<any>[] = [
      generateQRCode({
        'Doc Type': 'QUOTATION', 'Number': data.quotationNumber,
        'Date': data.quotationDate ? new Date(data.quotationDate).toLocaleDateString() : '',
        'Total': `OMR ${Number(data.totalAmount || 0).toFixed(3)}`, 'Status': data.status,
      }).then((qr) => { if (active) setQrCode(qr); }),
    ];
    if (data.quotationId) {
      tasks.push(signaturesApi.getOne('QUOTATION', data.quotationId)
        .then((r: any) => { if (active) setSignature((r.data && r.data[0]) || null); })
        .catch(() => {}));
    }
    Promise.allSettled(tasks).then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [data]);

  const { settings: companySettings } = useCompanySettings();
  const company = companyInfo || {
    name: companySettings.companyName,
    address: [companySettings.addressLine1, companySettings.city, companySettings.country].filter(Boolean).join(', '),
    phone: companySettings.phone, email: companySettings.email, trn: companySettings.trn,
    logoUrl: companySettings.logoUrl, primaryColor: companySettings.primaryColor || C,
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;

  const items = data.items || [];
  const colSpan = show('discount') ? 7 : 6;

  const chunks: any[][] = [];
  for (let i = 0; i < items.length; i += perPage) chunks.push(items.slice(i, i + perPage));
  if (chunks.length === 0) chunks.push([]);
  const totalPages = chunks.length;
  const pageIds = chunks.map((_, i) => `quo-page-${i}`);

  const Header = ({ pageNo }: { pageNo: number }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottom: `3px solid ${C}`, paddingBottom: 10 }}>
        <div>
          {company.logoUrl && <img src={company.logoUrl} alt="logo" style={{ height: 40, objectFit: 'contain', marginBottom: 4, display: 'block' }} />}
          <div style={{ fontSize: 18, fontWeight: 700, color: company.primaryColor || C, marginBottom: 4 }}>{company.name}</div>
          <div style={{ fontSize: 9, color: '#666', lineHeight: 1.5 }}>
            {company.address}<br />
            {company.phone && `Tel: ${company.phone}`}{company.phone && company.email && ' | '}{company.email && `Email: ${company.email}`}<br />
            {company.trn && `TRN: ${company.trn}`}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C, marginBottom: 4 }}>QUOTATION</div>
          <div style={{ fontSize: 10, color: '#666' }}>
            <strong>{data.quotationNumber}</strong><br />
            Date: {data.quotationDate ? new Date(data.quotationDate).toLocaleDateString() : '—'}<br />
            {show('validUntil') && <>Valid Until: {data.validUntil ? new Date(data.validUntil).toLocaleDateString() : '—'}</>}
          </div>
          {pageNo === 1 && qrCode && <img src={qrCode} alt="QR" style={{ width: 64, height: 64, marginTop: 4 }} />}
        </div>
      </div>
      {pageNo === 1 && cfg.headerNote && <div style={{ fontSize: 9, color: '#555', marginBottom: 8, padding: '6px 10px', background: '#e6f7ff', borderRadius: 4 }}>{cfg.headerNote}</div>}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: 1 }}>To: </span>
        <span style={{ fontWeight: 600, fontSize: 11 }}>{data.customerName}</span>
        {show('customerTrn') && data.customerTrn && <span style={{ color: '#666', fontSize: 9 }}>  ·  TRN: {data.customerTrn}</span>}
        {pageNo === 1 && show('customerAddress') && data.customerAddress && <div style={{ color: '#666', fontSize: 9 }}>{data.customerAddress}</div>}
      </div>
      {pageNo === 1 && data.subject && (
        <div style={{ background: '#f5f5f5', padding: '6px 10px', borderRadius: 4, marginBottom: 8, fontSize: 10 }}>
          <strong>Subject:</strong> {data.subject}
        </div>
      )}
    </div>
  );

  const ItemsTable = ({ chunk, startIndex }: { chunk: any[]; startIndex: number }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: C, color: '#fff' }}>
          <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 9, width: 28 }}>#</th>
          <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 9 }}>Description</th>
          <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 9, width: 45 }}>UOM</th>
          <th style={{ padding: '7px 10px', textAlign: 'right', fontSize: 9, width: 50 }}>Qty</th>
          <th style={{ padding: '7px 10px', textAlign: 'right', fontSize: 9, width: 70 }}>Unit Price</th>
          {show('discount') && <th style={{ padding: '7px 10px', textAlign: 'right', fontSize: 9, width: 50 }}>Disc%</th>}
          <th style={{ padding: '7px 10px', textAlign: 'right', fontSize: 9, width: 80 }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {chunk.map((item: any, i: number) => (
          <tr key={i} style={{ background: (startIndex + i) % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 10px', fontSize: 9 }}>{startIndex + i + 1}</td>
            <td style={{ padding: '6px 10px', fontSize: 9 }}>{item.description}</td>
            <td style={{ padding: '6px 10px', textAlign: 'center', fontSize: 9 }}>{item.unitOfMeasure}</td>
            <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 9 }}>{Number(item.quantity).toFixed(3)}</td>
            <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 9 }}>{Number(item.unitPrice).toFixed(3)}</td>
            {show('discount') && <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 9 }}>{Number(item.discountPct || 0).toFixed(1)}%</td>}
            <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 9, fontWeight: 600 }}>{Number(item.lineTotal).toFixed(3)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const TotalsBlock = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <table style={{ width: 280 }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '4px 10px', fontSize: 10, color: '#666' }}>Subtotal:</td><td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 10 }}>OMR {Number(data.subtotal || 0).toFixed(3)}</td></tr>
            {Number(data.discountAmount || 0) > 0 && <tr><td style={{ padding: '4px 10px', fontSize: 10, color: '#ff4d4f' }}>Discount:</td><td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 10, color: '#ff4d4f' }}>-OMR {Number(data.discountAmount).toFixed(3)}</td></tr>}
            {show('vat') && <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '4px 10px', fontSize: 10, color: '#666' }}>VAT ({data.vatRate || 5}%):</td><td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 10 }}>OMR {Number(data.vatAmount || 0).toFixed(3)}</td></tr>}
            <tr style={{ background: C, color: '#fff' }}>
              <td style={{ padding: '7px 10px', fontSize: 11, fontWeight: 700 }}>Total:</td>
              <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, fontWeight: 700 }}>OMR {Number(data.totalAmount || 0).toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {show('notes') && data.notes && <div style={{ fontSize: 9, color: '#666', marginBottom: 8 }}><strong>Notes:</strong> {data.notes}</div>}
      {cfg.termsText && (
        <div style={{ fontSize: 8.5, color: '#666', marginBottom: 10, padding: '8px 10px', background: '#fafafa', borderRadius: 4, lineHeight: 1.4 }}>
          <div style={{ fontWeight: 700, color: C, marginBottom: 3, fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 1 }}>Terms &amp; Conditions</div>
          {cfg.termsText}
        </div>
      )}
      {data.termsConditions && (
        <div style={{ fontSize: 8.5, color: '#666', marginTop: 10, marginBottom: 10, padding: '8px 10px', background: '#fafafa', borderRadius: 4, lineHeight: 1.4 }}>
          <div style={{ fontWeight: 700, color: C, marginBottom: 3, fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 1 }}>Additional Terms &amp; Conditions</div>
          {data.termsConditions}
        </div>
      )}
      {cfg.showSignature && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <div style={{ textAlign: 'center', width: 160 }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: 5, fontSize: 9 }}>Prepared By</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>{data.preparedByName || '________________'}</div>
          </div>
          <div style={{ textAlign: 'center', width: 160 }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: 5, fontSize: 9 }}>Authorized Signature</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>________________</div>
          </div>
          <div style={{ textAlign: 'center', width: 160 }}>
            {signature ? (
              <>
                <img src={signature.signatureImage} alt="signature" style={{ height: 36, objectFit: 'contain', marginBottom: 2 }} />
                <div style={{ borderTop: '1px solid #333', paddingTop: 5, fontSize: 9 }}>Customer Acceptance</div>
                <div style={{ fontSize: 9, color: '#333', marginTop: 3, fontWeight: 600 }}>{signature.signerName}</div>
                <div style={{ fontSize: 7.5, color: '#999' }}>{new Date(signature.signedAt).toLocaleString('en-GB')}</div>
              </>
            ) : (
              <>
                <div style={{ height: 36 }} />
                <div style={{ borderTop: '1px solid #333', paddingTop: 5, fontSize: 9 }}>Customer Acceptance</div>
                <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>________________</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const pageBoxStyle: React.CSSProperties = {
    width: '210mm', height: '297mm', background: '#fff', padding: '14mm',
    fontFamily: 'Arial, sans-serif', color: '#333', margin: '0 auto 16px',
    border: '1px solid #e0e0e0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<PrinterOutlined />} onClick={() => printMultiPage(pageIds)}>Print</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadMultiPagePDF(pageIds, `${data.quotationNumber}.pdf`)}>Download PDF</Button>
      </Space>

      {chunks.map((chunk, p) => {
        const isLast = p === totalPages - 1;
        const startIndex = p * perPage;
        return (
          <div id={`quo-page-${p}`} key={p} style={pageBoxStyle}>
            <Header pageNo={p + 1} />
            <div style={{ flex: 1 }}>
              <ItemsTable chunk={chunk} startIndex={startIndex} />
              {!isLast && (
                <div style={{ textAlign: 'right', fontSize: 10, fontStyle: 'italic', color: '#888', marginTop: 8 }}>
                  Continued on next page →
                </div>
              )}
            </div>
            {isLast ? <TotalsBlock /> : null}
            <div style={{ borderTop: `2px solid ${C}`, paddingTop: 8, marginTop: 10, fontSize: 8, color: '#999', display: 'flex', justifyContent: 'space-between' }}>
              <div>{company.name}{company.trn ? ` | TRN: ${company.trn}` : ''}</div>
              <div>{cfg.footerNote || 'Computer-generated Quotation'}</div>
              <div>Page {p + 1} of {totalPages}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
