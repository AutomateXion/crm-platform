import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, Row, Col, Typography, message, Statistic, Tabs, Alert } from 'antd';
import { PlusOutlined, MinusOutlined, HistoryOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

export default function ConsumablesPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [issueModal, setIssueModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [historyModal, setHistoryModal] = useState(false);
  const [historyItem, setHistoryItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stockR, statsR, txR] = await Promise.allSettled([
        sApi.get('/sales/consumables/stock'),
        sApi.get('/sales/consumables/stats'),
        sApi.get('/sales/consumables/transactions'),
      ]);
      if (stockR.status === 'fulfilled') setStock(stockR.value.data || []);
      if (statsR.status === 'fulfilled') setStats(statsR.value.data || {});
      if (txR.status === 'fulfilled') setTransactions(txR.value.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get('/users', { params: { limit: 100 } }).then(r => setUsers(r.data.data || r.data || [])).catch(() => {}); }, []);

  const handleIssue = async (values: any) => {
    setSaving(true);
    try {
      await sApi.post('/sales/consumables/issue', { ...values, productId: selectedItem.product_id });
      message.success(`Issued ${values.quantity} ${selectedItem.unit_of_measure} of ${selectedItem.product_name}`);
      setIssueModal(false); form.resetFields(); load();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Failed to issue');
    } finally { setSaving(false); }
  };

  const loadHistory = async (item: any) => {
    setHistoryItem(item);
    const r = await sApi.get('/sales/consumables/transactions', { params: { productId: item.product_id } });
    setTransactions(r.data || []);
    setHistoryModal(true);
  };

  const stockColumns = [
    { title: 'Code', dataIndex: 'product_code', width: 80, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Item Name', dataIndex: 'product_name', render: (v: string, r: any) => (
      <Space direction="vertical" size={0}>
        <Text strong>{v}</Text>
        <Text type="secondary" style={{ fontSize: 11 }}>{r.category}{r.brand ? ` — ${r.brand}` : ''}</Text>
      </Space>
    )},
    { title: 'UOM', dataIndex: 'unit_of_measure', width: 70 },
    { title: 'Qty on Hand', dataIndex: 'qty_on_hand', align: 'right' as const, render: (v: number, r: any) => (
      <Text strong style={{ color: Number(v) <= Number(r.min_qty) ? '#ff4d4f' : '#52c41a', fontSize: 16 }}>
        {Number(v).toFixed(2)}
      </Text>
    )},
    { title: 'Min Qty', dataIndex: 'min_qty', align: 'right' as const, render: (v: number) => Number(v).toFixed(2) },
    { title: 'Status', dataIndex: 'is_low_stock', render: (v: boolean, r: any) => (
      Number(r.qty_on_hand) === 0
        ? <Tag color="red">Out of Stock</Tag>
        : v ? <Tag color="orange" icon={<WarningOutlined />}>Low Stock</Tag>
        : <Tag color="green">In Stock</Tag>
    )},
    { title: 'Last Received', dataIndex: 'last_received_date', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
    { title: 'Last Issued', dataIndex: 'last_issued_date', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
    { title: '', render: (_: any, r: any) => (
      <Space>
        <Button size="small" type="primary" icon={<MinusOutlined />}
          onClick={() => { setSelectedItem(r); form.setFieldsValue({ quantity: 1 }); setIssueModal(true); }}
          disabled={Number(r.qty_on_hand) === 0}>Issue</Button>
        <Button size="small" icon={<HistoryOutlined />} onClick={() => loadHistory(r)}>History</Button>
      </Space>
    )},
  ];

  const txColumns = [
    { title: 'Date', dataIndex: 'created_at', render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm') },
    { title: 'Item', dataIndex: 'product_name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Type', dataIndex: 'transaction_type', render: (v: string) => <Tag color={v === 'RECEIPT' ? 'green' : 'orange'}>{v}</Tag> },
    { title: 'Qty', dataIndex: 'quantity', align: 'right' as const, render: (v: number, r: any) => (
      <Text strong style={{ color: r.transaction_type === 'RECEIPT' ? '#52c41a' : '#fa8c16' }}>
        {r.transaction_type === 'RECEIPT' ? '+' : '-'}{Number(v).toFixed(2)}
      </Text>
    )},
    { title: 'Balance', dataIndex: 'balance_qty', align: 'right' as const, render: (v: number) => Number(v).toFixed(2) },
    { title: 'Department', dataIndex: 'department', render: (v: string) => v || '—' },
    { title: 'Issued To', dataIndex: 'issued_to_name', render: (v: string) => v || '—' },
    { title: 'Reason', dataIndex: 'reason', render: (v: string) => v || '—' },
    { title: 'Reference', dataIndex: 'reference_no', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
  ];

  const lowStockItems = stock.filter(s => s.is_low_stock || Number(s.qty_on_hand) === 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Consumables</Title>
          <Text type="secondary">Track and manage consumable items stock and issuance</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
      </div>

      {/* KPI Cards */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff', textAlign: 'center' }}>
          <Statistic title="Total Items" value={stats.total_items || 0} valueStyle={{ color: '#1890ff', fontSize: 20 }} />
        </Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a', textAlign: 'center' }}>
          <Statistic title="Total Qty on Hand" value={Number(stats.total_qty || 0).toFixed(2)} valueStyle={{ color: '#52c41a', fontSize: 20 }} />
        </Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #fa8c16', textAlign: 'center' }}>
          <Statistic title="Low Stock Items" value={stats.low_stock_count || 0} valueStyle={{ color: '#fa8c16', fontSize: 20 }} />
        </Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f', textAlign: 'center' }}>
          <Statistic title="Out of Stock" value={stats.out_of_stock_count || 0} valueStyle={{ color: '#ff4d4f', fontSize: 20 }} />
        </Card></Col>
      </Row>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <Alert type="warning" showIcon icon={<WarningOutlined />} style={{ marginBottom: 12, borderRadius: 10 }}
          message={`${lowStockItems.length} item(s) are low or out of stock: ${lowStockItems.slice(0,3).map(i => i.product_name).join(', ')}${lowStockItems.length > 3 ? '...' : ''}`} />
      )}

      <Tabs defaultActiveKey="stock" items={[
        {
          key: 'stock', label: '📦 Stock on Hand',
          children: (
            <Card style={{ borderRadius: 12 }} size="small">
              <Table dataSource={stock} columns={stockColumns} rowKey="stock_id" loading={loading} size="small"
                pagination={{ pageSize: 20, showTotal: t => `${t} items` }}
                rowClassName={(r: any) => Number(r.qty_on_hand) === 0 ? 'ant-table-row-warning' : ''} />
            </Card>
          )
        },
        {
          key: 'transactions', label: '📋 Transaction History',
          children: (
            <Card style={{ borderRadius: 12 }} size="small">
              <Table dataSource={transactions} columns={txColumns} rowKey="transaction_id" size="small"
                pagination={{ pageSize: 20 }} />
            </Card>
          )
        },
      ]} />

      {/* Issue Modal */}
      <Modal title={`Issue ${selectedItem?.product_name || ''}`} open={issueModal}
        onCancel={() => { setIssueModal(false); form.resetFields(); }} footer={null} width={480}>
        <div style={{ background: '#f6ffed', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
          <Text>Available: <Text strong style={{ color: '#52c41a', fontSize: 16 }}>{Number(selectedItem?.qty_on_hand || 0).toFixed(2)} {selectedItem?.unit_of_measure}</Text></Text>
        </div>
        <Form form={form} layout="vertical" onFinish={handleIssue}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="quantity" label="Quantity to Issue" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0.001} max={Number(selectedItem?.qty_on_hand || 0)} step={0.001} precision={3} />
            </Form.Item></Col>
            <Col span={12}><Form.Item name="department" label="Department">
              <Input placeholder="e.g. IT, Finance, HR..." />
            </Form.Item></Col>
          </Row>
          <Form.Item name="issuedToName" label="Issued To">
            <Select showSearch allowClear placeholder="Select employee..." optionFilterProp="children"
              onChange={(v, opt: any) => form.setFieldsValue({ issuedToId: v, issuedToName: opt?.children })}>
              {users.map(u => <Option key={u.userId} value={u.userId}>{u.fullName}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="issuedToId" hidden><Input /></Form.Item>
          <Form.Item name="reason" label="Reason / Purpose"><Input placeholder="e.g. Office supplies for Q2..." /></Form.Item>
          <Form.Item name="notes" label="Notes"><TextArea rows={2} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setIssueModal(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} danger icon={<MinusOutlined />}>Issue</Button>
          </div>
        </Form>
      </Modal>

      {/* History Modal */}
      <Modal title={`Transaction History — ${historyItem?.product_name || ''}`}
        open={historyModal} onCancel={() => setHistoryModal(false)} footer={null} width={800}>
        <Table dataSource={transactions} columns={txColumns.filter(c => c.dataIndex !== 'product_name')}
          rowKey="transaction_id" size="small" pagination={{ pageSize: 10 }} />
      </Modal>
    </div>
  );
}
