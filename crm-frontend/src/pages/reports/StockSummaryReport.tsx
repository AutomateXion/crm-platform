import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Row, Col, Statistic, Select, Button, Typography, Tag, Space, Spin } from 'antd';
import { DownloadOutlined, ReloadOutlined, InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const Lt = axios.create({ baseURL: '/sales-api' });
Lt.interceptors.request.use((cfg: any) => {
  const t = localStorage.getItem('accessToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const { Title, Text } = Typography;
const { Option } = Select;

const omr = (v: any) => `OMR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  IN_STOCK: { color: 'green', label: 'In Stock' },
  LOW_STOCK: { color: 'orange', label: 'Low Stock' },
  OUT_OF_STOCK: { color: 'red', label: 'Out of Stock' },
};

const TYPE_LABEL: Record<string, string> = {
  STOCK: '📦 Stock', CONSUMABLE: '🔧 Consumable', FIXED_ASSET: '🏭 Fixed Asset', SERVICE: '⚙️ Service',
};

export default function StockSummaryReport() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string | undefined>();
  const [productType, setProductType] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (category) params.category = category;
      if (productType) params.productType = productType;
      if (status) params.status = status;
      const r = await Lt.get('/sales/reports/stock-summary', { params });
      setRows(r.data.rows || []);
      setSummary(r.data.summary || {});
      if ((r.data.categories || []).length) setCategories(r.data.categories);
    } catch {
      /* surfaced as empty table */
    } finally {
      setLoading(false);
    }
  }, [category, productType, status]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = () => {
    const headers = ['Code', 'Product', 'Category', 'Type', 'UOM', 'Stock Qty', 'Unit Cost', 'Stock Value', 'Status'];
    const lines = rows.map((r) => [
      r.productCode, `"${(r.productName || '').replace(/"/g, '""')}"`, r.category, r.productType,
      r.unitOfMeasure, r.stockQty, r.costPrice, r.stockValue.toFixed(3), STATUS_TAG[r.status]?.label || r.status,
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `stock-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const columns = [
    { title: 'Code', dataIndex: 'productCode', key: 'code', width: 110 },
    { title: 'Product', dataIndex: 'productName', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'cat', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Type', dataIndex: 'productType', key: 'type', render: (v: string) => TYPE_LABEL[v] || v },
    { title: 'UOM', dataIndex: 'unitOfMeasure', key: 'uom', width: 60 },
    { title: 'Stock Qty', dataIndex: 'stockQty', key: 'qty', align: 'right' as const, render: (v: number) => Number(v).toFixed(3) },
    { title: 'Unit Cost', dataIndex: 'costPrice', key: 'cost', align: 'right' as const, render: (v: number) => Number(v).toFixed(3) },
    { title: 'Stock Value', dataIndex: 'stockValue', key: 'val', align: 'right' as const, render: (v: number) => <strong>{omr(v)}</strong> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => { const t = STATUS_TAG[v] || { color: 'default', label: v }; return <Tag color={t.color}>{t.label}</Tag>; } },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}><InboxOutlined /> Stock Summary</Title>
          <Text type="secondary">Stock on hand, valuation and status across all products</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
        </Space>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #1890ff' }}><Statistic title="Total SKUs" value={summary.totalSkus || 0} valueStyle={{ color: '#1890ff', fontSize: 20 }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #52c41a' }}><Statistic title="Total Stock Value" value={omr(summary.totalStockValue)} valueStyle={{ color: '#52c41a', fontSize: 18 }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #fa8c16' }}><Statistic title="Low Stock" value={summary.lowStockCount || 0} valueStyle={{ color: '#fa8c16', fontSize: 20 }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #ff4d4f' }}><Statistic title="Out of Stock" value={summary.outOfStockCount || 0} valueStyle={{ color: '#ff4d4f', fontSize: 20 }} /></Card></Col>
      </Row>

      <Card style={{ borderRadius: 12, marginBottom: 12 }} size="small">
        <Space wrap>
          <Select placeholder="Category" allowClear style={{ width: 180 }} value={category} onChange={setCategory}>
            {categories.map((c) => <Option key={c} value={c}>{c}</Option>)}
          </Select>
          <Select placeholder="Product Type" allowClear style={{ width: 170 }} value={productType} onChange={setProductType}>
            <Option value="STOCK">📦 Stock</Option>
            <Option value="CONSUMABLE">🔧 Consumable</Option>
            <Option value="FIXED_ASSET">🏭 Fixed Asset</Option>
            <Option value="SERVICE">⚙️ Service</Option>
          </Select>
          <Select placeholder="Stock Status" allowClear style={{ width: 160 }} value={status} onChange={setStatus}>
            <Option value="IN_STOCK">In Stock</Option>
            <Option value="LOW_STOCK">Low Stock</Option>
            <Option value="OUT_OF_STOCK">Out of Stock</Option>
          </Select>
          {(category || productType || status) && <Button onClick={() => { setCategory(undefined); setProductType(undefined); setStatus(undefined); }}>Clear</Button>}
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={rows}
          columns={columns}
          rowKey="productId"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 25, showTotal: (t) => `${t} products` }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 700 }}>
                <Table.Summary.Cell index={0} colSpan={7}>Total Stock Value</Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">{omr(summary.totalStockValue)}</Table.Summary.Cell>
                <Table.Summary.Cell index={2}> </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
}
