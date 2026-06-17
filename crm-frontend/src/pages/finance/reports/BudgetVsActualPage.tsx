import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Input, Table, Tag, Space, Modal, Progress } from 'antd';
import { SearchOutlined, FilePdfOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import salesApi from '../../../services/salesApi';
import ExportButton from '../../../components/common/ExportButton';
import { downloadPDF, printDocument } from '../../../utils/pdfGenerator';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

const { Title, Text } = Typography;

export default function BudgetVsActualPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searched, setSearched] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    const now = new Date();
    setFromDate(new Date(now.getFullYear(), 0, 1).toISOString().slice(0,10));
    setToDate(now.toISOString().slice(0,10));
  }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/budget-vs-actual', { params: { fromDate: fromDate||undefined, toDate: toDate||undefined } }); setData(r.data); setSearched(true); }
    catch {} finally { setLoading(false); }
  };

  const columns = [
    { title:'Category', dataIndex:'category', render:(v:string) => <Text strong>{v}</Text> },
    { title:'Budget (OMR)', dataIndex:'budget', align:'right' as const, render:(v:number) => <Text>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Actual (OMR)', dataIndex:'actual', align:'right' as const, render:(v:number) => <Text strong>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Variance', dataIndex:'variance', align:'right' as const, render:(v:number) => <Text style={{color:v>=0?'#52c41a':'#ff4d4f'}}>{v>=0?'+':''}OMR {Number(v).toFixed(3)}</Text> },
    { title:'Achievement', align:'center' as const, render:(_:any, r:any) => {
      const pct = r.budget > 0 ? Math.round((r.actual/r.budget)*100) : 0;
      return <Progress percent={pct} size="small" strokeColor={pct>=100?'#52c41a':pct>=80?'#fa8c16':'#ff4d4f'} style={{width:120, margin:0}} />;
    }},
  ];

  const { settings: company } = useCompanySettings();

  const PDFContent = () => (
    <div id="budget-actual-pdf" style={{ width:'210mm', background:'#fff', padding:'12mm 15mm', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#333' }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #2E6DA4', paddingBottom:14, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#2E6DA4' }}>{company?.companyName || 'My Company'}</div>
          <div style={{ fontSize:10, color:'#666' }}>{[company?.addressLine1, company?.city, company?.country].filter(Boolean).join(', ') || 'Muscat, Sultanate of Oman'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#2E6DA4' }}>BUDGET VS ACTUAL</div>
          <div style={{ fontSize:10, color:'#888' }}>{fromDate} to {toDate}</div>
          <div style={{ fontSize:9, color:'#aaa' }}>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
        {[
          { label:'Total Budget', value:`OMR ${Number(data?.totalBudget||0).toFixed(3)}`, color:'#2E6DA4' },
          { label:'Total Actual', value:`OMR ${Number(data?.totalActual||0).toFixed(3)}`, color:'#1890ff' },
          { label:'Total Variance', value:`OMR ${Number(data?.totalVariance||0).toFixed(3)}`, color:Number(data?.totalVariance||0)>=0?'#52c41a':'#ff4d4f' },
          { label:'Achievement', value:`${Number(data?.achievementPct||0).toFixed(1)}%`, color:'#fa8c16' },
        ].map((k,i) => (
          <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}40`, borderRadius:6, padding:'8px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:9, color:'#666', marginTop:2 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9 }}>
        <thead><tr style={{ background:'#2E6DA4', color:'#fff' }}>
          {['Category','Budget (OMR)','Actual (OMR)','Variance (OMR)','Achievement %'].map(h=><th key={h} style={{ padding:'7px 8px', textAlign:'left' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {(data?.items||[]).map((row:any,i:number) => {
            const pct = row.budget>0?Math.round((row.actual/row.budget)*100):0;
            return (
              <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
                <td style={{ padding:'5px 8px', fontWeight:600 }}>{row.category}</td>
                <td style={{ padding:'5px 8px', textAlign:'right' }}>OMR {Number(row.budget||0).toFixed(3)}</td>
                <td style={{ padding:'5px 8px', textAlign:'right', fontWeight:600 }}>OMR {Number(row.actual||0).toFixed(3)}</td>
                <td style={{ padding:'5px 8px', textAlign:'right', color:Number(row.variance||0)>=0?'#52c41a':'#ff4d4f', fontWeight:600 }}>
                  {Number(row.variance||0)>=0?'+':''}OMR {Number(row.variance||0).toFixed(3)}
                </td>
                <td style={{ padding:'5px 8px', textAlign:'right', color:pct>=100?'#52c41a':pct>=80?'#fa8c16':'#ff4d4f', fontWeight:700 }}>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background:'#2E6DA4', color:'#fff', fontWeight:700 }}>
            <td style={{ padding:'8px' }}>TOTAL</td>
            <td style={{ padding:'8px', textAlign:'right' }}>OMR {Number(data?.totalBudget||0).toFixed(3)}</td>
            <td style={{ padding:'8px', textAlign:'right' }}>OMR {Number(data?.totalActual||0).toFixed(3)}</td>
            <td style={{ padding:'8px', textAlign:'right' }}>{Number(data?.totalVariance||0)>=0?'+':''}OMR {Number(data?.totalVariance||0).toFixed(3)}</td>
            <td style={{ padding:'8px', textAlign:'right' }}>{Number(data?.achievementPct||0).toFixed(1)}%</td>
          </tr>
        </tfoot>
      </table>
      <div style={{ marginTop:16, paddingTop:10, borderTop:'1px solid #e0e0e0', fontSize:8, color:'#aaa', display:'flex', justifyContent:'space-between' }}>
        <span>All amounts in Omani Riyal (OMR)</span><span>Confidential</span><span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
      </div>
    </div>
  );

  return (
    <div id="budget-vs-actual-report">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div><Title level={4} style={{ margin:0 }}>Budget vs Actual</Title><Text type="secondary">Compare budgeted amounts against actual performance</Text></div>
      </div>
      <Card style={{ borderRadius:12, marginBottom:16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={5}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>From Date</Text><Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></Col>
          <Col span={5}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>To Date</Text><Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button type="primary" icon={<SearchOutlined />} onClick={load} loading={loading} block>Generate</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(true)} disabled={!data} block>View PDF</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><ExportButton config={{ filename:'budget-vs-actual', data: data?.items||[] }} /></Col>
        </Row>
      </Card>
      {searched && data && (
        <>
          <Row gutter={12} style={{ marginBottom:16 }}>
            {[
              { label:'Total Budget', value:Number(data.totalBudget||0).toFixed(3), color:'#2E6DA4' },
              { label:'Total Actual', value:Number(data.totalActual||0).toFixed(3), color:'#1890ff' },
              { label:'Variance', value:Number(data.totalVariance||0).toFixed(3), color:Number(data.totalVariance||0)>=0?'#52c41a':'#ff4d4f' },
              { label:'Achievement', value:`${Number(data.achievementPct||0).toFixed(1)}%`, color:'#fa8c16' },
            ].map((k,i) => (
              <Col span={6} key={i}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${k.color}`, textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:700, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:11, color:'#8c8c8c' }}>{k.label}</div>
              </Card></Col>
            ))}
          </Row>
          {data.chartData?.length > 0 && (
            <Card style={{ borderRadius:12, marginBottom:16 }} size="small">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#2E6DA4" name="Budget" />
                  <Bar dataKey="actual" fill="#1890ff" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
          <Card style={{ borderRadius:12 }}>
            <Table dataSource={data.items||[]} columns={columns} rowKey="category" size="small" pagination={false} />
          </Card>
        </>
      )}
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top:0, padding:0, maxWidth:'100vw' }} styles={{ body:{ height:'95vh', overflow:'auto', padding:16, background:'#f5f5f5' } }} title="Budget vs Actual — PDF Preview">
        <Space style={{ marginBottom:16 }}>
          <Button icon={<PrinterOutlined />} onClick={() => printDocument('budget-actual-pdf')}>Print</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('budget-actual-pdf', `budget-vs-actual-${fromDate}.pdf`)}>Download PDF</Button>
        </Space>
        <PDFContent />
      </Modal>
    </div>
  );
}
