import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Input, Table, Tag, Space, Modal, Alert, Statistic } from 'antd';
import { SearchOutlined, FilePdfOutlined, DownloadOutlined, PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import salesApi from '../../../services/salesApi';
import ExportButton from '../../../components/common/ExportButton';
import { downloadPDF, printDocument } from '../../../utils/pdfGenerator';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

const { Title, Text } = Typography;

export default function BankReconciliationPage() {
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
    try {
      const r = await salesApi.get('/sales/bank-reconciliation', { params: { fromDate: fromDate||undefined, toDate: toDate||undefined } });
      setData(r.data); setSearched(true);
    } catch {} finally { setLoading(false); }
  };

  const receiptCols = [
    { title:'Receipt #', dataIndex:'receiptNumber', render:(v:string) => <Tag color="green">{v}</Tag> },
    { title:'Date', dataIndex:'receiptDate', render:(v:string) => v?dayjs(v).format('DD/MM/YYYY'):'—' },
    { title:'Customer', dataIndex:'customerName', render:(v:string) => <Text strong>{v}</Text> },
    { title:'Method', dataIndex:'paymentMethod', render:(v:string) => <Tag>{v}</Tag> },
    { title:'Amount (OMR)', dataIndex:'amount', align:'right' as const, render:(v:number) => <Text strong style={{color:'#52c41a'}}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  const paymentCols = [
    { title:'Voucher #', dataIndex:'voucherNumber', render:(v:string) => <Tag color="orange">{v}</Tag> },
    { title:'Date', dataIndex:'voucherDate', render:(v:string) => v?dayjs(v).format('DD/MM/YYYY'):'—' },
    { title:'Supplier', dataIndex:'supplierName', render:(v:string) => <Text strong>{v}</Text> },
    { title:'Method', dataIndex:'paymentMethod', render:(v:string) => <Tag>{v}</Tag> },
    { title:'Amount (OMR)', dataIndex:'amount', align:'right' as const, render:(v:number) => <Text strong style={{color:'#ff4d4f'}}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  const { settings: company } = useCompanySettings();

  const PDFContent = () => (
    <div id="bank-recon-pdf" style={{ width:'210mm', background:'#fff', padding:'12mm 15mm', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#333' }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #13c2c2', paddingBottom:14, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#13c2c2' }}>{company?.companyName || 'My Company'}</div>
          <div style={{ fontSize:10, color:'#666' }}>{[company?.addressLine1, company?.city, company?.country].filter(Boolean).join(', ') || 'Muscat, Sultanate of Oman'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#13c2c2' }}>BANK RECONCILIATION</div>
          <div style={{ fontSize:10, color:'#888' }}>{fromDate} to {toDate}</div>
          <div style={{ fontSize:9, color:'#aaa' }}>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</div>
        </div>
      </div>
      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
        {[
          { label:'Opening Balance', value:`OMR ${Number(data?.openingBalance||0).toFixed(3)}`, color:'#1890ff' },
          { label:'Total Receipts', value:`OMR ${Number(data?.totalReceipts||0).toFixed(3)}`, color:'#52c41a' },
          { label:'Total Payments', value:`OMR ${Number(data?.totalPayments||0).toFixed(3)}`, color:'#ff4d4f' },
          { label:'Closing Balance', value:`OMR ${Number((data?.openingBalance||0)+(data?.totalReceipts||0)-(data?.totalPayments||0)).toFixed(3)}`, color:'#13c2c2' },
        ].map((k,i) => (
          <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}40`, borderRadius:6, padding:'8px', textAlign:'center' }}>
            <div style={{ fontSize:13, fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:9, color:'#666', marginTop:2 }}>{k.label}</div>
          </div>
        ))}
      </div>
      {/* Receipts */}
      <div style={{ background:'#52c41a15', borderLeft:'4px solid #52c41a', padding:'6px 10px', fontWeight:700, color:'#52c41a', marginBottom:8, fontSize:11 }}>RECEIPTS (CASH IN)</div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9, marginBottom:14 }}>
        <thead><tr style={{ background:'#52c41a', color:'#fff' }}>
          {['Receipt #','Date','Customer','Method','Amount (OMR)'].map(h=><th key={h} style={{ padding:'6px 8px', textAlign:'left' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {(data?.receipts||[]).map((row:any,i:number) => (
            <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
              <td style={{ padding:'5px 8px', color:'#52c41a' }}>{row.receiptNumber}</td>
              <td style={{ padding:'5px 8px' }}>{row.receiptDate?dayjs(row.receiptDate).format('DD/MM/YY'):'—'}</td>
              <td style={{ padding:'5px 8px', fontWeight:600 }}>{row.customerName}</td>
              <td style={{ padding:'5px 8px' }}>{row.paymentMethod||'—'}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#52c41a', fontWeight:700 }}>OMR {Number(row.amount||0).toFixed(3)}</td>
            </tr>
          ))}
          <tr style={{ background:'#52c41a', color:'#fff', fontWeight:700 }}>
            <td colSpan={4} style={{ padding:'7px 8px', textAlign:'right' }}>Total Receipts</td>
            <td style={{ padding:'7px 8px', textAlign:'right' }}>OMR {Number(data?.totalReceipts||0).toFixed(3)}</td>
          </tr>
        </tbody>
      </table>
      {/* Payments */}
      <div style={{ background:'#ff4d4f15', borderLeft:'4px solid #ff4d4f', padding:'6px 10px', fontWeight:700, color:'#ff4d4f', marginBottom:8, fontSize:11 }}>PAYMENTS (CASH OUT)</div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9, marginBottom:14 }}>
        <thead><tr style={{ background:'#ff4d4f', color:'#fff' }}>
          {['Voucher #','Date','Supplier','Method','Amount (OMR)'].map(h=><th key={h} style={{ padding:'6px 8px', textAlign:'left' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {(data?.paymentVouchers||[]).map((row:any,i:number) => (
            <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
              <td style={{ padding:'5px 8px', color:'#ff4d4f' }}>{row.voucherNumber}</td>
              <td style={{ padding:'5px 8px' }}>{row.voucherDate?dayjs(row.voucherDate).format('DD/MM/YY'):'—'}</td>
              <td style={{ padding:'5px 8px', fontWeight:600 }}>{row.supplierName}</td>
              <td style={{ padding:'5px 8px' }}>{row.paymentMethod||'—'}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#ff4d4f', fontWeight:700 }}>OMR {Number(row.amount||0).toFixed(3)}</td>
            </tr>
          ))}
          <tr style={{ background:'#ff4d4f', color:'#fff', fontWeight:700 }}>
            <td colSpan={4} style={{ padding:'7px 8px', textAlign:'right' }}>Total Payments</td>
            <td style={{ padding:'7px 8px', textAlign:'right' }}>OMR {Number(data?.totalPayments||0).toFixed(3)}</td>
          </tr>
        </tbody>
      </table>
      {/* Net */}
      <div style={{ background:'#e6f7ff', border:'2px solid #13c2c2', borderRadius:8, padding:'10px 16px', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:14, fontWeight:800 }}>CLOSING BALANCE</span>
        <span style={{ fontSize:18, fontWeight:800, color:'#13c2c2' }}>OMR {Number((data?.openingBalance||0)+(data?.totalReceipts||0)-(data?.totalPayments||0)).toFixed(3)}</span>
      </div>
      <div style={{ marginTop:16, paddingTop:10, borderTop:'1px solid #e0e0e0', fontSize:8, color:'#aaa', display:'flex', justifyContent:'space-between' }}>
        <span>All amounts in Omani Riyal (OMR)</span><span>Confidential</span><span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
      </div>
    </div>
  );

  const closingBalance = (data?.openingBalance||0) + (data?.totalReceipts||0) - (data?.totalPayments||0);

  return (
    <div id="bank-reconciliation-report">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div><Title level={4} style={{ margin:0 }}>Bank Reconciliation</Title><Text type="secondary">Reconcile bank receipts and payments</Text></div>
      </div>
      <Card style={{ borderRadius:12, marginBottom:16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={5}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>From Date</Text><Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></Col>
          <Col span={5}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>To Date</Text><Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button type="primary" icon={<SearchOutlined />} onClick={load} loading={loading} block>Generate</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(true)} disabled={!data} block>View PDF</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><ExportButton config={{ filename:'bank-reconciliation', data: [...(data?.receipts||[]), ...(data?.paymentVouchers||[])] }} /></Col>
        </Row>
      </Card>
      {searched && data && (
        <>
          <Row gutter={12} style={{ marginBottom:16 }}>
            {[
              { label:'Opening Balance', value:Number(data.openingBalance||0).toFixed(3), color:'#1890ff' },
              { label:'Total Receipts', value:Number(data.totalReceipts||0).toFixed(3), color:'#52c41a' },
              { label:'Total Payments', value:Number(data.totalPayments||0).toFixed(3), color:'#ff4d4f' },
              { label:'Closing Balance', value:Number(closingBalance).toFixed(3), color:'#13c2c2' },
            ].map((k,i) => (
              <Col span={6} key={i}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${k.color}`, textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:700, color:k.color }}>OMR {k.value}</div>
                <div style={{ fontSize:11, color:'#8c8c8c' }}>{k.label}</div>
              </Card></Col>
            ))}
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Card title="💰 Receipts (Cash In)" style={{ borderRadius:12 }} size="small">
                <Table dataSource={data.receipts||[]} columns={receiptCols} rowKey="receiptId" size="small" pagination={{ pageSize:10 }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="💸 Payments (Cash Out)" style={{ borderRadius:12 }} size="small">
                <Table dataSource={data.paymentVouchers||[]} columns={paymentCols} rowKey="voucherId" size="small" pagination={{ pageSize:10 }} />
              </Card>
            </Col>
          </Row>
        </>
      )}
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top:0, padding:0, maxWidth:'100vw' }} styles={{ body:{ height:'95vh', overflow:'auto', padding:16, background:'#f5f5f5' } }} title="Bank Reconciliation — PDF Preview">
        <Space style={{ marginBottom:16 }}>
          <Button icon={<PrinterOutlined />} onClick={() => printDocument('bank-recon-pdf')}>Print</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('bank-recon-pdf', `bank-reconciliation-${fromDate}.pdf`)}>Download PDF</Button>
        </Space>
        <PDFContent />
      </Modal>
    </div>
  );
}
