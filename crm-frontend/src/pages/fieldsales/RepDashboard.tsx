import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Progress, Tag, Spin, Empty, List } from 'antd';
import { TrophyOutlined, DollarOutlined, ShoppingOutlined, InboxOutlined,
         RiseOutlined, FileTextOutlined, GiftOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use((c: any) => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const omr = (v: any) => `OMR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
const fdate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';
const MONTHS = ['', 'January','February','March','April','May','June','July','August','September','October','November','December'];

export default function RepDashboard() {
  const [loading, setLoading] = useState(true);
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    sApi.get('/sales/field/rep-dashboard')
      .then(r => setD(r.data))
      .catch(() => setD(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!d) return <Empty description="Could not load your dashboard" style={{ marginTop: 80 }} />;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Good day, {d.salesman} 👋</Title>
        <Text type="secondary">{MONTHS[d.period.month]} {d.period.year} — here's where you stand</Text>
      </div>

      {/* Target + Commission hero row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        <Col xs={24} md={12}>
          <Card style={{ borderRadius: 14, background: 'linear-gradient(135deg, #0B2547 0%, #1A4D8F 100%)' }} bodyStyle={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#9ec5e8' }}><TrophyOutlined /> My Collections vs Target</Text>
              <Tag color="gold">{d.targetProgress.toFixed(0)}%</Tag>
            </div>
            <div style={{ margin: '10px 0' }}>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>{omr(d.collectionsThisMonth)}</Text>
              <Text style={{ color: '#9ec5e8', fontSize: 13 }}> / {omr(d.target)}</Text>
            </div>
            <Progress percent={d.targetProgress} showInfo={false} strokeColor="#00C9A7" trailColor="rgba(255,255,255,0.15)" />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card style={{ borderRadius: 14, background: 'linear-gradient(135deg, #00A88A 0%, #00C9A7 100%)' }} bodyStyle={{ padding: 20 }}>
            <Text style={{ color: '#d5fff6' }}><DollarOutlined /> My Commission (this month)</Text>
            <div style={{ margin: '10px 0' }}>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>{omr(d.commission)}</Text>
            </div>
            <Text style={{ color: '#d5fff6', fontSize: 12 }}>
              {d.commissionTiers.upToTargetRate}% up to target · {d.commissionTiers.aboveTargetRate}% above · on collections
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* New Products */}
        <Col xs={24} md={12}>
          <Card title={<span><GiftOutlined /> New Products Arrived</span>} style={{ borderRadius: 14, height: '100%' }} size="small">
            {d.newProducts.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No new products" /> : (
              <List size="small" dataSource={d.newProducts} renderItem={(p: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<ShoppingOutlined style={{ color: '#1A4D8F', fontSize: 18 }} />}
                    title={<Text strong style={{ fontSize: 13 }}>{p.productName}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>{p.brand || p.productCode} · {fdate(p.createdAt)}</Text>}
                  />
                  <Text strong>{omr(p.unitPrice)}</Text>
                </List.Item>
              )} />
            )}
          </Card>
        </Col>

        {/* New Stock */}
        <Col xs={24} md={12}>
          <Card title={<span><InboxOutlined /> New Stock Arrived</span>} style={{ borderRadius: 14, height: '100%' }} size="small">
            {d.newStock.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent stock receipts" /> : (
              <List size="small" dataSource={d.newStock} renderItem={(g: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<InboxOutlined style={{ color: '#00A88A', fontSize: 18 }} />}
                    title={<Text strong style={{ fontSize: 13 }}>{g.grnNumber}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>{g.supplierName || '—'} · {fdate(g.grnDate)}</Text>}
                  />
                  <Tag color={g.status === 'POSTED' ? 'green' : 'default'}>{g.status}</Tag>
                </List.Item>
              )} />
            )}
          </Card>
        </Col>

        {/* Collections Due */}
        <Col xs={24} md={12}>
          <Card title={<span><DollarOutlined /> Collections to Chase</span>} style={{ borderRadius: 14, height: '100%' }} size="small">
            {d.collectionsDue.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing outstanding" /> : (
              <List size="small" dataSource={d.collectionsDue} renderItem={(c: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong style={{ fontSize: 13 }}>{c.customerName}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>{c.invoiceNumber} · due {fdate(c.dueDate)}</Text>}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ color: c.daysOverdue > 0 ? '#cf1322' : '#0B2547' }}>{omr(c.balanceDue)}</Text>
                    {c.daysOverdue > 0 && <div><Tag color="red" style={{ fontSize: 10, margin: 0 }}>{c.daysOverdue}d</Tag></div>}
                  </div>
                </List.Item>
              )} />
            )}
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} md={12}>
          <Card title={<span><FileTextOutlined /> My Recent Orders</span>} style={{ borderRadius: 14, height: '100%' }} size="small">
            {d.recentOrders.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No orders yet" /> : (
              <List size="small" dataSource={d.recentOrders} renderItem={(o: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<RiseOutlined style={{ color: '#4A9ED6', fontSize: 18 }} />}
                    title={<Text strong style={{ fontSize: 13 }}>{o.orderNumber}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>{o.customerName} · {fdate(o.orderDate)}</Text>}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Text strong>{omr(o.totalAmount)}</Text>
                    <div><Tag style={{ fontSize: 10, margin: 0 }}>{o.status}</Tag></div>
                  </div>
                </List.Item>
              )} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
