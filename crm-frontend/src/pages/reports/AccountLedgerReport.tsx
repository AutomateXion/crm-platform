import React, { useState, useCallback, useEffect } from 'react';
import { Card, Table, Button, Row, Col, Typography, Tag, Space, Statistic, DatePicker, Input, Empty, Tabs, Select } from 'antd';
import { DownloadOutlined, SearchOutlined, UserOutlined, ShopOutlined, EyeOutlined, BookOutlined } from '@ant-design/icons';
import axios from 'axios';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const TYPE_COLOR: Record<string, string> = {
  'SALES INVOICE': '#1890ff', 'RECEIPT': '#52c41a',
  'PURCHASE INVOICE': '#722ed1', 'PAYMENT': '#fa8c16', 'JOURNAL': '#13c2c2',
};

const ACCT_TYPE_COLOR: Record<string, string> = {
  ASSET: '#1890ff', LIABILITY: '#ff4d4f', EQUITY: '#722ed1',
  INCOME: '#52c41a', EXPENSE: '#fa8c16', COGS: '#eb2f96',
};

function LedgerTable({ transactions, loading, summary }: any) {
  const columns = [
    { title: 'Date', dataIndex: 'date', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
    { title: 'Type', dataIndex: 'type', width: 140, render: (v: string) => (
      <Tag style={{ background: `${TYPE_COLOR[v] || '#ccc'}15`, color: TYPE_COLOR[v] || '#666', border: 'none', fontWeight: 600, fontSize: 11 }}>{v}</Tag>
    )},
    { title: 'Reference', dataIndex: 'reference', width: 130, render: (v: string) => <Text style={{ fontSize: 12, color: '#1890ff' }}>{v}</Text> },
    { title: 'Description / Party', dataIndex: 'party', render: (v: string, r: any) => <Text style={{ fontSize: 13 }}>{v || r.description || '—'}</Text> },
    { title: 'Debit', dataIndex: 'debit', align: 'right' as const, width: 120, render: (v: number) =>
      v > 0 ? <Text strong style={{ color: '#ff4d4f' }}>OMR {Number(v).toFixed(3)}</Text> : <Text type="secondary">—</Text> },
    { title: 'Credit', dataIndex: 'credit', align: 'right' as const, width: 120, render: (v: number) =>
      v > 0 ? <Text strong style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> : <Text type="secondary">—</Text> },
    { title: 'Balance', dataIndex: 'runningBalance', align: 'right' as const, width: 130, render: (v: number) => (
      <Text strong style={{ color: v > 0 ? '#ff4d4f' : v < 0 ? '#52c41a' : '#595959' }}>
        OMR {Math.abs(Number(v)).toFixed(3)} {v > 0 ? 'DR' : v < 0 ? 'CR' : ''}
      </Text>
    )},
    { title: 'Status', dataIndex: 'status', width: 100, render: (v: string) => v ? (
      <Tag color={v === 'PAID' ? 'green' : v === 'PARTIALLY_PAID' ? 'orange' : v === 'SENT' ? 'blue' : 'default'}>{v}</Tag>
    ) : null },
  ];

  return (
    <>
      {summary && (
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff' }}><Statistic title="Transactions" value={transactions?.length || 0} valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f' }}><Statistic title="Total Debit" prefix="OMR " value={Number(summary.totalDebit || 0).toFixed(3)} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
          <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a' }}><Statistic title="Total Credit" prefix="OMR " value={Number(summary.totalCredit || 0).toFixed(3)} valueStyle={{ color: '#52c41a' }} /></Card></Col>
          <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: `3px solid ${Number(summary.closingBalance || 0) >= 0 ? '#ff4d4f' : '#52c41a'}` }}>
            <Statistic title="Closing Balance" prefix="OMR "
              value={Math.abs(Number(summary.closingBalance || 0)).toFixed(3)}
              suffix={Number(summary.closingBalance || 0) > 0 ? ' DR' : Number(summary.closingBalance || 0) < 0 ? ' CR' : ''}
              valueStyle={{ color: Number(summary.closingBalance || 0) > 0 ? '#ff4d4f' : '#52c41a' }} />
          </Card></Col>
        </Row>
      )}
      <Table dataSource={transactions} columns={columns} rowKey={(_: any, i: number) => `row-${i}`}
        size="small" loading={loading} pagination={{ pageSize: 20, showTotal: t => `${t} transactions` }}
        summary={() => summary ? (
          <Table.Summary.Row style={{ background: '#fafafa' }}>
            <Table.Summary.Cell index={0} colSpan={4}><Text strong>CLOSING BALANCE</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right"><Text strong style={{ color: '#ff4d4f' }}>OMR {Number(summary.totalDebit || 0).toFixed(3)}</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="right"><Text strong style={{ color: '#52c41a' }}>OMR {Number(summary.totalCredit || 0).toFixed(3)}</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="right">
              <Text strong style={{ color: Number(summary.closingBalance || 0) > 0 ? '#ff4d4f' : '#52c41a', fontSize: 14 }}>
                OMR {Math.abs(Number(summary.closingBalance || 0)).toFixed(3)} {Number(summary.closingBalance || 0) > 0 ? 'DR' : 'CR'}
              </Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7} />
          </Table.Summary.Row>
        ) : undefined}
      />
    </>
  );
}

function CustomerLedger() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/accounts', { params: { limit: 500 } }).then(r => setAccounts(r.data.data || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const params: any = { customerName: selected };
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/account-ledger', { params });
      setReport(r.data);
    } catch {}
    finally { setLoading(false); }
  }, [selected, dateRange]);

  const exportCSV = () => {
    if (!report) return;
    const headers = 'Date,Type,Reference,Party,Debit,Credit,Running Balance,Status';
    const rows = (report.transactions || []).map((t: any) => [
      t.date ? dayjs(t.date).format('YYYY-MM-DD') : '', t.type, t.reference, t.party,
      Number(t.debit).toFixed(3), Number(t.credit).toFixed(3), Number(t.runningBalance).toFixed(3), t.status
    ].join(','));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' }));
    a.download = `customer-ledger-${selected}-${dayjs().format('YYYY-MM-DD')}.csv`; a.click();
  };

  return (
    <div>
      <Card style={{ borderRadius: 12, marginBottom: 16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={9}>
            <Select showSearch placeholder="Select customer..." style={{ width: '100%' }}
              optionFilterProp="children" value={selected || undefined} onChange={setSelected} allowClear>
              {accounts.map(a => <Option key={a.accountName} value={a.accountName}>{a.accountName}</Option>)}
            </Select>
          </Col>
          <Col span={8}><RangePicker style={{ width: '100%' }} onChange={dates => setDateRange(dates)} /></Col>
          <Col span={3}><Button type="primary" onClick={load} loading={loading} disabled={!selected} block>Search</Button></Col>
          <Col span={4}><Button icon={<DownloadOutlined />} onClick={exportCSV} disabled={!report} block>Export</Button></Col>
        </Row>
      </Card>
      {!report ? <Empty description="Select a customer and click Search" style={{ padding: 40 }} /> :
        <Card title={<Space><Text strong>Ledger:</Text><Text style={{ color: '#1890ff' }}>{selected}</Text></Space>} style={{ borderRadius: 12 }} size="small">
          <LedgerTable transactions={report.transactions} loading={loading} summary={report.summary} />
        </Card>}
    </div>
  );
}

function SupplierLedger() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sApi.get('/sales/suppliers', { params: { limit: 500 } }).then(r => setSuppliers(r.data.data || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const params: any = { supplierName: selected };
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/account-ledger', { params });
      setReport(r.data);
    } catch {}
    finally { setLoading(false); }
  }, [selected, dateRange]);

  const exportCSV = () => {
    if (!report) return;
    const headers = 'Date,Type,Reference,Party,Debit,Credit,Running Balance,Status';
    const rows = (report.transactions || []).map((t: any) => [
      t.date ? dayjs(t.date).format('YYYY-MM-DD') : '', t.type, t.reference, t.party,
      Number(t.debit).toFixed(3), Number(t.credit).toFixed(3), Number(t.runningBalance).toFixed(3), t.status
    ].join(','));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' }));
    a.download = `supplier-ledger-${selected}-${dayjs().format('YYYY-MM-DD')}.csv`; a.click();
  };

  return (
    <div>
      <Card style={{ borderRadius: 12, marginBottom: 16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={9}>
            <Select showSearch placeholder="Select supplier..." style={{ width: '100%' }}
              optionFilterProp="children" value={selected || undefined} onChange={setSelected} allowClear>
              {suppliers.map(s => <Option key={s.supplierName} value={s.supplierName}>{s.supplierName}</Option>)}
            </Select>
          </Col>
          <Col span={8}><RangePicker style={{ width: '100%' }} onChange={dates => setDateRange(dates)} /></Col>
          <Col span={3}><Button type="primary" onClick={load} loading={loading} disabled={!selected} block>Search</Button></Col>
          <Col span={4}><Button icon={<DownloadOutlined />} onClick={exportCSV} disabled={!report} block>Export</Button></Col>
        </Row>
      </Card>
      {!report ? <Empty description="Select a supplier and click Search" style={{ padding: 40 }} /> :
        <Card title={<Space><Text strong>Ledger:</Text><Text style={{ color: '#722ed1' }}>{selected}</Text></Space>} style={{ borderRadius: 12 }} size="small">
          <LedgerTable transactions={report.transactions} loading={loading} summary={report.summary} />
        </Card>}
    </div>
  );
}

function GLLedger() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    sApi.get('/sales/chart-of-accounts').then(r => setAccounts(r.data || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const params: any = { accountId: selected };
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/gl-ledger', { params });
      setReport(r.data);
    } catch {}
    finally { setLoading(false); }
  }, [selected, dateRange]);

  const filteredAccounts = accounts.filter(a => !typeFilter || a.accountType === typeFilter);
  const types = [...new Set(accounts.map(a => a.accountType).filter(Boolean))];
  const selectedAccount = accounts.find(a => a.accountId === selected);

  return (
    <div>
      <Card style={{ borderRadius: 12, marginBottom: 16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={4}>
            <Select placeholder="Account Type" style={{ width: '100%' }} allowClear onChange={setTypeFilter}>
              {types.map(t => <Option key={t} value={t}>
                <Tag color={ACCT_TYPE_COLOR[t] || 'default'} style={{ border: 'none' }}>{t}</Tag>
              </Option>)}
            </Select>
          </Col>
          <Col span={7}>
            <Select showSearch placeholder="Select GL Account..." style={{ width: '100%' }}
              optionFilterProp="children" value={selected || undefined} onChange={setSelected} allowClear>
              {filteredAccounts.map(a => (
                <Option key={a.accountId} value={a.accountId}>
                  <Space>
                    <Tag color={ACCT_TYPE_COLOR[a.accountType] || 'default'} style={{ border: 'none', fontSize: 10 }}>{a.accountType}</Tag>
                    {a.accountCode} — {a.accountName}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={7}><RangePicker style={{ width: '100%' }} onChange={dates => setDateRange(dates)} /></Col>
          <Col span={3}><Button type="primary" onClick={load} loading={loading} disabled={!selected} block>Search</Button></Col>
          <Col span={3}><Button icon={<DownloadOutlined />} disabled={!report} block>Export</Button></Col>
        </Row>
      </Card>
      {!report ? <Empty description="Select a GL account and click Search" style={{ padding: 40 }} /> :
        <Card
          title={<Space>
            <Text strong>GL Ledger:</Text>
            <Tag color={ACCT_TYPE_COLOR[selectedAccount?.accountType] || 'default'}>{selectedAccount?.accountType}</Tag>
            <Text style={{ color: '#13c2c2' }}>{selectedAccount?.accountCode} — {selectedAccount?.accountName}</Text>
          </Space>}
          style={{ borderRadius: 12 }} size="small">
          <LedgerTable transactions={report.transactions} loading={loading} summary={report.summary} />
        </Card>}
    </div>
  );
}

function StatementTab({ type }: { type: 'customers' | 'suppliers' }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    sApi.get(`/sales/reports/${type}-statement`).then(r => setData(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [type]);

  const filtered = data.filter(r => !search || r.name?.toLowerCase().includes(search.toLowerCase()));
  const totalBalance = filtered.reduce((s, r) => s + Number(r.totalBalance || 0), 0);
  const totalInvoiced = filtered.reduce((s, r) => s + Number(r.totalInvoiced || 0), 0);
  const totalPaid = filtered.reduce((s, r) => s + Number(r.totalPaid || 0), 0);

  const exportCSV = () => {
    const headers = 'Name,Total Invoiced,Total Paid,Balance Due,Invoice Count';
    const rows = filtered.map(r => [r.name, Number(r.totalInvoiced).toFixed(3), Number(r.totalPaid).toFixed(3), Number(r.totalBalance).toFixed(3), r.invoiceCount].join(','));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' }));
    a.download = `${type}-statement-${dayjs().format('YYYY-MM-DD')}.csv`; a.click();
  };

  const columns = [
    { title: type === 'customers' ? 'Customer' : 'Supplier', dataIndex: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Invoices', dataIndex: 'invoiceCount', align: 'center' as const, width: 80, render: (v: number) => <Tag color="blue">{v}</Tag> },
    { title: 'Total Invoiced', dataIndex: 'totalInvoiced', align: 'right' as const, render: (v: number) => <Text>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Total Paid', dataIndex: 'totalPaid', align: 'right' as const, render: (v: number) => <Text style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Balance Due', dataIndex: 'totalBalance', align: 'right' as const, render: (v: number) => (
      <Text strong style={{ color: Number(v) > 0 ? '#ff4d4f' : '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text>
    )},
  ];

  return (
    <div>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff' }}><Statistic title={type === 'customers' ? 'Total Customers' : 'Total Suppliers'} value={filtered.length} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #722ed1' }}><Statistic title="Total Invoiced" prefix="OMR " value={totalInvoiced.toFixed(3)} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a' }}><Statistic title="Total Paid" prefix="OMR " value={totalPaid.toFixed(3)} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f' }}><Statistic title="Total Outstanding" prefix="OMR " value={totalBalance.toFixed(3)} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>
      <Card style={{ borderRadius: 12 }} size="small" extra={<Button icon={<DownloadOutlined />} size="small" onClick={exportCSV}>Export</Button>}>
        <Input prefix={<SearchOutlined />} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12, maxWidth: 300 }} />
        <Table dataSource={filtered} columns={columns} rowKey="name" size="small" loading={loading}
          pagination={{ pageSize: 20, showTotal: t => `${t} records` }}
          summary={() => (
            <Table.Summary.Row style={{ background: '#fafafa' }}>
              <Table.Summary.Cell index={0}><Text strong>Total</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1} />
              <Table.Summary.Cell index={2} align="right"><Text strong>OMR {totalInvoiced.toFixed(3)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right"><Text strong style={{ color: '#52c41a' }}>OMR {totalPaid.toFixed(3)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right"><Text strong style={{ color: '#ff4d4f' }}>OMR {totalBalance.toFixed(3)}</Text></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
}

export default function AccountLedgerReport() {
  const items = [
    { key: 'customer', label: <><UserOutlined /> Customer Ledger</>, children: <CustomerLedger /> },
    { key: 'supplier', label: <><ShopOutlined /> Supplier Ledger</>, children: <SupplierLedger /> },
    { key: 'gl', label: <><BookOutlined /> GL Account Ledger</>, children: <GLLedger /> },
    { key: 'all-customers', label: '📋 All Customers Statement', children: <StatementTab type="customers" /> },
    { key: 'all-suppliers', label: '📋 All Suppliers Statement', children: <StatementTab type="suppliers" /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Account Ledger</Title>
        <Text type="secondary">Customer, Supplier & GL account ledgers with running balances and statements</Text>
      </div>
      <Tabs defaultActiveKey="customer" items={items} />
    </div>
  );
}
