import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Typography, Tag, Row, Col, Statistic, Button, Spin, Empty, Space } from 'antd';
import { FilePdfOutlined, ReloadOutlined, FundOutlined } from '@ant-design/icons';
import salesApi from '../../services/salesApi';

const { Title, Text } = Typography;

const METHOD_LABEL: Record<string, string> = {
  FIFO: 'FIFO (First-In First-Out)',
  WEIGHTED_AVG: 'Weighted Average (AVCO)',
};

export default function StockValuationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/reports/stock-valuation'); setData(r.data); }
    catch { setData(null); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const fmt = (n: any) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const columns = [
    { title: 'Code', dataIndex: 'productCode', width: 120, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Product', dataIndex: 'productName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Category', dataIndex: 'category', width: 130, render: (v: string) => v || '—' },
    { title: 'UOM', dataIndex: 'unitOfMeasure', width: 70 },
    { title: 'Qty on Hand', dataIndex: 'qtyOnHand', width: 120, align: 'right' as const, render: (v: number) => <Text strong>{Number(v).toFixed(3)}</Text> },
    { title: 'Unit Cost', dataIndex: 'unitValue', width: 120, align: 'right' as const, render: (v: number) => `OMR ${fmt(v)}` },
    { title: 'Total Value', dataIndex: 'totalValue', width: 140, align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#1890ff' }}>OMR {fmt(v)}</Text> },
  ];

  const exportPDF = () => {
    if (!data) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Stock Valuation</title>
      <style>body{font-family:Arial;padding:25px;color:#333}h1{color:#1f3864;margin-bottom:2px}
      table{width:100%;border-collapse:collapse;margin:12px 0;font-size:11px}td,th{border:1px solid #ddd;padding:6px}
      th{background:#1f3864;color:#fff;text-align:left}td.r,th.r{text-align:right}</style></head><body>
      <h1>Stock Valuation Report</h1>
      <p style="color:#888;margin-top:0">Method: ${METHOD_LABEL[data.method] || data.method} · As of ${new Date(data.asOf).toLocaleDateString()} · ${data.itemCount} items</p>
      <table><tr><th>Code</th><th>Product</th><th>Category</th><th>UOM</th><th class="r">Qty</th><th class="r">Unit Cost</th><th class="r">Total Value</th></tr>
      ${data.items.map((i: any) => `<tr><td>${i.productCode}</td><td>${i.productName}</td><td>${i.category || '—'}</td><td>${i.unitOfMeasure || ''}</td><td class="r">${Number(i.qtyOnHand).toFixed(3)}</td><td class="r">${fmt(i.unitValue)}</td><td class="r">${fmt(i.totalValue)}</td></tr>`).join('')}
      <tr style="font-weight:bold;background:#f5f5f5"><td colspan="6" class="r">TOTAL INVENTORY VALUE</td><td class="r">OMR ${fmt(data.totalValue)}</td></tr>
      </table>
      <p style="margin-top:25px;font-size:10px;color:#999">Generated ${new Date().toLocaleString()} · AutomateXion CRM/ERP · Ties to GL 1140 Inventory</p>
      </body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}><FundOutlined /> Stock Valuation</Title>
          <Text type="secondary">Inventory value by costing method</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
          <Button icon={<FilePdfOutlined />} onClick={exportPDF} disabled={!data}>Export PDF</Button>
        </Space>
      </div>

      {loading ? <Spin /> : !data ? <Empty /> : (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #1890ff' }}><Statistic title="Total Inventory Value" value={`OMR ${fmt(data.totalValue)}`} /></Card></Col>
            <Col span={8}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #52c41a' }}><Statistic title="Items Valued" value={data.itemCount} /></Card></Col>
            <Col span={8}><Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #fa8c16' }}><Statistic title="Costing Method" value={METHOD_LABEL[data.method] || data.method} valueStyle={{ fontSize: 16 }} /></Card></Col>
          </Row>
          <Card size="small">
            <Table
              dataSource={data.items} columns={columns} rowKey="productId" size="middle"
              pagination={{ pageSize: 20 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={6}><Text strong style={{ float: 'right' }}>Total Inventory Value</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={6}><Text strong style={{ color: '#1890ff' }}>OMR {fmt(data.totalValue)}</Text></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </>
      )}
    </div>
  );
}
