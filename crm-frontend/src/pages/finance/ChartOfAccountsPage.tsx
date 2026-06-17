import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Popconfirm, Tooltip, TreeSelect,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons';
import api from '../../services/api';
import salesApi from '../../services/salesApi';

const { Title, Text } = Typography;
const { Option } = Select;

const TYPE_COLORS: Record<string, string> = {
  ASSET: '#1890ff', LIABILITY: '#ff4d4f', EQUITY: '#2E6DA4',
  REVENUE: '#52c41a', EXPENSE: '#fa8c16',
};

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
const ACCOUNT_SUBTYPES: Record<string, string[]> = {
  ASSET: ['HEADER', 'CURRENT', 'FIXED', 'OTHER'],
  LIABILITY: ['HEADER', 'CURRENT', 'LONG_TERM', 'OTHER'],
  EQUITY: ['HEADER', 'CAPITAL', 'RETAINED', 'PROFIT', 'OTHER'],
  REVENUE: ['HEADER', 'SALES', 'SERVICE', 'OTHER'],
  EXPENSE: ['HEADER', 'COGS', 'OPERATING', 'OTHER'],
};

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await salesApi.get('/sales/chart-of-accounts', { params: { search: search || undefined, type: typeFilter || undefined } });
      setAccounts(r.data || []);
    } catch {} finally { setLoading(false); }
  }, [search, typeFilter]);

  useEffect(() => { load(); }, [load]);

  // Build tree for parent selector
  const buildTreeData = (accs: any[]): any[] => {
    return accs.map(a => ({
      title: `${a.accountCode} - ${a.accountName}`,
      value: a.accountId,
      key: a.accountId,
    }));
  };

  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditRecord(r); form.setFieldsValue(r);
    if (r.accountType) setSubtypes(ACCOUNT_SUBTYPES[r.accountType] || []);
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editRecord) await salesApi.put(`/sales/chart-of-accounts/${editRecord.accountId}`, values);
      else await salesApi.post('/sales/chart-of-accounts', values);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed to save — make sure backend supports this endpoint'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await salesApi.delete(`/sales/chart-of-accounts/${id}`);
      message.success('Account deleted'); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Cannot delete system accounts'); }
  };

  // Group by type for display
  const filtered = accounts.filter(a =>
    (!search || a.accountName?.toLowerCase().includes(search.toLowerCase()) || a.accountCode?.includes(search)) &&
    (!typeFilter || a.accountType === typeFilter)
  );

  const grouped = ACCOUNT_TYPES.reduce((g: any, type) => {
    g[type] = filtered.filter(a => a.accountType === type);
    return g;
  }, {});

  const columns = [
    {
      title: 'Code', dataIndex: 'accountCode', width: 80,
      render: (v: string) => <Text strong style={{ fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: 'Account Name', dataIndex: 'accountName',
      render: (v: string, r: any) => (
        <span style={{ paddingLeft: r.parentAccountId ? 24 : 0 }}>
          {r.accountSubtype === 'HEADER' ? <Text strong>{v}</Text> : v}
        </span>
      ),
    },
    {
      title: 'Type', dataIndex: 'accountType',
      render: (v: string) => <Tag color={TYPE_COLORS[v]} style={{ borderRadius: 20 }}>{v}</Tag>,
    },
    {
      title: 'Subtype', dataIndex: 'accountSubtype',
      render: (v: string) => v ? <Tag>{v}</Tag> : '—',
    },
    {
      title: 'System', dataIndex: 'isSystem',
      render: (v: boolean) => v ? <Tag color="blue">System</Tag> : <Tag>Custom</Tag>,
    },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          {!r.isSystem && (
            <Popconfirm title="Delete account?" onConfirm={() => handleDelete(r.accountId)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Chart of Accounts</Title>
          <Text type="secondary">Manage your standard chart of accounts — customizable per company</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
          New Account
        </Button>
      </div>

      {/* Summary by type */}
      <Row gutter={12} style={{ marginBottom: 20 }}>
        {ACCOUNT_TYPES.map(type => (
          <Col span={4} key={type} style={{ flex: '1 1 0' }}>
            <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${TYPE_COLORS[type]}`, cursor: 'pointer' }}
              onClick={() => setTypeFilter(typeFilter === type ? '' : type)}>
              <div style={{ fontWeight: 700, color: TYPE_COLORS[type], fontSize: 13 }}>{type}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{accounts.filter(a => a.accountType === type).length}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<BankOutlined />} placeholder="Search accounts..." value={search}
            onChange={e => setSearch(e.target.value)} allowClear style={{ width: 260 }} />
          <Select placeholder="Filter by type" value={typeFilter || undefined}
            onChange={v => setTypeFilter(v || '')} allowClear style={{ width: 160 }}>
            {ACCOUNT_TYPES.map(t => <Option key={t} value={t}><Tag color={TYPE_COLORS[t]}>{t}</Tag></Option>)}
          </Select>
        </Space>
        <Table dataSource={filtered} columns={columns} rowKey="accountId" loading={loading} size="middle"
          pagination={{ pageSize: 20, showTotal: t => `${t} accounts` }}
          rowClassName={(r) => r.accountSubtype === 'HEADER' ? 'table-row-header' : ''}
        />
      </Card>

      <Modal title={editRecord ? 'Edit Account' : 'New Account'} open={modalOpen}
        onCancel={() => setModalOpen(false)} footer={null} width={560}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="accountCode" label="Account Code" rules={[{ required: true }]}>
                <Input placeholder="e.g. 4010" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="accountName" label="Account Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Software License Revenue" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="accountNameAr" label="Account Name (Arabic)">
            <Input placeholder="Arabic name (optional)" dir="rtl" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="accountType" label="Account Type" rules={[{ required: true }]}>
                <Select onChange={v => { setSubtypes(ACCOUNT_SUBTYPES[v] || []); form.setFieldsValue({ accountSubtype: undefined }); }}>
                  {ACCOUNT_TYPES.map(t => <Option key={t} value={t}><Tag color={TYPE_COLORS[t]}>{t}</Tag></Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="accountSubtype" label="Subtype">
                <Select allowClear>
                  {subtypes.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="parentAccountId" label="Parent Account (Optional)">
            <TreeSelect
              allowClear showSearch placeholder="Select parent account"
              treeData={buildTreeData(accounts)}
              treeDefaultExpandAll={false}
              filterTreeNode={(search, node) => (node.title as string)?.toLowerCase().includes(search.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {editRecord ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
