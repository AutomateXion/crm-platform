import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Select, Typography, Row, Col, Tag, Space, Statistic, Input, Empty } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import salesApi from '../../services/salesApi';

const { Title, Text } = Typography;
const { Option } = Select;

const TYPE_COLORS: Record<string, string> = {
  JOURNAL: '#1890ff', PAYMENT: '#ff4d4f', RECEIPT: '#52c41a',
  CONTRA: '#2E6DA4', DEBIT_NOTE: '#fa8c16', CREDIT_NOTE: '#13c2c2',
};

export default function GeneralLedgerPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    salesApi.get('/sales/chart-of-accounts').then(r => setAccounts(r.data || [])).catch(() => {});
    // Set default date range (current month)
    const now = new Date();
    setFromDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
    setToDate(new Date().toISOString().slice(0, 10));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await salesApi.get('/sales/general-ledger', {
        params: {
          accountId: selectedAccount || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page, limit: 50,
        }
      });
      setData(r.data.data || []);
      setSummary(r.data.summary || {});
      setTotal(r.data.total || 0);
      setSearched(true);
    } catch {} finally { setLoading(false); }
  }, [selectedAccount, fromDate, toDate, page]);

  const columns = [
    {
      title: 'Date', dataIndex: 'voucherDate', width: 100,
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      title: 'Voucher #', dataIndex: 'voucherNumber', width: 120,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Type', dataIndex: 'voucherType', width: 100,
      render: (v: string) => <Tag color={TYPE_COLORS[v] || '#8c8c8c'} style={{ fontSize: 10 }}>{v?.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Account', width: 200,
      render: (_: any, r: any) => (
        <span>
          <Text style={{ fontFamily: 'monospace', color: '#8c8c8c', marginRight: 8 }}>{r.accountCode}</Text>
          <Text>{r.accountName}</Text>
        </span>
      ),
    },
    {
      title: 'Description', dataIndex: 'description',
      render: (v: string, r: any) => v || r.voucherDescription || '—',
    },
    { title: 'Reference', dataIndex: 'reference', width: 120, render: (v: string) => v || '—' },
    { title: 'Cost Center', dataIndex: 'costCenter', width: 100, render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    {
      title: 'Debit (OMR)', dataIndex: 'debitAmount', width: 120, align: 'right' as const,
      render: (v: number) => Number(v) > 0 ? <Text strong style={{ color: '#1890ff' }}>OMR {Number(v).toFixed(3)}</Text> : '—',
    },
    {
      title: 'Credit (OMR)', dataIndex: 'creditAmount', width: 120, align: 'right' as const,
      render: (v: number) => Number(v) > 0 ? <Text strong style={{ color: '#2E6DA4' }}>OMR {Number(v).toFixed(3)}</Text> : '—',
    },
    {
      title: 'Balance (OMR)', dataIndex: 'runningBalance', width: 130, align: 'right' as const,
      render: (v: number) => (
        <Text strong style={{ color: Number(v) >= 0 ? '#52c41a' : '#ff4d4f' }}>
          OMR {Math.abs(Number(v)).toFixed(3)} {Number(v) < 0 ? 'Cr' : 'Dr'}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>General Ledger</Title>
          <Text type="secondary">View all posted transactions by account with running balance</Text>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Account</Text>
            <Select showSearch placeholder="All accounts" allowClear style={{ width: '100%' }}
              value={selectedAccount || undefined} onChange={v => setSelectedAccount(v || '')}
              optionFilterProp="children">
              {accounts.map(a => (
                <Option key={a.accountId} value={a.accountId}>
                  <span style={{ fontFamily: 'monospace', marginRight: 8, color: '#8c8c8c' }}>{a.accountCode}</span>
                  {a.accountName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>From Date</Text>
            <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </Col>
          <Col span={5}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>To Date</Text>
            <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </Col>
          <Col span={4} style={{ paddingTop: 22 }}>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => { setPage(1); load(); }} block>
              Generate Ledger
            </Button>
          </Col>
          <Col span={2} style={{ paddingTop: 22 }}>
            <Button icon={<FilterOutlined />} onClick={() => { setSelectedAccount(''); setFromDate(''); setToDate(''); setData([]); setSearched(false); }} block>
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      {searched && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }} size="small">
              <Statistic title="Total Debit" value={`OMR ${Number(summary.totalDebit || 0).toFixed(3)}`}
                valueStyle={{ color: '#1890ff', fontSize: 18 }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ borderRadius: 12, borderLeft: '4px solid #2E6DA4' }} size="small">
              <Statistic title="Total Credit" value={`OMR ${Number(summary.totalCredit || 0).toFixed(3)}`}
                valueStyle={{ color: '#2E6DA4', fontSize: 18 }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }} size="small">
              <Statistic title="Net Balance" value={`OMR ${Math.abs(Number(summary.netBalance || 0)).toFixed(3)}`}
                suffix={Number(summary.netBalance || 0) < 0 ? 'Cr' : 'Dr'}
                valueStyle={{ color: Number(summary.netBalance || 0) >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 18 }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ borderRadius: 12, borderLeft: '4px solid #fa8c16' }} size="small">
              <Statistic title="Total Entries" value={total}
                valueStyle={{ color: '#fa8c16', fontSize: 18 }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Ledger Table */}
      <Card style={{ borderRadius: 12 }}>
        {!searched ? (
          <Empty description="Select filters and click 'Generate Ledger' to view transactions" />
        ) : (
          <Table
            dataSource={data} columns={columns} rowKey="lineId"
            loading={loading} size="small"
            pagination={{ current: page, total, pageSize: 50, onChange: p => { setPage(p); load(); }, showTotal: t => `${t} entries` }}
            summary={() => data.length > 0 ? (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 700 }}>
                  <Table.Summary.Cell index={0} colSpan={7}>
                    <Text strong>Page Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} align="right">
                    <Text strong style={{ color: '#1890ff' }}>
                      OMR {data.reduce((s, r) => s + Number(r.debitAmount || 0), 0).toFixed(3)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={8} align="right">
                    <Text strong style={{ color: '#2E6DA4' }}>
                      OMR {data.reduce((s, r) => s + Number(r.creditAmount || 0), 0).toFixed(3)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={9} />
                </Table.Summary.Row>
              </Table.Summary>
            ) : null}
          />
        )}
      </Card>
    </div>
  );
}
