import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Progress, Spin } from 'antd';
import {
  ProjectOutlined, CheckCircleOutlined, WarningOutlined, ClockCircleOutlined,
  TeamOutlined, FlagOutlined, AimOutlined, DollarOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { pmDashboardApi } from '../../services/pmApi';

const { Title, Text } = Typography;
const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#ff4d4f', '#13c2c2'];
const HEALTH_COLORS: Record<string, string> = { ON_TRACK: '#52c41a', AT_RISK: '#fa8c16', OFF_TRACK: '#ff4d4f', COMPLETED: '#1890ff' };
const STATUS_COLORS: Record<string, string> = { IN_PROGRESS: '#1890ff', ACTIVE: '#1890ff', COMPLETED: '#52c41a', ON_HOLD: '#fa8c16', CANCELLED: '#ff4d4f', PLANNING: '#722ed1' };
const SEVERITY_COLORS: Record<string, string> = { LOW: '#52c41a', MEDIUM: '#fa8c16', HIGH: '#ff4d4f', CRITICAL: '#cf1322' };
const TASK_COLORS: Record<string, string> = { TODO: '#8c8c8c', IN_PROGRESS: '#1890ff', REVIEW: '#722ed1', DONE: '#52c41a', BLOCKED: '#ff4d4f' };

export default function PMDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pmDashboardApi.get()
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /><div style={{ marginTop: 16 }}>Loading PM Analytics...</div></div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#8c8c8c' }}>Failed to load PM data</div>;

  const summary = data?.summary || {};
  const recentProjects = data?.recentProjects || [];
  const overdueTasks = data?.overdueTasks || [];

  const projects = {
    total: summary.totalProjects || 0,
    active: summary.activeProjects || 0,
    completed: summary.completedProjects || 0,
    atRisk: summary.atRiskProjects || 0,
    byStatus: summary.projectsByStatus || [],
    byHealth: summary.projectsByHealth || [],
    budget: { total: summary.totalBudget || 0, actual: summary.totalActualCost || 0 },
    recent: recentProjects,
  };
  const tasks = {
    total: summary.totalTasks || 0,
    completed: summary.completedTasks || 0,
    overdue: overdueTasks.length || 0,
    dueToday: summary.tasksDueToday || 0,
    completionRate: summary.totalTasks > 0 ? Math.round(((summary.completedTasks||0) / summary.totalTasks) * 100) : 0,
    byStatus: summary.tasksByStatus || [],
  };
  const milestones = {
    total: summary.totalMilestones || 0,
    completed: summary.completedMilestones || 0,
    overdue: summary.overdueMilestones || 0,
  };
  const risks = {
    total: summary.totalRisks || 0,
    high: summary.highRisks || 0,
    bySeverity: summary.risksByImpact || [],
  };
  const resources = { total: summary.totalResources || 0 };
  const budget = projects.budget;
  const budgetUtilization = budget.total > 0 ? Math.round((budget.actual / budget.total) * 100) : 0;

  const kpis = [
    { title: 'Total Projects', value: projects.total || 0, sub: `${projects.active || 0} active`, icon: <ProjectOutlined />, color: '#1890ff' },
    { title: 'Completed', value: projects.completed || 0, sub: `${projects.total > 0 ? Math.round(((projects.completed||0) / projects.total) * 100) : 0}% completion rate`, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { title: 'At Risk', value: projects.atRisk || 0, sub: 'Need attention', icon: <WarningOutlined />, color: (projects.atRisk||0) > 0 ? '#ff4d4f' : '#52c41a' },
    { title: 'Total Tasks', value: tasks.total || 0, sub: `${tasks.completionRate || 0}% complete`, icon: <AimOutlined />, color: '#722ed1' },
    { title: 'Overdue Tasks', value: tasks.overdue || 0, sub: `${tasks.dueToday || 0} due today`, icon: <ClockCircleOutlined />, color: (tasks.overdue||0) > 0 ? '#ff4d4f' : '#52c41a' },
    { title: 'Milestones', value: milestones.total || 0, sub: `${milestones.completed || 0} completed`, icon: <FlagOutlined />, color: '#13c2c2' },
    { title: 'Risks', value: risks.total || 0, sub: `${risks.high || 0} high/critical`, icon: <WarningOutlined />, color: (risks.high||0) > 0 ? '#ff4d4f' : '#fa8c16' },
    { title: 'Resources', value: resources.total || 0, sub: 'Team members', icon: <TeamOutlined />, color: '#fa8c16' },
  ];

  const taskStatusData = (tasks.byStatus || []).map((s: any) => ({ name: s.status, value: Number(s.count), color: TASK_COLORS[s.status] || '#8c8c8c' }));
  const projectHealthData = (projects.byHealth || []).map((h: any) => ({ name: h.health || 'Unknown', value: Number(h.count) }));
  const riskData = (risks.bySeverity || []).map((r: any) => ({ severity: r.severity || 'Unknown', count: Number(r.count) }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Project Management Analytics</Title>
        <Text type="secondary">Project health, task progress, milestones and risk overview</Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <Col span={6} key={i}>
            <Card style={{ borderRadius: 12, borderLeft: `4px solid ${k.color}` }} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{k.title}</Text>
                  <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{k.sub}</Text>
                </div>
                <div style={{ fontSize: 24, color: k.color, opacity: 0.25 }}>{k.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Task Status */}
        <Col span={8}>
          <Card title="Task Status Breakdown" style={{ borderRadius: 12 }} size="small">
            {taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={taskStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {taskStatusData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>No tasks yet</div>}
          </Card>
        </Col>

        {/* Project Health */}
        <Col span={8}>
          <Card title="Project Health" style={{ borderRadius: 12 }} size="small">
            {projectHealthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={projectHealthData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {projectHealthData.map((e: any, i: number) => <Cell key={i} fill={HEALTH_COLORS[e.name] || COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>No health data yet</div>}
          </Card>
        </Col>

        {/* Risk by Severity */}
        <Col span={8}>
          <Card title="Risks by Severity" style={{ borderRadius: 12 }} size="small">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="severity" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Risks" radius={[4, 4, 0, 0]}>
                    {riskData.map((e: any, i: number) => <Cell key={i} fill={SEVERITY_COLORS[e.severity] || COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>No risks yet</div>}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Budget Utilization */}
        <Col span={10}>
          <Card title="Budget Utilization" style={{ borderRadius: 12 }} size="small">
            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Total Budget</Text>
                <Text strong>OMR {Number(budget.total).toFixed(3)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text>Actual Cost</Text>
                <Text strong style={{ color: budgetUtilization > 90 ? '#ff4d4f' : '#52c41a' }}>OMR {Number(budget.actual).toFixed(3)}</Text>
              </div>
              <Progress percent={budgetUtilization} strokeColor={budgetUtilization > 90 ? '#ff4d4f' : budgetUtilization > 70 ? '#fa8c16' : '#52c41a'}
                format={p => `${p}% used`} />
              <Row gutter={12} style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #adc6ff', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1890ff' }}>{(milestones.overdue||0)}</div>
                    <Text style={{ fontSize: 11 }}>Overdue Milestones</Text>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#ff4d4f' }}>{(tasks.overdue||0)}</div>
                    <Text style={{ fontSize: 11 }}>Overdue Tasks</Text>
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Task Completion */}
        <Col span={14}>
          <Card title="Task Completion Rate" style={{ borderRadius: 12 }} size="small">
            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Overall Progress</Text>
                <Text strong>{tasks.completionRate||0}%</Text>
              </div>
              <Progress percent={tasks.completionRate||0} strokeColor="#52c41a" style={{ marginBottom: 20 }} />
              <Row gutter={12}>
                {(tasks.byStatus || []).map((s: any, i: number) => (
                  <Col key={i} style={{ flex: '1 1 0' }}>
                    <Card size="small" style={{ borderRadius: 8, borderTop: `3px solid ${TASK_COLORS[s.status] || COLORS[i % COLORS.length]}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: TASK_COLORS[s.status] || COLORS[i % COLORS.length] }}>{s.count}</div>
                      <Text style={{ fontSize: 10, color: '#8c8c8c' }}>{s.status}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Projects */}
      <Card title="Recent Projects" style={{ borderRadius: 12 }} size="small">
        <Table
          dataSource={projects.recent || []}
          rowKey="projectId"
          size="small"
          pagination={false}
          columns={[
            { title: 'Project', dataIndex: 'projectName', render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Client', dataIndex: 'clientName', render: (v: string) => v || '—' },
            { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v] || 'default'}>{v?.replace('_', ' ')}</Tag> },
            { title: 'Health', dataIndex: 'health', render: (v: string) => v ? <Tag color={HEALTH_COLORS[v] || 'default'}>{v?.replace('_', ' ')}</Tag> : '—' },
            { title: 'Budget', dataIndex: 'budget', render: (v: number) => v ? `OMR ${Number(v).toFixed(3)}` : '—' },
            { title: 'Start Date', dataIndex: 'startDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
            { title: 'End Date', dataIndex: 'endDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
          ]}
        />
      </Card>
    </div>
  );
}
