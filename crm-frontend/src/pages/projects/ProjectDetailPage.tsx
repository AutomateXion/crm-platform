import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Tabs, Button, Table, Form, Input, Select, Tag, Space, Modal,
  Typography, Row, Col, Statistic, Progress, message, Popconfirm,
  Tooltip, InputNumber,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, DollarOutlined, TeamOutlined,
  FlagOutlined, ApartmentOutlined, FileTextOutlined, AlertOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  projectsApi, stagesApi, tasksApi, resourcesApi,
  milestonesApi, budgetApi, changeRequestsApi, risksApi, meetingsApi,
} from '../../services/pmApi';
import api from '../../services/api';
import UserSelect from '../../components/common/UserSelect';
const { Title, Text } = Typography;
const { Option } = Select;
const STATUS_COLORS: Record<string, string> = {
  PLANNING: '#1890ff', ACTIVE: '#52c41a', ON_HOLD: '#fa8c16',
  CHANGE_REQUEST: '#722ed1', COMPLETED: '#13c2c2', CANCELLED: '#ff4d4f',
};
const HEALTH_COLORS: Record<string, string> = { GREEN: '#52c41a', AMBER: '#fa8c16', RED: '#ff4d4f' };

function StagesTab({ projectId }: { projectId: string }) {
  const [stages, setStages] = useState<any[]>([]);
  const [stageOptions, setStageOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await stagesApi.getAll(projectId); setStages(r.data || []); } catch {} finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/masters/project_stages/values').then(r => setStageOptions(r.data || [])).catch(() => {});
  }, []);
  const handleSave = async (values: any) => {
    try {
      if (editRecord) await stagesApi.update(editRecord.stageId, values);
      else await stagesApi.create({ ...values, projectId });
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const columns = [
    { title: '#', dataIndex: 'orderIndex', width: 50 },
    { title: 'Stage Name', dataIndex: 'stageName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={v === 'COMPLETED' ? 'green' : v === 'IN_PROGRESS' ? 'blue' : 'default'}>{v?.replace('_', ' ')}</Tag> },
    { title: 'Progress', dataIndex: 'progress', render: (v: number) => <Progress percent={Number(v) || 0} size="small" style={{ minWidth: 120 }} /> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={async () => { await stagesApi.delete(r.stageId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); form.setFieldsValue({ status: 'NOT_STARTED' }); setModalOpen(true); }}>Add Stage</Button>
      </div>
      <Table dataSource={stages} columns={columns} rowKey="stageId" loading={loading} size="middle" pagination={false} />
      <Modal title={editRecord ? 'Edit Stage' : 'New Stage'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Form.Item name="stageName" label="Stage Name" rules={[{ required: true }]}>
            <Select showSearch placeholder="Select or type stage name" optionFilterProp="children" allowClear>
              {stageOptions.map((s: any) => (
                <Option key={s.valueCode} value={s.valueLabel}>{s.valueLabel}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="status" label="Status"><Select>{['NOT_STARTED','IN_PROGRESS','COMPLETED','ON_HOLD'].map(s => <Option key={s} value={s}>{s.replace('_',' ')}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="orderIndex" label="Order"><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
          </Row>
          <Form.Item name="progress" label="Progress %"><InputNumber style={{ width: '100%' }} min={0} max={100} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

function TasksTab({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, sr, rr] = await Promise.all([
        tasksApi.getAll({ projectId }),
        stagesApi.getAll(projectId),
        resourcesApi.getAll(projectId),
      ]);
      setTasks(tr.data.data || tr.data || []);
      setStages(sr.data || []);
      setResources(rr.data || []);
    } catch {} finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const openEdit = (r: any) => {
    setEditRecord(r);
    form.setFieldsValue({
      ...r,
      startDate: r.startDate ? r.startDate.slice(0, 10) : undefined,
      dueDate: r.dueDate ? r.dueDate.slice(0, 10) : undefined,
    });
    setModalOpen(true);
  };
  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'TODO', priority: 'MEDIUM' });
    setModalOpen(true);
  };
  const handleSave = async (values: any) => {
    try {
      if (editRecord) await tasksApi.update(editRecord.taskId, values);
      else await tasksApi.create({ ...values, projectId });
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const PC: Record<string,string> = { LOW:'default', MEDIUM:'blue', HIGH:'orange', CRITICAL:'red' };
  const SC: Record<string,string> = { TODO:'default', IN_PROGRESS:'blue', REVIEW:'purple', DONE:'green', BLOCKED:'red' };
  const columns = [
    { title: 'Task', dataIndex: 'taskName', render: (v: string, r: any) => <div><Text strong>{v}</Text><br/><Text type="secondary" style={{fontSize:11}}>{r.taskNumber}</Text></div> },
    { title: 'Stage', dataIndex: 'stageId', render: (v: string) => stages.find(s => s.stageId === v)?.stageName || '—' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={SC[v]}>{v?.replace('_',' ')}</Tag> },
    { title: 'Priority', dataIndex: 'priority', render: (v: string) => <Tag color={PC[v]}>{v}</Tag> },
    { title: 'Assigned To', dataIndex: 'assignedTo', render: (v: string) => v || '—' },
    { title: 'Progress', dataIndex: 'progress', render: (v: number) => <Progress percent={Number(v)||0} size="small" style={{minWidth:100}} /> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
        <Popconfirm title="Delete?" onConfirm={async () => { await tasksApi.delete(r.taskId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Task</Button>
      </div>
      <Table dataSource={tasks} columns={columns} rowKey="taskId" loading={loading} size="middle" pagination={{ pageSize: 10 }} />
      <Modal title={editRecord ? 'Edit Task' : 'New Task'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={560}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Form.Item name="taskName" label="Task Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="stageId" label="Stage">
                <Select allowClear placeholder="Select stage">
                  {stages.map(s => <Option key={s.stageId} value={s.stageId}>{s.stageName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select>{['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <Option key={p} value={p}>{p}</Option>)}</Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>{['TODO','IN_PROGRESS','REVIEW','DONE','BLOCKED'].map(s => <Option key={s} value={s}>{s.replace('_',' ')}</Option>)}</Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assignedTo" label="Assigned To">
                <UserSelect placeholder="Select team member" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="estimatedHours" label="Est. Hours"><InputNumber style={{width:'100%'}} min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item name="progress" label="Progress %"><InputNumber style={{width:'100%'}} min={0} max={100} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="startDate" label="Start Date"><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="dueDate" label="Due Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

function ResourcesTab({ projectId }: { projectId: string }) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await resourcesApi.getAll(projectId); setResources(r.data || []); } catch {} finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const handleSave = async (values: any) => {
    try {
      if (editRecord) await resourcesApi.update(editRecord.resourceId, values);
      else await resourcesApi.create({ ...values, projectId });
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const columns = [
    { title: 'Name', dataIndex: 'resourceName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Role', dataIndex: 'roleOnProject', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Hourly Rate', dataIndex: 'hourlyRate', render: (v: number) => v ? `OMR ${Number(v).toFixed(3)}` : '—' },
    { title: 'Allocation %', dataIndex: 'allocationPercent', render: (v: number) => v ? <Progress percent={Number(v)} size="small" style={{minWidth:100}} /> : '—' },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); }} />
        <Popconfirm title="Remove?" onConfirm={async () => { await resourcesApi.delete(r.resourceId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true); }}>Add Resource</Button>
      </div>
      <Table dataSource={resources} columns={columns} rowKey="resourceId" loading={loading} size="middle" pagination={false} />
      <Modal title={editRecord ? 'Edit Resource' : 'Add Resource'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Form.Item name="resourceName" label="Team Member" rules={[{ required: true }]}>
            <UserSelect
              placeholder="Select or create user"
              onUserSelect={(user: any) => {
                if (user) {
                  form.setFieldsValue({
                    resourceName: user.fullName,
                    resourceEmail: user.email,
                    roleOnProject: user.userGroup?.groupName || user.groupName || '',
                  });
                }
              }}
            />
          </Form.Item>
          <Form.Item name="resourceEmail" label="Email"><Input placeholder="Auto-filled from user" /></Form.Item>
          <Form.Item name="roleOnProject" label="Role" rules={[{ required: true }]}><Input placeholder="Auto-filled from user group" /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="hourlyRate" label="Hourly Rate (OMR)"><InputNumber style={{width:'100%'}} min={0} step={0.001} /></Form.Item></Col>
            <Col span={12}><Form.Item name="allocationPercent" label="Allocation %"><InputNumber style={{width:'100%'}} min={0} max={100} /></Form.Item></Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

function MilestonesTab({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await milestonesApi.getAll(projectId); setMilestones(r.data || []); } catch {} finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const handleSave = async (values: any) => {
    try {
      if (editRecord) await milestonesApi.update(editRecord.milestoneId, values);
      else await milestonesApi.create({ ...values, projectId });
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const total = milestones.reduce((s,m) => s + Number(m.amount||0), 0);
  const paid = milestones.filter(m => m.status==='PAID').reduce((s,m) => s + Number(m.amount||0), 0);
  const columns = [
    { title: 'Milestone', dataIndex: 'milestoneName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Amount (OMR)', dataIndex: 'amount', render: (v: number) => <Text strong style={{color:'#52c41a'}}>OMR {Number(v).toLocaleString()}</Text> },
    { title: 'Due Date', dataIndex: 'dueDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={v==='PAID'?'green':v==='INVOICED'?'blue':'default'}>{v}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditRecord(r); form.setFieldsValue({ ...r, dueDate: r.dueDate?.slice(0,10) }); setModalOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={async () => { await milestonesApi.delete(r.milestoneId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={8}><Card size="small" style={{borderRadius:8,borderLeft:'4px solid #1890ff'}}><Statistic title="Total" value={`OMR ${total.toLocaleString()}`} /></Card></Col>
        <Col span={8}><Card size="small" style={{borderRadius:8,borderLeft:'4px solid #52c41a'}}><Statistic title="Paid" value={`OMR ${paid.toLocaleString()}`} /></Card></Col>
        <Col span={8}><Card size="small" style={{borderRadius:8,borderLeft:'4px solid #fa8c16'}}><Statistic title="Outstanding" value={`OMR ${(total-paid).toLocaleString()}`} /></Card></Col>
      </Row>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); form.setFieldsValue({ status:'PENDING' }); setModalOpen(true); }}>Add Milestone</Button>
      </div>
      <Table dataSource={milestones} columns={columns} rowKey="milestoneId" loading={loading} size="middle" pagination={false} />
      <Modal title={editRecord ? 'Edit Milestone' : 'New Milestone'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Form.Item name="milestoneName" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="amount" label="Amount (OMR)" rules={[{ required: true }]}><InputNumber style={{width:'100%'}} min={0} step={0.001} /></Form.Item></Col>
            <Col span={12}><Form.Item name="dueDate" label="Due Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Form.Item name="status" label="Status"><Select><Option value="PENDING">PENDING</Option><Option value="INVOICED">INVOICED</Option><Option value="PAID">PAID</Option></Select></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

function BudgetTab({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [er, sr] = await Promise.all([budgetApi.getAll(projectId), budgetApi.getSummary(projectId)]);
      setEntries(er.data || []); setSummary(sr.data || {});
    } catch {} finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const handleSave = async (values: any) => {
    try { await budgetApi.create({ ...values, projectId }); message.success('Added'); setModalOpen(false); load(); }
    catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const columns = [
    { title: 'Description', dataIndex: 'description' },
    { title: 'Type', dataIndex: 'entryType', render: (v: string) => <Tag color={v==='PLANNED'?'blue':'green'}>{v}</Tag> },
    { title: 'Category', dataIndex: 'category', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Amount (OMR)', dataIndex: 'amount', render: (v: number) => <Text strong>OMR {Number(v).toLocaleString()}</Text> },
    { title: 'Date', dataIndex: 'entryDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Popconfirm title="Delete?" onConfirm={async () => { await budgetApi.delete(r.entryId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
    )},
  ];
  return (
    <>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={8}><Card size="small" style={{borderRadius:8,borderLeft:'4px solid #1890ff'}}><Statistic title="Planned" value={`OMR ${Number(summary.plannedTotal||0).toLocaleString()}`} /></Card></Col>
        <Col span={8}><Card size="small" style={{borderRadius:8,borderLeft:'4px solid #fa8c16'}}><Statistic title="Actual" value={`OMR ${Number(summary.actualTotal||0).toLocaleString()}`} /></Card></Col>
        <Col span={8}><Card size="small" style={{borderRadius:8,borderLeft:'4px solid #52c41a'}}><Statistic title="Variance" value={`OMR ${(Number(summary.plannedTotal||0)-Number(summary.actualTotal||0)).toLocaleString()}`} /></Card></Col>
      </Row>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ entryType:'PLANNED', category:'MATERIAL' }); setModalOpen(true); }}>Add Entry</Button>
      </div>
      <Table dataSource={entries} columns={columns} rowKey="entryId" loading={loading} size="middle" pagination={{ pageSize: 10 }} />
      <Modal title="Add Budget Entry" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="entryType" label="Type"><Select><Option value="PLANNED">PLANNED</Option><Option value="ACTUAL">ACTUAL</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item name="category" label="Category"><Select>{['RESOURCE','MATERIAL','TRAVEL','OTHER'].map(c => <Option key={c} value={c}>{c}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="amount" label="Amount (OMR)" rules={[{ required: true }]}><InputNumber style={{width:'100%'}} min={0} step={0.001} /></Form.Item></Col>
            <Col span={12}><Form.Item name="entryDate" label="Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

function ChangeRequestsTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await changeRequestsApi.getAll(projectId); setItems(r.data || []); } catch {} finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const openEdit = (r: any) => {
    setEditRecord(r);
    form.setFieldsValue({ ...r, crDate: r.crDate ? r.crDate.slice(0,10) : undefined });
    setModalOpen(true);
  };
  const handleSave = async (values: any) => {
    try {
      if (editRecord) await changeRequestsApi.update(editRecord.crId, values);
      else await changeRequestsApi.create({ ...values, projectId });
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const CLASSIFICATION_COLORS: Record<string,string> = {
    'Change Request': 'purple',
    'In-Scope Enhancement': 'blue',
    'On Hold': 'orange',
    'Process Change': 'cyan',
  };
  const EFFORT_COLORS: Record<string,string> = { Low:'green', Medium:'blue', High:'orange', 'Very High':'red' };
  const columns = [
    { title: 'CR#', dataIndex: 'crNumber', render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: 'Date', dataIndex: 'crDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Area / Module', dataIndex: 'areaModule', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Title', dataIndex: 'title', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Classification', dataIndex: 'classification', render: (v: string) => v ? <Tag color={CLASSIFICATION_COLORS[v] || 'default'}>{v}</Tag> : '—' },
    { title: 'Effort', dataIndex: 'effort', render: (v: string) => v ? <Tag color={EFFORT_COLORS[v] || 'default'}>{v}</Tag> : '—' },
    { title: 'Commercial', dataIndex: 'commercial', render: (v: string) => v ? <Tag color={v==='Billable'?'red':v==='No Charge'?'green':'orange'}>{v}</Tag> : '—' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={v==='Accepted'?'green':v==='Rejected'?'red':v==='On Hold'?'orange':'default'}>{v}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
        <Popconfirm title="Delete?" onConfirm={async () => { await changeRequestsApi.delete(r.crId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); form.setFieldsValue({ status:'Accepted' }); setModalOpen(true); }}>New CR</Button>
      </div>
      <Table dataSource={items} columns={columns} rowKey="crId" loading={loading} size="middle"
        scroll={{ x: 1200 }} pagination={{ pageSize: 10 }} />
      <Modal title={editRecord ? 'Edit Change Request' : 'New Change Request'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={720} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={16}><Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="crDate" label="Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Form.Item name="areaModule" label="Area / Module"><Input placeholder="e.g. DN – Data Fields, User Access & Roles" /></Form.Item>
          <Form.Item name="originalScope" label="Original Scope"><Input.TextArea rows={2} placeholder="What was originally agreed..." /></Form.Item>
          <Form.Item name="requestedChange" label="Requested Change"><Input.TextArea rows={2} placeholder="What is being requested..." /></Form.Item>
          <Form.Item name="impactAssessment" label="Impact Assessment"><Input.TextArea rows={2} placeholder="Technical and business impact..." /></Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="classification" label="Classification">
                <Select>
                  <Option value="Change Request">Change Request</Option>
                  <Option value="In-Scope Enhancement">In-Scope Enhancement</Option>
                  <Option value="On Hold">On Hold</Option>
                  <Option value="Process Change">Process Change</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="effort" label="Effort">
                <Select>
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Very High">Very High</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="commercial" label="Commercial">
                <Select>
                  <Option value="Billable">Billable</Option>
                  <Option value="No Charge">No Charge</Option>
                  <Option value="Separate Quote Required">Separate Quote Required</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="Accepted">Accepted</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Rejected">Rejected</Option>
                  <Option value="On Hold">On Hold</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="impactBudget" label="Budget Impact (OMR)"><InputNumber style={{width:'100%'}} /></Form.Item></Col>
            <Col span={12}><Form.Item name="impactTimelineDays" label="Timeline Impact (days)"><InputNumber style={{width:'100%'}} /></Form.Item></Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

function RisksTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await risksApi.getAll(projectId); setItems(r.data || []); } catch {} finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const handleSave = async (values: any) => {
    try {
      if (editRecord) await risksApi.update(editRecord.riskId, values);
      else await risksApi.create({ ...values, projectId });
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const rc = (s: number) => s >= 15 ? 'red' : s >= 8 ? 'orange' : 'green';
  const columns = [
    { title: 'Risk', dataIndex: 'riskTitle', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Likelihood', dataIndex: 'likelihood', render: (v: number) => <Tag>{v}/5</Tag> },
    { title: 'Impact', dataIndex: 'impact', render: (v: number) => <Tag>{v}/5</Tag> },
    { title: 'Score', dataIndex: 'riskScore', render: (v: number) => <Tag color={rc(v)} style={{fontWeight:700}}>{v}</Tag> },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={v==='MITIGATED'?'green':v==='CLOSED'?'default':'red'}>{v}</Tag> },
    { title: 'Mitigation', dataIndex: 'mitigationPlan', render: (v: string) => v ? <Tooltip title={v}><Text ellipsis style={{maxWidth:150}}>{v}</Text></Tooltip> : '—' },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={async () => { await risksApi.delete(r.riskId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); form.setFieldsValue({ status:'OPEN', likelihood:3, impact:3 }); setModalOpen(true); }}>Add Risk</Button>
      </div>
      <Table dataSource={items} columns={columns} rowKey="riskId" loading={loading} size="middle" pagination={false} />
      <Modal title={editRecord ? 'Edit Risk' : 'Add Risk'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Form.Item name="riskTitle" label="Risk Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="likelihood" label="Likelihood (1-5)"><InputNumber style={{width:'100%'}} min={1} max={5} /></Form.Item></Col>
            <Col span={12}><Form.Item name="impact" label="Impact (1-5)"><InputNumber style={{width:'100%'}} min={1} max={5} /></Form.Item></Col>
          </Row>
          <Form.Item name="mitigationPlan" label="Mitigation Plan"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="status" label="Status"><Select><Option value="OPEN">OPEN</Option><Option value="MITIGATED">MITIGATED</Option><Option value="CLOSED">CLOSED</Option></Select></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

function MeetingsTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await meetingsApi.getAll(projectId); setItems(r.data || []); } catch {} finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const handleSave = async (values: any) => {
    try {
      if (editRecord) await meetingsApi.update(editRecord.meetingId, values);
      else await meetingsApi.create({ ...values, projectId });
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const columns = [
    { title: 'Title', dataIndex: 'title', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Date', dataIndex: 'meetingDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Minutes', dataIndex: 'minutes', render: (v: string) => v ? <Tooltip title={v}><Text ellipsis style={{maxWidth:200}}>{v}</Text></Tooltip> : '—' },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditRecord(r); form.setFieldsValue({ ...r, meetingDate: r.meetingDate?.slice(0,10) }); setModalOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={async () => { await meetingsApi.delete(r.meetingId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true); }}>Log Meeting</Button>
      </div>
      <Table dataSource={items} columns={columns} rowKey="meetingId" loading={loading} size="middle" pagination={{ pageSize: 10 }} />
      <Modal title={editRecord ? 'Edit Meeting' : 'Log Meeting'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="meetingDate" label="Date"><Input type="date" /></Form.Item>
          <Form.Item name="agenda" label="Agenda"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="minutes" label="Minutes"><Input.TextArea rows={3} /></Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try { const r = await projectsApi.getOne(id); setProject(r.data); }
    catch { message.error('Project not found'); navigate('/projects'); }
    finally { setLoading(false); }
  }, [id, navigate]);
  useEffect(() => { load(); }, [load]);
  const handleEditSave = async (values: any) => {
    if (!id) return; setSaving(true);
    try { await projectsApi.update(id, values); message.success('Updated'); setEditOpen(false); load(); }
    catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };
  const tabs = [
    { key: 'stages',     label: <span><ApartmentOutlined /> Stages</span>,          children: <StagesTab projectId={id!} /> },
    { key: 'tasks',      label: <span><CheckCircleOutlined /> Tasks</span>,          children: <TasksTab projectId={id!} /> },
    { key: 'resources',  label: <span><TeamOutlined /> Resources</span>,            children: <ResourcesTab projectId={id!} /> },
    { key: 'milestones', label: <span><FlagOutlined /> Milestones</span>,           children: <MilestonesTab projectId={id!} /> },
    { key: 'budget',     label: <span><DollarOutlined /> Budget</span>,             children: <BudgetTab projectId={id!} /> },
    { key: 'cr',         label: <span><FileTextOutlined /> Change Requests</span>,  children: <ChangeRequestsTab projectId={id!} /> },
    { key: 'risks',      label: <span><AlertOutlined /> Risks</span>,               children: <RisksTab projectId={id!} /> },
    { key: 'meetings',   label: <span><FileTextOutlined /> Meetings</span>,         children: <MeetingsTab projectId={id!} /> },
  ];
  if (loading) return <Card loading style={{ borderRadius: 12 }} />;
  if (!project) return null;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>Back</Button>
        <div style={{ flex: 1 }}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>{project.projectName}</Title>
            <Tag color={STATUS_COLORS[project.status]} style={{ borderRadius: 20 }}>{project.status?.replace('_',' ')}</Tag>
            <Tag color={HEALTH_COLORS[project.health]} style={{ borderRadius: 20 }}>● {project.health}</Tag>
          </Space>
          <div><Text type="secondary">{project.projectNumber} · PM: {project.projectManagerName || 'Unassigned'}</Text></div>
        </div>
        <Button icon={<EditOutlined />} onClick={() => { form.setFieldsValue({ ...project, startDate: project.startDate?.slice(0,10), endDate: project.endDate?.slice(0,10) }); setEditOpen(true); }}>Edit Project</Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" style={{borderRadius:10,borderLeft:'4px solid #1890ff'}}><Statistic title="Contract Value" value={`OMR ${Number(project.contractValue||0).toLocaleString()}`} /></Card></Col>
        <Col span={6}><Card size="small" style={{borderRadius:10,borderLeft:'4px solid #fa8c16'}}><Statistic title="Planned Budget" value={`OMR ${Number(project.plannedBudget||0).toLocaleString()}`} /></Card></Col>
        <Col span={6}><Card size="small" style={{borderRadius:10,borderLeft:'4px solid #52c41a'}}><Statistic title="Client" value={project.clientName || '—'} /></Card></Col>
        <Col span={6}><Card size="small" style={{borderRadius:10,borderLeft:'4px solid #722ed1'}}>
          <div style={{fontSize:12,color:'#8c8c8c',marginBottom:4}}>Progress</div>
          <Progress percent={Math.round(Number(project.progress)||0)} strokeColor={Number(project.progress)>=100?'#52c41a':'#1890ff'} />
        </Card></Col>
      </Row>
      <Card style={{ borderRadius: 12 }}>
        <Tabs items={tabs} defaultActiveKey="stages" />
      </Card>
      <Modal title="Edit Project" open={editOpen} onCancel={() => setEditOpen(false)} footer={null} width={640} style={{ top: 30 }}>
        <Form form={form} layout="vertical" onFinish={handleEditSave} style={{ marginTop: 16 }}>
          <Form.Item name="projectName" label="Project Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="awardedByName" label="Awarded By"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="clientName" label="Client"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="status" label="Status"><Select>{['PLANNING','ACTIVE','ON_HOLD','CHANGE_REQUEST','COMPLETED','CANCELLED'].map(s => <Option key={s} value={s}>{s.replace('_',' ')}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="health" label="Health"><Select><Option value="GREEN">🟢 GREEN</Option><Option value="AMBER">🟠 AMBER</Option><Option value="RED">🔴 RED</Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="startDate" label="Start Date"><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="endDate" label="End Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="contractValue" label="Contract Value (OMR)"><Input type="number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="plannedBudget" label="Planned Budget (OMR)"><Input type="number" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="projectManagerName" label="Project Manager"><UserSelect placeholder="Select project manager" /></Form.Item></Col>
            <Col span={12}><Form.Item name="progress" label="Progress %"><InputNumber style={{width:'100%'}} min={0} max={100} /></Form.Item></Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>Save Changes</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
