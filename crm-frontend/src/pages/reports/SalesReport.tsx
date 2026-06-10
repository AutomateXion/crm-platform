import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Row, Col, Statistic, DatePicker, Button, Typography, Space, Tabs, Empty,
} from 'antd';
import { DownloadOutlined, ReloadOutlined, LineChartOutlined } from '@ant-design/icons';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import axios from 'axios';
import dayjs from 'dayjs';

const Lt = axios.create({ baseURL: '/sales-api' });
Lt.interceptors.request.use((cfg: any) => {
  const t = localStorage.getItem('accessToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const omr = (v: any) => `OMR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

export default function SalesReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({ summary: {}, byCustomer: [], byProduct: [], byMonth: [] });
  const [range, setRange] = useState<any>([dayjs().startOf('year'), dayjs()]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (range?.[0]) params.from = range[0].format('YYYY-MM-DD');
      if (range?.[1]) params.to = range[1].format('YYYY-MM-DD');
      const r = await Lt.get('/sales/reports/sales', { params });
      setData(r.data || { summary: {}, byCustomer: [], byProduct: [], byMonth: [] });
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const s = data.summary || {};

  const exportCsv = (rows: any[], cols: string[], name: string) => {
    const header = cols.join(',');
    const lines = rows.map((r) => cols.map((c) => {
      const v = r[c];
      return typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(','));
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name}-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const customerCols = [
    { title: 'Customer', dataIndex: 'name', key: 'name' },
    { title: 'Invoices', dataIndex: 'invoiceCount', key: 'inv', align: 'right' as const },
    { title: 'Total', dataIndex: 'totalAmount', key: 'tot', align: 'right' as const, render: (v: number) => <strong>{omr(v)}</strong> },
    { title: 'Paid', dataIndex: 'paidAmount', key: 'paid', align: 'right' as const, render: (v: number) => <span style={{ color: '#52c41a' }}>{omr(v)}</span> },
    { title: 'Balance', dataIndex: 'balanceDue', key: 'bal', align: 'right' as const, render: (v: number) => <span style={{ color: Number(v) > 0 ? '#ff4d4f' : '#999' }}>{omr(v)}</span> },
  ];
  const productCols = [
    { title: 'Product', dataIndex: 'name', key: 'name' },
    { title: 'Qty Sold', dataIndex: 'qty', key: 'qty', align: 'right' as const, render: (v: number) => Number(v).toFixed(3) },
    { title: 'Lines', dataIndex: 'invoiceCount', key: 'cnt', align: 'right' as const },
    { title: 'Total', dataIndex: 'totalAmount', key: 'tot', align: 'right' as const, render: (v: number) => <strong>{omr(v)}</strong> },
  ];
  const monthCols = [
    { title: 'Month', dataIndex: 'month', key: 'month' },
    { title: 'Invoices', dataIndex: 'invoiceCount', key: 'inv', align: 'right' as const },
    { title: 'Total', dataIndex: 'totalAmount', key: 'tot', align: 'right' as const, render: (v: number) => <strong>{omr(v)}</strong> },
    { title: 'Paid', dataIndex: 'paidAmount', key: 'paid', align: 'right' as const, render: (v: number) => <span style={{ color: '#52c41a' }}>{omr(v)}</span> },
  ];

  const topCustomers = (data.byCustomer || []).slice(0, 8);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}><LineChartOutlined /> Sales Report</Title>
          <Text type="secondary">Revenue analysis by customer, product and month</Text>
        </div>
        <Space wrap>
          <RangePicker value={range} onChange={(v) => setRange(v)} allowClear={false} />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
        </Space>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #1890ff' }}><Statistic title="Total Invoices" value={s.totalInvoices || 0} valueStyle={{ color: '#1890ff', fontSize: 20 }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #52c41a' }}><Statistic title="Total Revenue" value={omr(s.totalRevenue)} valueStyle={{ color: '#52c41a', fontSize: 17 }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #13c2c2' }}><Statistic title="Collected" value={omr(s.totalPaid)} valueStyle={{ color: '#13c2c2', fontSize: 17 }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #ff4d4f' }}><Statistic title="Outstanding" value={omr(s.totalBalance)} valueStyle={{ color: '#ff4d4f', fontSize: 17 }} /></Card></Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Monthly Revenue Trend" style={{ borderRadius: 12 }} size="small">
            {(data.byMonth || []).length ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.byMonth}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => omr(v)} />
                  <Area type="monotone" dataKey="totalAmount" stroke="#52c41a" fill="url(#rev)" strokeWidth={2} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Top Customers" style={{ borderRadius: 12 }} size="small">
            {topCustomers.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topCustomers} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => omr(v)} />
                  <Bar dataKey="totalAmount" fill="#1890ff" name="Revenue" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="customer"
          items={[
            {
              key: 'customer', label: 'By Customer',
              children: (
                <>
                  <div style={{ textAlign: 'right', marginBottom: 8 }}>
                    <Button size="small" icon={<DownloadOutlined />} onClick={() => exportCsv(data.byCustomer || [], ['name', 'invoiceCount', 'totalAmount', 'paidAmount', 'balanceDue'], 'sales-by-customer')}>Export</Button>
                  </div>
                  <Table dataSource={data.byCustomer || []} columns={customerCols} rowKey="name" size="small" loading={loading} pagination={{ pageSize: 15 }} />
                </>
              ),
            },
            {
              key: 'product', label: 'By Product',
              children: (
                <>
                  <div style={{ textAlign: 'right', marginBottom: 8 }}>
                    <Button size="small" icon={<DownloadOutlined />} onClick={() => exportCsv(data.byProduct || [], ['name', 'qty', 'invoiceCount', 'totalAmount'], 'sales-by-product')}>Export</Button>
                  </div>
                  <Table dataSource={data.byProduct || []} columns={productCols} rowKey="name" size="small" loading={loading} pagination={{ pageSize: 15 }} />
                </>
              ),
            },
            {
              key: 'month', label: 'By Month',
              children: (
                <>
                  <div style={{ textAlign: 'right', marginBottom: 8 }}>
                    <Button size="small" icon={<DownloadOutlined />} onClick={() => exportCsv(data.byMonth || [], ['month', 'invoiceCount', 'totalAmount', 'paidAmount'], 'sales-by-month')}>Export</Button>
                  </div>
                  <Table dataSource={data.byMonth || []} columns={monthCols} rowKey="month" size="small" loading={loading} pagination={{ pageSize: 15 }} />
                </>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
