import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Typography, Tag, Spin, Progress, Divider, Button } from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, ShoppingCartOutlined,
  FileTextOutlined, TeamOutlined, ShoppingOutlined, CheckCircleOutlined,
  ClockCircleOutlined, WarningOutlined, RiseOutlined, EyeOutlined,
  FunnelPlotOutlined, TrophyOutlined, UserOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import api from '../../services/api';
import axios from 'axios';

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => {
  const t = localStorage.getItem('accessToken');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const { Title, Text } = Typography;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const SC: Record<string, string> = {
  DRAFT: '#8c8c8c', SENT: '#1890ff', ACCEPTED: '#13c2c2', CONVERTED: '#52c41a',
  REJECTED: '#ff4d4f', PAID: '#52c41a', PARTIALLY_PAID: '#fa8c16',
  CONFIRMED: '#1890ff', RECEIVED: '#52c41a', INVOICED: '#722ed1', CANCELLED: '#ff4d4f',
};

function KPI({ title, value, color, icon, sub, onClick, trend }: any) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16,
      padding: '16px 20px', cursor: onClick ? 'pointer' : 'default',
      borderTop: `3px solid ${color}`, height: '100%', transition: 'box-shadow 0.2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>{sub}</div>}
          {trend !== undefined && (
            <div style={{ fontSize: 11, marginTop: 4 }}>
              {trend >= 0
                ? <span style={{ color: '#52c41a' }}><ArrowUpOutlined /> +{trend}% vs last month</span>
                : <span style={{ color: '#ff4d4f' }}><ArrowDownOutlined /> {trend}% vs last month</span>}
            </div>
          )}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color }}>{icon}</div>
      </div>
      {onClick && <div style={{ fontSize: 11, color: '#1890ff', marginTop: 8 }}><EyeOutlined /> View details →</div>}
    </div>
  );
}

function SectionHeader({ title, emoji }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <Text style={{ fontSize: 12, fontWeight: 700, color: '#595959', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{title}</Text>
      <div style={{ flex: 1, height: 1, background: '#f0f0f0', marginLeft: 4 }} />
    </div>
  );
}

function StatusItem({ status, count, value, onClick }: any) {
  return (
    <div onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: SC[status] || '#ccc', flexShrink: 0 }} />
        <Text style={{ fontSize: 13 }}>{status.replace('_', ' ')}</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {value !== undefined && <Text style={{ fontSize: 11, color: '#8c8c8c' }}>OMR {Number(value).toFixed(3)}</Text>}
        <Tag style={{ background: `${SC[status]}15`, color: SC[status] || '#666', border: 'none', fontWeight: 600, minWidth: 28, textAlign: 'center' }}>{count}</Tag>
      </div>
    </div>
  );
}

function PendingItem({ emoji, title, sub, badge, color, onClick }: any) {
  return (
    <div onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{emoji} {title}</div>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Tag style={{ background: `${color}15`, color, border: 'none', fontWeight: 600 }}>{badge}</Tag>
        <EyeOutlined style={{ color: '#1890ff', fontSize: 12 }} />
      </div>
    </div>
  );
}

function FinanceBox({ label, value, color, onClick }: any) {
  return (
    <div onClick={onClick} style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 12, padding: '14px 16px', textAlign: 'center', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 4 }}>OMR {value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, tenant } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const [sd, setSd] = useState<any>({});
  const [crm, setCrm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sR, cR] = await Promise.allSettled([sApi.get('/sales/dashboard'), api.get('/crm-dashboard')]);
      if (sR.status === 'fulfilled') setSd(sR.value.data || {});
      if (cR.status === 'fulfilled') setCrm(cR.value.data || {});
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const rev = Number(sd.totalRevenue || 0);
  const purch = Number(sd.totalPurchases || 0);
  const revTM = Number(sd.revenueThisMonth || 0);
  const revLM = Number(sd.revenueLastMonth || 0);
  const outstanding = Number(sd.outstandingReceivables || 0);
  const payables = Number(sd.outstandingPayables || 0);
  const gp = rev - purch;
  const ebitda = gp;
  const ebitdaMargin = rev > 0 ? Math.round((ebitda / rev) * 100) : 0;
  const revTrend = revLM > 0 ? Math.round(((revTM - revLM) / revLM) * 100) : 0;

  const opps = crm.opportunities || {};
  const leads = crm.leads || {};
  const accounts = crm.accounts || {};
  const contacts = crm.contacts || {};
  const acts = crm.activities || {};

  const hasPending = sd.pendingQuotations || sd.pendingInvoices || outstanding > 0 || payables > 0 || sd.pendingGRNs || acts.overdue;

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const cardStyle = { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };

  return (
    <div style={{ padding: '0 2px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'} 👋
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
            {tenant?.companyName} · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </div>
        <Button icon={<ThunderboltOutlined />} onClick={loadAll} style={{ borderRadius: 8 }}>Refresh</Button>
      </div>

      {/* ── Financial KPIs ── */}
      <SectionHeader title="Financial Overview" emoji="💰" />
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} lg={4}><KPI title="Total Revenue" value={`OMR ${rev.toFixed(3)}`} color="#52c41a" icon={<DollarOutlined />} trend={revTrend} sub={`This month: OMR ${revTM.toFixed(3)}`} onClick={() => navigate('/finance/invoices')} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="Total Purchases" value={`OMR ${purch.toFixed(3)}`} color="#1890ff" icon={<ShoppingCartOutlined />} onClick={() => navigate('/purchase/invoices')} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="Gross Profit" value={`OMR ${gp.toFixed(3)}`} color={gp >= 0 ? '#13c2c2' : '#ff4d4f'} icon={<RiseOutlined />} sub={`Margin: ${rev > 0 ? Math.round((gp/rev)*100) : 0}%`} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="EBITDA" value={`OMR ${ebitda.toFixed(3)}`} color={ebitda >= 0 ? '#722ed1' : '#ff4d4f'} icon={<TrophyOutlined />} sub={`Margin: ${ebitdaMargin}%`} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="Receivables" value={`OMR ${outstanding.toFixed(3)}`} color="#fa8c16" icon={<ClockCircleOutlined />} sub="Outstanding" onClick={() => navigate('/finance/invoices')} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="Payables" value={`OMR ${payables.toFixed(3)}`} color="#ff4d4f" icon={<WarningOutlined />} sub="Outstanding" onClick={() => navigate('/purchase/invoices')} /></Col>
      </Row>

      {/* ── CRM KPIs ── */}
      <SectionHeader title="CRM Overview" emoji="🤝" />
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} lg={4}><KPI title="Total Leads" value={leads.total || 0} color="#722ed1" icon={<FunnelPlotOutlined />} sub={`This month: ${leads.thisMonth || 0}`} onClick={() => navigate('/leads')} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="Lead Conversion" value={`${leads.conversionRate || 0}%`} color="#1890ff" icon={<RiseOutlined />} sub={`${leads.converted || 0} converted`} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="Opportunities" value={opps.total || 0} color="#fa8c16" icon={<TrophyOutlined />} sub={`Pipeline: OMR ${Number(opps.pipelineValue || 0).toFixed(3)}`} onClick={() => navigate('/sales')} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="Won Deals" value={opps.won || 0} color="#52c41a" icon={<TrophyOutlined />} sub={`Win rate: ${opps.winRate || 0}%`} onClick={() => navigate('/sales')} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="Accounts" value={accounts.total || 0} color="#13c2c2" icon={<TeamOutlined />} sub={`New this month: ${accounts.thisMonth || 0}`} onClick={() => navigate('/contacts')} /></Col>
        <Col xs={12} sm={8} lg={4}><KPI title="Contacts" value={contacts.total || 0} color="#595959" icon={<UserOutlined />} sub={`Activities today: ${acts.today || 0}`} onClick={() => navigate('/contacts')} /></Col>
      </Row>

      {/* ── Document Counts ── */}
      <SectionHeader title="Document Summary" emoji="📋" />
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={8} sm={4} lg={4}><KPI title="Quotations" value={sd.totalQuotations || 0} color="#722ed1" icon={<FileTextOutlined />} onClick={() => navigate('/finance/quotations')} /></Col>
        <Col xs={8} sm={4} lg={4}><KPI title="Sales Invoices" value={sd.totalInvoices || 0} color="#1890ff" icon={<FileTextOutlined />} onClick={() => navigate('/finance/invoices')} /></Col>
        <Col xs={8} sm={4} lg={4}><KPI title="Delivery Notes" value={sd.totalInvoices || 0} color="#13c2c2" icon={<ShoppingOutlined />} onClick={() => navigate('/inventory/delivery-notes')} /></Col>
        <Col xs={8} sm={4} lg={4}><KPI title="Purchase Orders" value={sd.totalPurchaseOrders || 0} color="#fa8c16" icon={<ShoppingCartOutlined />} onClick={() => navigate('/purchase/orders')} /></Col>
        <Col xs={8} sm={4} lg={4}><KPI title="GRNs" value={sd.totalGRNs || 0} color="#52c41a" icon={<ShoppingOutlined />} onClick={() => navigate('/purchase/grn')} /></Col>
        <Col xs={8} sm={4} lg={4}><KPI title="Purchase Invoices" value={sd.totalPurchaseInvoices || 0} color="#595959" icon={<FileTextOutlined />} onClick={() => navigate('/purchase/invoices')} /></Col>
      </Row>

      {/* ── Bottom Row ── */}
      <Row gutter={[12, 12]}>
        {/* Finance Summary */}
        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontWeight: 700 }}>💹 Finance Summary</span>} style={cardStyle} bordered={false}>
            <Row gutter={[8, 8]}>
              <Col span={12}><FinanceBox label="Revenue" value={rev.toFixed(3)} color="#52c41a" onClick={() => navigate('/finance/invoices')} /></Col>
              <Col span={12}><FinanceBox label="Receivables" value={outstanding.toFixed(3)} color="#fa8c16" onClick={() => navigate('/finance/invoices')} /></Col>
              <Col span={12}><FinanceBox label="Purchases" value={purch.toFixed(3)} color="#1890ff" onClick={() => navigate('/purchase/invoices')} /></Col>
              <Col span={12}><FinanceBox label="Payables" value={payables.toFixed(3)} color="#ff4d4f" onClick={() => navigate('/purchase/invoices')} /></Col>
              <Col span={24}>
                <div style={{ background: gp >= 0 ? '#f6ffed' : '#fff1f0', border: `1px solid ${gp >= 0 ? '#b7eb8f' : '#ffa39e'}`, borderRadius: 12, padding: '12px 16px', textAlign: 'center', marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Profit (Revenue − Purchases)</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: gp >= 0 ? '#52c41a' : '#ff4d4f', marginTop: 4 }}>OMR {gp.toFixed(3)}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>EBITDA Margin: {ebitdaMargin}%</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Status Breakdowns */}
        <Col xs={24} lg={10}>
          <Card title={<span style={{ fontWeight: 700 }}>📊 Pipeline Status</span>} style={cardStyle} bordered={false}>
            <Row gutter={12}>
              <Col span={12}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#595959', display: 'block', marginBottom: 4 }}>Sales Invoices</Text>
                {(sd.invoicesByStatus || []).map((s: any) => (
                  <StatusItem key={s.status} status={s.status} count={s.count} value={s.value} onClick={() => navigate('/finance/invoices')} />
                ))}
                {!sd.invoicesByStatus?.length && <Text type="secondary" style={{ fontSize: 12, padding: '4px 12px', display: 'block' }}>No data yet</Text>}
              </Col>
              <Col span={12}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#595959', display: 'block', marginBottom: 4 }}>Purchase Invoices</Text>
                {(sd.purchaseInvoicesByStatus || []).map((s: any) => (
                  <StatusItem key={s.status} status={s.status} count={s.count} value={s.value} onClick={() => navigate('/purchase/invoices')} />
                ))}
                {!sd.purchaseInvoicesByStatus?.length && <Text type="secondary" style={{ fontSize: 12, padding: '4px 12px', display: 'block' }}>No data yet</Text>}
                <Divider style={{ margin: '8px 0' }} />
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#595959', display: 'block', marginBottom: 4 }}>Purchase Orders</Text>
                {(sd.posByStatus || []).map((s: any) => (
                  <StatusItem key={s.status} status={s.status} count={s.count} value={s.value} onClick={() => navigate('/purchase/orders')} />
                ))}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Pending Actions */}
        <Col xs={24} lg={6}>
          <Card title={<span style={{ fontWeight: 700 }}>⚡ Pending Actions</span>} style={cardStyle} bordered={false}>
            {Number(sd.pendingQuotations || 0) > 0 && <PendingItem emoji="📋" title="Quotations to Send" sub="Draft quotations" badge={sd.pendingQuotations} color="#1890ff" onClick={() => navigate('/finance/quotations')} />}
            {Number(sd.pendingInvoices || 0) > 0 && <PendingItem emoji="📄" title="Invoices to Send" sub="Draft invoices" badge={sd.pendingInvoices} color="#1890ff" onClick={() => navigate('/finance/invoices')} />}
            {outstanding > 0 && <PendingItem emoji="💰" title="Receivables" sub="Payments pending" badge={`OMR ${outstanding.toFixed(3)}`} color="#fa8c16" onClick={() => navigate('/finance/invoices')} />}
            {payables > 0 && <PendingItem emoji="🏦" title="Payables" sub="Payments to make" badge={`OMR ${payables.toFixed(3)}`} color="#ff4d4f" onClick={() => navigate('/purchase/invoices')} />}
            {Number(sd.pendingGRNs || 0) > 0 && <PendingItem emoji="📦" title="GRNs Pending" sub="Goods to receive" badge={sd.pendingGRNs} color="#722ed1" onClick={() => navigate('/purchase/grn')} />}
            {Number(acts.overdue || 0) > 0 && <PendingItem emoji="⚠️" title="Overdue Activities" sub="CRM tasks overdue" badge={acts.overdue} color="#ff4d4f" onClick={() => navigate('/activities')} />}
            {!hasPending && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                <div style={{ color: '#52c41a', fontWeight: 600, marginTop: 8 }}>All caught up!</div>
                <Text type="secondary" style={{ fontSize: 12 }}>No pending actions</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
