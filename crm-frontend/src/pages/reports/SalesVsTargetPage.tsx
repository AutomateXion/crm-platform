import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Row, Col, Table, Tag, Space, Modal, Form, Input, InputNumber, Select, Statistic, Progress, Popconfirm, message, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, TrophyOutlined, FilePdfOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import axios from 'axios';
import api from '../../services/api';
import { downloadPDF, printDocument } from '../../utils/pdfGenerator';
import ExportButton from '../../components/common/ExportButton';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../hooks/useCompanySettings';

const { Title, Text } = Typography;
const { Option } = Select;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function SalesVsTargetPage() {
  const [report, setReport] = useState<any>(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form] = Form.useForm();

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const [reportR, targetsR] = await Promise.allSettled([
        sApi.get('/sales/sales-vs-target', { params: { year } }),
        sApi.get('/sales/sales-targets', { params: { year } }),
      ]);
      if (reportR.status === 'fulfilled') setReport(reportR.value.data);
      if (targetsR.status === 'fulfilled') setTargets(targetsR.value.data || []);
    } catch {} finally { setLoading(false); }
  }, [year]);

  useEffect(() => { loadReport(); }, [loadReport]);
  useEffect(() => { api.get('/users', { params: { limit: 100 } }).then(r => setUsers(r.data.data || r.data || [])).catch(() => {}); }, []);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editRecord) await sApi.put(`/sales/sales-targets/${editRecord.target_id}`, values);
      else await sApi.post('/sales/sales-targets', values);
      message.success('Target saved!');
      setModalOpen(false); form.resetFields(); loadReport();
    } catch (e: any) { message.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await sApi.delete(`/sales/sales-targets/${id}`);
    message.success('Target deleted'); loadReport();
  };

  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ periodType: 'MONTHLY', periodYear: year, periodMonth: new Date().getMonth() + 1 });
    setModalOpen(true);
  };

  const s = report?.summary || {};
  const monthly = report?.monthly || [];
  const bySalesman = report?.bySalesman || [];

  const achievementColor = (pct: number) => pct >= 100 ? '#52c41a' : pct >= 80 ? '#fa8c16' : '#ff4d4f';

  const targetCols = [
    { title:'Period', render:(_:any, r:any) => <Tag color="blue">{r.period_month ? MONTHS[r.period_month-1] : `Q${r.period_quarter}`} {r.period_year}</Tag> },
    { title:'Salesman', dataIndex:'salesman_name', render:(v:string) => v || <Text type="secondary">All Salesmen</Text> },
    { title:'Target Amount', dataIndex:'target_amount', align:'right' as const, render:(v:number) => <Text strong style={{color:'#2E6DA4'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Notes', dataIndex:'notes', render:(v:string) => v || '—' },
    { title:'', render:(_:any, r:any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditRecord(r); form.setFieldsValue({ ...r, periodType: r.period_type, periodYear: r.period_year, periodMonth: r.period_month, periodQuarter: r.period_quarter, targetAmount: r.target_amount, targetQty: r.target_qty, salesmanId: r.salesman_id, salesmanName: r.salesman_name }); setModalOpen(true); }} />
        <Popconfirm title="Delete target?" onConfirm={() => handleDelete(r.target_id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  const monthlyCols = [
    { title:'Month', dataIndex:'month', render:(v:string) => <Tag color="blue">{v}</Tag> },
    { title:'Target (OMR)', dataIndex:'target', align:'right' as const, render:(v:number) => v > 0 ? <Text style={{color:'#2E6DA4'}}>OMR {v.toFixed(3)}</Text> : <Text type="secondary">No target</Text> },
    { title:'Actual (OMR)', dataIndex:'actual', align:'right' as const, render:(v:number) => <Text strong style={{color:'#52c41a'}}>OMR {v.toFixed(3)}</Text> },
    { title:'Variance', dataIndex:'variance', align:'right' as const, render:(v:number) => <Text strong style={{color:v>=0?'#52c41a':'#ff4d4f'}}>{v>=0?'+':''}OMR {v.toFixed(3)}</Text> },
    { title:'Achievement', dataIndex:'achievement', align:'center' as const, render:(v:number, r:any) => r.target > 0 ? (
      <Space>
        <Progress percent={Math.min(v,100)} size="small" strokeColor={achievementColor(v)} style={{width:80,margin:0}} showInfo={false} />
        <Text strong style={{color:achievementColor(v)}}>{v}%</Text>
      </Space>
    ) : <Text type="secondary">—</Text> },
    { title:'Invoices', dataIndex:'invoiceCount', align:'center' as const },
  ];

  const salesmanCols = [
    { title:'Salesman', dataIndex:'salesmanName', render:(v:string) => <><Text strong>{v||'Unassigned'}</Text></> },
    { title:'Target (OMR)', dataIndex:'target', align:'right' as const, render:(v:number) => v > 0 ? <Text style={{color:'#2E6DA4'}}>OMR {v.toFixed(3)}</Text> : <Text type="secondary">No target</Text> },
    { title:'Actual (OMR)', dataIndex:'actual', align:'right' as const, render:(v:number) => <Text strong style={{color:'#52c41a'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Variance', dataIndex:'variance', align:'right' as const, render:(v:number) => <Text strong style={{color:v>=0?'#52c41a':'#ff4d4f'}}>{v>=0?'+':''}OMR {Number(v).toFixed(3)}</Text> },
    { title:'Achievement', dataIndex:'achievement', align:'center' as const, render:(v:number, r:any) => r.target > 0 ? (
      <Space>
        <Progress percent={Math.min(v,100)} size="small" strokeColor={achievementColor(v)} style={{width:80,margin:0}} showInfo={false} />
        <Text strong style={{color:achievementColor(v)}}>{v}%</Text>
      </Space>
    ) : <Text type="secondary">—</Text> },
  ];

  const { settings: company } = useCompanySettings();

  const PDFContent = () => (
    <div id="sales-target-pdf" style={{ width:'210mm', background:'#fff', padding:'12mm 15mm', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#333' }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #2E6DA4', paddingBottom:14, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#2E6DA4' }}>{company?.companyName || 'My Company'}</div>
          <div style={{ fontSize:10, color:'#666' }}>{[company?.addressLine1, company?.city, company?.country].filter(Boolean).join(', ') || 'Muscat, Sultanate of Oman'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#2E6DA4' }}>SALES VS TARGET REPORT</div>
          <div style={{ fontSize:12, color:'#888', fontWeight:600 }}>Year: {year}</div>
          <div style={{ fontSize:9, color:'#aaa' }}>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</div>
        </div>
      </div>
      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
        {[
          { label:'Total Target', value:`OMR ${Number(s.totalTarget||0).toFixed(3)}`, color:'#2E6DA4' },
          { label:'Total Actual', value:`OMR ${Number(s.totalActual||0).toFixed(3)}`, color:'#52c41a' },
          { label:'Variance', value:`${s.totalVariance>=0?'+':''}OMR ${Math.abs(Number(s.totalVariance||0)).toFixed(3)}`, color:Number(s.totalVariance||0)>=0?'#52c41a':'#ff4d4f' },
          { label:'Achievement', value:`${s.achievement||0}%`, color:achievementColor(s.achievement||0) },
        ].map((k,i) => (
          <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}40`, borderRadius:6, padding:'8px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:9, color:'#666', marginTop:2 }}>{k.label}</div>
          </div>
        ))}
      </div>
      {/* Monthly Table */}
      <div style={{ background:'#2E6DA415', borderLeft:'4px solid #2E6DA4', padding:'6px 10px', fontWeight:700, color:'#2E6DA4', marginBottom:8, fontSize:11 }}>MONTHLY BREAKDOWN</div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9, marginBottom:16 }}>
        <thead><tr style={{ background:'#2E6DA4', color:'#fff' }}>
          {['Month','Target (OMR)','Actual (OMR)','Variance (OMR)','Achievement %','Invoices'].map(h=><th key={h} style={{ padding:'7px 8px', textAlign:'left' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {monthly.map((row:any,i:number) => (
            <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
              <td style={{ padding:'5px 8px', fontWeight:600 }}>{row.month}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#2E6DA4' }}>{row.target>0?`OMR ${row.target.toFixed(3)}`:'No target'}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#52c41a', fontWeight:600 }}>OMR {row.actual.toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:row.variance>=0?'#52c41a':'#ff4d4f', fontWeight:600 }}>{row.variance>=0?'+':''}OMR {row.variance.toFixed(3)}</td>
              <td style={{ padding:'5px 8px', textAlign:'right', color:achievementColor(row.achievement), fontWeight:700 }}>{row.target>0?`${row.achievement}%`:'—'}</td>
              <td style={{ padding:'5px 8px', textAlign:'center' }}>{row.invoiceCount}</td>
            </tr>
          ))}
          <tr style={{ background:'#2E6DA4', color:'#fff', fontWeight:700 }}>
            <td style={{ padding:'8px' }}>TOTAL</td>
            <td style={{ padding:'8px', textAlign:'right' }}>OMR {Number(s.totalTarget||0).toFixed(3)}</td>
            <td style={{ padding:'8px', textAlign:'right' }}>OMR {Number(s.totalActual||0).toFixed(3)}</td>
            <td style={{ padding:'8px', textAlign:'right' }}>{Number(s.totalVariance||0)>=0?'+':''}OMR {Math.abs(Number(s.totalVariance||0)).toFixed(3)}</td>
            <td style={{ padding:'8px', textAlign:'right' }}>{s.achievement||0}%</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      {/* By Salesman */}
      {bySalesman.length > 0 && (
        <>
          <div style={{ background:'#1890ff15', borderLeft:'4px solid #1890ff', padding:'6px 10px', fontWeight:700, color:'#1890ff', marginBottom:8, fontSize:11 }}>BY SALESMAN</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9 }}>
            <thead><tr style={{ background:'#1890ff', color:'#fff' }}>
              {['Salesman','Target (OMR)','Actual (OMR)','Variance (OMR)','Achievement %'].map(h=><th key={h} style={{ padding:'7px 8px', textAlign:'left' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {bySalesman.map((row:any,i:number) => (
                <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
                  <td style={{ padding:'5px 8px', fontWeight:600 }}>{row.salesmanName||'Unassigned'}</td>
                  <td style={{ padding:'5px 8px', textAlign:'right', color:'#2E6DA4' }}>{row.target>0?`OMR ${Number(row.target).toFixed(3)}`:'No target'}</td>
                  <td style={{ padding:'5px 8px', textAlign:'right', color:'#52c41a', fontWeight:600 }}>OMR {Number(row.actual).toFixed(3)}</td>
                  <td style={{ padding:'5px 8px', textAlign:'right', color:row.variance>=0?'#52c41a':'#ff4d4f' }}>{row.variance>=0?'+':''}OMR {Number(row.variance).toFixed(3)}</td>
                  <td style={{ padding:'5px 8px', textAlign:'right', color:achievementColor(row.achievement), fontWeight:700 }}>{row.target>0?`${row.achievement}%`:'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <div style={{ marginTop:16, paddingTop:10, borderTop:'1px solid #e0e0e0', fontSize:8, color:'#aaa', display:'flex', justifyContent:'space-between' }}>
        <span>All amounts in Omani Riyal (OMR)</span><span>Confidential</span><span>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</span>
      </div>
    </div>
  );

  return (
    <div id="sales-vs-target-report">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <Title level={4} style={{ margin:0 }}>Sales vs Target</Title>
          <Text type="secondary">Compare actual sales against set targets by month and salesman</Text>
        </div>
        <Space>
          <Select value={year} onChange={setYear} style={{ width:100 }}>
            {[2024,2025,2026,2027].map(y => <Option key={y} value={y}>{y}</Option>)}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Set Target</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => setShowPDF(true)} disabled={!report}>View PDF</Button>
          <ExportButton config={{ filename:'sales-vs-target', data: monthly }} />
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={12} style={{ marginBottom:16 }}>
        <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #2E6DA4', textAlign:'center' }}>
          <Statistic title="Total Target" prefix="OMR " value={Number(s.totalTarget||0).toFixed(3)} valueStyle={{ color:'#2E6DA4', fontSize:18 }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #52c41a', textAlign:'center' }}>
          <Statistic title="Total Actual" prefix="OMR " value={Number(s.totalActual||0).toFixed(3)} valueStyle={{ color:'#52c41a', fontSize:18 }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${Number(s.totalVariance||0)>=0?'#52c41a':'#ff4d4f'}`, textAlign:'center' }}>
          <Statistic title="Variance" prefix={Number(s.totalVariance||0)>=0?'+OMR ':'-OMR '} value={Math.abs(Number(s.totalVariance||0)).toFixed(3)} valueStyle={{ color:Number(s.totalVariance||0)>=0?'#52c41a':'#ff4d4f', fontSize:18 }} /></Card></Col>
        <Col span={6}><Card size="small" style={{ borderRadius:12, borderTop:`3px solid ${achievementColor(s.achievement||0)}`, textAlign:'center' }}>
          <div style={{ padding:'12px 0' }}>
            <div style={{ fontSize:24, fontWeight:700, color:achievementColor(s.achievement||0) }}>{s.achievement||0}%</div>
            <Progress percent={Math.min(s.achievement||0, 100)} showInfo={false} strokeColor={achievementColor(s.achievement||0)} style={{ margin:'4px 0 0' }} />
            <div style={{ fontSize:11, color:'#8c8c8c', marginTop:4 }}>Overall Achievement</div>
          </div>
        </Card></Col>
      </Row>

      <Tabs defaultActiveKey="monthly" items={[
        {
          key:'monthly', label:'📅 Monthly Overview',
          children: (
            <>
              {monthly.some((m:any) => m.target > 0 || m.actual > 0) && (
                <Card style={{ borderRadius:12, marginBottom:12 }} size="small">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize:11 }} />
                      <YAxis tick={{ fontSize:11 }} />
                      <Tooltip formatter={(v:any) => `OMR ${Number(v).toFixed(3)}`} />
                      <Legend />
                      <Bar dataKey="target" fill="#2E6DA4" name="Target" opacity={0.8} />
                      <Bar dataKey="actual" fill="#52c41a" name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
              <Card style={{ borderRadius:12 }} size="small">
                <Table dataSource={monthly} columns={monthlyCols} rowKey="month" size="small" pagination={false} loading={loading} />
              </Card>
            </>
          )
        },
        {
          key:'salesman', label:'👤 By Salesman',
          children: (
            <Card style={{ borderRadius:12 }} size="small">
              {bySalesman.length > 0 ? (
                <>
                  <Card style={{ borderRadius:12, marginBottom:12 }} size="small">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={bySalesman}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="salesmanName" tick={{ fontSize:10 }} />
                        <YAxis tick={{ fontSize:10 }} />
                        <Tooltip formatter={(v:any) => `OMR ${Number(v).toFixed(3)}`} />
                        <Legend />
                        <Bar dataKey="target" fill="#2E6DA4" name="Target" opacity={0.8} />
                        <Bar dataKey="actual" fill="#52c41a" name="Actual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                  <Table dataSource={bySalesman} columns={salesmanCols} rowKey="salesmanId" size="small" pagination={false} loading={loading} />
                </>
              ) : <Text type="secondary">No salesman targets set. Click "Set Target" to add targets per salesman.</Text>}
            </Card>
          )
        },
        {
          key:'targets', label:'🎯 Manage Targets',
          children: (
            <Card style={{ borderRadius:12 }} size="small"
              extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreate}>Add Target</Button>}>
              <Table dataSource={targets} columns={targetCols} rowKey="target_id" size="small" pagination={{ pageSize:10 }} loading={loading} />
            </Card>
          )
        },
      ]} />

      {/* Set Target Modal */}
      <Modal title={editRecord ? 'Edit Target' : 'Set Sales Target'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop:12 }}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="periodType" label="Period Type" rules={[{required:true}]}>
              <Select><Option value="MONTHLY">Monthly</Option><Option value="QUARTERLY">Quarterly</Option><Option value="YEARLY">Yearly</Option></Select>
            </Form.Item></Col>
            <Col span={8}><Form.Item name="periodYear" label="Year" rules={[{required:true}]}>
              <Select>{[2024,2025,2026,2027].map(y=><Option key={y} value={y}>{y}</Option>)}</Select>
            </Form.Item></Col>
            <Col span={8}><Form.Item name="periodMonth" label="Month">
              <Select allowClear placeholder="All months">
                {MONTHS.map((m,i)=><Option key={i+1} value={i+1}>{m}</Option>)}
              </Select>
            </Form.Item></Col>
          </Row>
          <Form.Item name="salesmanId" label="Salesman (leave blank for overall target)">
            <Select allowClear showSearch optionFilterProp="children" placeholder="All salesmen..."
              onChange={(v) => { const u = users.find(u => u.userId === v); if(u) form.setFieldsValue({ salesmanName: u.fullName }); else form.setFieldsValue({ salesmanName: '' }); }}>
              {users.map(u => <Option key={u.userId} value={u.userId}>{u.fullName}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="salesmanName" hidden><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="targetAmount" label="Target Amount (OMR)" rules={[{required:true}]}>
              <InputNumber style={{ width:'100%' }} min={0} step={100} precision={3} prefix="OMR" />
            </Form.Item></Col>
            <Col span={12}><Form.Item name="targetQty" label="Target Qty (optional)">
              <InputNumber style={{ width:'100%' }} min={0} />
            </Form.Item></Col>
          </Row>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>Save Target</Button>
          </div>
        </Form>
      </Modal>

      {/* PDF Modal */}
      <Modal open={showPDF} onCancel={() => setShowPDF(false)} footer={null} width="100vw" style={{ top:0, padding:0, maxWidth:'100vw' }} styles={{ body:{ height:'95vh', overflow:'auto', padding:16, background:'#f5f5f5' } }} title="Sales vs Target — PDF Preview">
        <Space style={{ marginBottom:16 }}>
          <Button icon={<PrinterOutlined />} onClick={() => printDocument('sales-target-pdf')}>Print</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('sales-target-pdf', `sales-vs-target-${year}.pdf`)}>Download PDF</Button>
        </Space>
        <PDFContent />
      </Modal>
    </div>
  );
}
