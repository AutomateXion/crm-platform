import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Tabs, Row, Col, Avatar, Drawer, Descriptions, Switch, Divider, Tooltip,
  List, message, Popconfirm, Empty, AutoComplete, Spin,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  GlobalOutlined, MailOutlined, PhoneOutlined, EyeOutlined,
  UserOutlined, BankOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import SalesmanSelect from '../../components/common/SalesmanSelect';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

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
      placeholder="Search and link to an existing account..."
      style={{ width: '100%' }}
      notFoundContent={loading ? <Spin size="small" /> : value?.length >= 2 ? <Text style={{ padding: 8, display: 'block', color: '#fa8c16' }}>No match found</Text> : null}
    />
  );
}

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'account' | 'contact'>('account');
  const [editRecord, setEditRecord] = useState<any>(null);
  const [view360, setView360] = useState<any>(null);
  const [form] = Form.useForm();

  const [contactAccountName, setContactAccountName] = useState('');
  const [contactAccountId, setContactAccountId] = useState<string | null>(null);
  const [contactAccountLinked, setContactAccountLinked] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/accounts', { params: { page, limit: 20, search: search || undefined } });
      setAccounts(r.data.data); setTotalAccounts(r.data.total);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/contacts', { params: { page, limit: 20, search: search || undefined } });
      setContacts(r.data.data); setTotalContacts(r.data.total);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { if (activeTab === 'accounts') loadAccounts(); else loadContacts(); }, [activeTab, loadAccounts, loadContacts]);

  const open360 = async (accountId: string) => {
    try {
      const r = await api.get(`/accounts/${accountId}/360`);
      setView360(r.data);
    } catch { message.error('Failed to load 360° view'); }
  };

  const handleSaveAccount = async (values: any) => {
    try {
      if (editRecord) { await api.put(`/accounts/${editRecord.accountId}`, values); message.success('Account updated'); }
      else { await api.post('/accounts', values); message.success('Account created'); }
      setModalOpen(false); loadAccounts();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };

  const handleSaveContact = async (values: any) => {
    try {
      const payload = { ...values, accountId: contactAccountId || null };
      if (editRecord) { await api.put(`/contacts/${editRecord.contactId}`, payload); message.success('Contact updated'); }
      else { await api.post('/contacts', payload); message.success('Contact created'); }
      setModalOpen(false); loadContacts();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };

  const openModal = (type: 'account' | 'contact', record?: any) => {
    setModalType(type); setEditRecord(record || null);
    form.resetFields();
    setContactAccountName(''); setContactAccountId(null); setContactAccountLinked(false);
    if (record) {
      form.setFieldsValue(record);
      if (type === 'contact' && record.accountName) {
        setContactAccountName(record.accountName);
        setContactAccountId(record.accountId || null);
        setContactAccountLinked(!!record.accountId);
      }
    }
    setModalOpen(true);
  };

  const accountColumns = [
    {
      title: 'Account', key: 'name',
      render: (_: any, r: any) => (
        <Space>
          <Avatar size={36} style={{ background: 'linear-gradient(135deg,#1890ff,#13c2c2)', fontWeight: 700 }}>
            {r.accountName?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{r.accountName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.phone || r.email || '—'}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Type', key: 'type', render: (_: any, r: any) => (
      <span>
        {r.isCustomer !== false && <Tag color="blue" style={{marginRight:2}}>Customer</Tag>}
        {r.isSupplier && <Tag color="green">Supplier</Tag>}
      </span>
    )},
    { title: 'City', dataIndex: 'city', render: (v: string) => v || '—' },
    { title: 'Salesman', dataIndex: 'salesmanName', render: (v: string) => v ? <Tag color="purple">{v}</Tag> : <Text type="secondary">—</Text> },


    { title: 'Phone', dataIndex: 'phone', render: (v: string) => v || '—' },
    { title: 'Email', dataIndex: 'email', render: (v: string) => v || '—' },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="360° View"><Button size="small" icon={<EyeOutlined />} type="primary" ghost onClick={() => open360(r.accountId)} /></Tooltip>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openModal('account', r)} /></Tooltip>
          <Popconfirm title="Delete account?" onConfirm={async () => { await api.delete(`/accounts/${r.accountId}`); loadAccounts(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const contactColumns = [
    {
      title: 'Contact', key: 'name',
      render: (_: any, r: any) => (
        <Space>
          <Avatar size={36} style={{ background: 'linear-gradient(135deg,#722ed1,#eb2f96)', fontWeight: 700 }}>
            {r.firstName?.[0]}{r.lastName?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.jobTitle || '—'}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Account', dataIndex: 'accountName', render: (v: string) => v ? <Space size={4}><BankOutlined style={{ color: '#1890ff' }} />{v}</Space> : '—' },
    { title: 'Email', dataIndex: 'email', render: (v: string) => v ? <a href={`mailto:${v}`}><MailOutlined /> {v}</a> : '—' },
    { title: 'Phone', dataIndex: 'phone', render: (v: string) => v || '—' },
    { title: 'Do Not Contact', dataIndex: 'doNotContact', render: (v: boolean) => v ? <Tag color="red">DNC</Tag> : <Tag color="green">OK</Tag> },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openModal('contact', r)} /></Tooltip>
          <Popconfirm title="Delete contact?" onConfirm={async () => { await api.delete(`/contacts/${r.contactId}`); loadContacts(); }}>
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
          <Title level={4} style={{ margin: 0 }}>Contacts & Accounts</Title>
          <Text type="secondary">Manage your companies and people</Text>
        </div>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => openModal('account')} style={{ borderRadius: 8 }}>New Account</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('contact')} style={{ borderRadius: 8 }}>New Contact</Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Tabs activeKey={activeTab} onChange={k => { setActiveTab(k); setPage(1); setSearch(''); }}
          tabBarExtraContent={
            <Input prefix={<SearchOutlined />} placeholder="Search..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 220, borderRadius: 8 }} />
          }
        >
          <TabPane tab={<span><BankOutlined /> Accounts ({totalAccounts})</span>} key="accounts">
            <Table dataSource={accounts} columns={accountColumns} rowKey="accountId" loading={loading} size="middle"
              pagination={{ current: page, total: totalAccounts, pageSize: 20, onChange: setPage }} />
          </TabPane>
          <TabPane tab={<span><UserOutlined /> Contacts ({totalContacts})</span>} key="contacts">
            <Table dataSource={contacts} columns={contactColumns} rowKey="contactId" loading={loading} size="middle"
              pagination={{ current: page, total: totalContacts, pageSize: 20, onChange: setPage }} />
          </TabPane>
        </Tabs>
      </Card>

      <Drawer
        title={view360 ? `360° View — ${view360.account?.accountName}` : ''}
        open={!!view360} onClose={() => setView360(null)} width={640}
      >
        {view360 && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Phone">{view360.account.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{view360.account.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Website">{view360.account.website || '—'}</Descriptions.Item>
              <Descriptions.Item label="City">{view360.account.city || '—'}</Descriptions.Item>
            </Descriptions>
            <Title level={5}>Contacts ({view360.totals.contacts})</Title>
            <List dataSource={view360.contacts} size="small"
              renderItem={(c: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar size={32} style={{ background: '#722ed1' }}>{c.firstName?.[0]}</Avatar>}
                    title={`${c.firstName} ${c.lastName}`}
                    description={c.jobTitle || c.email}
                  />
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="No contacts" /> }}
            />
            <Title level={5} style={{ marginTop: 20 }}>Notes ({view360.totals.notes})</Title>
            <List dataSource={view360.notes} size="small"
              renderItem={(n: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text style={{ fontSize: 13 }}>{n.noteText}</Text>}
                    description={new Date(n.createdAt).toLocaleString()}
                  />
                  {n.isPinned && <Tag color="gold">📌 Pinned</Tag>}
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="No notes" /> }}
            />
          </>
        )}
      </Drawer>

      <Modal
        title={`${editRecord ? 'Edit' : 'New'} ${modalType === 'account' ? 'Account' : 'Contact'}`}
        open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={720} style={{ top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={modalType === 'account' ? handleSaveAccount : handleSaveContact} style={{ marginTop: 16 }}>
          {modalType === 'account' ? (
            <>
              <Row gutter={12}>
                <Col span={14}><Form.Item name="accountName" label="Account Name" rules={[{ required: true }]}><Input placeholder="Company name" /></Form.Item></Col>
                <Col span={10}><Form.Item name="accountCode" label="Account Code"><Input placeholder="e.g. ACC-001" /></Form.Item></Col>
              </Row>
              <Row gutter={12}>
                <Col span={6}><Form.Item name="isCustomer" label="Is Customer" valuePropName="checked" initialValue={true}><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
                <Col span={6}><Form.Item name="isSupplier" label="Is Supplier" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
                <Col span={12}><Form.Item name="trn" label="TRN"><Input placeholder="Tax Reg. No." /></Form.Item></Col>
              </Row>
              <Divider style={{margin:'8px 0'}}>Contact Details</Divider>
              <Row gutter={12}>
                <Col span={12}><Form.Item name="phone" label="Phone"><Input placeholder="+968 xxx" /></Form.Item></Col>
                <Col span={12}><Form.Item name="email" label="Email"><Input placeholder="info@company.com" /></Form.Item></Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}><Form.Item name="website" label="Website"><Input placeholder="https://company.com" /></Form.Item></Col>
                <Col span={12}><Form.Item name="contactPerson" label="Contact Person"><Input /></Form.Item></Col>
              </Row>
              <Divider style={{margin:'8px 0'}}>Address</Divider>
              <Form.Item name="addressLine1" label="Address Line 1"><Input placeholder="Street, building, area..." /></Form.Item>
              <Form.Item name="addressLine2" label="Address Line 2"><Input placeholder="Floor, suite..." /></Form.Item>
              <Row gutter={12}>
                <Col span={8}><Form.Item name="city" label="City"><Input placeholder="Muscat" /></Form.Item></Col>
                <Col span={8}><Form.Item name="state" label="State"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="poBox" label="P.O. Box"><Input /></Form.Item></Col>
              </Row>
              <Divider style={{margin:'8px 0'}}>Financial & Banking</Divider>
              <Row gutter={12}>
                <Col span={8}><Form.Item name="creditLimit" label="Credit Limit (OMR)"><Input type="number" /></Form.Item></Col>
                <Col span={8}><Form.Item name="creditPeriodDays" label="Credit Period (Days)"><Input type="number" placeholder="e.g. 30" /></Form.Item></Col>
                <Col span={8}><Form.Item name="paymentTerms" label="Payment Terms"><Input placeholder="Net 30" /></Form.Item></Col>
                <Col span={8}><Form.Item name="currencyCode" label="Currency"><Select defaultValue="OMR"><Select.Option value="OMR">OMR</Select.Option><Select.Option value="USD">USD</Select.Option></Select></Form.Item></Col>
              </Row>
              <Row gutter={12}>
                <Col span={8}><Form.Item name="bankName" label="Bank"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="bankAccount" label="Account No."><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="bankIban" label="IBAN"><Input /></Form.Item></Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="salesmanId" label="Assigned Salesman">
                    <SalesmanSelect onChange={(id, name) => form.setFieldsValue({ salesmanId: id, salesmanName: name })} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="salesmanName" hidden><Input /></Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="locationName" label="Location Name"><Input placeholder="Branch / Area name" /></Form.Item>
                </Col>
              </Row>
              <Form.Item name="description" label="Notes"><Input.TextArea rows={2} /></Form.Item>
            </>
          ) : (
            <>
              <Row gutter={12}>
                <Col span={12}><Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
              </Row>

              <div style={{ background: '#f0f5ff', border: '1px solid #d6e4ff', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong style={{ color: '#1890ff' }}><BankOutlined /> Account (Company)</Text>
                  {contactAccountLinked
                    ? <Tag color="blue" icon={<CheckCircleOutlined />}>Linked</Tag>
                    : contactAccountName ? <Tag color="orange">Not linked</Tag> : null}
                </div>
                <AccountSearch
                  value={contactAccountName}
                  onChange={(v: string) => {
                    setContactAccountName(v);
                    if (!v) { setContactAccountId(null); setContactAccountLinked(false); }
                  }}
                  onSelect={(opt: any) => {
                    setContactAccountName(opt.value);
                    setContactAccountId(opt.accountId);
                    setContactAccountLinked(true);
                    message.success(`Linked to: ${opt.value}`);
                  }}
                />
              </div>

              <Row gutter={12}>
                <Col span={12}><Form.Item name="jobTitle" label="Job Title"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}><Form.Item name="phone" label="Phone"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="mobile" label="Mobile"><Input /></Form.Item></Col>
              </Row>
              <Form.Item name="description" label="Notes"><Input.TextArea rows={2} /></Form.Item>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
