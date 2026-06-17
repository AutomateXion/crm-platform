import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Select, Button, Row, Col, Typography, Tag, Space, Statistic, Divider, Empty } from 'antd';
import { DownloadOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';
import ExportButton from '../../components/common/ExportButton';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const TYPE_COLOR: Record<string, string> = {
  SALE: '#ff4d4f', PURCHASE: '#52c41a', ADJUSTMENT: '#fa8c16', TRANSFER: '#1890ff',
};

export default function ItemProfileReport() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sApi.get('/sales/products', { params: { limit: 500 } }).then(r => setProducts(r.data.data || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const r = await sApi.get(`/sales/reports/item-history/${selectedProduct}`);
      setReport(r.data);
    } catch {}
    finally { setLoading(false); }
  }, [selectedProduct]);

  useEffect(() => { if (selectedProduct) load(); }, [load, selectedProduct]);

  const exportCSV = () => {
    if (!report) return;
    const headers = 'Date,Type,Reference,Party,Qty,Unit Price,Value,Direction';
    const rows = (report.transactions || []).map((t: any) => [
      t.date ? dayjs(t.date).format('YYYY-MM-DD') : '', t.type, t.reference, t.party,
      t.qty, Number(t.unitPrice).toFixed(3), Number(t.value).toFixed(3), t.direction
    ].join(','));
    const csv = [headers, ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `item-history-${report.product?.productCode}-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
  };

  const columns = [
    { title: 'Date', dataIndex: 'date', width: 110, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
    { title: 'Type', dataIndex: 'type', width: 110, render: (v: string) => <Tag style={{ background: `${TYPE_COLOR[v] || '#ccc'}15`, color: TYPE_COLOR[v] || '#666', border: 'none', fontWeight: 600 }}>{v}</Tag> },
    { title: 'Reference', dataIndex: 'reference', render: (v: string) => <Text style={{ fontSize: 12, color: '#1890ff' }}>{v}</Text> },
    { title: 'Party', dataIndex: 'party', render: (v: string) => <Text style={{ fontSize: 13 }}>{v || '—'}</Text> },
    { title: 'Qty', dataIndex: 'qty', align: 'right' as const, render: (v: number, r: any) => (
      <Text strong style={{ color: r.direction === 'IN' ? '#52c41a' : '#ff4d4f' }}>
        {r.direction === 'IN' ? '+' : '-'}{Math.abs(Number(v)).toFixed(3)}
      </Text>
    )},
    { title: 'Unit Price', dataIndex: 'unitPrice', align: 'right' as const, render: (v: number) => <Text>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Value', dataIndex: 'value', align: 'right' as const, render: (v: number, r: any) => (
      <Text strong style={{ color: r.direction === 'IN' ? '#52c41a' : '#ff4d4f' }}>OMR {Number(v).toFixed(3)}</Text>
    )},
    { title: 'Flow', dataIndex: 'direction', align: 'center' as const, render: (v: string) => v === 'IN'
      ? <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 16 }} />
      : <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 16 }} /> },
  ];

  const p = report?.product;
  const s = report?.summary;
  const pa = report?.priceAnalysis;

  return (
    <div id="item-profile-report">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Item Profile & History</Title>
          <Text type="secondary">Full transaction history, stock balance and price analysis per item</Text>
        </div>
        <Space>
          <ExportButton config={{ elementId:'item-profile-report', filename:'item-profile', data: report?.transactions || [] }} />
          <Button icon={<DownloadOutlined />} onClick={exportCSV} disabled={!report}>Export CSV</Button>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading} disabled={!selectedProduct}>Refresh</Button>
        </Space>
      </div>

      {/* Product Selector */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }} size="small">
        <Row gutter={12} align="middle">
          <Col span={12}>
            <Select showSearch placeholder="Select a product to view profile..." style={{ width: '100%' }}
              optionFilterProp="children" value={selectedProduct || undefined}
              onChange={setSelectedProduct}>
              {products.map(p => <Option key={p.productId} value={p.productId}>{p.productCode} — {p.productName}</Option>)}
            </Select>
          </Col>
        </Row>
      </Card>

      {!report && !loading && <Empty description="Select a product to view its profile" style={{ padding: 60 }} />}

      {report && (
        <>
          {/* Product Info */}
          <Card style={{ borderRadius: 12, marginBottom: 16, borderLeft: '4px solid #2E6DA4' }} size="small">
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Title level={5} style={{ margin: 0, color: '#2E6DA4' }}>{p?.productName}</Title>
                <Space style={{ marginTop: 4 }}>
                  <Tag color="purple">{p?.productCode}</Tag>
                  {p?.category && <Tag>{p.category}</Tag>}
                  <Tag color={p?.trackStock ? 'green' : 'default'}>{p?.trackStock ? 'Tracked' : 'Not Tracked'}</Tag>
                </Space>
              </Col>
              <Col span={12}>
                <Row gutter={8}>
                  <Col span={8}><Statistic title="Current Stock" value={Number(s?.currentStock || 0).toFixed(3)} valueStyle={{ color: '#1890ff', fontSize: 18 }} /></Col>
                  <Col span={8}><Statistic title="Stock Value" prefix="OMR " value={Number(s?.stockValue || 0).toFixed(3)} valueStyle={{ color: '#2E6DA4', fontSize: 18 }} /></Col>
                  <Col span={8}><Statistic title="UOM" value={p?.unitOfMeasure || '—'} valueStyle={{ fontSize: 18 }} /></Col>
                </Row>
              </Col>
            </Row>
          </Card>

          {/* Summary KPIs */}
          <Row gutter={12} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Total Purchases</Text>
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>{Number(s?.totalPurchaseQty || 0).toFixed(3)}</Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>OMR {Number(s?.totalPurchaseValue || 0).toFixed(3)}</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Total Sales</Text>
                <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>{Number(s?.totalSalesQty || 0).toFixed(3)}</Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>OMR {Number(s?.totalSalesValue || 0).toFixed(3)}</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Closing Stock</Text>
                <Text strong style={{ fontSize: 18, color: '#1890ff' }}>{Number(s?.currentStock || 0).toFixed(3)}</Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>OMR {Number(s?.stockValue || 0).toFixed(3)}</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #fa8c16' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Gross Margin</Text>
                <Text strong style={{ fontSize: 18, color: '#fa8c16' }}>
                  {pa?.avgPurchasePrice > 0 ? Math.round(((pa?.avgSalePrice - pa?.avgPurchasePrice) / pa?.avgSalePrice) * 100) : 0}%
                </Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Avg Sale vs Purchase</Text>
              </Card>
            </Col>
          </Row>

          {/* Price Analysis */}
          <Card title="💰 Price Analysis" style={{ borderRadius: 12, marginBottom: 16 }} size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Text strong style={{ display: 'block', marginBottom: 8, color: '#52c41a' }}>Purchase Prices</Text>
                <Row gutter={8}>
                  <Col span={8}><Statistic title="Min" prefix="OMR " value={Number(pa?.minPurchasePrice || 0).toFixed(3)} valueStyle={{ color: '#52c41a', fontSize: 16 }} /></Col>
                  <Col span={8}><Statistic title="Avg" prefix="OMR " value={Number(pa?.avgPurchasePrice || 0).toFixed(3)} valueStyle={{ color: '#52c41a', fontSize: 16 }} /></Col>
                  <Col span={8}><Statistic title="Max" prefix="OMR " value={Number(pa?.maxPurchasePrice || 0).toFixed(3)} valueStyle={{ color: '#52c41a', fontSize: 16 }} /></Col>
                </Row>
              </Col>
              <Col span={12}>
                <Text strong style={{ display: 'block', marginBottom: 8, color: '#ff4d4f' }}>Selling Prices</Text>
                <Row gutter={8}>
                  <Col span={8}><Statistic title="Min" prefix="OMR " value={Number(pa?.minSalePrice || 0).toFixed(3)} valueStyle={{ color: '#ff4d4f', fontSize: 16 }} /></Col>
                  <Col span={8}><Statistic title="Avg" prefix="OMR " value={Number(pa?.avgSalePrice || 0).toFixed(3)} valueStyle={{ color: '#ff4d4f', fontSize: 16 }} /></Col>
                  <Col span={8}><Statistic title="Max" prefix="OMR " value={Number(pa?.maxSalePrice || 0).toFixed(3)} valueStyle={{ color: '#ff4d4f', fontSize: 16 }} /></Col>
                </Row>
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <Row gutter={8}>
              <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Current Cost Price:</Text> <Text strong>OMR {Number(pa?.currentCostPrice || 0).toFixed(3)}</Text></Col>
              <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Current Selling Price:</Text> <Text strong>OMR {Number(pa?.currentSellingPrice || 0).toFixed(3)}</Text></Col>
              <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Current Margin:</Text> <Text strong style={{ color: '#fa8c16' }}>{pa?.currentSellingPrice > 0 ? Math.round(((pa?.currentSellingPrice - pa?.currentCostPrice) / pa?.currentSellingPrice) * 100) : 0}%</Text></Col>
            </Row>
          </Card>

          {/* Transaction History */}
          <Card title="📋 Transaction History" style={{ borderRadius: 12 }} size="small">
            <Table dataSource={report.transactions} columns={columns} rowKey={(r, i) => `${r.type}-${r.reference}-${i}`}
              size="small" loading={loading}
              pagination={{ pageSize: 15, showTotal: t => `${t} transactions` }}
              summary={() => (
                <Table.Summary.Row style={{ background: '#fafafa' }}>
                  <Table.Summary.Cell index={0} colSpan={4}><Text strong>Total</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <Text strong style={{ color: '#1890ff' }}>{report.transactions.reduce((s: number, t: any) => s + Number(t.qty || 0), 0).toFixed(3)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} />
                  <Table.Summary.Cell index={6} align="right">
                    <Text strong>OMR {report.transactions.reduce((s: number, t: any) => s + Number(t.value || 0), 0).toFixed(3)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} />
                </Table.Summary.Row>
              )}
            />
          </Card>
        </>
      )}
    </div>
  );
}
