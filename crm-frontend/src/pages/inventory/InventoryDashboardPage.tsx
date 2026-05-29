import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Statistic, Spin } from 'antd';
import { ShoppingOutlined, WarningOutlined, InboxOutlined, SwapOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import salesApi from '../../services/salesApi';

const { Title, Text } = Typography;
const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#ff4d4f', '#13c2c2'];

export default function InventoryDashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salesApi.get('/sales/products', { params: { limit: 100 } })
      .then(r => { setProducts(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const totalProducts = products.length;
  const inventoryItems = products.filter(p => p.isInventoryItem);
  const serviceItems = products.filter(p => !p.isInventoryItem);
  const lowStockItems = products.filter(p => p.isInventoryItem && p.trackStock && Number(p.stockQuantity || 0) <= Number(p.minStockQty || 0));
  const outOfStock = products.filter(p => p.isInventoryItem && p.trackStock && Number(p.stockQuantity || 0) <= 0);

  const categoryData = products.reduce((acc: any, p: any) => {
    const cat = p.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const stockData = inventoryItems.slice(0, 8).map(p => ({
    name: p.productCode || p.productName?.slice(0, 10),
    stock: Number(p.stockQuantity || 0),
    min: Number(p.minStockQty || 0),
  }));

  const kpis = [
    { title: 'Total Products', value: totalProducts, icon: <ShoppingOutlined />, color: '#1890ff' },
    { title: 'Inventory Items', value: inventoryItems.length, icon: <InboxOutlined />, color: '#52c41a' },
    { title: 'Service Items', value: serviceItems.length, icon: <ShoppingOutlined />, color: '#722ed1' },
    { title: 'Low Stock Alerts', value: lowStockItems.length, icon: <WarningOutlined />, color: lowStockItems.length > 0 ? '#ff4d4f' : '#52c41a' },
    { title: 'Out of Stock', value: outOfStock.length, icon: <WarningOutlined />, color: outOfStock.length > 0 ? '#ff4d4f' : '#52c41a' },
    { title: 'Categories', value: Object.keys(categoryData).length, icon: <SwapOutlined />, color: '#13c2c2' },
  ];

  const lowStockColumns = [
    { title: 'Product', dataIndex: 'productName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Code', dataIndex: 'productCode', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Stock', dataIndex: 'stockQuantity', render: (v: number) => <Text strong style={{ color: '#ff4d4f' }}>{Number(v || 0).toFixed(0)}</Text> },
    { title: 'Min Stock', dataIndex: 'minStockQty', render: (v: number) => Number(v || 0).toFixed(0) },
    { title: 'Status', render: (_: any, r: any) => Number(r.stockQuantity || 0) <= 0 ? <Tag color="red">Out of Stock</Tag> : <Tag color="orange">Low Stock</Tag> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Inventory Analytics</Title>
        <Text type="secondary">Stock levels, product categories and warehouse overview</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <Col span={4} key={i}>
            <Card style={{ borderRadius: 12, borderLeft: `4px solid ${k.color}` }} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{k.title}</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
                </div>
                <div style={{ fontSize: 24, color: k.color, opacity: 0.25 }}>{k.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={14}>
          <Card title="Stock Levels (Top 8 Products)" style={{ borderRadius: 12 }} size="small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="stock" name="Current Stock" fill="#1890ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="min" name="Min Stock" fill="#ff4d4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Products by Category" style={{ borderRadius: 12 }} size="small">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>No products yet</div>}
          </Card>
        </Col>
      </Row>

      {lowStockItems.length > 0 && (
        <Card title={<span style={{ color: '#ff4d4f' }}>⚠ Low Stock & Out of Stock Alerts</span>} style={{ borderRadius: 12 }}>
          <Table dataSource={lowStockItems} columns={lowStockColumns} rowKey="productId" size="small" pagination={false} />
        </Card>
      )}
    </div>
  );
}
