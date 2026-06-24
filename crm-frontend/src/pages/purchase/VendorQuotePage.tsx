import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Typography, Tag, Space, InputNumber, Input, Row, Col,
         Spin, Result, Alert, message, Divider } from 'antd';
import { SendOutlined, SaveOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Public, unauthenticated axios instance (no token interceptor)
const Pub = axios.create({ baseURL: '/sales-api' });

const NAVY = '#0B2547', BLUE = '#1A4D8F';

function getTokenFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('token') || '';
}

const omr = (v: any, ccy = 'OMR') =>
  `${ccy} ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

export default function VendorQuotePage() {
  const token = getTokenFromUrl();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfq, setRfq] = useState<any>(null);
  const [lines, setLines] = useState<Record<string, any>>({});
  const [header, setHeader] = useState<any>({ validityDays: undefined, paymentTerms: '', deliveryTerms: '', overallLeadDays: undefined, vendorNotes: '' });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [declined, setDeclined] = useState(false);

  const load = useCallback(async () => {
    if (!token) { setError('This link is missing its access token.'); setLoading(false); return; }
    setLoading(true);
    try {
      const r = await Pub.get(`/sales/public/rfq/${token}`);
      const d = r.data;
      setRfq(d);
      // seed line state from any existing quote
      const seed: Record<string, any> = {};
      (d.items || []).forEach((it: any) => {
        const ql = (d.quoteLines || []).find((q: any) => q.rfqItemId === it.rfqItemId);
        seed[it.rfqItemId] = {
          unitPrice: ql?.unitPrice != null ? Number(ql.unitPrice) : undefined,
          leadTimeDays: ql?.leadTimeDays ?? undefined,
          brandOffered: ql?.brandOffered ?? '',
          lineNotes: ql?.lineNotes ?? '',
        };
      });
      setLines(seed);
      if (d.quote) {
        setHeader({
          validityDays: d.quote.validityDays ?? undefined,
          paymentTerms: d.quote.paymentTerms ?? '',
          deliveryTerms: d.quote.deliveryTerms ?? '',
          overallLeadDays: d.quote.overallLeadDays ?? undefined,
          vendorNotes: d.quote.vendorNotes ?? '',
        });
        if (d.quote.isSubmitted) setSubmitted(true);
      }
      if (d.vendorStatus === 'DECLINED') setDeclined(true);
    } catch (e: any) {
      setError(e.response?.data?.message || 'This link is not valid or has expired.');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const setLine = (itemId: string, field: string, value: any) =>
    setLines(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));

  const buildPayload = () => ({
    ...header,
    lines: (rfq.items || []).map((it: any) => ({
      rfqItemId: it.rfqItemId,
      unitPrice: Number(lines[it.rfqItemId]?.unitPrice) || 0,
      leadTimeDays: lines[it.rfqItemId]?.leadTimeDays || null,
      brandOffered: lines[it.rfqItemId]?.brandOffered || null,
      lineNotes: lines[it.rfqItemId]?.lineNotes || null,
    })),
  });

  const grandTotal = (rfq?.items || []).reduce((s: number, it: any) =>
    s + (Number(lines[it.rfqItemId]?.unitPrice) || 0) * (Number(it.quantity) || 0), 0);

  const doSave = async () => {
    setSaving(true);
    try {
      await Pub.post(`/sales/public/rfq/${token}/quote`, buildPayload());
      message.success('Your quote has been saved. You can come back and edit it until the deadline.');
    } catch (e: any) { message.error(e.response?.data?.message || 'Could not save your quote.'); }
    finally { setSaving(false); }
  };

  const doSubmit = async () => {
    const anyPrice = (rfq.items || []).some((it: any) => Number(lines[it.rfqItemId]?.unitPrice) > 0);
    if (!anyPrice) { message.warning('Please enter at least one unit price before submitting.'); return; }
    setSubmitting(true);
    try {
      await Pub.post(`/sales/public/rfq/${token}/submit`, buildPayload());
      setSubmitted(true);
    } catch (e: any) { message.error(e.response?.data?.message || 'Could not submit your quote.'); }
    finally { setSubmitting(false); }
  };

  const doDecline = async () => {
    try { await Pub.post(`/sales/public/rfq/${token}/decline`, {}); setDeclined(true); }
    catch (e: any) { message.error(e.response?.data?.message || 'Could not record your response.'); }
  };

  // ── render states ──
  const shell = (children: React.ReactNode) => (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px 12px' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ color: NAVY, margin: 0 }}>Envoiso</Title>
          <Text type="secondary">Vendor Quotation Portal</Text>
        </div>
        {children}
      </div>
    </div>
  );

  if (loading) return shell(<div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>);
  if (error) return shell(<Result status="warning" title="Link not available" subTitle={error} />);
  if (declined) return shell(<Result status="info" title="Response recorded"
    subTitle="You have declined this request for quotation. Thank you for letting us know." />);
  if (submitted) return shell(<Result status="success" icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
    title="Quote submitted — thank you!"
    subTitle={`Your quotation for ${rfq.rfqNumber} has been received. You may still update it until the deadline by reloading this page.`}
    extra={<Button onClick={() => { setSubmitted(false); }}>Edit my quote</Button>} />);

  const closed = !rfq.isOpen;

  return shell(
    <>
      <Card style={{ borderRadius: 12, marginBottom: 16, borderTop: `3px solid ${BLUE}` }}>
        <Row justify="space-between" align="top">
          <Col>
            <Title level={4} style={{ margin: 0 }}>{rfq.title}</Title>
            <Text type="secondary">{rfq.rfqNumber}</Text>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <Text strong>Respond by</Text><br />
            <Text>{rfq.responseDeadline ? new Date(rfq.responseDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</Text>
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        <Text>Dear <strong>{rfq.vendorName}</strong>, please enter your best prices for the items below. All amounts in <strong>{rfq.currencyCode}</strong>.</Text>
        {rfq.description && <Paragraph style={{ marginTop: 8 }}>{rfq.description}</Paragraph>}
        {rfq.termsText && <Alert style={{ marginTop: 12 }} type="info" message="Terms & conditions" description={rfq.termsText} />}
        {closed && <Alert style={{ marginTop: 12 }} type="warning" showIcon
          message="This RFQ is closed" description={rfq.closedReason || 'No further quotes can be submitted.'} />}
      </Card>

      <Card style={{ borderRadius: 12, marginBottom: 16 }} title="Your prices">
        <Table dataSource={rfq.items} rowKey="rfqItemId" size="middle" pagination={false}
          columns={[
            { title: '#', dataIndex: 'lineNumber', width: 40 },
            { title: 'Item', dataIndex: 'description', render: (v: string, r: any) => (
              <Space direction="vertical" size={0}>
                <Text strong>{v}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{r.itemCode}{r.specNotes ? ` · ${r.specNotes}` : ''}</Text>
              </Space>) },
            { title: 'Qty', dataIndex: 'quantity', width: 90, align: 'right' as const,
              render: (v: any, r: any) => <Text>{Number(v).toFixed(2)} {r.unitOfMeasure}</Text> },
            { title: `Unit Price`, width: 130, render: (_: any, r: any) => (
              <InputNumber min={0} step={0.001} disabled={closed} style={{ width: '100%' }}
                value={lines[r.rfqItemId]?.unitPrice}
                onChange={val => setLine(r.rfqItemId, 'unitPrice', val)} placeholder="0.000" />) },
            { title: 'Lead (days)', width: 100, render: (_: any, r: any) => (
              <InputNumber min={0} disabled={closed} style={{ width: '100%' }}
                value={lines[r.rfqItemId]?.leadTimeDays}
                onChange={val => setLine(r.rfqItemId, 'leadTimeDays', val)} />) },
            { title: 'Brand / Make', width: 140, render: (_: any, r: any) => (
              <Input disabled={closed} value={lines[r.rfqItemId]?.brandOffered}
                onChange={e => setLine(r.rfqItemId, 'brandOffered', e.target.value)} placeholder="Optional" />) },
            { title: 'Line Total', align: 'right' as const, render: (_: any, r: any) => (
              <Text strong>{omr((Number(lines[r.rfqItemId]?.unitPrice) || 0) * Number(r.quantity), rfq.currencyCode)}</Text>) },
          ] as any} />
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Text strong style={{ fontSize: 16 }}>Quotation Total: {omr(grandTotal, rfq.currencyCode)}</Text>
        </div>
      </Card>

      <Card style={{ borderRadius: 12, marginBottom: 16 }} title="Quotation details">
        <Row gutter={16}>
          <Col xs={24} sm={8}><Text>Quote validity (days)</Text>
            <InputNumber min={0} disabled={closed} style={{ width: '100%', marginTop: 4 }}
              value={header.validityDays} onChange={v => setHeader({ ...header, validityDays: v })} /></Col>
          <Col xs={24} sm={8}><Text>Overall lead time (days)</Text>
            <InputNumber min={0} disabled={closed} style={{ width: '100%', marginTop: 4 }}
              value={header.overallLeadDays} onChange={v => setHeader({ ...header, overallLeadDays: v })} /></Col>
          <Col xs={24} sm={8}><Text>Payment terms</Text>
            <Input disabled={closed} style={{ marginTop: 4 }} value={header.paymentTerms}
              onChange={e => setHeader({ ...header, paymentTerms: e.target.value })} placeholder="e.g. 30 days credit" /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={8}><Text>Delivery terms</Text>
            <Input disabled={closed} style={{ marginTop: 4 }} value={header.deliveryTerms}
              onChange={e => setHeader({ ...header, deliveryTerms: e.target.value })} placeholder="e.g. DDP Muscat" /></Col>
          <Col xs={24} sm={16}><Text>Notes to buyer</Text>
            <TextArea rows={1} disabled={closed} style={{ marginTop: 4 }} value={header.vendorNotes}
              onChange={e => setHeader({ ...header, vendorNotes: e.target.value })} placeholder="Anything the buyer should know" /></Col>
        </Row>
      </Card>

      {!closed && (
        <Card style={{ borderRadius: 12 }}>
          <Row justify="space-between" align="middle">
            <Col><Button danger icon={<CloseCircleOutlined />} onClick={doDecline}>Decline to quote</Button></Col>
            <Col>
              <Space>
                <Button icon={<SaveOutlined />} loading={saving} onClick={doSave}>Save draft</Button>
                <Button type="primary" icon={<SendOutlined />} loading={submitting} onClick={doSubmit}>Submit quote</Button>
              </Space>
            </Col>
          </Row>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
            Your prices are private and visible only to the buyer. You can save a draft and return to edit until the deadline.
          </Text>
        </Card>
      )}
    </>
  );
}
