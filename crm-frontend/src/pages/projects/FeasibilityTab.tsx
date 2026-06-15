import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Input, InputNumber, Select, Row, Col, Typography, Tag, Space,
  Table, message, Popconfirm, Divider, Statistic, Empty, Tooltip,
} from 'antd';
import { PlusOutlined, DeleteOutlined, CalculatorOutlined, SaveOutlined, FilePdfOutlined } from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { feasibilityApi } from '../../services/pmApi';

const { Title, Text } = Typography;
const { Option } = Select;

const VERDICT_COLORS: Record<string, string> = { 'GO': 'green', 'CAUTION': 'orange', 'NO-GO': 'red' };

export default function FeasibilityTab({ projectId, project }: { projectId: string; project?: any }) {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [scenarioName, setScenarioName] = useState('Base Case');
  const [discountRate, setDiscountRate] = useState(10);
  const [periodType, setPeriodType] = useState('YEARLY');
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [cashFlows, setCashFlows] = useState<any[]>([
    { period: 1, inflow: 0, outflow: 0 },
    { period: 2, inflow: 0, outflow: 0 },
    { period: 3, inflow: 0, outflow: 0 },
  ]);
  const [result, setResult] = useState<any>(null);
  const currency = project?.currencyCode || 'OMR';

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await feasibilityApi.getAll(projectId); setScenarios(r.data || []); }
    catch {} finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);

  // Live calculation (debounced-ish on demand)
  const calculate = useCallback(async () => {
    try {
      const r = await feasibilityApi.calculate({ initialInvestment, cashFlows, discountRate });
      setResult(r.data);
    } catch {}
  }, [initialInvestment, cashFlows, discountRate]);

  useEffect(() => { calculate(); }, [calculate]);

  const updateFlow = (i: number, key: string, val: any) => {
    const c = [...cashFlows]; c[i] = { ...c[i], [key]: val }; setCashFlows(c);
  };
  const addPeriod = () => setCashFlows([...cashFlows, { period: cashFlows.length + 1, inflow: 0, outflow: 0 }]);
  const removePeriod = (i: number) => setCashFlows(cashFlows.filter((_, x) => x !== i).map((cf, idx) => ({ ...cf, period: idx + 1 })));

  const resetForm = () => {
    setEditId(null); setScenarioName('Base Case'); setDiscountRate(Number(project?.defaultDiscountRate || 10));
    setPeriodType('YEARLY'); setInitialInvestment(0);
    setCashFlows([{ period: 1, inflow: 0, outflow: 0 }, { period: 2, inflow: 0, outflow: 0 }, { period: 3, inflow: 0, outflow: 0 }]);
  };

  const loadScenario = (s: any) => {
    setEditId(s.feasibilityId); setScenarioName(s.scenarioName); setDiscountRate(Number(s.discountRate));
    setPeriodType(s.periodType); setInitialInvestment(Number(s.initialInvestment));
    setCashFlows(s.cashFlows?.length ? s.cashFlows : [{ period: 1, inflow: 0, outflow: 0 }]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { projectId, scenarioName, discountRate, periodType, initialInvestment, cashFlows, currencyCode: currency };
      if (editId) await feasibilityApi.update(editId, payload);
      else await feasibilityApi.create(payload);
      message.success('Scenario saved'); resetForm(); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  // Build chart data — cumulative cash flow
  const chartData = (() => {
    let cum = -initialInvestment;
    const rows = [{ period: 'P0', net: -initialInvestment, cumulative: cum }];
    cashFlows.forEach((cf) => {
      const net = Number(cf.inflow || 0) - Number(cf.outflow || 0);
      cum += net;
      rows.push({ period: `P${cf.period}`, net, cumulative: Number(cum.toFixed(2)) });
    });
    return rows;
  })();

  const periodLabel = periodType === 'MONTHLY' ? 'months' : periodType === 'QUARTERLY' ? 'quarters' : 'years';

  const exportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const verdictColor = result?.verdict === 'GO' ? '#52c41a' : result?.verdict === 'CAUTION' ? '#fa8c16' : '#ff4d4f';
    w.document.write(`
      <html><head><title>Feasibility - ${project?.projectName || ''}</title>
      <style>body{font-family:Arial;padding:30px;color:#333}h1{color:#1f3864}table{width:100%;border-collapse:collapse;margin:12px 0}td,th{border:1px solid #ddd;padding:8px;text-align:right}th{background:#1f3864;color:#fff}.metric{display:inline-block;width:18%;text-align:center;padding:12px;margin:1%;border:1px solid #ddd;border-radius:8px}.verdict{font-size:24px;font-weight:bold;color:${verdictColor}}</style>
      </head><body>
      <h1>Investment Feasibility Report</h1>
      <h2>${project?.projectName || 'Project'} — ${scenarioName}</h2>
      <p>Client: ${project?.clientName || '—'} | Discount Rate: ${discountRate}% | Period: ${periodType}</p>
      <div style="text-align:center;margin:20px 0">
        <div class="metric"><div>NPV</div><b>${currency} ${Number(result?.npv||0).toLocaleString()}</b></div>
        <div class="metric"><div>IRR</div><b>${result?.irr!=null?result.irr+'%':'N/A'}</b></div>
        <div class="metric"><div>ROI</div><b>${Number(result?.roi||0).toFixed(1)}%</b></div>
        <div class="metric"><div>Payback</div><b>${result?.paybackPeriods!=null?result.paybackPeriods+' '+periodLabel:'N/A'}</b></div>
        <div class="metric"><div>PI</div><b>${Number(result?.profitabilityIndex||0).toFixed(2)}</b></div>
      </div>
      <p style="text-align:center">Verdict: <span class="verdict">${result?.verdict||'—'}</span></p>
      <table><tr><th>Period</th><th>Inflow</th><th>Outflow</th><th>Net</th></tr>
      <tr><td>Initial</td><td>—</td><td>${currency} ${Number(initialInvestment).toLocaleString()}</td><td>-${currency} ${Number(initialInvestment).toLocaleString()}</td></tr>
      ${cashFlows.map(cf => `<tr><td>P${cf.period}</td><td>${currency} ${Number(cf.inflow||0).toLocaleString()}</td><td>${currency} ${Number(cf.outflow||0).toLocaleString()}</td><td>${currency} ${(Number(cf.inflow||0)-Number(cf.outflow||0)).toLocaleString()}</td></tr>`).join('')}
      </table>
      <p style="margin-top:30px;font-size:11px;color:#888">Generated ${new Date().toLocaleString()} | AutomateXion CRM/ERP</p>
      </body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={14}>
          <Card title={<Space><CalculatorOutlined />Investment Appraisal Inputs</Space>} size="small"
            extra={editId && <Tag color="blue">Editing: {scenarioName}</Tag>}>
            <Row gutter={8} style={{ marginBottom: 8 }}>
              <Col span={10}><Text type="secondary">Scenario Name</Text><Input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Base Case" /></Col>
              <Col span={7}><Text type="secondary">Discount Rate %</Text><InputNumber style={{ width: '100%' }} value={discountRate} onChange={v => setDiscountRate(Number(v))} min={0} max={100} step={0.5} /></Col>
              <Col span={7}><Text type="secondary">Period Type</Text><Select style={{ width: '100%' }} value={periodType} onChange={setPeriodType}><Option value="MONTHLY">Monthly</Option><Option value="QUARTERLY">Quarterly</Option><Option value="YEARLY">Yearly</Option></Select></Col>
            </Row>
            <Row style={{ marginBottom: 12 }}>
              <Col span={24}><Text type="secondary">Initial Investment ({currency})</Text><InputNumber style={{ width: '100%' }} value={initialInvestment} onChange={v => setInitialInvestment(Number(v))} min={0} step={1000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Col>
            </Row>
            <Divider style={{ margin: '8px 0' }}>Cash Flow Projection</Divider>
            <Row gutter={8} style={{ fontWeight: 600, fontSize: 12, color: '#888', marginBottom: 4 }}>
              <Col span={4}>Period</Col><Col span={9}>Inflow</Col><Col span={9}>Outflow</Col><Col span={2}></Col>
            </Row>
            {cashFlows.map((cf, i) => (
              <Row gutter={8} key={i} style={{ marginBottom: 6 }}>
                <Col span={4}><Input value={`P${cf.period}`} disabled /></Col>
                <Col span={9}><InputNumber style={{ width: '100%' }} value={cf.inflow} onChange={v => updateFlow(i, 'inflow', Number(v))} min={0} step={1000} /></Col>
                <Col span={9}><InputNumber style={{ width: '100%' }} value={cf.outflow} onChange={v => updateFlow(i, 'outflow', Number(v))} min={0} step={1000} /></Col>
                <Col span={2}><Button danger size="small" icon={<DeleteOutlined />} onClick={() => removePeriod(i)} /></Col>
              </Row>
            ))}
            <Button size="small" icon={<PlusOutlined />} onClick={addPeriod} style={{ marginTop: 4 }}>Add Period</Button>
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              <Button type="primary" icon={<SaveOutlined />} onClick={save} loading={saving}>{editId ? 'Update Scenario' : 'Save Scenario'}</Button>
              {editId && <Button onClick={resetForm}>New Scenario</Button>}
              <Button icon={<FilePdfOutlined />} onClick={exportPDF}>Export PDF</Button>
            </Space>
          </Card>
        </Col>

        <Col span={10}>
          <Card title="Results" size="small" style={{ marginBottom: 12 }}>
            {result ? (
              <>
                <Row gutter={8}>
                  <Col span={12}><Statistic title="NPV" value={result.npv} precision={3} prefix={currency} valueStyle={{ color: result.npv >= 0 ? '#3f8600' : '#cf1322', fontSize: 18 }} /></Col>
                  <Col span={12}><Statistic title="IRR" value={result.irr != null ? result.irr : 'N/A'} suffix={result.irr != null ? '%' : ''} valueStyle={{ fontSize: 18 }} /></Col>
                </Row>
                <Row gutter={8} style={{ marginTop: 12 }}>
                  <Col span={8}><Statistic title="ROI" value={result.roi} precision={1} suffix="%" valueStyle={{ fontSize: 15 }} /></Col>
                  <Col span={8}><Statistic title="Payback" value={result.paybackPeriods != null ? result.paybackPeriods : 'N/A'} valueStyle={{ fontSize: 15 }} /></Col>
                  <Col span={8}><Statistic title="PI" value={result.profitabilityIndex} precision={2} valueStyle={{ fontSize: 15 }} /></Col>
                </Row>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">Feasibility Verdict</Text><br />
                  <Tag color={VERDICT_COLORS[result.verdict]} style={{ fontSize: 18, padding: '4px 16px', marginTop: 4 }}>{result.verdict}</Tag>
                </div>
              </>
            ) : <Empty />}
          </Card>
          <Card title="Cumulative Cash Flow" size="small">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" fontSize={11} />
                <YAxis fontSize={11} />
                <RTooltip />
                <ReferenceLine y={0} stroke="#999" />
                <Line type="monotone" dataKey="cumulative" stroke="#1890ff" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="Saved Scenarios" size="small" style={{ marginTop: 16 }}>
        <Table
          dataSource={scenarios} rowKey="feasibilityId" loading={loading} size="small" pagination={false}
          columns={[
            { title: 'Scenario', dataIndex: 'scenarioName', render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Investment', dataIndex: 'initialInvestment', align: 'right', render: (v: number) => `${currency} ${Number(v).toLocaleString()}` },
            { title: 'Disc%', dataIndex: 'discountRate', align: 'center', render: (v: number) => `${v}%` },
            { title: 'NPV', dataIndex: 'npv', align: 'right', render: (v: number) => <Text style={{ color: v >= 0 ? '#3f8600' : '#cf1322' }}>{currency} {Number(v).toLocaleString()}</Text> },
            { title: 'IRR', dataIndex: 'irr', align: 'right', render: (v: number) => v != null ? `${v}%` : 'N/A' },
            { title: 'ROI', dataIndex: 'roi', align: 'right', render: (v: number) => `${Number(v).toFixed(1)}%` },
            { title: 'Payback', dataIndex: 'paybackPeriods', align: 'right', render: (v: number) => v != null ? v : 'N/A' },
            { title: 'Verdict', dataIndex: 'verdict', render: (v: string) => <Tag color={VERDICT_COLORS[v]}>{v}</Tag> },
            { title: '', key: 'act', render: (_: any, r: any) => (
              <Space>
                <Button size="small" onClick={() => loadScenario(r)}>Load</Button>
                <Popconfirm title="Delete scenario?" onConfirm={async () => { await feasibilityApi.delete(r.feasibilityId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
              </Space>
            )},
          ]}
        />
      </Card>
    </div>
  );
}
