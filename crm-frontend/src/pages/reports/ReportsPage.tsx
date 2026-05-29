import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Row, Col, Select, DatePicker, Button, Table, Typography,
  Statistic, Tag, Space, Tabs, Progress, List, Avatar, Spin,
  message, Empty, Divider,
} from "antd";
import {
  DownloadOutlined, ReloadOutlined, RiseOutlined, FunnelPlotOutlined,
  TeamOutlined, PhoneOutlined, BarChartOutlined, PieChartOutlined,
  CalendarOutlined, TrophyOutlined, FieldTimeOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const STAGE_COLORS = {
  PROSPECTING: "#1890ff", QUALIFICATION: "#13c2c2", PROPOSAL: "#fa8c16",
  NEGOTIATION: "#722ed1", CLOSED_WON: "#52c41a", CLOSED_LOST: "#ff4d4f",
};

const SOURCE_COLORS = [
  "#1890ff","#52c41a","#fa8c16","#722ed1","#eb2f96",
  "#13c2c2","#faad14","#ff4d4f","#2f54eb","#08979c",
];

const ACTIVITY_COLORS = {
  CALL: "#1890ff", EMAIL: "#52c41a", MEETING: "#722ed1",
  DEMO: "#fa8c16", TASK: "#13c2c2", FOLLOWUP: "#eb2f96", VISIT: "#faad14",
};

// Simple bar chart using divs (no external chart library needed)
function BarChart({ data, valueKey, labelKey, colorKey, unit = "" }) {
  if (!data || data.length === 0) return <Empty description="No data" />;
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0));
  return (
    <div style={{ padding: "8px 0" }}>
      {data.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = max > 0 ? (val / max) * 100 : 0;
        const color = item[colorKey] || SOURCE_COLORS[i % SOURCE_COLORS.length];
        return (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 13 }}>{item[labelKey]}</Text>
              <Text strong style={{ color, fontSize: 13 }}>{unit}{val.toLocaleString()}</Text>
            </div>
            <div style={{ background: "#f5f5f5", borderRadius: 4, height: 10, overflow: "hidden" }}>
              <div style={{ width: pct + "%", background: color, height: "100%", borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Donut chart using SVG
function DonutChart({ data, valueKey, labelKey, colorKey }) {
  if (!data || data.length === 0) return <Empty description="No data" />;
  const total = data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0);
  if (total === 0) return <Empty description="No data" />;

  let cumulative = 0;
  const size = 160, cx = 80, cy = 80, r = 60, innerR = 35;
  const segments = data.map((item, i) => {
    const val = Number(item[valueKey]) || 0;
    const pct = val / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    const color = item[colorKey] || SOURCE_COLORS[i % SOURCE_COLORS.length];
    const path = pct > 0.999 ? "" :
      `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    return { path, color, val, pct, label: item[labelKey] };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {segments.map((s, i) => s.path && (
          <path key={i} d={s.path} fill={s.color} opacity={0.9} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={18} fontWeight={700} fill="#1a1a2e">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11} fill="#8c8c8c">Total</text>
      </svg>
      <div style={{ flex: 1 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Space size={6}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <Text style={{ fontSize: 12 }}>{s.label}</Text>
            </Space>
            <Space size={6}>
              <Text strong style={{ fontSize: 12 }}>{s.val}</Text>
              <Text style={{ fontSize: 11, color: "#8c8c8c" }}>({(s.pct * 100).toFixed(0)}%)</Text>
            </Space>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [customRange, setCustomRange] = useState(null);
  const [loading, setLoading] = useState(false);

  // Report data states
  const [pipeline, setPipeline] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [activitySummary, setActivitySummary] = useState([]);
  const [kpis, setKpis] = useState({
    totalLeads: 0, totalOpps: 0, pipelineValue: 0, wonValue: 0,
    conversionRate: 0, totalActivities: 0, totalAccounts: 0, totalContacts: 0,
  });

  const getDateRange = () => {
    const now = dayjs();
    if (period === "week") return { from: now.startOf("week").toISOString(), to: now.endOf("week").toISOString() };
    if (period === "month") return { from: now.startOf("month").toISOString(), to: now.endOf("month").toISOString() };
    if (period === "quarter") {
      const q = Math.floor(now.month() / 3);
      const start = now.month(q * 3).startOf("month");
      const end = now.month(q * 3 + 2).endOf("month");
      return { from: start.toISOString(), to: end.toISOString() };
    }
    if (period === "year") return { from: now.startOf("year").toISOString(), to: now.endOf("year").toISOString() };
    if (period === "custom" && customRange) return { from: customRange[0].toISOString(), to: customRange[1].toISOString() };
    return { from: now.startOf("month").toISOString(), to: now.endOf("month").toISOString() };
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const safeGet = async (url, params = {}) => {
        try { const r = await api.get(url, { params }); return r.data; }
        catch { return { data: [], total: 0 }; }
      };

      const [oppsData, leadsData, activitiesData, accountsData, contactsData] = await Promise.all([
        safeGet("/opportunities", { limit: 500 }),
        safeGet("/leads", { limit: 500 }),
        safeGet("/activities", { limit: 500 }),
        safeGet("/accounts", { limit: 1 }),
        safeGet("/contacts", { limit: 1 }),
      ]);

      const opps = oppsData.data || [];
      const leads = leadsData.data || [];
      const acts = activitiesData.data || [];

      // Pipeline by stage
      const stageMap: Record<string, { count: number; value: number }> = {};
      opps.forEach(o => {
        const s = o.stageCode || "PROSPECTING";
        if (!stageMap[s]) stageMap[s] = { count: 0, value: 0 };
        stageMap[s].count++;
        stageMap[s].value += Number(o.dealValue) || 0;
      });
      setPipeline(Object.entries(stageMap).map(([stage, d]) => ({
        stage, count: d.count, value: d.value,
        color: STAGE_COLORS[stage] || "#8c8c8c",
        label: stage.replace("_", " "),
      })).sort((a, b) => {
        const order = ["PROSPECTING","QUALIFICATION","PROPOSAL","NEGOTIATION","CLOSED_WON","CLOSED_LOST"];
        return order.indexOf(a.stage) - order.indexOf(b.stage);
      }));

      // Lead sources
      const sourceMap: Record<string, number> = {};
      leads.forEach(l => { const s = l.leadSourceCode || "UNKNOWN"; sourceMap[s] = (sourceMap[s] || 0) + 1; });
      setLeadSources(Object.entries(sourceMap).map(([source, count], i) => ({
        source, count, label: source.replace("_", " "), color: SOURCE_COLORS[i % SOURCE_COLORS.length],
      })).sort((a, b) => b.count - a.count));

      // Lead statuses
      const statusMap: Record<string, number> = {};
      leads.forEach(l => { const s = l.leadStatusCode || "NEW"; statusMap[s] = (statusMap[s] || 0) + 1; });
      setLeadStatuses(Object.entries(statusMap).map(([status, count], i) => ({
        status, count, label: status.replace("_", " "), color: SOURCE_COLORS[i % SOURCE_COLORS.length],
      })));

      // Activity summary by type
      const actMap: Record<string, number> = {};
      acts.forEach(a => { const t = a.activityType || "OTHER"; actMap[t] = (actMap[t] || 0) + 1; });
      setActivitySummary(Object.entries(actMap).map(([type, count]) => ({
        type, count, label: type, color: ACTIVITY_COLORS[type] || "#8c8c8c",
      })).sort((a, b) => b.count - a.count));

      // KPIs
      const wonOpps = opps.filter(o => o.stageCode === "CLOSED_WON");
      const pipelineOpps = opps.filter(o => !["CLOSED_WON","CLOSED_LOST"].includes(o.stageCode));
      setKpis({
        totalLeads: leads.length,
        totalOpps: opps.length,
        pipelineValue: pipelineOpps.reduce((s, o) => s + (Number(o.dealValue) || 0), 0),
        wonValue: wonOpps.reduce((s, o) => s + (Number(o.dealValue) || 0), 0),
        conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.converted).length / leads.length) * 100) : 0,
        totalActivities: acts.length,
        totalAccounts: accountsData.total || 0,
        totalContacts: contactsData.total || 0,
      });

    } catch (e) {
      message.error("Failed to load reports");
    } finally { setLoading(false); }
  }, [period, customRange]);

  useEffect(() => { loadReports(); }, [loadReports]);

  // Export to CSV
  const exportCSV = (data, filename, columns) => {
    const headers = columns.map(c => c.label).join(",");
    const rows = data.map(row => columns.map(c => row[c.key] ?? "").join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename + ".csv"; a.click();
    URL.revokeObjectURL(url);
    message.success("Exported to " + filename + ".csv");
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Reports & Analytics</Title>
          <Text type="secondary">Pipeline, leads, activities and performance insights</Text>
        </div>
        <Space>
          {/* Period Selector */}
          <Select value={period} onChange={setPeriod} style={{ width: 140 }}>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="quarter">This Quarter</Option>
            <Option value="year">This Year</Option>
            <Option value="all">All Time</Option>
            <Option value="custom">Custom Range</Option>
          </Select>
          {period === "custom" && (
            <RangePicker onChange={dates => setCustomRange(dates)} style={{ width: 240 }} />
          )}
          <Button icon={<ReloadOutlined />} onClick={loadReports} loading={loading}>Refresh</Button>
        </Space>
      </div>

      <Spin spinning={loading}>

        {/* ─── KPI Cards ─────────────────────────────────────────────────── */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          {[
            { label: "Total Accounts",   value: kpis.totalAccounts,                            color: "#1890ff", bg: "#e6f7ff", icon: <TeamOutlined /> },
            { label: "Total Contacts",   value: kpis.totalContacts,                            color: "#722ed1", bg: "#f9f0ff", icon: <TeamOutlined /> },
            { label: "Total Leads",      value: kpis.totalLeads,                               color: "#13c2c2", bg: "#e6fffb", icon: <FunnelPlotOutlined /> },
            { label: "Open Deals",       value: kpis.totalOpps,                                color: "#fa8c16", bg: "#fff7e6", icon: <RiseOutlined /> },
            { label: "Pipeline Value",   value: "OMR " + kpis.pipelineValue.toLocaleString(),  color: "#1890ff", bg: "#e6f7ff", icon: <RiseOutlined /> },
            { label: "Won Value",        value: "OMR " + kpis.wonValue.toLocaleString(),        color: "#52c41a", bg: "#f6ffed", icon: <TrophyOutlined /> },
            { label: "Lead Conversion",  value: kpis.conversionRate + "%",                     color: "#eb2f96", bg: "#fff0f6", icon: <RiseOutlined /> },
            { label: "Total Activities", value: kpis.totalActivities,                          color: "#faad14", bg: "#fffbe6", icon: <FieldTimeOutlined /> },
          ].map(k => (
            <Col xs={12} sm={8} lg={6} key={k.label}>
              <Card size="small" style={{ borderRadius: 10, borderLeft: "3px solid " + k.color }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Text style={{ color: "#8c8c8c", fontSize: 11, display: "block" }}>{k.label}</Text>
                    <div style={{ fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: k.color }}>
                    {k.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ─── Charts Row 1 ──────────────────────────────────────────────── */}
        <Row gutter={16} style={{ marginBottom: 16 }}>

          {/* Pipeline by Stage */}
          <Col xs={24} lg={14}>
            <Card
              title={<Space><RiseOutlined style={{ color: "#1890ff" }} /><Text strong>Sales Pipeline by Stage</Text></Space>}
              extra={
                <Button size="small" icon={<DownloadOutlined />}
                  onClick={() => exportCSV(pipeline, "pipeline_by_stage", [
                    { key: "label", label: "Stage" },
                    { key: "count", label: "Deals" },
                    { key: "value", label: "Value (OMR)" },
                  ])}>
                  Export
                </Button>
              }
              style={{ borderRadius: 12, height: "100%" }}
            >
              {pipeline.length === 0 ? <Empty description="No opportunities yet" /> : (
                <>
                  <BarChart data={pipeline} valueKey="value" labelKey="label" colorKey="color" unit="OMR " />
                  <Divider style={{ margin: "12px 0" }} />
                  <Row gutter={8}>
                    {pipeline.map(s => (
                      <Col key={s.stage} span={Math.floor(24 / Math.max(pipeline.length, 1))}>
                        <div style={{ textAlign: "center", padding: "6px 4px", background: s.color + "15", borderRadius: 8 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.count}</div>
                          <div style={{ fontSize: 10, color: "#8c8c8c" }}>{s.label.replace("CLOSED ","")}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </Card>
          </Col>

          {/* Lead Status Breakdown */}
          <Col xs={24} lg={10}>
            <Card
              title={<Space><FunnelPlotOutlined style={{ color: "#13c2c2" }} /><Text strong>Lead Status Breakdown</Text></Space>}
              style={{ borderRadius: 12, height: "100%" }}
            >
              <DonutChart data={leadStatuses} valueKey="count" labelKey="label" colorKey="color" />
            </Card>
          </Col>
        </Row>

        {/* ─── Charts Row 2 ──────────────────────────────────────────────── */}
        <Row gutter={16} style={{ marginBottom: 16 }}>

          {/* Lead Source Analysis */}
          <Col xs={24} lg={12}>
            <Card
              title={<Space><PieChartOutlined style={{ color: "#722ed1" }} /><Text strong>Lead Source Analysis</Text></Space>}
              extra={
                <Button size="small" icon={<DownloadOutlined />}
                  onClick={() => exportCSV(leadSources, "lead_sources", [
                    { key: "label", label: "Source" },
                    { key: "count", label: "Leads" },
                  ])}>
                  Export
                </Button>
              }
              style={{ borderRadius: 12 }}
            >
              {leadSources.length === 0 ? (
                <Empty description="No leads with source data" />
              ) : (
                <DonutChart data={leadSources} valueKey="count" labelKey="label" colorKey="color" />
              )}
            </Card>
          </Col>

          {/* Activity Summary */}
          <Col xs={24} lg={12}>
            <Card
              title={<Space><BarChartOutlined style={{ color: "#fa8c16" }} /><Text strong>Activity Summary by Type</Text></Space>}
              extra={
                <Button size="small" icon={<DownloadOutlined />}
                  onClick={() => exportCSV(activitySummary, "activity_summary", [
                    { key: "type", label: "Type" },
                    { key: "count", label: "Count" },
                  ])}>
                  Export
                </Button>
              }
              style={{ borderRadius: 12 }}
            >
              {activitySummary.length === 0 ? (
                <Empty description="No activities logged yet" />
              ) : (
                <BarChart data={activitySummary} valueKey="count" labelKey="label" colorKey="color" />
              )}
            </Card>
          </Col>
        </Row>

        {/* ─── Data Tables ───────────────────────────────────────────────── */}
        <Row gutter={16}>

          {/* Pipeline Table */}
          <Col xs={24} lg={14}>
            <Card
              title={<Space><RiseOutlined /><Text strong>Pipeline Detail Table</Text></Space>}
              style={{ borderRadius: 12 }}
            >
              <Table
                dataSource={pipeline} rowKey="stage" size="small" pagination={false}
                columns={[
                  { title: "Stage", dataIndex: "label", render: (v, r) => <Tag style={{ background: r.color + "20", color: r.color, border: "none", borderRadius: 20 }}>{v}</Tag> },
                  { title: "Deals", dataIndex: "count", align: "center" as const, render: v => <Text strong>{v}</Text> },
                  { title: "Total Value", dataIndex: "value", align: "right" as const, render: v => <Text strong style={{ color: "#52c41a" }}>OMR {v.toLocaleString()}</Text> },
                  {
                    title: "Share", key: "share", align: "right" as const,
                    render: (_, r) => {
                      const total = pipeline.reduce((s, p) => s + p.value, 0);
                      const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
                      return <Progress percent={pct} size="small" strokeColor={r.color} style={{ width: 80, margin: 0 }} />;
                    }
                  },
                ]}
              />
            </Card>
          </Col>

          {/* Lead Sources Table */}
          <Col xs={24} lg={10}>
            <Card
              title={<Space><FunnelPlotOutlined /><Text strong>Lead Sources Table</Text></Space>}
              style={{ borderRadius: 12 }}
            >
              <Table
                dataSource={leadSources} rowKey="source" size="small" pagination={false}
                columns={[
                  {
                    title: "Source", dataIndex: "label",
                    render: (v, r) => (
                      <Space>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.color }} />
                        {v}
                      </Space>
                    )
                  },
                  { title: "Leads", dataIndex: "count", align: "center" as const, render: v => <Tag color="blue">{v}</Tag> },
                  {
                    title: "%", key: "pct", align: "right" as const,
                    render: (_, r) => {
                      const total = leadSources.reduce((s, l) => s + l.count, 0);
                      return <Text style={{ fontSize: 12 }}>{total > 0 ? Math.round((r.count / total) * 100) : 0}%</Text>;
                    }
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

      </Spin>
    </div>
  );
}
