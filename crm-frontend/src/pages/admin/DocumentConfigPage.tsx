import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Select, Button, message, Divider, Row, Col, Typography, Input,
  InputNumber, Switch, Space, Tag, Spin, Alert,
} from 'antd';
import {
  SaveOutlined, FileTextOutlined, PrinterOutlined, MailOutlined,
  WhatsAppOutlined, FilePdfOutlined,
} from '@ant-design/icons';
import { documentConfigApi } from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// The 8 document types wired into the PDF system
const DOC_TYPES = [
  { value: 'quotation', label: 'Quotation' },
  { value: 'delivery-note', label: 'Delivery Note' },
  { value: 'invoice', label: 'Sales Invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'purchase-order', label: 'Purchase Order' },
  { value: 'grn', label: 'Goods Receipt Note' },
  { value: 'purchase-invoice', label: 'Purchase Invoice' },
  { value: 'payment-voucher', label: 'Payment Voucher' },
];

// Per-type list of toggleable PDF fields (label + key)
const FIELD_SETS: Record<string, { key: string; label: string }[]> = {
  'quotation': [
    { key: 'customerTrn', label: 'Customer TRN' }, { key: 'customerAddress', label: 'Customer Address' },
    { key: 'salesman', label: 'Salesman' }, { key: 'validUntil', label: 'Valid Until' },
    { key: 'discount', label: 'Discount Column' }, { key: 'vat', label: 'VAT' },
    { key: 'preparedBy', label: 'Prepared By' }, { key: 'notes', label: 'Notes' },
  ],
  'delivery-note': [
    { key: 'customerTrn', label: 'Customer TRN' }, { key: 'customerAddress', label: 'Customer Address' },
    { key: 'deliveryAddress', label: 'Delivery Address' }, { key: 'salesman', label: 'Salesman' },
    { key: 'deliveryDate', label: 'Delivery Date' }, { key: 'vat', label: 'VAT' },
    { key: 'receivedBy', label: 'Received By' }, { key: 'notes', label: 'Notes' },
  ],
  'invoice': [
    { key: 'customerTrn', label: 'Customer TRN' }, { key: 'customerAddress', label: 'Customer Address' },
    { key: 'dueDate', label: 'Due Date' }, { key: 'salesman', label: 'Salesman' },
    { key: 'discount', label: 'Discount Column' }, { key: 'vat', label: 'VAT' },
    { key: 'paymentTerms', label: 'Payment Terms' }, { key: 'notes', label: 'Notes' },
  ],
  'receipt': [
    { key: 'customerAddress', label: 'Customer Address' }, { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'reference', label: 'Reference' }, { key: 'bankName', label: 'Bank Name' },
    { key: 'notes', label: 'Notes' },
  ],
  'purchase-order': [
    { key: 'supplierTrn', label: 'Supplier TRN' }, { key: 'supplierAddress', label: 'Supplier Address' },
    { key: 'expectedDate', label: 'Expected Date' }, { key: 'discount', label: 'Discount Column' },
    { key: 'vat', label: 'VAT' }, { key: 'terms', label: 'Terms & Conditions' }, { key: 'notes', label: 'Notes' },
  ],
  'grn': [
    { key: 'supplierAddress', label: 'Supplier Address' }, { key: 'poRef', label: 'PO Reference' },
    { key: 'deliveryNoteRef', label: 'Supplier DN Ref' }, { key: 'receivedBy', label: 'Received By' },
    { key: 'notes', label: 'Notes' },
  ],
  'purchase-invoice': [
    { key: 'supplierTrn', label: 'Supplier TRN' }, { key: 'supplierInvoiceNo', label: 'Supplier Invoice No' },
    { key: 'dueDate', label: 'Due Date' }, { key: 'vat', label: 'VAT' }, { key: 'notes', label: 'Notes' },
  ],
  'payment-voucher': [
    { key: 'paymentMethod', label: 'Payment Method' }, { key: 'reference', label: 'Reference' },
    { key: 'bankName', label: 'Bank Name' }, { key: 'chequeNumber', label: 'Cheque Number' },
    { key: 'notes', label: 'Notes' },
  ],
};

const CHANNELS = [
  { key: 'print', label: 'Print', icon: <PrinterOutlined /> },
  { key: 'pdf', label: 'PDF Download', icon: <FilePdfOutlined /> },
  { key: 'email', label: 'Email', icon: <MailOutlined /> },
  { key: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppOutlined /> },
];

export default function DocumentConfigPage() {
  const [docType, setDocType] = useState('delivery-note');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState<any>(null);

  const load = useCallback(async (dt: string) => {
    setLoading(true);
    try {
      const r = await documentConfigApi.get(dt);
      const data = r.data || {};
      setCfg({
        termsText: data.termsText || '',
        headerNote: data.headerNote || '',
        footerNote: data.footerNote || '',
        fields: data.fields || {},
        itemsPerPage: data.itemsPerPage || 15,
        channels: data.channels || { print: true, pdf: true, email: false, whatsapp: false },
        showSignature: data.showSignature ?? true,
      });
    } catch {
      message.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(docType); }, [docType, load]);

  const fieldVisible = (key: string) => {
    // default to visible if not explicitly set false
    return cfg?.fields?.[key] !== false;
  };

  const setField = (key: string, visible: boolean) => {
    setCfg((c: any) => ({ ...c, fields: { ...c.fields, [key]: visible } }));
  };

  const setChannel = (key: string, on: boolean) => {
    setCfg((c: any) => ({ ...c, channels: { ...c.channels, [key]: on } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await documentConfigApi.save(docType, cfg);
      message.success('Configuration saved');
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const fields = FIELD_SETS[docType] || [];
  const currentLabel = DOC_TYPES.find((d) => d.value === docType)?.label || docType;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}><FileTextOutlined /> Document Configuration</Title>
          <Text type="secondary">Customise terms, fields, layout and delivery channels for each document type</Text>
        </div>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} disabled={!cfg} style={{ borderRadius: 8 }}>
          Save Configuration
        </Button>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space align="center">
          <Text strong>Document Type:</Text>
          <Select value={docType} onChange={setDocType} style={{ width: 260 }}>
            {DOC_TYPES.map((d) => <Option key={d.value} value={d.value}>{d.label}</Option>)}
          </Select>
          <Tag color="blue">{currentLabel}</Tag>
        </Space>
      </Card>

      {loading || !cfg ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : (
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Card title="Terms & Notes" style={{ borderRadius: 12, marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Terms &amp; Conditions (printed on {currentLabel})</Text>
              <TextArea
                rows={5}
                value={cfg.termsText}
                onChange={(e) => setCfg({ ...cfg, termsText: e.target.value })}
                placeholder={`Enter terms & conditions for ${currentLabel}...`}
                style={{ marginTop: 4, marginBottom: 16 }}
              />
              <Row gutter={12}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Header Note</Text>
                  <TextArea rows={2} value={cfg.headerNote} onChange={(e) => setCfg({ ...cfg, headerNote: e.target.value })} style={{ marginTop: 4 }} />
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Footer Note</Text>
                  <TextArea rows={2} value={cfg.footerNote} onChange={(e) => setCfg({ ...cfg, footerNote: e.target.value })} style={{ marginTop: 4 }} />
                </Col>
              </Row>
            </Card>

            <Card title="Field Visibility" style={{ borderRadius: 12, marginBottom: 16 }}>
              <Alert type="info" showIcon style={{ marginBottom: 12 }}
                message="Toggle which fields appear on the printed document. Items table is always shown." />
              <Row gutter={[12, 12]}>
                {fields.map((f) => (
                  <Col xs={12} sm={8} key={f.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#fafafa', borderRadius: 8 }}>
                      <Text style={{ fontSize: 13 }}>{f.label}</Text>
                      <Switch size="small" checked={fieldVisible(f.key)} onChange={(v) => setField(f.key, v)} />
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Layout" style={{ borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <Text strong>Items per page</Text>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>Line items before a page break</div>
                </div>
                <InputNumber min={5} max={50} value={cfg.itemsPerPage} onChange={(v) => setCfg({ ...cfg, itemsPerPage: v })} />
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Show signature block</Text>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>Signing area on the document</div>
                </div>
                <Switch checked={cfg.showSignature} onChange={(v) => setCfg({ ...cfg, showSignature: v })} />
              </div>
            </Card>

            <Card title="Delivery Channels" style={{ borderRadius: 12 }}>
              <Alert type="info" showIcon style={{ marginBottom: 12 }}
                message="Which sending options appear for this document. Email & WhatsApp require setup." />
              {CHANNELS.map((ch) => (
                <div key={ch.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <Space>
                    <span style={{ fontSize: 16, color: '#1890ff' }}>{ch.icon}</span>
                    <Text>{ch.label}</Text>
                  </Space>
                  <Switch checked={cfg.channels?.[ch.key] ?? false} onChange={(v) => setChannel(ch.key, v)} />
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
