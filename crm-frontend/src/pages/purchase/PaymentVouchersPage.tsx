import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Select, Tag, Space, Modal, Form, Typography, Row, Col, message, Popconfirm, Tooltip, InputNumber, Statistic } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, FilePdfOutlined, CheckOutlined } from '@ant-design/icons';
import SupplierSelect from '../../components/common/SupplierSelect';
import { paymentVouchersApi, purchaseInvoicesApi, suppliersApi, bankAccountsApi, chequeBooksApi, chequeLeavesApi } from '../../services/salesApi';
import api from '../../services/api';
import PDFModal from '../../components/pdf/PDFModal';

const { Title, Text } = Typography;
const { Option } = Select;
const STATUS_COLORS: Record<string, string> = { DRAFT: 'orange', POSTED: 'green', CONFIRMED: 'green', CANCELLED: 'red' };

export default function PaymentVouchersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [chequeBooks, setChequeBooks] = useState<any[]>([]);
  const [chequeLeaves, setChequeLeaves] = useState<any[]>([]);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const paymentMethod = Form.useWatch('paymentMethod', form);
  const selectedBankAccountId = Form.useWatch('bankAccountId', form);
  const selectedChequeBookId = Form.useWatch('chequeBookId', form);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await paymentVouchersApi.getAll({ page, limit: 20, search: search||undefined });
      setItems(r.data.data||[]); setTotal(r.data.total||0);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bankAccountsApi.getAll().then(r => setBankAccounts(r.data || [])).catch(() => {}); }, []);
  useEffect(() => {
    if (selectedBankAccountId) {
      chequeBooksApi.getAll(selectedBankAccountId).then(r => setChequeBooks((r.data || []).filter((b: any) => b.status === 'ACTIVE'))).catch(() => setChequeBooks([]));
    } else {
      setChequeBooks([]);
    }
  }, [selectedBankAccountId]);
  useEffect(() => {
    if (selectedChequeBookId) {
      chequeLeavesApi.getAll({ chequeBookId: selectedChequeBookId, status: 'AVAILABLE' }).then(r => setChequeLeaves(r.data || [])).catch(() => setChequeLeaves([]));
    } else {
      setChequeLeaves([]);
    }
  }, [selectedChequeBookId]);
  useEffect(() => {
    suppliersApi.getAll({ limit: 100 }).then(r => setSuppliers(r.data.data||[])).catch(()=>{});
    purchaseInvoicesApi.getAll({ limit: 100, excludePaid: true }).then(r => setInvoices(r.data.data||[])).catch(()=>{});
    api.post('/masters/bulk-values', { categoryCodes: ['payment_methods'] }).then(r => setPaymentMethods(r.data.payment_methods||[])).catch(()=>{});
  }, []);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'CONFIRMED', paymentMethod: 'BANK_TRANSFER', currencyCode: 'OMR', voucherDate: new Date().toISOString().slice(0,10) });
    purchaseInvoicesApi.getAll({ limit: 100, excludePaid: true }).then(r => setInvoices(r.data.data||[])).catch(()=>{});
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editRecord) {
        await paymentVouchersApi.update(editRecord.voucherId, values);
      } else {
        if (editRecord) {
        await paymentVouchersApi.update(editRecord.voucherId, values);
      } else {
        await paymentVouchersApi.create(values);
      }
      }
      message.success('Payment Voucher created!'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const totalPaid = items.reduce((s, i) => s + Number(i.amount||0), 0);

  const columns = [
    { title: 'Voucher #', dataIndex: 'voucherNumber', render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: 'Date', dataIndex: 'voucherDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Supplier', dataIndex: 'supplierName', render: (v: string) => <Text strong>{v||'—'}</Text> },
    { title: 'Amount', dataIndex: 'amount', render: (v: number) => <Text strong style={{ color: '#2E6DA4' }}>OMR {Number(v||0).toFixed(3)}</Text> },
    { title: 'Method', dataIndex: 'paymentMethod', render: (v: string) => <Tag>{v?.replace('_',' ')}</Tag> },
    { title: 'Reference', dataIndex: 'paymentReference', render: (v: string) => v||'—' },
    { title: 'Bank', dataIndex: 'bankName', render: (v: string) => v||'—' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && (
          <Popconfirm title="Post this voucher? This will consume the cheque leaf, apply payment to the invoice, and post the GL journal." okText="Post" onConfirm={async () => {
            try { await paymentVouchersApi.post(r.voucherId); message.success('Voucher posted'); load(); }
            catch (e: any) { message.error(e.response?.data?.message || 'Failed to post'); }
          }}>
            <Tooltip title="Post voucher"><Button size="small" type="primary" icon={<CheckOutlined />}>Post</Button></Tooltip>
          </Popconfirm>
        )}
        <Tooltip title="View PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={() => { setPdfData(r); setPdfOpen(true); }} /></Tooltip>
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} disabled={r.status === 'POSTED'} onClick={() => {
          setEditRecord(r);
          form.setFieldsValue({ ...r, voucherDate: r.voucherDate?.slice(0,10) });
          setModalOpen(true);
        }} /></Tooltip>
        {r.status !== 'POSTED' && (
          <Popconfirm title="Delete voucher?" onConfirm={async () => { await paymentVouchersApi.delete(r.voucherId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Payment Vouchers</Title><Text type="secondary">Record payments made to suppliers</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Payment</Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card style={{ borderRadius: 12, borderLeft: '4px solid #2E6DA4' }} size="small"><Statistic title="Total Payments" value={`OMR ${totalPaid.toFixed(3)}`} valueStyle={{ color: '#2E6DA4', fontSize: 20 }} /></Card></Col>
        <Col span={8}><Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }} size="small"><Statistic title="Total Vouchers" value={total} valueStyle={{ color: '#52c41a', fontSize: 20 }} /></Card></Col>
      </Row>
      <Card style={{ borderRadius: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search vouchers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260, marginBottom: 16 }} />
        <Table dataSource={items} columns={columns} rowKey="voucherId" loading={loading} size="middle"
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>

      <Modal title={editRecord ? "Edit Payment Voucher" : "New Payment Voucher"} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={560}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="supplierName" label="Supplier" rules={[{ required: true }]}>
                <SupplierSelect
                  onSupplierSelect={s => {
                    form.setFieldsValue({ supplierName: s.supplierName, supplierId: s.supplierId, invoiceId: undefined });
                    purchaseInvoicesApi.getAll({ limit: 100, excludePaid: true })
                      .then(r => setInvoices((r.data.data || []).filter((i:any) => i.supplierId === s.supplierId || i.supplierName === s.supplierName)))
                      .catch(() => {});
                  }}
                />
              </Form.Item>
              <Form.Item name="supplierId" hidden><input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="invoiceId" label="Against Invoice (Optional)">
                <Select allowClear showSearch optionFilterProp="children" onChange={v => { const inv = invoices.find(i => i.invoiceId === v); if (inv) { form.setFieldsValue({ amount: Number(inv.balanceDue), supplierName: inv.supplierName }); } }}>
                  {invoices.map(i => <Option key={i.invoiceId} value={i.invoiceId}>{i.invoiceNumber} — OMR {Number(i.balanceDue||0).toFixed(3)}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="voucherDate" label="Date"><Input type="date" /></Form.Item></Col>
            <Col span={8}><Form.Item name="amount" label="Amount (OMR)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} /></Form.Item></Col>
            <Col span={8}><Form.Item name="currencyCode" label="Currency"><Select><Option value="OMR">OMR</Option><Option value="USD">USD</Option></Select></Form.Item></Col>
          </Row>
          <Form.Item name="paymentMethod" label="Payment Method">
            <Select>
              {paymentMethods.length ? paymentMethods.map((m:any) => <Option key={m.valueCode} value={m.valueCode}>{m.valueLabel}</Option>)
                : <><Option value="CASH">Cash</Option><Option value="BANK_TRANSFER">Bank Transfer</Option><Option value="CHEQUE">Cheque</Option></>}
            </Select>
          </Form.Item>
          {paymentMethod === 'CHEQUE' ? (
            <>
              <Form.Item name="bankAccountId" label="Pay From Bank Account" rules={[{ required: true, message: 'Select a bank account to issue the cheque from' }]}>
                <Select placeholder="Select bank account" showSearch optionFilterProp="children" onChange={() => form.setFieldsValue({ chequeBookId: undefined })}>
                  {bankAccounts.map((a: any) => <Option key={a.bankAccountId} value={a.bankAccountId}>{a.accountName} ({a.bankName})</Option>)}
                </Select>
              </Form.Item>
              {selectedBankAccountId && (
                <Form.Item name="chequeBookId" label="Cheque Book" extra="Leave blank to use the oldest available leaf from any active book." rules={selectedChequeBookId ? [] : []}>
                  <Select placeholder="Select cheque book (optional)" allowClear onChange={() => form.setFieldsValue({ chequeLeafId: undefined })}>
                    {chequeBooks.map((b: any) => <Option key={b.chequeBookId} value={b.chequeBookId}>Book #{b.bookNumber} ({b.startLeafNo}–{b.endLeafNo})</Option>)}
                  </Select>
                </Form.Item>
              )}
              {selectedChequeBookId && (
                <Form.Item name="chequeLeafId" label="Cheque Leaf" extra="Leave blank to auto-assign the next available leaf.">
                  <Select placeholder="Select leaf (optional)" allowClear>
                    {chequeLeaves.map((l: any) => <Option key={l.leafId} value={l.leafId}>Leaf {l.leafNumber}</Option>)}
                  </Select>
                </Form.Item>
              )}
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                The next available cheque leaf from this account will be automatically allocated and marked as used.
              </Text>
              <Form.Item name="chequeDate" label="Cheque Date">
                <Input type="date" />
              </Form.Item>
            </>
          ) : (
            <Row gutter={12}>
              <Col span={12}><Form.Item name="paymentReference" label="Reference #"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="bankName" label="Bank Name"><Input /></Form.Item></Col>
            </Row>
          )}
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>Create Payment Voucher</Button>
          </div>
        </Form>
      </Modal>
      <PDFModal open={pdfOpen} onClose={() => setPdfOpen(false)} docType="payment-voucher" data={pdfData} />
    </div>
  );
}
