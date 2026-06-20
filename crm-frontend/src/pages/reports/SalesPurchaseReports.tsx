import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, Typography, Tag, Space, Statistic, DatePicker, Tabs, Progress, Input } from 'antd';
import { DownloadOutlined, ReloadOutlined, SearchOutlined, TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

function exportCSV(data: any[], filename: string, columns: {key: string, label: string}[]) {
  const headers = columns.map(c => c.label).join(',');
  const rows = data.map(row => columns.map(c => row[c.key] ?? '').join(','));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' }));
  a.download = `${filename}-${dayjs().format('YYYY-MM-DD')}.csv`; a.click();
}

function BarChart({ data, valueKey, labelKey, color = '#1890ff', prefix = '' }: any) {
  if (!data?.length) return <Text type="secondary">No data</Text>;
  const max = Math.max(...data.map((d: any) => Number(d[valueKey]) || 0));
  return (
    <div>
      {data.slice(0, 10).map((item: any, i: number) => {
        const val = Number(item[valueKey]) || 0;
        const pct = max > 0 ? (val / max) * 100 : 0;
        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={{ fontSize: 12 }}>{item[labelKey]}</Text>
              <Text strong style={{ color, fontSize: 12 }}>{prefix}{val.toFixed(3)}</Text>
            </div>
            <div style={{ background: '#f5f5f5', borderRadius: 4, height: 8 }}>
              <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sales Report ──────────────────────────────────────────────
function SalesReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/sales', { params });
      setData(r.data);
    } catch {} finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const s = data?.summary || {};

  const customerCols = [
    { title: '#', key: 'rank', width: 40, render: (_: any, __: any, i: number) => <Text type="secondary">{i+1}</Text> },
    { title: 'Customer', dataIndex: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Invoices', dataIndex: 'invoiceCount', align: 'center' as const, render: (v: number) => <Tag color="blue">{v}</Tag> },
    { title: 'Total Sales', dataIndex: 'totalAmount', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Paid', dataIndex: 'paidAmount', align: 'right' as const, render: (v: number) => <Text style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Balance', dataIndex: 'balanceDue', align: 'right' as const, render: (v: number) => <Text style={{ color: '#ff4d4f' }}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  const productCols = [
    { title: '#', key: 'rank', width: 40, render: (_: any, __: any, i: number) => <Text type="secondary">{i+1}</Text> },
    { title: 'Product / Description', dataIndex: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Qty Sold', dataIndex: 'qty', align: 'right' as const, render: (v: number) => <Text>{Number(v).toFixed(3)}</Text> },
    { title: 'Total Value', dataIndex: 'totalAmount', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#1890ff' }}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  const monthCols = [
    { title: 'Month', dataIndex: 'month', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Invoices', dataIndex: 'invoiceCount', align: 'center' as const },
    { title: 'Revenue', dataIndex: 'totalAmount', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Collected', dataIndex: 'paidAmount', align: 'right' as const, render: (v: number) => <Text style={{ color: '#1890ff' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Collection %', align: 'right' as const, render: (_: any, r: any) => {
      const pct = r.totalAmount > 0 ? Math.round((r.paidAmount / r.totalAmount) * 100) : 0;
      return <Progress percent={pct} size="small" strokeColor="#52c41a" style={{ margin: 0, width: 100 }} />;
    }},
  ];

  return (
    <div>
      <Card style={{ borderRadius: 12, marginBottom: 16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={10}><RangePicker style={{ width: '100%' }} onChange={dates => setDateRange(dates)} /></Col>
          <Col span={4}><Button type="primary" onClick={load} loading={loading} block>Apply</Button></Col>
          <Col span={4}><Button icon={<DownloadOutlined />} onClick={() => exportCSV(data?.byCustomer || [], 'sales-by-customer', [{key:'name',label:'Customer'},{key:'invoiceCount',label:'Invoices'},{key:'totalAmount',label:'Total'},{key:'paidAmount',label:'Paid'},{key:'balanceDue',label:'Balance'}])} block>Export</Button></Col>
        </Row>
      </Card>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff' }}><Statistic title="Total Invoices" value={s.totalInvoices || 0} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a' }}><Statistic title="Total Revenue" prefix="OMR " value={Number(s.totalRevenue || 0).toFixed(3)} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #13c2c2' }}><Statistic title="Total Collected" prefix="OMR " value={Number(s.totalPaid || 0).toFixed(3)} valueStyle={{ color: '#13c2c2' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f' }}><Statistic title="Outstanding" prefix="OMR " value={Number(s.totalBalance || 0).toFixed(3)} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Card title="📊 Sales by Customer (Top 10)" size="small" style={{ borderRadius: 12 }}>
            <BarChart data={data?.byCustomer} valueKey="totalAmount" labelKey="name" color="#52c41a" prefix="OMR " />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="📦 Sales by Product (Top 10)" size="small" style={{ borderRadius: 12 }}>
            <BarChart data={data?.byProduct} valueKey="totalAmount" labelKey="name" color="#1890ff" prefix="OMR " />
          </Card>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={14}>
          <Card title="👥 By Customer" size="small" style={{ borderRadius: 12 }}>
            <Table dataSource={data?.byCustomer} columns={customerCols} rowKey="name" size="small" loading={loading} pagination={{ showSizeChanger: true, pageSizeOptions: ['10','20','50','100'], defaultPageSize: 10 }} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="📅 By Month" size="small" style={{ borderRadius: 12 }}>
            <Table dataSource={data?.byMonth} columns={monthCols} rowKey="month" size="small" loading={loading} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// ── Purchase Report ───────────────────────────────────────────
function PurchaseReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/purchases', { params });
      setData(r.data);
    } catch {} finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const s = data?.summary || {};

  const supplierCols = [
    { title: '#', key: 'rank', width: 40, render: (_: any, __: any, i: number) => <Text type="secondary">{i+1}</Text> },
    { title: 'Supplier', dataIndex: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Invoices', dataIndex: 'invoiceCount', align: 'center' as const, render: (v: number) => <Tag color="purple">{v}</Tag> },
    { title: 'Total Purchases', dataIndex: 'totalAmount', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#2E6DA4' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Paid', dataIndex: 'paidAmount', align: 'right' as const, render: (v: number) => <Text style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Balance', dataIndex: 'balanceDue', align: 'right' as const, render: (v: number) => <Text style={{ color: '#ff4d4f' }}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  const productCols = [
    { title: '#', key: 'rank', width: 40, render: (_: any, __: any, i: number) => <Text type="secondary">{i+1}</Text> },
    { title: 'Product / Description', dataIndex: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Qty Purchased', dataIndex: 'qty', align: 'right' as const, render: (v: number) => <Text>{Number(v).toFixed(3)}</Text> },
    { title: 'Total Value', dataIndex: 'totalAmount', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#2E6DA4' }}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  return (
    <div>
      <Card style={{ borderRadius: 12, marginBottom: 16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={10}><RangePicker style={{ width: '100%' }} onChange={dates => setDateRange(dates)} /></Col>
          <Col span={4}><Button type="primary" onClick={load} loading={loading} block>Apply</Button></Col>
          <Col span={4}><Button icon={<DownloadOutlined />} onClick={() => exportCSV(data?.bySupplier || [], 'purchases-by-supplier', [{key:'name',label:'Supplier'},{key:'invoiceCount',label:'Invoices'},{key:'totalAmount',label:'Total'},{key:'paidAmount',label:'Paid'},{key:'balanceDue',label:'Balance'}])} block>Export</Button></Col>
        </Row>
      </Card>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #2E6DA4' }}><Statistic title="Total Invoices" value={s.totalInvoices || 0} valueStyle={{ color: '#2E6DA4' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff' }}><Statistic title="Total Purchases" prefix="OMR " value={Number(s.totalPurchases || 0).toFixed(3)} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a' }}><Statistic title="Total Paid" prefix="OMR " value={Number(s.totalPaid || 0).toFixed(3)} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f' }}><Statistic title="Outstanding" prefix="OMR " value={Number(s.totalBalance || 0).toFixed(3)} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Card title="📊 Purchases by Supplier (Top 10)" size="small" style={{ borderRadius: 12 }}>
            <BarChart data={data?.bySupplier} valueKey="totalAmount" labelKey="name" color="#2E6DA4" prefix="OMR " />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="📦 Purchases by Product (Top 10)" size="small" style={{ borderRadius: 12 }}>
            <BarChart data={data?.byProduct} valueKey="totalAmount" labelKey="name" color="#fa8c16" prefix="OMR " />
          </Card>
        </Col>
      </Row>

      <Card title="🏪 By Supplier" size="small" style={{ borderRadius: 12 }}>
        <Table dataSource={data?.bySupplier} columns={supplierCols} rowKey="name" size="small" loading={loading} pagination={{ showSizeChanger: true, pageSizeOptions: ['10','20','50','100'], defaultPageSize: 10 }} />
      </Card>
    </div>
  );
}

// ── Stock Report ──────────────────────────────────────────────
function StockReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await sApi.get('/sales/reports/stock'); setData(r.data || []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter(r =>
    (!search || r.productName?.toLowerCase().includes(search.toLowerCase()) || r.productCode?.toLowerCase().includes(search.toLowerCase())) &&
    (!showLowOnly || r.isLowStock)
  );

  const lowStock = data.filter(r => r.isLowStock);
  const totalValue = filtered.reduce((s, r) => s + Number(r.stockValue || 0), 0);

  const columns = [
    { title: 'Code', dataIndex: 'productCode', width: 90, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Product', dataIndex: 'productName', render: (v: string, r: any) => (
      <Space direction="vertical" size={0}>
        <Text strong style={{ fontSize: 13 }}>{v}</Text>
        <Text type="secondary" style={{ fontSize: 11 }}>{r.category}</Text>
      </Space>
    )},
    { title: 'Stock Qty', dataIndex: 'stockQty', align: 'right' as const, render: (v: number, r: any) => (
      <Space>
        <Text strong style={{ color: r.isLowStock ? '#ff4d4f' : '#1890ff' }}>{Number(v).toFixed(3)}</Text>
        {r.isLowStock && <WarningOutlined style={{ color: '#ff4d4f' }} />}
      </Space>
    )},
    { title: 'Min Qty', dataIndex: 'minStockQty', align: 'right' as const, render: (v: number) => <Text type="secondary">{Number(v).toFixed(3)}</Text> },
    { title: 'Cost Price', dataIndex: 'costPrice', align: 'right' as const, render: (v: number) => <Text>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Sell Price', dataIndex: 'unitPrice', align: 'right' as const, render: (v: number) => <Text>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Margin', dataIndex: 'margin', align: 'center' as const, render: (v: number) => (
      <Tag color={v >= 20 ? 'green' : v >= 10 ? 'orange' : 'red'}>{v}%</Tag>
    )},
    { title: 'Stock Value', dataIndex: 'stockValue', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#2E6DA4' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Status', align: 'center' as const, render: (_: any, r: any) => r.isLowStock
      ? <Tag color="red"><WarningOutlined /> Low Stock</Tag>
      : <Tag color="green">OK</Tag> },
  ];

  return (
    <div>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff' }}><Statistic title="Total Products" value={data.length} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f' }}><Statistic title="Low Stock Items" value={lowStock.length} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #2E6DA4' }}><Statistic title="Total Stock Value" prefix="OMR " value={totalValue.toFixed(3)} valueStyle={{ color: '#2E6DA4' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a' }}><Statistic title="Healthy Items" value={data.length - lowStock.length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Card style={{ borderRadius: 12 }} size="small">
        <Row gutter={12} style={{ marginBottom: 12 }}>
          <Col span={8}><Input prefix={<SearchOutlined />} placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} /></Col>
          <Col span={4}><Button type={showLowOnly ? 'primary' : 'default'} danger={showLowOnly} onClick={() => setShowLowOnly(!showLowOnly)} icon={<WarningOutlined />}>{showLowOnly ? 'Show All' : 'Low Stock Only'}</Button></Col>
          <Col span={4}><Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button></Col>
          <Col span={4}><Button icon={<DownloadOutlined />} onClick={() => exportCSV(filtered, 'stock-report', [{key:'productCode',label:'Code'},{key:'productName',label:'Product'},{key:'stockQty',label:'Qty'},{key:'costPrice',label:'Cost'},{key:'unitPrice',label:'Sell Price'},{key:'stockValue',label:'Value'}])}>Export</Button></Col>
        </Row>
        <Table dataSource={filtered} columns={columns} rowKey="productId" size="small" loading={loading}
          pagination={{ pageSize: 20, showTotal: t => `${t} products` }}
          summary={() => (
            <Table.Summary.Row style={{ background: '#fafafa' }}>
              <Table.Summary.Cell index={0} colSpan={2}><Text strong>Total</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right"><Text strong>{filtered.reduce((s,r) => s+Number(r.stockQty||0),0).toFixed(3)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={3} /><Table.Summary.Cell index={4} /><Table.Summary.Cell index={5} /><Table.Summary.Cell index={6} />
              <Table.Summary.Cell index={7} align="right"><Text strong style={{ color: '#2E6DA4' }}>OMR {totalValue.toFixed(3)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={8} />
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
}

// ── Top Customers / Suppliers ─────────────────────────────────
function TopReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await sApi.get('/sales/reports/top-customers-suppliers', { params: { limit: 10 } }); setData(r.data); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const custCols = [
    { title: '#', key: 'rank', width: 40, render: (_: any, __: any, i: number) => (
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: i < 3 ? '#faad14' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i+1}</div>
    )},
    { title: 'Customer', dataIndex: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Invoices', dataIndex: 'invoiceCount', align: 'center' as const, render: (v: number) => <Tag color="blue">{v}</Tag> },
    { title: 'Total Sales', dataIndex: 'totalAmount', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Outstanding', dataIndex: 'balanceDue', align: 'right' as const, render: (v: number) => <Text style={{ color: '#ff4d4f' }}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  const suppCols = [
    { title: '#', key: 'rank', width: 40, render: (_: any, __: any, i: number) => (
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: i < 3 ? '#faad14' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i+1}</div>
    )},
    { title: 'Supplier', dataIndex: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Invoices', dataIndex: 'invoiceCount', align: 'center' as const, render: (v: number) => <Tag color="purple">{v}</Tag> },
    { title: 'Total Purchases', dataIndex: 'totalAmount', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#2E6DA4' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Outstanding', dataIndex: 'balanceDue', align: 'right' as const, render: (v: number) => <Text style={{ color: '#ff4d4f' }}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  return (
    <div>
      <Row gutter={12}>
        <Col span={12}>
          <Card title={<Space><TrophyOutlined style={{ color: '#faad14' }} /><Text strong>Top 10 Customers by Sales</Text></Space>}
            size="small" style={{ borderRadius: 12 }}
            extra={<Button icon={<ReloadOutlined />} size="small" onClick={load} loading={loading} />}>
            <Table dataSource={data?.topCustomers} columns={custCols} rowKey="name" size="small" loading={loading} pagination={false} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<Space><TrophyOutlined style={{ color: '#2E6DA4' }} /><Text strong>Top 10 Suppliers by Purchases</Text></Space>}
            size="small" style={{ borderRadius: 12 }}
            extra={<Button icon={<ReloadOutlined />} size="small" onClick={load} loading={loading} />}>
            <Table dataSource={data?.topSuppliers} columns={suppCols} rowKey="name" size="small" loading={loading} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SalesPurchaseReports() {
  const items = [
    { key: 'sales', label: '📈 Sales Report', children: <SalesReport /> },
    { key: 'purchases', label: '📦 Purchase Report', children: <PurchaseReport /> },
    { key: 'stock', label: '🏭 Stock Report', children: <StockReport /> },
    { key: 'top', label: '🏆 Top Customers / Suppliers', children: <TopReport /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Sales & Purchase Reports</Title>
        <Text type="secondary">Sales performance, purchase analysis, stock levels and top rankings</Text>
      </div>
      <Tabs defaultActiveKey="sales" items={items} />
    </div>
  );
}
