import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Select, Typography, Row, Col, Tag, Statistic, Empty, Spin } from 'antd';
import { EnvironmentOutlined, InboxOutlined, ShopOutlined } from '@ant-design/icons';
import salesApi from '../../services/salesApi';
import { warehousesApi } from '../../services/salesApi';

const { Title, Text } = Typography;
const { Option } = Select;

export default function StockByLocationPage() {
  const [data, setData] = useState<any>({ warehouses: [], unassigned: [] });
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [filterWarehouse, setFilterWarehouse] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterWarehouse) params.warehouseId = filterWarehouse;
      const r = await salesApi.get('/sales/reports/stock-by-location', { params });
      setData(r.data || { warehouses: [], unassigned: [] });
    } catch(e: any) {
      console.error('Stock by location error:', e?.response?.data || e?.message);
    } finally { setLoading(false); }
  }, [filterWarehouse]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    warehousesApi.getAll()
      .then(r => { console.log('warehouses:', r.data); setWarehouses(r.data || []); })
      .catch(e => console.error('warehouses error:', e?.message));
  }, []);

  const productColumns = [
    { title: 'Code', dataIndex: 'productCode', width: 120, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Product', dataIndex: 'productName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Category', dataIndex: 'category', width: 130, render: (v: string) => v || '—' },
    { title: 'UOM', dataIndex: 'unitOfMeasure', width: 80 },
    { title: 'Opening', dataIndex: 'openingStock', width: 100, align: 'right' as const, render: (v: number) => <Text type="secondary">{Number(v||0).toFixed(3)}</Text> },
    { title: 'Qty on Hand', dataIndex: 'qtyOnHand', width: 120, align: 'right' as const, render: (v: number) => <Text strong style={{ color: v > 0 ? '#52c41a' : '#ff4d4f' }}>{Number(v).toFixed(3)}</Text> },
    { title: 'Reserved', dataIndex: 'reservedQty', width: 100, align: 'right' as const, render: (v: number) => Number(v||0).toFixed(3) },
    { title: 'Available', dataIndex: 'availableQty', width: 110, align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#1890ff' }}>{Number(v||0).toFixed(3)}</Text> },
    { title: 'Updated', dataIndex: 'lastMovement', width: 130, render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  const unassignedColumns = [
    { title: 'Code', dataIndex: 'productCode', width: 120, render: (v: string) => <Tag color="orange">{v}</Tag> },
    { title: 'Product', dataIndex: 'productName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Category', dataIndex: 'category', width: 130, render: (v: string) => v || '—' },
    { title: 'UOM', dataIndex: 'unitOfMeasure', width: 80 },
    { title: 'Qty on Hand', dataIndex: 'qtyOnHand', width: 120, align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#faad14' }}>{Number(v).toFixed(3)}</Text> },
  ];

  const totalLocatedQty = data.warehouses.reduce((ws: number, w: any) =>
    ws + w.locations.reduce((ls: number, l: any) =>
      ls + l.products.reduce((ps: number, p: any) => ps + Number(p.qtyOnHand), 0), 0), 0);
  const totalUnassignedQty = data.unassigned.reduce((s: number, p: any) => s + Number(p.qtyOnHand || 0), 0);
  const totalLocations = data.warehouses.reduce((ws: number, w: any) => ws + w.locations.length, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Stock by Location</Title>
          <Text type="secondary">View inventory distributed across warehouse locations</Text>
        </div>
        <Select placeholder="All Warehouses" allowClear style={{ width: 240 }}
          value={filterWarehouse || undefined} onChange={v => setFilterWarehouse(v || '')}>
          {warehouses.map(w => <Option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName}</Option>)}
        </Select>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="Warehouses" value={data.warehouses.length} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="Active Locations" value={totalLocations} prefix={<EnvironmentOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="Total Located Units" value={Number(totalLocatedQty).toFixed(3)} prefix={<InboxOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {data.warehouses.length === 0 && data.unassigned.length === 0 && !loading ? (
          <Card style={{ borderRadius: 12 }}>
            <Empty description="No stock location data yet. Assign warehouse locations on Purchase Orders to see stock here." />
          </Card>
        ) : (
          <>
            {data.warehouses.map((w: any) => (
              <Card key={w.warehouseId}
                title={<span><ShopOutlined /> {w.warehouseName} <Tag color="blue">{w.warehouseCode}</Tag></span>}
                style={{ borderRadius: 12, marginBottom: 16 }}>
                {w.locations.map((l: any) => (
                  <Card key={l.locationId} size="small"
                    style={{ marginBottom: 12, background: '#f6ffed', borderColor: '#b7eb8f', borderRadius: 8 }}
                    title={
                      <span>
                        <EnvironmentOutlined style={{ color: '#52c41a' }} />
                        {' '}<Text strong>{l.locationCode}</Text>
                        {l.locationName && <Text type="secondary"> — {l.locationName}</Text>}
                        {l.zone && <Tag style={{ marginLeft: 8 }} color="cyan">Zone: {l.zone}</Tag>}
                        {l.rack && <Tag color="geekblue">Rack: {l.rack}</Tag>}
                        {l.shelf && <Tag color="blue">Shelf: {l.shelf}</Tag>}
                        {l.bin && <Tag color="purple">Bin: {l.bin}</Tag>}
                        <Tag color="green" style={{ marginLeft: 8 }}>{l.products.length} SKU{l.products.length !== 1 ? 's' : ''}</Tag>
                      </span>
                    }>
                    <Table dataSource={l.products} columns={productColumns} rowKey="productId"
                      size="small" pagination={false} scroll={{ x: 'max-content' }} />
                  </Card>
                ))}
              </Card>
            ))}

            {data.unassigned.length > 0 && (
              <Card
                title={<span><InboxOutlined style={{ color: '#faad14' }} /> Unassigned Location <Tag color="orange">{data.unassigned.length} SKUs — {Number(totalUnassignedQty).toFixed(3)} units</Tag></span>}
                style={{ borderRadius: 12, borderColor: '#ffe58f' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
                  These products have stock but no warehouse location assigned. Assign locations via Purchase Orders.
                </Text>
                <Table dataSource={data.unassigned} columns={unassignedColumns} rowKey="productId"
                  size="small" pagination={{ showSizeChanger: true, pageSizeOptions: ['10','20','50','100'], defaultPageSize: 20 }} scroll={{ x: 'max-content' }} />
              </Card>
            )}
          </>
        )}
      </Spin>
    </div>
  );
}
