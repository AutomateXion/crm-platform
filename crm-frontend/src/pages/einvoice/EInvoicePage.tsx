import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Switch, Row, Col, Typography, message, Statistic, Tabs, Alert, Tooltip, Badge } from 'antd';
import { SettingOutlined, SendOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileTextOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const STATUS_COLOR: Record<string,string> = {
  PENDING: 'orange', SUBMITTED: 'blue', ACKNOWLEDGED: 'cyan', CLEARED: 'green', REJECTED: 'red'
};
const STATUS_ICON: Record<string,any> = {
  PENDING: <ClockCircleOutlined />, SUBMITTED: <SendOutlined />,
  ACKNOWLEDGED: <CheckCircleOutlined />, CLEARED: <CheckCircleOutlined />, REJECTED: <CloseCircleOutlined />
};

export default function EInvoicePage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [xmlModal, setXmlModal] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [xmlValidation, setXmlValidation] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subR, setR] = await Promise.allSettled([
        sApi.get('/einvoice/submissions'),
        sApi.get('/einvoice/settings'),
      ]);
      if (subR.status === 'fulfilled') {
        const data = subR.value.data.data || [];
        setSubmissions(data);
        // Calculate stats
        setStats({
          total: data.length,
          pending: data.filter((s:any) => s.submission_status === 'PENDING').length,
          cleared: data.filter((s:any) => s.submission_status === 'CLEARED').length,
          rejected: data.filter((s:any) => s.submission_status === 'REJECTED').length,
        });
      }
      if (setR.status === 'fulfilled') {
        setSettings(setR.value.data);
        form.setFieldsValue(setR.value.data);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveSettings = async (values: any) => {
    setSaving(true);
    try {
      await sApi.put('/einvoice/settings', values);
      message.success('E-Invoice settings saved!');
      setSettingsModal(false); load();
    } catch { message.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const viewXML = async (invoiceId: string) => {
    try {
      const r = await sApi.get(`/einvoice/invoice/${invoiceId}/xml`);
      setXmlContent(r.data.xml);
      setXmlValidation(r.data.validation);
      setXmlModal(true);
    } catch { message.error('Failed to generate XML'); }
  };

  const downloadXML = (invoiceId: string, invoiceNumber: string) => {
    const token = localStorage.getItem('accessToken');
    const link = document.createElement('a');
    link.href = `/sales-api/einvoice/invoice/${invoiceId}/download`;
    link.setAttribute('download', `${invoiceNumber}.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitInvoice = async (invoiceId: string) => {
    try {
      const r = await sApi.post(`/einvoice/invoice/${invoiceId}/submit`);
      if (r.data.success) { message.success('Invoice submitted successfully!'); load(); }
      else message.error(r.data.message || 'Submission failed');
    } catch { message.error('Failed to submit'); }
  };

  const columns = [
    { title: 'Invoice #', dataIndex: 'invoice_number', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'UUID', dataIndex: 'invoice_uuid', render: (v: string) => <Text copyable style={{ fontSize: 11 }}>{v?.slice(0,16)}...</Text> },
    { title: 'Type', dataIndex: 'transaction_type', render: (v: string) => <Tag color={v==='B2B'?'purple':'cyan'}>{v}</Tag> },
    { title: 'Status', dataIndex: 'submission_status', render: (v: string) => (
      <Tag color={STATUS_COLOR[v]||'default'} icon={STATUS_ICON[v]}>{v}</Tag>
    )},
    { title: 'Submitted', dataIndex: 'submitted_at', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—' },
    { title: 'Cleared', dataIndex: 'cleared_at', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—' },
    { title: 'OTA Ref', dataIndex: 'ota_reference', render: (v: string) => v || '—' },
    { title: '', render: (_: any, r: any) => (
      <Space size={4}>
        <Tooltip title="View XML"><Button size="small" icon={<FileTextOutlined />} onClick={() => viewXML(r.invoice_id)} /></Tooltip>
        <Tooltip title="Download XML"><Button size="small" icon={<DownloadOutlined />} onClick={() => downloadXML(r.invoice_id, r.invoice_number)} /></Tooltip>
        {r.submission_status === 'PENDING' && (
          <Tooltip title="Submit to ASP">
            <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => submitInvoice(r.invoice_id)}>Submit</Button>
          </Tooltip>
        )}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>E-Invoicing (Fawtara)</Title>
          <Text type="secondary">Oman OTA compliant electronic invoicing — Peppol BIS 3.0 / UBL 2.1</Text>
        </div>
        <Space>
          <Button icon={<SettingOutlined />} onClick={() => setSettingsModal(true)}>ASP Settings</Button>
        </Space>
      </div>

      {/* Status Banner */}
      {!settings.isEnabled ? (
        <Alert type="warning" showIcon icon={<SafetyCertificateOutlined />} style={{ marginBottom: 16, borderRadius: 10 }}
          message="E-Invoicing is not yet configured"
          description="Set up your Accredited Service Provider (ASP) credentials to enable automatic submission to OTA. Go live: August 2026."
          action={<Button size="small" onClick={() => setSettingsModal(true)}>Configure Now</Button>} />
      ) : (
        <Alert type="success" showIcon icon={<SafetyCertificateOutlined />} style={{ marginBottom: 16, borderRadius: 10 }}
          message={`E-Invoicing Active${settings.testMode ? ' (Test Mode)' : ' (Production)'}`}
          description={`Connected to: ${settings.aspName || 'ASP'} | Auto-submit: ${settings.autoSubmit ? 'Enabled' : 'Disabled'}`} />
      )}

      {/* KPI Cards */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff', textAlign: 'center' }}>
          <Statistic title="Total Submissions" value={stats.total || 0} valueStyle={{ color: '#1890ff', fontSize: 20 }} />
        </Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #fa8c16', textAlign: 'center' }}>
          <Statistic title="Pending" value={stats.pending || 0} valueStyle={{ color: '#fa8c16', fontSize: 20 }} />
        </Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a', textAlign: 'center' }}>
          <Statistic title="Cleared" value={stats.cleared || 0} valueStyle={{ color: '#52c41a', fontSize: 20 }} />
        </Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f', textAlign: 'center' }}>
          <Statistic title="Rejected" value={stats.rejected || 0} valueStyle={{ color: '#ff4d4f', fontSize: 20 }} />
        </Card></Col>
      </Row>

      <Tabs defaultActiveKey="submissions" items={[
        {
          key: 'submissions', label: '📤 Submissions',
          children: (
            <Card style={{ borderRadius: 12 }} size="small">
              <Table dataSource={submissions} columns={columns} rowKey="submission_id"
                loading={loading} size="small" pagination={{ pageSize: 20, showTotal: t => `${t} submissions` }} />
            </Card>
          )
        },
        {
          key: 'guide', label: '📋 Implementation Guide',
          children: (
            <Card style={{ borderRadius: 12 }} size="small">
              <div style={{ maxWidth: 700 }}>
                <Title level={5}>🚀 Getting Started with Fawtara E-Invoicing</Title>
                <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <Text strong>Step 1 — Apply for ASP Accreditation</Text>
                  <div style={{ marginTop: 8, color: '#666' }}>
                    Email: <Text copyable>fawtara@taxoman.gov.om</Text><br />
                    Subject: Service Provider Accreditation Application<br />
                    Deadline: Before August 2026
                  </div>
                </div>
                <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <Text strong>Step 2 — Join OpenPeppol</Text>
                  <div style={{ marginTop: 8, color: '#666' }}>
                    Register at: <a href="https://openpeppol.org" target="_blank" rel="noreferrer">openpeppol.org</a><br />
                    Complete Peppol Access Point certification<br />
                    Use test bed for validation
                  </div>
                </div>
                <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <Text strong>Step 3 — Configure This System</Text>
                  <div style={{ marginTop: 8, color: '#666' }}>
                    Enter ASP endpoint URL and API key in settings<br />
                    Enable test mode first for validation<br />
                    Set auto-submit for real-time B2B submission
                  </div>
                </div>
                <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 16 }}>
                  <Text strong>Step 4 — Go Live (August 2026)</Text>
                  <div style={{ marginTop: 8, color: '#666' }}>
                    Switch from test to production mode<br />
                    B2B: Real-time submission<br />
                    B2C: Within 24 hours
                  </div>
                </div>
              </div>
            </Card>
          )
        },
      ]} />

      {/* Settings Modal */}
      <Modal title="E-Invoice Settings (ASP Configuration)" open={settingsModal}
        onCancel={() => setSettingsModal(false)} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSaveSettings} style={{ marginTop: 12 }}>
          <Alert type="info" showIcon message="Configure your Accredited Service Provider (ASP) details here." style={{ marginBottom: 16 }} />
          <Row gutter={12}>
            <Col span={12}><Form.Item name="isEnabled" label="Enable E-Invoicing" valuePropName="checked">
              <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
            </Form.Item></Col>
            <Col span={12}><Form.Item name="testMode" label="Test Mode" valuePropName="checked">
              <Switch checkedChildren="Test" unCheckedChildren="Production" />
            </Form.Item></Col>
          </Row>
          <Form.Item name="aspName" label="ASP Name"><Input placeholder="e.g. Peppol Access Point Provider" /></Form.Item>
          <Form.Item name="aspEndpoint" label="ASP API Endpoint"><Input placeholder="https://asp-provider.com/api/einvoice" /></Form.Item>
          <Form.Item name="aspApiKey" label="ASP API Key"><Input.Password placeholder="Your ASP API key" /></Form.Item>
          <Form.Item name="sellerUuid" label="Seller UUID (from OTA)"><Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></Form.Item>
          <Form.Item name="peppolParticipantId" label="Peppol Participant ID"><Input placeholder="0195:OMxxxxxxxxxx" /></Form.Item>
          <Form.Item name="autoSubmit" label="Auto-Submit on Invoice Creation" valuePropName="checked">
            <Switch checkedChildren="Auto" unCheckedChildren="Manual" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setSettingsModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} icon={<SettingOutlined />}>Save Settings</Button>
          </div>
        </Form>
      </Modal>

      {/* XML Preview Modal */}
      <Modal title="UBL 2.1 XML Invoice" open={xmlModal} onCancel={() => setXmlModal(false)}
        footer={null} width="80vw" style={{ top: 20 }}>
        {xmlValidation && (
          <Alert type={xmlValidation.valid ? 'success' : 'error'} showIcon style={{ marginBottom: 12 }}
            message={xmlValidation.valid ? '✅ Valid UBL 2.1 XML — Peppol BIS 3.0 Compliant' : `❌ Validation Errors: ${xmlValidation.errors?.join(', ')}`} />
        )}
        <TextArea value={xmlContent} rows={20} style={{ fontFamily: 'monospace', fontSize: 12 }} readOnly />
      </Modal>
    </div>
  );
}
