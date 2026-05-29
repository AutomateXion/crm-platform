import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Tag, Space, Modal, Form, Typography, Row, Col, message, Popconfirm, Tooltip, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import salesApi from '../../services/salesApi';
import MasterSelect from '../../components/common/MasterSelect';
import AutoCode from '../../components/common/AutoCode';
import UserSelect from '../../components/common/UserSelect';

const { Title, Text } = Typography;
const { Option } = Select;

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await salesApi.get('/sales/warehouses', { params: { search: search||undefined } }); setWarehouses(r.data||[]); }
    catch {} finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ country: 'Oman', warehouseType: 'MAIN' });
    setModalOpen(true);
  };
  const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editRecord) await salesApi.put(`/sales/warehouses/${editRecord.warehouseId}`, values);
      else await salesApi.post('/sales/warehouses', values);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: 'Code', dataIndex: 'warehouseCode', render: (v: string) => <Tag color="blue" style={{ fontFamily: 'monospace' }}>{v}</Tag> },
    { title: 'Warehouse Name', dataIndex: 'warehouseName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Type', dataIndex: 'warehouseType', render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: 'City', dataIndex: 'city', render: (v: string) => v || '—' },
    { title: 'Manager', dataIndex: 'managerName', render: (v: string) => v || '—' },
    { title: 'Capacity', dataIndex: 'capacity', render: (v: number) => v ? `${Number(v).toLocaleString()} units` : '—' },
    { title: 'Status', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
        <Popconfirm title="Deactivate warehouse?" onConfirm={async () => { await salesApi.delete(`/sales/warehouses/${r.warehouseId}`); load(); }}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Warehouses</Title><Text type="secondary">Manage your warehouse and storage locations</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Warehouse</Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card style={{ borderRadius: 12, borderLeft: '4px solid #1890ff', textAlign: 'center' }} size="small"><div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff' }}>{warehouses.length}</div><Text type="secondary">Total Warehouses</Text></Card></Col>
        <Col span={6}><Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a', textAlign: 'center' }} size="small"><div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>{warehouses.filter(w => w.isActive).length}</div><Text type="secondary">Active</Text></Card></Col>
      </Row>
      <Card style={{ borderRadius: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search warehouses..." value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 300, marginBottom: 16 }} />
        <Table dataSource={warehouses} columns={columns} rowKey="warehouseId" loading={loading} size="middle" pagination={false} />
      </Card>
      <Modal title={editRecord ? 'Edit Warehouse' : 'New Warehouse'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="warehouseCode" label="Warehouse Code" rules={[{ required: true }]}><AutoCode prefix="WH" /></Form.Item></Col>
            <Col span={16}><Form.Item name="warehouseName" label="Warehouse Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="warehouseType" label="Type"><MasterSelect categoryCode="warehouse_types" /></Form.Item></Col>
            <Col span={12}><Form.Item name="capacity" label="Capacity (units)"><Input type="number" /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Address"><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="city" label="City"><Input placeholder="Muscat" /></Form.Item></Col>
            <Col span={12}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="managerName" label="Manager"><Input placeholder="Manager name" /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save' : 'Create Warehouse'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
