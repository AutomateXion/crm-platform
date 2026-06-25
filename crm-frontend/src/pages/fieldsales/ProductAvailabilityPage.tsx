import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Typography, Tag, Spin, Empty, Row, Col, Drawer, List, Badge } from 'antd';
import { SearchOutlined, ShopOutlined, CheckCircleFilled, WarningFilled, CloseCircleFilled, EnvironmentOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

// Authenticated public-style axios to sales-service via the proxy
const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use((c: any) => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const omr = (v: any, ccy = 'OMR') => `${ccy} ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

function stockBadge(p: any) {
  if (!p.stockTracked) return { color: '#8c8c8c', icon: <ShopOutlined />, text: 'Non-stock' };
  const a = p.totalAvailable;
  if (a <= 0) return { color: '#cf1322', icon: <CloseCircleFilled />, text: 'Out of stock' };
  if (p.minStock > 0 && a <= p.minStock) return { color: '#d46b08', icon: <WarningFilled />, text: `Low: ${a.toFixed(0)} ${p.unitOfMeasure || ''}` };
  return { color: '#389e0d', icon: <CheckCircleFilled />, text: `In stock: ${a.toFixed(0)} ${p.unitOfMeasure || ''}` };
}

export default function ProductAvailabilityPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stockRows, setStockRows] = useState<any[]>([]);
  const [stockProduct, setStockProduct] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);

  const load = useCallback((term: string) => {
    setLoading(true);
    sApi.get('/sales/field/products', { params: { search: term || undefined, limit: 60 } })
      .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(''); }, [load]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const openStock = async (p: any) => {
    setStockProduct(p); setDrawerOpen(true); setStockLoading(true); setStockRows([]);
    try {
      const r = await sApi.get(`/sales/field/products/${p.productId}/stock`);
      setStockRows(Array.isArray(r.data) ? r.data : []);
    } catch { setStockRows([]); } finally { setStockLoading(false); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}><ShopOutlined /> Product Availability & Price</Title>
        <Text type="secondary">Check stock and prices in the field</Text>
      </div>

      <Input
        size="large"
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Search products…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, borderRadius: 12 }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : products.length === 0 ? (
        <Empty description="No products found" />
      ) : (
        <Row gutter={[12, 12]}>
          {products.map(p => {
            const sb = stockBadge(p);
            return (
              <Col xs={24} sm={12} key={p.productId}>
                <Card
                  size="small"
                  hoverable
                  style={{ borderRadius: 12, borderLeft: `4px solid ${sb.color}` }}
                  bodyStyle={{ padding: 14 }}
                  onClick={() => p.stockTracked && openStock(p)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ fontSize: 15, display: 'block' }}>{p.productName}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {p.productCode}{p.brand ? ` · ${p.brand}` : ''}{p.category ? ` · ${p.category}` : ''}
                      </Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <Text strong style={{ fontSize: 17, color: '#0B2547' }}>{omr(p.unitPrice, p.currencyCode)}</Text>
                    <Tag icon={sb.icon} color={sb.color} style={{ borderRadius: 12, margin: 0, fontWeight: 600 }}>
                      {sb.text}
                    </Tag>
                  </div>
                  {p.stockTracked && p.totalAvailable > 0 && (
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
                      <EnvironmentOutlined /> Tap for warehouse breakdown
                    </Text>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Drawer
        title={stockProduct?.productName}
        placement="bottom"
        height="auto"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {stockLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
        ) : stockRows.length === 0 ? (
          <Empty description="No warehouse stock records" />
        ) : (
          <List
            dataSource={stockRows}
            renderItem={(w: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Badge count={w.availableQty.toFixed(0)} showZero overflowCount={99999}
                    style={{ backgroundColor: w.availableQty > 0 ? '#389e0d' : '#cf1322' }} />}
                  title={<Text strong>{w.warehouseName || 'Warehouse'}</Text>}
                  description={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {w.locationCode ? `${w.locationCode} · ` : ''}
                      On hand: {w.quantity.toFixed(0)} · Reserved: {w.reservedQty.toFixed(0)} · Available: {w.availableQty.toFixed(0)} {stockProduct?.unitOfMeasure || ''}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  );
}
