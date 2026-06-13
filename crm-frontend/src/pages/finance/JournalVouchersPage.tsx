import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Popconfirm, Tooltip, InputNumber,
  Divider, Alert,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, FileTextOutlined,
} from '@ant-design/icons';
import salesApi from '../../services/salesApi';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const TYPE_COLORS: Record<string, string> = {
  JOURNAL: '#1890ff', PAYMENT: '#ff4d4f', RECEIPT: '#52c41a',
  CONTRA: '#722ed1', DEBIT_NOTE: '#fa8c16', CREDIT_NOTE: '#13c2c2',
  OPENING: '#eb2f96', CLOSING: '#8c8c8c',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'default', APPROVED: 'blue', POSTED: 'green', CANCELLED: 'red',
};

export default function JournalVouchersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await salesApi.get('/sales/journal-vouchers', {
        params: { page, limit: 20, search: search || undefined, type: typeFilter || undefined, status: statusFilter || undefined }
      });
      setItems(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    salesApi.get('/sales/chart-of-accounts').then(r => setAccounts(r.data || [])).catch(() => {});
  }, []);

  const defaultLine = () => ({ accountId: '', accountCode: '', accountName: '', description: '', debitAmount: 0, creditAmount: 0, costCenter: '' });

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ voucherType: 'JOURNAL', status: 'DRAFT', currencyCode: 'OMR', voucherDate: new Date().toISOString().slice(0, 10) });
    setLines([defaultLine(), defaultLine()]);
    setModalOpen(true);
  };

  const openEdit = async (r: any) => {
    setEditRecord(r);
    try {
      const d = await salesApi.get(`/sales/journal-vouchers/${r.voucherId}`);
      form.setFieldsValue({ ...d.data, voucherDate: d.data.voucherDate?.slice(0, 10) });
      setLines(d.data.lines?.length ? d.data.lines : [defaultLine(), defaultLine()]);
    } catch {}
    setModalOpen(true);
  };

  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'accountId') {
      const acc = accounts.find(a => a.accountId === value);
      if (acc) { updated[idx].accountCode = acc.accountCode; updated[idx].accountName = acc.accountName; }
    }
    setLines(updated);
  };

  const totalDebit = lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

  const handleSave = async (values: any) => {
    if (!isBalanced) { message.error('Debit and Credit must be equal!'); return; }
    setSaving(true);
    try {
      const payload = { ...values, lines, totalDebit, totalCredit };
      if (editRecord) await salesApi.put(`/sales/journal-vouchers/${editRecord.voucherId}`, payload);
      else await salesApi.post('/sales/journal-vouchers', payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePost = async (id: string) => {
    setPosting(true);
    try {
      await salesApi.post(`/sales/journal-vouchers/${id}/post`);
      message.success('Voucher posted successfully!'); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed to post'); }
    finally { setPosting(false); }
  };

  const columns = [
    { title: 'Voucher #', dataIndex: 'voucherNumber', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Date', dataIndex: 'voucherDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Type', dataIndex: 'voucherType', render: (v: string) => <Tag color={TYPE_COLORS[v]}>{v?.replace('_', ' ')}</Tag> },
    { title: 'Description', dataIndex: 'description', width: 260, render: (v: string) => <Text ellipsis style={{ maxWidth: 260 }}>{v || '—'}</Text> },
    { title: 'Reference', dataIndex: 'reference', render: (v: string) => v || '—' },
    { title: 'Debit (OMR)', dataIndex: 'totalDebit', width: 130, align: 'right' as const, render: (v: number) => <Text strong style={{ whiteSpace: 'nowrap' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Credit (OMR)', dataIndex: 'totalCredit', width: 130, align: 'right' as const, render: (v: number) => <Text strong style={{ whiteSpace: 'nowrap' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    {
      title: '', key: 'actions', render: (_: any, r: any) => (
        <Space>
          {!r.isPosted && <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>}
          {!r.isPosted && r.status !== 'CANCELLED' && (
            <Tooltip title="Post Voucher">
              <Button size="small" type="primary" icon={<CheckCircleOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handlePost(r.voucherId)} loading={posting} />
            </Tooltip>
          )}
          {!r.isPosted && (
            <Popconfirm title="Delete voucher?" onConfirm={async () => {
              await salesApi.delete(`/sales/journal-vouchers/${r.voucherId}`); load();
            }}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Journal Vouchers</Title>
          <Text type="secondary">Record manual accounting entries — debits and credits must balance</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
          New Voucher
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Search vouchers..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260 }} />
          <Select placeholder="Type" value={typeFilter || undefined} onChange={v => setTypeFilter(v || '')} allowClear style={{ width: 160 }}>
            {Object.keys(TYPE_COLORS).map(t => <Option key={t} value={t}><Tag color={TYPE_COLORS[t]}>{t.replace('_', ' ')}</Tag></Option>)}
          </Select>
          <Select placeholder="Status" value={statusFilter || undefined} onChange={v => setStatusFilter(v || '')} allowClear style={{ width: 140 }}>
            {Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}><Tag color={STATUS_COLORS[s]}>{s}</Tag></Option>)}
          </Select>
        </Space>
        <Table dataSource={items} columns={columns} rowKey="voucherId" loading={loading} size="middle" scroll={{ x: 'max-content' }} sticky={{ offsetHeader: 0 }}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage,
            showTotal: t => `${t} vouchers` }} />
      </Card>

      <Modal title={editRecord ? 'Edit Journal Voucher' : 'New Journal Voucher'}
        open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={950} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="voucherDate" label="Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}>
              <Form.Item name="voucherType" label="Voucher Type">
                <Select>
                  {Object.keys(TYPE_COLORS).map(t => <Option key={t} value={t}><Tag color={TYPE_COLORS[t]}>{t.replace('_', ' ')}</Tag></Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}><Form.Item name="reference" label="Reference"><Input placeholder="Invoice/PO/SO number" /></Form.Item></Col>
            <Col span={6}><Form.Item name="currencyCode" label="Currency">
              <Select><Option value="OMR">OMR</Option><Option value="USD">USD</Option><Option value="EUR">EUR</Option></Select>
            </Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input placeholder="Brief description of this entry" />
          </Form.Item>

          <Divider>Journal Entry Lines</Divider>

          {/* Header row */}
          <Row gutter={8} style={{ marginBottom: 8, fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>
            <Col span={1}>#</Col>
            <Col span={6}>Account</Col>
            <Col span={6}>Description</Col>
            <Col span={3}>Cost Center</Col>
            <Col span={3}>Debit (OMR)</Col>
            <Col span={3}>Credit (OMR)</Col>
            <Col span={2}></Col>
          </Row>

          {lines.map((line, idx) => (
            <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
              <Col span={1}><Text type="secondary">{idx + 1}</Text></Col>
              <Col span={6}>
                <Select showSearch placeholder="Select account" style={{ width: '100%' }}
                  value={line.accountId || undefined} optionFilterProp="children"
                  onChange={v => updateLine(idx, 'accountId', v)}>
                  {accounts.map(a => (
                    <Option key={a.accountId} value={a.accountId}>
                      <span style={{ fontFamily: 'monospace', marginRight: 8, color: '#8c8c8c' }}>{a.accountCode}</span>
                      {a.accountName}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Input value={line.description} placeholder="Line description"
                  onChange={e => updateLine(idx, 'description', e.target.value)} />
              </Col>
              <Col span={3}>
                <Input value={line.costCenter} placeholder="Cost center"
                  onChange={e => updateLine(idx, 'costCenter', e.target.value)} />
              </Col>
              <Col span={3}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3}
                  value={line.debitAmount}
                  onChange={v => updateLine(idx, 'debitAmount', v || 0)}
                  onBlur={() => { if (line.debitAmount > 0) updateLine(idx, 'creditAmount', 0); }} />
              </Col>
              <Col span={3}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3}
                  value={line.creditAmount}
                  onChange={v => updateLine(idx, 'creditAmount', v || 0)}
                  onBlur={() => { if (line.creditAmount > 0) updateLine(idx, 'debitAmount', 0); }} />
              </Col>
              <Col span={2}>
                {lines.length > 2 && (
                  <Button size="small" danger onClick={() => setLines(lines.filter((_, i) => i !== idx))}>×</Button>
                )}
              </Col>
            </Row>
          ))}

          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLines([...lines, defaultLine()])} style={{ marginBottom: 16 }}>
            Add Line
          </Button>

          {/* Totals */}
          <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <Row justify="end">
              <Col span={12}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Total Debit</Text>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#1890ff' }}>OMR {totalDebit.toFixed(3)}</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Total Credit</Text>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#722ed1' }}>OMR {totalCredit.toFixed(3)}</div>
                    </div>
                  </Col>
                </Row>
                {!isBalanced && totalDebit > 0 && (
                  <Alert type="error" style={{ marginTop: 8 }}
                    message={`Difference: OMR ${Math.abs(totalDebit - totalCredit).toFixed(3)} — Debit and Credit must be equal!`} />
                )}
                {isBalanced && totalDebit > 0 && (
                  <Alert type="success" style={{ marginTop: 8 }} message="✓ Entry is balanced!" />
                )}
              </Col>
            </Row>
          </div>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} disabled={!isBalanced && totalDebit > 0}>
              {editRecord ? 'Save Changes' : 'Create Voucher'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
