import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Progress, Spin, Statistic } from 'antd';
import {
  DollarOutlined, FileTextOutlined, CheckCircleOutlined, WarningOutlined,
  ShoppingCartOutlined, CalculatorOutlined, RiseOutlined, FallOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import salesApi from '../../services/salesApi';

const { Title, Text } = Typography;
const COLORS = ['#1890ff', '#52c41a', '#2E6DA4', '#fa8c16', '#ff4d4f', '#13c2c2'];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#8c8c8c', SENT: '#1890ff', ACCEPTED: '#13c2c2',
  INVOICED: '#2E6DA4', PAID: '#52c41a', OVERDUE: '#ff4d4f',
  PARTIALLY_PAID: '#fa8c16', CANCELLED: '#ff4d4f',
};

export default function FinanceDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salesApi.get('/sales/finance-dashboard')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /><div style={{ marginTop: 16 }}>Loading Finance Analytics...</div></div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#8c8c8c' }}>Failed to load finance data</div>;

  const { quotations, invoices, receipts, purchases, vat } = data;

  const revenueGrowth = invoices.revenueLastMonth > 0
    ? Math.round(((invoices.revenueThisMonth - invoices.revenueLastMonth) / invoices.revenueLastMonth) * 100)
    : 0;

  const kpis = [
    { title: 'Total Revenue', value: `OMR ${Number(invoices.totalRevenue).toFixed(3)}`, sub: `This month: OMR ${Number(invoices.revenueThisMonth).toFixed(3)}`, icon: <DollarOutlined />, color: '#52c41a' },
    { title: 'Outstanding', value: `OMR ${Number(invoices.totalOutstanding).toFixed(3)}`, sub: `${invoices.overdueCount} overdue invoices`, icon: <WarningOutlined />, color: invoices.overdueAmount > 0 ? '#ff4d4f' : '#fa8c16' },
    { title: 'Total Received', value: `OMR ${Number(receipts.totalReceived).toFixed(3)}`, sub: `${receipts.total} receipts`, icon: <CheckCircleOutlined />, color: '#1890ff' },
    { title: 'Total Invoices', value: invoices.total, sub: `+${invoices.thisMonth} this month`, icon: <FileTextOutlined />, color: '#2E6DA4' },
    { title: 'Quotations', value: quotations.total, sub: `+${quotations.thisMonth} this month`, icon: <FileTextOutlined />, color: '#13c2c2' },
    { title: 'Purchases', value: `OMR ${Number(purchases.totalAmount).toFixed(3)}`, sub: `${purchases.total} invoices`, icon: <ShoppingCartOutlined />, color: '#fa8c16' },
    { title: 'VAT Collected', value: `OMR ${Number(vat.collected).toFixed(3)}`, sub: 'This year', icon: <CalculatorOutlined />, color: '#2E6DA4' },
    { title: 'Revenue Growth', value: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%`, sub: 'vs last month', icon: revenueGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />, color: revenueGrowth >= 0 ? '#52c41a' : '#ff4d4f' },
  ];

  const trendData = (invoices.monthlyTrend || []).map((m: any) => ({
    month: m.month,
    revenue: Number(m.revenue || 0).toFixed(3),
    vat: Number(m.vat || 0).toFixed(3),
  }));

  const invoiceStatusData = (invoices.byStatus || []).map((s: any) => ({
    name: s.status?.replace('_', ' ') || 'Unknown',
    value: Number(s.count),
    amount: Number(s.value || 0),
  }));

  const quotationStatusData = (quotations.byStatus || []).map((s: any) => ({
    name: s.status || 'Unknown',
    count: Number(s.count),
    value: Number(s.value || 0),
  }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Finance Analytics</Title>
        <Text type="secondary">Revenue, receivables, payables and VAT overview</Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <Col span={6} key={i}>
            <Card style={{ borderRadius: 12, borderLeft: `4px solid ${k.color}` }} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{k.title}</Text>
                  <div style={{ fontSize: 18, fontWeight: 700, color: k.color, lineHeight: 1.4 }}>{k.value}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{k.sub}</Text>
                </div>
                <div style={{ fontSize: 24, color: k.color, opacity: 0.25 }}>{k.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Revenue Trend */}
        <Col span={14}>
          <Card title="Monthly Revenue Trend (Last 6 Months)" style={{ borderRadius: 12 }} size="small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [`OMR ${v}`, '']} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#52c41a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vat" name="VAT" fill="#2E6DA4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Invoice Status */}
        <Col span={10}>
          <Card title="Invoice Status Breakdown" style={{ borderRadius: 12 }} size="small">
            {invoiceStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={invoiceStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {invoiceStatusData.map((_: any, i: number) => (
                      <Cell key={i} fill={STATUS_COLORS[invoices.byStatus?.[i]?.status] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>No invoice data yet</div>}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Top Customers */}
        <Col span={14}>
          <Card title="Top Customers by Revenue" style={{ borderRadius: 12 }} size="small">
            <Table
              dataSource={invoices.topCustomers || []}
              rowKey="customerName"
              size="small"
              pagination={false}
              columns={[
                { title: 'Customer', dataIndex: 'customerName', render: (v: string) => <Text strong>{v}</Text> },
                { title: 'Invoices', dataIndex: 'invoiceCount', render: (v: number) => <Tag color="blue">{v}</Tag> },
                { title: 'Revenue', dataIndex: 'totalRevenue', render: (v: number) => <Text strong style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> },
                { title: 'Outstanding', dataIndex: 'outstanding', render: (v: number) => <Text style={{ color: Number(v) > 0 ? '#ff4d4f' : '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> },
              ]}
            />
          </Card>
        </Col>

        {/* VAT & Financial Summary */}
        <Col span={10}>
          <Card title="VAT Summary (This Year)" style={{ borderRadius: 12 }} size="small">
            <div style={{ padding: '8px 0' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text>VAT Collected (Output)</Text>
                  <Text strong style={{ color: '#52c41a' }}>OMR {Number(vat.collected).toFixed(3)}</Text>
                </div>
                <Progress percent={vat.collected > 0 ? 100 : 0} strokeColor="#52c41a" showInfo={false} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text>VAT Paid (Input)</Text>
                  <Text strong style={{ color: '#2E6DA4' }}>OMR {Number(vat.paid).toFixed(3)}</Text>
                </div>
                <Progress percent={vat.collected > 0 ? Math.round((vat.paid / vat.collected) * 100) : 0} strokeColor="#2E6DA4" showInfo={false} />
              </div>
              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Net VAT Payable</Text>
                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>OMR {Number(vat.net).toFixed(3)}</Text>
                </div>
              </div>
              <Row gutter={12} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Card size="small" style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fa8c16' }}>OMR {Number(invoices.overdueAmount).toFixed(3)}</div>
                    <Text style={{ fontSize: 11 }}>Overdue Amount</Text>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1890ff' }}>OMR {Number(purchases.outstanding).toFixed(3)}</div>
                    <Text style={{ fontSize: 11 }}>Payables Due</Text>
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quotation Pipeline */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Quotation Pipeline" style={{ borderRadius: 12 }} size="small">
            <Row gutter={16}>
              {(quotations.byStatus || []).map((s: any, i: number) => (
                <Col key={i} style={{ flex: '1 1 0' }}>
                  <Card size="small" style={{ borderRadius: 8, borderTop: `3px solid ${STATUS_COLORS[s.status] || COLORS[i % COLORS.length]}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: STATUS_COLORS[s.status] || COLORS[i % COLORS.length] }}>{s.count}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>{s.status || 'Unknown'}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>OMR {Number(s.value || 0).toFixed(3)}</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
