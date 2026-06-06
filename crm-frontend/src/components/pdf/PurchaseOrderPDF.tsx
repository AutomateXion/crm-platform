import React, { useEffect, useState } from 'react';
import { Button, Space, Spin } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { generateQRCode, downloadMultiPagePDF, printMultiPage } from '../../utils/pdfGenerator';
import { useCompanySettings } from '../../hooks/useCompanySettings';

interface Props { data: any; companyInfo?: any; config?: any; }

const DEFAULT_CONFIG = {
  termsText: '', headerNote: '', footerNote: '',
  fields: {} as Record<string, boolean>, itemsPerPage: 16, showSignature: true,
};

const C = '#fa8c16';

export default function PurchaseOrderPDF({ data, companyInfo, config }: Props) {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };
  const show = (key: string) => cfg.fields?.[key] !== false;
  const perPage = Number(cfg.itemsPerPage) || 16;

  useEffect(() => {
    let active = true;
    generateQRCode({
      'Doc Type': 'PURCHASE ORDER', 'Number': data.poNumber,
      'Date': data.poDate ? new Date(data.poDate).toLocaleDateString() : '',
      'Supplier': data.supplierName, 'Total': `OMR ${Number(data.totalAmount || 0).toFixed(3)}`, 'Status': data.status,
    }).then((qr) => { if (active) { setQrCode(qr); setLoading(false); } });
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
  const chunks: any[][] = [];
  for (let i = 0; i < items.length; i += perPage) chunks.push(items.slice(i, i + perPage));
  if (chunks.length === 0) chunks.push([]);
  const totalPages = chunks.length;
  const pageIds = chunks.map((_, i) => `po-page-${i}`);

  const Header = ({ pageNo }: { pageNo: number }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottom: `3px solid ${C}`, paddingBottom: 10 }}>
        <div>
          {company.logoUrl && <img src={company.logoUrl} alt="logo" style={{ height: 40, objectFit: 'contain', marginBottom: 4, display: 'block' }} />}
          <div style={{ fontSize: 18, fontWeight: 700, color: company.primaryColor || C, marginBottom: 4 }}>{company.name}</div>
          <div style={{ fontSize: 9, color: '#666', lineHeight: 1.5 }}>
            {company.address}<br />
            {company.phone && `Tel: ${company.phone}`}{company.trn && ` | TRN: ${company.trn}`}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C, marginBottom: 4 }}>PURCHASE ORDER</div>
          <div style={{ fontSize: 10, color: '#666' }}>
            <strong>{data.poNumber}</strong><br />
            Date: {data.poDate ? new Date(data.poDate).toLocaleDateString() : '—'}<br />
            {show('expectedDate') && <>Expected: {data.expectedDate ? new Date(data.expectedDate).toLocaleDateString() : '—'}<br /></>}
            <span style={{ color: C, fontWeight: 700 }}>{data.status}</span>
          </div>
          {pageNo === 1 && qrCode && <img src={qrCode} alt="QR" style={{ width: 64, height: 64, marginTop: 4 }} />}
        </div>
      </div>
      {pageNo === 1 && cfg.headerNote && <div style={{ fontSize: 9, color: '#555', marginBottom: 8, padding: '6px 10px', background: '#fff7e6', borderRadius: 4 }}>{cfg.headerNote}</div>}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: 1 }}>Vendor / Supplier: </span>
        <span style={{ fontWeight: 600, fontSize: 11 }}>{data.supplierName}</span>
        {show('supplierTrn') && data.supplierTrn && <span style={{ color: '#666', fontSize: 9 }}>  ·  TRN: {data.supplierTrn}</span>}
        {pageNo === 1 && show('supplierAddress') && data.supplierAddress && <div style={{ color: '#666', fontSize: 9 }}>{data.supplierAddress}</div>}
      </div>
      {pageNo === 1 && data.subject && (
        <div style={{ background: '#fff7e6', padding: '6px 10px', borderRadius: 4, marginBottom: 8, fontSize: 10 }}><strong>Subject:</strong> {data.subject}</div>
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
          <th style={{ padding: '7px 10px', textAlign: 'right', fontSize: 9, width: 80 }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {chunk.map((item: any, i: number) => (
          <tr key={i} style={{ background: (startIndex + i) % 2 === 0 ? '#fff' : '#fffbe6', borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 10px', fontSize: 9 }}>{startIndex + i + 1}</td>
            <td style={{ padding: '6px 10px', fontSize: 9 }}>{item.description}</td>
            <td style={{ padding: '6px 10px', textAlign: 'center', fontSize: 9 }}>{item.unitOfMeasure}</td>
            <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 9 }}>{Number(item.quantity).toFixed(3)}</td>
            <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 9 }}>{Number(item.unitPrice).toFixed(3)}</td>
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
      {cfg.showSignature && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <div style={{ textAlign: 'center', width: 160 }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: 5, fontSize: 9 }}>Prepared By</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>{data.preparedByName || '________________'}</div>
          </div>
          <div style={{ textAlign: 'center', width: 160 }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: 5, fontSize: 9 }}>Approved By</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>{data.approvedByName || '________________'}</div>
          </div>
          <div style={{ textAlign: 'center', width: 160 }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: 5, fontSize: 9 }}>Supplier Acknowledgment</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>________________</div>
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
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadMultiPagePDF(pageIds, `${data.poNumber}.pdf`)}>Download PDF</Button>
      </Space>

      {chunks.map((chunk, p) => {
        const isLast = p === totalPages - 1;
        const startIndex = p * perPage;
        return (
          <div id={`po-page-${p}`} key={p} style={pageBoxStyle}>
            <Header pageNo={p + 1} />
            <div style={{ flex: 1 }}>
              <ItemsTable chunk={chunk} startIndex={startIndex} />
              {!isLast && <div style={{ textAlign: 'right', fontSize: 10, fontStyle: 'italic', color: '#888', marginTop: 8 }}>Continued on next page →</div>}
            </div>
            {isLast ? <TotalsBlock /> : null}
            <div style={{ borderTop: `2px solid ${C}`, paddingTop: 8, marginTop: 10, fontSize: 8, color: '#999', display: 'flex', justifyContent: 'space-between' }}>
              <div>{company.name}{company.trn ? ` | TRN: ${company.trn}` : ''}</div>
              <div>{cfg.footerNote || 'Computer-generated Purchase Order'}</div>
              <div>Page {p + 1} of {totalPages}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
