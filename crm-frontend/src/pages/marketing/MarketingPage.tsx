import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Tag, Space, Modal, Form, Typography,
  Row, Col, message, Statistic, Progress, Tabs, Avatar, Badge, Select, DatePicker,
} from 'antd';
import { PlusOutlined, SearchOutlined, CopyOutlined, BarChartOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#8c8c8c', SCHEDULED: '#1890ff', ACTIVE: '#52c41a', PAUSED: '#fa8c16', COMPLETED: '#722ed1',
};

const TYPE_COLORS: Record<string, string> = {
  EMAIL: '#1890ff', SMS: '#52c41a', SOCIAL: '#eb2f96', EVENT: '#fa8c16', WEBINAR: '#722ed1',
};

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [statsModal, setStatsModal] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/campaigns', { params: { page, limit: 20, search: search || undefined } });
      setCampaigns(r.data.data); setTotal(r.data.total);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openStats = async (campaign: any) => {
    setStatsModal(campaign);
    const r = await api.get(`/campaigns/${campaign.campaignId}/stats`);
    setStats(r.data);
  };

  const handleSave = async (values: any) => {
    try {
      if (selected) { await api.put(`/campaigns/${selected.campaignId}`, values); message.success('Campaign updated'); }
      else { await api.post('/campaigns', values); message.success('Campaign created'); }
      setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };

  const handleClone = async (campaignId: string) => {
    try {
      await api.post(`/campaigns/${campaignId}/clone`, {});
      message.success('Campaign cloned'); load();
    } catch { message.error('Clone failed'); }
  };

  const columns = [
    {
      title: 'Campaign', key: 'name',
      render: (_: any, r: any) => (
        <div style={{ cursor: 'pointer' }} onClick={() => { setSelected(r); form.setFieldsValue(r); setModalOpen(true); }}>
          <div style={{ fontWeight: 600 }}>{r.campaignName}</div>
          <Space style={{ marginTop: 4 }}>
            <Tag color={TYPE_COLORS[r.campaignTypeCode] || 'default'} style={{ borderRadius: 20, fontSize: 11 }}>{r.campaignTypeCode || 'EMAIL'}</Tag>
            {r.tags?.map((t: string) => <Tag key={t} style={{ borderRadius: 20, fontSize: 11 }}>{t}</Tag>)}
          </Space>
        </div>
      ),
    },
    {
      title: 'Status', dataIndex: 'statusCode',
      render: (v: string) => <Badge color={STATUS_COLORS[v || 'DRAFT']} text={v || 'DRAFT'} />,
    },
    {
      title: 'Period', key: 'period',
      render: (_: any, r: any) => r.startDate
        ? `${new Date(r.startDate).toLocaleDateString('en-GB')} — ${r.endDate ? new Date(r.endDate).toLocaleDateString('en-GB') : '...'}`
        : '—',
    },
    {
      title: 'Budget vs Spend', key: 'budget',
      render: (_: any, r: any) => r.budget ? (
        <div style={{ minWidth: 120 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <Text>OMR {Number(r.actualSpend).toLocaleString()}</Text>
            <Text type="secondary">/ {Number(r.budget).toLocaleString()}</Text>
          </div>
          <Progress percent={r.budget ? Math.min(100, Math.round((r.actualSpend / r.budget) * 100)) : 0}
            size="small" showInfo={false}
            strokeColor={r.actualSpend > r.budget ? '#ff4d4f' : '#1890ff'} />
        </div>
      ) : '—',
    },
    {
      title: 'Leads', key: 'leads',
      render: (_: any, r: any) => (
        <div>
          <Text strong style={{ color: '#52c41a' }}>{r.actualLeads}</Text>
          <Text type="secondary"> / {r.expectedLeads} expected</Text>
        </div>
      ),
    },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<BarChartOutlined />} onClick={() => openStats(r)} />
          <Button size="small" icon={<CopyOutlined />} onClick={() => handleClone(r.campaignId)} />
        </Space>
      ),
    },
  ];

  const engagementStats = stats ? [
    { label: 'Total', count: stats.total, color: '#1890ff' },
    { label: 'Sent', count: stats.stats?.find((s: any) => s.status === 'SENT')?.count || 0, color: '#722ed1' },
    { label: 'Opened', count: stats.stats?.find((s: any) => s.status === 'OPENED')?.count || 0, color: '#13c2c2' },
    { label: 'Clicked', count: stats.stats?.find((s: any) => s.status === 'CLICKED')?.count || 0, color: '#52c41a' },
    { label: 'Converted', count: stats.stats?.find((s: any) => s.status === 'CONVERTED')?.count || 0, color: '#fa8c16' },
  ] : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Marketing Campaigns</Title>
          <Text type="secondary">Plan, execute and measure marketing initiatives</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelected(null); form.resetFields(); setModalOpen(true); }}>
          New Campaign
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Search campaigns..."
            value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 300, borderRadius: 8 }} />
        </div>
        <Table dataSource={campaigns} columns={columns} rowKey="campaignId" loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>

      {/* Stats Modal */}
      <Modal
        title={`Campaign Stats — ${statsModal?.campaignName}`}
        open={!!statsModal} onCancel={() => { setStatsModal(null); setStats(null); }} footer={null} width={500}
      >
        {stats && (
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {engagementStats.map(s => (
              <Col span={8} key={s.label}>
                <Card style={{ borderRadius: 12, textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
                  <Statistic title={s.label} value={s.count} valueStyle={{ color: s.color, fontWeight: 700 }} />
                  {s.label !== 'Total' && stats.total > 0 && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {Math.round((s.count / stats.total) * 100)}%
                    </Text>
                  )}
                </Card>
              </Col>
            ))}
            <Col span={24}>
              <Progress
                percent={stats.total > 0 ? Math.round(((stats.stats?.find((s: any) => s.status === 'CONVERTED')?.count || 0) / stats.total) * 100) : 0}
                format={p => `${p}% Conversion`}
                strokeColor="linear-gradient(135deg, #52c41a, #1890ff)"
              />
            </Col>
          </Row>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal title={selected ? 'Edit Campaign' : 'New Campaign'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={620}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="campaignName" label="Campaign Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Q1 Email Outreach — Technology Sector" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="campaignTypeCode" label="Type" rules={[{ required: true }]}>
                <Select>
                  {Object.keys(TYPE_COLORS).map(t => <Option key={t} value={t}>{t}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="statusCode" label="Status" initialValue="DRAFT">
                <Select>
                  {Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="startDate" label="Start Date"><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="endDate" label="End Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="budget" label="Budget (OMR)"><Input type="number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="expectedLeads" label="Expected Leads"><Input type="number" /></Form.Item></Col>
          </Row>
          <Form.Item name="targetAudience" label="Target Audience"><Input placeholder="e.g. SMBs in Technology sector, Oman" /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="emailSubject" label="Email Subject (if email campaign)"><Input /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">{selected ? 'Save' : 'Create Campaign'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
