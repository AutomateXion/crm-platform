import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Select, DatePicker, Button, Row, Col, Typography, Tag, Space, Input, Progress, Statistic, Alert } from 'antd';
import { DownloadOutlined, ReloadOutlined, WarningOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import ExportButton from '../../components/common/ExportButton';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

export default function StockMovementReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/stock-movement', { params });
      const rows = r.data || [];
      setData(rows);
      const cats = [...new Set(rows.map((r: any) => r.category).filter(Boolean))] as string[];
      setCategories(cats);
    } catch {}
    finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter(r =>
    (!search || r.productName?.toLowerCase().includes(search.toLowerCase()) || r.productCode?.toLowerCase().includes(search.toLowerCase())) &&
    (!categoryFilter || r.category === categoryFilter)
  );

  const lowStock = filtered.filter(r => r.isLowStock);
  const totalStockValue = filtered.reduce((s, r) => s + Number(r.stockValue || 0), 0);
  const totalSalesValue = filtered.reduce((s, r) => s + Number(r.salesValue || 0), 0);
  const totalPurchasesValue = filtered.reduce((s, r) => s + Number(r.purchasesValue || 0), 0);

  const exportCSV = () => {
    const headers = 'Code,Product,Category,Opening,Purchases In,Sales Out,Adj In,Adj Out,Closing,Stock Value,Cost Price,Selling Price,Low Stock';
    const rows = filtered.map(r => [
      r.productCode, r.productName, r.category,
      r.openingStock, r.purchasesIn, r.salesOut, r.adjustmentsIn, r.adjustmentsOut, r.closingStock,
      Number(r.stockValue).toFixed(3), Number(r.costPrice).toFixed(3), Number(r.unitPrice).toFixed(3),
      r.isLowStock ? 'YES' : 'NO'
    ].join(','));
    const csv = [headers, ...rows].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `stock-movement-${dayjs().format('YYYY-MM-DD')}.csv`; a.click();
  };

  const columns = [
    { title: 'Code', dataIndex: 'productCode', width: 90, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Product', dataIndex: 'productName', render: (v: string, r: any) => (
      <Space direction="vertical" size={0}>
        <Text strong style={{ fontSize: 13 }}>{v}</Text>
        <Text type="secondary" style={{ fontSize: 11 }}>{r.category}</Text>
      </Space>
    )},
    { title: 'Opening', dataIndex: 'openingStock', align: 'right' as const, render: (v: number) => <Text>{Number(v).toFixed(3)}</Text> },
    { title: 'Purchases In', dataIndex: 'purchasesIn', align: 'right' as const, render: (v: number) => <Text style={{ color: '#52c41a' }}>+{Number(v).toFixed(3)}</Text> },
    { title: 'Sales Out', dataIndex: 'salesOut', align: 'right' as const, render: (v: number) => <Text style={{ color: '#ff4d4f' }}>-{Number(v).toFixed(3)}</Text> },
    { title: 'Adj In/Out', align: 'right' as const, render: (_: any, r: any) => (
      <Space direction="vertical" size={0}>
        <Text style={{ color: '#52c41a', fontSize: 11 }}>+{Number(r.adjustmentsIn).toFixed(3)}</Text>
        <Text style={{ color: '#ff4d4f', fontSize: 11 }}>-{Number(r.adjustmentsOut).toFixed(3)}</Text>
      </Space>
    )},
    { title: 'Closing Stock', dataIndex: 'closingStock', align: 'right' as const, render: (v: number, r: any) => (
      <Space>
        <Text strong style={{ color: r.isLowStock ? '#ff4d4f' : '#1890ff' }}>{Number(v).toFixed(3)}</Text>
        {r.isLowStock && <WarningOutlined style={{ color: '#ff4d4f' }} />}
      </Space>
    )},
    { title: 'Stock Value', dataIndex: 'stockValue', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#2E6DA4' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Cost Price', dataIndex: 'costPrice', align: 'right' as const, render: (v: number) => <Text>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Sell Price', dataIndex: 'unitPrice', align: 'right' as const, render: (v: number) => <Text>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Status', align: 'center' as const, render: (_: any, r: any) => r.isLowStock
      ? <Tag color="red"><WarningOutlined /> Low Stock</Tag>
      : <Tag color="green">OK</Tag> },
  ];

  return (
    <div id="stock-movement-report">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Stock Movement Report</Title>
          <Text type="secondary">Opening balance, purchases, sales, adjustments and closing stock</Text>
        </div>
        <Space>
          <ExportButton config={{ elementId:'stock-movement-report', filename:'stock-movement', data: filtered || data || [] }} />
          <Button icon={<DownloadOutlined />} onClick={exportCSV}>Export CSV</Button>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={8}><Input prefix={<SearchOutlined />} placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} /></Col>
          <Col span={6}>
            <Select placeholder="All Categories" allowClear style={{ width: '100%' }} onChange={setCategoryFilter}>
              {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Col>
          <Col span={8}><RangePicker style={{ width: '100%' }} onChange={dates => setDateRange(dates)} /></Col>
        </Row>
      </Card>

      {/* KPIs */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #2E6DA4' }}><Statistic title="Total Products" value={filtered.length} valueStyle={{ color: '#2E6DA4' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f' }}><Statistic title="Low Stock Items" value={lowStock.length} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a' }}><Statistic title="Total Purchases Value" prefix="OMR " value={totalPurchasesValue.toFixed(3)} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff' }}><Statistic title="Total Stock Value" prefix="OMR " value={totalStockValue.toFixed(3)} valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>

      {lowStock.length > 0 && (
        <Alert type="warning" showIcon icon={<WarningOutlined />} style={{ marginBottom: 16, borderRadius: 12 }}
          message={`${lowStock.length} item(s) below minimum stock level: ${lowStock.map(r => r.productName).join(', ')}`} />
      )}

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={filtered} columns={columns} rowKey="productId" loading={loading} size="small"
          pagination={{ pageSize: 20, showTotal: (t) => `${t} products` }}
          rowClassName={(r) => r.isLowStock ? 'ant-table-row-warning' : ''}
          summary={() => (
            <Table.Summary.Row style={{ background: '#fafafa' }}>
              <Table.Summary.Cell index={0} colSpan={2}><Text strong>Total</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right"><Text strong>{filtered.reduce((s,r) => s + Number(r.openingStock||0), 0).toFixed(3)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right"><Text strong style={{ color: '#52c41a' }}>{filtered.reduce((s,r) => s + Number(r.purchasesIn||0), 0).toFixed(3)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right"><Text strong style={{ color: '#ff4d4f' }}>{filtered.reduce((s,r) => s + Number(r.salesOut||0), 0).toFixed(3)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={5} />
              <Table.Summary.Cell index={6} align="right"><Text strong style={{ color: '#1890ff' }}>{filtered.reduce((s,r) => s + Number(r.closingStock||0), 0).toFixed(3)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right"><Text strong style={{ color: '#2E6DA4' }}>OMR {totalStockValue.toFixed(3)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={8} />
              <Table.Summary.Cell index={9} />
              <Table.Summary.Cell index={10} />
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
}
