import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Tag, Space, Modal, Form, Typography, Row, Col, message, Popconfirm, Select, InputNumber, Divider, Switch } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import salesApi from '../../services/salesApi';
import ProductSelect from '../../components/common/ProductSelect';
import MasterSelect from '../../components/common/MasterSelect';

const { Title, Text } = Typography;
const { Option } = Select;
const STATUS_COLORS: Record<string, string> = { DRAFT: 'default', CONFIRMED: 'green', CANCELLED: 'red' };

export default function StockAdjustmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/stock-adjustments', { params: { page, limit: 20, search: search||undefined } }); setItems(r.data.data||[]); setTotal(r.data.total||0); }
    catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    salesApi.get('/sales/warehouses').then(r => setWarehouses(r.data||[])).catch(()=>{});
    salesApi.get('/sales/warehouse-locations').then(r => setLocations(r.data||[])).catch(()=>{});
  }, []);

  const defaultLine = () => ({ productId: '', productName: '', quantity: 1, unitCost: 0, unitOfMeasure: 'PCS' });

  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ status: 'CONFIRMED', adjustmentType: 'IN', adjustmentDate: new Date().toISOString().slice(0, 10) });
    setLineItems([defaultLine()]); setModalOpen(true);
  };

  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setLineItems(updated);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const payload = { ...values, items: lineItems };
      if (editRecord) await salesApi.put(`/sales/stock-adjustments/${editRecord.adjustmentId}`, payload);
      else await salesApi.post('/sales/stock-adjustments', payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: 'Adj #', dataIndex: 'adjustmentNumber', render: (v: string) => <Tag color="orange">{v}</Tag> },
    { title: 'Date', dataIndex: 'adjustmentDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Type', dataIndex: 'adjustmentType', render: (v: string) => <Tag color={v === 'IN' ? 'green' : 'red'} icon={v === 'IN' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>{v === 'IN' ? 'Stock In' : 'Stock Out'}</Tag> },
    { title: 'Warehouse', dataIndex: 'warehouseName', render: (v: string) => v || '—' },
    { title: 'Reason', dataIndex: 'reason', render: (v: string) => v || '—' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && <Button size="small" icon={<EditOutlined />} onClick={async () => { setEditRecord(r); try { const d = await salesApi.get(`/sales/stock-adjustments/${r.adjustmentId}`); form.setFieldsValue({...d.data, adjustmentDate: d.data.adjustmentDate?.slice(0,10)}); setLineItems(d.data.items||[defaultLine()]); } catch {} setModalOpen(true); }} />}
        <Popconfirm title="Delete?" onConfirm={async () => { await salesApi.delete(`/sales/stock-adjustments/${r.adjustmentId}`); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Stock Adjustments</Title><Text type="secondary">Manual stock in/out adjustments with reason tracking</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Adjustment</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search adjustments..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260, marginBottom: 16 }} />
        <Table dataSource={items} columns={columns} rowKey="adjustmentId" loading={loading} size="middle" pagination={{ current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>
      <Modal title={editRecord ? 'Edit Adjustment' : 'New Stock Adjustment'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={800} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="adjustmentDate" label="Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}>
              <Form.Item name="adjustmentType" label="Type">
                <Select>
                  <Option value="IN"><Tag color="green"><ArrowUpOutlined /> Stock In</Tag></Option>
                  <Option value="OUT"><Tag color="red"><ArrowDownOutlined /> Stock Out</Tag></Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="warehouseId" label="Warehouse">
                <Select allowClear showSearch optionFilterProp="children" onChange={v => { const w = warehouses.find(wh => wh.warehouseId === v); if (w) form.setFieldsValue({ warehouseName: w.warehouseName }); }}>
                  {warehouses.map(w => <Option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}><Form.Item name="status" label="Status"><Select><Option value="CONFIRMED">Confirmed</Option><Option value="DRAFT">Draft</Option></Select></Form.Item></Col>
          </Row>
          <Form.Item name="reason" label="Reason"><MasterSelect categoryCode="adjustment_reasons" /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <Divider>Items</Divider>
          <Row gutter={8} style={{ marginBottom: 8, fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>
            <Col span={1}>#</Col><Col span={7}>Product</Col><Col span={5}>Location</Col><Col span={3}>Qty</Col><Col span={3}>Unit Cost</Col><Col span={3}>UOM</Col><Col span={2}></Col>
          </Row>
          {lineItems.map((item, idx) => (
            <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
              <Col span={1}><Text type="secondary">{idx + 1}</Text></Col>
              <Col span={7}><ProductSelect value={item.productId} onProductSelect={p => { if (p) { const u = [...lineItems]; u[idx] = { ...u[idx], productId: p.productId, productName: p.productName, productCode: p.productCode, unitOfMeasure: p.unitOfMeasure, unitCost: Number(p.costPrice||0) }; setLineItems(u); } }} /></Col>
              <Col span={5}><Select showSearch placeholder="Location" style={{ width: '100%' }} allowClear value={item.locationId||undefined} onChange={v => updateLine(idx, 'locationId', v)} optionFilterProp="children">{locations.map(l => <Option key={l.locationId} value={l.locationId}>{l.locationCode}</Option>)}</Select></Col>
              <Col span={3}><InputNumber style={{ width: '100%' }} min={0.001} step={0.001} value={item.quantity} onChange={v => updateLine(idx, 'quantity', v)} /></Col>
              <Col span={3}><InputNumber style={{ width: '100%' }} min={0} step={0.001} value={item.unitCost} onChange={v => updateLine(idx, 'unitCost', v)} /></Col>
              <Col span={3}><Input value={item.unitOfMeasure} onChange={e => updateLine(idx, 'unitOfMeasure', e.target.value)} /></Col>
              <Col span={2}>{lineItems.length > 1 && <Button size="small" danger onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}>×</Button>}</Col>
            </Row>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLineItems([...lineItems, defaultLine()])} style={{ marginBottom: 16 }}>Add Item</Button>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save' : 'Create Adjustment'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
