import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Row, Col, Typography, message, Statistic, Tabs, Popconfirm, Badge, Alert, Progress, Divider } from 'antd';
import { PlusOutlined, StopOutlined, CheckCircleOutlined, UserOutlined, GlobalOutlined, SettingOutlined, DashboardOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const api = axios.create({ baseURL: '/api/v1' });
api.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const PLAN_COLOR: Record<string,string> = { STARTER:'blue', PROFESSIONAL:'green', ENTERPRISE:'gold', TRIAL:'orange' };

export default function SuperAdminPage() {
  const [dashboard, setDashboard] = useState<any>({});
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [health, setHealth] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [tenantModal, setTenantModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [tenantStats, setTenantStats] = useState<any>({});
  const [statsModal, setStatsModal] = useState(false);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [suspendForm] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashR, tenantsR, healthR, usersR] = await Promise.allSettled([
        api.get('/superadmin/dashboard'),
        api.get('/superadmin/tenants', { params: { search: search||undefined, plan: planFilter||undefined } }),
        api.get('/superadmin/system-health'),
        api.get('/superadmin/users', { params: { limit: 50 } }),
      ]);
      if (dashR.status === 'fulfilled') setDashboard(dashR.value.data);
      if (tenantsR.status === 'fulfilled') setTenants(tenantsR.value.data || []);
      if (healthR.status === 'fulfilled') setHealth(healthR.value.data);
      if (usersR.status === 'fulfilled') setUsers(usersR.value.data || []);
    } catch(e: any) {
      if (e.response?.status === 401) message.error('Super Admin access required');
    } finally { setLoading(false); }
  }, [search, planFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCreateTenant = async (values: any) => {
    setSaving(true);
    try {
      await api.post('/superadmin/tenants', values);
      message.success('Tenant created successfully!');
      setTenantModal(false); form.resetFields(); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleSuspend = async (values: any) => {
    try {
      await api.put(`/superadmin/tenants/${selectedTenant.tenantId}/suspend`, { reason: values.reason });
      message.success('Tenant suspended'); setSuspendModal(false); suspendForm.resetFields(); load();
    } catch { message.error('Failed'); }
  };

  const handleActivate = async (tenantId: string) => {
    try {
      await api.put(`/superadmin/tenants/${tenantId}/activate`);
      message.success('Tenant activated'); load();
    } catch { message.error('Failed'); }
  };

  const loadTenantStats = async (tenant: any) => {
    const r = await api.get(`/superadmin/tenants/${tenant.tenantId}/stats`);
    setTenantStats(r.data);
    setSelectedTenant(tenant);
    setStatsModal(true);
  };

  const toggleUser = async (userId: string) => {
    await api.put(`/superadmin/users/${userId}/toggle`);
    message.success('User status updated'); load();
  };

  const tenantColumns = [
    { title: 'Code', dataIndex: 'tenantCode', width: 80, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Company', dataIndex: 'companyName', render: (v: string, r: any) => (
      <Space direction="vertical" size={0}>
        <Text strong>{v}</Text>
        <Text type="secondary" style={{ fontSize: 11 }}>{r.email || ''}</Text>
      </Space>
    )},
    { title: 'Plan', dataIndex: 'subscriptionPlan', render: (v: string) => <Tag color={PLAN_COLOR[v]||'default'}>{v}</Tag> },
    { title: 'Status', dataIndex: 'isActive', render: (v: boolean, r: any) => (
      v ? <Badge status="success" text="Active" /> : <Badge status="error" text={`Suspended${r.suspensionReason ? ': '+r.suspensionReason.slice(0,20) : ''}`} />
    )},
    { title: 'Users', dataIndex: 'userCount', align: 'center' as const, render: (v: number, r: any) => `${v}/${r.maxUsers}` },
    { title: 'Invoices', dataIndex: 'invoiceCount', align: 'center' as const },
    { title: 'Created', dataIndex: 'createdAt', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: '', render: (_: any, r: any) => (
      <Space size={4}>
        <Button size="small" icon={<DashboardOutlined />} onClick={() => loadTenantStats(r)}>Stats</Button>
        {r.isActive ? (
          <Button size="small" danger icon={<StopOutlined />} onClick={() => { setSelectedTenant(r); setSuspendModal(true); }}>Suspend</Button>
        ) : (
          <Button size="small" style={{ color: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleActivate(r.tenantId)}>Activate</Button>
        )}
      </Space>
    )},
  ];

  const userColumns = [
    { title: 'Name', dataIndex: 'fullName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Tenant', dataIndex: 'tenantId', render: (v: string) => {
      const t = tenants.find(t => t.tenantId === v);
      return <Tag>{t?.tenantCode || v?.slice(0,8)}</Tag>;
    }},
    { title: 'Status', dataIndex: 'isActive', render: (v: boolean) => <Badge status={v?'success':'error'} text={v?'Active':'Inactive'} /> },
    { title: 'Last Login', dataIndex: 'lastLogin', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : 'Never' },
    { title: '', render: (_: any, r: any) => (
      <Button size="small" danger={r.isActive} onClick={() => toggleUser(r.userId)}>
        {r.isActive ? 'Deactivate' : 'Activate'}
      </Button>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>🛡️ Super Admin Portal</Title>
          <Text type="secondary">AutomateXion — SaaS Platform Management</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ subscriptionPlan: 'STARTER', maxUsers: 10, country: 'Oman' }); setTenantModal(true); }}>
            New Tenant
          </Button>
        </Space>
      </div>

      {/* System Health Banner */}
      <Alert type={health.status === 'healthy' ? 'success' : 'error'} showIcon
        message={`System Status: ${health.status?.toUpperCase() || 'Unknown'} | DB: ${health.database || 'Unknown'} | Uptime: ${Math.floor((health.uptime||0)/3600)}h ${Math.floor(((health.uptime||0)%3600)/60)}m | Node: ${health.nodeVersion || 'N/A'}`}
        style={{ marginBottom: 16, borderRadius: 10 }} />

      {/* KPI Cards */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={4}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff', textAlign: 'center' }}>
          <Statistic title="Total Tenants" value={dashboard.totalTenants || 0} valueStyle={{ color: '#1890ff', fontSize: 20 }} />
        </Card></Col>
        <Col span={4}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a', textAlign: 'center' }}>
          <Statistic title="Active Tenants" value={dashboard.activeTenants || 0} valueStyle={{ color: '#52c41a', fontSize: 20 }} />
        </Card></Col>
        <Col span={4}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #ff4d4f', textAlign: 'center' }}>
          <Statistic title="Suspended" value={dashboard.suspendedTenants || 0} valueStyle={{ color: '#ff4d4f', fontSize: 20 }} />
        </Card></Col>
        <Col span={4}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #722ed1', textAlign: 'center' }}>
          <Statistic title="Total Users" value={dashboard.totalUsers || 0} valueStyle={{ color: '#722ed1', fontSize: 20 }} />
        </Card></Col>
        <Col span={4}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #fa8c16', textAlign: 'center' }}>
          <Statistic title="Active Users" value={dashboard.activeUsers || 0} valueStyle={{ color: '#fa8c16', fontSize: 20 }} />
        </Card></Col>
        <Col span={4}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #13c2c2', textAlign: 'center' }}>
          <Statistic title="Total Invoices" value={dashboard.totalInvoices || 0} valueStyle={{ color: '#13c2c2', fontSize: 20 }} />
        </Card></Col>
      </Row>

      <Tabs defaultActiveKey="tenants" items={[
        {
          key: 'tenants', label: '🏢 Tenants',
          children: (
            <Card style={{ borderRadius: 12 }} size="small">
              <Row gutter={12} style={{ marginBottom: 12 }}>
                <Col span={8}><Input.Search placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} onSearch={load} /></Col>
                <Col span={4}>
                  <Select placeholder="Filter by plan" style={{ width: '100%' }} allowClear onChange={setPlanFilter}>
                    <Option value="STARTER">Starter</Option>
                    <Option value="PROFESSIONAL">Professional</Option>
                    <Option value="ENTERPRISE">Enterprise</Option>
                  </Select>
                </Col>
              </Row>
              <Table dataSource={tenants} columns={tenantColumns} rowKey="tenantId" loading={loading} size="small"
                pagination={{ pageSize: 10, showTotal: t => `${t} tenants` }}
                rowClassName={(r: any) => !r.isActive ? 'ant-table-row-warning' : ''} />
            </Card>
          )
        },
        {
          key: 'users', label: '👥 All Users',
          children: (
            <Card style={{ borderRadius: 12 }} size="small">
              <Table dataSource={users} columns={userColumns} rowKey="userId" loading={loading} size="small"
                pagination={{ pageSize: 15, showTotal: t => `${t} users` }} />
            </Card>
          )
        },
        {
          key: 'plans', label: '📊 Plan Distribution',
          children: (
            <Row gutter={12}>
              {Object.entries(dashboard.planCounts || {}).map(([plan, count]: any) => (
                <Col span={6} key={plan}>
                  <Card size="small" style={{ borderRadius: 12, borderTop: `3px solid ${PLAN_COLOR[plan]||'#1890ff'}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: PLAN_COLOR[plan]||'#1890ff' }}>{count}</div>
                    <div style={{ fontSize: 14, color: '#8c8c8c' }}>{plan}</div>
                    <Progress percent={Math.round((count/dashboard.totalTenants)*100)} size="small" strokeColor={PLAN_COLOR[plan]} showInfo={false} />
                  </Card>
                </Col>
              ))}
            </Row>
          )
        },
      ]} />

      {/* Create Tenant Modal */}
      <Modal title="Create New Tenant" open={tenantModal} onCancel={() => setTenantModal(false)} footer={null} width={640}>
        <Form form={form} layout="vertical" onFinish={handleCreateTenant} style={{ marginTop: 12 }}>
          <Divider>Company Details</Divider>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="tenantCode" label="Tenant Code" rules={[{required:true}]}><Input placeholder="e.g. ACME" style={{ textTransform: 'uppercase' }} /></Form.Item></Col>
            <Col span={16}><Form.Item name="companyName" label="Company Name" rules={[{required:true}]}><Input placeholder="ACME Trading LLC" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="email" label="Company Email"><Input placeholder="info@company.com" /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="Phone"><Input placeholder="+968 XXXX XXXX" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="subscriptionPlan" label="Plan"><Select><Option value="STARTER">Starter</Option><Option value="PROFESSIONAL">Professional</Option><Option value="ENTERPRISE">Enterprise</Option><Option value="TRIAL">Trial</Option></Select></Form.Item></Col>
            <Col span={8}><Form.Item name="maxUsers" label="Max Users"><Input type="number" /></Form.Item></Col>
            <Col span={8}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>
          </Row>
          <Divider>Admin User</Divider>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="adminEmail" label="Admin Email" rules={[{required:true}]}><Input placeholder="admin@company.com" /></Form.Item></Col>
            <Col span={12}><Form.Item name="adminName" label="Admin Name"><Input placeholder="Administrator" /></Form.Item></Col>
          </Row>
          <Form.Item name="adminPassword" label="Admin Password" rules={[{required:true}]}><Input.Password placeholder="Min 8 characters" /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setTenantModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} icon={<PlusOutlined />}>Create Tenant</Button>
          </div>
        </Form>
      </Modal>

      {/* Suspend Modal */}
      <Modal title={`Suspend: ${selectedTenant?.companyName}`} open={suspendModal} onCancel={() => setSuspendModal(false)} footer={null}>
        <Form form={suspendForm} layout="vertical" onFinish={handleSuspend} style={{ marginTop: 12 }}>
          <Alert type="warning" showIcon message="This will prevent users from logging into this tenant." style={{ marginBottom: 16 }} />
          <Form.Item name="reason" label="Suspension Reason" rules={[{required:true}]}><Input.TextArea rows={3} placeholder="e.g. Payment overdue, Terms violation..." /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setSuspendModal(false)}>Cancel</Button>
            <Button danger htmlType="submit" icon={<StopOutlined />}>Suspend Tenant</Button>
          </div>
        </Form>
      </Modal>

      {/* Tenant Stats Modal */}
      <Modal title={`Stats: ${selectedTenant?.companyName}`} open={statsModal} onCancel={() => setStatsModal(false)} footer={null}>
        <Row gutter={12} style={{ marginTop: 16 }}>
          <Col span={8}><Card size="small" style={{ textAlign: 'center', borderTop: '3px solid #1890ff' }}>
            <Statistic title="Users" value={tenantStats.userCount || 0} />
          </Card></Col>
          <Col span={8}><Card size="small" style={{ textAlign: 'center', borderTop: '3px solid #52c41a' }}>
            <Statistic title="Invoices" value={tenantStats.invoiceCount || 0} />
          </Card></Col>
          <Col span={8}><Card size="small" style={{ textAlign: 'center', borderTop: '3px solid #722ed1' }}>
            <Statistic title="Revenue (OMR)" value={Number(tenantStats.invoiceTotal || 0).toFixed(3)} />
          </Card></Col>
        </Row>
      </Modal>
    </div>
  );
}
