import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Statistic, Spin, Button, Empty } from 'antd';
import {
  ReloadOutlined, DollarOutlined, RiseOutlined, InboxOutlined,
  BankOutlined, ShoppingCartOutlined, ToolOutlined, FileTextOutlined,
  BarChartOutlined, SafetyOutlined, TeamOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area,
} from 'recharts';
import axios from 'axios';

// Sales API client (same base the rest of the app uses)
const Lt = axios.create({ baseURL: '/sales-api' });
Lt.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('accessToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// CRM core API client
const Ft = axios.create({ baseURL: '/api/v1' });
Ft.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('accessToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const PALETTE = ['#185FA5', '#1D9E75', '#534AB7', '#EF9F27', '#D85A30', '#888780', '#D4537E'];
const n = (v: any) => Number(v || 0);
const omr = (v: any) => `OMR ${n(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = (ym: string) => {
  // ym like "2026-06"
  const parts = String(ym).split('-');
  const mi = parseInt(parts[1], 10) - 1;
  return MONTHS[mi] || ym;
};

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  height: '100%',
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<any>({});
  const [a, setA] = useState<any>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, analytics] = await Promise.allSettled([
        Lt.get('/sales/dashboard'),
        Lt.get('/sales/dashboard/analytics'),
      ]);
      if (dash.status === 'fulfilled') setKpi(dash.value.data || {});
      if (analytics.status === 'fulfilled') setA(analytics.value.data || {});
    } catch {
      /* charts degrade gracefully on empty data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ---- Derived chart data (all Postgres values arrive as strings -> Number()) ----
  const stockByType = (a.stockByType || []).map((r: any) => ({
    name: (r.type || 'OTHER').replace('_', ' '),
    value: n(r.value),
    count: n(r.count),
  }));

  const topProducts = (a.topProducts || []).map((r: any) => ({
    name: r.name,
    value: n(r.value),
  }));

  const stockMovement = (a.stockMovement || []).map((r: any) => ({
    week: `W${r.week}`,
    In: n(r.inQty),
    Out: n(r.outQty),
  }));

  const assetsByCategory = (a.assetsByCategory || []).map((r: any) => ({
    name: r.category || 'Uncategorised',
    value: n(r.value),
    count: n(r.count),
  }));

  const assetCostVsDepr = (a.assetCostVsDepr || []).map((r: any) => ({
    name: r.category || 'Other',
    'Net book value': n(r.bookValue),
    Depreciation: n(r.depreciation),
  }));

  const assetCondition = (a.assetCondition || []).map((r: any) => ({
    name: r.condition || 'Unknown',
    count: n(r.count),
  }));

  const pipeline = (a.pipeline || []).map((r: any) => ({
    name: (r.status || '').replace('_', ' '),
    count: n(r.count),
    value: n(r.value),
  }));

  const revenueByMonth = (a.revenueByMonth || []).map((r: any) => ({
    name: monthLabel(r.month),
    Revenue: n(r.revenue),
  }));

  const docs = a.documentCounts || {};
  const documents = [
    { name: 'Quotations', count: n(docs.quotations) },
    { name: 'Invoices', count: n(docs.invoices) },
    { name: 'POs', count: n(docs.pos) },
    { name: 'GRNs', count: n(docs.grns) },
  ];

  // KPI values from existing /sales/dashboard
  const totalRevenue = n(kpi.totalRevenue);
  const totalPurchases = n(kpi.totalPurchases);
  const grossProfit = totalRevenue - totalPurchases;
  const stockValue = stockByType.filter((s: any) => s.name === 'STOCK').reduce((sum: number, s: any) => sum + s.value, 0);
  const assetValue = assetsByCategory.reduce((sum: number, s: any) => sum + s.value, 0);
  const receivables = n(kpi.outstandingReceivables);

  const modules = [
    { icon: <TeamOutlined />, label: 'CRM', color: '#185FA5', path: '/contacts' },
    { icon: <DollarOutlined />, label: 'Finance', color: '#1D9E75', path: '/finance/invoices' },
    { icon: <InboxOutlined />, label: 'Inventory', color: '#534AB7', path: '/inventory/products' },
    { icon: <ShoppingCartOutlined />, label: 'Purchase', color: '#EF9F27', path: '/purchase/orders' },
    { icon: <BankOutlined />, label: 'Fixed Assets', color: '#D85A30', path: '/assets/fixed' },
    { icon: <ToolOutlined />, label: 'Consumables', color: '#D4537E', path: '/assets/consumables' },
    { icon: <FileTextOutlined />, label: 'E-Invoicing', color: '#185FA5', path: '/einvoice' },
    { icon: <BarChartOutlined />, label: 'Reports', color: '#1D9E75', path: '/reports' },
    { icon: <SafetyOutlined />, label: 'Admin', color: '#888780', path: '/users' },
  ];

  const ChartCard = ({ title, children, empty, to }: { title: string; children: React.ReactNode; empty?: boolean; to?: string }) => (
    <Card
      title={<span style={{ fontWeight: 700 }}>{title}</span>}
      extra={to ? <a onClick={(e) => { e.preventDefault(); navigate(to); }} style={{ fontSize: 12 }}>Open →</a> : undefined}
      style={cardStyle}
      bordered={false}
    >
      {empty ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data yet" style={{ padding: '24px 0' }} />
        : <div style={{ width: '100%', height: 240 }}>{children}</div>}
    </Card>
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  const tooltipStyle = { borderRadius: 8, border: '1px solid #f0f0f0', fontSize: 12 };

  return (
    <div style={{ padding: '0 2px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700 }}>{greeting()} 👋</h2>
          <span style={{ color: '#8c8c8c', fontSize: 13 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} style={{ borderRadius: 8 }}>Refresh</Button>
      </div>

      {/* KPI cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: 'Total Revenue', value: omr(totalRevenue), color: '#1D9E75', icon: <DollarOutlined />, path: '/finance/invoices' },
          { title: 'Gross Profit', value: omr(grossProfit), color: '#185FA5', icon: <RiseOutlined />, path: '/finance/profit-loss' },
          { title: 'Stock Value', value: omr(stockValue), color: '#EF9F27', icon: <InboxOutlined />, path: '/inventory/products' },
          { title: 'Asset Book Value', value: omr(assetValue), color: '#534AB7', icon: <BankOutlined />, path: '/assets/fixed' },
          { title: 'Receivables', value: omr(receivables), color: '#D85A30', icon: <DollarOutlined />, path: '/finance/ar-aging' },
        ].map((k) => (
          <Col xs={12} sm={8} lg={Math.floor(24 / 5) || 4} key={k.title}>
            <Card
              hoverable
              onClick={() => navigate(k.path)}
              style={{ ...cardStyle, borderTop: `3px solid ${k.color}`, cursor: 'pointer' }}
              bordered={false}
              bodyStyle={{ padding: 16 }}
            >
              <Statistic title={k.title} value={k.value as any} valueStyle={{ color: k.color, fontSize: 20, fontWeight: 700 }} prefix={k.icon} />
              <div style={{ fontSize: 11, color: '#1890ff', marginTop: 4 }}>View details →</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Revenue + Expenses-by-type row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={15}>
          <ChartCard title="📈 Revenue trend (6 months)" empty={!revenueByMonth.length} to="/finance/invoices">
            <ResponsiveContainer>
              <AreaChart data={revenueByMonth} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => omr(v)} />
                <Area type="monotone" dataKey="Revenue" stroke="#185FA5" fill="#185FA5" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
        <Col xs={24} lg={9}>
          <ChartCard title="📦 Stock by product type" empty={!stockByType.length} to="/inventory/products">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stockByType} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {stockByType.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => omr(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
      </Row>

      {/* Pipeline + Documents row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <ChartCard title="🎯 Sales pipeline by status" empty={!pipeline.length} to="/sales">
            <ResponsiveContainer>
              <BarChart data={pipeline} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#534AB7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="📋 Documents" empty={!documents.some((d) => d.count)} to="/documents">
            <ResponsiveContainer>
              <BarChart data={documents} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  fill="#1D9E75"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(d: any) => {
                    const map: Record<string, string> = {
                      Quotations: '/finance/quotations',
                      Invoices: '/finance/invoices',
                      POs: '/purchase/orders',
                      GRNs: '/purchase/grn',
                    };
                    const dest = map[d?.name];
                    if (dest) navigate(dest);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
      </Row>

      {/* Stock section */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#595959', margin: '24px 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        <InboxOutlined /> Stock & Inventory
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <ChartCard title="Top products by value" empty={!topProducts.length} to="/reports/item-profile">
            <ResponsiveContainer>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" fontSize={11} width={130} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => omr(v)} />
                <Bar dataKey="value" fill="#185FA5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="Stock movement (30 days)" empty={!stockMovement.length} to="/reports/stock-movement">
            <ResponsiveContainer>
              <LineChart data={stockMovement} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="In" stroke="#1D9E75" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Out" stroke="#D85A30" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
      </Row>

      {/* Fixed Assets section */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#595959', margin: '24px 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        <BankOutlined /> Fixed Assets
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={8}>
          <ChartCard title="Assets by category" empty={!assetsByCategory.length} to="/assets/fixed">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={assetsByCategory} dataKey="value" nameKey="name" innerRadius={42} outerRadius={78} paddingAngle={2}>
                  {assetsByCategory.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => omr(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
        <Col xs={24} lg={8}>
          <ChartCard title="Net book value vs depreciation" empty={!assetCostVsDepr.length} to="/assets/fixed">
            <ResponsiveContainer>
              <BarChart data={assetCostVsDepr} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => omr(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Net book value" stackId="a" fill="#185FA5" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Depreciation" stackId="a" fill="#B4B2A9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
        <Col xs={24} lg={8}>
          <ChartCard title="Asset condition" empty={!assetCondition.length} to="/assets/fixed">
            <ResponsiveContainer>
              <BarChart data={assetCondition} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {assetCondition.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
      </Row>

      {/* Modules */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#595959', margin: '24px 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        <AppstoreOutlined /> Modules
      </div>
      <Row gutter={[12, 12]} style={{ marginBottom: 8 }}>
        {modules.map((m) => (
          <Col xs={8} sm={6} md={4} lg={Math.floor(24 / 9) < 2 ? 3 : Math.floor(24 / 9)} key={m.label}>
            <Card
              hoverable
              onClick={() => navigate(m.path)}
              style={{ ...cardStyle, textAlign: 'center', cursor: 'pointer' }}
              bodyStyle={{ padding: '18px 8px' }}
            >
              <div style={{ fontSize: 24, color: m.color, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
