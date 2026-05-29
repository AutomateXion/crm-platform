import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Modal, Row, Col, Statistic, DatePicker, Space, Tag } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, WarningOutlined, FilePdfOutlined } from '@ant-design/icons';
import axios from 'axios';
import ExportButton from '../../../components/common/ExportButton';
import { ProfitLossPDF } from '../../../components/pdf/ReportPDF';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const fmt = (n: number) => `OMR ${Math.abs(Number(n || 0)).toFixed(3)}`;
const fmtSigned = (n: number) => Number(n) < 0 ? `(OMR ${Math.abs(Number(n)).toFixed(3)})` : `OMR ${Number(n).toFixed(3)}`;

const PRINT_STYLE = `@media print {
  .no-print { display: none !important; }
  body { margin: 0; font-family: Arial, sans-serif; }
  .print-report { padding: 20px; }
}`;

export default function ProfitLossPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { settings: company } = useCompanySettings();
  const [showPDF, setShowPDF] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/financial', { params });
      setData(r.data?.pnl);
    } catch {} finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const period = dateRange
    ? `${dateRange[0].format('DD MMM YYYY')} to ${dateRange[1].format('DD MMM YYYY')}`
    : `As of ${dayjs().format('DD MMMM YYYY')}`;

  const pnl = data;

  return (
    <div>
      <style>{PRINT_STYLE}</style>
      <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <Title level={4} style={{ margin:0 }}>Profit & Loss Statement</Title>
          <Text type="secondary">Income, expenses and net profit/loss</Text>
        </div>
        <Space>
          <RangePicker onChange={dates => setDateRange(dates)} />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(!showPDF)}>{showPDF ? 'Hide PDF' : 'View PDF'}</Button>
          <ExportButton config={{ elementId:'pnl-report', filename:'profit-loss', data: pnl ? [
            ...(pnl.revenue||[]).map((a:any)=>({Type:'Revenue', Code:a.accountCode, Account:a.accountName, Amount:Number(a.balance).toFixed(3)})),
            {Type:'TOTAL REVENUE', Code:'', Account:'', Amount:Number(pnl.totalRevenue||0).toFixed(3)},
            ...(pnl.cogs||[]).map((a:any)=>({Type:'COGS', Code:a.accountCode, Account:a.accountName, Amount:Number(a.balance).toFixed(3)})),
            {Type:'GROSS PROFIT', Code:'', Account:'', Amount:Number(pnl.grossProfit||0).toFixed(3)},
            ...(pnl.opex||[]).map((a:any)=>({Type:'Operating Expense', Code:a.accountCode, Account:a.accountName, Amount:Number(a.balance).toFixed(3)})),
            {Type:'NET PROFIT', Code:'', Account:'', Amount:Number(pnl.netProfit||0).toFixed(3)},
          ] : [], headers:['Type','Code','Account','Amount'], sheetName:'P&L', orientation:'portrait' as const }} />
        </Space>
      </div>

      {/* KPI Cards */}
      {pnl && (
        <Row gutter={12} style={{ marginBottom:20 }} className="no-print">
          <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #52c41a', textAlign:'center' }}><Statistic title="Total Revenue" prefix="OMR " value={Number(pnl.totalRevenue||0).toFixed(3)} valueStyle={{ color:'#52c41a', fontSize:18 }} /></Card></Col>
          <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #fa8c16', textAlign:'center' }}><Statistic title="Total COGS" prefix="OMR " value={Number(pnl.totalCogs||0).toFixed(3)} valueStyle={{ color:'#fa8c16', fontSize:18 }} /></Card></Col>
          <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #1890ff', textAlign:'center' }}><Statistic title={`Gross Profit (${Number(pnl.grossMargin||0).toFixed(1)}%)`} prefix="OMR " value={Number(pnl.grossProfit||0).toFixed(3)} valueStyle={{ color:'#1890ff', fontSize:18 }} /></Card></Col>
          <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${pnl.netProfit>=0?'#52c41a':'#ff4d4f'}`, textAlign:'center' }}><Statistic title={`Net ${pnl.netProfit>=0?'Profit':'Loss'} (${Number(pnl.netMargin||0).toFixed(1)}%)`} prefix="OMR " value={Math.abs(Number(pnl.netProfit||0)).toFixed(3)} valueStyle={{ color:pnl.netProfit>=0?'#52c41a':'#ff4d4f', fontSize:18 }} /></Card></Col>
        </Row>
      )}

      {/* Printable Report */}
      <div className="print-report-wrapper" style={{ background:'white' }} id="pnl-report">
      <Card style={{ borderRadius:12 }} loading={loading}>
        <div className="print-report">
          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:24, borderBottom:'2px solid #1890ff', paddingBottom:16 }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#1890ff' }}>{company?.companyName || 'My Company'}</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#333', marginTop:4 }}>Profit & Loss Statement</div>
            <div style={{ fontSize:12, color:'#666', marginTop:4 }}>{period}</div>
          </div>

          {!pnl ? <div style={{ textAlign:'center', padding:40, color:'#8c8c8c' }}>No data available. Select a date range and click Refresh.</div> : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <colgroup><col width="10%"/><col width="55%"/><col width="35%"/></colgroup>
              <tbody>
                {/* Revenue Section */}
                <tr style={{ background:'#f6ffed' }}>
                  <td colSpan={3} style={{ padding:'10px 12px', fontWeight:700, color:'#52c41a', fontSize:14, borderBottom:'2px solid #52c41a' }}>REVENUE</td>
                </tr>
                {(pnl.revenue||[]).map((a:any) => (
                  <tr key={a.accountCode} style={{ borderBottom:'1px solid #f5f5f5' }}>
                    <td style={{ padding:'6px 12px', color:'#8c8c8c', fontSize:11 }}>{a.accountCode}</td>
                    <td style={{ padding:'6px 8px', paddingLeft:24 }}>{a.accountName}</td>
                    <td style={{ padding:'6px 12px', textAlign:'right', color:'#52c41a' }}>{fmt(a.balance)}</td>
                  </tr>
                ))}
                <tr style={{ background:'#f6ffed', borderTop:'2px solid #52c41a' }}>
                  <td/><td style={{ padding:'8px 8px', fontWeight:700 }}>Total Revenue</td>
                  <td style={{ padding:'8px 12px', textAlign:'right', fontWeight:700, color:'#52c41a', fontSize:14 }}>{fmt(pnl.totalRevenue)}</td>
                </tr>

                <tr><td colSpan={3} style={{ padding:10 }}/></tr>

                {/* COGS Section */}
                <tr style={{ background:'#fff7e6' }}>
                  <td colSpan={3} style={{ padding:'10px 12px', fontWeight:700, color:'#fa8c16', fontSize:14, borderBottom:'2px solid #fa8c16' }}>COST OF GOODS SOLD</td>
                </tr>
                {(pnl.cogs||[]).map((a:any) => (
                  <tr key={a.accountCode} style={{ borderBottom:'1px solid #f5f5f5' }}>
                    <td style={{ padding:'6px 12px', color:'#8c8c8c', fontSize:11 }}>{a.accountCode}</td>
                    <td style={{ padding:'6px 8px', paddingLeft:24 }}>{a.accountName}</td>
                    <td style={{ padding:'6px 12px', textAlign:'right', color:'#fa8c16' }}>{fmt(a.balance)}</td>
                  </tr>
                ))}
                <tr style={{ background:'#fff7e6', borderTop:'2px solid #fa8c16' }}>
                  <td/><td style={{ padding:'8px 8px', fontWeight:700 }}>Total Cost of Goods Sold</td>
                  <td style={{ padding:'8px 12px', textAlign:'right', fontWeight:700, color:'#fa8c16', fontSize:14 }}>{fmt(pnl.totalCogs)}</td>
                </tr>

                {/* Gross Profit */}
                <tr style={{ background: pnl.grossProfit>=0?'#e6f7ff':'#fff2f0', borderTop:'2px solid #1890ff' }}>
                  <td/><td style={{ padding:'12px 8px', fontWeight:700, fontSize:15 }}>GROSS PROFIT</td>
                  <td style={{ padding:'12px 12px', textAlign:'right', fontWeight:700, fontSize:16, color: pnl.grossProfit>=0?'#1890ff':'#ff4d4f' }}>
                    {fmtSigned(pnl.grossProfit)} <span style={{ fontSize:11, fontWeight:400 }}>({Number(pnl.grossMargin||0).toFixed(1)}%)</span>
                  </td>
                </tr>

                <tr><td colSpan={3} style={{ padding:10 }}/></tr>

                {/* OpEx Section */}
                <tr style={{ background:'#fff2f0' }}>
                  <td colSpan={3} style={{ padding:'10px 12px', fontWeight:700, color:'#ff4d4f', fontSize:14, borderBottom:'2px solid #ff4d4f' }}>OPERATING EXPENSES</td>
                </tr>
                {(pnl.opex||[]).map((a:any) => (
                  <tr key={a.accountCode} style={{ borderBottom:'1px solid #f5f5f5' }}>
                    <td style={{ padding:'6px 12px', color:'#8c8c8c', fontSize:11 }}>{a.accountCode}</td>
                    <td style={{ padding:'6px 8px', paddingLeft:24 }}>{a.accountName}</td>
                    <td style={{ padding:'6px 12px', textAlign:'right', color:'#ff4d4f' }}>{fmt(a.balance)}</td>
                  </tr>
                ))}
                <tr style={{ background:'#fff2f0', borderTop:'2px solid #ff4d4f' }}>
                  <td/><td style={{ padding:'8px 8px', fontWeight:700 }}>Total Operating Expenses</td>
                  <td style={{ padding:'8px 12px', textAlign:'right', fontWeight:700, color:'#ff4d4f', fontSize:14 }}>{fmt(pnl.totalOpex)}</td>
                </tr>

                <tr><td colSpan={3} style={{ padding:6 }}/></tr>

                {/* Net Profit */}
                <tr style={{ background: pnl.netProfit>=0?'#f6ffed':'#fff2f0', borderTop:'3px double #333' }}>
                  <td/><td style={{ padding:'16px 8px', fontWeight:800, fontSize:17 }}>NET {pnl.netProfit>=0?'PROFIT':'LOSS'}</td>
                  <td style={{ padding:'16px 12px', textAlign:'right', fontWeight:800, fontSize:20, color: pnl.netProfit>=0?'#52c41a':'#ff4d4f' }}>
                    {fmtSigned(pnl.netProfit)} <span style={{ fontSize:12, fontWeight:400 }}>({Number(pnl.netMargin||0).toFixed(1)}%)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Footer */}
          <div style={{ marginTop:32, paddingTop:16, borderTop:'1px solid #f0f0f0', fontSize:11, color:'#8c8c8c', display:'flex', justifyContent:'space-between' }}>
            <span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
            <span>All amounts in Omani Riyal (OMR)</span>
          </div>
        </div>
      </Card>
      </div>
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top: 0, padding: 0, maxWidth: "100vw" }} styles={{ body: { height: "95vh", overflow: "auto", padding: 16 } }} title="Profit & Loss Statement — PDF Preview">
        {pnl && <ProfitLossPDF data={pnl} period={period} />}
      </Modal>
    </div>
  );
}
