import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Input, Table, Tag, Space, Modal, Divider, Alert } from 'antd';
import { SearchOutlined, FilePdfOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import salesApi from '../../../services/salesApi';
import ExportButton from '../../../components/common/ExportButton';
import { downloadPDF, printDocument } from '../../../utils/pdfGenerator';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

const { Title, Text } = Typography;

export default function VATReturnPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searched, setSearched] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    const now = new Date();
    setFromDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10));
    setToDate(now.toISOString().slice(0,10));
  }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/vat-return', { params: { fromDate: fromDate||undefined, toDate: toDate||undefined } }); setData(r.data); setSearched(true); }
    catch {} finally { setLoading(false); }
  };

  const { settings: company } = useCompanySettings();

  const PDFContent = () => (
    <div id="vat-return-pdf" style={{ width:'210mm', background:'#fff', padding:'12mm 15mm', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#333' }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #1890ff', paddingBottom:14, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#1890ff' }}>{company?.companyName || 'My Company'}</div>
          <div style={{ fontSize:10, color:'#666' }}>{[company?.addressLine1, company?.city, company?.country].filter(Boolean).join(', ') || 'Muscat, Sultanate of Oman'}</div>
          {data?.companyTrn && <div style={{ fontSize:10, color:'#666' }}>VAT TRN: {data.companyTrn}</div>}
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#1890ff' }}>VAT RETURN</div>
          <div style={{ fontSize:10, color:'#888' }}>{fromDate} to {toDate}</div>
          <div style={{ fontSize:9, color:'#aaa' }}>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</div>
        </div>
      </div>
      {/* VAT Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Output VAT (Sales)', value:`OMR ${Number(data?.outputVat||0).toFixed(3)}`, color:'#ff4d4f' },
          { label:'Input VAT (Purchases)', value:`OMR ${Number(data?.inputVat||0).toFixed(3)}`, color:'#52c41a' },
          { label:'Net VAT Payable', value:`OMR ${Number(data?.netVat||0).toFixed(3)}`, color:'#1890ff' },
        ].map((k,i) => (
          <div key={i} style={{ background:`${k.color}10`, border:`2px solid ${k.color}40`, borderRadius:8, padding:'12px 14px', textAlign:'center' }}>
            <div style={{ fontSize:16, fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:10, color:'#666', marginTop:4 }}>{k.label}</div>
          </div>
        ))}
      </div>
      {/* Sales Section */}
      <div style={{ background:'#ff4d4f15', borderLeft:'4px solid #ff4d4f', padding:'6px 10px', fontWeight:700, fontSize:11, color:'#ff4d4f', marginBottom:8 }}>OUTPUT TAX (SALES)</div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9, marginBottom:16 }}>
        <thead><tr style={{ background:'#ff4d4f', color:'#fff' }}>
          {['Invoice #','Date','Customer','TRN','Taxable Amount (OMR)','VAT Amount (OMR)'].map(h=><th key={h} style={{ padding:'6px 8px', textAlign:'left' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {(data?.salesInvoices||[]).map((row:any,i:number) => (
            <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
              <td style={{ padding:'5px 8px', color:'#1890ff' }}>{row.invoiceNumber}</td>
              <td style={{ padding:'5px 8px' }}>{row.invoiceDate?dayjs(row.invoiceDate).format('DD/MM/YY'):'—'}</td>
              <td style={{ padding:'5px 8px' }}>{row.customerName}</td>
              <td style={{ padding:'5px 8px', color:'#8c8c8c' }}>{row.customerTrn||'—'}</td>
              <td style={{ padding:'5px 8px', textAlign:'right' }}>OMR {Number(row.subtotal||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#ff4d4f', fontWeight:600 }}>OMR {Number(row.vatAmount||0).toFixed(3)}</td>
            </tr>
          ))}
          <tr style={{ background:'#ff4d4f', color:'#fff', fontWeight:700 }}>
            <td colSpan={4} style={{ padding:'7px 8px', textAlign:'right' }}>Total Output VAT</td>
            <td style={{ padding:'7px 8px', textAlign:'right' }}>OMR {Number(data?.totalSales||0).toFixed(3)}</td>
            <td style={{ padding:'7px 8px', textAlign:'right', fontSize:11 }}>OMR {Number(data?.outputVat||0).toFixed(3)}</td>
          </tr>
        </tbody>
      </table>
      {/* Purchases Section */}
      <div style={{ background:'#52c41a15', borderLeft:'4px solid #52c41a', padding:'6px 10px', fontWeight:700, fontSize:11, color:'#52c41a', marginBottom:8 }}>INPUT TAX (PURCHASES)</div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9, marginBottom:16 }}>
        <thead><tr style={{ background:'#52c41a', color:'#fff' }}>
          {['Invoice #','Date','Supplier','TRN','Taxable Amount (OMR)','VAT Amount (OMR)'].map(h=><th key={h} style={{ padding:'6px 8px', textAlign:'left' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {(data?.purchaseInvoices||[]).map((row:any,i:number) => (
            <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
              <td style={{ padding:'5px 8px', color:'#2E6DA4' }}>{row.invoiceNumber}</td>
              <td style={{ padding:'5px 8px' }}>{row.invoiceDate?dayjs(row.invoiceDate).format('DD/MM/YY'):'—'}</td>
              <td style={{ padding:'5px 8px' }}>{row.supplierName}</td>
              <td style={{ padding:'5px 8px', color:'#8c8c8c' }}>{row.supplierTrn||'—'}</td>
              <td style={{ padding:'5px 8px', textAlign:'right' }}>OMR {Number(row.subtotal||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#52c41a', fontWeight:600 }}>OMR {Number(row.vatAmount||0).toFixed(3)}</td>
            </tr>
          ))}
          <tr style={{ background:'#52c41a', color:'#fff', fontWeight:700 }}>
            <td colSpan={4} style={{ padding:'7px 8px', textAlign:'right' }}>Total Input VAT</td>
            <td style={{ padding:'7px 8px', textAlign:'right' }}>OMR {Number(data?.totalPurchases||0).toFixed(3)}</td>
            <td style={{ padding:'7px 8px', textAlign:'right', fontSize:11 }}>OMR {Number(data?.inputVat||0).toFixed(3)}</td>
          </tr>
        </tbody>
      </table>
      {/* Net */}
      <div style={{ background:Number(data?.netVat||0)>=0?'#fff2f0':'#f6ffed', border:`2px solid ${Number(data?.netVat||0)>=0?'#ff4d4f':'#52c41a'}`, borderRadius:8, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:15, fontWeight:800 }}>NET VAT {Number(data?.netVat||0)>=0?'PAYABLE':'REFUNDABLE'}</span>
        <span style={{ fontSize:20, fontWeight:800, color:Number(data?.netVat||0)>=0?'#ff4d4f':'#52c41a' }}>OMR {Math.abs(Number(data?.netVat||0)).toFixed(3)}</span>
      </div>
      <div style={{ marginTop:16, paddingTop:10, borderTop:'1px solid #e0e0e0', fontSize:8, color:'#aaa', display:'flex', justifyContent:'space-between' }}>
        <span>All amounts in Omani Riyal (OMR) — VAT Rate: 5%</span><span>Confidential</span><span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
      </div>
    </div>
  );

  return (
    <div id="vat-return-report">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div><Title level={4} style={{ margin:0 }}>VAT Return</Title><Text type="secondary">Output and input VAT for the selected period</Text></div>
      </div>
      <Card style={{ borderRadius:12, marginBottom:16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={5}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>From Date</Text><Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></Col>
          <Col span={5}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>To Date</Text><Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button type="primary" icon={<SearchOutlined />} onClick={load} loading={loading} block>Generate</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(true)} disabled={!data} block>View PDF</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><ExportButton config={{ filename:'vat-return', data: [...(data?.salesInvoices||[]), ...(data?.purchaseInvoices||[])] }} /></Col>
        </Row>
      </Card>
      {searched && data && (
        <>
          <Row gutter={12} style={{ marginBottom:16 }}>
            {[
              { label:'Output VAT (Sales)', value:data.outputVat||0, color:'#ff4d4f' },
              { label:'Input VAT (Purchases)', value:data.inputVat||0, color:'#52c41a' },
              { label:'Net VAT Payable', value:data.netVat||0, color:'#1890ff' },
              { label:'Total Sales', value:data.totalSales||0, color:'#fa8c16' },
            ].map((k,i) => (
              <Col span={6} key={i}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${k.color}`, textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:700, color:k.color }}>OMR {Number(k.value).toFixed(3)}</div>
                <div style={{ fontSize:11, color:'#8c8c8c' }}>{k.label}</div>
              </Card></Col>
            ))}
          </Row>
          {Number(data.netVat||0) >= 0
            ? <Alert type="warning" message={`VAT Payable: OMR ${Number(data.netVat||0).toFixed(3)}`} showIcon style={{ marginBottom:16, borderRadius:12 }} />
            : <Alert type="success" message={`VAT Refundable: OMR ${Math.abs(Number(data.netVat||0)).toFixed(3)}`} showIcon style={{ marginBottom:16, borderRadius:12 }} />}
        </>
      )}
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top:0, padding:0, maxWidth:'100vw' }} styles={{ body:{ height:'95vh', overflow:'auto', padding:16, background:'#f5f5f5' } }} title="VAT Return — PDF Preview">
        <Space style={{ marginBottom:16 }}>
          <Button icon={<PrinterOutlined />} onClick={() => printDocument('vat-return-pdf')}>Print</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('vat-return-pdf', `vat-return-${fromDate}-${toDate}.pdf`)}>Download PDF</Button>
        </Space>
        <PDFContent />
      </Modal>
    </div>
  );
}
