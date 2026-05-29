import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Popconfirm, Tooltip, Select,
  Divider, Switch, AutoComplete,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { suppliersApi } from '../../services/salesApi';
import api from '../../services/api';
import MasterSelect from '../../components/common/MasterSelect';
import AutoCode from '../../components/common/AutoCode';

const { Title, Text } = Typography;
const { Option } = Select;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountSearch, setAccountSearch] = useState('');
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await suppliersApi.getAll({ page, limit: 20, search: search || undefined });
      setSuppliers(r.data.data || []); setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const searchAccounts = async (val: string) => {
    try {
      const r = await api.get('/accounts', { params: { search: val, limit: 20 } });
      setAccounts(r.data.data || []);
    } catch {}
  };

  const handleAccountSelect = (accountId: string) => {
    const acc = accounts.find(a => a.accountId === accountId);
    if (acc) {
      form.setFieldsValue({
        accountId: acc.accountId,
        supplierName: acc.accountName,
        email: acc.email,
        phone: acc.phone,
        address: acc.addressLine1,
        city: acc.city,
        country: acc.country || 'Oman',
        trn: acc.trn,
        contactPerson: acc.contactPerson,
        website: acc.website,
        paymentTerms: acc.paymentTerms,
        currencyCode: acc.currencyCode || 'OMR',
        creditLimit: acc.creditLimit,
        bankName: acc.bankName,
        bankAccount: acc.bankAccount,
        bankIban: acc.bankIban,
      });
      // Mark account as supplier
      api.put(`/accounts/${acc.accountId}`, { isSupplier: true }).catch(() => {});
    }
  };

  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ currencyCode: 'OMR', country: 'Oman', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditRecord(r); form.setFieldsValue(r); setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editRecord) await suppliersApi.update(editRecord.supplierId, values);
      else await suppliersApi.create(values);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: 'Supplier', render: (_: any, r: any) => (
      <div>
        <Text strong>{r.supplierName}</Text>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.supplierCode}{r.trn ? ` · TRN: ${r.trn}` : ''}</div>
      </div>
    )},
    { title: 'Category', dataIndex: 'category', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Contact', render: (_: any, r: any) => (
      <div>
        {r.contactPerson && <div style={{ fontSize: 12 }}>{r.contactPerson}</div>}
        {r.phone && <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.phone}</div>}
        {r.email && <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.email}</div>}
      </div>
    )},
    { title: 'City', dataIndex: 'city', render: (v: string) => v || '—' },
    { title: 'Payment Terms', dataIndex: 'paymentTerms', render: (v: string) => v || '—' },
    { title: 'Credit Limit', dataIndex: 'creditLimit', render: (v: number) => v ? `OMR ${Number(v).toFixed(3)}` : '—' },
    { title: 'Linked', dataIndex: 'accountId', render: (v: string) => v ? <Tag color="blue" icon={<LinkOutlined />}>Linked</Tag> : '—' },
    { title: 'Status', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v !== false ? 'green' : 'red'}>{v !== false ? 'Active' : 'Inactive'}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
        <Popconfirm title="Delete supplier?" onConfirm={async () => { await suppliersApi.delete(r.supplierId); load(); }}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Suppliers</Title><Text type="secondary">Manage supplier accounts linked to your CRM</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Supplier</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search suppliers..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 300, marginBottom: 16 }} />
        <Table dataSource={suppliers} columns={columns} rowKey="supplierId" loading={loading} size="middle"
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: t => `${t} suppliers` }} />
      </Card>

      <Modal title={editRecord ? 'Edit Supplier' : 'New Supplier'} open={modalOpen}
        onCancel={() => setModalOpen(false)} footer={null} width={700} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>

          {/* Link to Account */}
          {!editRecord && (
            <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text strong style={{ color: '#1890ff' }}>🔗 Link to Existing Account (Optional)</Text>
              <div style={{ marginTop: 8 }}>
                <Select showSearch style={{ width: '100%' }} placeholder="Search and select an account to auto-fill..."
                  filterOption={false} onSearch={searchAccounts} onSelect={handleAccountSelect} allowClear>
                  {accounts.map(a => (
                    <Option key={a.accountId} value={a.accountId}>
                      <Space>
                        <Text strong>{a.accountName}</Text>
                        {a.phone && <Text type="secondary" style={{ fontSize: 11 }}>{a.phone}</Text>}
                        {a.city && <Text type="secondary" style={{ fontSize: 11 }}>{a.city}</Text>}
                      </Space>
                    </Option>
                  ))}
                </Select>
                <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
                  Selecting an account will auto-fill all details below and mark it as a supplier
                </Text>
              </div>
            </div>
          )}

          <Form.Item name="accountId" hidden><Input /></Form.Item>

          <Row gutter={12}>
            <Col span={8}><Form.Item name="supplierCode" label="Supplier Code" rules={[{ required: true }]}><AutoCode prefix="SUP" /></Form.Item></Col>
            <Col span={16}><Form.Item name="supplierName" label="Supplier Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="category" label="Category"><MasterSelect categoryCode="supplier_categories" /></Form.Item></Col>
            <Col span={12}><Form.Item name="trn" label="TRN (Tax Reg. No.)"><Input /></Form.Item></Col>
          </Row>

          <Divider style={{ margin: '8px 0' }}>Contact Details</Divider>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="contactPerson" label="Contact Person"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="Phone"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="website" label="Website"><Input /></Form.Item></Col>
          </Row>

          <Divider style={{ margin: '8px 0' }}>Address</Divider>
          <Form.Item name="address" label="Address"><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="city" label="City"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="country" label="Country"><Input defaultValue="Oman" /></Form.Item></Col>
            <Col span={8}><Form.Item name="poBox" label="P.O. Box"><Input /></Form.Item></Col>
          </Row>

          <Divider style={{ margin: '8px 0' }}>Financial & Banking</Divider>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="creditLimit" label="Credit Limit (OMR)"><Input type="number" /></Form.Item></Col>
            <Col span={8}><Form.Item name="paymentTerms" label="Payment Terms"><Input placeholder="Net 30" /></Form.Item></Col>
            <Col span={8}><Form.Item name="currencyCode" label="Currency"><Select><Option value="OMR">OMR</Option><Option value="USD">USD</Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="bankName" label="Bank"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="bankAccount" label="Account No."><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="bankIban" label="IBAN"><Input /></Form.Item></Col>
          </Row>

          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save Changes' : 'Create Supplier'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
