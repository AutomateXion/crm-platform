import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Input, Typography, Tag, Select, InputNumber, Button, message, Divider,
         Row, Col, Result, Empty } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, DeleteOutlined, SaveOutlined,
         CheckCircleFilled, WarningFilled, StopFilled } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use((c: any) => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const omr = (v: any) => `OMR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

const CREDIT: any = {
  OK:         { color: 'green',   icon: <CheckCircleFilled />, text: 'Credit OK' },
  NEAR_LIMIT: { color: 'gold',    icon: <WarningFilled />,     text: 'Near limit' },
  OVER_LIMIT: { color: 'volcano', icon: <WarningFilled />,     text: 'Over limit' },
  BLOCKED:    { color: 'red',     icon: <StopFilled />,        text: 'Credit blocked' },
};

const VAT_RATE = 5;

export default function QuickOrderPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [custLoading, setCustLoading] = useState(false);
  const [accountId, setAccountId] = useState<string | undefined>();
  const [customer, setCustomer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [prodTimer, setProdTimer] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([{ productId: undefined, description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const submitGuard = useRef(false);
  const [done, setDone] = useState<any>(null);

  const searchCustomers = useCallback((term: string) => {
    setCustLoading(true);
    sApi.get('/sales/field/customers', { params: { search: term || undefined, limit: 40 } })
      .then(r => setCustomers(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCustomers([]))
      .finally(() => setCustLoading(false));
  }, []);
  useEffect(() => { searchCustomers(''); }, [searchCustomers]);

  const onCustomer = (id: string) => {
    setAccountId(id);
    setCustomer(customers.find(c => c.accountId === id) || null);
  };

  const searchProducts = (term: string) => {
    if (prodTimer) clearTimeout(prodTimer);
    const t = setTimeout(() => {
      sApi.get('/sales/field/products', { params: { search: term || undefined, limit: 40 } })
        .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
        .catch(() => {});
    }, 300);
    setProdTimer(t);
  };
  useEffect(() => { searchProducts(''); }, []); // eslint-disable-line

  const setLineProduct = (idx: number, productId: string, opt: any) => {
    const u = [...lines];
    const price = Number(opt?.price) || 0;
    u[idx] = { ...u[idx], productId, description: opt?.label || '', unitPrice: price, lineTotal: Number(u[idx].quantity || 1) * price };
    setLines(u);
  };
  const setLineField = (idx: number, field: string, value: any) => {
    const u = [...lines];
    u[idx] = { ...u[idx], [field]: value };
    u[idx].lineTotal = Number(u[idx].quantity || 1) * Number(u[idx].unitPrice || 0);
    setLines(u);
  };
  const addLine = () => setLines([...lines, { productId: undefined, description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  const subtotal = lines.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
  const vatAmount = subtotal * (VAT_RATE / 100);
  const total = subtotal + vatAmount;

  const submit = async () => {
    if (submitGuard.current || saving) return;
    if (!accountId) { message.warning('Select a customer'); return; }
    const valid = lines.filter(l => l.productId && l.lineTotal > 0);
    if (!valid.length) { message.warning('Add at least one product line'); return; }
    setSaving(true); submitGuard.current = true;
    try {
      const r = await sApi.post('/sales/quotations', {
        customerName: customer?.accountName,
        accountId,
        quotationDate: new Date().toISOString().slice(0, 10),
        status: 'DRAFT', vatRate: VAT_RATE, subtotal, vatAmount, totalAmount: total,
        items: valid.map((l, i) => ({
          lineNumber: i + 1, productId: l.productId, description: l.description,
          quantity: Number(l.quantity || 1), unitPrice: Number(l.unitPrice || 0),
          lineTotal: Number(l.lineTotal || 0), unitOfMeasure: 'PCS', isTaxable: true,
        })),
        notes: notes ? `Quick Order — ${notes}` : 'Quick Order (field)',
      });
      setDone(r.data);
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Could not create order');
      submitGuard.current = false;
    } finally { setSaving(false); }
  };

  const reset = () => {
    submitGuard.current = false; setDone(null); setAccountId(undefined); setCustomer(null);
    setLines([{ productId: undefined, description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]); setNotes('');
  };

  if (done) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 12px' }}>
        <Result status="success" icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
          title="Order created"
          subTitle={`Order ${done.quotationNumber || ''} created as DRAFT for ${customer?.accountName}. The office will review and confirm it.`}
          extra={<Button type="primary" onClick={reset}>New order</Button>} />
      </div>
    );
  }

  const cr = customer ? (CREDIT[customer.creditStatus] || CREDIT.OK) : null;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}><ShoppingCartOutlined /> Quick Order</Title>
        <Text type="secondary">Place an order — saved as draft for office to confirm</Text>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Text strong>Customer</Text>
        <Select showSearch size="large" style={{ width: '100%', marginTop: 6 }} placeholder="Search customer…"
          filterOption={false} onSearch={searchCustomers} loading={custLoading} value={accountId} onChange={onCustomer}>
          {customers.map(c => <Option key={c.accountId} value={c.accountId}>{c.accountName}</Option>)}
        </Select>
        {customer && cr && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Tag icon={cr.icon} color={cr.color} style={{ margin: 0 }}>{cr.text}</Tag>
            {customer.outstanding > 0 && <Text type="secondary" style={{ fontSize: 12 }}>Outstanding: {omr(customer.outstanding)}</Text>}
            {customer.creditLimit > 0 && <Text type="secondary" style={{ fontSize: 12 }}>· Limit: {omr(customer.creditLimit)}</Text>}
          </div>
        )}
        {customer && (customer.creditStatus === 'BLOCKED' || customer.creditStatus === 'OVER_LIMIT') && (
          <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8, padding: 10, marginTop: 10 }}>
            <Text style={{ color: '#d46b08', fontSize: 12 }}>
              This customer is {customer.creditStatus === 'BLOCKED' ? 'credit blocked' : 'over their credit limit'}. You can still capture the order — the office will review credit before invoicing.
            </Text>
          </div>
        )}
      </Card>

      {accountId && (
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Text strong style={{ fontSize: 15 }}>Order items</Text>
          {lines.map((line, idx) => (
            <div key={idx} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 12, marginTop: 12 }}>
              <Select showSearch style={{ width: '100%', marginBottom: 8 }} size="large" placeholder="Search product…"
                filterOption={false} onSearch={searchProducts} value={line.productId || undefined}
                onChange={(v, opt: any) => setLineProduct(idx, v as string, opt)}>
                {products.map((p: any) => (
                  <Option key={p.productId} value={p.productId} label={p.productName} price={p.unitPrice}>
                    {p.productName} — {omr(p.unitPrice)}
                  </Option>
                ))}
              </Select>
              <Row gutter={8} align="middle">
                <Col span={7}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Qty</Text>
                  <InputNumber style={{ width: '100%' }} size="large" min={1} value={line.quantity} onChange={v => setLineField(idx, 'quantity', v)} />
                </Col>
                <Col span={9}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Unit price</Text>
                  <InputNumber style={{ width: '100%' }} size="large" min={0} step={0.001} value={line.unitPrice} onChange={v => setLineField(idx, 'unitPrice', v)} />
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Total</Text>
                  <div><Text strong style={{ color: '#52c41a', fontSize: 15 }}>{Number(line.lineTotal || 0).toFixed(3)}</Text></div>
                </Col>
                <Col span={2}>
                  {lines.length > 1 && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => removeLine(idx)} style={{ marginTop: 14 }} />}
                </Col>
              </Row>
            </div>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={addLine} style={{ marginTop: 4 }}>Add product</Button>

          <Divider style={{ margin: '16px 0 8px' }} />
          <Row justify="space-between"><Text type="secondary">Subtotal</Text><Text>{omr(subtotal)}</Text></Row>
          <Row justify="space-between"><Text type="secondary">VAT ({VAT_RATE}%)</Text><Text>{omr(vatAmount)}</Text></Row>
          <Row justify="space-between" style={{ marginTop: 4 }}><Text strong style={{ fontSize: 16 }}>Total</Text><Text strong style={{ fontSize: 16, color: '#0B2547' }}>{omr(total)}</Text></Row>

          <div style={{ marginTop: 12 }}>
            <Text strong>Notes</Text>
            <TextArea rows={2} style={{ marginTop: 6 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional — delivery instructions, PO ref, etc." />
          </div>

          <Button type="primary" size="large" block icon={<SaveOutlined />} loading={saving} onClick={submit} style={{ marginTop: 16, height: 48 }}>
            Create order (draft)
          </Button>
        </Card>
      )}

      {!accountId && <Empty description="Select a customer to start an order" style={{ marginTop: 40 }} />}
    </div>
  );
}
