import React, { useState, useEffect, useCallback } from 'react';
import PDFModal from '../../components/pdf/PDFModal';
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Popconfirm, Tooltip, InputNumber,
  Divider, Switch, AutoComplete,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined, SendOutlined, ArrowRightOutlined, FilePdfOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { updateStatus, quotationsApi, productsApi } from '../../services/salesApi';
import SalesmanSelect from '../../components/common/SalesmanSelect';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'default', SENT: 'blue', ACCEPTED: 'green',
  REJECTED: 'red', EXPIRED: 'orange', CONVERTED: 'purple',
};

export default function QuotationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [accountOptions, setAccountOptions] = useState<any[]>([]);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [vatRates, setVatRates] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await quotationsApi.getAll({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
      setItems(r.data.data || []); setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    productsApi.getAll({ limit: 100, stockOnly: true }).then(r => setProducts(r.data.data || [])).catch(() => {});
    api.get('/accounts', { params: { limit: 100 } }).then(r => setAccounts(r.data.data || [])).catch(() => {});
    api.post('/masters/bulk-values', { categoryCodes: ['vat_rates'] })
      .then(r => setVatRates(r.data.vat_rates || [])).catch(() => {});
    api.get('/opportunities', { params: { limit: 100, stage: 'CLOSED_WON' } })
      .then(r => setOpportunities((r.data.data || []).filter((o:any) => !o.convertedToQuotation))).catch(() => {});
  }, []);

  const defaultLineItem = () => ({ description: '', quantity: 1, unitPrice: 0, discountPct: 0, isTaxable: true, unitOfMeasure: 'PCS', lineTotal: 0 });

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'DRAFT', currencyCode: 'OMR', vatRate: 5, isInventory: true, quotationDate: new Date().toISOString().slice(0, 10) });
    setLineItems([defaultLineItem()]);
    api.get('/opportunities', { params: { limit: 100, stage: 'CLOSED_WON' } }).then(r => setOpportunities((r.data.data || []).filter((o:any) => !o.convertedToQuotation))).catch(() => {});
    setModalOpen(true);
  };

  const openEdit = async (r: any) => {
    setEditRecord(r);
    try {
      const detail = await quotationsApi.getOne(r.quotationId);
      form.setFieldsValue({ ...detail.data, quotationDate: detail.data.quotationDate?.slice(0, 10), validUntil: detail.data.validUntil?.slice(0, 10) });
      setLineItems(detail.data.items?.length ? detail.data.items : [defaultLineItem()]);
    } catch {}
    setModalOpen(true);
  };

  const calcTotals = (lines: any[], vatRate: number) => {
    const subtotal = lines.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
    const taxableAmount = lines.filter(l => l.isTaxable).reduce((s, l) => s + Number(l.lineTotal || 0), 0);
    const vatAmount = taxableAmount * (vatRate / 100);
    const totalAmount = subtotal + vatAmount;
    form.setFieldsValue({ subtotal, taxableAmount, vatAmount, totalAmount });
  };

  const updateLineItem = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'productId') {
      const product = products.find(p => p.productId === value);
      if (product) {
        updated[idx].description = product.productName;
        updated[idx].unitPrice = Number(product.unitPrice);
        updated[idx].unitOfMeasure = product.unitOfMeasure;
        updated[idx].itemCode = product.productCode;
        updated[idx].revenueAccount = product.revenueAccount;
      }
    }
    const qty = Number(updated[idx].quantity || 1);
    const price = Number(updated[idx].unitPrice || 0);
    const disc = Number(updated[idx].discountPct || 0);
    updated[idx].discountAmount = (qty * price * disc) / 100;
    updated[idx].lineTotal = qty * price - updated[idx].discountAmount;
    setLineItems(updated);
    calcTotals(updated, Number(form.getFieldValue('vatRate') || 5));
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      // Recalculate totals from line items
      const subtotal = lineItems.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
      const vatRate = Number(values.vatRate || 5);
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount;
      const payload = { ...values, items: lineItems, subtotal, vatAmount, totalAmount };
      if (editRecord) await quotationsApi.update(editRecord.quotationId, payload);
      else {
        await quotationsApi.create(payload);
        // Mark linked opportunity as converted so it won't appear again
        if (values.opportunityId) {
          try { await api.patch(`/opportunities/${values.opportunityId}/mark-converted`); } catch {}
        }
      }
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleConvertToDN = async (id: string) => {
    try {
      await quotationsApi.convertToDN(id);
      message.success('Converted to Delivery Note!');
      navigate('/inventory/delivery-notes');
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { title: 'Quotation #', dataIndex: 'quotationNumber', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Date', dataIndex: 'quotationDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Customer', dataIndex: 'customerName', width: 260, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Salesman', dataIndex: 'salesmanName', render: (v: string) => v ? <Tag color="blue">{v}</Tag> : <Text type="secondary">—</Text> },


    { title: 'Subject', dataIndex: 'subject', render: (v: string) => v ? <Text ellipsis style={{ maxWidth: 150 }}>{v}</Text> : '—' },
    { title: 'Total (OMR)', dataIndex: 'totalAmount', width: 130, align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#52c41a', whiteSpace: 'nowrap' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    { title: 'Valid Until', dataIndex: 'validUntil', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          {r.status === 'DRAFT' && <Tooltip title="Send to Customer"><Button size="small" type="primary" style={{background:'#1890ff'}} onClick={async () => { await updateStatus.quotation(r.quotationId, 'SENT'); load(); message.success('Marked as Sent'); }}>Send</Button></Tooltip>}
          {r.status === 'SENT' && <Tooltip title="Customer Accepted"><Button size="small" type="primary" style={{background:'#52c41a'}} onClick={async () => { await updateStatus.quotation(r.quotationId, 'ACCEPTED'); load(); message.success('Accepted!'); }}>Accept</Button></Tooltip>}
          {r.status === 'SENT' && <Tooltip title="Customer Rejected"><Button size="small" danger onClick={async () => { await updateStatus.quotation(r.quotationId, 'REJECTED'); load(); message.success('Marked as Rejected'); }}>Reject</Button></Tooltip>}
          <Tooltip title="View PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={async () => { try { const d = await quotationsApi.getOne(r.quotationId); setPdfData(d.data); setPdfOpen(true); } catch {} }} /></Tooltip>
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          {r.status === 'ACCEPTED' && (
            <Tooltip title="Convert to Delivery Note">
              <Button size="small" type="primary" icon={<ArrowRightOutlined />} onClick={() => handleConvertToDN(r.quotationId)} style={{ background: '#52c41a', borderColor: '#52c41a' }} />
            </Tooltip>
          )}
          <Popconfirm title="Delete quotation?" onConfirm={async () => { await quotationsApi.delete(r.quotationId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Quotations</Title>
          <Text type="secondary">Create and manage customer quotations and proposals</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
          New Quotation
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Search quotations..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260 }} />
          <Select placeholder="Filter by status" value={statusFilter || undefined} onChange={v => { setStatusFilter(v || ''); setPage(1); }} allowClear style={{ width: 180 }}>
            {Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}><Tag color={STATUS_COLORS[s]}>{s}</Tag></Option>)}
          </Select>
        </Space>
        <Table dataSource={items} columns={columns} rowKey="quotationId" loading={loading} size="middle" scroll={{ x: 'max-content' }} sticky={{ offsetHeader: 0 }}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: t => `${t} quotations` }} />
      </Card>

      <Modal title={editRecord ? 'Edit Quotation' : 'New Quotation'} open={modalOpen}
        onCancel={() => setModalOpen(false)} footer={null} width={900} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          {/* Header */}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="customerName" label="Customer / Account" rules={[{ required: true }]}>
                <AutoComplete
                  placeholder="Search accounts or type customer name..."
                  allowClear
                  onSearch={async (val) => {
                    if (val.length < 2) return;
                    try {
                      const r = await api.get('/accounts', { params: { search: val, limit: 20 } });
                      setAccountOptions((r.data.data || []).map((a: any) => ({
                        value: a.accountName,
                        label: (
                          <div>
                            <Text strong>{a.accountName}</Text>
                            {a.phone && <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>{a.phone}</Text>}
                          </div>
                        ),
                        account: a,
                      })));
                    } catch {}
                  }}
                  onSelect={(_: any, option: any) => {
                    if (option.account) {
                      const acc = option.account;
                      const addrParts = [acc.addressLine1, acc.city].filter(Boolean);
                      form.setFieldsValue({
                        customerName: acc.accountName,
                        customerEmail: acc.email || '',
                        customerPhone: acc.phone || '',
                        customerAddress: addrParts.join(', '),
                        customerTrn: acc.trn || '',
                        salesmanId: acc.salesmanId,
                        salesmanName: acc.salesmanName,
                        creditLimit: Number(acc.creditLimit || 0),
                        creditPeriodDays: Number(acc.creditPeriodDays || 0),
                        opportunityId: undefined,
                      });
                      // Filter opportunities for this customer only
                      api.get('/opportunities', { params: { limit: 100, stage: 'CLOSED_WON' } })
                        .then(r => setOpportunities((r.data.data || []).filter((o:any) =>
                          (o.accountName === acc.accountName || o.accountId === acc.accountId) && !o.convertedToQuotation
                        ))).catch(() => {});
                    }
                  }}
                  options={accountOptions}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subject" label="Subject"><Input /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="opportunityId" label="Link to Opportunity (Optional)">
            <Select allowClear showSearch placeholder="Search won opportunities..." optionFilterProp="children"
              onChange={async (v) => {
                const opp = opportunities.find((o: any) => o.opportunityId === v);
                if (opp) {
                  const update: any = {
                    customerName: opp.accountName || opp.opportunityName,
                    subject: opp.opportunityName,
                  };
                  if (opp.accountId) {
                    try {
                      const accR = await api.get(`/accounts/${opp.accountId}`);
                      const acc = accR.data;
                      // Use account name as customer name (more accurate than opportunity name)
                      if (acc.accountName) update.customerName = acc.accountName;
                      if (acc.email) update.customerEmail = acc.email;
                      if (acc.phone) update.customerPhone = acc.phone;
                      // Build address from available fields
                      const addrParts = [acc.addressLine1, acc.city, acc.country].filter(Boolean);
                      if (addrParts.length > 0) update.customerAddress = addrParts.join(', ');
                      if (acc.taxNumber || acc.tax_number || acc.trn) update.customerTrn = acc.taxNumber || acc.tax_number || acc.trn;
                    } catch {}
                  }
                  // Also load opportunity line items into quotation
                  if (opp.opportunityId) {
                    try {
                      const itemsR = await api.get(`/opportunities/${opp.opportunityId}/items`);
                      const oppItems = itemsR.data || [];
                      if (oppItems.length > 0) {
                        setLineItems(oppItems.map((i: any) => ({
                          productId: i.productId,
                          description: i.description,
                          quantity: Number(i.quantity || 1),
                          unitPrice: Number(i.unitPrice || 0),
                          unitOfMeasure: i.unitOfMeasure || 'PCS',
                          discountPct: 0,
                          discountAmount: 0,
                          lineTotal: Number(i.lineTotal || 0),
                          isTaxable: true,
                          itemCode: i.itemCode,
                        })));
                        const subtotal = oppItems.reduce((s: number, i: any) => s + Number(i.lineTotal || 0), 0);
                        const vatAmount = subtotal * 0.05;
                        update.subtotal = subtotal;
                        update.vatAmount = vatAmount;
                        update.totalAmount = subtotal + vatAmount;
                      }
                    } catch {}
                  }
                  form.setFieldsValue(update);
                }
              }}>
              {opportunities.map((o: any) => (
                <Option key={o.opportunityId} value={o.opportunityId}>
                  {o.opportunityName} — {o.accountName || ''}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="quotationDate" label="Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}><Form.Item name="validUntil" label="Valid Until"><Input type="date" /></Form.Item></Col>
            <Col span={6}>
              <Form.Item name="status" label="Status">
                <Select>{Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}>{s}</Option>)}</Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currencyCode" label="Currency">
                <Select><Option value="OMR">OMR</Option><Option value="USD">USD</Option><Option value="EUR">EUR</Option><Option value="AED">AED</Option></Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="customerEmail" label="Customer Email"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="customerPhone" label="Phone"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="customerTrn" label="Tax Reg. No (TRN)"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="salesmanId" label="Salesman">
                <SalesmanSelect onChange={(id, name) => form.setFieldsValue({ salesmanId: id, salesmanName: name })} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="salesmanName" hidden><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="customerAddress" label="Address"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={6}>
              <Form.Item name="vatRate" label="VAT Rate">
                <Select onChange={v => calcTotals(lineItems, Number(v))}>
                  {vatRates.map((vr: any) => <Option key={vr.valueCode} value={Number(vr.metadata?.rate ?? 5)}>{vr.valueLabel}</Option>)}
                  {!vatRates.length && <><Option value={0}>No VAT (0%)</Option><Option value={5}>VAT 5%</Option></>}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="isInventory" label="Mode" valuePropName="checked">
                <Switch checkedChildren="Inventory" unCheckedChildren="Service" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Line Items</Divider>

          {/* Line Items Header */}
          <Row gutter={8} style={{ marginBottom: 8, fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>
            <Col span={1}>#</Col>
            <Col span={5}>Product</Col>
            <Col span={5}>Description</Col>
            <Col span={2}>UOM</Col>
            <Col span={2}>Qty</Col>
            <Col span={3}>Unit Price</Col>
            <Col span={2}>Disc%</Col>
            <Col span={3}>Total</Col>
            <Col span={1}></Col>
          </Row>

          {lineItems.map((item, idx) => (
            <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
              <Col span={1}><Text type="secondary">{idx + 1}</Text></Col>
              <Col span={5}>
                <Select showSearch placeholder="Select product" style={{ width: '100%' }} allowClear
                  value={item.productId}
                  onChange={v => updateLineItem(idx, 'productId', v)}
                  optionFilterProp="children">
                  {products.map(p => <Option key={p.productId} value={p.productId}>{p.productName}</Option>)}
                </Select>
              </Col>
              <Col span={5}>
                <Input value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} placeholder="Description" />
              </Col>
              <Col span={2}>
                <Input value={item.unitOfMeasure} onChange={e => updateLineItem(idx, 'unitOfMeasure', e.target.value)} />
              </Col>
              <Col span={2}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} value={item.quantity}
                  onChange={v => updateLineItem(idx, 'quantity', v)} />
              </Col>
              <Col span={3}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} value={item.unitPrice}
                  onChange={v => updateLineItem(idx, 'unitPrice', v)} />
              </Col>
              <Col span={2}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} value={item.discountPct}
                  onChange={v => updateLineItem(idx, 'discountPct', v)} />
              </Col>
              <Col span={3}>
                <Text strong style={{ color: '#52c41a' }}>{Number(item.lineTotal).toFixed(3)}</Text>
              </Col>
              <Col span={1}>
                <Button size="small" danger onClick={() => {
                  const updated = lineItems.filter((_, i) => i !== idx);
                  setLineItems(updated);
                  calcTotals(updated, Number(form.getFieldValue('vatRate') || 5));
                }}>×</Button>
              </Col>
            </Row>
          ))}

          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLineItems([...lineItems, defaultLineItem()])} style={{ marginBottom: 16 }}>
            Add Line Item
          </Button>

          {/* Totals */}
          <Row gutter={12} justify="end">
            <Col span={8}>
              <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
                <Row justify="space-between" style={{ marginBottom: 4 }}>
                  <Text>Subtotal:</Text>
                  <Form.Item name="subtotal" noStyle><Text strong>OMR {Number(form.getFieldValue('subtotal') || 0).toFixed(3)}</Text></Form.Item>
                </Row>
                <Row justify="space-between" style={{ marginBottom: 4 }}>
                  <Text>VAT ({form.getFieldValue('vatRate') || 5}%):</Text>
                  <Text strong>OMR {Number(form.getFieldValue('vatAmount') || 0).toFixed(3)}</Text>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between">
                  <Text strong style={{ fontSize: 15 }}>Total:</Text>
                  <Text strong style={{ fontSize: 15, color: '#52c41a' }}>OMR {Number(form.getFieldValue('totalAmount') || 0).toFixed(3)}</Text>
                </Row>
              </div>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes" style={{ marginTop: 12 }}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="termsConditions" label="Terms & Conditions"><Input.TextArea rows={2} /></Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {editRecord ? 'Save Changes' : 'Create Quotation'}
            </Button>
          </div>
        </Form>
      </Modal>
      <PDFModal open={pdfOpen} onClose={() => setPdfOpen(false)} docType="quotation" data={pdfData} />
    </div>
  );
}
