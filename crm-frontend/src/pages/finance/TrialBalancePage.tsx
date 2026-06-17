import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Modal, Row, Col, Statistic, DatePicker, Space, Input } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, WarningOutlined, SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import axios from 'axios';
import ExportButton from '../../components/common/ExportButton';
import { TrialBalancePDF } from '../../components/pdf/ReportPDF';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../hooks/useCompanySettings';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const fmt = (n: number) => Number(n||0) > 0 ? `OMR ${Number(n).toFixed(3)}` : '—';

const PRINT_STYLE = `@media print {
  /* Hide everything */
  body > * { display: none !important; }
  /* Show only the report card */
  .print-report-wrapper { display: block !important; position: fixed; top: 0; left: 0; width: 100%; z-index: 99999; background: white; }
  .no-print { display: none !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @page { margin: 15mm; size: A4; }
}`;

const TYPE_COLOR: Record<string,string> = { ASSET:'#1890ff', LIABILITY:'#ff4d4f', EQUITY:'#2E6DA4', REVENUE:'#52c41a', EXPENSE:'#fa8c16' };

export default function TrialBalancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { settings: company } = useCompanySettings();
  const [showPDF, setShowPDF] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/financial', { params });
      setData(r.data?.trialBalance || []);
    } catch {} finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const period = dateRange ? `${dateRange[0].format('DD MMM YYYY')} to ${dateRange[1].format('DD MMM YYYY')}` : `As of ${dayjs().format('DD MMMM YYYY')}`;

  const filtered = data.filter(a =>
    !search || a.accountName?.toLowerCase().includes(search.toLowerCase()) || a.accountCode?.includes(search)
  );

  const totalDebit = filtered.reduce((s:number, a:any) => s + Number(a.debit||0), 0);
  const totalCredit = filtered.reduce((s:number, a:any) => s + Number(a.credit||0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const groups = ['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'];

  return (
    <div>
      <style>{PRINT_STYLE}</style>
      <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <Title level={4} style={{ margin:0 }}>Trial Balance</Title>
          <Text type="secondary">All account debit and credit balances</Text>
        </div>
        <Space>
          <RangePicker onChange={dates => setDateRange(dates)} />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(!showPDF)}>{showPDF ? 'Hide PDF' : 'View PDF'}</Button>
          <ExportButton config={{ elementId:'tb-report', filename:'trial-balance',
            data: filtered.map((a:any)=>({ Code:a.accountCode, Account:a.accountName, Type:a.accountType, Subtype:a.accountSubtype, Debit:Number(a.debit||0).toFixed(3), Credit:Number(a.credit||0).toFixed(3) })),
            headers:['Code','Account','Type','Subtype','Debit','Credit'], sheetName:'Trial Balance' }} />
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={12} style={{ marginBottom:20 }} className="no-print">
        <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #1890ff', textAlign:'center' }}><Statistic title="Total Accounts" value={filtered.length} valueStyle={{ color:'#1890ff' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #52c41a', textAlign:'center' }}><Statistic title="Total Debit" prefix="OMR " value={totalDebit.toFixed(3)} valueStyle={{ color:'#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #ff4d4f', textAlign:'center' }}><Statistic title="Total Credit" prefix="OMR " value={totalCredit.toFixed(3)} valueStyle={{ color:'#ff4d4f' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${isBalanced?'#52c41a':'#ff4d4f'}`, textAlign:'center' }}>
          <div style={{ padding:'12px 0' }}>
            {isBalanced
              ? <><CheckCircleOutlined style={{ color:'#52c41a', fontSize:24 }}/><div style={{ color:'#52c41a', fontWeight:700, marginTop:4 }}>Balanced ✓</div></>
              : <><WarningOutlined style={{ color:'#ff4d4f', fontSize:24 }}/><div style={{ color:'#ff4d4f', fontWeight:700, marginTop:4 }}>Out of Balance</div></>}
          </div>
        </Card></Col>
      </Row>

      <div className="print-report-wrapper" style={{ background:'white' }} id="tb-report">
      <Card style={{ borderRadius:12 }} loading={loading}>
        <div className="no-print" style={{ marginBottom:12 }}>
          <Input prefix={<SearchOutlined />} placeholder="Search account..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:300 }} />
        </div>

        <div className="print-report">
          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:24, borderBottom:'2px solid #1890ff', paddingBottom:16 }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#1890ff' }}>{company?.companyName || 'My Company'}</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#333', marginTop:4 }}>Trial Balance</div>
            <div style={{ fontSize:12, color:'#666', marginTop:4 }}>{period}</div>
          </div>

          {isBalanced
            ? <div style={{ background:'#f6ffed', border:'1px solid #b7eb8f', borderRadius:8, padding:'8px 16px', marginBottom:16, fontSize:13, color:'#52c41a' }}><CheckCircleOutlined /> Trial Balance is balanced — Total Debits = Total Credits</div>
            : <div style={{ background:'#fff2f0', border:'1px solid #ffccc7', borderRadius:8, padding:'8px 16px', marginBottom:16, fontSize:13, color:'#ff4d4f' }}><WarningOutlined /> Out of balance by OMR {Math.abs(totalDebit - totalCredit).toFixed(3)}</div>
          }

          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#1890ff', color:'#fff' }}>
                <th style={{ padding:'10px 12px', textAlign:'left', width:'10%' }}>Code</th>
                <th style={{ padding:'10px 8px', textAlign:'left', width:'40%' }}>Account Name</th>
                <th style={{ padding:'10px 8px', textAlign:'center', width:'15%' }}>Type</th>
                <th style={{ padding:'10px 8px', textAlign:'right', width:'17%' }}>Debit (OMR)</th>
                <th style={{ padding:'10px 8px', textAlign:'right', width:'18%' }}>Credit (OMR)</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(grp => {
                const grpAccounts = filtered.filter(a => a.accountType === grp);
                if (grpAccounts.length === 0) return null;
                const grpDebit = grpAccounts.reduce((s,a) => s+Number(a.debit||0), 0);
                const grpCredit = grpAccounts.reduce((s,a) => s+Number(a.credit||0), 0);
                return (
                  <React.Fragment key={grp}>
                    <tr style={{ background:`${TYPE_COLOR[grp]}15` }}>
                      <td colSpan={5} style={{ padding:'8px 12px', fontWeight:700, color:TYPE_COLOR[grp], fontSize:13, borderBottom:`2px solid ${TYPE_COLOR[grp]}` }}>{grp}</td>
                    </tr>
                    {grpAccounts.map((a:any) => (
                      <tr key={a.accountCode} style={{ borderBottom:'1px solid #f5f5f5' }}>
                        <td style={{ padding:'6px 12px', color:'#8c8c8c', fontSize:11 }}>{a.accountCode}</td>
                        <td style={{ padding:'6px 8px', paddingLeft:20 }}>{a.accountName}</td>
                        <td style={{ padding:'6px 8px', textAlign:'center' }}>
                          <span style={{ background:`${TYPE_COLOR[a.accountType]}15`, color:TYPE_COLOR[a.accountType], padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{a.accountSubtype}</span>
                        </td>
                        <td style={{ padding:'6px 12px', textAlign:'right', color:'#52c41a' }}>{fmt(a.debit)}</td>
                        <td style={{ padding:'6px 12px', textAlign:'right', color:'#ff4d4f' }}>{fmt(a.credit)}</td>
                      </tr>
                    ))}
                    <tr style={{ background:`${TYPE_COLOR[grp]}08`, borderTop:`1px solid ${TYPE_COLOR[grp]}` }}>
                      <td colSpan={3} style={{ padding:'7px 12px', fontWeight:700, fontSize:12, color:TYPE_COLOR[grp] }}>Subtotal — {grp}</td>
                      <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700, color:'#52c41a' }}>{grpDebit > 0 ? `OMR ${grpDebit.toFixed(3)}` : '—'}</td>
                      <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700, color:'#ff4d4f' }}>{grpCredit > 0 ? `OMR ${grpCredit.toFixed(3)}` : '—'}</td>
                    </tr>
                    <tr><td colSpan={5} style={{ padding:6 }}/></tr>
                  </React.Fragment>
                );
              })}

              {/* Grand Total */}
              <tr style={{ background:'#1890ff', color:'#fff', borderTop:'3px solid #1890ff' }}>
                <td colSpan={3} style={{ padding:'12px', fontWeight:800, fontSize:15 }}>GRAND TOTAL</td>
                <td style={{ padding:'12px', textAlign:'right', fontWeight:800, fontSize:15 }}>OMR {totalDebit.toFixed(3)}</td>
                <td style={{ padding:'12px', textAlign:'right', fontWeight:800, fontSize:15 }}>OMR {totalCredit.toFixed(3)}</td>
              </tr>
              {!isBalanced && (
                <tr style={{ background:'#fff2f0' }}>
                  <td colSpan={3} style={{ padding:'8px 12px', color:'#ff4d4f', fontWeight:600 }}>Difference (Out of Balance)</td>
                  <td colSpan={2} style={{ padding:'8px 12px', textAlign:'right', color:'#ff4d4f', fontWeight:700 }}>OMR {Math.abs(totalDebit - totalCredit).toFixed(3)}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop:32, paddingTop:16, borderTop:'1px solid #f0f0f0', fontSize:11, color:'#8c8c8c', display:'flex', justifyContent:'space-between' }}>
            <span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
            <span>All amounts in Omani Riyal (OMR)</span>
          </div>
        </div>
      </Card>
      </div>
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top: 0, padding: 0, maxWidth: "100vw" }} styles={{ body: { height: "95vh", overflow: "auto", padding: 16 } }} title="Trial Balance — PDF Preview">
        {data.length > 0 && <TrialBalancePDF data={filtered} period={period} />}
      </Modal>
    </div>
  );
}
