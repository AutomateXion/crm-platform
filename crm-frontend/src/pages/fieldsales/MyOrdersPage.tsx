import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Tag, Spin, Empty, Row, Col, Segmented } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { usePermissions } from '../../hooks/usePermissions';

const { Title, Text } = Typography;
const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use((c: any) => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const omr = (v: any) => `OMR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
const fdate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_COLOR: any = { DRAFT: 'default', SENT: 'blue', CONFIRMED: 'cyan', ACCEPTED: 'green', APPROVED: 'green', DELIVERED: 'green', REJECTED: 'red', CANCELLED: 'red', EXPIRED: 'orange' };

export default function MyOrdersPage() {
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const { isFieldVisible } = usePermissions();
  const canSeeAllOrders = isFieldVisible('field_sales', 'field_info', 'fs_my_orders', 'orders_all_scope');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    sApi.get('/sales/field/my-orders', { params: { scope, limit: 80 } })
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [scope]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}><FileTextOutlined /> My Orders</Title>
        <Text type="secondary">Your recent orders and their status</Text>
      </div>

      {canSeeAllOrders && (
        <Segmented options={[{ label: 'My orders', value: 'mine' }, { label: 'All', value: 'all' }]}
          value={scope} onChange={(v: any) => setScope(v)} style={{ marginBottom: 16 }} />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : orders.length === 0 ? (
        <Empty description="No orders found" />
      ) : (
        <Row gutter={[12, 12]}>
          {orders.map(o => (
            <Col xs={24} sm={12} key={o.quotationId}>
              <Card size="small" style={{ borderRadius: 12 }} bodyStyle={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 14 }}>{o.orderNumber}</Text>
                    <Text style={{ display: 'block', fontSize: 13 }}>{o.customerName || '—'}</Text>
                  </div>
                  <Tag color={STATUS_COLOR[(o.status || '').toUpperCase()] || 'default'} style={{ margin: 0 }}>{o.status}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{fdate(o.orderDate)}</Text>
                  <Text strong style={{ fontSize: 15, color: '#0B2547' }}>{omr(o.totalAmount)}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
