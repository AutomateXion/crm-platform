import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Tooltip, Avatar, Badge,
  Popconfirm, Statistic, Tabs, Calendar, AutoComplete, Spin, Divider,
} from "antd";
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, CalendarOutlined, TableOutlined,
  PhoneOutlined, MailOutlined, TeamOutlined, ClockCircleOutlined,
  BankOutlined, UserOutlined, FunnelPlotOutlined, RiseOutlined,
  ExclamationCircleOutlined, FieldTimeOutlined, LinkOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ACTIVITY_TYPES = [
  { code: "CALL",     label: "Call",       icon: <PhoneOutlined />,        color: "#1890ff", bg: "#e6f7ff" },
  { code: "EMAIL",    label: "Email",      icon: <MailOutlined />,         color: "#52c41a", bg: "#f6ffed" },
  { code: "MEETING",  label: "Meeting",    icon: <TeamOutlined />,         color: "#2E6DA4", bg: "#f9f0ff" },
  { code: "DEMO",     label: "Demo",       icon: <RiseOutlined />,         color: "#fa8c16", bg: "#fff7e6" },
  { code: "TASK",     label: "Task",       icon: <CheckCircleOutlined />,  color: "#13c2c2", bg: "#e6fffb" },
  { code: "FOLLOWUP", label: "Follow Up",  icon: <ClockCircleOutlined />,  color: "#eb2f96", bg: "#fff0f6" },
  { code: "VISIT",    label: "Site Visit", icon: <BankOutlined />,         color: "#faad14", bg: "#fffbe6" },
];

const RELATED_TYPES = [
  { value: "LEAD",        label: "Lead",        icon: <FunnelPlotOutlined />, endpoint: "/leads" },
  { value: "CONTACT",     label: "Contact",     icon: <UserOutlined />,       endpoint: "/contacts" },
  { value: "ACCOUNT",     label: "Account",     icon: <BankOutlined />,       endpoint: "/accounts" },
  { value: "OPPORTUNITY", label: "Opportunity", icon: <RiseOutlined />,       endpoint: "/opportunities" },
];

const PRIORITY_COLORS = { HIGH: "#ff4d4f", MEDIUM: "#faad14", LOW: "#52c41a" };
const STATUS_COLORS = { PLANNED: "#1890ff", COMPLETED: "#52c41a", CANCELLED: "#ff4d4f" };

// ─── Related Record Search ────────────────────────────────────────────────────
function RelatedSearch({ relatedType, value, onChange, onSelect }) {
  const [options, setOptions] = useState([]);
  const [spin, setSpin] = useState(false);
  const t = useRef(null);
  const rt = RELATED_TYPES.find(r => r.value === relatedType);

  const search = async (txt) => {
    if (!txt || txt.length < 2 || !rt) { setOptions([]); return; }
    setSpin(true);
    try {
      const r = await api.get(rt.endpoint, { params: { search: txt, limit: 6 } });
      const items = r.data.data || [];
      setOptions(items.map(item => {
        const name = item.accountName || item.opportunityName ||
          [item.firstName, item.lastName].filter(Boolean).join(" ") ||
          item.companyName || "Unknown";
        return {
          value: name, recordId: item.accountId || item.contactId || item.leadId || item.opportunityId,
          label: (
            <Space>
              {rt.icon}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                <div style={{ fontSize: 11, color: "#8c8c8c" }}>{item.email || item.jobTitle || item.stageCode || ""}</div>
              </div>
            </Space>
          ),
        };
      }));
    } catch {} finally { setSpin(false); }
  };

  if (!relatedType) return <Input placeholder="Select related record type first" disabled />;

  return (
    <AutoComplete value={value} options={options}
      onChange={v => { onChange(v); clearTimeout(t.current); t.current = setTimeout(() => search(v), 300); }}
      onSelect={(v, opt) => { onChange(v); if (onSelect) onSelect(opt); }}
      placeholder={"Search " + (rt?.label || "") + "..."}
      style={{ width: "100%" }}
      notFoundContent={spin ? <Spin size="small" /> : null}
    />
  );
}

// ─── Activity Type Picker ─────────────────────────────────────────────────────
function ActivityTypePicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {ACTIVITY_TYPES.map(t => (
        <div key={t.code}
          onClick={() => onChange(t.code)}
          style={{
            padding: "8px 14px", borderRadius: 10, cursor: "pointer",
            border: value === t.code ? "2px solid " + t.color : "2px solid #f0f0f0",
            background: value === t.code ? t.bg : "#fafafa",
            color: value === t.code ? t.color : "#595959",
            fontWeight: value === t.code ? 700 : 400,
            display: "flex", alignItems: "center", gap: 6, fontSize: 13,
            transition: "all 0.15s",
          }}
        >
          {t.icon} {t.label}
        </div>
      ))}
    </div>
  );
}

// ─── Main Activities Page ─────────────────────────────────────────────────────
export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ planned: 0, overdue: 0, today: 0, completed: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [completeModal, setCompleteModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [completeForm] = Form.useForm();

  // Related record state
  const [relatedType, setRelatedType] = useState("");
  const [relatedName, setRelatedName] = useState("");
  const [relatedId, setRelatedId] = useState(null);
  const [activityType, setActivityType] = useState("CALL");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.activityType = typeFilter;
      const r = await api.get("/activities", { params });
      setActivities(r.data.data || []); setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, statusFilter, typeFilter]);

  const loadSummary = useCallback(async () => {
    try {
      const r = await api.get("/activities/summary");
      setSummary(r.data);
    } catch {}
  }, []);

  useEffect(() => { load(); loadSummary(); }, [load, loadSummary]);

  const reset = () => {
    form.resetFields(); setEditActivity(null);
    setRelatedType(""); setRelatedName(""); setRelatedId(null);
    setActivityType("CALL");
  };

  const openCreate = (defaults: any = {}) => {
    reset();
    if (defaults.relatedToType) setRelatedType(defaults.relatedToType);
    if (defaults.relatedToId) setRelatedId(defaults.relatedToId);
    if (defaults.relatedToName) setRelatedName(defaults.relatedToName);
    form.setFieldsValue({
      priority: "MEDIUM",
      dueDate: new Date().toISOString().slice(0, 16),
      ...defaults,
    });
    setModalOpen(true);
  };

  const openEdit = (a) => {
    reset(); setEditActivity(a);
    setRelatedType(a.relatedToType || "");
    setRelatedName(a.relatedToName || "");
    setRelatedId(a.relatedToId || null);
    setActivityType(a.activityType || "CALL");
    form.setFieldsValue({
      ...a,
      dueDate: a.dueDate ? dayjs(a.dueDate).format("YYYY-MM-DDTHH:mm") : "",
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        activityType,
        relatedToType: relatedType || null,
        relatedToId: relatedId || null,
        relatedToName: relatedName || null,
      };
      if (editActivity) {
        await api.put("/activities/" + editActivity.activityId, payload);
        message.success("Activity updated");
      } else {
        await api.post("/activities", payload);
        message.success("Activity logged");
      }
      setModalOpen(false); reset(); load(); loadSummary();
    } catch (e) {
      message.error(e.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const handleComplete = async (values) => {
    try {
      await api.patch("/activities/" + completeModal.activityId + "/complete", { outcome: values.outcome });
      message.success("Activity marked as completed");
      setCompleteModal(null); completeForm.resetFields(); load(); loadSummary();
    } catch { message.error("Failed"); }
  };

  const handleDelete = async (id) => {
    try { await api.delete("/activities/" + id); message.success("Deleted"); load(); loadSummary(); }
    catch { message.error("Failed"); }
  };

  const getTypeConfig = (code) => ACTIVITY_TYPES.find(t => t.code === code) || ACTIVITY_TYPES[0];

  // Calendar cell render
  const calendarCell = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const dayActivities = activities.filter(a => a.dueDate && dayjs(a.dueDate).format("YYYY-MM-DD") === dateStr);
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {dayActivities.slice(0, 3).map(a => {
          const tc = getTypeConfig(a.activityType);
          return (
            <li key={a.activityId} onClick={(e) => { e.stopPropagation(); openEdit(a); }}>
              <Badge color={tc.color} text={<Text style={{ fontSize: 11 }} ellipsis>{a.subject}</Text>} />
            </li>
          );
        })}
        {dayActivities.length > 3 && <Text style={{ fontSize: 11, color: "#8c8c8c" }}>+{dayActivities.length - 3} more</Text>}
      </ul>
    );
  };

  const columns = [
    {
      title: "Activity", key: "activity", width: 300,
      render: (_, r) => {
        const tc = getTypeConfig(r.activityType);
        const isOverdue = r.status === "PLANNED" && r.dueDate && new Date(r.dueDate) < new Date();
        return (
          <Space>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: tc.bg, color: tc.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {tc.icon}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                {r.subject}
                {isOverdue && <Tag color="red" style={{ marginLeft: 6, fontSize: 10, borderRadius: 10 }}><ExclamationCircleOutlined /> Overdue</Tag>}
              </div>
              {r.relatedToName && (
                <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
                  {RELATED_TYPES.find(rt => rt.value === r.relatedToType)?.icon} {r.relatedToName}
                </Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: "Type", dataIndex: "activityType", width: 110,
      render: (v) => {
        const tc = getTypeConfig(v);
        return <Tag style={{ background: tc.bg, color: tc.color, border: "none", borderRadius: 20 }}>{tc.icon} {tc.label}</Tag>;
      },
    },
    {
      title: "Due Date", dataIndex: "dueDate", width: 140,
      render: (v) => {
        if (!v) return "—";
        const d = new Date(v);
        const isOverdue = d < new Date();
        return (
          <div>
            <div style={{ fontSize: 12, color: isOverdue ? "#ff4d4f" : "inherit", fontWeight: isOverdue ? 600 : 400 }}>
              {d.toLocaleDateString("en-GB")}
            </div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>
              {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        );
      },
    },
    {
      title: "Priority", dataIndex: "priority", width: 90,
      render: (v) => <Tag color={v === "HIGH" ? "red" : v === "MEDIUM" ? "orange" : "green"} style={{ borderRadius: 20, fontSize: 11 }}>{v || "MEDIUM"}</Tag>,
    },
    {
      title: "Status", dataIndex: "status", width: 110,
      render: (v) => <Badge color={STATUS_COLORS[v] || "#8c8c8c"} text={<Text style={{ fontSize: 12 }}>{v || "PLANNED"}</Text>} />,
    },
    {
      title: "", key: "actions", width: 120,
      render: (_, r) => (
        <Space>
          {r.status === "PLANNED" && (
            <Tooltip title="Mark Complete">
              <Button size="small" icon={<CheckCircleOutlined />} type="primary" ghost
                onClick={() => { setCompleteModal(r); completeForm.resetFields(); }} />
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          </Tooltip>
          <Popconfirm title="Delete activity?" onConfirm={() => handleDelete(r.activityId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Activities & Calendar</Title>
          <Text type="secondary">Log calls, emails, meetings and tasks against any record</Text>
        </div>
        <Space>
          <Button icon={viewMode === "table" ? <CalendarOutlined /> : <TableOutlined />}
            onClick={() => setViewMode(v => v === "table" ? "calendar" : "table")}>
            {viewMode === "table" ? "Calendar View" : "Table View"}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()} style={{ borderRadius: 8 }}>
            Log Activity
          </Button>
        </Space>
      </div>

      {/* Summary KPIs */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        {[
          { label: "Planned", value: summary.planned, color: "#1890ff", bg: "#e6f7ff", icon: <FieldTimeOutlined />, filter: "PLANNED" },
          { label: "Overdue", value: summary.overdue, color: "#ff4d4f", bg: "#fff1f0", icon: <ExclamationCircleOutlined />, filter: "PLANNED" },
          { label: "Due Today", value: summary.today, color: "#fa8c16", bg: "#fff7e6", icon: <CalendarOutlined />, filter: "" },
          { label: "Completed Today", value: summary.completed, color: "#52c41a", bg: "#f6ffed", icon: <CheckCircleOutlined />, filter: "COMPLETED" },
        ].map(k => (
          <Col xs={12} sm={6} key={k.label}>
            <Card size="small" style={{ borderRadius: 10, borderLeft: "3px solid " + k.color, cursor: "pointer" }}
              onClick={() => setStatusFilter(k.filter)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text style={{ color: "#8c8c8c", fontSize: 11 }}>{k.label}</Text>
                  <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: k.color }}>
                  {k.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 12, borderRadius: 12 }}>
        <Row gutter={12}>
          <Col>
            <Select value={statusFilter || undefined} placeholder="All Statuses" allowClear style={{ width: 150 }}
              onChange={v => { setStatusFilter(v || ""); setPage(1); }}>
              <Option value="PLANNED">Planned</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
          <Col>
            <Select value={typeFilter || undefined} placeholder="All Types" allowClear style={{ width: 150 }}
              onChange={v => { setTypeFilter(v || ""); setPage(1); }}>
              {ACTIVITY_TYPES.map(t => (
                <Option key={t.code} value={t.code}><Space>{t.icon}{t.label}</Space></Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button onClick={() => { setStatusFilter(""); setTypeFilter(""); setPage(1); }}>Clear Filters</Button>
          </Col>
        </Row>
      </Card>

      {/* Table or Calendar */}
      {viewMode === "table" ? (
        <Card style={{ borderRadius: 12 }}>
          <Table dataSource={activities} columns={columns} rowKey="activityId" loading={loading} size="middle"
            pagination={{ showSizeChanger: true, pageSizeOptions: ['10','20','50','100'], current: page, total, pageSize: 50, onChange: setPage, showTotal: t => t + " activities" }}
          />
        </Card>
      ) : (
        <Card style={{ borderRadius: 12 }}>
          <Calendar cellRender={calendarCell} />
        </Card>
      )}

      {/* ─── Log / Edit Activity Modal ──────────────────────────────────── */}
      <Modal
        title={<Space>{editActivity ? <EditOutlined /> : <PlusOutlined />}{editActivity ? "Edit Activity" : "Log Activity"}</Space>}
        open={modalOpen} onCancel={() => { setModalOpen(false); reset(); }}
        footer={null} width={660} style={{ top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>

          {/* Activity Type Picker */}
          <Form.Item label="Activity Type" required>
            <ActivityTypePicker value={activityType} onChange={setActivityType} />
          </Form.Item>

          {/* Subject */}
          <Form.Item name="subject" label="Subject" rules={[{ required: true, message: "Please enter a subject" }]}>
            <Input placeholder={
              activityType === "CALL" ? "Call with Ahmed about proposal..." :
              activityType === "EMAIL" ? "Sent follow-up email to Khalid..." :
              activityType === "MEETING" ? "Meeting at Gulf Logistics office..." :
              "Activity description..."
            } size="large" />
          </Form.Item>

          {/* Related To */}
          <div style={{ background: "#f0f5ff", border: "1px solid #d6e4ff", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <Text strong style={{ color: "#1890ff", display: "block", marginBottom: 8 }}>
              <LinkOutlined /> Link to Record (optional)
            </Text>
            <Row gutter={12}>
              <Col span={10}>
                <Select value={relatedType || undefined} placeholder="Record type" allowClear style={{ width: "100%" }}
                  onChange={v => { setRelatedType(v || ""); setRelatedName(""); setRelatedId(null); }}>
                  {RELATED_TYPES.map(rt => (
                    <Option key={rt.value} value={rt.value}><Space>{rt.icon}{rt.label}</Space></Option>
                  ))}
                </Select>
              </Col>
              <Col span={14}>
                <RelatedSearch
                  relatedType={relatedType}
                  value={relatedName}
                  onChange={v => { setRelatedName(v); if (!v) setRelatedId(null); }}
                  onSelect={opt => { setRelatedId(opt.recordId); setRelatedName(opt.value); }}
                />
              </Col>
            </Row>
            {relatedId && (
              <Text style={{ fontSize: 11, color: "#52c41a", marginTop: 6, display: "block" }}>
                <CheckCircleOutlined /> Linked to {RELATED_TYPES.find(r => r.value === relatedType)?.label}: {relatedName}
              </Text>
            )}
          </div>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="dueDate" label="Due Date & Time">
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" initialValue="MEDIUM">
                <Select>
                  <Option value="HIGH"><Tag color="red">High Priority</Tag></Option>
                  <Option value="MEDIUM"><Tag color="orange">Medium Priority</Tag></Option>
                  <Option value="LOW"><Tag color="green">Low Priority</Tag></Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="durationMinutes" label="Duration (minutes)">
                <Input type="number" placeholder="30" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="location" label="Location / Meeting Link">
                <Input placeholder="Office / Zoom / Teams link" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Notes">
            <TextArea rows={3} placeholder="Key discussion points, action items, follow-up needed..." />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {editActivity ? "Save Changes" : "Log Activity"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ─── Complete Activity Modal ─────────────────────────────────────── */}
      <Modal
        title={<Space><CheckCircleOutlined style={{ color: "#52c41a" }} />Complete Activity</Space>}
        open={!!completeModal} onCancel={() => setCompleteModal(null)} footer={null} width={440}
      >
        <Form form={completeForm} layout="vertical" onFinish={handleComplete} style={{ marginTop: 16 }}>
          <div style={{ background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <Text strong>{completeModal?.subject}</Text>
          </div>
          <Form.Item name="outcome" label="Outcome / Result" rules={[{ required: true, message: "Please describe the outcome" }]}>
            <Select placeholder="Select outcome">
              <Option value="SUCCESSFUL">✅ Successful — Goal achieved</Option>
              <Option value="FOLLOW_UP">📞 Follow-up required</Option>
              <Option value="NO_ANSWER">📵 No answer / Not reached</Option>
              <Option value="RESCHEDULED">📅 Rescheduled</Option>
              <Option value="CANCELLED">❌ Cancelled</Option>
              <Option value="IN_PROGRESS">🔄 Still in progress</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Additional Notes">
            <TextArea rows={2} placeholder="Key outcomes, decisions made, next steps..." />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setCompleteModal(null)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>Mark as Completed</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
