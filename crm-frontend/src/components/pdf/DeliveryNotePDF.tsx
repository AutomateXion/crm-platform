import React, { useEffect, useState } from 'react';
import { Button, Space, Spin } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { generateQRCode, downloadPDF, printDocument } from '../../utils/pdfGenerator';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { signaturesApi } from '../../services/salesApi';

interface Props { data: any; companyInfo?: any; config?: any; }

const DEFAULT_CONFIG = {
  termsText: '',
  headerNote: '',
  footerNote: '',
  fields: {} as Record<string, boolean>,
  itemsPerPage: 15,
  showSignature: true,
};

export default function DeliveryNotePDF({ data, companyInfo, config }: Props) {
  const { settings: companySettings } = useCompanySettings();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState<any>(null);

  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };
  const show = (key: string) => cfg.fields?.[key] !== false; // visible unless explicitly false

  useEffect(() => {
    let active = true;
    const tasks: Promise<any>[] = [
      generateQRCode({
        'Doc Type': 'DELIVERY NOTE',
        'Number': data.dnNumber,
        'Date': data.dnDate ? new Date(data.dnDate).toLocaleDateString() : '',
        'Delivery Date': data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString() : '',
        'Customer': data.customerName,
        'Items': (data.items || []).length,
        'Status': data.status,
      }).then((qr) => { if (active) setQrCode(qr); }),
    ];
    // Fetch captured signature for this DN (if any)
    if (data.dnId) {
      tasks.push(
        signaturesApi.getOne('DN', data.dnId)
          .then((r: any) => { if (active) setSignature((r.data && r.data[0]) || null); })
          .catch(() => {}),
      );
    }
    Promise.allSettled(tasks).then(() => { if (active) setLoading(false); });
    return () => { active = false; };
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
        <Button icon={<PrinterOutlined />} onClick={() => printDocument('dn-pdf-content')}>Print</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('dn-pdf-content', `${data.dnNumber}.pdf`)}>Download PDF</Button>
      </Space>
      <div id="dn-pdf-content" style={{ width: '210mm', minHeight: '297mm', background: '#fff', padding: '15mm', fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#333', margin: '0 auto', border: '1px solid #e0e0e0' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '3px solid #13c2c2', paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#13c2c2', marginBottom: 4 }}>{company.name}</div>
            <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>
              {company.address}<br />
              {company.phone && `Tel: ${company.phone}`}
              {show('customerTrn') && company.trn && <><br />TRN: {company.trn}</>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#13c2c2', marginBottom: 4 }}>DELIVERY NOTE</div>
            <div style={{ fontSize: 11, color: '#666' }}>
              <strong>{data.dnNumber}</strong><br />
              DN Date: {data.dnDate ? new Date(data.dnDate).toLocaleDateString() : '—'}
              {show('deliveryDate') && <><br />Delivery Date: {data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString() : '—'}</>}
            </div>
          </div>
        </div>

        {/* Header note from config */}
        {cfg.headerNote && <div style={{ fontSize: 10, color: '#555', marginBottom: 16, padding: '8px 12px', background: '#f0fafa', borderRadius: 4 }}>{cfg.headerNote}</div>}

        {/* Deliver To + QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#13c2c2', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Deliver To</div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{data.customerName}</div>
            {show('customerTrn') && data.customerTrn && <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>TRN: {data.customerTrn}</div>}
            {show('deliveryAddress') && data.deliveryAddress && <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{data.deliveryAddress}</div>}
            {show('customerAddress') && data.customerAddress && <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{data.customerAddress}</div>}
            {show('salesman') && data.salesmanName && <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>Salesman: {data.salesmanName}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            {qrCode && <img src={qrCode} alt="QR" style={{ width: 90, height: 90 }} />}
            <div style={{ fontSize: 9, color: '#999', marginTop: 4 }}>Scan to verify</div>
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#13c2c2', color: '#fff' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, width: 30 }}>#</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10 }}>Description</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 10, width: 60 }}>UOM</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, width: 80 }}>Quantity</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, width: 100 }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map((item: any, i: number) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '7px 10px', fontSize: 10 }}>{i + 1}</td>
                <td style={{ padding: '7px 10px', fontSize: 10 }}>{item.description}</td>
                <td style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10 }}>{item.unitOfMeasure}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10, fontWeight: 600 }}>{Number(item.quantity).toFixed(3)}</td>
                <td style={{ padding: '7px 10px', fontSize: 10, color: '#666' }}>{item.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes */}
        {show('notes') && data.notes && <div style={{ fontSize: 10, color: '#666', marginBottom: 16 }}><strong>Notes:</strong> {data.notes}</div>}

        {/* Terms & Conditions from config */}
        {cfg.termsText && (
          <div style={{ fontSize: 9, color: '#666', marginBottom: 16, padding: '10px 12px', background: '#fafafa', borderRadius: 4, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: '#13c2c2', marginBottom: 4, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Terms &amp; Conditions</div>
            {cfg.termsText}
          </div>
        )}

        {/* Footer line */}
        <div style={{ borderTop: '2px solid #13c2c2', paddingTop: 12, marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#999' }}>
          <div>{company.name}</div>
          <div>{cfg.footerNote || 'This is a computer-generated Delivery Note'}</div>
          <div>Page 1 of 1</div>
        </div>

        {/* Signature row */}
        {cfg.showSignature && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
            <div style={{ textAlign: 'center', width: 180 }}>
              <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Prepared By</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{data.preparedByName || '________________'}</div>
            </div>
            <div style={{ textAlign: 'center', width: 180 }}>
              <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Delivered By</div>
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
                  <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontSize: 10 }}>Received By (Customer)</div>
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
