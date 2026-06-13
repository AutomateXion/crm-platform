import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Tag, Space, Modal, Form, Input,
  Typography, Row, Col, message, Popconfirm, Tooltip, Select, InputNumber, Drawer, Empty,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined,
  BookOutlined, EyeOutlined, StopOutlined,
} from '@ant-design/icons';
import { bankAccountsApi, chequeBooksApi, chequeLeavesApi } from '../../services/salesApi';

const { Title, Text } = Typography;
const { Option } = Select;

const CURRENCIES = ['OMR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'];

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Bank account modal
  const [accModalOpen, setAccModalOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<any>(null);
  const [accForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Cheque book modal
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookForm] = Form.useForm();

  // Leaves drawer
  const [leavesOpen, setLeavesOpen] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [activeBook, setActiveBook] = useState<any>(null);
  const [leavesLoading, setLeavesLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([bankAccountsApi.getAll(), chequeBooksApi.getAll()]);
      setAccounts(a.data || []);
      setBooks(b.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Bank Account handlers ─────────────────────────────────────
  const openCreateAcc = () => {
    setEditAcc(null);
    accForm.resetFields();
    accForm.setFieldsValue({ currencyCode: 'OMR', openingBalance: 0, isActive: true });
    setAccModalOpen(true);
  };

  const openEditAcc = (r: any) => {
    setEditAcc(r);
    accForm.setFieldsValue(r);
    setAccModalOpen(true);
  };

  const saveAcc = async (values: any) => {
    setSaving(true);
    try {
      if (editAcc) await bankAccountsApi.update(editAcc.bankAccountId, values);
      else await bankAccountsApi.create(values);
      message.success('Saved'); setAccModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteAcc = async (id: string) => {
    try { await bankAccountsApi.delete(id); message.success('Deleted'); load(); }
    catch (e: any) { message.error(e.response?.data?.message || 'Failed to delete'); }
  };

  // ── Cheque Book handlers ──────────────────────────────────────
  const openCreateBook = () => {
    bookForm.resetFields();
    setBookModalOpen(true);
  };

  const saveBook = async (values: any) => {
    setSaving(true);
    try {
      await chequeBooksApi.create(values);
      message.success('Cheque book added'); setBookModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const toggleBookStatus = async (r: any) => {
    const newStatus = r.status === 'ACTIVE' ? 'EXHAUSTED' : 'ACTIVE';
    await chequeBooksApi.updateStatus(r.chequeBookId, newStatus);
    message.success(`Marked as ${newStatus}`); load();
  };

  // ── Leaves drawer ────────────────────────────────────────────
  const viewLeaves = async (book: any) => {
    setActiveBook(book);
    setLeavesOpen(true);
    setLeavesLoading(true);
    try {
      const r = await chequeLeavesApi.getAll({ chequeBookId: book.chequeBookId });
      setLeaves(r.data || []);
    } catch {} finally { setLeavesLoading(false); }
  };

  const voidLeaf = async (leafId: string) => {
    await chequeLeavesApi.void(leafId, 'Voided manually');
    message.success('Leaf voided');
    if (activeBook) viewLeaves(activeBook);
  };

  const accountName = (id: string) => accounts.find(a => a.bankAccountId === id)?.accountName || '—';

  const LEAF_COLORS: Record<string, string> = {
    AVAILABLE: 'green', USED: 'blue', CANCELLED: 'red',
  };

  // ── Columns ──────────────────────────────────────────────────
  const accountColumns = [
    { title: 'Account Name', dataIndex: 'accountName', width: 220, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Bank', dataIndex: 'bankName', width: 180 },
    { title: 'Account Number', dataIndex: 'accountNumber', width: 160, render: (v: string) => v || '—' },
    { title: 'IBAN', dataIndex: 'iban', width: 200, render: (v: string) => v || '—' },
    { title: 'Currency', dataIndex: 'currencyCode', width: 100, render: (v: string) => <Tag color="blue">{v}</Tag> },
    {
      title: 'Current Balance', dataIndex: 'currentBalance', width: 150, align: 'right' as const,
      render: (v: number, r: any) => <Text strong style={{ color: Number(v) >= 0 ? '#52c41a' : '#ff4d4f', whiteSpace: 'nowrap' }}>{r.currencyCode} {Number(v).toFixed(3)}</Text>,
    },
    { title: 'Status', dataIndex: 'isActive', width: 100, render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: '', key: 'actions', width: 100,
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEditAcc(r)} /></Tooltip>
          <Popconfirm title="Delete bank account?" onConfirm={() => deleteAcc(r.bankAccountId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const bookColumns = [
    { title: 'Bank Account', key: 'bankAccountId', width: 220, render: (_: any, r: any) => <Text strong>{accountName(r.bankAccountId)}</Text> },
    { title: 'Book Number', dataIndex: 'bookNumber', width: 160, render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: 'Leaf Range', key: 'range', width: 160, render: (_: any, r: any) => `${r.startLeafNo} – ${r.endLeafNo}` },
    { title: 'Total Leaves', dataIndex: 'totalLeaves', width: 110, align: 'right' as const },
    { title: 'Issued Date', dataIndex: 'issuedDate', width: 130, render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Status', dataIndex: 'status', width: 120, render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>{v}</Tag> },
    {
      title: '', key: 'actions', width: 140,
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="View Leaves"><Button size="small" icon={<EyeOutlined />} onClick={() => viewLeaves(r)} /></Tooltip>
          <Tooltip title={r.status === 'ACTIVE' ? 'Mark Exhausted' : 'Mark Active'}>
            <Button size="small" icon={<StopOutlined />} onClick={() => toggleBookStatus(r)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const leafColumns = [
    { title: 'Leaf No', dataIndex: 'leafNumber', width: 100 },
    { title: 'Status', dataIndex: 'status', width: 110, render: (v: string) => <Tag color={LEAF_COLORS[v] || 'default'}>{v}</Tag> },
    { title: 'Payee', dataIndex: 'payeeName', render: (v: string) => v || '—' },
    { title: 'Amount', dataIndex: 'amount', width: 120, align: 'right' as const, render: (v: number) => v ? `OMR ${Number(v).toFixed(3)}` : '—' },
    { title: 'Used Date', dataIndex: 'usedDate', width: 120, render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    {
      title: '', key: 'actions', width: 60,
      render: (_: any, r: any) => r.status === 'AVAILABLE' ? (
        <Popconfirm title="Void this leaf?" onConfirm={() => voidLeaf(r.leafId)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ) : null,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Bank Accounts &amp; Cheque Books</Title>
          <Text type="secondary">Manage company bank accounts, cheque books and leaves</Text>
        </div>
      </div>

      <Card
        title={<span><BankOutlined /> Bank Accounts</span>}
        style={{ borderRadius: 12, marginBottom: 20 }}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateAcc} style={{ borderRadius: 8 }}>Add Bank Account</Button>}
      >
        <Table dataSource={accounts} columns={accountColumns} rowKey="bankAccountId" loading={loading} size="middle"
          pagination={false} scroll={{ x: 'max-content' }} sticky={{ offsetHeader: 0 }} />
      </Card>

      <Card
        title={<span><BookOutlined /> Cheque Books</span>}
        style={{ borderRadius: 12 }}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateBook} style={{ borderRadius: 8 }} disabled={!accounts.length}>Add Cheque Book</Button>}
      >
        <Table dataSource={books} columns={bookColumns} rowKey="chequeBookId" loading={loading} size="middle"
          pagination={false} scroll={{ x: 'max-content' }} sticky={{ offsetHeader: 0 }}
          locale={{ emptyText: <Empty description="No cheque books yet" /> }} />
      </Card>

      {/* Bank Account Modal */}
      <Modal title={editAcc ? 'Edit Bank Account' : 'New Bank Account'} open={accModalOpen}
        onCancel={() => setAccModalOpen(false)} footer={null} width={560}>
        <Form form={accForm} layout="vertical" onFinish={saveAcc} style={{ marginTop: 16 }}>
          <Form.Item name="accountName" label="Account Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. AutomateXion Operating Account" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Bank Muscat" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currencyCode" label="Currency" rules={[{ required: true }]}>
                <Select>{CURRENCIES.map(c => <Option key={c} value={c}>{c}</Option>)}</Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="accountNumber" label="Account Number">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="branch" label="Branch">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="iban" label="IBAN">
            <Input placeholder="OMxx xxxx xxxx xxxx xxxx xxxx" />
          </Form.Item>
          <Form.Item name="openingBalance" label="Opening Balance" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setAccModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
          </div>
        </Form>
      </Modal>

      {/* Cheque Book Modal */}
      <Modal title="New Cheque Book" open={bookModalOpen}
        onCancel={() => setBookModalOpen(false)} footer={null} width={480}>
        <Form form={bookForm} layout="vertical" onFinish={saveBook} style={{ marginTop: 16 }}>
          <Form.Item name="bankAccountId" label="Bank Account" rules={[{ required: true }]}>
            <Select placeholder="Select bank account">
              {accounts.map(a => <Option key={a.bankAccountId} value={a.bankAccountId}>{a.accountName} ({a.bankName})</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="bookNumber" label="Book Number" rules={[{ required: true }]}>
            <Input placeholder="e.g. CB-001" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="startLeafNo" label="Start Leaf No." rules={[{ required: true }]}>
                <Input placeholder="e.g. 000101" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endLeafNo" label="End Leaf No." rules={[{ required: true }]}>
                <Input placeholder="e.g. 000125" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="issuedDate" label="Issued Date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>Individual leaves will be auto-generated for this range.</Text>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setBookModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
          </div>
        </Form>
      </Modal>

      {/* Leaves Drawer */}
      <Drawer title={activeBook ? `Cheque Leaves – ${activeBook.bookNumber}` : 'Cheque Leaves'}
        open={leavesOpen} onClose={() => setLeavesOpen(false)} width={520}>
        <Table dataSource={leaves} columns={leafColumns} rowKey="leafId" loading={leavesLoading}
          size="small" pagination={{ pageSize: 25 }} />
      </Drawer>
    </div>
  );
}
