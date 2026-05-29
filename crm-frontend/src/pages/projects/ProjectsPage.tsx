import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, Statistic, Progress, message, Tooltip,
  Popconfirm, Avatar, Badge,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined,
  WarningOutlined, PauseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../../services/pmApi';
import UserSelect from '../../components/common/UserSelect';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  PLANNING: '#1890ff', ACTIVE: '#52c41a', ON_HOLD: '#fa8c16',
  CHANGE_REQUEST: '#722ed1', COMPLETED: '#13c2c2', CANCELLED: '#ff4d4f',
};

const HEALTH_COLORS: Record<string, string> = {
  GREEN: '#52c41a', AMBER: '#fa8c16', RED: '#ff4d4f',
};

const HEALTH_ICONS: Record<string, React.ReactNode> = {
  GREEN: <CheckCircleOutlined />,
  AMBER: <WarningOutlined />,
  RED: <WarningOutlined />,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await projectsApi.getAll({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
      setProjects(r.data.data || []); setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get('/accounts', { params: { limit: 100 } }).then(r => setAccounts(r.data.data || [])).catch(() => {});
  }, []);

  const openCreate = () => { setEditRecord(null); form.resetFields(); form.setFieldsValue({ status: 'PLANNING', health: 'GREEN', currencyCode: 'OMR' }); setModalOpen(true); };
  const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue({ ...r, startDate: r.startDate?.slice(0, 10), endDate: r.endDate?.slice(0, 10) }); setModalOpen(true); };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editRecord) { await projectsApi.update(editRecord.projectId, values); message.success('Project updated'); }
      else { await projectsApi.create(values); message.success('Project created'); }
      setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await projectsApi.delete(id); message.success('Project deleted'); load();
  };

  // Summary stats
  const active = projects.filter(p => p.status === 'ACTIVE').length;
  const completed = projects.filter(p => p.status === 'COMPLETED').length;
  const atRisk = projects.filter(p => p.health === 'RED').length;

  const columns = [
    {
      title: 'Project', key: 'name',
      render: (_: any, r: any) => (
        <Space>
          <Avatar size={38} style={{ background: STATUS_COLORS[r.status] || '#1890ff', fontWeight: 700, fontSize: 14 }}>
            {r.projectNumber?.slice(-3) || 'P'}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.projectName}</div>
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>{r.projectNumber}</Text>
              {r.clientName && <Tag style={{ fontSize: 10, borderRadius: 8 }} color="blue">{r.clientName}</Tag>}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Awarded By', dataIndex: 'awardedByName',
      render: (v: string) => v ? <Tag color="purple">{v}</Tag> : '—',
    },
    {
      title: 'Status', dataIndex: 'status',
      render: (v: string) => <Tag color={STATUS_COLORS[v]} style={{ borderRadius: 20 }}>{v?.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Health', dataIndex: 'health',
      render: (v: string) => (
        <Tag color={HEALTH_COLORS[v]} icon={HEALTH_ICONS[v]} style={{ borderRadius: 20 }}>{v}</Tag>
      ),
    },
    {
      title: 'Progress', dataIndex: 'progress',
      render: (v: number) => (
        <div style={{ minWidth: 120 }}>
          <Progress percent={Math.round(Number(v) || 0)} size="small"
            strokeColor={Number(v) >= 100 ? '#52c41a' : '#1890ff'} />
        </div>
      ),
    },
    {
      title: 'Value (OMR)', dataIndex: 'contractValue',
      render: (v: number) => v ? <Text strong style={{ color: '#52c41a' }}>OMR {Number(v).toLocaleString()}</Text> : '—',
    },
    {
      title: 'End Date', dataIndex: 'endDate',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Open Project"><Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => navigate(`/projects/${r.projectId}`)} /></Tooltip>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Popconfirm title="Delete project?" onConfirm={() => handleDelete(r.projectId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Project Management</Title>
          <Text type="secondary">Manage projects from won deals to delivery</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
          New Project
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Total Projects', value: total, color: '#1890ff', icon: <ProjectOutlined /> },
          { title: 'Active', value: active, color: '#52c41a', icon: <ClockCircleOutlined /> },
          { title: 'Completed', value: completed, color: '#13c2c2', icon: <CheckCircleOutlined /> },
          { title: 'At Risk', value: atRisk, color: '#ff4d4f', icon: <WarningOutlined /> },
        ].map(s => (
          <Col span={6} key={s.title}>
            <Card style={{ borderRadius: 12, borderLeft: `4px solid ${s.color}` }}>
              <Statistic title={s.title} value={s.value} prefix={<span style={{ color: s.color }}>{s.icon}</span>} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table */}
      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Search projects..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ width: 260, borderRadius: 8 }} />
          <Select placeholder="Filter by status" value={statusFilter || undefined} onChange={v => { setStatusFilter(v || ''); setPage(1); }} allowClear style={{ width: 180 }}>
            {['PLANNING', 'ACTIVE', 'ON_HOLD', 'CHANGE_REQUEST', 'COMPLETED', 'CANCELLED'].map(s => (
              <Option key={s} value={s}><Tag color={STATUS_COLORS[s]}>{s.replace('_', ' ')}</Tag></Option>
            ))}
          </Select>
        </Space>
        <Table dataSource={projects} columns={columns} rowKey="projectId" loading={loading} size="middle"
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: t => `${t} projects` }}
          onRow={r => ({ onDoubleClick: () => navigate(`/projects/${r.projectId}`) })}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal title={editRecord ? 'Edit Project' : 'New Project'} open={modalOpen}
        onCancel={() => setModalOpen(false)} footer={null} width={640} style={{ top: 30 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="projectName" label="Project Name" rules={[{ required: true }]}>
            <Input placeholder="Enter project name" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="awardedByName" label="Awarded By (e.g. Ooredoo)">
                <Input placeholder="Company who gave the contract" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="clientName" label="Client (e.g. Shell Oman Marketing)">
                <Input placeholder="End beneficiary" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  {['PLANNING', 'ACTIVE', 'ON_HOLD', 'CHANGE_REQUEST', 'COMPLETED', 'CANCELLED'].map(s => (
                    <Option key={s} value={s}>{s.replace('_', ' ')}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="health" label="Health">
                <Select>
                  <Option value="GREEN">🟢 GREEN</Option>
                  <Option value="AMBER">🟠 AMBER</Option>
                  <Option value="RED">🔴 RED</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date">
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="contractValue" label="Contract Value (OMR)">
                <Input type="number" placeholder="0.000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="plannedBudget" label="Planned Budget (OMR)">
                <Input type="number" placeholder="0.000" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="projectManagerName" label="Project Manager">
            <UserSelect placeholder="Select project manager" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {editRecord ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
