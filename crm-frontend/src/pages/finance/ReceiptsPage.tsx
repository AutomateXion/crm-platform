import React, { useState, useEffect, useCallback } from 'react';
import { AutoComplete, Table, Tooltip, Card, Button, Input, Tag, Space, Modal, Form, Typography, Row, Col, Statistic, message, Popconfirm, Select, InputNumber } from 'antd';
import { PlusOutlined, FilePdfOutlined, EditOutlined, SearchOutlined, DeleteOutlined, DollarOutlined, CheckOutlined } from '@ant-design/icons';
import { receiptsApi, invoicesApi, bankAccountsApi } from '../../services/salesApi';
import api from '../../services/api';
import PDFModal from '../../components/pdf/PDFModal';
const { Title, Text } = Typography;
const { Option } = Select;
export default function ReceiptsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [accountOptions, setAccountOptions] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [form] = Form.useForm();
  const paymentMethod = Form.useWatch('paymentMethod', form);
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await receiptsApi.getAll({ page, limit: 20, search: search || undefined }); setItems(r.data.data || []); setTotal(r.data.total || 0); }
    catch {} finally { setLoading(false); }
  }, [page, search]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { bankAccountsApi.getAll().then(r => setBankAccounts(r.data || [])).catch(() => {}); }, []);
  useEffect(() => {
    invoicesApi.getAll({ limit: 100, excludePaid: true }).then(r => setInvoices(r.data.data || [])).catch(() => {});
    api.post('/masters/bulk-values', { categoryCodes: ['payment_methods'] }).then(r => setPaymentMethods(r.data.payment_methods || [])).catch(() => {});
  }, []);
  const handleAccountSearch = async (val: string) => {
    if (val.length < 1) { setAccountOptions([]); return; }
    try {
      const r = await api.get('/accounts', { params: { search: val, limit: 20 } });
      setAccountOptions((r.data.data || []).map((a: any) => ({
        value: a.accountName, label: a.accountName, account: a,
      })));
    } catch {}
  };
  const handleAccountSelect = (_: string, option: any) => {
    if (option.account) {
      const customerName = option.account.accountName;
      form.setFieldsValue({ customerName, accountId: option.account.accountId, invoiceIds: [], amount: 0 });
      // Filter invoices for this customer from backend
      invoicesApi.getAll({ limit: 100, excludePaid: true })
        .then(r => {
          const customerInvoices = (r.data.data || []).filter((i:any) => i.customerName === customerName);
          setFilteredInvoices(customerInvoices);
        }).catch(() => {});
    }
  };
    const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editRecord?.receiptId) {
        await receiptsApi.update(editRecord.receiptId, values);
        message.success('Receipt updated');
      } else {
        await receiptsApi.create(values);
        message.success('Receipt created');
      }
      setModalOpen(false); load();
    }
    catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };
  const totalReceived = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const columns = [
    { title: 'Receipt #', dataIndex: 'receiptNumber', render: (v: string) => <Tag color="green">{v}</Tag> },
    { title: 'Date', dataIndex: 'receiptDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Customer', dataIndex: 'customerName', width: 260, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Amount', dataIndex: 'amount', width: 130, align: 'right' as const, render: (v: number, r: any) => <Text strong style={{ color: '#52c41a', whiteSpace: 'nowrap' }}>{r.currencyCode} {Number(v).toFixed(3)}</Text> },
    { title: 'Payment Method', dataIndex: 'paymentMethod', render: (v: string) => <Tag>{v?.replace('_', ' ')}</Tag> },
    {
      title: 'Cheque Status', key: 'chequeStatus', width: 160,
      render: (_: any, r: any) => {
        if (r.paymentMethod !== 'CHEQUE') return null;
        const CHEQUE_COLORS: Record<string, string> = { RECEIVED: 'blue', DEPOSITED: 'orange', CLEARED: 'green', BOUNCED: 'red' };
        const next: Record<string, string> = { RECEIVED: 'DEPOSITED', DEPOSITED: 'CLEARED' };
        return (
          <Space size={4}>
            <Tag color={CHEQUE_COLORS[r.chequeStatus] || 'default'}>{r.chequeStatus || '—'}</Tag>
            {next[r.chequeStatus] && (
              <Popconfirm title={`Mark as ${next[r.chequeStatus]}?`} onConfirm={async () => {
                await receiptsApi.update(r.receiptId, { chequeStatus: next[r.chequeStatus] });
                message.success(`Marked as ${next[r.chequeStatus]}`); load();
              }}>
                <Button size="small" style={{ fontSize: 11 }}>→ {next[r.chequeStatus]}</Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
    { title: 'Reference', dataIndex: 'paymentReference', render: (v: string) => v || '—' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={v === 'DRAFT' ? 'orange' : v === 'POSTED' ? 'green' : 'green'}>{v}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && (
          <Popconfirm title="Post this receipt? This applies the payment to the invoice and posts the GL journal." okText="Post" onConfirm={async () => {
            try { await receiptsApi.post(r.receiptId); message.success('Receipt posted'); load(); }
            catch (e: any) { message.error(e.response?.data?.message || 'Failed to post'); }
          }}>
            <Tooltip title="Post receipt"><Button size="small" type="primary" icon={<CheckOutlined />}>Post</Button></Tooltip>
          </Popconfirm>
        )}
        <Tooltip title="View PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={() => { setPdfData(r); setPdfOpen(true); }} /></Tooltip>
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} disabled={r.status === 'POSTED'} onClick={() => {
          setEditRecord(r);
          form.setFieldsValue({ ...r, receiptDate: r.receiptDate?.slice(0,10) });
          setModalOpen(true);
        }} /></Tooltip>
        {r.status !== 'POSTED' && (
          <Popconfirm title="Delete receipt?" onConfirm={async () => { await receiptsApi.delete(r.receiptId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )}
      </Space>
    )},
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Receipts</Title><Text type="secondary">Record customer payments against invoices</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); form.setFieldsValue({ receiptDate: new Date().toISOString().slice(0,10), currencyCode: 'OMR', paymentMethod: 'BANK_TRANSFER', status: 'DRAFT', chequeStatus: 'RECEIVED' }); setModalOpen(true); }}>New Receipt</Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}><Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}><Statistic title="Total Received" value={`OMR ${totalReceived.toFixed(3)}`} prefix={<DollarOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
        <Col span={8}><Card style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}><Statistic title="Total Receipts" value={total} /></Card></Col>
      </Row>
      <Card style={{ borderRadius: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search receipts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260, marginBottom: 16 }} />
        <Table dataSource={items} columns={columns} rowKey="receiptId" loading={loading} size="middle" scroll={{ x: 'max-content' }} sticky={{ offsetHeader: 0 }}
          pagination={{ showSizeChanger: true, pageSizeOptions: ['10','20','50','100'], current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>
      <Modal title="New Receipt" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Form.Item name="invoiceIds" label="Link to Invoices (Optional - select one or more)">
            <Select mode="multiple" allowClear placeholder="Select invoices for this customer" showSearch optionFilterProp="children"
              onChange={(vals: string[]) => {
                const total = vals.reduce((s, id) => {
                  const inv = invoices.find((i: any) => i.invoiceId === id);
                  return s + (inv ? Number(inv.balanceDue) : 0);
                }, 0);
                form.setFieldsValue({ amount: total });
              }}>
              {(filteredInvoices.length > 0 ? filteredInvoices : invoices).map((i: any) => (
                <Option key={i.invoiceId} value={i.invoiceId}>
                  {i.invoiceNumber} — {i.customerName} — OMR {Number(i.balanceDue).toFixed(3)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="accountId" hidden><Input /></Form.Item>
          <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
                <AutoComplete
                  options={accountOptions}
                  onSearch={handleAccountSearch}
                  onSelect={handleAccountSelect}
                  placeholder="Search customer..."
                  allowClear
                />
              </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="amount" label="Amount (OMR)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} /></Form.Item></Col>
            <Col span={12}><Form.Item name="receiptDate" label="Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Form.Item name="paymentMethod" label="Payment Method">
            <Select>
              {paymentMethods.length ? paymentMethods.map((m: any) => <Option key={m.valueCode} value={m.valueCode}>{m.valueLabel}</Option>) : <>
                <Option value="CASH">Cash</Option>
                <Option value="CHEQUE">Cheque</Option>
                <Option value="BANK_TRANSFER">Bank Transfer</Option>
                <Option value="CARD">Card</Option>
              </>}
            </Select>
          </Form.Item>
          {paymentMethod === 'CHEQUE' ? (
            <>
              <Row gutter={12}>
                <Col span={12}><Form.Item name="chequeNumber" label="Cheque Number"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="chequeDate" label="Cheque Date"><Input type="date" /></Form.Item></Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}><Form.Item name="chequeBankName" label="Drawer's Bank"><Input placeholder="Bank the cheque is drawn on" /></Form.Item></Col>
                <Col span={12}>
                  <Form.Item name="depositBankAccountId" label="Deposit To">
                    <Select placeholder="Select our bank account" allowClear showSearch optionFilterProp="children">
                      {bankAccounts.map((a: any) => <Option key={a.bankAccountId} value={a.bankAccountId}>{a.accountName} ({a.bankName})</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="chequeStatus" label="Cheque Status">
                <Select>
                  <Option value="RECEIVED">Received</Option>
                  <Option value="DEPOSITED">Deposited</Option>
                  <Option value="CLEARED">Cleared</Option>
                  <Option value="BOUNCED">Bounced</Option>
                </Select>
              </Form.Item>
            </>
          ) : (
            <Row gutter={12}>
              <Col span={12}><Form.Item name="paymentReference" label="Payment Reference"><Input placeholder="Transfer ref" /></Form.Item></Col>
              <Col span={12}><Form.Item name="bankName" label="Bank Name"><Input /></Form.Item></Col>
            </Row>
          )}
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>Create Receipt</Button>
          </div>
        </Form>
      </Modal>
      <PDFModal open={pdfOpen} onClose={() => setPdfOpen(false)} docType="receipt" data={pdfData} />
    </div>
  );
}
