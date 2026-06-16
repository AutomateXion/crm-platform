import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Tag, Space, Modal, Form, Typography, Row, Col, message, Popconfirm, Select, InputNumber, Divider } from 'antd';
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
  const [locations, setLocations] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [adjType, setAdjType] = useState<string>('IN');
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/stock-adjustments', { params: { page, limit: 20, search: search||undefined } }); setItems(r.data.data||[]); setTotal(r.data.total||0); }
    catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    salesApi.get('/sales/warehouse-locations').then(r => setLocations(r.data||[])).catch(()=>{});
  }, []);

  const isOut = adjType === 'OUT';

  // line: { productId, productName, productCode, unitOfMeasure, locationId, quantity, unitCost,
  //         stockLocations: [], available: number }
  const defaultLine = () => ({ productId: '', productName: '', quantity: 1, unitCost: 0, unitOfMeasure: 'PCS', stockLocations: [], available: 0 });

  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    setAdjType('IN');
    form.setFieldsValue({ status: 'CONFIRMED', adjustmentType: 'IN', adjustmentDate: new Date().toISOString().slice(0, 10) });
    setLineItems([defaultLine()]); setModalOpen(true);
  };

  const updateLine = (idx: number, patch: any) => {
    setLineItems(prev => { const u = [...prev]; u[idx] = { ...u[idx], ...patch }; return u; });
  };

  const onProductPick = async (idx: number, p: any) => {
    if (!p) return;
    updateLine(idx, { productId: p.productId, productName: p.productName, productCode: p.productCode, unitOfMeasure: p.unitOfMeasure, unitCost: Number(p.costPrice||0), locationId: undefined, available: 0, stockLocations: [] });
    // Only need stock-bearing locations for Stock OUT (can't remove what isn't there)
    if (adjType === 'OUT') {
      try {
        const r = await salesApi.get(`/sales/products/${p.productId}/stock-locations`);
        const locs = r.data || [];
        updateLine(idx, { stockLocations: locs });
        if (!locs.length) message.warning(`${p.productName} has no stock in any location`);
      } catch { updateLine(idx, { stockLocations: [] }); }
    }
  };

  const onLocationPick = (idx: number, locationId: string) => {
    if (isOut) {
      const line = lineItems[idx];
      const loc = (line.stockLocations || []).find((l: any) => l.locationId === locationId);
      updateLine(idx, { locationId, available: loc ? loc.availableQty : 0 });
    } else {
      updateLine(idx, { locationId });
    }
  };

  const onTypeChange = (v: string) => {
    setAdjType(v);
    // Reset line location context when switching type (stock-filtered vs free)
    setLineItems(prev => prev.map(l => ({ ...l, locationId: undefined, stockLocations: [], available: 0 })));
  };

  const handleSave = async (values: any) => {
    for (let i = 0; i < lineItems.length; i++) {
      const l = lineItems[i];
      if (!l.productId) { message.error(`Line ${i+1}: select a product`); return; }
      if (!l.quantity || l.quantity <= 0) { message.error(`Line ${i+1}: enter a quantity`); return; }
      if (isOut) {
        if (!l.locationId) { message.error(`Line ${i+1}: select the location to remove from`); return; }
        if (l.quantity > l.available) { message.error(`Line ${i+1}: qty ${l.quantity} exceeds available ${l.available}`); return; }
      }
    }
    setSaving(true);
    try {
      const payload = {
        ...values,
        items: lineItems.map(l => ({
          productId: l.productId, productName: l.productName, productCode: l.productCode,
          unitOfMeasure: l.unitOfMeasure, quantity: Number(l.quantity), unitCost: Number(l.unitCost || 0),
          locationId: l.locationId || null,
          warehouseLocationId: l.locationId || null, // backend costing/ledger reads this name
        })),
      };
      if (editRecord) await salesApi.put(`/sales/stock-adjustments/${editRecord.adjustmentId}`, payload);
      else await salesApi.post('/sales/stock-adjustments', payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const openEdit = async (r: any) => {
    setEditRecord(r);
    try {
      const d = await salesApi.get(`/sales/stock-adjustments/${r.adjustmentId}`);
      setAdjType(d.data.adjustmentType || 'IN');
      form.setFieldsValue({ ...d.data, adjustmentDate: d.data.adjustmentDate?.slice(0,10) });
      const lines = (d.data.items || []).map((it: any) => ({ ...it, stockLocations: [], available: it.quantity || 0 }));
      setLineItems(lines.length ? lines : [defaultLine()]);
      if ((d.data.adjustmentType || 'IN') === 'OUT') {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].productId) {
            try {
              const lr = await salesApi.get(`/sales/products/${lines[i].productId}/stock-locations`);
              const locs = lr.data || [];
              const cur = locs.find((l: any) => l.locationId === lines[i].locationId);
              updateLine(i, { stockLocations: locs, available: cur ? cur.availableQty : (lines[i].quantity || 0) });
            } catch {}
          }
        }
      }
    } catch {}
    setModalOpen(true);
  };

  const columns = [
    { title: 'Adj #', dataIndex: 'adjustmentNumber', render: (v: string) => <Tag color="orange">{v}</Tag> },
    { title: 'Date', dataIndex: 'adjustmentDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Type', dataIndex: 'adjustmentType', render: (v: string) => <Tag color={v === 'IN' ? 'green' : 'red'} icon={v === 'IN' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>{v === 'IN' ? 'Stock In' : 'Stock Out'}</Tag> },
    { title: 'Reason', dataIndex: 'reason', render: (v: string) => v || '—' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />}
        <Popconfirm title="Delete?" onConfirm={async () => { await salesApi.delete(`/sales/stock-adjustments/${r.adjustmentId}`); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Stock Adjustments</Title><Text type="secondary">Pick a product, then adjust its stock in or out with a reason</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Adjustment</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search adjustments..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260, marginBottom: 16 }} />
        <Table dataSource={items} columns={columns} rowKey="adjustmentId" loading={loading} size="middle" pagination={{ current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>
      <Modal title={editRecord ? 'Edit Adjustment' : 'New Stock Adjustment'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={840} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="adjustmentDate" label="Date"><Input type="date" /></Form.Item></Col>
            <Col span={8}>
              <Form.Item name="adjustmentType" label="Type">
                <Select onChange={onTypeChange}>
                  <Option value="IN">Stock In (add)</Option>
                  <Option value="OUT">Stock Out (remove)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}><Form.Item name="status" label="Status"><Select><Option value="CONFIRMED">Confirmed</Option><Option value="DRAFT">Draft</Option></Select></Form.Item></Col>
          </Row>
          <Form.Item name="reason" label="Reason"><MasterSelect categoryCode="adjustment_reasons" /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <Divider>{isOut ? 'Items to Remove' : 'Items to Add'}</Divider>
          <Row gutter={8} style={{ marginBottom: 8, fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>
            <Col span={1}>#</Col><Col span={7}>Product</Col><Col span={6}>Location</Col><Col span={3}>Qty</Col><Col span={3}>Unit Cost</Col><Col span={3}>UOM</Col><Col span={1}></Col>
          </Row>
          {lineItems.map((item, idx) => (
            <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
              <Col span={1}><Text type="secondary">{idx + 1}</Text></Col>
              <Col span={7}><ProductSelect value={item.productId} onProductSelect={p => onProductPick(idx, p)} /></Col>
              <Col span={6}>
                {isOut ? (
                  <Select showSearch placeholder={item.productId ? 'From location' : 'Pick product first'} style={{ width: '100%' }}
                    disabled={!item.productId} value={item.locationId||undefined}
                    onChange={v => onLocationPick(idx, v)} optionFilterProp="label"
                    notFoundContent={item.productId ? 'No stock in any location' : 'Select a product'}
                    options={(item.stockLocations||[]).map((l: any) => ({ value: l.locationId, label: l.label }))} />
                ) : (
                  <Select showSearch placeholder="Location" style={{ width: '100%' }} allowClear
                    value={item.locationId||undefined} onChange={v => onLocationPick(idx, v)} optionFilterProp="children">
                    {locations.map(l => <Option key={l.locationId} value={l.locationId}>{l.locationCode}</Option>)}
                  </Select>
                )}
              </Col>
              <Col span={3}>
                <InputNumber style={{ width: '100%' }} min={0.001} step={0.001} max={isOut ? (item.available || undefined) : undefined}
                  value={item.quantity} onChange={v => updateLine(idx, { quantity: v })} />
                {isOut && item.locationId && <Text type="secondary" style={{ fontSize: 11 }}>max {Number(item.available||0).toFixed(3)}</Text>}
              </Col>
              <Col span={3}><InputNumber style={{ width: '100%' }} min={0} step={0.001} disabled={isOut} value={item.unitCost} onChange={v => updateLine(idx, { unitCost: v })} /></Col>
              <Col span={3}><Input value={item.unitOfMeasure} onChange={e => updateLine(idx, { unitOfMeasure: e.target.value })} /></Col>
              <Col span={1}>{lineItems.length > 1 && <Button size="small" danger onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}>×</Button>}</Col>
            </Row>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLineItems([...lineItems, defaultLine()])} style={{ marginBottom: 16 }}>Add Item</Button>
          {isOut && <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 12 }}>Unit cost is computed automatically (FIFO/Average) for stock-out — it posts to Inventory Adjustment Loss.</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save' : 'Create Adjustment'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
