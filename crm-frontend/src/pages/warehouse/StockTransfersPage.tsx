import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Tag, Space, Modal, Form, Typography, Row, Col, message, Popconfirm, Select, InputNumber, Divider } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import salesApi from '../../services/salesApi';
import ProductSelect from '../../components/common/ProductSelect';
import MasterSelect from '../../components/common/MasterSelect';

const { Title, Text } = Typography;
const { Option } = Select;
const STATUS_COLORS: Record<string, string> = { DRAFT: 'default', PENDING: 'blue', IN_TRANSIT: 'orange', COMPLETED: 'green', CANCELLED: 'red' };

export default function StockTransfersPage() {
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
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/stock-transfers', { params: { page, limit: 20, search: search||undefined } }); setItems(r.data.data||[]); setTotal(r.data.total||0); }
    catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    // All locations — used only for the destination (To Location) picker
    salesApi.get('/sales/warehouse-locations').then(r => setLocations(r.data||[])).catch(()=>{});
  }, []);

  // line shape: { productId, productName, productCode, unitOfMeasure, fromLocationId, toLocationId,
  //               quantity, fromLocations: [], available: number }
  const defaultLine = () => ({ productId: '', productName: '', quantity: 1, unitOfMeasure: 'PCS', fromLocations: [], available: 0 });

  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ status: 'DRAFT', transferDate: new Date().toISOString().slice(0, 10) });
    setLineItems([defaultLine()]); setModalOpen(true);
  };

  const updateLine = (idx: number, patch: any) => {
    setLineItems(prev => { const u = [...prev]; u[idx] = { ...u[idx], ...patch }; return u; });
  };

  // When a product is chosen on a line, fetch the locations where it has stock
  const onProductPick = async (idx: number, p: any) => {
    if (!p) return;
    updateLine(idx, { productId: p.productId, productName: p.productName, productCode: p.productCode, unitOfMeasure: p.unitOfMeasure, fromLocationId: undefined, available: 0, fromLocations: [] });
    try {
      const r = await salesApi.get(`/sales/products/${p.productId}/stock-locations`);
      const locs = r.data || [];
      updateLine(idx, { fromLocations: locs });
      if (!locs.length) message.warning(`${p.productName} has no stock in any location`);
    } catch { updateLine(idx, { fromLocations: [] }); }
  };

  const onFromLocationPick = (idx: number, locationId: string) => {
    const line = lineItems[idx];
    const loc = (line.fromLocations || []).find((l: any) => l.locationId === locationId);
    updateLine(idx, { fromLocationId: locationId, available: loc ? loc.availableQty : 0 });
  };

  const handleSave = async (values: any) => {
    // Validate each line: product, from, to, qty within available
    for (let i = 0; i < lineItems.length; i++) {
      const l = lineItems[i];
      if (!l.productId) { message.error(`Line ${i+1}: select a product`); return; }
      if (!l.fromLocationId) { message.error(`Line ${i+1}: select a From location`); return; }
      if (!l.toLocationId) { message.error(`Line ${i+1}: select a To location`); return; }
      if (l.fromLocationId === l.toLocationId) { message.error(`Line ${i+1}: From and To locations must differ`); return; }
      if (!l.quantity || l.quantity <= 0) { message.error(`Line ${i+1}: enter a quantity`); return; }
      if (l.quantity > l.available) { message.error(`Line ${i+1}: qty ${l.quantity} exceeds available ${l.available}`); return; }
    }
    setSaving(true);
    try {
      // Derive warehouse names/ids from the chosen locations (header kept for the list view)
      const first = lineItems[0] || {};
      const fromLoc = (first.fromLocations || []).find((l: any) => l.locationId === first.fromLocationId);
      const toLocObj = locations.find((l: any) => l.locationId === first.toLocationId);
      const payload = {
        ...values,
        fromWarehouseId: fromLoc?.warehouseId, fromWarehouse: fromLoc?.warehouseName,
        toWarehouseId: toLocObj?.warehouseId, toWarehouse: toLocObj?.warehouseName,
        items: lineItems.map(l => ({
          productId: l.productId, productName: l.productName, productCode: l.productCode,
          unitOfMeasure: l.unitOfMeasure, fromLocationId: l.fromLocationId, toLocationId: l.toLocationId,
          quantity: Number(l.quantity),
        })),
      };
      if (editRecord) await salesApi.put(`/sales/stock-transfers/${editRecord.transferId}`, payload);
      else await salesApi.post('/sales/stock-transfers', payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleConfirm = async (id: string) => {
    try { await salesApi.post(`/sales/stock-transfers/${id}/confirm`); message.success('Transfer completed!'); load(); }
    catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };

  const openEdit = async (r: any) => {
    setEditRecord(r);
    try {
      const d = await salesApi.get(`/sales/stock-transfers/${r.transferId}`);
      form.setFieldsValue({ ...d.data, transferDate: d.data.transferDate?.slice(0,10) });
      // Re-hydrate each line's from-locations so qty caps work in edit mode
      const lines = (d.data.items || []).map((it: any) => ({ ...it, fromLocations: [], available: it.quantity || 0 }));
      setLineItems(lines.length ? lines : [defaultLine()]);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].productId) {
          try {
            const lr = await salesApi.get(`/sales/products/${lines[i].productId}/stock-locations`);
            const locs = lr.data || [];
            const cur = locs.find((l: any) => l.locationId === lines[i].fromLocationId);
            updateLine(i, { fromLocations: locs, available: cur ? cur.availableQty : (lines[i].quantity || 0) });
          } catch {}
        }
      }
    } catch {}
    setModalOpen(true);
  };

  const columns = [
    { title: 'Transfer #', dataIndex: 'transferNumber', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Date', dataIndex: 'transferDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'From', dataIndex: 'fromWarehouse', render: (v: string) => <Tag color="orange">{v||'—'}</Tag> },
    { title: 'To', dataIndex: 'toWarehouse', render: (v: string) => <Tag color="green">{v||'—'}</Tag> },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    { title: 'Reason', dataIndex: 'reason', render: (v: string) => v ? <Text ellipsis style={{ maxWidth: 150 }}>{v}</Text> : '—' },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />}
        {r.status === 'DRAFT' && <Button size="small" type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => handleConfirm(r.transferId)}>Confirm</Button>}
        {r.status === 'DRAFT' && <Popconfirm title="Delete?" onConfirm={async () => { await salesApi.delete(`/sales/stock-transfers/${r.transferId}`); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Stock Transfers</Title><Text type="secondary">Move stock between locations — pick a product, then where it moves from and to</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Transfer</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search transfers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260, marginBottom: 16 }} />
        <Table dataSource={items} columns={columns} rowKey="transferId" loading={loading} size="middle" pagination={{ current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>
      <Modal title={editRecord ? 'Edit Transfer' : 'New Stock Transfer'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={860} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="transferDate" label="Date"><Input type="date" /></Form.Item></Col>
            <Col span={16}><Form.Item name="reason" label="Reason"><MasterSelect categoryCode="transfer_reasons" /></Form.Item></Col>
          </Row>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <Divider>Items to Transfer</Divider>
          <Row gutter={8} style={{ marginBottom: 8, fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>
            <Col span={1}>#</Col><Col span={7}>Product</Col><Col span={6}>From Location</Col><Col span={6}>To Location</Col><Col span={3}>Qty</Col><Col span={1}></Col>
          </Row>
          {lineItems.map((item, idx) => (
            <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
              <Col span={1}><Text type="secondary">{idx + 1}</Text></Col>
              <Col span={7}><ProductSelect value={item.productId} onProductSelect={p => onProductPick(idx, p)} /></Col>
              <Col span={6}>
                <Select showSearch placeholder={item.productId ? 'From location' : 'Pick product first'} style={{ width: '100%' }}
                  disabled={!item.productId} value={item.fromLocationId||undefined}
                  onChange={v => onFromLocationPick(idx, v)} optionFilterProp="label"
                  notFoundContent={item.productId ? 'No stock in any location' : 'Select a product'}
                  options={(item.fromLocations||[]).map((l: any) => ({ value: l.locationId, label: l.label }))} />
              </Col>
              <Col span={6}>
                <Select showSearch placeholder="To location" style={{ width: '100%' }} allowClear
                  value={item.toLocationId||undefined} onChange={v => updateLine(idx, { toLocationId: v })} optionFilterProp="children">
                  {locations.map(l => <Option key={l.locationId} value={l.locationId}>{l.locationCode}{l.locationName ? ' - ' + l.locationName : ''}</Option>)}
                </Select>
              </Col>
              <Col span={3}>
                <InputNumber style={{ width: '100%' }} min={0.001} step={0.001} max={item.available || undefined}
                  value={item.quantity} onChange={v => updateLine(idx, { quantity: v })} />
                {item.fromLocationId && <Text type="secondary" style={{ fontSize: 11 }}>max {Number(item.available||0).toFixed(3)}</Text>}
              </Col>
              <Col span={1}>{lineItems.length > 1 && <Button size="small" danger onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}>×</Button>}</Col>
            </Row>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLineItems([...lineItems, defaultLine()])} style={{ marginBottom: 16 }}>Add Item</Button>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save' : 'Create Transfer'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
