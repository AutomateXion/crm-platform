import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Card, Row, Col, Switch, Typography,
  message, Divider, Tag, Space, Upload, Avatar,
} from 'antd';
import { SaveOutlined, UploadOutlined, GlobalOutlined } from '@ant-design/icons';
import { tenantsApi } from '../../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';

const { Title, Text } = Typography;

const ALL_MODULES = [
  { code: 'contacts',     name: 'Contacts & Accounts',   core: false, color: '#1890ff' },
  { code: 'leads',        name: 'Leads & Pipeline',       core: false, color: '#13c2c2' },
  { code: 'sales',        name: 'Sales & Opportunities',  core: false, color: '#52c41a' },
  { code: 'activities',   name: 'Activities & Calendar',  core: false, color: '#fa8c16' },
  { code: 'support',      name: 'Customer Support',       core: false, color: '#ff4d4f' },
  { code: 'marketing',    name: 'Marketing Campaigns',    core: false, color: '#eb2f96' },
  { code: 'reports',      name: 'Reports & Analytics',    core: false, color: '#faad14' },
  { code: 'documents',    name: 'Document Management',    core: false, color: '#8c8c8c' },
  { code: 'integrations', name: 'Integration Hub',        core: false, color: '#2f54eb' },
];

export default function TenantSettingsPage() {
  const [form] = Form.useForm();
  const [tenant, setTenant] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeModules, setActiveModules] = useState<string[]>([]);

  useEffect(() => {
    tenantsApi.getMyTenant().then(r => {
      setTenant(r.data);
      form.setFieldsValue(r.data);
      setActiveModules(r.data.activeModules || []);
    }).catch(() => message.error('Failed to load settings'));
  }, []);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await tenantsApi.updateTenant(values);
      await tenantsApi.updateModules(activeModules);
      message.success('Settings saved successfully');
    } catch { message.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const toggleModule = (code: string, enabled: boolean) => {
    setActiveModules(prev => enabled ? [...prev, code] : prev.filter(m => m !== code));
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Tenant Settings</Title>
        <Text type="secondary">Configure your company profile, preferences and active modules</Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={16}>
          {/* Company Profile */}
          <Col xs={24} lg={16}>
            <Card title="Company Profile" style={{ borderRadius: 12, marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="companyName" label="Company Name" rules={[{ required: true }]}>
                    <Input placeholder="Acme Corporation" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="domain" label="Domain">
                    <Input placeholder="company.com" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
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
                <Col span={8}>
                  <Form.Item name="currencyCode" label="Currency">
                    <Input placeholder="OMR" maxLength={3} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="primaryColor" label="Brand Color">
                    <Input placeholder="#1890ff" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="language" label="Default Language">
                    <Input placeholder="en" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Subscription Info */}
          <Col xs={24} lg={8}>
            <Card title="Subscription" style={{ borderRadius: 12, marginBottom: 16 }}>
              {tenant && (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Plan</Text>
                    <Tag color="blue" style={{ borderRadius: 20 }}>{tenant.subscriptionPlan}</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Max Users</Text>
                    <Text strong>{tenant.maxUsers}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Tenant Code</Text>
                    <Tag style={{ fontFamily: 'monospace' }}>{tenant.tenantCode}</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Status</Text>
                    <Tag color={tenant.isActive ? 'success' : 'error'}>{tenant.isActive ? 'Active' : 'Inactive'}</Tag>
                  </div>
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        {/* Active Modules */}
        <Card title="Active Modules" style={{ borderRadius: 12, marginBottom: 16 }}
          extra={<Text type="secondary" style={{ fontSize: 12 }}>Core module is always active and cannot be disabled</Text>}
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{
                padding: '14px 16px', borderRadius: 10,
                border: '2px solid #722ed1', background: '#f9f0ff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <Text strong style={{ color: '#722ed1' }}>Core Platform</Text>
                  <div style={{ fontSize: 11, color: '#bfbfbf' }}>Auth, Users, Permissions, Masters</div>
                </div>
                <Tag color="purple">Always On</Tag>
              </div>
            </Col>
            {ALL_MODULES.map(mod => {
              const active = activeModules.includes(mod.code);
              return (
                <Col xs={24} sm={12} md={8} key={mod.code}>
                  <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    border: `2px solid ${active ? mod.color : '#e8e8e8'}`,
                    background: active ? `${mod.color}12` : '#fafafa',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s', cursor: 'pointer',
                  }}
                    onClick={() => toggleModule(mod.code, !active)}
                  >
                    <div>
                      <Text strong style={{ color: active ? mod.color : '#595959' }}>{mod.name}</Text>
                    </div>
                    <Switch
                      checked={active} size="small"
                      style={{ background: active ? mod.color : undefined }}
                      onChange={(v) => { toggleModule(mod.code, v); }}
                      onClick={(_, e) => e.stopPropagation()}
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />} size="large" style={{ borderRadius: 10, paddingInline: 32 }}>
            Save All Settings
          </Button>
        </div>
      </Form>
    </div>
  );
}
