import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Tag, Space, Modal, Form, Typography,
  Row, Col, Statistic, message, Popconfirm, Tooltip, Select,
  Switch, InputNumber, Tabs, Divider, Alert,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  ShoppingOutlined, InboxOutlined, WarningOutlined, BarcodeOutlined,
} from '@ant-design/icons';
import { productsApi } from '../../services/salesApi';
import api from '../../services/api';
import MasterSelect from '../../components/common/MasterSelect';
import AutoCode from '../../components/common/AutoCode';
import BarcodeQR from '../../components/common/BarcodeQR';
import salesApi from '../../services/salesApi';
import COASelect from '../../components/common/COASelect';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<any[]>([{ warehouseId: '', locationId: '', quantity: 0 }]);
  const [form] = Form.useForm();
  const selectedWarehouseId = Form.useWatch('warehouseId', form);
  const filteredLocations = selectedWarehouseId
    ? locations.filter((l: any) => l.warehouseId === selectedWarehouseId)
    : locations;
  const [isInventory, setIsInventory] = useState(true);
  const [productType, setProductType] = useState('STOCK');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await productsApi.getAll({ page, limit: 20, search: search || undefined });
      setProducts(r.data.data || []); setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    salesApi.get('/sales/warehouses').then(r => setWarehouses(r.data || [])).catch(() => {});
    salesApi.get('/sales/warehouse-locations').then(r => setLocations(r.data || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditRecord(null); form.resetFields(); setIsInventory(true);
    setWarehouseStocks([{ warehouseId: '', locationId: '', quantity: 0 }]);
    form.setFieldsValue({
      isInventoryItem: true, trackStock: true, currencyCode: 'OMR', productType: 'STOCK',
      unitOfMeasure: 'PCS', taxCategory: 'STANDARD', weightUnit: 'KG',
      dimensionUnit: 'CM', openingStockDate: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  };

  const openEdit = async (r: any) => {
    setEditRecord(r); setIsInventory(r.isInventoryItem); setProductType(r.productType || 'STOCK');
    form.setFieldsValue({
      ...r,
      openingStockDate: r.openingStockDate?.slice(0, 10),
    });
    setWarehouseStocks([{ warehouseId: '', locationId: '', quantity: 0 }]);
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      console.log('SAVE payload:', { warehouseId: values.warehouseId, locationId: values.locationId, editId: editRecord?.productId });
      const payload = { ...values };
      if (editRecord) await productsApi.update(editRecord.productId, payload);
      else await productsApi.create(payload);
      message.success('Product saved successfully!');
      setModalOpen(false); load();
    } catch (e: any) {
      console.error('SAVE error:', e?.response?.status, e?.response?.data);
      message.error(e.response?.data?.message || 'Failed to save');
    }
    finally { setSaving(false); }
  };
  const handleSaveFailed = (err: any) => {
    console.warn('VALIDATION blocked save:', err?.errorFields);
    message.warning('Please complete required fields: ' + (err?.errorFields?.map((f: any) => f.name.join('.')).join(', ') || ''));
  };

  const summaryCards = [
    { title: 'Total Products', value: total, color: '#1890ff', icon: <ShoppingOutlined /> },
    { title: 'Stock Items', value: products.filter(p => p.productType==='STOCK'||(!p.productType&&p.isInventoryItem)).length, color: '#52c41a', icon: <InboxOutlined /> },
    { title: 'Consumables', value: products.filter(p => p.productType==='CONSUMABLE').length, color: '#fa8c16', icon: <ShoppingOutlined /> },
    { title: 'Fixed Assets', value: products.filter(p => p.productType==='FIXED_ASSET').length, color: '#1890ff', icon: <ShoppingOutlined /> },
    { title: 'Services', value: products.filter(p => p.productType==='SERVICE'||(!p.productType&&!p.isInventoryItem)).length, color: '#722ed1', icon: <ShoppingOutlined /> },
    { title: 'Low Stock', value: products.filter(p => p.isInventoryItem && p.trackStock && Number(p.stockQuantity || 0) <= Number(p.minStockQty || 5)).length, color: '#ff4d4f', icon: <WarningOutlined /> },
  ];

  const columns = [
    {
      title: 'Product', render: (_: any, r: any) => (
        <div>
          <Text strong>{r.productName}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.productCode}{r.partNumber ? ` · P/N: ${r.partNumber}` : ''}{r.modelNumber ? ` · Model: ${r.modelNumber}` : ''}</div>
        </div>
      ),
    },
    { title: 'Category', dataIndex: 'category', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Warehouse / Location', key: 'warehouse', render: (_: any, r: any) => {
      if (!r.warehouseId && !r.locationId) return <Text type="secondary" style={{ fontSize: 12 }}>Unassigned</Text>;
      const wh = warehouses.find((w: any) => w.warehouseId === r.warehouseId);
      const loc = locations.find((l: any) => l.locationId === r.locationId);
      return (
        <div style={{ fontSize: 12 }}>
          <div>{wh ? wh.warehouseName : '—'}</div>
          {loc && <Text type="secondary">{loc.locationCode}{[loc.zone, loc.rack, loc.shelf, loc.bin].filter(Boolean).length ? ` (${[loc.zone, loc.rack, loc.shelf, loc.bin].filter(Boolean).join('/')})` : ''}</Text>}
        </div>
      );
    }},
    { title: 'UOM', dataIndex: 'unitOfMeasure', render: (v: string, r: any) => (
      <div>
        <Tag color="cyan">{v}</Tag>
        {r.altUom && <div style={{ fontSize: 10, color: '#8c8c8c' }}>Alt: 1 {r.altUom} = {r.altUomConversion} {v}</div>}
      </div>
    )},
    { title: 'Unit Price', dataIndex: 'unitPrice', render: (v: number) => v ? <Text strong style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> : '—' },
    { title: 'Stock', dataIndex: 'stockQuantity', render: (v: number, r: any) => {
      if (!r.isInventoryItem) return <Tag color="purple">Service</Tag>;
      if (!r.trackStock) return <Tag>Not Tracked</Tag>;
      const qty = Number(v || 0);
      const min = Number(r.minStockQty || 0);
      return <Tag color={qty <= 0 ? 'red' : qty <= min ? 'orange' : 'green'}>{qty.toFixed(0)} {r.unitOfMeasure}</Tag>;
    }},
    { title: 'Type', dataIndex: 'productType', render: (v: string, r: any) => {
      const t = v || (r.isInventoryItem ? 'STOCK' : 'SERVICE');
      const colors: Record<string,string> = { STOCK:'blue', CONSUMABLE:'orange', FIXED_ASSET:'green', SERVICE:'purple' };
      return <Tag color={colors[t]||'default'}>{t.replace('_',' ')}</Tag>;
    }},
    { title: 'Label', key: 'label', width: 60, render: (_: any, r: any) => <BarcodeQR value={r.productCode} productName={r.productName} productCode={r.productCode} price={r.unitPrice} /> },
    {
      title: '', key: 'actions', render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Popconfirm title="Delete product?" onConfirm={async () => { await productsApi.delete(r.productId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const formTabs = [
    {
      key: 'basic', label: 'Basic Info',
      forceRender: true,
      children: (
        <>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="productCode" label="Product Code" rules={[{ required: true }]}><AutoCode prefix="PROD" /></Form.Item></Col>
            <Col span={16}><Form.Item name="productName" label="Product Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="productType" label="Product Type" rules={[{required:true}]}>
                <Select onChange={v => {
                  setProductType(v);
                  if (v==='STOCK') { form.setFieldsValue({isInventoryItem:true, trackStock:true}); setIsInventory(true); }
                  else if (v==='CONSUMABLE') { form.setFieldsValue({isInventoryItem:false, trackStock:false}); setIsInventory(false); }
                  else if (v==='FIXED_ASSET') { form.setFieldsValue({isInventoryItem:false, trackStock:false}); setIsInventory(false); }
                  else if (v==='SERVICE') { form.setFieldsValue({isInventoryItem:false, trackStock:false}); setIsInventory(false); }
                }}>
                  <Option value="STOCK">📦 Stock Item</Option>
                  <Option value="CONSUMABLE">🔧 Consumable</Option>
                  <Option value="FIXED_ASSET">🏭 Fixed Asset</Option>
                  <Option value="SERVICE">⚙️ Service</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="partNumber" label="Part Number"><Input placeholder="Manufacturer part #" /></Form.Item></Col>
            <Col span={8}><Form.Item name="designNumber" label="Design Number"><Input placeholder="Design/Drawing #" /></Form.Item></Col>
            <Col span={8}><Form.Item name="modelNumber" label="Model Number"><Input placeholder="Model #" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="brand" label="Brand"><MasterSelect categoryCode="brands" placeholder="Select or add brand" /></Form.Item></Col>
            <Col span={8}><Form.Item name="manufacturer" label="Manufacturer"><MasterSelect categoryCode="manufacturers" placeholder="Select or add manufacturer" /></Form.Item></Col>
            <Col span={8}><Form.Item name="countryOfOrigin" label="Country of Origin"><MasterSelect categoryCode="countries" placeholder="Select country" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="category" label="Category"><MasterSelect categoryCode="product_categories" /></Form.Item></Col>
            <Col span={8}><Form.Item name="hsCode" label="HS Code (Customs)"><MasterSelect categoryCode="hs_codes" placeholder="Select or add HS code" /></Form.Item></Col>
            <Col span={8}><Form.Item name="taxCategory" label="Tax Category"><MasterSelect categoryCode="tax_categories" placeholder="Select tax category" /></Form.Item></Col>
          </Row>
        </>
      ),
    },
    {
      key: 'type_details', label: productType === 'FIXED_ASSET' ? '🏭 Asset Details' : productType === 'CONSUMABLE' ? '🔧 Consumable' : null,
      forceRender: true,
      style: { display: (productType === 'FIXED_ASSET' || productType === 'CONSUMABLE') ? 'block' : 'none' },
      children: (
        <>
          {productType === 'FIXED_ASSET' && (
            <Row gutter={12}>
              <Col span={8}><Form.Item name="assetCategory" label="Asset Category">
                <Select placeholder="Select category...">
                  {['IT Equipment','Office Furniture','Vehicles','Machinery','Buildings','Land','Electrical Equipment','Security Systems','HVAC','Other'].map(c=><Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Form.Item></Col>
              <Col span={8}><Form.Item name="usefulLifeYears" label="Useful Life (Years)"><InputNumber style={{width:'100%'}} min={1} max={100} /></Form.Item></Col>
              <Col span={8}><Form.Item name="depreciationMethod" label="Depreciation Method">
                <Select defaultValue="STRAIGHT_LINE">
                  <Option value="STRAIGHT_LINE">Straight Line</Option>
                  <Option value="DECLINING_BALANCE">Declining Balance</Option>
                  <Option value="UNITS_OF_PRODUCTION">Units of Production</Option>
                </Select>
              </Form.Item></Col>
              <Col span={8}><Form.Item name="salvageValue" label="Salvage Value (OMR)"><InputNumber style={{width:'100%'}} min={0} step={0.001} precision={3} /></Form.Item></Col>
              <Col span={8}><Form.Item name="assetAccount" label="Asset COA Account"><COASelect accountTypes={["ASSET"]} placeholder="e.g. 1210 Property & Equipment" /></Form.Item></Col>
              <Col span={8}><Form.Item name="expenseAccount" label="Depreciation Expense Account"><COASelect accountTypes={["EXPENSE"]} placeholder="e.g. 6700 Depreciation Expense" /></Form.Item></Col>
            </Row>
          )}
          {productType === 'CONSUMABLE' && (
            <Row gutter={12}>
              <Col span={8}><Form.Item name="minConsumableQty" label="Min Stock Alert Qty"><InputNumber style={{width:'100%'}} min={0} /></Form.Item></Col>
              <Col span={8}><Form.Item name="expenseAccount" label="Expense Account"><COASelect accountTypes={["EXPENSE"]} placeholder="e.g. 6600 Office Supplies" /></Form.Item></Col>
            </Row>
          )}
        </>
      ),
    },
    {
      key: 'pricing', label: 'Pricing & UOM',
      forceRender: true,
      children: (
        <>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="unitPrice" label="Unit Price (OMR)"><InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} /></Form.Item></Col>
            <Col span={8}><Form.Item name="costPrice" label="Cost Price (OMR)"><InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} /></Form.Item></Col>
            <Col span={8}><Form.Item name="currencyCode" label="Currency"><Select><Option value="OMR">OMR</Option><Option value="USD">USD</Option><Option value="EUR">EUR</Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="unitOfMeasure" label="Primary UOM"><MasterSelect categoryCode="uom" useLabel={false} /></Form.Item></Col>
            <Col span={8}><Form.Item name="revenueAccount" label="Revenue Account">
                  <COASelect accountTypes={['REVENUE']} placeholder="e.g. 4100 Sales Revenue" />
                </Form.Item></Col>
          </Row>
          <Divider>Alternative Unit of Measure</Divider>
          <Alert type="info" style={{ marginBottom: 12 }} message="Define an alternative UOM (e.g. 1 Box = 12 Pcs). Leave empty if not needed." showIcon />
          <Row gutter={12}>
            <Col span={6}><Form.Item name="altUom" label="Alt UOM Name"><Input placeholder="e.g. Box, Carton, Pack" /></Form.Item></Col>
            <Col span={6}><Form.Item name="altUomConversion" label="Conversion Factor"><InputNumber style={{ width: '100%' }} min={0.001} step={0.001} precision={6} placeholder="e.g. 12" /></Form.Item></Col>
            <Col span={12}><Form.Item name="altUomLabel" label="Label (shown on documents)"><Input placeholder="e.g. 1 Box = 12 Pcs" /></Form.Item></Col>
          </Row>
        </>
      ),
    },
    {
      key: 'inventory', label: 'Inventory',
      forceRender: true,
      children: (
        <>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="isInventoryItem" label="Inventory Item" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" onChange={v => setIsInventory(v)} /></Form.Item></Col>
            <Col span={6}><Form.Item name="trackStock" label="Track Stock" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
            <Col span={6}><Form.Item name="trackSerial" label="Track Serial No." valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
            <Col span={6}><Form.Item name="trackBatch" label="Track Batch/Lot" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="minStockQty" label="Min Stock Qty"><InputNumber style={{ width: '100%' }} min={0} step={1} /></Form.Item></Col>
            <Col span={6}><Form.Item name="reorderPoint" label="Reorder Point"><InputNumber style={{ width: '100%' }} min={0} step={1} /></Form.Item></Col>
            <Col span={6}><Form.Item name="reorderQty" label="Reorder Quantity"><InputNumber style={{ width: '100%' }} min={0} step={1} /></Form.Item></Col>
            <Col span={6}><Form.Item name="trackExpiry" label="Track Expiry" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="shelfLifeDays" label="Shelf Life (days)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          </Row>
          <Divider>Opening Stock</Divider>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="openingStock" label="Opening Stock Qty"><InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} /></Form.Item></Col>
            <Col span={6}><Form.Item name="openingStockValue" label="Opening Stock Value (OMR)"><InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} /></Form.Item></Col>
            <Col span={6}><Form.Item name="openingStockDate" label="Book Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Divider>Default Warehouse & Location</Divider>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="warehouseId" label="Default Warehouse">
                <Select allowClear showSearch optionFilterProp="children" placeholder="Select warehouse"
                  onChange={() => form.setFieldsValue({ locationId: undefined })}>
                  {warehouses.map(w => <Option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="locationId" label="Default Location/Bin">
                <Select allowClear showSearch optionFilterProp="children"
                  placeholder={selectedWarehouseId ? 'Select location' : 'Select a warehouse first'}
                  disabled={!selectedWarehouseId} notFoundContent="No locations in this warehouse">
                  {filteredLocations.map((l: any) => <Option key={l.locationId} value={l.locationId}>{l.locationCode} {l.locationName ? `— ${l.locationName}` : ''}{[l.zone, l.rack, l.shelf, l.bin].filter(Boolean).length ? ` (${[l.zone, l.rack, l.shelf, l.bin].filter(Boolean).join('/')})` : ''}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'dimensions', label: 'Dimensions & Weight',
      forceRender: true,
      children: (
        <>
          <Row gutter={12}>
            <Col span={4}><Form.Item name="weight" label="Weight"><InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} /></Form.Item></Col>
            <Col span={4}><Form.Item name="weightUnit" label="Unit"><Select><Option value="KG">KG</Option><Option value="G">G</Option><Option value="LB">LB</Option><Option value="OZ">OZ</Option></Select></Form.Item></Col>
          </Row>
          <Divider>Dimensions</Divider>
          <Row gutter={12}>
            <Col span={5}><Form.Item name="length" label="Length"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item></Col>
            <Col span={5}><Form.Item name="width" label="Width"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item></Col>
            <Col span={5}><Form.Item name="height" label="Height"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item></Col>
            <Col span={5}><Form.Item name="dimensionUnit" label="Unit"><Select><Option value="CM">CM</Option><Option value="MM">MM</Option><Option value="IN">IN</Option><Option value="M">M</Option></Select></Form.Item></Col>
          </Row>
        </>
      ),
    },
    {
      key: 'notes', label: 'Notes',
      forceRender: true,
      children: (
        <Form.Item name="notes" label="Internal Notes">
          <Input.TextArea rows={5} placeholder="Internal notes about this product..." />
        </Form.Item>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Products & Services</Title><Text type="secondary">Manage your product catalog with full inventory control</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Product</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {summaryCards.map((c, i) => (
          <Col span={6} key={i}>
            <Card style={{ borderRadius: 12, borderLeft: `4px solid ${c.color}` }} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><Text type="secondary" style={{ fontSize: 12 }}>{c.title}</Text><div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div></div>
                <div style={{ fontSize: 24, color: c.color, opacity: 0.25 }}>{c.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search products..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 300, marginBottom: 16 }} />
        <Table dataSource={products} columns={columns} rowKey="productId" loading={loading} size="middle"
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: t => `${t} products` }} />
      </Card>

      <Modal title={editRecord ? `Edit: ${editRecord.productName}` : 'New Product / Service'}
        open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={780} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} onFinishFailed={handleSaveFailed} style={{ marginTop: 8 }}>
          <Tabs items={formTabs} size="small" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {editRecord ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
