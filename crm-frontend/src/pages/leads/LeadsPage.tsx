import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Tooltip, Avatar, Badge,
  Progress, Popconfirm, Divider, Alert, AutoComplete, Spin,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  SwapOutlined, FunnelPlotOutlined, TableOutlined, BankOutlined,
  UserOutlined, LinkOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  NEW: '#1890ff', CONTACTED: '#13c2c2', QUALIFIED: '#52c41a',
  PROPOSAL: '#fa8c16', DISQUALIFIED: '#ff4d4f', CONVERTED: '#2E6DA4',
};

function AccountSearch({ value, onChange, onSelect }: any) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<any>(null);

  const doSearch = async (text: string) => {
    if (!text || text.length < 2) { setOptions([]); return; }
    setLoading(true);
    try {
      const r = await api.get('/accounts', { params: { search: text, limit: 8 } });
      setOptions((r.data.data || []).map((a: any) => ({
        value: a.accountName,
        accountId: a.accountId,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <BankOutlined style={{ color: '#1890ff' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.accountName}</div>
                {a.phone && <div style={{ fontSize: 11, color: '#8c8c8c' }}>{a.phone}</div>}
              </div>
            </Space>
            <Tag color="blue" style={{ fontSize: 10 }}>Existing</Tag>
          </div>
        ),
      })));
    } catch {} finally { setLoading(false); }
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onChange={(v) => { onChange(v); clearTimeout(timer.current); timer.current = setTimeout(() => doSearch(v), 300); }}
      onSelect={(v, opt) => { onChange(v); if (onSelect) onSelect(opt); }}
      placeholder="Search existing accounts or type a new company name..."
      style={{ width: '100%' }}
      notFoundContent={loading ? <Spin size="small" /> : value?.length >= 2 ? <Text style={{ padding: 8, display: 'block', color: '#fa8c16' }}>No match — will create new account</Text> : null}
    />
  );
}

function ContactSearch({ value, onChange, onSelect, accountId }: any) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<any>(null);

  const doSearch = async (text: string) => {
    if (!text || text.length < 2) { setOptions([]); return; }
    setLoading(true);
    try {
      const params: any = { search: text, limit: 8 };
      if (accountId) params.accountId = accountId;
      const r = await api.get('/contacts', { params });
      setOptions((r.data.data || []).map((c: any) => ({
        value: `${c.firstName} ${c.lastName}`.trim(),
        contactId: c.contactId,
        email: c.email,
        mobile: c.mobile,
        jobTitle: c.jobTitle,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Avatar size={28} style={{ background: '#2E6DA4', fontSize: 11 }}>
                {c.firstName?.[0]}{c.lastName?.[0]}
              </Avatar>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.firstName} {c.lastName}</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{c.jobTitle || c.email || ''}</div>
              </div>
            </Space>
            <Tag color="purple" style={{ fontSize: 10 }}>Existing</Tag>
          </div>
        ),
      })));
    } catch {} finally { setLoading(false); }
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onChange={(v) => { onChange(v); clearTimeout(timer.current); timer.current = setTimeout(() => doSearch(v), 300); }}
      onSelect={(v, opt) => { onChange(v); if (onSelect) onSelect(opt); }}
      placeholder="Search existing contacts or type a new person name..."
      style={{ width: '100%' }}
      notFoundContent={loading ? <Spin size="small" /> : value?.length >= 2 ? <Text style={{ padding: 8, display: 'block', color: '#fa8c16' }}>No match — will create new contact</Text> : null}
    />
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<any>(null);
  const [convertModal, setConvertModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [convertForm] = Form.useForm();

  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [accountLinked, setAccountLinked] = useState(false);
  const [contactLinked, setContactLinked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/leads', { params: { page, limit: 20, search: search || undefined } });
      setLeads(r.data.data || []); setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    form.resetFields();
    setEditLead(null);
    setAccountName(''); setContactName('');
    setSelectedAccountId(null); setSelectedContactId(null);
    setAccountLinked(false); setContactLinked(false);
  };

  const openCreate = () => { reset(); setModalOpen(true); };

  const openEdit = (lead: any) => {
    reset();
    setEditLead(lead);
    setAccountName(lead.companyName || '');
    setContactName([lead.firstName, lead.lastName].filter(Boolean).join(' '));
    if (lead.accountId) { setSelectedAccountId(lead.accountId); setAccountLinked(true); }
    if (lead.contactId) { setSelectedContactId(lead.contactId); setContactLinked(true); }
    form.setFieldsValue({ ...lead, leadStatusCode: lead.leadStatusCode || 'NEW' });
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      let accountId = selectedAccountId;
      let contactId = selectedContactId;

      if (accountName && !accountId) {
        const r = await api.post('/accounts', {
          accountName,
          phone: values.phone || '',
          email: values.email || '',
        });
        accountId = r.data.accountId;
        message.info(`New account "${accountName}" created`);
      }

      if (contactName && !contactId) {
        const parts = contactName.trim().split(' ');
        const r = await api.post('/contacts', {
          firstName: parts[0] || contactName,
          lastName: parts.slice(1).join(' ') || '',
          email: values.email || '',
          mobile: values.phone || '',
          jobTitle: values.jobTitle || '',
          accountId: accountId || null,
        });
        contactId = r.data.contactId;
        message.info(`New contact "${contactName}" created`);
      }

      const payload = {
        firstName: contactName ? contactName.split(' ')[0] : '',
        lastName: contactName ? contactName.split(' ').slice(1).join(' ') : '',
        companyName: accountName,
        jobTitle: values.jobTitle || '',
        email: values.email || '',
        phone: values.phone || '',
        estimatedValue: values.estimatedValue || null,
        city: values.city || '',
        description: values.description || '',
        leadStatusCode: values.leadStatusCode || 'NEW',
        accountId: accountId || null,
        contactId: contactId || null,
      };

      if (editLead) {
        await api.put(`/leads/${editLead.leadId}`, payload);
        message.success('Lead updated successfully');
      } else {
        await api.post('/leads', payload);
        message.success('Lead created successfully');
      }

      setModalOpen(false); reset(); load();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleConvert = async (values: any) => {
    try {
      // Step 1: Resolve or create Account
      let accountId = convertModal.accountId;
      if (!accountId && values.accountName) {
        const r = await api.post('/accounts', { accountName: values.accountName });
        accountId = r.data.accountId;
      }

      // Step 2: Resolve or create Contact
      let contactId = convertModal.contactId;
      if (!contactId) {
        const r = await api.post('/contacts', {
          firstName: convertModal.firstName || '',
          lastName: convertModal.lastName || '',
          email: convertModal.email || '',
          mobile: convertModal.phone || '',
          jobTitle: convertModal.jobTitle || '',
          accountId: accountId || null,
        });
        contactId = r.data.contactId;
      }

      // Step 3: Create the Opportunity in the Sales pipeline
      const oppRes = await api.post('/opportunities', {
        opportunityName: values.opportunityName,
        accountId: accountId || null,
        contactId: contactId || null,
        dealValue: values.dealValue || convertModal.estimatedValue || 0,
        stage: 'QUALIFICATION',
        leadId: convertModal.leadId,
        sourceLeadRef: convertModal.leadNumber || null,
      });
      const opportunityId = oppRes.data.opportunityId;

      // Step 4: Mark the lead as converted with all linked IDs
      await api.patch(`/leads/${convertModal.leadId}`, {
        converted: true,
        convertedAccountId: accountId,
        convertedContactId: contactId,
        convertedOpportunityId: opportunityId,
        leadStatusCode: 'CONVERTED',
      });

      message.success('Lead converted — Opportunity created in Sales pipeline!');
      setConvertModal(null); convertForm.resetFields(); load();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Conversion failed');
    }
  };

  const columns = [
    {
      title: 'Lead', key: 'lead',
      render: (_: any, r: any) => (
        <Space>
          <Avatar size={36} style={{ background: STATUS_COLORS[r.leadStatusCode || 'NEW'], fontWeight: 700 }}>
            {r.firstName?.[0] || r.companyName?.[0] || '?'}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>{r.companyName || '—'}</Text>
              {r.accountId && <Tag color="blue" style={{ fontSize: 10, borderRadius: 10, padding: '0 5px' }}><LinkOutlined /> Linked</Tag>}
            </Space>
          </div>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', render: (v: string) => v || '—' },
    { title: 'Phone', dataIndex: 'phone', render: (v: string) => v || '—' },
    { title: 'Est. Value', dataIndex: 'estimatedValue', render: (v: number) => v ? `OMR ${Number(v).toLocaleString()}` : '—' },
    {
      title: 'Status', dataIndex: 'leadStatusCode',
      render: (v: string) => <Tag color={STATUS_COLORS[v || 'NEW']} style={{ borderRadius: 20 }}>{v || 'NEW'}</Tag>,
    },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Tooltip title="Convert to Opportunity">
            <Button size="small" icon={<SwapOutlined />} type="primary" ghost
              onClick={() => {
                setConvertModal(r);
                convertForm.setFieldsValue({
                  accountName: r.companyName,
                  opportunityName: `${r.companyName || r.firstName} — Opportunity`,
                  dealValue: r.estimatedValue,
                });
              }} />
          </Tooltip>
          <Popconfirm title="Delete this lead?" onConfirm={async () => { await api.delete(`/leads/${r.leadId}`); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Leads & Pipeline</Title>
          <Text type="secondary">Track and qualify potential customers</Text>
        </div>
        <Space>
          <Button icon={viewMode === 'table' ? <FunnelPlotOutlined /> : <TableOutlined />}
            onClick={() => setViewMode(v => v === 'table' ? 'kanban' : 'table')}>
            {viewMode === 'table' ? 'Kanban View' : 'Table View'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
            New Lead
          </Button>
        </Space>
      </div>

      {viewMode === 'table' ? (
        <Card style={{ borderRadius: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <Input prefix={<SearchOutlined />} placeholder="Search leads..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              allowClear style={{ width: 300, borderRadius: 8 }} />
          </div>
          <Table dataSource={leads} columns={columns} rowKey="leadId" loading={loading} size="middle"
            pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: t => `${t} leads` }} />
        </Card>
      ) : (
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
          {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'DISQUALIFIED'].map(status => (
            <div key={status} style={{ minWidth: 280, flex: 1 }}>
              <div style={{ padding: '10px 14px', borderRadius: '10px 10px 0 0', background: STATUS_COLORS[status], color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{status}</Text>
                <Badge count={leads.filter(l => (l.leadStatusCode || 'NEW') === status).length} style={{ background: 'rgba(255,255,255,0.3)' }} />
              </div>
              <div style={{ background: '#f5f6fa', borderRadius: '0 0 10px 10px', padding: 8, minHeight: 200 }}>
                {leads.filter(l => (l.leadStatusCode || 'NEW') === status).map(lead => (
                  <Card key={lead.leadId} size="small" hoverable style={{ marginBottom: 8, borderRadius: 8 }} onClick={() => openEdit(lead)}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.firstName} {lead.lastName}</div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>{lead.companyName}</div>
                    {lead.accountId && <Tag color="blue" style={{ fontSize: 10, marginTop: 4 }}><LinkOutlined /> Linked to Account</Tag>}
                    {lead.estimatedValue && <div style={{ color: '#52c41a', fontWeight: 700, fontSize: 13, marginTop: 4 }}>OMR {Number(lead.estimatedValue).toLocaleString()}</div>}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={<Space>{editLead ? <EditOutlined /> : <PlusOutlined />} {editLead ? 'Edit Lead' : 'New Lead'}</Space>}
        open={modalOpen} onCancel={() => { setModalOpen(false); reset(); }}
        footer={null} width={640} style={{ top: 30 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <div style={{ background: '#f0f5ff', border: '1px solid #d6e4ff', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text strong style={{ color: '#1890ff' }}><BankOutlined /> Account (Company)</Text>
              {accountLinked
                ? <Tag color="blue" icon={<CheckCircleOutlined />}>Linked to existing account</Tag>
                : accountName ? <Tag color="orange">Will create new account</Tag> : null}
            </div>
            <AccountSearch
              value={accountName}
              onChange={(v: string) => { setAccountName(v); if (!v) { setSelectedAccountId(null); setAccountLinked(false); } }}
              onSelect={(opt: any) => { setSelectedAccountId(opt.accountId); setAccountLinked(true); message.success(`Linked: ${opt.value}`); }}
            />
          </div>

          <div style={{ background: '#f9f0ff', border: '1px solid #efdbff', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text strong style={{ color: '#2E6DA4' }}><UserOutlined /> Contact (Person)</Text>
              {contactLinked
                ? <Tag color="purple" icon={<CheckCircleOutlined />}>Linked to existing contact</Tag>
                : contactName ? <Tag color="orange">Will create new contact</Tag> : null}
            </div>
            <ContactSearch
              value={contactName}
              accountId={selectedAccountId}
              onChange={(v: string) => { setContactName(v); if (!v) { setSelectedContactId(null); setContactLinked(false); } }}
              onSelect={(opt: any) => {
                setSelectedContactId(opt.contactId); setContactLinked(true);
                form.setFieldsValue({ email: opt.email || form.getFieldValue('email'), phone: opt.mobile || form.getFieldValue('phone'), jobTitle: opt.jobTitle || form.getFieldValue('jobTitle') });
                message.success(`Linked: ${opt.value}`);
              }}
            />
          </div>

          <Divider style={{ margin: '10px 0' }} />

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="jobTitle" label="Job Title / Designation">
                <Input placeholder="CEO, IT Manager, etc." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="leadStatusCode" label="Lead Status" initialValue="NEW">
                <Select>
                  {['NEW','CONTACTED','QUALIFIED','PROPOSAL','DISQUALIFIED'].map(s => (
                    <Option key={s} value={s}><Tag color={STATUS_COLORS[s]} style={{ borderRadius: 20 }}>{s}</Tag></Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="email" label="Email Address"><Input placeholder="name@company.com" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone / Mobile"><Input placeholder="+968 xxxx xxxx" /></Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="estimatedValue" label="Estimated Value (OMR)"><Input type="number" placeholder="0.000" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="city" label="City"><Input placeholder="Muscat" /></Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Notes">
            <Input.TextArea rows={2} placeholder="Lead details, source, initial conversation notes..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} icon={editLead ? <EditOutlined /> : <PlusOutlined />}>
              {editLead ? 'Save Changes' : 'Create Lead'}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={<Space><SwapOutlined style={{ color: '#52c41a' }} />Convert Lead to Opportunity</Space>}
        open={!!convertModal} onCancel={() => setConvertModal(null)} footer={null} width={500}
      >
        <Form form={convertForm} layout="vertical" onFinish={handleConvert} style={{ marginTop: 16 }}>
          <Alert
            message="This will create an Account and Contact record from this lead and mark it as converted."
            type="success" showIcon style={{ marginBottom: 16, borderRadius: 8 }}
          />
          <Form.Item name="accountName" label="Account Name" rules={[{ required: true, message: 'Account name is required' }]}>
            <Input prefix={<BankOutlined />} placeholder="Company name" />
          </Form.Item>
          <Form.Item name="opportunityName" label="Opportunity Name" rules={[{ required: true }]}>
            <Input placeholder="Brief description of the opportunity" />
          </Form.Item>
          <Form.Item name="dealValue" label="Deal Value (OMR)">
            <Input type="number" prefix="OMR" placeholder="0.000" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setConvertModal(null)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<SwapOutlined />}>Convert Lead</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
