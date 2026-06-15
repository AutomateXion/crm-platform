import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, message, Row, Col, Typography, Divider, Upload, Avatar, Space, Tag, ColorPicker, Select } from 'antd';
import { SaveOutlined, UploadOutlined, GlobalOutlined, PhoneOutlined, MailOutlined, ShopOutlined, EnvironmentOutlined, BankOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

export default function CompanySettingsPage() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1890ff');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load logo from localStorage
    const savedLogo = localStorage.getItem('company_logo');
    if (savedLogo) setLogoUrl(savedLogo);
    
    api.get('/tenants/company-settings').then(r => {
      const d = r.data;
      form.setFieldsValue({
        companyName: d.companyName,
        addressLine1: d.addressLine1,
        addressLine2: d.addressLine2,
        city: d.city,
        country: d.country || 'Oman',
        phone: d.phone,
        email: d.email,
        website: d.website,
        trn: d.trn,
        poBox: d.poBox,
        fax: d.fax,
        currencyCode: d.currencyCode || 'OMR',
        timezone: d.timezone || 'Asia/Muscat',
        dateFormat: d.dateFormat || 'DD/MM/YYYY',
        language: d.language || 'en',
        primaryColor: d.primaryColor || '#1890ff',
      });
      setLogoUrl(d.logoUrl || '');
      setPrimaryColor(d.primaryColor || '#1890ff');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      // Store logo in localStorage (not in API to avoid size limits)
      if (logoUrl) localStorage.setItem('company_logo', logoUrl);
      else localStorage.removeItem('company_logo');
      
      // Send settings without large logo data
      await api.put('/tenants/company-settings', { ...values, primaryColor, logoUrl: logoUrl || '' });
      message.success('Company settings saved successfully!');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { message.error('Logo must be under 5MB'); return; }
    // Compress image before saving
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 400;
      let w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/png', 0.8);
      setLogoUrl(compressed);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Company Settings</Title>
        <Text type="secondary">Configure your company information used in reports, invoices and documents</Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          {/* Left Column */}
          <Col span={16}>
            <Card title={<><ShopOutlined /> Company Information</>} style={{ borderRadius: 12, marginBottom: 16 }} loading={loading}>
              <Row gutter={12}>
                <Col span={16}>
                  <Form.Item name="companyName" label="Company Name" rules={[{ required: true }]}>
                    <Input size="large" placeholder="My Company LLC" prefix={<ShopOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="trn" label="VAT TRN Number">
                    <Input placeholder="Tax Registration No." prefix={<BankOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="email" label="Company Email">
                    <Input placeholder="info@company.com" prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Phone Number">
                    <Input placeholder="+968 XXXX XXXX" prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="website" label="Website">
                    <Input placeholder="https://company.com" prefix={<GlobalOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="fax" label="Fax">
                    <Input placeholder="+968 XXXX XXXX" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<><EnvironmentOutlined /> Address</>} style={{ borderRadius: 12, marginBottom: 16 }}>
              <Form.Item name="addressLine1" label="Address Line 1">
                <Input placeholder="Street, Building, Area" prefix={<EnvironmentOutlined />} />
              </Form.Item>
              <Form.Item name="addressLine2" label="Address Line 2">
                <Input placeholder="Floor, Suite, Office No." />
              </Form.Item>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="city" label="City">
                    <Input placeholder="Muscat" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="poBox" label="P.O. Box">
                    <Input placeholder="123" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="country" label="Country">
                    <Input placeholder="Oman" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="🌍 Regional Settings" style={{ borderRadius: 12, marginBottom: 16 }}>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="currencyCode" label="Currency">
                    <Input placeholder="OMR" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="timezone" label="Timezone">
                    <Input placeholder="Asia/Muscat" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="dateFormat" label="Date Format">
                    <Input placeholder="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="costingMethod" label="Inventory Costing Method" tooltip="Method used to value stock issues and compute COGS (IFRS-compliant).">
                    <Select placeholder="Select costing method">
                      <Select.Option value="WEIGHTED_AVG">Weighted Average (AVCO)</Select.Option>
                      <Select.Option value="FIFO">FIFO (First-In First-Out)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Right Column */}
          <Col span={8}>
            <Card title="🖼️ Company Logo" style={{ borderRadius: 12, marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: 16 }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ maxWidth: 180, maxHeight: 120, objectFit: 'contain', marginBottom: 16, border: '1px solid #f0f0f0', borderRadius: 8, padding: 8 }} />
                ) : (
                  <div style={{ width: 180, height: 120, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px dashed #d9d9d9' }}>
                    <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                      <ShopOutlined style={{ fontSize: 32 }} />
                      <div style={{ fontSize: 12, marginTop: 8 }}>No logo uploaded</div>
                    </div>
                  </div>
                )}
                <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button icon={<UploadOutlined />} onClick={() => fileRef.current?.click()} block>
                    Upload Logo
                  </Button>
                  {logoUrl && <Button danger onClick={() => setLogoUrl('')} block>Remove Logo</Button>}
                </Space>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                  Recommended: PNG with transparent background, max 2MB
                </Text>
              </div>
            </Card>

            <Card title="🎨 Branding" style={{ borderRadius: 12, marginBottom: 16 }}>
              <Form.Item label="Primary Color">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    style={{ width: 48, height: 36, border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                  <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ flex: 1 }} placeholder="#1890ff" />
                </div>
              </Form.Item>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['#1890ff','#52c41a','#722ed1','#fa8c16','#eb2f96','#13c2c2','#f5222d','#2f54eb'].map(c => (
                  <div key={c} onClick={() => setPrimaryColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: primaryColor === c ? '3px solid #333' : '2px solid transparent' }} />
                ))}
              </div>
            </Card>

            {/* Preview Card */}
            <Card title="👁️ Document Preview" style={{ borderRadius: 12, marginBottom: 16 }} size="small">
              <div style={{ border: `1px solid #f0f0f0`, borderRadius: 8, padding: 12, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${primaryColor}`, paddingBottom: 8, marginBottom: 8 }}>
                  <div>
                    {logoUrl && <img src={logoUrl} alt="logo" style={{ height: 32, objectFit: 'contain', marginBottom: 4, display: 'block' }} />}
                    <div style={{ fontSize: 13, fontWeight: 700, color: primaryColor }}>{form.getFieldValue('companyName') || 'My Company'}</div>
                    <div style={{ fontSize: 9, color: '#666' }}>{form.getFieldValue('city') || 'Muscat'}, {form.getFieldValue('country') || 'Oman'}</div>
                    <div style={{ fontSize: 9, color: '#666' }}>{form.getFieldValue('phone') || '+968 XXXX XXXX'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primaryColor }}>TAX INVOICE</div>
                    <div style={{ fontSize: 9, color: '#888' }}>INV-2026-0001</div>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: '#999', textAlign: 'center' }}>Document preview</div>
              </div>
            </Card>

            <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />} size="large" block style={{ borderRadius: 12, height: 48 }}>
              Save Company Settings
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
