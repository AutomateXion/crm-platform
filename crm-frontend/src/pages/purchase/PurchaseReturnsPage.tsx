import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Tag, Space, Modal, Form, Input, Typography, Row, Col, message, Popconfirm, Select, InputNumber, Divider, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { purchaseReturnsApi, purchaseInvoicesApi, suppliersApi } from '../../services/salesApi';
import SupplierSelect from '../../components/common/SupplierSelect';
import axios from 'axios';
const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use((c:any) => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const { Title, Text } = Typography;
const { Option } = Select;
const STATUS_COLORS: Record<string,string> = { DRAFT:'default', APPROVED:'blue', PROCESSED:'green', CANCELLED:'red' };

export default function PurchaseReturnsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await purchaseReturnsApi.getAll({ page, limit: 20 }); setItems(r.data.data || []); setTotal(r.data.total || 0); }
    catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const defaultLine = () => ({ description: '', quantity: 1, unitPrice: 0, lineTotal: 0, unitOfMeasure: 'PCS' });

  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ status: 'DRAFT', returnDate: new Date().toISOString().slice(0,10), vatRate: 5 });
    setLineItems([defaultLine()]);
    setFilteredInvoices([]);
    purchaseInvoicesApi.getAll({ limit: 500 }).then(r => setAllInvoices(r.data.data || [])).catch(() => {});
    setModalOpen(true);
  };

  const handleSupplierSelect = (s: any) => {
    form.setFieldsValue({ supplierName: s.supplierName, supplierId: s.supplierId, invoiceId: undefined });
    // Filter invoices for this supplier
    const supplierInvoices = allInvoices.filter((i: any) => i.supplierId === s.supplierId || i.supplierName === s.supplierName);
    setFilteredInvoices(supplierInvoices);
    setLineItems([defaultLine()]);
  };

  const handleInvoiceSelect = async (invoiceId: string) => {
    if (!invoiceId) { setLineItems([defaultLine()]); return; }
    try {
      const r = await purchaseInvoicesApi.getOne(invoiceId);
      const inv = r.data;
      form.setFieldsValue({ supplierName: inv.supplierName, supplierId: inv.supplierId });
      // Warn if invoice is already fully paid
      if (inv.status === 'PAID' || Number(inv.balanceDue) <= 0) {
        message.warning({
          content: `⚠️ This invoice is already fully paid (OMR ${Number(inv.totalAmount).toFixed(3)}). The return will create a Debit Balance — ${inv.supplierName} will owe you this amount. You can apply it to another invoice or request a refund.`,
          duration: 6,
        });
      }
      const lines = (inv.items || []).map((item: any) => ({
        productId: item.productId,
        description: item.description,
        unitOfMeasure: item.unitOfMeasure || 'PCS',
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      }));
      setLineItems(lines.length ? lines : [defaultLine()]);
      const subtotal = lines.reduce((s: number, l: any) => s + Number(l.lineTotal || 0), 0);
      const vatAmount = subtotal * 0.05;
      form.setFieldsValue({ subtotal, vatAmount, totalAmount: subtotal + vatAmount });
    } catch {}
  };

  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    updated[idx].lineTotal = Number(updated[idx].quantity || 1) * Number(updated[idx].unitPrice || 0);
    setLineItems(updated);
    const subtotal = updated.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
    const vatRate = Number(form.getFieldValue('vatRate') || 5);
    const vatAmount = subtotal * vatRate / 100;
    form.setFieldsValue({ subtotal, vatAmount, totalAmount: subtotal + vatAmount });
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const subtotal = lineItems.reduce((s: number, l: any) => s + Number(l.lineTotal || 0), 0);
      const vatRate = Number(values.vatRate || 5);
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount;
      const payload = { ...values, items: lineItems, subtotal, vatAmount, totalAmount };
      if (editRecord) await purchaseReturnsApi.update(editRecord.returnId, payload);
      else await purchaseReturnsApi.create(payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: 'Return #', dataIndex: 'returnNumber', render: (v: string) => <Tag color="orange">{v}</Tag> },
    { title: 'Date', dataIndex: 'returnDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Supplier', dataIndex: 'supplierName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Total', dataIndex: 'totalAmount', render: (v: number) => <Text strong style={{ color: '#fa8c16' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && <Button size="small" type="primary" style={{background:'#2E6DA4'}} onClick={async () => { await sApi.patch(`/sales/purchase-returns/${r.returnId}/status`, { status: 'APPROVED' }); load(); message.success('Approved!'); }}>Approve</Button>}
        {r.status === 'APPROVED' && <Button size="small" type="primary" style={{background:'#52c41a'}} onClick={async () => { await sApi.patch(`/sales/purchase-returns/${r.returnId}/status`, { status: 'PROCESSED' }); load(); message.success('Processed!'); }}>Process</Button>}
        <Button size="small" icon={<EditOutlined />} onClick={() => {
          setEditRecord(r); form.setFieldsValue({ ...r, returnDate: r.returnDate?.slice(0,10) });
          setLineItems(r.items || [defaultLine()]); setModalOpen(true);
        }} />
        <Popconfirm title="Delete return?" onConfirm={async () => { await purchaseReturnsApi.delete(r.returnId); load(); }}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><Title level={4} style={{ margin: 0 }}>Purchase Returns</Title><Text type="secondary">Manage supplier returns and debit notes</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Return</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={items} columns={columns} rowKey="returnId" loading={loading} size="middle"
          pagination={{ showSizeChanger: true, pageSizeOptions: ['10','20','50','100'], current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>

      <Modal title={editRecord ? 'Edit Return' : 'New Purchase Return'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={900} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            {/* Step 1: Select Supplier */}
            <Col span={10}>
              <Form.Item name="supplierName" label="Step 1: Select Supplier" rules={[{ required: true }]}>
                <SupplierSelect onSupplierSelect={handleSupplierSelect} />
              </Form.Item>
              <Form.Item name="supplierId" hidden><Input /></Form.Item>
            </Col>
            {/* Step 2: Select Invoice */}
            <Col span={10}>
              <Form.Item name="invoiceId" label="Step 2: Select Purchase Invoice">
                <Select allowClear showSearch optionFilterProp="children" placeholder="Select supplier first..."
                  onChange={handleInvoiceSelect}>
                  {(filteredInvoices.length > 0 ? filteredInvoices : allInvoices).map((i: any) => (
                    <Option key={i.invoiceId} value={i.invoiceId}>
                      {i.invoiceNumber} — {i.supplierName} — OMR {Number(i.totalAmount).toFixed(3)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="returnDate" label="Return Date">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="status" label="Status"><Select>{Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}>{s}</Option>)}</Select></Form.Item></Col>
            <Col span={6}><Form.Item name="vatRate" label="VAT Rate"><Select onChange={() => {
              const subtotal = lineItems.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
              const vatRate = Number(form.getFieldValue('vatRate') || 5);
              form.setFieldsValue({ vatAmount: subtotal * vatRate / 100, totalAmount: subtotal + subtotal * vatRate / 100 });
            }}><Option value={0}>No VAT</Option><Option value={5}>5%</Option></Select></Form.Item></Col>
            <Col span={6}><Form.Item name="debitNoteNumber" label="Debit Note #"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="returnToStock" label="Return to Stock" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
          </Row>
          <Form.Item name="reason" label="Reason for Return"><Input.TextArea rows={2} placeholder="Describe the reason for return..." /></Form.Item>

          <Divider>Step 3: Return Items (remove items NOT being returned)</Divider>
          <Row gutter={8} style={{ marginBottom: 8, fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>
            <Col span={1}>#</Col><Col span={8}>Description</Col><Col span={2}>UOM</Col>
            <Col span={3}>Qty</Col><Col span={4}>Unit Price</Col><Col span={4}>Total</Col><Col span={1}></Col>
          </Row>
          {lineItems.map((item, idx) => (
            <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
              <Col span={1}><Text type="secondary">{idx+1}</Text></Col>
              <Col span={8}><Input value={item.description} onChange={e => updateLine(idx, 'description', e.target.value)} placeholder="Description" /></Col>
              <Col span={2}><Input value={item.unitOfMeasure} onChange={e => updateLine(idx, 'unitOfMeasure', e.target.value)} /></Col>
              <Col span={3}><InputNumber style={{ width: '100%' }} min={0} step={0.001} value={item.quantity} onChange={v => updateLine(idx, 'quantity', v)} /></Col>
              <Col span={4}><InputNumber style={{ width: '100%' }} min={0} step={0.001} value={item.unitPrice} onChange={v => updateLine(idx, 'unitPrice', v)} /></Col>
              <Col span={4}><Text strong style={{ color: '#fa8c16' }}>OMR {Number(item.lineTotal).toFixed(3)}</Text></Col>
              <Col span={1}><Button size="small" danger onClick={() => { const u = lineItems.filter((_,i)=>i!==idx); setLineItems(u); }}>×</Button></Col>
            </Row>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLineItems([...lineItems, defaultLine()])} style={{ marginBottom: 16 }}>Add Item</Button>

          <Row justify="end">
            <Col span={8}>
              <div style={{ background: '#fff7e6', padding: 12, borderRadius: 8, border: '1px solid #ffd591' }}>
                <Row justify="space-between" style={{ marginBottom: 4 }}><Text>Subtotal:</Text><Text strong>OMR {Number(form.getFieldValue('subtotal')||0).toFixed(3)}</Text></Row>
                <Row justify="space-between" style={{ marginBottom: 4 }}><Text>VAT:</Text><Text strong>OMR {Number(form.getFieldValue('vatAmount')||0).toFixed(3)}</Text></Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between"><Text strong style={{ fontSize: 15 }}>Total Debit:</Text><Text strong style={{ fontSize: 15, color: '#fa8c16' }}>OMR {Number(form.getFieldValue('totalAmount')||0).toFixed(3)}</Text></Row>
              </div>
            </Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#fa8c16', borderColor: '#fa8c16' }}>{editRecord ? 'Save' : 'Create Return'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
