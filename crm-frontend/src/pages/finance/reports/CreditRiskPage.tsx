import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Table, Tag, Space, Modal, Progress, Statistic } from 'antd';
import { ReloadOutlined, FilePdfOutlined, DownloadOutlined, PrinterOutlined, WarningOutlined } from '@ant-design/icons';
import salesApi from '../../../services/salesApi';
import ExportButton from '../../../components/common/ExportButton';
import { downloadPDF, printDocument } from '../../../utils/pdfGenerator';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

const { Title, Text } = Typography;

const getRiskColor = (risk: string) => {
  if (risk === 'LOW') return '#52c41a';
  if (risk === 'MEDIUM') return '#fa8c16';
  if (risk === 'HIGH') return '#ff4d4f';
  return '#8c8c8c';
};

export default function CreditRiskPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/credit-risk'); setData(r.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const columns = [
    { title:'Customer', dataIndex:'customerName', render:(v:string) => <Text strong>{v}</Text> },
    { title:'Credit Limit', dataIndex:'creditLimit', align:'right' as const, render:(v:number) => `OMR ${Number(v).toFixed(3)}` },
    { title:'Outstanding', dataIndex:'outstanding', align:'right' as const, render:(v:number) => <Text strong style={{color:'#ff4d4f'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Utilization', align:'center' as const, render:(_:any, r:any) => {
      const pct = r.creditLimit > 0 ? Math.round((r.outstanding/r.creditLimit)*100) : 0;
      return <Progress percent={Math.min(pct,100)} size="small" strokeColor={pct>=90?'#ff4d4f':pct>=70?'#fa8c16':'#52c41a'} style={{width:100,margin:0}} />;
    }},
    { title:'Overdue', dataIndex:'overdueAmount', align:'right' as const, render:(v:number) => <Text style={{color:v>0?'#ff4d4f':'#52c41a'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Risk', dataIndex:'riskLevel', render:(v:string) => <Tag color={v==='LOW'?'green':v==='MEDIUM'?'orange':'red'}>{v}</Tag> },
    { title:'Invoices', dataIndex:'invoiceCount', align:'center' as const },
  ];

  const { settings: company } = useCompanySettings();

  const PDFContent = () => (
    <div id="credit-risk-pdf" style={{ width:'210mm', background:'#fff', padding:'12mm 15mm', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#333' }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #ff4d4f', paddingBottom:14, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#ff4d4f' }}>{company?.companyName || 'My Company'}</div>
          <div style={{ fontSize:10, color:'#666' }}>{[company?.addressLine1, company?.city, company?.country].filter(Boolean).join(', ') || 'Muscat, Sultanate of Oman'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#ff4d4f' }}>CREDIT RISK REPORT</div>
          <div style={{ fontSize:10, color:'#888' }}>As of {dayjs().format('DD MMMM YYYY')}</div>
          <div style={{ fontSize:9, color:'#aaa' }}>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
        {[
          { label:'Total Customers', value:data?.customers?.length||0, fmt:false, color:'#1890ff' },
          { label:'High Risk', value:(data?.customers||[]).filter((c:any)=>c.riskLevel==='HIGH').length, fmt:false, color:'#ff4d4f' },
          { label:'Total Outstanding', value:Number(data?.totalOutstanding||0).toFixed(3), fmt:true, color:'#fa8c16' },
          { label:'Total Overdue', value:Number(data?.totalOverdue||0).toFixed(3), fmt:true, color:'#ff4d4f' },
        ].map((k,i) => (
          <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}40`, borderRadius:6, padding:'8px', textAlign:'center' }}>
            <div style={{ fontSize:16, fontWeight:700, color:k.color }}>{k.fmt?`OMR ${k.value}`:k.value}</div>
            <div style={{ fontSize:9, color:'#666', marginTop:2 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9 }}>
        <thead><tr style={{ background:'#ff4d4f', color:'#fff' }}>
          {['Customer','Credit Limit (OMR)','Outstanding (OMR)','Utilization %','Overdue (OMR)','Risk Level','Invoices'].map(h=>(
            <th key={h} style={{ padding:'7px 8px', textAlign:'left' }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {(data?.customers||[]).map((row:any,i:number) => {
            const pct = row.creditLimit>0?Math.round((row.outstanding/row.creditLimit)*100):0;
            return (
              <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
                <td style={{ padding:'5px 8px', fontWeight:600 }}>{row.customerName}</td>
                <td style={{ padding:'5px 8px', textAlign:'right' }}>OMR {Number(row.creditLimit||0).toFixed(3)}</td>
                <td style={{ padding:'5px 8px', textAlign:'right', color:'#ff4d4f', fontWeight:600 }}>OMR {Number(row.outstanding||0).toFixed(3)}</td>
                <td style={{ padding:'5px 8px', textAlign:'right', color:pct>=90?'#ff4d4f':pct>=70?'#fa8c16':'#52c41a', fontWeight:700 }}>{pct}%</td>
                <td style={{ padding:'5px 8px', textAlign:'right', color:row.overdueAmount>0?'#ff4d4f':'#52c41a' }}>OMR {Number(row.overdueAmount||0).toFixed(3)}</td>
                <td style={{ padding:'5px 8px' }}>
                  <span style={{ background:`${getRiskColor(row.riskLevel)}20`, color:getRiskColor(row.riskLevel), padding:'2px 8px', borderRadius:4, fontSize:8, fontWeight:700 }}>{row.riskLevel}</span>
                </td>
                <td style={{ padding:'5px 8px', textAlign:'center' }}>{row.invoiceCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop:16, paddingTop:10, borderTop:'1px solid #e0e0e0', fontSize:8, color:'#aaa', display:'flex', justifyContent:'space-between' }}>
        <span>All amounts in Omani Riyal (OMR)</span><span>Confidential</span><span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
      </div>
    </div>
  );

  return (
    <div id="credit-risk-report">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div><Title level={4} style={{ margin:0 }}>Credit Risk Report</Title><Text type="secondary">Customer credit utilization and risk assessment</Text></div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(true)} disabled={!data}>View PDF</Button>
          <ExportButton config={{ filename:'credit-risk', data: data?.customers||[] }} />
        </Space>
      </div>
      {data && (
        <>
          <Row gutter={12} style={{ marginBottom:16 }}>
            {[
              { label:'Total Customers', value:data.customers?.length||0, suffix:'', color:'#1890ff' },
              { label:'High Risk', value:(data.customers||[]).filter((c:any)=>c.riskLevel==='HIGH').length, suffix:'', color:'#ff4d4f' },
              { label:'Total Outstanding', value:Number(data.totalOutstanding||0).toFixed(3), suffix:' OMR', color:'#fa8c16' },
              { label:'Total Overdue', value:Number(data.totalOverdue||0).toFixed(3), suffix:' OMR', color:'#ff4d4f' },
            ].map((k,i) => (
              <Col span={6} key={i}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${k.color}`, textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:700, color:k.color }}>{k.value}{k.suffix}</div>
                <div style={{ fontSize:11, color:'#8c8c8c' }}>{k.label}</div>
              </Card></Col>
            ))}
          </Row>
          <Card style={{ borderRadius:12 }}>
            <Table dataSource={data.customers||[]} columns={columns} rowKey="customerId" size="small"
              pagination={{ pageSize:20, showTotal:t=>`${t} customers` }}
              rowClassName={(r:any) => r.riskLevel==='HIGH' ? 'ant-table-row-warning' : ''} />
          </Card>
        </>
      )}
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top:0, padding:0, maxWidth:'100vw' }} styles={{ body:{ height:'95vh', overflow:'auto', padding:16, background:'#f5f5f5' } }} title="Credit Risk Report — PDF Preview">
        <Space style={{ marginBottom:16 }}>
          <Button icon={<PrinterOutlined />} onClick={() => printDocument('credit-risk-pdf')}>Print</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('credit-risk-pdf', `credit-risk-${dayjs().format('YYYY-MM-DD')}.pdf`)}>Download PDF</Button>
        </Space>
        <PDFContent />
      </Modal>
    </div>
  );
}
