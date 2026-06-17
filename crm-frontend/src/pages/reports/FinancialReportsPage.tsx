import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Row, Col, Typography, Tag, Space, DatePicker, Tabs, Table, Divider, Statistic } from 'antd';
import { PrinterOutlined, ReloadOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../hooks/useCompanySettings';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const fmt = (n: number) => `OMR ${Math.abs(Number(n || 0)).toFixed(3)}`;
const fmtN = (n: number) => Number(n || 0) < 0 ? `(${fmt(n)})` : fmt(n);

// ── Print Styles ──────────────────────────────────────────────
const PRINT_STYLE = `
@media print {
  body * { visibility: hidden; }
  #financial-report, #financial-report * { visibility: visible; }
  #financial-report { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
  .ant-card { box-shadow: none !important; border: none !important; }
  .page-break { page-break-before: always; }
}`;

// ── Company Header ────────────────────────────────────────────
function ReportHeader({ title, period, company }: { title: string, period: string, company?: any }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #1890ff', paddingBottom: 16 }}>
      <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{company?.companyName || 'My Company'}</Title>
      <Title level={4} style={{ margin: '4px 0', color: '#333' }}>{title}</Title>
      <Text type="secondary" style={{ fontSize: 13 }}>{period}</Text>
    </div>
  );
}

// ── Section Row ───────────────────────────────────────────────
function SectionHeader({ title, color = '#1890ff' }: { title: string, color?: string }) {
  return (
    <tr style={{ background: `${color}15` }}>
      <td colSpan={4} style={{ padding: '8px 12px', fontWeight: 700, fontSize: 13, color, borderBottom: `2px solid ${color}` }}>
        {title}
      </td>
    </tr>
  );
}

function AccountRow({ account, indent = false }: { account: any, indent?: boolean }) {
  return (
    <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
      <td style={{ padding: '6px 12px 6px ' + (indent ? '24px' : '12px'), fontSize: 12, width: '8%' }}>
        <Text type="secondary">{account.accountCode}</Text>
      </td>
      <td style={{ padding: '6px 8px', fontSize: 13, width: '52%' }}>
        {account.accountName}
      </td>
      <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 13, width: '20%', color: '#52c41a' }}>
        {account.debit > 0 ? fmt(account.debit) : '—'}
      </td>
      <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 13, width: '20%', color: '#ff4d4f' }}>
        {account.credit > 0 ? fmt(account.credit) : '—'}
      </td>
    </tr>
  );
}

function TotalRow({ label, amount, bold = false, color = '#1890ff', indent = false, border = false }: any) {
  return (
    <tr style={{ borderTop: border ? `2px solid ${color}` : undefined, background: bold ? `${color}08` : undefined }}>
      <td style={{ padding: '8px 12px', width: '8%' }} />
      <td style={{ padding: '8px ' + (indent ? '24px' : '12px'), fontWeight: bold ? 700 : 600, fontSize: 13, width: '52%' }}>
        {label}
      </td>
      <td colSpan={2} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: bold ? 700 : 600, fontSize: bold ? 15 : 13, color }}>
        {fmtN(amount)}
      </td>
    </tr>
  );
}

// ── Trial Balance ─────────────────────────────────────────────
function TrialBalance({ data, period, company }: any) {
  const totalDebit = (data || []).reduce((s: number, a: any) => s + Number(a.debit || 0), 0);
  const totalCredit = (data || []).reduce((s: number, a: any) => s + Number(a.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div>
      <ReportHeader company={company} title="Trial Balance" period={period} />
      {!isBalanced && (
        <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#ff4d4f' }}><WarningOutlined /> Trial Balance is out of balance by OMR {Math.abs(totalDebit - totalCredit).toFixed(3)}</Text>
        </div>
      )}
      {isBalanced && (
        <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#52c41a' }}><CheckCircleOutlined /> Trial Balance is balanced</Text>
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1890ff', color: '#fff' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', width: '8%' }}>Code</th>
            <th style={{ padding: '10px 8px', textAlign: 'left', width: '52%' }}>Account Name</th>
            <th style={{ padding: '10px 8px', textAlign: 'right', width: '20%' }}>Debit (OMR)</th>
            <th style={{ padding: '10px 8px', textAlign: 'right', width: '20%' }}>Credit (OMR)</th>
          </tr>
        </thead>
        <tbody>
          {/* Assets */}
          <SectionHeader title="ASSETS" color="#1890ff" />
          {(data || []).filter((a: any) => a.accountType === 'ASSET').map((a: any) => <AccountRow key={a.accountCode} account={a} indent />)}
          {/* Liabilities */}
          <SectionHeader title="LIABILITIES" color="#ff4d4f" />
          {(data || []).filter((a: any) => a.accountType === 'LIABILITY').map((a: any) => <AccountRow key={a.accountCode} account={a} indent />)}
          {/* Equity */}
          <SectionHeader title="EQUITY" color="#2E6DA4" />
          {(data || []).filter((a: any) => a.accountType === 'EQUITY').map((a: any) => <AccountRow key={a.accountCode} account={a} indent />)}
          {/* Revenue */}
          <SectionHeader title="REVENUE" color="#52c41a" />
          {(data || []).filter((a: any) => a.accountType === 'REVENUE').map((a: any) => <AccountRow key={a.accountCode} account={a} indent />)}
          {/* Expenses */}
          <SectionHeader title="EXPENSES" color="#fa8c16" />
          {(data || []).filter((a: any) => a.accountType === 'EXPENSE').map((a: any) => <AccountRow key={a.accountCode} account={a} indent />)}
          {/* Totals */}
          <tr style={{ background: '#1890ff', color: '#fff' }}>
            <td style={{ padding: '12px' }} />
            <td style={{ padding: '12px', fontWeight: 700, fontSize: 14 }}>TOTAL</td>
            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, fontSize: 14 }}>{fmt(totalDebit)}</td>
            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, fontSize: 14 }}>{fmt(totalCredit)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Profit & Loss ─────────────────────────────────────────────
function ProfitLoss({ data, period, company }: any) {
  if (!data) return null;
  const { revenue, cogs, opex, totalRevenue, totalCogs, grossProfit, totalOpex, netProfit, grossMargin, netMargin } = data;

  return (
    <div>
      <ReportHeader company={company} title="Profit & Loss Statement" period={period} />
      <Row gutter={16} style={{ marginBottom: 24 }} className="no-print">
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a', textAlign: 'center' }}><Statistic title="Revenue" prefix="OMR " value={Number(totalRevenue).toFixed(3)} valueStyle={{ color: '#52c41a', fontSize: 18 }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff', textAlign: 'center' }}><Statistic title="Gross Profit" prefix="OMR " value={Number(grossProfit).toFixed(3)} valueStyle={{ color: '#1890ff', fontSize: 18 }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: `3px solid ${netProfit >= 0 ? '#52c41a' : '#ff4d4f'}`, textAlign: 'center' }}><Statistic title="Net Profit" prefix="OMR " value={Number(netProfit).toFixed(3)} valueStyle={{ color: netProfit >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 18 }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #2E6DA4', textAlign: 'center' }}><Statistic title="Net Margin" suffix="%" value={Number(netMargin).toFixed(1)} valueStyle={{ color: '#2E6DA4', fontSize: 18 }} /></Card></Col>
      </Row>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#52c41a', color: '#fff' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', width: '8%' }}>Code</th>
            <th style={{ padding: '10px 8px', textAlign: 'left', width: '60%' }}>Account</th>
            <th style={{ padding: '10px 8px', textAlign: 'right', width: '32%' }}>Amount (OMR)</th>
          </tr>
        </thead>
        <tbody>
          {/* Revenue */}
          <tr style={{ background: '#f6ffed' }}><td colSpan={3} style={{ padding: '8px 12px', fontWeight: 700, color: '#52c41a', fontSize: 13 }}>REVENUE</td></tr>
          {(revenue || []).map((a: any) => (
            <tr key={a.accountCode} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '6px 12px', fontSize: 12, color: '#8c8c8c' }}>{a.accountCode}</td>
              <td style={{ padding: '6px 8px', paddingLeft: 24, fontSize: 13 }}>{a.accountName}</td>
              <td style={{ padding: '6px 12px', textAlign: 'right', fontSize: 13, color: '#52c41a' }}>{fmt(a.balance)}</td>
            </tr>
          ))}
          <TotalRow label="Total Revenue" amount={totalRevenue} color="#52c41a" border />
          <tr><td colSpan={3} style={{ padding: 8 }} /></tr>

          {/* COGS */}
          <tr style={{ background: '#fff7e6' }}><td colSpan={3} style={{ padding: '8px 12px', fontWeight: 700, color: '#fa8c16', fontSize: 13 }}>COST OF GOODS SOLD</td></tr>
          {(cogs || []).map((a: any) => (
            <tr key={a.accountCode} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '6px 12px', fontSize: 12, color: '#8c8c8c' }}>{a.accountCode}</td>
              <td style={{ padding: '6px 8px', paddingLeft: 24, fontSize: 13 }}>{a.accountName}</td>
              <td style={{ padding: '6px 12px', textAlign: 'right', fontSize: 13, color: '#fa8c16' }}>{fmt(a.balance)}</td>
            </tr>
          ))}
          <TotalRow label="Total COGS" amount={totalCogs} color="#fa8c16" border />
          <TotalRow label={`Gross Profit (${Number(grossMargin).toFixed(1)}% margin)`} amount={grossProfit} bold color={grossProfit >= 0 ? '#1890ff' : '#ff4d4f'} border />
          <tr><td colSpan={3} style={{ padding: 8 }} /></tr>

          {/* Operating Expenses */}
          <tr style={{ background: '#fff2f0' }}><td colSpan={3} style={{ padding: '8px 12px', fontWeight: 700, color: '#ff4d4f', fontSize: 13 }}>OPERATING EXPENSES</td></tr>
          {(opex || []).map((a: any) => (
            <tr key={a.accountCode} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '6px 12px', fontSize: 12, color: '#8c8c8c' }}>{a.accountCode}</td>
              <td style={{ padding: '6px 8px', paddingLeft: 24, fontSize: 13 }}>{a.accountName}</td>
              <td style={{ padding: '6px 12px', textAlign: 'right', fontSize: 13, color: '#ff4d4f' }}>{fmt(a.balance)}</td>
            </tr>
          ))}
          <TotalRow label="Total Operating Expenses" amount={totalOpex} color="#ff4d4f" border />
          <tr><td colSpan={3} style={{ padding: 6 }} /></tr>

          {/* Net Profit */}
          <tr style={{ background: netProfit >= 0 ? '#f6ffed' : '#fff2f0', borderTop: '3px double #333' }}>
            <td style={{ padding: '14px 12px' }} />
            <td style={{ padding: '14px 8px', fontWeight: 800, fontSize: 16 }}>NET {netProfit >= 0 ? 'PROFIT' : 'LOSS'}</td>
            <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 800, fontSize: 18, color: netProfit >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {fmtN(netProfit)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Balance Sheet ─────────────────────────────────────────────
function BalanceSheet({ data, period, company }: any) {
  if (!data) return null;
  const { currentAssets, fixedAssets, currentLiabilities, longTermLiabilities, equity,
    totalCurrentAssets, totalFixedAssets, totalAssets,
    totalCurrentLiabilities, totalLongTermLiabilities, totalEquity,
    totalLiabilitiesEquity, netProfit, isBalanced } = data;

  return (
    <div>
      <ReportHeader company={company} title="Balance Sheet" period={period} />
      {isBalanced
        ? <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: 10, marginBottom: 16 }}><Text style={{ color: '#52c41a' }}><CheckCircleOutlined /> Balance Sheet is balanced — Assets = Liabilities + Equity</Text></div>
        : <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, padding: 10, marginBottom: 16 }}><Text style={{ color: '#ff4d4f' }}><WarningOutlined /> Balance Sheet is out of balance by OMR {Math.abs(totalAssets - totalLiabilitiesEquity).toFixed(3)}</Text></div>
      }
      <Row gutter={16}>
        {/* Left: Assets */}
        <Col span={12}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1890ff', color: '#fff' }}>
                <th colSpan={3} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 14 }}>ASSETS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#e6f7ff' }}><td colSpan={3} style={{ padding: '8px 12px', fontWeight: 700, color: '#1890ff', fontSize: 12 }}>CURRENT ASSETS</td></tr>
              {(currentAssets || []).map((a: any) => (
                <tr key={a.accountCode} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '5px 12px', fontSize: 11, color: '#8c8c8c', width: '15%' }}>{a.accountCode}</td>
                  <td style={{ padding: '5px 8px', fontSize: 12, paddingLeft: 20 }}>{a.accountName}</td>
                  <td style={{ padding: '5px 12px', textAlign: 'right', fontSize: 12, color: '#1890ff' }}>{fmt(a.balance)}</td>
                </tr>
              ))}
              <tr style={{ background: '#e6f7ff', borderTop: '1px solid #1890ff' }}>
                <td /><td style={{ padding: '7px 8px', fontWeight: 700, fontSize: 12 }}>Total Current Assets</td>
                <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: '#1890ff' }}>{fmt(totalCurrentAssets)}</td>
              </tr>
              <tr><td colSpan={3} style={{ padding: 6 }} /></tr>
              <tr style={{ background: '#f0f5ff' }}><td colSpan={3} style={{ padding: '8px 12px', fontWeight: 700, color: '#2f54eb', fontSize: 12 }}>FIXED ASSETS</td></tr>
              {(fixedAssets || []).map((a: any) => (
                <tr key={a.accountCode} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '5px 12px', fontSize: 11, color: '#8c8c8c' }}>{a.accountCode}</td>
                  <td style={{ padding: '5px 8px', fontSize: 12, paddingLeft: 20 }}>{a.accountName}</td>
                  <td style={{ padding: '5px 12px', textAlign: 'right', fontSize: 12, color: '#2f54eb' }}>{fmt(a.balance)}</td>
                </tr>
              ))}
              <tr style={{ background: '#f0f5ff', borderTop: '1px solid #2f54eb' }}>
                <td /><td style={{ padding: '7px 8px', fontWeight: 700, fontSize: 12 }}>Total Fixed Assets</td>
                <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: '#2f54eb' }}>{fmt(totalFixedAssets)}</td>
              </tr>
              <tr style={{ background: '#1890ff', color: '#fff' }}>
                <td /><td style={{ padding: '12px 8px', fontWeight: 800, fontSize: 14 }}>TOTAL ASSETS</td>
                <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, fontSize: 15 }}>{fmt(totalAssets)}</td>
              </tr>
            </tbody>
          </table>
        </Col>

        {/* Right: Liabilities + Equity */}
        <Col span={12}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ff4d4f', color: '#fff' }}>
                <th colSpan={3} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 14 }}>LIABILITIES & EQUITY</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#fff2f0' }}><td colSpan={3} style={{ padding: '8px 12px', fontWeight: 700, color: '#ff4d4f', fontSize: 12 }}>CURRENT LIABILITIES</td></tr>
              {(currentLiabilities || []).map((a: any) => (
                <tr key={a.accountCode} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '5px 12px', fontSize: 11, color: '#8c8c8c', width: '15%' }}>{a.accountCode}</td>
                  <td style={{ padding: '5px 8px', fontSize: 12, paddingLeft: 20 }}>{a.accountName}</td>
                  <td style={{ padding: '5px 12px', textAlign: 'right', fontSize: 12, color: '#ff4d4f' }}>{fmt(a.balance)}</td>
                </tr>
              ))}
              <tr style={{ background: '#fff2f0', borderTop: '1px solid #ff4d4f' }}>
                <td /><td style={{ padding: '7px 8px', fontWeight: 700, fontSize: 12 }}>Total Current Liabilities</td>
                <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: '#ff4d4f' }}>{fmt(totalCurrentLiabilities)}</td>
              </tr>
              <tr><td colSpan={3} style={{ padding: 6 }} /></tr>
              <tr style={{ background: '#fff0f6' }}><td colSpan={3} style={{ padding: '8px 12px', fontWeight: 700, color: '#c41d7f', fontSize: 12 }}>LONG-TERM LIABILITIES</td></tr>
              {(longTermLiabilities || []).map((a: any) => (
                <tr key={a.accountCode} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '5px 12px', fontSize: 11, color: '#8c8c8c' }}>{a.accountCode}</td>
                  <td style={{ padding: '5px 8px', fontSize: 12, paddingLeft: 20 }}>{a.accountName}</td>
                  <td style={{ padding: '5px 12px', textAlign: 'right', fontSize: 12, color: '#c41d7f' }}>{fmt(a.balance)}</td>
                </tr>
              ))}
              <tr style={{ background: '#fff0f6', borderTop: '1px solid #c41d7f' }}>
                <td /><td style={{ padding: '7px 8px', fontWeight: 700, fontSize: 12 }}>Total Long-term Liabilities</td>
                <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: '#c41d7f' }}>{fmt(totalLongTermLiabilities)}</td>
              </tr>
              <tr><td colSpan={3} style={{ padding: 6 }} /></tr>
              <tr style={{ background: '#f9f0ff' }}><td colSpan={3} style={{ padding: '8px 12px', fontWeight: 700, color: '#2E6DA4', fontSize: 12 }}>EQUITY</td></tr>
              {(equity || []).map((a: any) => (
                <tr key={a.accountCode} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '5px 12px', fontSize: 11, color: '#8c8c8c' }}>{a.accountCode}</td>
                  <td style={{ padding: '5px 8px', fontSize: 12, paddingLeft: 20 }}>{a.accountName}</td>
                  <td style={{ padding: '5px 12px', textAlign: 'right', fontSize: 12, color: '#2E6DA4' }}>{fmt(a.balance)}</td>
                </tr>
              ))}
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '5px 12px', fontSize: 11, color: '#8c8c8c' }}>—</td>
                <td style={{ padding: '5px 8px', paddingLeft: 20, fontSize: 12 }}>Current Year {netProfit >= 0 ? 'Profit' : 'Loss'}</td>
                <td style={{ padding: '5px 12px', textAlign: 'right', fontSize: 12, color: netProfit >= 0 ? '#52c41a' : '#ff4d4f' }}>{fmtN(netProfit)}</td>
              </tr>
              <tr style={{ background: '#f9f0ff', borderTop: '1px solid #2E6DA4' }}>
                <td /><td style={{ padding: '7px 8px', fontWeight: 700, fontSize: 12 }}>Total Equity</td>
                <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: '#2E6DA4' }}>{fmt(totalEquity)}</td>
              </tr>
              <tr style={{ background: '#ff4d4f', color: '#fff' }}>
                <td /><td style={{ padding: '12px 8px', fontWeight: 800, fontSize: 14 }}>TOTAL LIABILITIES & EQUITY</td>
                <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, fontSize: 15 }}>{fmt(totalLiabilitiesEquity)}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function FinancialReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);
  const { settings: company } = useCompanySettings();
  const [activeTab, setActiveTab] = useState('pnl');
  const printRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/financial', { params });
      setData(r.data);
    } catch {} finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const handlePrint = () => window.print();

  const period = dateRange
    ? `${dateRange[0].format('DD MMM YYYY')} — ${dateRange[1].format('DD MMM YYYY')}`
    : `As of ${dayjs().format('DD MMM YYYY')}`;

  const items = [
    {
      key: 'pnl', label: '📈 Profit & Loss',
      children: <ProfitLoss company={company} data={data?.pnl} period={period} />,
    },
    {
      key: 'bs', label: '⚖️ Balance Sheet',
      children: <BalanceSheet company={company} data={data?.balanceSheet} period={period} />,
    },
    {
      key: 'tb', label: '📋 Trial Balance',
      children: <TrialBalance company={company} data={data?.trialBalance} period={period} />,
    },
  ];

  return (
    <div>
      <style>{PRINT_STYLE}</style>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Financial Reports</Title>
          <Text type="secondary">Profit & Loss, Balance Sheet and Trial Balance</Text>
        </div>
        <Space>
          <RangePicker onChange={dates => setDateRange(dates)} />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>Print / Export PDF</Button>
        </Space>
      </div>

      <div id="financial-report" ref={printRef}>
        <Card style={{ borderRadius: 12 }} loading={loading}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} className="no-print" />
          {/* Print renders active tab content */}
          <div style={{ display: 'none' }} className="print-only">
            <ProfitLoss company={company} data={data?.pnl} period={period} />
            <div className="page-break" />
            <BalanceSheet company={company} data={data?.balanceSheet} period={period} />
            <div className="page-break" />
            <TrialBalance company={company} data={data?.trialBalance} period={period} />
          </div>
        </Card>
      </div>
    </div>
  );
}
