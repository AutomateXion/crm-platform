import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form, Typography,
  Row, Col, message, Tooltip, Badge, Drawer, List, Avatar, Divider,
  Statistic, Rate, Timeline, Popconfirm, Alert,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, MessageOutlined, CheckCircleOutlined,
  ClockCircleOutlined, FireOutlined, LockOutlined, UnlockOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PRIORITY_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  CRITICAL: { color: '#ff4d4f', icon: <FireOutlined /> },
  HIGH:     { color: '#fa8c16', icon: <ClockCircleOutlined /> },
  MEDIUM:   { color: '#faad14', icon: <ClockCircleOutlined /> },
  LOW:      { color: '#52c41a', icon: <ClockCircleOutlined /> },
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#1890ff', IN_PROGRESS: '#fa8c16', PENDING_CUSTOMER: '#faad14',
  RESOLVED: '#52c41a', CLOSED: '#8c8c8c',
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>();
  const [priorityFilter, setPriorityFilter] = useState<string>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/tickets', {
        params: { page, limit: 20, search: search || undefined, statusId: statusFilter, priorityId: priorityFilter },
      });
      setTickets(r.data.data); setTotal(r.data.total);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/tickets/summary').then(r => setSummary(r.data)).catch(() => {});
  }, []);

  const openTicket = async (ticket: any) => {
    setSelectedTicket(ticket); setDrawerOpen(true);
    const r = await api.get(`/tickets/${ticket.ticketId}/comments`, { params: { internal: true } });
    setComments(r.data);
  };

  const handleCreate = async (values: any) => {
    try {
      await api.post('/tickets', values); message.success('Ticket created'); setCreateModal(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const r = await api.post(`/tickets/${selectedTicket.ticketId}/comments`, { commentText: newComment, isInternal });
      setComments(prev => [...prev, r.data]);
      setNewComment('');
      message.success(isInternal ? 'Internal note added' : 'Reply sent');
    } catch { message.error('Failed to add comment'); }
  };

  const handleStatusChange = async (ticketId: string, statusCode: string) => {
    try {
      await api.put(`/tickets/${ticketId}`, { statusCode });
      message.success('Status updated'); load();
    } catch { message.error('Failed'); }
  };

  const handleResolve = async () => {
    try {
      await api.patch(`/tickets/${selectedTicket.ticketId}/resolve`, { resolution: newComment });
      message.success('Ticket resolved'); setDrawerOpen(false); load();
    } catch { message.error('Failed'); }
  };

  const slaStatus = (ticket: any) => {
    if (ticket.slaBreached) return { color: '#ff4d4f', label: 'SLA Breached' };
    if (!ticket.slaDueAt) return null;
    const hoursLeft = (new Date(ticket.slaDueAt).getTime() - Date.now()) / 3600000;
    if (hoursLeft < 2) return { color: '#fa8c16', label: `${Math.max(0, Math.round(hoursLeft))}h left` };
    return { color: '#52c41a', label: dayjs(ticket.slaDueAt).fromNow(true) + ' left' };
  };

  const columns = [
    {
      title: 'Ticket', key: 'ticket',
      render: (_: any, r: any) => (
        <div style={{ cursor: 'pointer' }} onClick={() => openTicket(r)}>
          <div style={{ fontWeight: 600, color: '#1890ff' }}>{r.ticketNumber}</div>
          <div style={{ fontSize: 13 }}>{r.subject}</div>
        </div>
      ),
    },
    {
      title: 'Priority', dataIndex: 'priorityCode',
      render: (v: string) => {
        const cfg = PRIORITY_CONFIG[v || 'MEDIUM'];
        return <Tag color={cfg?.color} style={{ borderRadius: 20 }}>{cfg?.icon} {v || 'MEDIUM'}</Tag>;
      },
    },
    {
      title: 'Status', dataIndex: 'statusCode',
      render: (v: string) => <Badge color={STATUS_COLORS[v || 'OPEN']} text={v?.replace('_', ' ') || 'OPEN'} />,
    },
    {
      title: 'SLA', key: 'sla',
      render: (_: any, r: any) => {
        const s = slaStatus(r);
        if (!s) return '—';
        return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11 }}>{s.label}</Tag>;
      },
    },
    { title: 'Created', dataIndex: 'createdAt', render: (v: string) => dayjs(v).fromNow() },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Open Ticket"><Button size="small" icon={<MessageOutlined />} onClick={() => openTicket(r)} /></Tooltip>
          {r.statusCode !== 'CLOSED' && (
            <Tooltip title="Close Ticket">
              <Popconfirm title="Close this ticket?" onConfirm={async () => { await api.patch(`/tickets/${r.ticketId}/close`, {}); load(); }}>
                <Button size="small" icon={<LockOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Customer Support</Title>
          <Text type="secondary">Manage tickets, SLAs and customer satisfaction</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>New Ticket</Button>
      </div>

      {/* KPI Cards */}
      {summary && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          {[
            { title: 'Open Tickets', value: summary.open, color: '#1890ff', bg: '#e6f7ff' },
            { title: 'SLA Breached', value: summary.breached, color: '#ff4d4f', bg: '#fff1f0' },
            { title: 'Resolved Today', value: summary.resolvedToday, color: '#52c41a', bg: '#f6ffed' },
            { title: 'Avg Resolution', value: `${summary.avgResolutionHours}h`, color: '#2E6DA4', bg: '#f9f0ff' },
          ].map(k => (
            <Col xs={12} lg={6} key={k.title}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic title={k.title} value={k.value}
                  valueStyle={{ color: k.color, fontWeight: 700 }} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Filters + Table */}
      <Card style={{ borderRadius: 12 }}>
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Input prefix={<SearchOutlined />} placeholder="Search tickets..."
              value={search} onChange={e => setSearch(e.target.value)} allowClear />
          </Col>
          <Col>
            <Select placeholder="Status" allowClear style={{ width: 160 }} onChange={setStatusFilter}>
              {Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}>{s.replace('_', ' ')}</Option>)}
            </Select>
          </Col>
          <Col>
            <Select placeholder="Priority" allowClear style={{ width: 130 }} onChange={setPriorityFilter}>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <Option key={p} value={p}>{p}</Option>)}
            </Select>
          </Col>
        </Row>
        <Table dataSource={tickets} columns={columns} rowKey="ticketId" loading={loading}
          pagination={{ showSizeChanger: true, pageSizeOptions: ['10','20','50','100'], current: page, total, pageSize: 20, onChange: setPage }} />
      </Card>

      {/* Ticket Drawer */}
      <Drawer
        title={selectedTicket ? `${selectedTicket.ticketNumber} — ${selectedTicket.subject}` : ''}
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={600}
        extra={
          <Space>
            <Button type="primary" ghost onClick={handleResolve}>Mark Resolved</Button>
          </Space>
        }
      >
        {selectedTicket && (
          <>
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={8}><Tag color={PRIORITY_CONFIG[selectedTicket.priorityCode]?.color}>{selectedTicket.priorityCode}</Tag></Col>
              <Col span={8}><Badge color={STATUS_COLORS[selectedTicket.statusCode]} text={selectedTicket.statusCode?.replace('_', ' ')} /></Col>
              <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>{dayjs(selectedTicket.createdAt).format('DD/MM/YYYY HH:mm')}</Text></Col>
            </Row>

            {selectedTicket.slaBreached && (
              <Alert message="SLA Breached" type="error" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />
            )}

            <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 20 }}>
              <Text>{selectedTicket.description}</Text>
            </div>

            <Title level={5}>Comments ({comments.length})</Title>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
              {comments.map(c => (
                <div key={c.commentId} style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 8,
                  background: c.isInternal ? '#fff7e6' : '#f0f5ff',
                  border: `1px solid ${c.isInternal ? '#ffd591' : '#adc6ff'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontWeight: 600, fontSize: 12 }}>Agent</Text>
                    <Space>
                      {c.isInternal && <Tag color="orange" style={{ fontSize: 10 }}>Internal</Tag>}
                      <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(c.createdAt).fromNow()}</Text>
                    </Space>
                  </div>
                  <Text>{c.commentText}</Text>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Button size="small" type={!isInternal ? 'primary' : 'default'} onClick={() => setIsInternal(false)}>Customer Reply</Button>
              <Button size="small" type={isInternal ? 'primary' : 'default'} onClick={() => setIsInternal(true)}>Internal Note</Button>
            </div>
            <TextArea rows={3} value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder={isInternal ? 'Add internal note (not visible to customer)...' : 'Write reply to customer...'} />
            <Button type="primary" style={{ marginTop: 8 }} onClick={handleAddComment} disabled={!newComment.trim()}>
              {isInternal ? 'Add Note' : 'Send Reply'}
            </Button>
          </>
        )}
      </Drawer>

      {/* Create Modal */}
      <Modal title="New Support Ticket" open={createModal} onCancel={() => setCreateModal(false)} footer={null} width={560}>
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
            <Input placeholder="Brief description of the issue" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="priorityCode" label="Priority" initialValue="MEDIUM">
                <Select>
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <Option key={p} value={p}>{p}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categoryCode" label="Category">
                <Select placeholder="Select category" allowClear>
                  {['TECHNICAL', 'BILLING', 'GENERAL', 'FEATURE_REQUEST'].map(c => <Option key={c} value={c}>{c.replace('_', ' ')}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Detailed description of the issue..." />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Create Ticket</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
