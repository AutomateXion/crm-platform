import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, InputNumber, Table, Tag, Space, Modal, Alert, Progress } from 'antd';
import { CalculatorOutlined, FilePdfOutlined, DownloadOutlined, PrinterOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import salesApi from '../../../services/salesApi';
import ExportButton from '../../../components/common/ExportButton';
import { downloadPDF, printDocument } from '../../../utils/pdfGenerator';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

const { Title, Text } = Typography;

export default function LiquidationProjectionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentCash, setCurrentCash] = useState<number>(0);
  const [salaries, setSalaries] = useState<number>(0);
  const [rent, setRent] = useState<number>(0);
  const [showPDF, setShowPDF] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await salesApi.get('/sales/liquidation-projection', { params: { currentCash, salaries, rent } });
      setData(r.data);
    } catch {} finally { setLoading(false); }
  };

  const columns = [
    { title:'Month', dataIndex:'month', render:(v:string) => <Tag color="blue">{v}</Tag> },
    { title:'Opening Cash', dataIndex:'openingCash', align:'right' as const, render:(v:number) => `OMR ${Number(v).toFixed(3)}` },
    { title:'Expected Inflow', dataIndex:'expectedInflow', align:'right' as const, render:(v:number) => <Text style={{color:'#52c41a'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Expected Outflow', dataIndex:'expectedOutflow', align:'right' as const, render:(v:number) => <Text style={{color:'#ff4d4f'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Net Cash Flow', dataIndex:'netCashFlow', align:'right' as const, render:(v:number) => <Text strong style={{color:v>=0?'#52c41a':'#ff4d4f'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Closing Cash', dataIndex:'closingCash', align:'right' as const, render:(v:number) => <Text strong style={{color:v>=0?'#1890ff':'#ff4d4f', fontSize:13}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Status', dataIndex:'closingCash', key:'status', render:(v:number) => <Tag color={v>=0?'green':'red'}>{v>=0?'Solvent':'Deficit'}</Tag> },
  ];

  const { settings: company } = useCompanySettings();

  const PDFContent = () => (
    <div id="liquidation-pdf" style={{ width:'210mm', background:'#fff', padding:'12mm 15mm', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#333' }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #fa8c16', paddingBottom:14, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#fa8c16' }}>{company?.companyName || 'My Company'}</div>
          <div style={{ fontSize:10, color:'#666' }}>{[company?.addressLine1, company?.city, company?.country].filter(Boolean).join(', ') || 'Muscat, Sultanate of Oman'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#fa8c16' }}>LIQUIDATION PROJECTION</div>
          <div style={{ fontSize:10, color:'#888' }}>12-Month Cash Flow Forecast</div>
          <div style={{ fontSize:9, color:'#aaa' }}>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</div>
        </div>
      </div>
      {/* Assumptions */}
      <div style={{ background:'#fff7e6', border:'1px solid #ffd591', borderRadius:6, padding:'8px 12px', marginBottom:16, fontSize:10 }}>
        <strong>Assumptions:</strong> Current Cash: OMR {Number(currentCash).toFixed(3)} | Monthly Salaries: OMR {Number(salaries).toFixed(3)} | Monthly Rent: OMR {Number(rent).toFixed(3)}
      </div>
      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
        {[
          { label:'Starting Cash', value:`OMR ${Number(currentCash).toFixed(3)}`, color:'#1890ff' },
          { label:'Total Inflow', value:`OMR ${Number(data?.totalInflow||0).toFixed(3)}`, color:'#52c41a' },
          { label:'Total Outflow', value:`OMR ${Number(data?.totalOutflow||0).toFixed(3)}`, color:'#ff4d4f' },
          { label:'Ending Cash', value:`OMR ${Number(data?.endingCash||0).toFixed(3)}`, color:Number(data?.endingCash||0)>=0?'#13c2c2':'#ff4d4f' },
        ].map((k,i) => (
          <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}40`, borderRadius:6, padding:'8px', textAlign:'center' }}>
            <div style={{ fontSize:13, fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:9, color:'#666', marginTop:2 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9 }}>
        <thead><tr style={{ background:'#fa8c16', color:'#fff' }}>
          {['Month','Opening Cash','Inflow (OMR)','Outflow (OMR)','Net (OMR)','Closing Cash','Status'].map(h=>(
            <th key={h} style={{ padding:'7px 8px', textAlign:'left' }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {(data?.projections||[]).map((row:any,i:number) => (
            <tr key={i} style={{ background:row.closingCash<0?'#fff2f0':i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
              <td style={{ padding:'5px 8px', fontWeight:600 }}>{row.month}</td>
              <td style={{ padding:'5px 8px', textAlign:'right' }}>OMR {Number(row.openingCash||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#52c41a' }}>OMR {Number(row.expectedInflow||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#ff4d4f' }}>OMR {Number(row.expectedOutflow||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:row.netCashFlow>=0?'#52c41a':'#ff4d4f', fontWeight:600 }}>OMR {Number(row.netCashFlow||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', fontWeight:700, color:row.closingCash>=0?'#1890ff':'#ff4d4f', fontSize:10 }}>OMR {Number(row.closingCash||0).toFixed(3)}</td>
              <td style={{ padding:'5px 8px' }}>
                <span style={{ background:row.closingCash>=0?'#f6ffed':'#fff2f0', color:row.closingCash>=0?'#52c41a':'#ff4d4f', padding:'2px 6px', borderRadius:3, fontSize:8, fontWeight:700 }}>
                  {row.closingCash>=0?'Solvent':'Deficit'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop:16, paddingTop:10, borderTop:'1px solid #e0e0e0', fontSize:8, color:'#aaa', display:'flex', justifyContent:'space-between' }}>
        <span>All amounts in Omani Riyal (OMR) — Projections are estimates only</span><span>Confidential</span><span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
      </div>
    </div>
  );

  const deficitMonths = (data?.projections||[]).filter((p:any) => p.closingCash < 0).length;

  return (
    <div id="liquidation-report">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div><Title level={4} style={{ margin:0 }}>Liquidation Projection</Title><Text type="secondary">12-month cash flow forecast and liquidity analysis</Text></div>
      </div>
      <Card style={{ borderRadius:12, marginBottom:16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={5}>
            <Text type="secondary" style={{ display:'block', marginBottom:4 }}>Current Cash (OMR)</Text>
            <InputNumber style={{ width:'100%' }} min={0} step={100} value={currentCash} onChange={v => setCurrentCash(v||0)} prefix="OMR" />
          </Col>
          <Col span={5}>
            <Text type="secondary" style={{ display:'block', marginBottom:4 }}>Monthly Salaries (OMR)</Text>
            <InputNumber style={{ width:'100%' }} min={0} step={100} value={salaries} onChange={v => setSalaries(v||0)} prefix="OMR" />
          </Col>
          <Col span={5}>
            <Text type="secondary" style={{ display:'block', marginBottom:4 }}>Monthly Rent (OMR)</Text>
            <InputNumber style={{ width:'100%' }} min={0} step={100} value={rent} onChange={v => setRent(v||0)} prefix="OMR" />
          </Col>
          <Col span={3} style={{ paddingTop:22 }}><Button type="primary" icon={<CalculatorOutlined />} onClick={load} loading={loading} block>Calculate</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(true)} disabled={!data} block>View PDF</Button></Col>
          <Col span={3} style={{ paddingTop:22 }}><ExportButton config={{ filename:'liquidation-projection', data: data?.projections||[] }} /></Col>
        </Row>
      </Card>
      {data && (
        <>
          {deficitMonths > 0 && (
            <Alert type="warning" showIcon icon={<WarningOutlined />} style={{ marginBottom:16, borderRadius:12 }}
              message={`⚠️ ${deficitMonths} month(s) projected to have cash deficit. Review your cash flow strategy.`} />
          )}
          {deficitMonths === 0 && (
            <Alert type="success" showIcon icon={<CheckCircleOutlined />} style={{ marginBottom:16, borderRadius:12 }}
              message="✅ No cash deficits projected over the next 12 months." />
          )}
          <Row gutter={12} style={{ marginBottom:16 }}>
            {[
              { label:'Starting Cash', value:Number(currentCash).toFixed(3), color:'#1890ff' },
              { label:'Total Inflow', value:Number(data.totalInflow||0).toFixed(3), color:'#52c41a' },
              { label:'Total Outflow', value:Number(data.totalOutflow||0).toFixed(3), color:'#ff4d4f' },
              { label:'Ending Cash', value:Number(data.endingCash||0).toFixed(3), color:Number(data.endingCash||0)>=0?'#13c2c2':'#ff4d4f' },
            ].map((k,i) => (
              <Col span={6} key={i}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${k.color}`, textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:700, color:k.color }}>OMR {k.value}</div>
                <div style={{ fontSize:11, color:'#8c8c8c' }}>{k.label}</div>
              </Card></Col>
            ))}
          </Row>
          <Card style={{ borderRadius:12 }}>
            <Table dataSource={data.projections||[]} columns={columns} rowKey="month" size="small" pagination={false}
              rowClassName={(r:any) => r.closingCash<0 ? 'ant-table-row-warning' : ''} />
          </Card>
        </>
      )}
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top:0, padding:0, maxWidth:'100vw' }} styles={{ body:{ height:'95vh', overflow:'auto', padding:16, background:'#f5f5f5' } }} title="Liquidation Projection — PDF Preview">
        <Space style={{ marginBottom:16 }}>
          <Button icon={<PrinterOutlined />} onClick={() => printDocument('liquidation-pdf')}>Print</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('liquidation-pdf', `liquidation-projection-${dayjs().format('YYYY-MM-DD')}.pdf`)}>Download PDF</Button>
        </Space>
        <PDFContent />
      </Modal>
    </div>
  );
}
