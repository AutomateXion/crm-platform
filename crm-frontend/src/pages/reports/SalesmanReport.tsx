import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, Typography, Tag, Space, Statistic, DatePicker, Progress } from 'antd';
import { DownloadOutlined, ReloadOutlined, UserOutlined, TrophyOutlined } from '@ant-design/icons';
import axios from 'axios';
import ExportButton from '../../components/common/ExportButton';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const COLORS = ['#1890ff','#52c41a','#722ed1','#fa8c16','#eb2f96','#13c2c2','#f5222d','#faad14'];

export default function SalesmanReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) { params.from = dateRange[0].toISOString(); params.to = dateRange[1].toISOString(); }
      const r = await sApi.get('/sales/reports/salesman', { params });
      setData(r.data);
    } catch {} finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const exportCSV = () => {
    if (!data) return;
    const headers = 'Salesman,Invoices,Total Sales,Collected,Outstanding';
    const rows = (data.bySalesman || []).map((r: any) => [
      r.salesmanName, r.invoiceCount, Number(r.totalSales).toFixed(3),
      Number(r.totalCollected).toFixed(3), Number(r.totalOutstanding).toFixed(3)
    ].join(','));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' }));
    a.download = `salesman-report-${dayjs().format('YYYY-MM-DD')}.csv`; a.click();
  };

  const salesCols = [
    { title: '#', width: 40, render: (_: any, __: any, i: number) => (
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: i < 3 ? '#faad14' : '#f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i+1}</div>
    )},
    { title: 'Salesman', dataIndex: 'salesmanName', render: (v: string, _: any, i: number) => (
      <Space><Tag color={COLORS[i % COLORS.length]} style={{ border: 'none' }}><UserOutlined /></Tag><Text strong>{v || 'Unassigned'}</Text></Space>
    )},
    { title: 'Invoices', dataIndex: 'invoiceCount', align: 'center' as const, render: (v: number) => <Tag color="blue">{v}</Tag> },
    { title: 'Total Sales', dataIndex: 'totalSales', align: 'right' as const, render: (v: number) => <Text strong style={{ color: '#52c41a' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Collected', dataIndex: 'totalCollected', align: 'right' as const, render: (v: number) => <Text style={{ color: '#1890ff' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Outstanding', dataIndex: 'totalOutstanding', align: 'right' as const, render: (v: number) => <Text style={{ color: '#ff4d4f' }}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Collection %', align: 'right' as const, render: (_: any, r: any) => {
      const pct = r.totalSales > 0 ? Math.round((r.totalCollected / r.totalSales) * 100) : 0;
      return <Progress percent={pct} size="small" strokeColor="#52c41a" style={{ margin: 0, width: 100 }} />;
    }},
  ];

  const quotCols = [
    { title: 'Salesman', dataIndex: 'salesmanName', render: (v: string, _: any, i: number) => (
      <Space><Tag color={COLORS[i % COLORS.length]} style={{ border: 'none' }}><UserOutlined /></Tag><Text strong>{v || 'Unassigned'}</Text></Space>
    )},
    { title: 'Quotations', dataIndex: 'quotationCount', align: 'center' as const, render: (v: number) => <Tag>{v}</Tag> },
    { title: 'Total Quoted', dataIndex: 'totalQuoted', align: 'right' as const, render: (v: number) => <Text>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Converted', dataIndex: 'converted', align: 'center' as const, render: (v: number) => <Tag color="green">{v}</Tag> },
    { title: 'Conversion %', align: 'center' as const, render: (_: any, r: any) => {
      const pct = r.quotationCount > 0 ? Math.round((r.converted / r.quotationCount) * 100) : 0;
      return <Tag color={pct >= 50 ? 'green' : pct >= 25 ? 'orange' : 'red'}>{pct}%</Tag>;
    }},
  ];

  const visitCols = [
    { title: 'Salesman', dataIndex: 'salesman_name', render: (v: string, _: any, i: number) => (
      <Space><Tag color={COLORS[i % COLORS.length]} style={{ border: 'none' }}><UserOutlined /></Tag><Text strong>{v || 'Unknown'}</Text></Space>
    )},
    { title: 'Total Visits', dataIndex: 'visit_count', align: 'center' as const, render: (v: number) => <Tag color="purple">{v}</Tag> },
  ];

  const totalSales = (data?.bySalesman || []).reduce((s: number, r: any) => s + Number(r.totalSales || 0), 0);
  const totalInvoices = (data?.bySalesman || []).reduce((s: number, r: any) => s + Number(r.invoiceCount || 0), 0);
  const totalVisits = (data?.visits || []).reduce((s: number, r: any) => s + Number(r.visit_count || 0), 0);
  const maxSales = Math.max(...(data?.bySalesman || []).map((r: any) => Number(r.totalSales || 0)), 1);

  return (
    <div id="salesman-report">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Salesman Performance Report</Title>
          <Text type="secondary">Sales, quotations and visit activity by salesman</Text>
        </div>
        <Space>
          <RangePicker onChange={dates => setDateRange(dates)} />
          <Button onClick={load} loading={loading} icon={<ReloadOutlined />}>Refresh</Button>
          <ExportButton config={{ elementId:'salesman-report-report', filename:'salesman-report', data: data?.bySalesman || [] }} />
          <Button icon={<DownloadOutlined />} onClick={exportCSV}>Export</Button>
        </Space>
      </div>

      {/* KPIs */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #1890ff' }}><Statistic title="Active Salesmen" value={(data?.bySalesman || []).length} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #52c41a' }}><Statistic title="Total Sales" prefix="OMR " value={totalSales.toFixed(3)} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #722ed1' }}><Statistic title="Total Invoices" value={totalInvoices} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius: 12, borderTop: '3px solid #fa8c16' }}><Statistic title="Total Visits" value={totalVisits} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
      </Row>

      {/* Sales Performance Chart */}
      {(data?.bySalesman || []).length > 0 && (
      <Card title={<><TrophyOutlined /> Sales Performance</>} size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
          {(data?.bySalesman || []).map((r: any, i: number) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text strong style={{ fontSize: 13 }}><UserOutlined /> {r.salesmanName || 'Unassigned'}</Text>
                <Text style={{ color: COLORS[i % COLORS.length] }}>OMR {Number(r.totalSales || 0).toFixed(3)}</Text>
              </div>
              <div style={{ background: '#f5f5f5', borderRadius: 4, height: 10 }}>
                <div style={{ width: `${(Number(r.totalSales || 0) / maxSales) * 100}%`, background: COLORS[i % COLORS.length], height: '100%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      <Row gutter={12}>
        <Col span={14}>
          <Card title="💰 Sales by Salesman" size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
            <Table dataSource={data?.bySalesman} columns={salesCols} rowKey="salesmanId" size="small" loading={loading} pagination={false}
              summary={() => (
                <Table.Summary.Row style={{ background: '#fafafa' }}>
                  <Table.Summary.Cell index={0} colSpan={2}><Text strong>Total</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center"><Tag color="blue">{totalInvoices}</Tag></Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right"><Text strong style={{ color: '#52c41a' }}>OMR {totalSales.toFixed(3)}</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={4} /><Table.Summary.Cell index={5} /><Table.Summary.Cell index={6} />
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="📍 Visits by Salesman" size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
            <Table dataSource={data?.visits} columns={visitCols} rowKey="salesman_id" size="small" loading={loading} pagination={false} />
          </Card>
        </Col>
      </Row>

      <Card title="📋 Quotations by Salesman" size="small" style={{ borderRadius: 12 }}>
        <Table dataSource={data?.quotationsBySalesman} columns={quotCols} rowKey="salesmanId" size="small" loading={loading} pagination={false} />
      </Card>
    </div>
  );
}
