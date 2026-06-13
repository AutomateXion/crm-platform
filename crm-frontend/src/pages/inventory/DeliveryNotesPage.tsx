import React, { useState, useEffect, useCallback } from 'react';
import { AutoComplete, Table, Card, Button, Input, Select, Tag, Space, Modal, Form, Typography, Row, Col, message, Popconfirm, Tooltip, InputNumber, Divider, Switch } from 'antd';
import { FilePdfOutlined, PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { updateStatus, deliveryNotesApi, productsApi, quotationsApi, signaturesApi } from '../../services/salesApi';
import SalesmanSelect from '../../components/common/SalesmanSelect';
import api from '../../services/api';
import PDFModal from '../../components/pdf/PDFModal';
import ProductSelect from '../../components/common/ProductSelect';
import SignatureModal from '../../components/common/SignatureModal';
const { Title, Text } = Typography;
const { Option } = Select;
const STATUS_COLORS: Record<string,string> = { DRAFT:'default', CONFIRMED:'blue', DELIVERED:'green', CANCELLED:'red' };
export default function DeliveryNotesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [sigOpen, setSigOpen] = useState(false);
  const [sigRec, setSigRec] = useState<any>(null);
  const [signedMap, setSignedMap] = useState<Record<string, any>>({});
  const [sigViewMode, setSigViewMode] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [accountOptions, setAccountOptions] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await deliveryNotesApi.getAll({ page, limit: 20, search: search || undefined, status: statusFilter || undefined }); setItems(r.data.data || []); setTotal(r.data.total || 0); try { const sg = await signaturesApi.getStatus('DN'); const m: Record<string, any> = {}; (sg.data || []).forEach((x: any) => { m[x.docId] = x; }); setSignedMap(m); } catch {} }
    catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    productsApi.getAll({ limit: 100 }).then(r => setProducts(r.data.data || [])).catch(() => {});
    quotationsApi.getAll({ limit: 100, excludeConverted: true }).then(r => setQuotations((r.data.data || []).filter((q:any) => q.status !== 'CANCELLED'))).catch(() => {});
  }, []);
  const defaultLine = () => ({ description: '', quantity: 1, unitPrice: 0, discountPct: 0, lineTotal: 0, isTaxable: true, unitOfMeasure: 'PCS' });
  const handleAccountSearch = async (val: string) => {
    if (val.length < 1) { setAccountOptions([]); return; }
    try {
      const r = await api.get('/accounts', { params: { search: val, limit: 20 } });
      setAccountOptions((r.data.data || []).map((a: any) => ({
        value: a.accountName,
        label: a.accountName,
        account: a,
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
        quotationId: undefined,
      });
      // Filter quotations for this customer only
      quotationsApi.getAll({ limit: 100, excludeConverted: true })
        .then(r => setQuotations((r.data.data || []).filter((q:any) => q.customerName === name && q.status !== 'CANCELLED')))
        .catch(() => {});
    }
  };
  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ status: 'DRAFT', currencyCode: 'OMR', vatRate: 5, isInventory: true, dnDate: new Date().toISOString().slice(0,10) });
    setLineItems([defaultLine()]);
    // Refresh quotations to exclude converted ones
    quotationsApi.getAll({ limit: 100, excludeConverted: true }).then(r => setQuotations((r.data.data || []).filter((q:any) => q.status !== 'CANCELLED'))).catch(() => {});
    setModalOpen(true);
  };
  const openEdit = async (r: any) => {
    setEditRecord(r);
    try { const d = await deliveryNotesApi.getOne(r.dnId); form.setFieldsValue({ ...d.data, dnDate: d.data.dnDate?.slice(0,10), deliveryDate: d.data.deliveryDate?.slice(0,10) }); setLineItems(d.data.items?.length ? d.data.items : [defaultLine()]); }
    catch {} setModalOpen(true);
  };
  const calcTotals = (lines: any[], vatRate: number) => {
    const subtotal = lines.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
    const vatAmount = subtotal * (vatRate / 100);
    form.setFieldsValue({ subtotal, vatAmount, totalAmount: subtotal + vatAmount });
  };
  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'productId') { const p = products.find(p => p.productId === value); if (p) { updated[idx].description = p.productName; updated[idx].unitPrice = Number(p.unitPrice); updated[idx].unitOfMeasure = p.unitOfMeasure; updated[idx].itemCode = p.productCode; } }
    const qty = Number(updated[idx].quantity || 1); const price = Number(updated[idx].unitPrice || 0); const disc = Number(updated[idx].discountPct || 0);
    updated[idx].discountAmount = (qty * price * disc) / 100;
    updated[idx].lineTotal = qty * price - updated[idx].discountAmount;
    setLineItems(updated); calcTotals(updated, Number(form.getFieldValue('vatRate') || 5));
  };
  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      // Recalculate totals from line items
      const subtotal = lineItems.reduce((s: number, l: any) => s + Number(l.lineTotal || 0), 0);
      const vatRate = Number(values.vatRate || 5);
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount;
      const payload = { ...values, items: lineItems, subtotal, vatAmount, totalAmount };
      if (editRecord) await deliveryNotesApi.update(editRecord.dnId, payload);
      else await deliveryNotesApi.create(payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };
  const handleConvertToInvoice = async (id: string) => {
    try { await deliveryNotesApi.convertToInvoice(id); message.success('Converted to Invoice!'); navigate('/finance/invoices'); }
    catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const columns = [
    { title: 'DN #', dataIndex: 'dnNumber', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Date', dataIndex: 'dnDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Customer', dataIndex: 'customerName', width: 260, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Total', dataIndex: 'totalAmount', width: 130, align: 'right' as const, render: (v: number) => <Text strong style={{ whiteSpace: 'nowrap' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    { title: 'Delivery Date', dataIndex: 'deliveryDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && <Tooltip title="Confirm DN"><Button size="small" type="primary" style={{background:'#1890ff'}} onClick={async () => { await updateStatus.deliveryNote(r.dnId, 'CONFIRMED'); load(); message.success('Confirmed!'); }}>Confirm</Button></Tooltip>}
        {r.status === 'CONFIRMED' && <Tooltip title="Mark as Delivered"><Button size="small" type="primary" style={{background:'#52c41a'}} onClick={async () => { await updateStatus.deliveryNote(r.dnId, 'DELIVERED'); load(); message.success('Marked as Delivered!'); }}>Deliver</Button></Tooltip>}
        <Tooltip title="View PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={async () => { try { const d = await deliveryNotesApi.getOne(r.dnId); setPdfData(d.data); setPdfOpen(true); } catch {} }} /></Tooltip>
        {signedMap[r.dnId] ? (<Tooltip title={`Signed by ${signedMap[r.dnId].signerName}`}><Button size="small" style={{ color: '#52c41a', borderColor: '#52c41a' }} onClick={() => { setSigRec(r); setSigViewMode(true); setSigOpen(true); }}>✓ Signed</Button></Tooltip>) : (<Tooltip title="Capture Signature"><Button size="small" onClick={() => { setSigRec(r); setSigViewMode(false); setSigOpen(true); }}>✍ Sign</Button></Tooltip>)}
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
        {r.status === 'DELIVERED' && <Tooltip title="Convert to Invoice"><Button size="small" type="primary" icon={<ArrowRightOutlined />} onClick={() => handleConvertToInvoice(r.dnId)} style={{ background: '#52c41a', borderColor: '#52c41a' }} /></Tooltip>}
        <Popconfirm title="Delete?" onConfirm={async () => { await deliveryNotesApi.delete(r.dnId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Delivery Notes</Title><Text type="secondary">Manage delivery notes and stock movements</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Delivery Note</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260 }} />
          <Select placeholder="Status" value={statusFilter || undefined} onChange={v => { setStatusFilter(v || ''); setPage(1); }} allowClear style={{ width: 160 }}>
            {Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}><Tag color={STATUS_COLORS[s]}>{s}</Tag></Option>)}
          </Select>
        </Space>
        <Table dataSource={items} columns={columns} rowKey="dnId" loading={loading} size="middle" scroll={{ x: 'max-content' }} sticky={{ offsetHeader: 0 }}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>
      <Modal title={editRecord ? 'Edit Delivery Note' : 'New Delivery Note'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={900} style={{ top: 20 }}>
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
            <Col span={6}><Form.Item name="dnDate" label="DN Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}><Form.Item name="status" label="Status"><Select>{Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}>{s}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="quotationId" label="From Quotation (Optional)"><Select allowClear showSearch optionFilterProp="children" onChange={async (v) => { if (v) { const q = await quotationsApi.getOne(v); form.setFieldsValue({ customerName: q.data.customerName }); setLineItems(q.data.items || [defaultLine()]); calcTotals(q.data.items || [], 5); } }}>{quotations.map(q => <Option key={q.quotationId} value={q.quotationId}>{q.quotationNumber} — {q.customerName}</Option>)}</Select></Form.Item></Col>
            <Col span={6}><Form.Item name="deliveryDate" label="Delivery Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}><Form.Item name="isInventory" label="Deduct Stock" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="customerAddress" label="Customer Address"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={12}><Form.Item name="deliveryAddress" label="Delivery Address"><Input.TextArea rows={2} /></Form.Item></Col>
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
                <Row justify="space-between" style={{ marginBottom: 4 }}><Text>VAT (5%):</Text><Text strong>OMR {Number(form.getFieldValue('vatAmount')||0).toFixed(3)}</Text></Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between"><Text strong style={{ fontSize: 15 }}>Total:</Text><Text strong style={{ fontSize: 15, color: '#52c41a' }}>OMR {Number(form.getFieldValue('totalAmount')||0).toFixed(3)}</Text></Row>
              </div>
            </Col>
          </Row>
          <Form.Item name="receivedBy" label="Received By" style={{ marginTop: 12 }}><Input /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save Changes' : 'Create DN'}</Button>
          </div>
        </Form>
      </Modal>
      <SignatureModal docType="DN" docId={sigRec?.dnId} docNumber={sigRec?.dnNumber} viewMode={sigViewMode} open={sigOpen} onClose={() => setSigOpen(false)} onSigned={() => load()} />
      <PDFModal open={pdfOpen} onClose={() => setPdfOpen(false)} docType="delivery-note" data={pdfData} />
    </div>
  );
}
