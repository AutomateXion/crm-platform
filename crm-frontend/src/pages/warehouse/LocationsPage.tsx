import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Tag, Space, Modal, Form, Typography, Row, Col, message, Popconfirm, Select, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import salesApi from '../../services/salesApi';
import AutoCode from '../../components/common/AutoCode';

const { Title, Text } = Typography;
const { Option } = Select;

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await salesApi.get('/sales/warehouse-locations', { params: { warehouseId: selectedWarehouse||undefined } });
      setLocations(r.data||[]);
    } catch {} finally { setLoading(false); }
  }, [selectedWarehouse]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    salesApi.get('/sales/warehouses').then(r => setWarehouses(r.data||[])).catch(()=>{});
  }, []);

  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    if (selectedWarehouse) form.setFieldsValue({ warehouseId: selectedWarehouse });
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editRecord) await salesApi.put(`/sales/warehouse-locations/${editRecord.locationId}`, values);
      else await salesApi.post('/sales/warehouse-locations', values);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: 'Code', dataIndex: 'locationCode', render: (v: string) => <Tag color="cyan" style={{ fontFamily: 'monospace' }}>{v}</Tag> },
    { title: 'Location Name', dataIndex: 'locationName', render: (v: string) => <Text strong>{v||'—'}</Text> },
    { title: 'Warehouse', dataIndex: 'warehouseId', render: (v: string) => { const w = warehouses.find(wh => wh.warehouseId === v); return w ? <Tag color="blue">{w.warehouseName}</Tag> : '—'; } },
    { title: 'Zone', dataIndex: 'zone', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Rack', dataIndex: 'rack', render: (v: string) => v || '—' },
    { title: 'Shelf', dataIndex: 'shelf', render: (v: string) => v || '—' },
    { title: 'Bin', dataIndex: 'bin', render: (v: string) => v || '—' },
    { title: 'Capacity', dataIndex: 'capacity', render: (v: number) => v ? Number(v).toLocaleString() : '—' },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); }} />
        <Popconfirm title="Delete location?" onConfirm={async () => { await salesApi.delete(`/sales/warehouse-locations/${r.locationId}`); load(); }}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Locations / Bins</Title><Text type="secondary">Manage zones, racks, shelves and bins within warehouses</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Location</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Select placeholder="Filter by warehouse" allowClear style={{ width: 250 }} value={selectedWarehouse||undefined} onChange={v => setSelectedWarehouse(v||'')}>
            {warehouses.map(w => <Option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName}</Option>)}
          </Select>
          <Text type="secondary">{locations.length} locations</Text>
        </Space>
        <Table dataSource={locations} columns={columns} rowKey="locationId" loading={loading} size="middle" pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={editRecord ? 'Edit Location' : 'New Location'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={560}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Form.Item name="warehouseId" label="Warehouse" rules={[{ required: true }]}>
            <Select placeholder="Select warehouse">
              {warehouses.map(w => <Option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName}</Option>)}
            </Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="locationCode" label="Location Code" rules={[{ required: true }]}><AutoCode prefix="LOC" /></Form.Item></Col>
            <Col span={16}><Form.Item name="locationName" label="Location Name"><Input placeholder="e.g. Section A - Rack 1" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="zone" label="Zone"><Input placeholder="A" /></Form.Item></Col>
            <Col span={6}><Form.Item name="rack" label="Rack"><Input placeholder="01" /></Form.Item></Col>
            <Col span={6}><Form.Item name="shelf" label="Shelf"><Input placeholder="B" /></Form.Item></Col>
            <Col span={6}><Form.Item name="bin" label="Bin"><Input placeholder="001" /></Form.Item></Col>
          </Row>
          <Form.Item name="capacity" label="Capacity"><Input type="number" /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save' : 'Create Location'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
