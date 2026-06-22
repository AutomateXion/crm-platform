import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Row, Col, Statistic, Select, Button, Typography, Tag, Space, Empty, Modal, InputNumber, message } from 'antd';
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

  // PO conversion state
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState<string | undefined>();
  const [warehouseId, setWarehouseId] = useState<string | undefined>();
  const [poItems, setPoItems] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

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

  // Load suppliers + warehouses once (for the PO dialog)
  useEffect(() => {
    Lt.get('/sales/suppliers', { params: { limit: 100 } }).then(r => setSuppliers(r.data?.data || [])).catch(() => {});
    Lt.get('/sales/warehouses').then(r => setWarehouses(r.data?.data || r.data || [])).catch(() => {});
  }, []);

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

  // Open the convert-to-PO dialog, seeding editable line items from the selection
  const openPoModal = () => {
    const chosen = rows.filter((r) => selectedKeys.includes(r.productId));
    if (!chosen.length) return;
    setPoItems(chosen.map((r) => ({
      productId: r.productId,
      itemCode: r.productCode,
      description: r.productName,
      unitOfMeasure: r.unitOfMeasure,
      quantity: Number(r.suggestedQty || 0),
      unitPrice: Number(r.costPrice || 0),
    })));
    setSupplierId(undefined);
    setWarehouseId(undefined);
    setPoModalOpen(true);
  };

  const updatePoItem = (productId: string, field: string, value: any) => {
    setPoItems((prev) => prev.map((it) => it.productId === productId ? { ...it, [field]: value } : it));
  };

  const poTotal = poItems.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);

  const createPO = async () => {
    if (!supplierId) { message.warning('Please select a supplier'); return; }
    if (!warehouseId) { message.warning('Please select a warehouse'); return; }
    const validItems = poItems.filter((it) => Number(it.quantity) > 0);
    if (!validItems.length) { message.warning('No items with a quantity greater than zero'); return; }
    setCreating(true);
    try {
      const supplier = suppliers.find((s) => (s.supplierId || s.supplier_id) === supplierId);
      const payload: any = {
        supplierId,
        supplierName: supplier?.supplierName || supplier?.supplier_name || '',
        warehouseId,
        orderDate: new Date().toISOString().slice(0, 10),
        status: 'DRAFT',
        items: validItems.map((it) => ({
          productId: it.productId,
          itemCode: it.itemCode,
          description: it.description,
          unitOfMeasure: it.unitOfMeasure,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          lineTotal: Number(it.quantity) * Number(it.unitPrice),
        })),
      };
      const r = await Lt.post('/sales/purchase-orders', payload);
      const poNum = r.data?.poNumber || r.data?.po_number || '';
      message.success(`Draft Purchase Order ${poNum} created with ${validItems.length} item(s)`);
      setPoModalOpen(false);
      setSelectedKeys([]);
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Could not create the purchase order');
    } finally {
      setCreating(false);
    }
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
          <Button type="primary" icon={<ShoppingCartOutlined />} onClick={openPoModal} disabled={!selectedKeys.length}>
            Create PO from selected{selectedKeys.length ? ` (${selectedKeys.length})` : ''}
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
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
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
          locale={{ emptyText: <Empty description="No products need reordering 🎉" /> }}
          pagination={{ pageSize: 25, showTotal: (t) => `${t} items` }}
        />
      </Card>

      {/* Convert selected reorder items -> draft Purchase Order */}
      <Modal
        title="Create Purchase Order from reorder items"
        open={poModalOpen}
        onCancel={() => setPoModalOpen(false)}
        onOk={createPO}
        confirmLoading={creating}
        okText="Create draft PO"
        width={760}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Text strong>Supplier <Text type="danger">*</Text></Text>
            <Select
              showSearch optionFilterProp="children" placeholder="Select supplier"
              style={{ width: '100%', marginTop: 4 }} value={supplierId} onChange={setSupplierId}
            >
              {suppliers.map((s) => {
                const id = s.supplierId || s.supplier_id;
                const nm = s.supplierName || s.supplier_name;
                return <Option key={id} value={id}>{nm}</Option>;
              })}
            </Select>
          </Col>
          <Col span={12}>
            <Text strong>Deliver to warehouse <Text type="danger">*</Text></Text>
            <Select
              showSearch optionFilterProp="children" placeholder="Select warehouse"
              style={{ width: '100%', marginTop: 4 }} value={warehouseId} onChange={setWarehouseId}
            >
              {warehouses.map((w) => {
                const id = w.warehouseId || w.warehouse_id;
                const nm = w.warehouseName || w.warehouse_name;
                return <Option key={id} value={id}>{nm}</Option>;
              })}
            </Select>
          </Col>
        </Row>

        <Table
          dataSource={poItems}
          rowKey="productId"
          size="small"
          pagination={false}
          columns={[
            { title: 'Item', dataIndex: 'description', render: (v: string, r: any) => (
              <Space direction="vertical" size={0}>
                <Text strong>{v}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{r.itemCode}</Text>
              </Space>
            ) },
            { title: 'Qty', dataIndex: 'quantity', width: 120, render: (v: number, r: any) => (
              <InputNumber min={0} step={1} value={v} style={{ width: '100%' }}
                onChange={(val) => updatePoItem(r.productId, 'quantity', val)} />
            ) },
            { title: 'Unit Price', dataIndex: 'unitPrice', width: 130, render: (v: number, r: any) => (
              <InputNumber min={0} step={0.001} value={v} style={{ width: '100%' }}
                onChange={(val) => updatePoItem(r.productId, 'unitPrice', val)} />
            ) },
            { title: 'Line Total', key: 'lt', align: 'right' as const,
              render: (_: any, r: any) => omr(Number(r.quantity || 0) * Number(r.unitPrice || 0)) },
          ] as any}
        />
        <div style={{ textAlign: 'right', marginTop: 12 }}>
          <Text strong>Total: {omr(poTotal)}</Text>
        </div>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>The PO is created as a draft — review and send it from the Purchase Orders screen.</Text>
        </div>
      </Modal>
    </div>
  );
}
