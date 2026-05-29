import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Typography, Tag, Space, Select, DatePicker,
  Button, Input, Row, Col, Timeline, Avatar, Tooltip, Badge,
} from 'antd';
import { SearchOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { auditApi } from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'success', UPDATE: 'processing', DELETE: 'error',
  LOGIN: 'default', LOGOUT: 'default', EXPORT: 'warning',
};

const ACTION_ICONS: Record<string, string> = {
  CREATE: '✅', UPDATE: '✏️', DELETE: '🗑️', LOGIN: '🔑', LOGOUT: '🚪', EXPORT: '📤',
};

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const [expandedLog, setExpandedLog] = useState<any>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditApi.getLogs({ page, limit: 50, ...filters });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch {}
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const columns = [
    {
      title: 'Timestamp', dataIndex: 'timestamp', key: 'ts', width: 160,
      render: (v: string) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>{dayjs(v).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{dayjs(v).format('HH:mm:ss')}</div>
        </div>
      ),
    },
    {
      title: 'User', key: 'user',
      render: (_: any, r: any) => (
        <Space>
          <Avatar size={28} style={{ background: '#1890ff', fontSize: 11, fontWeight: 700 }}>
            {r.userName?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{r.userName}</div>
            <div style={{ fontSize: 11, color: '#bfbfbf' }}>{r.ipAddress}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Action', dataIndex: 'action', key: 'action', width: 120,
      render: (v: string) => (
        <Tag color={ACTION_COLORS[v] || 'default'} style={{ borderRadius: 20, fontWeight: 600 }}>
          {ACTION_ICONS[v]} {v}
        </Tag>
      ),
    },
    {
      title: 'Module', dataIndex: 'module', key: 'module', width: 100,
      render: (v: string) => <Tag style={{ borderRadius: 6, textTransform: 'uppercase', fontSize: 10 }}>{v}</Tag>,
    },
    {
      title: 'Record', key: 'record',
      render: (_: any, r: any) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>{r.entityLabel || r.entityId}</div>
          <div style={{ fontSize: 11, color: '#bfbfbf' }}>{r.entityType}</div>
        </div>
      ),
    },
    {
      title: 'Changes', key: 'changes', width: 80,
      render: (_: any, r: any) => r.changes?.length > 0
        ? <Badge count={r.changes.length} style={{ background: '#1890ff' }} />
        : <Text type="secondary">—</Text>,
    },
    {
      title: '', key: 'expand', width: 60,
      render: (_: any, r: any) => r.changes?.length > 0 && (
        <Button size="small" type="text" onClick={() => setExpandedLog(expandedLog?.timestamp === r.timestamp ? null : r)}>
          {expandedLog?.timestamp === r.timestamp ? '▲' : '▼'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Audit Trail</Title>
        <Text type="secondary">Complete history of all actions performed in the system</Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={[12, 8]}>
          <Col xs={24} sm={8}>
            <Select placeholder="Filter by action" allowClear style={{ width: '100%' }}
              onChange={v => setFilters((p: any) => ({ ...p, action: v }))}>
              {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT'].map(a =>
                <Option key={a} value={a}>{ACTION_ICONS[a]} {a}</Option>
              )}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select placeholder="Filter by module" allowClear style={{ width: '100%' }}
              onChange={v => setFilters((p: any) => ({ ...p, module: v }))}>
              {['core', 'contacts', 'leads', 'sales', 'activities', 'support', 'marketing'].map(m =>
                <Option key={m} value={m}>{m}</Option>
              )}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker style={{ width: '100%' }}
              onChange={dates => setFilters((p: any) => ({
                ...p,
                from: dates?.[0]?.toISOString(),
                to: dates?.[1]?.toISOString(),
              }))}
            />
          </Col>
          <Col xs={24} sm={2}>
            <Button icon={<ReloadOutlined />} onClick={loadLogs} style={{ width: '100%', borderRadius: 8 }} />
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={logs} columns={columns} rowKey="_id"
          loading={loading} size="small"
          pagination={{ current: page, total, pageSize: 50, onChange: setPage, showTotal: t => `${t} log entries` }}
          expandable={{
            expandedRowKeys: expandedLog ? [expandedLog._id] : [],
            expandedRowRender: (r: any) => (
              <div style={{ padding: '8px 16px', background: '#fafafa', borderRadius: 8 }}>
                <Text strong style={{ fontSize: 12 }}>Changes:</Text>
                {r.changes?.map((c: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                    <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.field}</Tag>
                    <Text delete style={{ color: '#ff4d4f', fontSize: 12 }}>{c.oldValue || '(empty)'}</Text>
                    <Text style={{ color: '#8c8c8c' }}>→</Text>
                    <Text style={{ color: '#52c41a', fontSize: 12 }}>{c.newValue || '(empty)'}</Text>
                  </div>
                ))}
              </div>
            ),
            showExpandColumn: false,
          }}
        />
      </Card>
    </div>
  );
}
