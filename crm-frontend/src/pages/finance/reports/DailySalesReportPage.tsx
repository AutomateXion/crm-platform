import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Input, Table, Tag, Space, Modal, Statistic } from 'antd';
import { SearchOutlined, FilePdfOutlined, DownloadOutlined, PrinterOutlined, CalendarOutlined } from '@ant-design/icons';
import salesApi from '../../../services/salesApi';
import ExportButton from '../../../components/common/ExportButton';
import { downloadPDF, printDocument } from '../../../utils/pdfGenerator';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

const { Title, Text } = Typography;

export default function DailySalesReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [searched, setSearched] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => { setDate(new Date().toISOString().slice(0,10)); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/daily-report', { params: { date: date||undefined } }); setData(r.data); setSearched(true); }
    catch {} finally { setLoading(false); }
  };

  const invoiceCols = [
    { title:'Invoice #', dataIndex:'invoiceNumber', render:(v:string) => <Tag color="blue">{v}</Tag> },
    { title:'Customer', dataIndex:'customerName', render:(v:string) => <Text strong>{v}</Text> },
    { title:'Time', dataIndex:'invoiceDate', render:(v:string) => v?dayjs(v).format('HH:mm'):'—' },
    { title:'Items', dataIndex:'itemCount', align:'center' as const },
    { title:'Subtotal', dataIndex:'subtotal', align:'right' as const, render:(v:number) => `OMR ${Number(v).toFixed(3)}` },
    { title:'VAT', dataIndex:'vatAmount', align:'right' as const, render:(v:number) => <Text style={{color:'#fa8c16'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Total', dataIndex:'totalAmount', align:'right' as const, render:(v:number) => <Text strong style={{color:'#52c41a'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Status', dataIndex:'status', render:(v:string) => <Tag color={v==='PAID'?'green':v==='PARTIALLY_PAID'?'orange':'blue'}>{v}</Tag> },
  ];

  const { settings: company } = useCompanySettings();

  const PDFContent = () => (
    <div id="daily-sales-pdf" style={{ width:'210mm', background:'#fff', padding:'12mm 15mm', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#333' }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #52c41a', paddingBottom:14, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#52c41a' }}>{company?.companyName || 'My Company'}</div>
          <div style={{ fontSize:10, color:'#666' }}>{[company?.addressLine1, company?.city, company?.country].filter(Boolean).join(', ') || 'Muscat, Sultanate of Oman'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#52c41a' }}>DAILY SALES REPORT</div>
          <div style={{ fontSize:12, color:'#888', fontWeight:600 }}>{dayjs(date).format('DD MMMM YYYY')}</div>
          <div style={{ fontSize:9, color:'#aaa' }}>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
        {[
          { label:'Total Invoices', value:data?.invoiceCount||0, fmt:false, color:'#1890ff' },
          { label:'Total Sales', value:data?.totalSales||0, fmt:true, color:'#52c41a' },
          { label:'Total VAT', value:data?.totalVat||0, fmt:true, color:'#fa8c16' },
          { label:'Total Receipts', value:data?.totalReceipts||0, fmt:true, color:'#13c2c2' },
        ].map((k,i) => (
          <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}40`, borderRadius:6, padding:'8px', textAlign:'center' }}>
            <div style={{ fontSize:16, fontWeight:700, color:k.color }}>{k.fmt?`OMR ${Number(k.value).toFixed(3)}`:k.value}</div>
            <div style={{ fontSize:9, color:'#666', marginTop:2 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9 }}>
        <thead>
          <tr style={{ background:'#52c41a', color:'#fff' }}>
            {['Invoice #','Customer','Time','Items','Subtotal (OMR)','VAT (OMR)','Total (OMR)','Status'].map(h=>(
              <th key={h} style={{ padding:'7px 8px', textAlign:'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data?.invoices||[]).map((row:any,i:number) => (
            <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
              <td style={{ padding:'5px 8px', color:'#1890ff' }}>{row.invoiceNumber}</td>
              <td style={{ padding:'5px 8px', fontWeight:600 }}>{row.customerName}</td>
              <td style={{ padding:'5px 8px' }}>{row.invoiceDate?dayjs(row.invoiceDate).format('HH:mm'):'—'}</td>
              <td style={{ padding:'5px 8px', textAlign:'center' }}>{row.itemCount||0}</td>
              <td style={{ padding:'5px 8px', textAlign:'right' }}>OMR {Number(row.subtotal||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#fa8c16' }}>OMR {Number(row.vatAmount||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#52c41a', fontWeight:700 }}>OMR {Number(row.totalAmount||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px' }}><span style={{ background:row.status==='PAID'?'#f6ffed':'#fff7e6', color:row.status==='PAID'?'#52c41a':'#fa8c16', padding:'2px 6px', borderRadius:3, fontSize:8 }}>{row.status}</span></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background:'#52c41a', color:'#fff', fontWeight:700 }}>
            <td colSpan={4} style={{ padding:'8px', textAlign:'right', fontSize:11 }}>TOTAL</td>
            <td style={{ padding:'8px', textAlign:'right' }}>—</td>
            <td style={{ padding:'8px', textAlign:'right' }}>OMR {Number(data?.totalVat||0).toFixed(3)}</td>
            <td style={{ padding:'8px', textAlign:'right', fontSize:13 }}>OMR {Number(data?.totalSales||0).toFixed(3)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <div style={{ marginTop:16, paddingTop:10, borderTop:'1px solid #e0e0e0', fontSize:8, color:'#aaa', display:'flex', justifyContent:'space-between' }}>
        <span>All amounts in Omani Riyal (OMR)</span><span>Confidential</span><span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
      </div>
    </div>
  );

  return (
    <div id="daily-sales-report">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div><Title level={4} style={{ margin:0 }}>Daily Sales Report</Title><Text type="secondary">All sales transactions for a specific date</Text></div>
      </div>
      <Card style={{ borderRadius:12, marginBottom:16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={6}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>Date</Text><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button type="primary" icon={<SearchOutlined />} onClick={load} loading={loading} block>Generate</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(true)} disabled={!data} block>View PDF</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><ExportButton config={{ filename:'daily-sales', data: data?.invoices||[] }} /></Col>
        </Row>
      </Card>
      {searched && data && (
        <>
          <Row gutter={12} style={{ marginBottom:16 }}>
            {[
              { label:'Total Invoices', value:data.invoiceCount||0, prefix:'', color:'#1890ff' },
              { label:'Total Sales', value:Number(data.totalSales||0).toFixed(3), prefix:'OMR ', color:'#52c41a' },
              { label:'Total VAT', value:Number(data.totalVat||0).toFixed(3), prefix:'OMR ', color:'#fa8c16' },
              { label:'Total Receipts', value:Number(data.totalReceipts||0).toFixed(3), prefix:'OMR ', color:'#13c2c2' },
            ].map((k,i) => (
              <Col span={6} key={i}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${k.color}`, textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:700, color:k.color }}>{k.prefix}{k.value}</div>
                <div style={{ fontSize:11, color:'#8c8c8c' }}>{k.label}</div>
              </Card></Col>
            ))}
          </Row>
          <Card style={{ borderRadius:12 }}>
            <Table dataSource={data.invoices||[]} columns={invoiceCols} rowKey="invoiceId" size="small" pagination={{ pageSize:20 }} />
          </Card>
        </>
      )}
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top:0, padding:0, maxWidth:'100vw' }} styles={{ body:{ height:'95vh', overflow:'auto', padding:16, background:'#f5f5f5' } }} title="Daily Sales Report — PDF Preview">
        <Space style={{ marginBottom:16 }}>
          <Button icon={<PrinterOutlined />} onClick={() => printDocument('daily-sales-pdf')}>Print</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('daily-sales-pdf', `daily-sales-${date}.pdf`)}>Download PDF</Button>
        </Space>
        <PDFContent />
      </Modal>
    </div>
  );
}
