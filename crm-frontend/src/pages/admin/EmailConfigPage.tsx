import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, Switch, message, Divider, Row, Col, Typography, Alert, Space, Tag } from 'antd';
import { MailOutlined, SaveOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

export default function EmailConfigPage() {
  const [form] = Form.useForm();
  const [testForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    api.get('/tenants/email-config').then(r => {
      if (r.data) {
        setConfig(r.data);
        form.setFieldsValue({ ...r.data, password: '' });
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await api.post('/tenants/email-config', values);
      message.success('Email configuration saved successfully!');
      setConfig(values);
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleTest = async (values: any) => {
    setTesting(true);
    setTestResult(null);
    try {
      await api.post('/tenants/email-config/test', { to: values.testEmail });
      setTestResult({ success: true, message: `Test email sent to ${values.testEmail}` });
    } catch (e: any) {
      setTestResult({ success: false, message: e.response?.data?.message || 'Failed to send test email' });
    } finally { setTesting(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Email Configuration</Title>
          <Text type="secondary">One-time SMTP setup for sending quotations, invoices and notifications</Text>
        </div>
        {config?.host && <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: '4px 12px' }}>Configured</Tag>}
      </div>

      <Row gutter={24}>
        <Col span={14}>
          <Card title={<><MailOutlined /> SMTP Settings</>} style={{ borderRadius: 12 }}>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
              message="SMTP Configuration"
              description="Enter your email server details below. This will be used to send all outgoing emails from the system."
            />
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Row gutter={12}>
                <Col span={16}>
                  <Form.Item name="host" label="SMTP Host" rules={[{ required: true }]}>
                    <Input placeholder="smtp.gmail.com" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="port" label="Port" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="587" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="username" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                    <Input placeholder="noreply@yourcompany.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="password" label="Password / App Password">
                    <Input.Password placeholder="Leave blank to keep existing" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="fromName" label="From Name">
                    <Input placeholder="AutomateXion ERP" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="fromEmail" label="From Email">
                    <Input placeholder="noreply@yourcompany.com" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="secure" label="Use SSL/TLS" valuePropName="checked">
                    <Switch checkedChildren="SSL" unCheckedChildren="STARTTLS" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="replyTo" label="Reply-To Email">
                    <Input placeholder="sales@yourcompany.com" />
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <Form.Item name="signature" label="Email Signature">
                <Input.TextArea rows={4} placeholder="Best regards,&#10;AutomateXion Team&#10;Tel: +968 XXXX XXXX&#10;Email: info@yourcompany.com" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />} size="large">
                Save Email Configuration
              </Button>
            </Form>
          </Card>
        </Col>

        <Col span={10}>
          <Card title="Quick Setup Guides" style={{ borderRadius: 12, marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Gmail:</Text>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Host: smtp.gmail.com | Port: 587<br/>
                Use App Password (2FA required)<br/>
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">Get App Password →</a>
              </div>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ marginBottom: 16 }}>
              <Text strong>Outlook / Office 365:</Text>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Host: smtp.office365.com | Port: 587<br/>
                Use your Office 365 credentials
              </div>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <Text strong>Custom SMTP:</Text>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Contact your IT team for server details
              </div>
            </div>
          </Card>

          <Card title={<><SendOutlined /> Test Email</>} style={{ borderRadius: 12 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              Send a test email to verify your configuration is working correctly.
            </Text>
            <Form form={testForm} layout="vertical" onFinish={handleTest}>
              <Form.Item name="testEmail" label="Send Test To" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="your@email.com" />
              </Form.Item>
              <Button type="default" htmlType="submit" loading={testing} icon={<SendOutlined />} block>
                Send Test Email
              </Button>
            </Form>
            {testResult && (
              <Alert
                type={testResult.success ? 'success' : 'error'}
                message={testResult.message}
                showIcon
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
