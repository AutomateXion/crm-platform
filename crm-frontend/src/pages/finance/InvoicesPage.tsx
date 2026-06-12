import React, { useState, useEffect, useCallback } from 'react';
import SalesmanSelect from '../../components/common/SalesmanSelect';
import {
  AutoComplete, Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, Statistic, message, Popconfirm, Tooltip,
  InputNumber, Divider, Switch,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, DeleteOutlined, DollarOutlined, FilePdfOutlined, FileTextOutlined,
  EditOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { updateStatus, invoicesApi, receiptsApi, productsApi, deliveryNotesApi, quotationsApi, signaturesApi } from '../../services/salesApi';
import PDFModal from '../../components/pdf/PDFModal';
import SignatureModal from '../../components/common/SignatureModal';
import ProductSelect from '../../components/common/ProductSelect';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'default', SENT: 'blue', PARTIALLY_PAID: 'orange',
  PAID: 'green', OVERDUE: 'red', CANCELLED: 'default',
};

export default function InvoicesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<any[]>([]);
  const [accountOptions, setAccountOptions] = useState<any[]>([]);
  const [vatRates, setVatRates] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [skipDN, setSkipDN] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [sigOpen, setSigOpen] = useState(false);
  const [sigRec, setSigRec] = useState<any>(null);
  const [sigViewMode, setSigViewMode] = useState(false);
  const [signedMap, setSignedMap] = useState<Record<string, any>>({});
  const [receiptForm] = Form.useForm();
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await invoicesApi.getAll({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
      setItems(r.data.data || []); setTotal(r.data.total || 0); try { const sg = await signaturesApi.getStatus('INVOICE'); const mm: Record<string, any> = {}; (sg.data || []).forEach((x: any) => { mm[x.docId] = x; }); setSignedMap(mm); } catch {}
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    productsApi.getAll({ limit: 100 }).then(r => setProducts(r.data.data || [])).catch(() => {});
    quotationsApi.getAll({ limit: 100, excludeConverted: true }).then(r => setQuotations((r.data.data || []).filter((q:any) => q.status !== 'CANCELLED'))).catch(() => {});
    deliveryNotesApi.getAll({ limit: 100, excludeInvoiced: true }).then(r => setDeliveryNotes(r.data.data || [])).catch(() => {});
    api.post('/masters/bulk-values', { categoryCodes: ['vat_rates', 'sales_terms', 'payment_methods'] })
      .then(r => {
        setVatRates(r.data.vat_rates || []);
        setPaymentTerms(r.data.sales_terms || []);
        setPaymentMethods(r.data.payment_methods || []);
      }).catch(() => {});
  }, []);

  const defaultLine = () => ({ description: '', quantity: 1, unitPrice: 0, discountPct: 0, lineTotal: 0, isTaxable: true, unitOfMeasure: 'PCS' });

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
      const name = option.account.accountName;
      form.setFieldsValue({
        customerName: name,
        customerEmail: option.account.email,
        customerPhone: option.account.phone,
        customerAddress: [option.account.addressLine1, option.account.city, option.account.country].filter(Boolean).join(', '),
        customerTrn: option.account.trn,
        salesmanId: option.account.salesmanId,
        salesmanName: option.account.salesmanName,
        creditLimit: Number(option.account.creditLimit || 0),
        creditPeriodDays: Number(option.account.creditPeriodDays || 0),
        dnId: undefined,
        quotationId: undefined,
      });
      // Filter DNs and quotations for this customer only
      deliveryNotesApi.getAll({ limit: 100, excludeInvoiced: true })
        .then(r => setDeliveryNotes((r.data.data || []).filter((d:any) => d.customerName === name)))
        .catch(() => {});
      quotationsApi.getAll({ limit: 100, excludeConverted: true })
        .then(r => setQuotations((r.data.data || []).filter((q:any) => q.customerName === name && q.status !== 'CANCELLED')))
        .catch(() => {});
    }
  };
  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ status: 'DRAFT', currencyCode: 'OMR', vatRate: 5, isInventory: false, invoiceDate: new Date().toISOString().slice(0,10) });
    setLineItems([defaultLine()]);
    deliveryNotesApi.getAll({ limit: 100, excludeInvoiced: true }).then(r => setDeliveryNotes(r.data.data || [])).catch(() => {});
    quotationsApi.getAll({ limit: 100, excludeConverted: true }).then(r => setQuotations((r.data.data || []).filter((q:any) => q.status !== 'CANCELLED'))).catch(() => {});
    setModalOpen(true);
  };

  const openEdit = async (r: any) => {
    setEditRecord(r);
    try {
      const d = await invoicesApi.getOne(r.invoiceId);
      form.setFieldsValue({ ...d.data, invoiceDate: d.data.invoiceDate?.slice(0,10), dueDate: d.data.dueDate?.slice(0,10) });
      setLineItems(d.data.items?.length ? d.data.items : [defaultLine()]);
    } catch {} setModalOpen(true);
  };

  const calcTotals = (lines: any[], vatRate: number) => {
    const subtotal = lines.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
    const taxable = lines.filter(l => l.isTaxable).reduce((s, l) => s + Number(l.lineTotal || 0), 0);
    const vatAmount = taxable * (vatRate / 100);
    const totalAmount = subtotal + vatAmount;
    form.setFieldsValue({ subtotal, vatAmount, totalAmount });
  };

  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'productId') {
      const p = products.find(p => p.productId === value);
      if (p) { updated[idx].description = p.productName; updated[idx].unitPrice = Number(p.unitPrice); updated[idx].unitOfMeasure = p.unitOfMeasure; updated[idx].itemCode = p.productCode; }
    }
    const qty = Number(updated[idx].quantity || 1); const price = Number(updated[idx].unitPrice || 0); const disc = Number(updated[idx].discountPct || 0);
    updated[idx].discountAmount = (qty * price * disc) / 100;
    updated[idx].lineTotal = qty * price - updated[idx].discountAmount;
    setLineItems(updated); calcTotals(updated, Number(form.getFieldValue('vatRate') || 5));
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const subtotal = lineItems.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
      const vatRate = Number(values.vatRate || 5);
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount;
      const { invoiceNumber: _in, dnNumber: _dn, quotationNumber: _qn, ...cleanValues } = values;
      const payload = { ...cleanValues, items: lineItems, subtotal, vatAmount, totalAmount };
      if (editRecord) await invoicesApi.update(editRecord.invoiceId, payload);
      else await invoicesApi.create(payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const openReceiptModal = (inv: any) => {
    setSelectedInvoice(inv);
    receiptForm.resetFields();
    receiptForm.setFieldsValue({
      invoiceId: inv.invoiceId, customerName: inv.customerName,
      amount: Number(inv.balanceDue), receiptDate: new Date().toISOString().slice(0,10),
      currencyCode: inv.currencyCode || 'OMR', paymentMethod: 'BANK_TRANSFER', status: 'CONFIRMED',
    });
    setReceiptModalOpen(true);
  };

  const handleReceipt = async (values: any) => {
    try {
      await receiptsApi.create(values);
      message.success('Payment recorded!'); setReceiptModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };

  const totalInvoiced = items.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
  const totalPaid = items.reduce((s, i) => s + Number(i.paidAmount || 0), 0);
  const totalBalance = items.reduce((s, i) => s + Number(i.balanceDue || 0), 0);

  const columns = [
    { title: 'Invoice #', dataIndex: 'invoiceNumber', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Date', dataIndex: 'invoiceDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Due Date', dataIndex: 'dueDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Customer', dataIndex: 'customerName', width: 260, render: (v: string) => <Text strong>{v}</Text> },


    { title: 'Total', dataIndex: 'totalAmount', width: 130, align: 'right' as const, render: (v: number) => <Text strong style={{ whiteSpace: 'nowrap' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Paid', dataIndex: 'paidAmount', width: 130, align: 'right' as const, render: (v: number) => <Text style={{ color: '#52c41a', whiteSpace: 'nowrap' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Balance', dataIndex: 'balanceDue', width: 130, align: 'right' as const, render: (v: number) => <Text strong style={{ color: Number(v) > 0 ? '#ff4d4f' : '#52c41a', whiteSpace: 'nowrap' }}>OMR {Number(v).toFixed(3)}</Text> },
    {
      title: '', key: 'actions', render: (_: any, r: any) => (
        <Space>
                    {r.status === 'DRAFT' && <Tooltip title="Send Invoice"><Button size="small" type="primary" style={{background:'#1890ff'}} onClick={async () => { await updateStatus.invoice(r.invoiceId, 'SENT'); load(); message.success('Invoice Sent!'); }}>Send</Button></Tooltip>}
          <Tooltip title="View PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={async () => { try { const d = await invoicesApi.getOne(r.invoiceId); setPdfData(d.data); setPdfOpen(true); } catch {} }} /></Tooltip>
          {signedMap[r.invoiceId] ? (<Tooltip title={`Signed by ${signedMap[r.invoiceId].signerName}`}><Button size="small" style={{ color: '#52c41a', borderColor: '#52c41a' }} onClick={() => { setSigRec(r); setSigViewMode(true); setSigOpen(true); }}>✓ Signed</Button></Tooltip>) : (<Tooltip title="Capture Signature"><Button size="small" onClick={() => { setSigRec(r); setSigViewMode(false); setSigOpen(true); }}>✍ Sign</Button></Tooltip>)}
          <Tooltip title="Generate E-Invoice XML (Fawtara)">
            <Button size="small" icon={<FileTextOutlined />} style={{color:'#722ed1',borderColor:'#722ed1'}}
              onClick={async () => {
                try {
                  const axios = (await import('axios')).default;
                  const sApi = axios.create({baseURL:'/sales-api'});
                  const t = localStorage.getItem('accessToken');
                  const r2 = await sApi.get('/sales/einvoice/invoice/'+r.invoiceId+'/xml', {headers:{Authorization:'Bearer '+t}});
                  if(r2.data.xml) {
                    const blob = new Blob([r2.data.xml], {type:'application/xml'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = (r2.data.invoiceNumber||r.invoiceNumber)+'.xml';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } else {
                    alert('Validation errors: ' + (r2.data.validation?.errors||[]).join(', '));
                  }
                } catch(e) { alert('Failed to generate XML'); }
              }} />
          </Tooltip>
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          {['SENT','PARTIALLY_PAID','OVERDUE'].includes(r.status) && (
            <Tooltip title="Record Payment">
              <Button size="small" type="primary" icon={<DollarOutlined />} onClick={() => openReceiptModal(r)} style={{ background: '#52c41a', borderColor: '#52c41a' }} />
            </Tooltip>
          )}
          <Popconfirm title="Delete invoice?" onConfirm={async () => { await invoicesApi.delete(r.invoiceId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
    { title: 'Status', dataIndex: 'status', width: 130, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v?.replace('_', ' ')}</Tag> },
    { title: 'Salesman', dataIndex: 'salesmanName', width: 140, render: (v: string) => v ? <Tag color="blue">{v}</Tag> : <Text type="secondary">—</Text> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Sales Invoices</Title><Text type="secondary">Manage customer invoices and payments</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>New Invoice</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}><Card style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}><Statistic title="Total Invoiced" value={`OMR ${totalInvoiced.toFixed(3)}`} /></Card></Col>
        <Col span={8}><Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}><Statistic title="Total Paid" value={`OMR ${totalPaid.toFixed(3)}`} /></Card></Col>
        <Col span={8}><Card style={{ borderRadius: 12, borderLeft: '4px solid #ff4d4f' }}><Statistic title="Outstanding" value={`OMR ${totalBalance.toFixed(3)}`} /></Card></Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Search invoices..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260 }} />
          <Select placeholder="Filter by status" value={statusFilter || undefined} onChange={v => { setStatusFilter(v || ''); setPage(1); }} allowClear style={{ width: 200 }}>
            {Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}><Tag color={STATUS_COLORS[s]}>{s.replace('_',' ')}</Tag></Option>)}
          </Select>
        </Space>
        <Table dataSource={items} columns={columns} rowKey="invoiceId" loading={loading} size="middle"
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>

      {/* Create/Edit Invoice Modal */}
      <Modal title={editRecord ? 'Edit Invoice' : 'New Invoice'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={900} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
                <AutoComplete
                  options={accountOptions}
                  onSearch={handleAccountSearch}
                  onSelect={handleAccountSelect}
                  placeholder="Search customer..."
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={6}><Form.Item name="invoiceDate" label="Invoice Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}><Form.Item name="dueDate" label="Due Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={4}>
              <Form.Item label="Skip Delivery Note">
                <Switch checkedChildren="Yes" unCheckedChildren="No" checked={skipDN}
                  onChange={v => { setSkipDN(v); form.setFieldsValue({ dnId: undefined, quotationId: undefined }); }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              {!skipDN ? (
                <Form.Item name="dnId" label="From Delivery Note (Optional)">
                  <Select allowClear showSearch optionFilterProp="children"
                    onChange={async (v) => { if (v) { const d = await deliveryNotesApi.getOne(v); form.setFieldsValue({ customerName: d.data.customerName }); setLineItems(d.data.items || [defaultLine()]); calcTotals(d.data.items || [], 5); } }}>
                    {deliveryNotes.map(d => <Option key={d.dnId} value={d.dnId}>{d.dnNumber} — {d.customerName}</Option>)}
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item name="quotationId" label="From Quotation (Skip DN)">
                  <Select allowClear showSearch optionFilterProp="children"
                    onChange={async (v) => { if (v) { const q = await quotationsApi.getOne(v); form.setFieldsValue({ customerName: q.data.customerName, customerAddress: q.data.customerAddress, customerEmail: q.data.customerEmail, customerTrn: q.data.customerTrn }); setLineItems(q.data.items || [defaultLine()]); calcTotals(q.data.items || [], Number(q.data.vatRate || 5)); } }}>
                    {quotations.map(q => <Option key={q.quotationId} value={q.quotationId}>{q.quotationNumber} — {q.customerName}</Option>)}
                  </Select>
                </Form.Item>
              )}
            </Col>
            <Col span={8}>
              <Form.Item name="paymentTerms" label="Payment Terms">
                <Select allowClear>
                  {paymentTerms.length ? paymentTerms.map((t: any) => <Option key={t.valueCode} value={t.valueCode}>{t.valueLabel}</Option>)
                    : <><Option value="NET_30">Net 30 Days</Option><Option value="IMMEDIATE">Due Immediately</Option></>}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="vatRate" label="VAT Rate">
                <Select onChange={v => calcTotals(lineItems, Number(v))}>
                  {vatRates.length ? vatRates.map((vr: any) => <Option key={vr.valueCode} value={Number(vr.metadata?.rate ?? 5)}>{vr.valueLabel}</Option>)
                    : <><Option value={0}>No VAT</Option><Option value={5}>5%</Option></>}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="status" label="Status">
                <Select>{Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}>{s.replace('_',' ')}</Option>)}</Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="customerAddress" label="Address"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={6}><Form.Item name="customerEmail" label="Email"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="customerTrn" label="TRN"><Input /></Form.Item></Col>
          </Row>

          <Row gutter={12} style={{ marginBottom: 8 }}>
            <Col span={12}>
              <Form.Item name="salesmanId" label="Salesman">
                <SalesmanSelect onChange={(id, name) => form.setFieldsValue({ salesmanId: id, salesmanName: name })} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="salesmanName" hidden><Input /></Form.Item>
            </Col>
          </Row>
                    <Divider>Line Items</Divider>
          <Row gutter={8} style={{ marginBottom: 8, fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>
            <Col span={1}>#</Col><Col span={5}>Product</Col><Col span={5}>Description</Col><Col span={2}>UOM</Col><Col span={2}>Qty</Col><Col span={3}>Unit Price</Col><Col span={2}>Disc%</Col><Col span={3}>Total</Col><Col span={1}></Col>
          </Row>
          {lineItems.map((item, idx) => (
            <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
              <Col span={1}><Text type="secondary">{idx+1}</Text></Col>
              <Col span={5}><Select showSearch placeholder="Product" style={{ width: '100%' }} allowClear value={item.productId} onChange={v => updateLine(idx, 'productId', v)} optionFilterProp="children">{products.map(p => <Option key={p.productId} value={p.productId}>{p.productName}</Option>)}</Select></Col>
              <Col span={5}><Input value={item.description} onChange={e => updateLine(idx, 'description', e.target.value)} placeholder="Description" /></Col>
              <Col span={2}><Input value={item.unitOfMeasure} onChange={e => updateLine(idx, 'unitOfMeasure', e.target.value)} /></Col>
              <Col span={2}><InputNumber style={{ width: '100%' }} min={0} step={0.001} value={item.quantity} onChange={v => updateLine(idx, 'quantity', v)} /></Col>
              <Col span={3}><InputNumber style={{ width: '100%' }} min={0} step={0.001} value={item.unitPrice} onChange={v => updateLine(idx, 'unitPrice', v)} /></Col>
              <Col span={2}><InputNumber style={{ width: '100%' }} min={0} max={100} value={item.discountPct} onChange={v => updateLine(idx, 'discountPct', v)} /></Col>
              <Col span={3}><Text strong style={{ color: '#52c41a' }}>{Number(item.lineTotal).toFixed(3)}</Text></Col>
              <Col span={1}><Button size="small" danger onClick={() => { const u = lineItems.filter((_,i)=>i!==idx); setLineItems(u); calcTotals(u, Number(form.getFieldValue('vatRate')||5)); }}>×</Button></Col>
            </Row>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLineItems([...lineItems, defaultLine()])} style={{ marginBottom: 16 }}>Add Line Item</Button>

          <Row gutter={12} justify="end">
            <Col span={8}>
              <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
                <Row justify="space-between" style={{ marginBottom: 4 }}><Text>Subtotal:</Text><Text strong>OMR {Number(form.getFieldValue('subtotal')||0).toFixed(3)}</Text></Row>
                <Row justify="space-between" style={{ marginBottom: 4 }}><Text>VAT:</Text><Text strong>OMR {Number(form.getFieldValue('vatAmount')||0).toFixed(3)}</Text></Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between"><Text strong style={{ fontSize: 15 }}>Total:</Text><Text strong style={{ fontSize: 15, color: '#52c41a' }}>OMR {Number(form.getFieldValue('totalAmount')||0).toFixed(3)}</Text></Row>
              </div>
            </Col>
          </Row>
          <Form.Item name="notes" label="Notes" style={{ marginTop: 12 }}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="termsConditions" label="Terms & Conditions"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save Changes' : 'Create Invoice'}</Button>
          </div>
        </Form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal title="Record Payment" open={receiptModalOpen} onCancel={() => setReceiptModalOpen(false)} footer={null} width={480}>
        <Form form={receiptForm} layout="vertical" onFinish={handleReceipt} style={{ marginTop: 12 }}>
          {selectedInvoice && (
            <div style={{ background: '#f6ffed', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid #b7eb8f' }}>
              <Text>Invoice: <strong>{selectedInvoice.invoiceNumber}</strong> · Balance Due: <strong style={{ color: '#ff4d4f' }}>OMR {Number(selectedInvoice.balanceDue).toFixed(3)}</strong></Text>
            </div>
          )}
          <Form.Item name="invoiceId" hidden><Input /></Form.Item>
          <Form.Item name="customerName" label="Customer"><Input disabled /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="amount" label="Amount (OMR)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} /></Form.Item></Col>
            <Col span={12}><Form.Item name="receiptDate" label="Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Form.Item name="paymentMethod" label="Payment Method">
            <Select>
              {paymentMethods.length ? paymentMethods.map((m: any) => <Option key={m.valueCode} value={m.valueCode}>{m.valueLabel}</Option>)
                : <><Option value="CASH">Cash</Option><Option value="BANK_TRANSFER">Bank Transfer</Option><Option value="CHEQUE">Cheque</Option></>}
            </Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="paymentReference" label="Reference"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="bankName" label="Bank Name"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setReceiptModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#52c41a', borderColor: '#52c41a' }}>Record Payment</Button>
          </div>
        </Form>
      </Modal>
      <SignatureModal docType="INVOICE" docId={sigRec?.invoiceId} docNumber={sigRec?.invoiceNumber} viewMode={sigViewMode} open={sigOpen} onClose={() => setSigOpen(false)} onSigned={() => load()} />
      <PDFModal open={pdfOpen} onClose={() => setPdfOpen(false)} docType="invoice" data={pdfData} />
    </div>
  );
}
