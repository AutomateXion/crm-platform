import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Input, Table, Tag, Space, Modal } from 'antd';
import { SearchOutlined, FilePdfOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import salesApi from '../../../services/salesApi';
import ExportButton from '../../../components/common/ExportButton';
import { downloadPDF, printDocument } from '../../../utils/pdfGenerator';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

const { Title, Text } = Typography;
const BUCKET_COLOR: Record<string,string> = { current:'#52c41a', days1_30:'#1890ff', days31_60:'#fa8c16', days61_90:'#ff7a45', days91plus:'#ff4d4f' };
const BUCKET_LABELS: Record<string,string> = { current:'Current', days1_30:'1-30 Days', days31_60:'31-60 Days', days61_90:'61-90 Days', days91plus:'90+ Days' };

export default function APAgingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [asOfDate, setAsOfDate] = useState('');
  const [searched, setSearched] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => { setAsOfDate(new Date().toISOString().slice(0,10)); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/ap-aging', { params: { asOfDate: asOfDate||undefined } }); setData(r.data); setSearched(true); }
    catch {} finally { setLoading(false); }
  };

  const columns = [
    { title:'Supplier', dataIndex:'supplierName', render:(v:string) => <Text strong>{v}</Text> },
    { title:'Invoice #', dataIndex:'invoiceNumber', render:(v:string) => <Tag color="purple">{v}</Tag> },
    { title:'Invoice Date', dataIndex:'invoiceDate', render:(v:string) => v?dayjs(v).format('DD/MM/YYYY'):'—' },
    { title:'Due Date', dataIndex:'dueDate', render:(v:string) => v?dayjs(v).format('DD/MM/YYYY'):'—' },
    { title:'Age', dataIndex:'daysOverdue', render:(v:number) => <Tag color={v<=0?'green':v<=30?'blue':v<=60?'orange':'red'}>{v<=0?'Current':`${v} days`}</Tag> },
    { title:'Total (OMR)', dataIndex:'totalAmount', align:'right' as const, render:(v:number) => `OMR ${Number(v).toFixed(3)}` },
    { title:'Paid (OMR)', dataIndex:'paidAmount', align:'right' as const, render:(v:number) => <Text style={{color:'#52c41a'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Balance (OMR)', dataIndex:'balanceDue', align:'right' as const, render:(v:number) => <Text strong style={{color:'#722ed1'}}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  const { settings: company } = useCompanySettings();

  const PDFContent = () => (
    <div id="ap-aging-pdf" style={{ width:'210mm', background:'#fff', padding:'12mm 15mm', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#333' }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #722ed1', paddingBottom:14, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#722ed1' }}>{company?.companyName || 'My Company'}</div>
          <div style={{ fontSize:10, color:'#666' }}>{[company?.addressLine1, company?.city, company?.country].filter(Boolean).join(', ') || 'Muscat, Sultanate of Oman'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#722ed1' }}>AP AGING REPORT</div>
          <div style={{ fontSize:10, color:'#888' }}>As of: {asOfDate}</div>
          <div style={{ fontSize:9, color:'#aaa' }}>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:16 }}>
        {Object.entries(BUCKET_LABELS).map(([key, label]) => (
          <div key={key} style={{ background:`${BUCKET_COLOR[key]}10`, border:`1px solid ${BUCKET_COLOR[key]}40`, borderRadius:6, padding:'8px 10px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:BUCKET_COLOR[key] }}>OMR {Number(data?.summary?.[key]||0).toFixed(3)}</div>
            <div style={{ fontSize:9, color:'#666', marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9 }}>
        <thead>
          <tr style={{ background:'#722ed1', color:'#fff' }}>
            {['Supplier','Invoice #','Invoice Date','Due Date','Age','Total (OMR)','Paid (OMR)','Balance (OMR)'].map(h => (
              <th key={h} style={{ padding:'7px 8px', textAlign:'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data?.invoices||[]).map((row:any, i:number) => (
            <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
              <td style={{ padding:'5px 8px', fontWeight:600 }}>{row.supplierName}</td>
              <td style={{ padding:'5px 8px', color:'#722ed1' }}>{row.invoiceNumber}</td>
              <td style={{ padding:'5px 8px' }}>{row.invoiceDate?dayjs(row.invoiceDate).format('DD/MM/YYYY'):'—'}</td>
              <td style={{ padding:'5px 8px' }}>{row.dueDate?dayjs(row.dueDate).format('DD/MM/YYYY'):'—'}</td>
              <td style={{ padding:'5px 8px', color:row.daysOverdue<=0?'#52c41a':'#ff4d4f', fontWeight:600 }}>{row.daysOverdue<=0?'Current':`${row.daysOverdue}d`}</td>
              <td style={{ padding:'5px 8px', textAlign:'right' }}>OMR {Number(row.totalAmount||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#52c41a' }}>OMR {Number(row.paidAmount||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#722ed1', fontWeight:700 }}>OMR {Number(row.balanceDue||0).toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background:'#722ed1', color:'#fff', fontWeight:700 }}>
            <td colSpan={7} style={{ padding:'8px', textAlign:'right', fontSize:11 }}>TOTAL PAYABLE</td>
            <td style={{ padding:'8px', textAlign:'right', fontSize:13 }}>OMR {Number(data?.totalOutstanding||0).toFixed(3)}</td>
          </tr>
        </tfoot>
      </table>
      <div style={{ marginTop:20, paddingTop:10, borderTop:'1px solid #e0e0e0', fontSize:8, color:'#aaa', display:'flex', justifyContent:'space-between' }}>
        <span>All amounts in Omani Riyal (OMR)</span><span>Confidential</span><span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
      </div>
    </div>
  );

  return (
    <div id="ap-aging-report">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div><Title level={4} style={{ margin:0 }}>Accounts Payable Aging</Title><Text type="secondary">Outstanding supplier invoices by age</Text></div>
      </div>
      <Card style={{ borderRadius:12, marginBottom:16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={6}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>As of Date</Text><Input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} /></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button type="primary" icon={<SearchOutlined />} onClick={load} loading={loading} block>Generate</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(true)} disabled={!data} block>View PDF</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><ExportButton config={{ filename:'ap-aging', data: data?.invoices||[] }} /></Col>
        </Row>
      </Card>
      {searched && data && (
        <>
          <Row gutter={10} style={{ marginBottom:16 }}>
            {Object.entries(BUCKET_LABELS).map(([key, label]) => (
              <Col key={key} style={{ flex:'1 1 0' }}>
                <Card size="small" style={{ borderRadius:10, borderTop:`4px solid ${BUCKET_COLOR[key]}`, textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#8c8c8c' }}>{label}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:BUCKET_COLOR[key] }}>OMR {Number(data.summary?.[key]||0).toFixed(3)}</div>
                </Card>
              </Col>
            ))}
          </Row>
          <Card style={{ borderRadius:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <Text>Total Payable: <Text strong style={{ color:'#722ed1', fontSize:16 }}>OMR {Number(data.totalOutstanding||0).toFixed(3)}</Text></Text>
              <Text type="secondary">{data.invoices?.length||0} invoices</Text>
            </div>
            <Table dataSource={data.invoices||[]} columns={columns} rowKey="invoiceId" size="small" pagination={{ pageSize:20, showTotal:t=>`${t} invoices` }} />
          </Card>
        </>
      )}
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top:0, padding:0, maxWidth:'100vw' }} styles={{ body:{ height:'95vh', overflow:'auto', padding:16, background:'#f5f5f5' } }} title="AP Aging Report — PDF Preview">
        <Space style={{ marginBottom:16 }}>
          <Button icon={<PrinterOutlined />} onClick={() => printDocument('ap-aging-pdf')}>Print</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('ap-aging-pdf', `ap-aging-${asOfDate}.pdf`)}>Download PDF</Button>
        </Space>
        <PDFContent />
      </Modal>
    </div>
  );
}
