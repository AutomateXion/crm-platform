import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Progress, Spin } from 'antd';
import {
  UserOutlined, RiseOutlined, TrophyOutlined, FunnelPlotOutlined,
  TeamOutlined, ClockCircleOutlined, DollarOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../../services/api';

const { Title, Text } = Typography;

const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: '#1890ff', QUALIFICATION: '#13c2c2', PROPOSAL: '#2E6DA4',
  NEGOTIATION: '#fa8c16', CLOSED_WON: '#52c41a', CLOSED_LOST: '#ff4d4f',
};
const COLORS = ['#1890ff', '#52c41a', '#2E6DA4', '#fa8c16', '#ff4d4f', '#13c2c2', '#eb2f96'];

export default function CRMDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/crm-dashboard')
      .then(r => { setData(r.data); setLoading(false); })
      .catch((e) => { 
        console.error('CRM Dashboard error:', e?.response?.status, e?.response?.data, e?.message);
        setLoading(false); 
      });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /><div style={{ marginTop: 16 }}>Loading CRM Analytics...</div></div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#8c8c8c' }}>Failed to load dashboard data</div>;

  const { leads, opportunities, accounts, contacts, activities } = data;
  const sourceData = (leads.bySource || []).map((s: any) => ({ name: s.source || 'Unknown', value: Number(s.count) }));
  const stageData = (opportunities.byStage || []).map((s: any) => ({
    stage: s.stage?.replace('_', ' ') || 'Unknown',
    count: Number(s.count), value: Number(s.value || 0), color: STAGE_COLORS[s.stage] || '#8c8c8c',
  }));
  const trendData = (leads.monthlyTrend || []).map((m: any) => ({ month: m.month, leads: Number(m.count) }));

  const kpis = [
    { title: 'Total Leads', value: leads.total, sub: `+${leads.thisMonth} this month`, icon: <FunnelPlotOutlined />, color: '#1890ff' },
    { title: 'Open Deals', value: opportunities.total, sub: `Win rate: ${opportunities.winRate}%`, icon: <TrophyOutlined />, color: '#52c41a' },
    { title: 'Pipeline Value', value: `OMR ${Number(opportunities.pipelineValue).toLocaleString()}`, sub: `Won: OMR ${Number(opportunities.wonValue).toLocaleString()}`, icon: <DollarOutlined />, color: '#2E6DA4' },
    { title: 'Total Accounts', value: accounts.total, sub: `+${accounts.thisMonth} this month`, icon: <TeamOutlined />, color: '#fa8c16' },
    { title: 'Total Contacts', value: contacts.total, sub: 'In database', icon: <UserOutlined />, color: '#13c2c2' },
    { title: 'Conversion Rate', value: `${leads.conversionRate}%`, sub: `${leads.converted} converted`, icon: <RiseOutlined />, color: '#eb2f96' },
    { title: 'Activities Today', value: activities.today, sub: `${activities.overdue} overdue`, icon: <ClockCircleOutlined />, color: activities.overdue > 0 ? '#ff4d4f' : '#52c41a' },
    { title: 'Avg Deal Size', value: `OMR ${Number(opportunities.avgDealSize).toLocaleString()}`, sub: `${opportunities.won} won`, icon: <TrophyOutlined />, color: '#52c41a' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>CRM Analytics</Title>
        <Text type="secondary">Sales performance, pipeline health and activity overview</Text>
      </div>

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
        <Col span={12}>
          <Card title="Sales Pipeline by Stage" style={{ borderRadius: 12 }} size="small">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stageData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" name="Deals" radius={[0, 4, 4, 0]}>
                  {stageData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Leads by Source" style={{ borderRadius: 12 }} size="small">
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {sourceData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>No source data yet</div>}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={14}>
          <Card title="Monthly Leads Trend" style={{ borderRadius: 12 }} size="small">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#1890ff" strokeWidth={2} dot={{ fill: '#1890ff' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Deal Performance" style={{ borderRadius: 12 }} size="small">
            <div style={{ padding: '8px 0' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Win Rate</Text><Text strong style={{ color: '#52c41a' }}>{opportunities.winRate}%</Text>
                </div>
                <Progress percent={opportunities.winRate} strokeColor="#52c41a" showInfo={false} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Lead Conversion</Text><Text strong style={{ color: '#1890ff' }}>{leads.conversionRate}%</Text>
                </div>
                <Progress percent={leads.conversionRate} strokeColor="#1890ff" showInfo={false} />
              </div>
              <Row gutter={12} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{opportunities.won}</div>
                    <Text style={{ fontSize: 11 }}>Won</Text>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f' }}>{opportunities.lost}</div>
                    <Text style={{ fontSize: 11 }}>Lost</Text>
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={14}>
          <Card title="Top Accounts by Pipeline Value" style={{ borderRadius: 12 }} size="small">
            <Table dataSource={accounts.top || []} rowKey="accountName" size="small" pagination={false}
              columns={[
                { title: 'Account', dataIndex: 'accountName', render: (v: string) => <Text strong>{v}</Text> },
                { title: 'Deals', dataIndex: 'oppCount', render: (v: number) => <Tag color="blue">{v}</Tag> },
                { title: 'Pipeline Value', dataIndex: 'totalValue', render: (v: number) => <Text strong style={{ color: '#52c41a' }}>OMR {Number(v).toLocaleString()}</Text> },
              ]} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Lead Status Breakdown" style={{ borderRadius: 12 }} size="small">
            {(leads.byStatus || []).map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 13 }}>{s.status || 'Unknown'}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 6, background: '#f0f0f0', borderRadius: 3 }}>
                    <div style={{ width: `${Math.round((Number(s.count) / leads.total) * 100)}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                  </div>
                  <Tag color={COLORS[i % COLORS.length]}>{s.count}</Tag>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
