import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, message, Divider, Row, Col, Typography, Alert, Tag, Table, Space } from 'antd';
import { SaveOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';
import axios from 'axios';

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use((c: any) => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const { Title, Text } = Typography;
const { Option } = Select;

const ACCOUNT_MAPPINGS = [
  { key: 'accountsReceivable', label: 'Accounts Receivable', description: 'Customer balances — debited on sales invoice', type: 'ASSET', recommended: '1130', transaction: 'Sales Invoice (Dr)' },
  { key: 'salesRevenue', label: 'Sales Revenue', description: 'Revenue from sales — credited on sales invoice', type: 'REVENUE', recommended: '4100', transaction: 'Sales Invoice (Cr)' },
  { key: 'salesReturns', label: 'Sales Returns & Allowances', description: 'Returns from customers — debited on sales return', type: 'REVENUE', recommended: '4010', transaction: 'Sales Return (Dr)' },
  { key: 'vatPayable', label: 'VAT Payable (Output)', description: 'VAT collected from customers', type: 'LIABILITY', recommended: '2121', transaction: 'Sales Invoice (Cr)' },
  { key: 'vatReceivable', label: 'VAT Receivable (Input)', description: 'VAT paid to suppliers — recoverable', type: 'ASSET', recommended: '1160', transaction: 'Purchase Invoice (Dr)' },
  { key: 'accountsPayable', label: 'Accounts Payable', description: 'Supplier balances — credited on purchase invoice', type: 'LIABILITY', recommended: '2110', transaction: 'Purchase Invoice (Cr)' },
  { key: 'inventory', label: 'Inventory / Stock', description: 'Stock on hand value', type: 'ASSET', recommended: '1140', transaction: 'GRN (Dr), Sales (Cr)' },
  { key: 'grni', label: 'Goods Received Not Invoiced', description: 'Goods received but not yet invoiced', type: 'ASSET', recommended: '1141', transaction: 'GRN (Cr), Purchase Invoice (Dr)' },
  { key: 'cogs', label: 'Cost of Goods Sold', description: 'Cost of items sold', type: 'EXPENSE', recommended: '5001', transaction: 'Sales Invoice (Dr)' },
  { key: 'purchaseReturns', label: 'Purchase Returns', description: 'Returns to suppliers', type: 'EXPENSE', recommended: '5010', transaction: 'Purchase Return (Cr)' },
  { key: 'cashBank', label: 'Cash / Bank (Default)', description: 'Default cash/bank account for receipts and payments', type: 'ASSET', recommended: '1120', transaction: 'Receipt/Payment' },
];

const TYPE_COLOR: Record<string, string> = {
  ASSET: '#1890ff', LIABILITY: '#ff4d4f', REVENUE: '#52c41a', EXPENSE: '#fa8c16',
};

export default function AccountingConfigPage() {
  const [form] = Form.useForm();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    // Load chart of accounts
    sApi.get('/sales/chart-of-accounts').then(r => setAccounts(r.data || [])).catch(() => {});
    // Load existing config
    api.get('/tenants/accounting-config').then(r => {
      if (r.data) {
        setConfig(r.data);
        form.setFieldsValue(r.data);
      } else {
        // Set recommended defaults
        const defaults: any = {};
        ACCOUNT_MAPPINGS.forEach(m => { defaults[m.key] = m.recommended; });
        form.setFieldsValue(defaults);
      }
    }).catch(() => {
      // Set defaults even if config not found
      const defaults: any = {};
      ACCOUNT_MAPPINGS.forEach(m => { defaults[m.key] = m.recommended; });
      form.setFieldsValue(defaults);
    });
  }, []);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await api.post('/tenants/accounting-config', values);
      setConfig(values);
      message.success('Accounting configuration saved!');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const getAccountName = (code: string) => {
    const acc = accounts.find(a => a.accountCode === code);
    return acc ? `${acc.accountCode} — ${acc.accountName}` : code;
  };

  // Group accounts by type for select options
  const assetAccounts = accounts.filter(a => a.accountType === 'ASSET');
  const liabilityAccounts = accounts.filter(a => a.accountType === 'LIABILITY');
  const revenueAccounts = accounts.filter(a => a.accountType === 'REVENUE');
  const expenseAccounts = accounts.filter(a => a.accountType === 'EXPENSE');

  const getAccountsByType = (type: string) => {
    switch (type) {
      case 'ASSET': return assetAccounts;
      case 'LIABILITY': return liabilityAccounts;
      case 'REVENUE': return revenueAccounts;
      case 'EXPENSE': return expenseAccounts;
      default: return accounts;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}><SettingOutlined /> Accounting Configuration</Title>
          <Text type="secondary">Map system transactions to your Chart of Accounts — one-time setup</Text>
        </div>
        {Object.keys(config).length > 0 && (
          <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: '4px 12px' }}>Configured</Tag>
        )}
      </div>

      <Alert type="info" showIcon style={{ marginBottom: 24, borderRadius: 12 }}
        message="Standard Accounting Mappings"
        description="These mappings define which ledger accounts are used for automatic journal entries. Recommended accounts are pre-selected based on standard Omani accounting practice. Only change if your Chart of Accounts uses different codes." />

      <Row gutter={24}>
        <Col span={16}>
          <Card title="Account Mappings" style={{ borderRadius: 12 }} size="small">
            <Form form={form} layout="vertical" onFinish={handleSave}>

              <Divider orientation="left" style={{ color: '#1890ff' }}>💰 Sales Accounts</Divider>
              <Row gutter={12}>
                {ACCOUNT_MAPPINGS.filter(m => ['accountsReceivable', 'salesRevenue', 'salesReturns', 'vatPayable'].includes(m.key)).map(mapping => (
                  <Col span={12} key={mapping.key}>
                    <Form.Item name={mapping.key} label={
                      <Space>
                        <Text strong>{mapping.label}</Text>
                        <Tag color={TYPE_COLOR[mapping.type]} style={{ border: 'none', fontSize: 10 }}>{mapping.type}</Tag>
                      </Space>
                    }>
                      <Select showSearch optionFilterProp="children" placeholder={`Select ${mapping.label}...`}>
                        {getAccountsByType(mapping.type).map(a => (
                          <Option key={a.accountCode} value={a.accountCode}>
                            {a.accountCode} — {a.accountName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: -16, marginBottom: 12 }}>
                      📌 {mapping.transaction} | {mapping.description}
                    </Text>
                  </Col>
                ))}
              </Row>

              <Divider orientation="left" style={{ color: '#2E6DA4' }}>🛒 Purchase Accounts</Divider>
              <Row gutter={12}>
                {ACCOUNT_MAPPINGS.filter(m => ['accountsPayable', 'vatReceivable', 'purchaseReturns', 'grni'].includes(m.key)).map(mapping => (
                  <Col span={12} key={mapping.key}>
                    <Form.Item name={mapping.key} label={
                      <Space>
                        <Text strong>{mapping.label}</Text>
                        <Tag color={TYPE_COLOR[mapping.type]} style={{ border: 'none', fontSize: 10 }}>{mapping.type}</Tag>
                      </Space>
                    }>
                      <Select showSearch optionFilterProp="children" placeholder={`Select ${mapping.label}...`}>
                        {getAccountsByType(mapping.type).map(a => (
                          <Option key={a.accountCode} value={a.accountCode}>
                            {a.accountCode} — {a.accountName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: -16, marginBottom: 12 }}>
                      📌 {mapping.transaction} | {mapping.description}
                    </Text>
                  </Col>
                ))}
              </Row>

              <Divider orientation="left" style={{ color: '#52c41a' }}>📦 Inventory & Other</Divider>
              <Row gutter={12}>
                {ACCOUNT_MAPPINGS.filter(m => ['inventory', 'cogs', 'cashBank'].includes(m.key)).map(mapping => (
                  <Col span={12} key={mapping.key}>
                    <Form.Item name={mapping.key} label={
                      <Space>
                        <Text strong>{mapping.label}</Text>
                        <Tag color={TYPE_COLOR[mapping.type]} style={{ border: 'none', fontSize: 10 }}>{mapping.type}</Tag>
                      </Space>
                    }>
                      <Select showSearch optionFilterProp="children" placeholder={`Select ${mapping.label}...`}>
                        {getAccountsByType(mapping.type).map(a => (
                          <Option key={a.accountCode} value={a.accountCode}>
                            {a.accountCode} — {a.accountName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: -16, marginBottom: 12 }}>
                      📌 {mapping.transaction} | {mapping.description}
                    </Text>
                  </Col>
                ))}
              </Row>

              <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />} size="large" style={{ marginTop: 8 }}>
                Save Accounting Configuration
              </Button>
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="📋 Journal Entry Rules" style={{ borderRadius: 12, marginBottom: 16 }} size="small">
            {[
              { doc: 'Sales Invoice', entries: ['Dr: Accounts Receivable', 'Cr: Sales Revenue', 'Cr: VAT Payable'] },
              { doc: 'Receipt', entries: ['Dr: Cash/Bank', 'Cr: Accounts Receivable'] },
              { doc: 'Sales Return', entries: ['Dr: Sales Returns', 'Cr: Accounts Receivable', 'Dr: Inventory (if stock)', 'Cr: COGS (if stock)'] },
              { doc: 'GRN', entries: ['Dr: Inventory', 'Cr: GRNI'] },
              { doc: 'Purchase Invoice', entries: ['Dr: GRNI', 'Dr: VAT Receivable', 'Cr: Accounts Payable'] },
              { doc: 'Payment Voucher', entries: ['Dr: Accounts Payable', 'Cr: Cash/Bank'] },
              { doc: 'Purchase Return', entries: ['Dr: Accounts Payable', 'Cr: Purchase Returns', 'Cr: Inventory (if stock)'] },
            ].map(rule => (
              <div key={rule.doc} style={{ marginBottom: 12, padding: '8px 12px', background: '#fafafa', borderRadius: 8, borderLeft: '3px solid #1890ff' }}>
                <Text strong style={{ fontSize: 12 }}>{rule.doc}</Text>
                {rule.entries.map((e, i) => (
                  <div key={i} style={{ fontSize: 11, color: e.startsWith('Dr') ? '#ff4d4f' : '#52c41a', marginTop: 2 }}>{e}</div>
                ))}
              </div>
            ))}
          </Card>

          <Card title="📊 Current Mapping Summary" style={{ borderRadius: 12 }} size="small">
            {ACCOUNT_MAPPINGS.map(m => (
              <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
                <Text style={{ fontSize: 11 }}>{m.label}</Text>
                <Tag color={TYPE_COLOR[m.type]} style={{ border: 'none', fontSize: 10 }}>
                  {form.getFieldValue(m.key) || m.recommended}
                </Tag>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
