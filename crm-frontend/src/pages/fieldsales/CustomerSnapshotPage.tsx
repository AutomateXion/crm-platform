import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Typography, Tag, Spin, Empty, Row, Col, Drawer, Statistic, Divider, List } from 'antd';
import { SearchOutlined, TeamOutlined, WarningFilled, CheckCircleFilled, StopFilled, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use((c: any) => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const omr = (v: any) => `OMR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
const fdate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const CREDIT = {
  OK:         { color: 'green',  icon: <CheckCircleFilled />, text: 'Credit OK' },
  NEAR_LIMIT: { color: 'gold',   icon: <WarningFilled />,     text: 'Near limit' },
  OVER_LIMIT: { color: 'volcano',icon: <WarningFilled />,     text: 'Over limit' },
  BLOCKED:    { color: 'red',    icon: <StopFilled />,        text: 'Blocked' },
} as any;

export default function CustomerSnapshotPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snap, setSnap] = useState<any>(null);
  const [snapLoading, setSnapLoading] = useState(false);

  const load = useCallback((term: string) => {
    setLoading(true);
    sApi.get('/sales/field/customers', { params: { search: term || undefined, limit: 80 } })
      .then(r => setCustomers(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(''); }, [load]);
  useEffect(() => { const t = setTimeout(() => load(search), 300); return () => clearTimeout(t); }, [search, load]);

  const openSnap = async (c: any) => {
    setDrawerOpen(true); setSnapLoading(true); setSnap(null);
    try {
      const r = await sApi.get(`/sales/field/customers/${c.accountId}/snapshot`);
      setSnap(r.data);
    } catch { setSnap(null); } finally { setSnapLoading(false); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}><TeamOutlined /> Customer Snapshot</Title>
        <Text type="secondary">Know where each customer stands before you visit</Text>
      </div>

      <Input size="large" allowClear prefix={<SearchOutlined />} placeholder="Search customers…"
        value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16, borderRadius: 12 }} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : customers.length === 0 ? (
        <Empty description="No customers found" />
      ) : (
        <Row gutter={[12, 12]}>
          {customers.map(c => {
            const cr = CREDIT[c.creditStatus] || CREDIT.OK;
            const hasDue = c.outstanding > 0;
            return (
              <Col xs={24} sm={12} key={c.accountId}>
                <Card size="small" hoverable style={{ borderRadius: 12, borderLeft: `4px solid ${hasDue ? (c.overdue > 0 ? '#cf1322' : '#d46b08') : '#389e0d'}` }}
                  bodyStyle={{ padding: 14 }} onClick={() => openSnap(c)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <Text strong style={{ fontSize: 15, flex: 1 }}>{c.accountName}</Text>
                    <Tag icon={cr.icon} color={cr.color} style={{ margin: 0, borderRadius: 10 }}>{cr.text}</Tag>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Outstanding</Text>
                    <div><Text strong style={{ fontSize: 16, color: hasDue ? '#0B2547' : '#389e0d' }}>{omr(c.outstanding)}</Text></div>
                    {c.overdue > 0 && <Text style={{ fontSize: 12, color: '#cf1322' }}>Overdue: {omr(c.overdue)}</Text>}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Drawer placement="right" width={Math.min(440, window.innerWidth)} open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={snap ? snap.accountName : 'Customer'}>
        {snapLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : !snap ? (
          <Empty description="Could not load snapshot" />
        ) : (
          <div>
            {(() => { const cr = CREDIT[snap.creditStatus] || CREDIT.OK;
              return <Tag icon={cr.icon} color={cr.color} style={{ marginBottom: 12, fontSize: 13, padding: '4px 10px' }}>{cr.text}</Tag>; })()}
            {snap.creditBlocked && snap.creditBlockReason &&
              <div style={{ background: '#fff1f0', border: '1px solid #ffccc7', borderRadius: 8, padding: 10, marginBottom: 12 }}>
                <Text style={{ color: '#cf1322', fontSize: 12 }}>Blocked: {snap.creditBlockReason}</Text>
              </div>}

            <Row gutter={12}>
              <Col span={12}><Statistic title="Outstanding" value={snap.outstanding} precision={3} prefix="OMR" valueStyle={{ fontSize: 18 }} /></Col>
              <Col span={12}><Statistic title="Credit limit" value={snap.creditLimit} precision={3} prefix="OMR" valueStyle={{ fontSize: 18 }} /></Col>
            </Row>
            {snap.available != null &&
              <Statistic style={{ marginTop: 8 }} title="Available credit" value={snap.available} precision={3} prefix="OMR"
                valueStyle={{ fontSize: 16, color: snap.available > 0 ? '#389e0d' : '#cf1322' }} />}

            <Divider orientation="left" style={{ margin: '16px 0 8px' }}>Aging</Divider>
            <Row gutter={8}>
              {[['Current', snap.aging.current, '#389e0d'], ['1–30d', snap.aging.d30, '#d4b106'],
                ['31–60d', snap.aging.d60, '#d46b08'], ['60+d', snap.aging.d90, '#cf1322']].map(([lbl, val, col]: any) => (
                <Col span={6} key={lbl} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{lbl}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: val > 0 ? col : '#bfbfbf' }}>{Number(val).toFixed(0)}</div>
                </Col>
              ))}
            </Row>

            <Divider orientation="left" style={{ margin: '16px 0 8px' }}>Recent invoices</Divider>
            {snap.recentInvoices.length === 0 ? <Text type="secondary">No invoices</Text> : (
              <List size="small" dataSource={snap.recentInvoices} renderItem={(i: any) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: 13 }}>{i.invoiceNumber}</Text>
                      <Text style={{ fontSize: 13 }}>{omr(i.totalAmount)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>{fdate(i.invoiceDate)} · due {fdate(i.dueDate)}</Text>
                      {i.balanceDue > 0
                        ? <Tag color={i.overdue ? 'red' : 'orange'} style={{ margin: 0, fontSize: 11 }}>{i.overdue ? 'Overdue ' : 'Due '}{omr(i.balanceDue)}</Tag>
                        : <Tag color="green" style={{ margin: 0, fontSize: 11 }}>Paid</Tag>}
                    </div>
                  </div>
                </List.Item>
              )} />
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
