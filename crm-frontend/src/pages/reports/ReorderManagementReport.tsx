import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Row, Col, Statistic, Select, Button, Typography, Tag, Space, Empty } from 'antd';
import { DownloadOutlined, ReloadOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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

export default function ReorderManagementReport() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (category) params.category = category;
      const r = await Lt.get('/sales/reports/reorder-management', { params });
      setRows(r.data.rows || []);
      setSummary(r.data.summary || {});
      if ((r.data.categories || []).length) setCategories(r.data.categories);
    } catch {
      /* empty state */
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = () => {
    const headers = ['Code', 'Product', 'Category', 'UOM', 'Current Stock', 'Trigger Level', 'Suggested Qty', 'Est. Cost'];
    const lines = rows.map((r) => [
      r.productCode, `"${(r.productName || '').replace(/"/g, '""')}"`, r.category, r.unitOfMeasure,
      r.stockQty, r.triggerLevel, r.suggestedQty, r.estimatedCost.toFixed(3),
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reorder-management-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const columns = [
    { title: 'Code', dataIndex: 'productCode', key: 'code', width: 110 },
    { title: 'Product', dataIndex: 'productName', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'cat', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    { title: 'UOM', dataIndex: 'unitOfMeasure', key: 'uom', width: 60 },
    {
      title: 'Current Stock', dataIndex: 'stockQty', key: 'qty', align: 'right' as const,
      render: (v: number, r: any) => <span style={{ color: r.isOut ? '#ff4d4f' : '#fa8c16', fontWeight: 600 }}>{Number(v).toFixed(3)}</span>,
    },
    { title: 'Trigger Level', dataIndex: 'triggerLevel', key: 'trig', align: 'right' as const, render: (v: number) => Number(v).toFixed(3) },
    { title: 'Suggested Qty', dataIndex: 'suggestedQty', key: 'sug', align: 'right' as const, render: (v: number) => <strong style={{ color: '#1890ff' }}>{Number(v).toFixed(3)}</strong> },
    { title: 'Est. Cost', dataIndex: 'estimatedCost', key: 'cost', align: 'right' as const, render: (v: number) => omr(v) },
    { title: 'Status', key: 'status', render: (_: any, r: any) => r.isOut ? <Tag color="red">Out of Stock</Tag> : <Tag color="orange">Reorder</Tag> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}><ShoppingCartOutlined /> Reorder Management</Title>
          <Text type="secondary">Products at or below their reorder point, with suggested order quantities</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
        </Space>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #fa8c16' }}><Statistic title="Items to Reorder" value={summary.itemsToReorder || 0} valueStyle={{ color: '#fa8c16', fontSize: 20 }} /></Card></Col>
        <Col xs={12} sm={8}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #ff4d4f' }}><Statistic title="Out of Stock" value={summary.outOfStock || 0} valueStyle={{ color: '#ff4d4f', fontSize: 20 }} /></Card></Col>
        <Col xs={24} sm={8}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #1890ff' }}><Statistic title="Est. Reorder Cost" value={omr(summary.totalEstimatedCost)} valueStyle={{ color: '#1890ff', fontSize: 18 }} /></Card></Col>
      </Row>

      <Card style={{ borderRadius: 12, marginBottom: 12 }} size="small">
        <Space wrap>
          <Select placeholder="Category" allowClear style={{ width: 200 }} value={category} onChange={setCategory}>
            {categories.map((c) => <Option key={c} value={c}>{c}</Option>)}
          </Select>
          {category && <Button onClick={() => setCategory(undefined)}>Clear</Button>}
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={rows}
          columns={columns}
          rowKey="productId"
          loading={loading}
          size="middle"
          locale={{ emptyText: <Empty description="No products need reordering 🎉" /> }}
          pagination={{ pageSize: 25, showTotal: (t) => `${t} items` }}
        />
      </Card>
    </div>
  );
}
