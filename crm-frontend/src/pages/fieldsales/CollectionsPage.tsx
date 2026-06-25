import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Tag, Spin, Empty, Row, Col, Segmented, Statistic } from 'antd';
import { DollarOutlined, WarningFilled } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use((c: any) => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const omr = (v: any) => `OMR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
const fdate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CollectionsPage() {
  const [filter, setFilter] = useState<'all' | 'overdue'>('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({ items: [], totalOutstanding: 0, totalOverdue: 0, count: 0 });

  const load = useCallback(() => {
    setLoading(true);
    sApi.get('/sales/field/collections', { params: { overdue: filter === 'overdue', limit: 150 } })
      .then(r => setData(r.data || { items: [] }))
      .catch(() => setData({ items: [], totalOutstanding: 0, totalOverdue: 0, count: 0 }))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}><DollarOutlined /> Collections to Chase</Title>
        <Text type="secondary">Outstanding receivables, most overdue first</Text>
      </div>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={12}><Card size="small" style={{ borderRadius: 12 }}>
          <Statistic title="Total outstanding" value={data.totalOutstanding} precision={3} prefix="OMR" valueStyle={{ fontSize: 18 }} />
        </Card></Col>
        <Col span={12}><Card size="small" style={{ borderRadius: 12 }}>
          <Statistic title="Overdue" value={data.totalOverdue} precision={3} prefix="OMR" valueStyle={{ fontSize: 18, color: '#cf1322' }} />
        </Card></Col>
      </Row>

      <Segmented options={[{ label: 'All outstanding', value: 'all' }, { label: 'Overdue only', value: 'overdue' }]}
        value={filter} onChange={(v: any) => setFilter(v)} style={{ marginBottom: 16 }} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : data.items.length === 0 ? (
        <Empty description="Nothing to collect" />
      ) : (
        <Row gutter={[12, 12]}>
          {data.items.map((it: any, idx: number) => (
            <Col xs={24} sm={12} key={it.invoiceNumber + idx}>
              <Card size="small" style={{ borderRadius: 12, borderLeft: `4px solid ${it.daysOverdue > 0 ? '#cf1322' : '#d46b08'}` }} bodyStyle={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 14 }}>{it.customerName || '—'}</Text>
                    <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{it.invoiceNumber} · due {fdate(it.dueDate)}</Text>
                  </div>
                  {it.daysOverdue > 0
                    ? <Tag icon={<WarningFilled />} color="red" style={{ margin: 0 }}>{it.daysOverdue}d overdue</Tag>
                    : <Tag color="orange" style={{ margin: 0 }}>Due</Tag>}
                </div>
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <Text strong style={{ fontSize: 16, color: it.daysOverdue > 0 ? '#cf1322' : '#0B2547' }}>{omr(it.balanceDue)}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
