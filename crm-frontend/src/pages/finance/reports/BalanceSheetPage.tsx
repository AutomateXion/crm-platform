import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Modal, Row, Col, Statistic, DatePicker, Space, Tag } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, WarningOutlined, FilePdfOutlined } from '@ant-design/icons';
import axios from 'axios';
import ExportButton from '../../../components/common/ExportButton';
import { BalanceSheetPDF } from '../../../components/pdf/ReportPDF';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const fmt = (n: number) => `OMR ${Math.abs(Number(n || 0)).toFixed(3)}`;
const fmtSigned = (n: number) => Number(n) < 0 ? `(OMR ${Math.abs(Number(n)).toFixed(3)})` : `OMR ${Number(n).toFixed(3)}`;

const PRINT_STYLE = `@media print {
  /* Hide everything */
  body > * { display: none !important; }
  /* Show only the report card */
  .print-report-wrapper { display: block !important; position: fixed; top: 0; left: 0; width: 100%; z-index: 99999; background: white; }
  .no-print { display: none !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @page { margin: 15mm; size: A4; }
}`;

function Section({ title, color, accounts, total, totalLabel }: any) {
  return (
    <>
      <tr style={{ background: `${color}15` }}>
        <td colSpan={3} style={{ padding:'8px 12px', fontWeight:700, color, fontSize:13, borderBottom:`2px solid ${color}` }}>{title}</td>
      </tr>
      {(accounts||[]).map((a:any) => (
        <tr key={a.accountCode} style={{ borderBottom:'1px solid #f5f5f5' }}>
          <td style={{ padding:'5px 12px', color:'#8c8c8c', fontSize:11, width:'12%' }}>{a.accountCode}</td>
          <td style={{ padding:'5px 8px', paddingLeft:20, fontSize:12, width:'55%' }}>{a.accountName}</td>
          <td style={{ padding:'5px 12px', textAlign:'right', fontSize:12, color, width:'33%' }}>{fmt(a.balance)}</td>
        </tr>
      ))}
      <tr style={{ background:`${color}10`, borderTop:`1px solid ${color}` }}>
        <td/><td style={{ padding:'7px 8px', fontWeight:700, fontSize:12 }}>{totalLabel}</td>
        <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700, color, fontSize:13 }}>{fmt(total)}</td>
      </tr>
      <tr><td colSpan={3} style={{ padding:6 }}/></tr>
    </>
  );
}

export default function BalanceSheetPage() {
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
      setData(r.data?.balanceSheet);
    } catch {} finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const period = dateRange ? `${dateRange[0].format('DD MMM YYYY')} to ${dateRange[1].format('DD MMM YYYY')}` : `As of ${dayjs().format('DD MMMM YYYY')}`;
  const bs = data;

  return (
    <div>
      <style>{PRINT_STYLE}</style>
      <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <Title level={4} style={{ margin:0 }}>Balance Sheet</Title>
          <Text type="secondary">Assets, Liabilities and Equity</Text>
        </div>
        <Space>
          <RangePicker onChange={dates => setDateRange(dates)} />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(!showPDF)}>{showPDF ? 'Hide PDF' : 'View PDF'}</Button>
          <ExportButton config={{ elementId:'bs-report', filename:'balance-sheet', data: bs ? [
            ...(bs.currentAssets||[]).map((a:any)=>({Section:'Current Assets', Code:a.accountCode, Account:a.accountName, Amount:Number(a.balance).toFixed(3)})),
            {Section:'TOTAL CURRENT ASSETS', Code:'', Account:'', Amount:Number(bs.totalCurrentAssets||0).toFixed(3)},
            ...(bs.fixedAssets||[]).map((a:any)=>({Section:'Fixed Assets', Code:a.accountCode, Account:a.accountName, Amount:Number(a.balance).toFixed(3)})),
            {Section:'TOTAL ASSETS', Code:'', Account:'', Amount:Number(bs.totalAssets||0).toFixed(3)},
            ...(bs.currentLiabilities||[]).map((a:any)=>({Section:'Current Liabilities', Code:a.accountCode, Account:a.accountName, Amount:Number(a.balance).toFixed(3)})),
            ...(bs.longTermLiabilities||[]).map((a:any)=>({Section:'Long-term Liabilities', Code:a.accountCode, Account:a.accountName, Amount:Number(a.balance).toFixed(3)})),
            ...(bs.equity||[]).map((a:any)=>({Section:'Equity', Code:a.accountCode, Account:a.accountName, Amount:Number(a.balance).toFixed(3)})),
            {Section:'TOTAL LIABILITIES & EQUITY', Code:'', Account:'', Amount:Number(bs.totalLiabilitiesEquity||0).toFixed(3)},
          ] : [], headers:['Section','Code','Account','Amount'], sheetName:'Balance Sheet', orientation:'landscape' as const }} />
        </Space>
      </div>

      {/* KPI Cards */}
      {bs && (
        <Row gutter={12} style={{ marginBottom:20 }} className="no-print">
          <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #1890ff', textAlign:'center' }}><Statistic title="Total Assets" prefix="OMR " value={Number(bs.totalAssets||0).toFixed(3)} valueStyle={{ color:'#1890ff', fontSize:18 }} /></Card></Col>
          <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #ff4d4f', textAlign:'center' }}><Statistic title="Total Liabilities" prefix="OMR " value={Number((bs.totalCurrentLiabilities||0)+(bs.totalLongTermLiabilities||0)).toFixed(3)} valueStyle={{ color:'#ff4d4f', fontSize:18 }} /></Card></Col>
          <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #2E6DA4', textAlign:'center' }}><Statistic title="Total Equity" prefix="OMR " value={Number(bs.totalEquity||0).toFixed(3)} valueStyle={{ color:'#2E6DA4', fontSize:18 }} /></Card></Col>
          <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${bs.isBalanced?'#52c41a':'#ff4d4f'}`, textAlign:'center' }}>
            <div style={{ padding:'12px 0', textAlign:'center' }}>
              {bs.isBalanced
                ? <><CheckCircleOutlined style={{ color:'#52c41a', fontSize:24 }}/><div style={{ color:'#52c41a', fontWeight:700, marginTop:4 }}>Balanced ✓</div></>
                : <><WarningOutlined style={{ color:'#ff4d4f', fontSize:24 }}/><div style={{ color:'#ff4d4f', fontWeight:700, marginTop:4 }}>Out of Balance</div></>}
            </div>
          </Card></Col>
        </Row>
      )}

      <div className="print-report-wrapper" style={{ background:'white' }} id="bs-report">
      <Card style={{ borderRadius:12 }} loading={loading}>
        <div className="print-report">
          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:24, borderBottom:'2px solid #1890ff', paddingBottom:16 }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#1890ff' }}>{company?.companyName || 'My Company'}</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#333', marginTop:4 }}>Balance Sheet</div>
            <div style={{ fontSize:12, color:'#666', marginTop:4 }}>{period}</div>
          </div>

          {!bs ? <div style={{ textAlign:'center', padding:40, color:'#8c8c8c' }}>No data. Click Refresh.</div> : (
            <>
              {bs.isBalanced
                ? <div style={{ background:'#f6ffed', border:'1px solid #b7eb8f', borderRadius:8, padding:'8px 16px', marginBottom:16, fontSize:13, color:'#52c41a' }}><CheckCircleOutlined /> Balance Sheet is balanced — Total Assets = Total Liabilities + Equity</div>
                : <div style={{ background:'#fff2f0', border:'1px solid #ffccc7', borderRadius:8, padding:'8px 16px', marginBottom:16, fontSize:13, color:'#ff4d4f' }}><WarningOutlined /> Out of balance by OMR {Math.abs(Number(bs.totalAssets||0) - Number(bs.totalLiabilitiesEquity||0)).toFixed(3)}</div>
              }
              <Row gutter={24}>
                {/* ASSETS */}
                <Col span={12}>
                  <div style={{ fontWeight:800, fontSize:15, color:'#1890ff', textAlign:'center', padding:'10px', background:'#1890ff15', borderRadius:'8px 8px 0 0', borderBottom:'2px solid #1890ff', marginBottom:0 }}>ASSETS</div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <tbody>
                      <Section title="CURRENT ASSETS" color="#1890ff" accounts={bs.currentAssets} total={bs.totalCurrentAssets} totalLabel="Total Current Assets" />
                      <Section title="FIXED ASSETS" color="#2f54eb" accounts={bs.fixedAssets} total={bs.totalFixedAssets} totalLabel="Total Fixed Assets" />
                      <tr style={{ background:'#1890ff', color:'#fff' }}>
                        <td/><td style={{ padding:'12px 8px', fontWeight:800, fontSize:15 }}>TOTAL ASSETS</td>
                        <td style={{ padding:'12px 12px', textAlign:'right', fontWeight:800, fontSize:16 }}>{fmt(bs.totalAssets)}</td>
                      </tr>
                    </tbody>
                  </table>
                </Col>

                {/* LIABILITIES + EQUITY */}
                <Col span={12}>
                  <div style={{ fontWeight:800, fontSize:15, color:'#ff4d4f', textAlign:'center', padding:'10px', background:'#ff4d4f15', borderRadius:'8px 8px 0 0', borderBottom:'2px solid #ff4d4f', marginBottom:0 }}>LIABILITIES & EQUITY</div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <tbody>
                      <Section title="CURRENT LIABILITIES" color="#ff4d4f" accounts={bs.currentLiabilities} total={bs.totalCurrentLiabilities} totalLabel="Total Current Liabilities" />
                      <Section title="LONG-TERM LIABILITIES" color="#c41d7f" accounts={bs.longTermLiabilities} total={bs.totalLongTermLiabilities} totalLabel="Total Long-term Liabilities" />
                      {/* Equity */}
                      <tr style={{ background:'#f9f0ff' }}>
                        <td colSpan={3} style={{ padding:'8px 12px', fontWeight:700, color:'#2E6DA4', fontSize:13, borderBottom:'2px solid #2E6DA4' }}>EQUITY</td>
                      </tr>
                      {(bs.equity||[]).map((a:any) => (
                        <tr key={a.accountCode} style={{ borderBottom:'1px solid #f5f5f5' }}>
                          <td style={{ padding:'5px 12px', color:'#8c8c8c', fontSize:11, width:'12%' }}>{a.accountCode}</td>
                          <td style={{ padding:'5px 8px', paddingLeft:20, fontSize:12, width:'55%' }}>{a.accountName}</td>
                          <td style={{ padding:'5px 12px', textAlign:'right', fontSize:12, color:'#2E6DA4', width:'33%' }}>{fmt(a.balance)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderBottom:'1px solid #f5f5f5' }}>
                        <td style={{ padding:'5px 12px', color:'#8c8c8c', fontSize:11 }}>—</td>
                        <td style={{ padding:'5px 8px', paddingLeft:20, fontSize:12 }}>Current Year {bs.netProfit>=0?'Profit':'Loss'}</td>
                        <td style={{ padding:'5px 12px', textAlign:'right', fontSize:12, color:bs.netProfit>=0?'#52c41a':'#ff4d4f' }}>{fmtSigned(bs.netProfit)}</td>
                      </tr>
                      <tr style={{ background:'#f9f0ff', borderTop:'1px solid #2E6DA4' }}>
                        <td/><td style={{ padding:'7px 8px', fontWeight:700, fontSize:12 }}>Total Equity</td>
                        <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700, color:'#2E6DA4', fontSize:13 }}>{fmt(bs.totalEquity)}</td>
                      </tr>
                      <tr><td colSpan={3} style={{ padding:6 }}/></tr>
                      <tr style={{ background:'#ff4d4f', color:'#fff' }}>
                        <td/><td style={{ padding:'12px 8px', fontWeight:800, fontSize:15 }}>TOTAL LIABILITIES & EQUITY</td>
                        <td style={{ padding:'12px 12px', textAlign:'right', fontWeight:800, fontSize:16 }}>{fmt(bs.totalLiabilitiesEquity)}</td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
            </>
          )}
          <div style={{ marginTop:32, paddingTop:16, borderTop:'1px solid #f0f0f0', fontSize:11, color:'#8c8c8c', display:'flex', justifyContent:'space-between' }}>
            <span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
            <span>All amounts in Omani Riyal (OMR)</span>
          </div>
        </div>
      </Card>
      </div>
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top: 0, padding: 0, maxWidth: "100vw" }} styles={{ body: { height: "95vh", overflow: "auto", padding: 16 } }} title="Balance Sheet — PDF Preview">
        {bs && <BalanceSheetPDF data={bs} period={period} />}
      </Modal>
    </div>
  );
}
