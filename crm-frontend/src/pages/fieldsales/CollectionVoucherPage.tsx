import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Typography, Tag, Spin, Empty, Select, InputNumber, DatePicker,
         Button, Checkbox, message, Divider, Row, Col, Result } from 'antd';
import { DollarOutlined, SaveOutlined, CheckCircleFilled } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use((c: any) => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const omr = (v: any) => `OMR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
const fdate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CollectionVoucherPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [custLoading, setCustLoading] = useState(false);
  const [accountId, setAccountId] = useState<string | undefined>();
  const [customerName, setCustomerName] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invLoading, setInvLoading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [amount, setAmount] = useState<number | undefined>();
  const [method, setMethod] = useState('CASH');
  const [receiptDate, setReceiptDate] = useState<any>(dayjs());
  const [reference, setReference] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeBank, setChequeBank] = useState('');
  const [chequeDate, setChequeDate] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<any>(null);

  const searchCustomers = useCallback((term: string) => {
    setCustLoading(true);
    sApi.get('/sales/field/customers', { params: { search: term || undefined, limit: 40 } })
      .then(r => setCustomers(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCustomers([]))
      .finally(() => setCustLoading(false));
  }, []);
  useEffect(() => { searchCustomers(''); }, [searchCustomers]);

  const onCustomer = async (id: string) => {
    setAccountId(id);
    const c = customers.find(x => x.accountId === id);
    setCustomerName(c?.accountName || '');
    setSelectedInvoices([]); setAmount(undefined);
    setInvLoading(true);
    try {
      const r = await sApi.get(`/sales/field/customers/${id}/open-invoices`);
      setInvoices(Array.isArray(r.data) ? r.data : []);
    } catch { setInvoices([]); } finally { setInvLoading(false); }
  };

  const toggleInvoice = (invId: string) => {
    setSelectedInvoices(prev => {
      const next = prev.includes(invId) ? prev.filter(i => i !== invId) : [...prev, invId];
      // auto-fill amount to sum of selected balances
      const sum = invoices.filter(i => next.includes(i.invoiceId)).reduce((s, i) => s + i.balanceDue, 0);
      setAmount(sum > 0 ? Number(sum.toFixed(3)) : undefined);
      return next;
    });
  };

  const submit = async () => {
    if (!accountId) { message.warning('Select a customer'); return; }
    if (!amount || amount <= 0) { message.warning('Enter the amount collected'); return; }
    if (method === 'CHEQUE' && !chequeNumber) { message.warning('Enter the cheque number'); return; }
    setSaving(true);
    try {
      const dto: any = {
        accountId, customerName, amount,
        receiptDate: receiptDate ? receiptDate.format('YYYY-MM-DD') : undefined,
        paymentMethod: method,
        paymentReference: reference || undefined,
        currencyCode: 'OMR',
        notes: notes || undefined,
        invoiceIds: selectedInvoices.length ? selectedInvoices : undefined,
      };
      if (method === 'CHEQUE') {
        dto.chequeNumber = chequeNumber;
        dto.chequeBankName = chequeBank || undefined;
        dto.chequeDate = chequeDate ? chequeDate.format('YYYY-MM-DD') : undefined;
      }
      const r = await sApi.post('/sales/receipts', dto);
      setDone(r.data);
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Could not record collection');
    } finally { setSaving(false); }
  };

  const reset = () => {
    setDone(null); setAccountId(undefined); setCustomerName(''); setInvoices([]);
    setSelectedInvoices([]); setAmount(undefined); setMethod('CASH'); setReceiptDate(dayjs());
    setReference(''); setChequeNumber(''); setChequeBank(''); setChequeDate(null); setNotes('');
  };

  if (done) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 12px' }}>
        <Result status="success" icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
          title="Collection recorded"
          subTitle={`Receipt ${done.receiptNumber || ''} created as DRAFT for ${customerName}. The office will review and post it.`}
          extra={<Button type="primary" onClick={reset}>Record another</Button>} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}><DollarOutlined /> Record Collection</Title>
        <Text type="secondary">Log a payment received — saved as draft for office to post</Text>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Text strong>Customer</Text>
        <Select showSearch size="large" style={{ width: '100%', marginTop: 6 }} placeholder="Search customer…"
          filterOption={false} onSearch={searchCustomers} loading={custLoading}
          value={accountId} onChange={onCustomer}>
          {customers.map(c => <Option key={c.accountId} value={c.accountId}>{c.accountName}{c.outstanding > 0 ? ` — owes ${omr(c.outstanding)}` : ''}</Option>)}
        </Select>

        {accountId && (
          <>
            <Divider orientation="left" style={{ margin: '16px 0 8px' }}>Apply to invoices (optional)</Divider>
            {invLoading ? <Spin /> : invoices.length === 0 ? (
              <Text type="secondary">No open invoices — collection will be recorded on account.</Text>
            ) : (
              invoices.map(inv => (
                <div key={inv.invoiceId} onClick={() => toggleInvoice(inv.invoiceId)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
                  <Checkbox checked={selectedInvoices.includes(inv.invoiceId)} />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 13 }}>{inv.invoiceNumber}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>due {fdate(inv.dueDate)}</Text>
                  </div>
                  <Text strong>{omr(inv.balanceDue)}</Text>
                </div>
              ))
            )}
          </>
        )}
      </Card>

      {accountId && (
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Text strong>Amount</Text>
              <InputNumber size="large" min={0} step={0.001} style={{ width: '100%', marginTop: 6 }}
                value={amount} onChange={v => setAmount(v as number)} placeholder="0.000" prefix="OMR" />
            </Col>
            <Col span={12}>
              <Text strong>Method</Text>
              <Select size="large" style={{ width: '100%', marginTop: 6 }} value={method} onChange={setMethod}>
                <Option value="CASH">Cash</Option>
                <Option value="CHEQUE">Cheque</Option>
                <Option value="BANK_TRANSFER">Bank transfer</Option>
              </Select>
            </Col>
          </Row>
          <Row gutter={12} style={{ marginTop: 12 }}>
            <Col span={12}>
              <Text strong>Date</Text>
              <DatePicker size="large" style={{ width: '100%', marginTop: 6 }} value={receiptDate} onChange={setReceiptDate} />
            </Col>
            <Col span={12}>
              <Text strong>Reference</Text>
              <Input size="large" style={{ marginTop: 6 }} value={reference} onChange={e => setReference(e.target.value)} placeholder="Optional" />
            </Col>
          </Row>

          {method === 'CHEQUE' && (
            <Row gutter={12} style={{ marginTop: 12 }}>
              <Col span={8}><Text strong>Cheque #</Text><Input style={{ marginTop: 6 }} value={chequeNumber} onChange={e => setChequeNumber(e.target.value)} /></Col>
              <Col span={8}><Text strong>Bank</Text><Input style={{ marginTop: 6 }} value={chequeBank} onChange={e => setChequeBank(e.target.value)} /></Col>
              <Col span={8}><Text strong>Cheque date</Text><DatePicker style={{ width: '100%', marginTop: 6 }} value={chequeDate} onChange={setChequeDate} /></Col>
            </Row>
          )}

          <div style={{ marginTop: 12 }}>
            <Text strong>Notes</Text>
            <TextArea rows={2} style={{ marginTop: 6 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" />
          </div>

          <Button type="primary" size="large" block icon={<SaveOutlined />} loading={saving} onClick={submit} style={{ marginTop: 16, height: 48 }}>
            Record collection (draft)
          </Button>
        </Card>
      )}
    </div>
  );
}
