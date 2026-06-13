import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table, Card, Button, Input, Tag, Space, Modal, Form, Typography, InputNumber,
  Row, Col, message, Tooltip, Statistic, Select, Popconfirm,
  Divider, AutoComplete, Spin, Alert, List, Radio, Badge, Empty,
} from "antd";
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  RiseOutlined, DollarOutlined, CalendarOutlined, TableOutlined,
  FunnelPlotOutlined, BankOutlined, UserOutlined, CheckCircleOutlined,
  LinkOutlined, SwapOutlined, ArrowRightOutlined, ProjectOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import { productsApi } from "../../services/salesApi";
import ProductSelect from "../../components/common/ProductSelect";
import { projectsApi } from "../../services/pmApi";

const { Title, Text } = Typography;
const { Option } = Select;

const STAGE_COLORS = {
  PROSPECTING: "#1890ff", QUALIFICATION: "#13c2c2", PROPOSAL: "#fa8c16",
  NEGOTIATION: "#722ed1", CLOSED_WON: "#52c41a", CLOSED_LOST: "#ff4d4f",
};
const STAGES = ["PROSPECTING","QUALIFICATION","PROPOSAL","NEGOTIATION","CLOSED_WON","CLOSED_LOST"];

const LEAD_STATUS_COLORS = {
  NEW: "#1890ff", CONTACTED: "#13c2c2", QUALIFIED: "#52c41a",
  PROPOSAL: "#fa8c16", DISQUALIFIED: "#ff4d4f",
};

// ─── Account Search ───────────────────────────────────────────────────────────
function AccountSearch({ value, onChange, onSelect }) {
  const [options, setOptions] = useState([]);
  const [spin, setSpin] = useState(false);
  const t = useRef(null);

  const search = async (txt) => {
    if (!txt || txt.length < 2) { setOptions([]); return; }
    setSpin(true);
    try {
      const r = await api.get("/accounts", { params: { search: txt, limit: 8 } });
      setOptions((r.data.data || []).map(a => ({
        value: a.accountName, accountId: a.accountId,
        label: (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Space>
              <BankOutlined style={{ color:"#1890ff" }} />
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{a.accountName}</div>
                {a.city && <div style={{ fontSize:11, color:"#8c8c8c" }}>{a.city}</div>}
              </div>
            </Space>
            <Tag color="blue" style={{ fontSize:10 }}>Existing</Tag>
          </div>
        ),
      })));
    } catch {} finally { setSpin(false); }
  };

  return (
    <AutoComplete value={value} options={options}
      onChange={v => { onChange(v); clearTimeout(t.current); t.current = setTimeout(() => search(v), 300); }}
      onSelect={(v, opt) => { onChange(v); if (onSelect) onSelect(opt); }}
      placeholder="Type to search existing accounts..."
      style={{ width:"100%" }} notFoundContent={spin ? <Spin size="small" /> : null} />
  );
}

// ─── Contact Search ───────────────────────────────────────────────────────────
function ContactSearch({ value, onChange, onSelect, accountId }) {
  const [options, setOptions] = useState([]);
  const [spin, setSpin] = useState(false);
  const t = useRef(null);

  const search = async (txt) => {
    if (!txt || txt.length < 2) { setOptions([]); return; }
    setSpin(true);
    try {
      const params: any = { search: txt, limit: 8 };
      if (accountId) params.accountId = accountId;
      const r = await api.get("/contacts", { params });
      setOptions((r.data.data || []).map(c => ({
        value: [c.firstName, c.lastName].filter(Boolean).join(" "),
        contactId: c.contactId, email: c.email, mobile: c.mobile, jobTitle: c.jobTitle,
        label: (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Space>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"#722ed1", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>
                {c.firstName?.[0]}{c.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{c.firstName} {c.lastName}</div>
                <div style={{ fontSize:11, color:"#8c8c8c" }}>{c.jobTitle || c.email || ""}</div>
              </div>
            </Space>
            <Tag color="purple" style={{ fontSize:10 }}>Existing</Tag>
          </div>
        ),
      })));
    } catch {} finally { setSpin(false); }
  };

  return (
    <AutoComplete value={value} options={options}
      onChange={v => { onChange(v); clearTimeout(t.current); t.current = setTimeout(() => search(v), 300); }}
      onSelect={(v, opt) => { onChange(v); if (onSelect) onSelect(opt); }}
      placeholder="Type to search contacts or enter new name..."
      style={{ width:"100%" }} notFoundContent={spin ? <Spin size="small" /> : null} />
  );
}

// ─── Main Sales Page ──────────────────────────────────────────────────────────
export default function SalesPage() {
  const navigate = useNavigate();
  const [opps, setOpps] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("kanban");
  const [modalOpen, setModalOpen] = useState(false);
  const [editOpp, setEditOpp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  // Convert to Project
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertOpp, setConvertOpp] = useState<any>(null);
  const [convertSaving, setConvertSaving] = useState(false);
  const [convertForm] = Form.useForm();
  const [oppLineItems, setOppLineItems] = useState<any[]>([]);
  const [oppProducts, setOppProducts] = useState<any[]>([]);
  const openConvertModal = (opp: any) => {
    setConvertOpp(opp);
    convertForm.setFieldsValue({
      projectName: opp.opportunityName,
      clientName: opp.accountName || "",
      contractValue: opp.dealValue || 0,
      plannedBudget: opp.dealValue || 0,
      status: "PLANNING",
      health: "GREEN",
    });
    setConvertModalOpen(true);
  };
  const handleConvert = async (values: any) => {
    setConvertSaving(true);
    try {
      const r = await projectsApi.create(values);
      message.success("Project created successfully!");
      setConvertModalOpen(false);
      navigate("/projects/" + r.data.projectId);
    } catch (e: any) {
      message.error(e.response?.data?.message || "Failed to create project");
    } finally { setConvertSaving(false); }
  };

  // Smart linking state
  const [accountName, setAccountName] = useState("");
  const [contactName, setContactName] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [accountLinked, setAccountLinked] = useState(false);
  const [contactLinked, setContactLinked] = useState(false);

  // Lead selection state
  const [accountLeads, setAccountLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/opportunities", { params: { page, limit: 50, search: search || undefined } });
      setOpps(r.data.data || []); setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  // Load leads for selected account
  const loadAccountLeads = async (accountId) => {
    if (!accountId) { setAccountLeads([]); return; }
    setLeadsLoading(true);
    try {
      const r = await api.get("/leads", { params: { accountId, limit: 50 } });
      // Filter out already converted leads
      const open = (r.data.data || []).filter(l => !l.converted && l.leadStatusCode !== "CONVERTED");
      setAccountLeads(open);
    } catch { setAccountLeads([]); } finally { setLeadsLoading(false); }
  };

  const reset = () => {
    form.resetFields(); setEditOpp(null);
    setAccountName(""); setContactName("");
    setSelectedAccountId(null); setSelectedContactId(null);
    setAccountLinked(false); setContactLinked(false);
    setAccountLeads([]); setSelectedLeadId(null); setSelectedLead(null);
  };

  const openCreate = () => { reset(); setOppLineItems([]); setModalOpen(true); };

  const openEdit = (opp) => {
    reset(); setEditOpp(opp);
    setAccountName(opp.accountName || ""); setContactName(opp.contactName || "");
    if (opp.accountId) { setSelectedAccountId(opp.accountId); setAccountLinked(true); }
    if (opp.contactId) { setSelectedContactId(opp.contactId); setContactLinked(true); }
    if (opp.leadId) { setSelectedLeadId(opp.leadId); }
    form.setFieldsValue({ ...opp, stageCode: opp.stageCode || "PROSPECTING" });
    setOppLineItems([]);
    // Load opportunity line items if they exist
    api.get(`/opportunities/${opp.opportunityId}/items`).then(r => setOppLineItems(r.data || [])).catch(() => {});
    setModalOpen(true);
  };

  // When a lead is selected from the list — auto-fill the form
  const handleLeadSelect = (lead) => {
    setSelectedLeadId(lead.leadId);
    setSelectedLead(lead);
    // Auto-fill contact from lead
    const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
    if (name) { setContactName(name); }
    // Auto-fill opportunity name and value
    form.setFieldsValue({
      opportunityName: (lead.companyName || accountName) + " — Opportunity",
      dealValue: lead.estimatedValue || null,
      description: lead.description || "",
    });
    message.success("Lead selected — form auto-filled from lead details");
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      let accountId = selectedAccountId;
      let contactId = selectedContactId;

      // Auto-create account if typed but not linked
      if (accountName && !accountId) {
        const r = await api.post("/accounts", { accountName });
        accountId = r.data.accountId;
        message.info("New account created: " + accountName);
      }

      // Auto-create contact if typed but not linked
      if (contactName && !contactId) {
        const parts = contactName.trim().split(" ");
        const r = await api.post("/contacts", {
          firstName: parts[0] || contactName,
          lastName: parts.slice(1).join(" ") || "",
          accountId: accountId || null,
          email: selectedLead?.email || "",
          mobile: selectedLead?.phone || "",
          jobTitle: selectedLead?.jobTitle || "",
        });
        contactId = r.data.contactId;
        message.info("New contact created: " + contactName);
      }

      const payload = {
        opportunityName: values.opportunityName,
        stageCode: values.stageCode || "PROSPECTING",
        dealValue: values.dealValue || null,
        probability: values.probability || 0,
        expectedClose: values.expectedClose || null,
        nextStep: values.nextStep || "",
        description: values.description || "",
        accountId: accountId || null,
        contactId: contactId || null,
        leadId: selectedLeadId || null,
        accountName,
        contactName,
      };

      if (editOpp) {
        await api.put("/opportunities/" + editOpp.opportunityId, payload);
        if (oppLineItems.length > 0) {
          await api.post(`/opportunities/${editOpp.opportunityId}/items`, { items: oppLineItems });
        }
        message.success("Opportunity updated");
      } else {
        const savedOpp = await api.post("/opportunities", payload);
        const savedId = savedOpp.data?.opportunityId;
        if (savedId && oppLineItems.length > 0) {
          await api.post(`/opportunities/${savedId}/items`, { items: oppLineItems });
        }
        message.success("Opportunity created");

        // Mark the lead as converted if one was selected
        if (selectedLeadId) {
          try {
            await api.patch("/leads/" + selectedLeadId, {
              converted: true,
              convertedAccountId: accountId,
              convertedContactId: contactId,
              leadStatusCode: "CONVERTED",
            });
            message.success("Lead marked as Converted");
          } catch {
            // Lead conversion is non-critical — opportunity was already saved
            message.warning("Opportunity saved. Lead status update pending.");
          }
        }
      }

      setModalOpen(false); reset(); load();
    } catch (e) {
      message.error(e.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const pipeline = opps.filter(o => !["CLOSED_WON","CLOSED_LOST"].includes(o.stageCode));
  const won = opps.filter(o => o.stageCode === "CLOSED_WON");
  const pipelineValue = pipeline.reduce((s, o) => s + (Number(o.dealValue) || 0), 0);
  const wonValue = won.reduce((s, o) => s + (Number(o.dealValue) || 0), 0);

  const columns = [
    {
      title: "Opportunity", key: "opp",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight:600 }}>{r.opportunityName}</div>
          <Space size={4} style={{ marginTop:2 }}>
            {r.accountId && <Tag color="blue" style={{ fontSize:10, borderRadius:10 }}><BankOutlined /> {r.accountName || "Account"}</Tag>}
            {r.contactId && <Tag color="purple" style={{ fontSize:10, borderRadius:10 }}><UserOutlined /> {r.contactName || "Contact"}</Tag>}
            {r.leadId && <Tag color="cyan" style={{ fontSize:10, borderRadius:10 }}><SwapOutlined /> Converted Lead</Tag>}
          </Space>
        </div>
      ),
    },
    { title: "Deal Value", dataIndex: "dealValue", render: v => v ? <Text strong style={{ color:"#52c41a" }}>OMR {Number(v).toLocaleString()}</Text> : "—" },
    { title: "Stage", dataIndex: "stageCode", render: v => <Tag style={{ background:STAGE_COLORS[v]+"20", color:STAGE_COLORS[v], border:"1px solid "+STAGE_COLORS[v]+"40", borderRadius:20 }}>{(v||"PROSPECTING").replace("_"," ")}</Tag> },
    {
      title: "Close Date", key: "dates",
      render: (_, r) => (
        <div>
          {r.originalCloseDate && (
            <div style={{ fontSize:12, fontWeight:500 }}>{new Date(r.originalCloseDate).toLocaleDateString("en-GB")}</div>
          )}
          {r.stageEnteredAt && (
            <div style={{ fontSize:11, color:"#8c8c8c" }}>Stage: {new Date(r.stageEnteredAt).toLocaleDateString("en-GB")}</div>
          )}
        </div>
      ),
    },
    { title: "", key: "actions", render: (_, r) => (
      <Space>
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
        {r.stageCode === "CLOSED_WON" && (
          <Tooltip title="Convert to Project">
            <Button size="small" type="primary" icon={<ProjectOutlined />}
              onClick={() => openConvertModal(r)}
              style={{ background: '#722ed1', borderColor: '#722ed1' }} />
          </Tooltip>
        )}
        <Popconfirm title="Delete opportunity?" onConfirm={async () => { await api.delete("/opportunities/"+r.opportunityId); load(); }}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <Title level={4} style={{ margin:0 }}>Sales & Opportunities</Title>
          <Text type="secondary">Convert leads into deals — fully linked to accounts and contacts</Text>
        </div>
        <Space>
          <Button icon={viewMode === "table" ? <FunnelPlotOutlined /> : <TableOutlined />}
            onClick={() => setViewMode(v => v === "table" ? "kanban" : "table")}>
            {viewMode === "table" ? "Kanban" : "Table"}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius:8 }}>
            New Opportunity
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={16} style={{ marginBottom:20 }}>
        {[
          { title:"Pipeline Value", value:"OMR "+pipelineValue.toLocaleString(), icon:<RiseOutlined />, color:"#1890ff", bg:"#e6f7ff" },
          { title:"Won This Month", value:"OMR "+wonValue.toLocaleString(), icon:<DollarOutlined />, color:"#52c41a", bg:"#f6ffed" },
          { title:"Open Deals", value:pipeline.length, icon:<FunnelPlotOutlined />, color:"#722ed1", bg:"#f9f0ff" },
          { title:"Closing This Month", value:opps.filter(o => {
              if (!o.expectedClose) return false;
              const d=new Date(o.expectedClose), n=new Date();
              return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
            }).length, icon:<CalendarOutlined />, color:"#fa8c16", bg:"#fff7e6" },
        ].map(k => (
          <Col xs={12} lg={6} key={k.title}>
            <Card style={{ borderRadius:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <Text style={{ color:"#8c8c8c", fontSize:11, textTransform:"uppercase", letterSpacing:0.5 }}>{k.title}</Text>
                  <div style={{ fontSize:20, fontWeight:700, color:"#1a1a2e" }}>{k.value}</div>
                </div>
                <div style={{ width:44, height:44, borderRadius:12, background:k.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:k.color }}>{k.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Kanban / Table */}
      {viewMode === "kanban" ? (
        <div style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:16, maxHeight:"calc(100vh - 320px)" }}>
          {STAGES.map(stage => {
            const sOpps = opps.filter(o => (o.stageCode||"PROSPECTING") === stage);
            const sVal = sOpps.reduce((s,o) => s+(Number(o.dealValue)||0), 0);
            return (
              <div key={stage} style={{ minWidth:230, flex:1 }}>
                <div style={{ padding:"10px 12px", borderRadius:"10px 10px 0 0", background:STAGE_COLORS[stage], color:"#fff", display:"flex", justifyContent:"space-between" }}>
                  <Text style={{ color:"#fff", fontWeight:700, fontSize:12 }}>{stage.replace("_"," ")}</Text>
                  <Text style={{ color:"rgba(255,255,255,0.8)", fontSize:11 }}>{sOpps.length} · OMR {sVal.toLocaleString()}</Text>
                </div>
                <div style={{ background:"#f5f6fa", borderRadius:"0 0 10px 10px", padding:8, minHeight:150, maxHeight:"calc(100vh - 380px)", overflowY:"auto" }}>
                  {sOpps.map(opp => (
                    <Card key={opp.opportunityId} size="small" hoverable style={{ marginBottom:8, borderRadius:8 }} onClick={() => openEdit(opp)}>
                      <div style={{ fontWeight:600, fontSize:12, marginBottom:4 }}>{opp.opportunityName}</div>
                      <Space size={2} wrap>
                        {opp.accountId && <Tag color="blue" style={{ fontSize:10 }}><BankOutlined /> {opp.accountName||"Account"}</Tag>}
                        {opp.leadId && <Tag color="cyan" style={{ fontSize:10 }}><SwapOutlined /> Lead</Tag>}
                      </Space>
                      {opp.dealValue && <div style={{ color:"#52c41a", fontWeight:700, fontSize:13, marginTop:4 }}>OMR {Number(opp.dealValue).toLocaleString()}</div>}
                      {opp.expectedClose && <div style={{ color:"#8c8c8c", fontSize:11, marginTop:2 }}><CalendarOutlined /> {new Date(opp.expectedClose).toLocaleDateString("en-GB")}</div>}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card style={{ borderRadius:12 }}>
          <div style={{ marginBottom:16 }}>
            <Input prefix={<SearchOutlined />} placeholder="Search opportunities..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              allowClear style={{ width:300, borderRadius:8 }} />
          </div>
          <Table dataSource={opps} columns={columns} rowKey="opportunityId" loading={loading}
            pagination={{ current:page, total, pageSize:50, onChange:setPage }} />
        </Card>
      )}

      {/* ─── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal
        title={<Space>{editOpp ? <EditOutlined /> : <PlusOutlined />}{editOpp ? "Edit Opportunity" : "New Opportunity"}</Space>}
        open={modalOpen} onCancel={() => { setModalOpen(false); reset(); }}
        footer={null} width={680} style={{ top:20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop:16 }}>

          {/* STEP 1 — Select Account */}
          <div style={{ background:"#f0f5ff", border:"1px solid #d6e4ff", borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <Text strong style={{ color:"#1890ff" }}>
                <BankOutlined /> Step 1 — Account (Company)
              </Text>
              {accountLinked
                ? <Tag color="blue" icon={<CheckCircleOutlined />}>Linked</Tag>
                : accountName ? <Tag color="orange">New account</Tag> : null}
            </div>
            <AccountSearch
              value={accountName}
              onChange={v => {
                setAccountName(v);
                if (!v) {
                  setSelectedAccountId(null); setAccountLinked(false);
                  setAccountLeads([]); setSelectedLeadId(null); setSelectedLead(null);
                }
              }}
              onSelect={opt => {
                setSelectedAccountId(opt.accountId);
                setAccountLinked(true);
                message.success("Account linked: " + opt.value);
                // Load leads for this account
                loadAccountLeads(opt.accountId);
              }}
            />
          </div>

          {/* STEP 2 — Select Lead from Account (only shown when account is linked) */}
          {accountLinked && (
            <div style={{ background:"#fffbe6", border:"1px solid #ffe58f", borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <Text strong style={{ color:"#d46b08" }}>
                  <SwapOutlined /> Step 2 — Select a Lead to Convert (optional)
                </Text>
                {selectedLeadId && <Tag color="orange" icon={<CheckCircleOutlined />}>Lead selected</Tag>}
              </div>

              {leadsLoading ? (
                <div style={{ textAlign:"center", padding:16 }}><Spin /></div>
              ) : accountLeads.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<Text style={{ color:"#8c8c8c", fontSize:12 }}>No open leads for this account. You can still create an opportunity without a lead.</Text>}
                  style={{ margin:"8px 0" }}
                />
              ) : (
                <div style={{ maxHeight:200, overflowY:"auto" }}>
                  {accountLeads.map(lead => (
                    <div
                      key={lead.leadId}
                      onClick={() => {
                        if (selectedLeadId === lead.leadId) {
                          // Deselect
                          setSelectedLeadId(null); setSelectedLead(null);
                          setContactName(""); form.setFieldsValue({ opportunityName:"", dealValue:null });
                        } else {
                          handleLeadSelect(lead);
                        }
                      }}
                      style={{
                        padding:"10px 12px", borderRadius:8, marginBottom:6, cursor:"pointer",
                        border: selectedLeadId === lead.leadId ? "2px solid #fa8c16" : "1px solid #f0f0f0",
                        background: selectedLeadId === lead.leadId ? "#fff7e6" : "#fff",
                        transition:"all 0.15s",
                      }}
                    >
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:13 }}>
                            {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "—"}
                            {lead.jobTitle && <Text style={{ color:"#8c8c8c", fontSize:11, marginLeft:8 }}>{lead.jobTitle}</Text>}
                          </div>
                          <Space size={4} style={{ marginTop:2 }}>
                            {lead.email && <Text style={{ fontSize:11, color:"#8c8c8c" }}>{lead.email}</Text>}
                            {lead.phone && <Text style={{ fontSize:11, color:"#8c8c8c" }}>· {lead.phone}</Text>}
                          </Space>
                        </div>
                        <Space>
                          {lead.estimatedValue && (
                            <Tag color="green" style={{ fontSize:11 }}>OMR {Number(lead.estimatedValue).toLocaleString()}</Tag>
                          )}
                          <Tag color={LEAD_STATUS_COLORS[lead.leadStatusCode] || "#8c8c8c"} style={{ borderRadius:20, fontSize:11 }}>
                            {lead.leadStatusCode || "NEW"}
                          </Tag>
                          {selectedLeadId === lead.leadId && <CheckCircleOutlined style={{ color:"#fa8c16", fontSize:16 }} />}
                        </Space>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedLeadId && (
                <Alert
                  message="This lead will be marked as Converted when you save the opportunity."
                  type="warning" showIcon style={{ marginTop:8, borderRadius:6, fontSize:12 }}
                />
              )}
            </div>
          )}

          {/* STEP 3 — Contact */}
          <div style={{ background:"#f9f0ff", border:"1px solid #efdbff", borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <Text strong style={{ color:"#722ed1" }}>
                <UserOutlined /> Step 3 — Contact (Person)
              </Text>
              {contactLinked
                ? <Tag color="purple" icon={<CheckCircleOutlined />}>Linked</Tag>
                : contactName ? <Tag color="orange">New contact</Tag> : null}
            </div>
            <ContactSearch
              value={contactName} accountId={selectedAccountId}
              onChange={v => { setContactName(v); if (!v) { setSelectedContactId(null); setContactLinked(false); } }}
              onSelect={opt => {
                setSelectedContactId(opt.contactId); setContactLinked(true);
                message.success("Contact linked: " + opt.value);
              }}
            />
          </div>

          <Divider style={{ margin:"10px 0" }}>Opportunity Details</Divider>

          {/* Opportunity Name */}
          <Form.Item name="opportunityName" label="Opportunity Name" rules={[{ required:true, message:"Please enter a name" }]}>
            <Input placeholder="e.g. Gulf Logistics — ERP Implementation 2024" size="large" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="stageCode" label="Stage" initialValue="PROSPECTING" rules={[{ required:true }]}>
                <Select>
                  {STAGES.map(s => (
                    <Option key={s} value={s}>
                      <Tag style={{ background:STAGE_COLORS[s]+"20", color:STAGE_COLORS[s], border:"1px solid "+STAGE_COLORS[s]+"40", borderRadius:20 }}>
                        {s.replace("_"," ")}
                      </Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="probability" label="Probability (%)">
                <Input type="number" min={0} max={100} suffix="%" placeholder="0–100" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dealValue" label="Deal Value (OMR)">
            <Input type="number" placeholder="0.000" prefix="OMR" />
          </Form.Item>

          {/* Stage Date — shown when editing and stage changed */}
          <div style={{ background:"#fffbe6", border:"1px solid #ffe58f", borderRadius:10, padding:"12px 16px", marginBottom:14 }}>
            <Text strong style={{ color:"#d46b08", display:"block", marginBottom:8 }}>
              📅 Stage Date & Close Date
            </Text>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="stageDate" label="Date for this Stage"
                  extra="When do you expect to complete this stage?">
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="expectedClose" label="Expected Close Date"
                  extra="Original close date is preserved automatically">
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="stageNotes" label="Stage Notes" style={{ marginBottom:0 }}>
              <Input placeholder="Why are you moving to this stage? Key notes..." />
            </Form.Item>
          </div>

          <Form.Item name="nextStep" label="Next Step">
            <Input placeholder="What is the next action to move this forward?" />
          </Form.Item>

          <Form.Item name="description" label="Notes">
            <Input.TextArea rows={2} placeholder="Background, requirements, context..." />
          </Form.Item>

          {/* Stage History Timeline */}
          {editOpp && editOpp.stageHistory && editOpp.stageHistory.length > 0 && (
            <div style={{ background:"#fafafa", borderRadius:10, padding:"12px 16px", marginBottom:14 }}>
              <Text strong style={{ color:"#595959", display:"block", marginBottom:10 }}>📊 Stage History</Text>
              <div style={{ position:"relative" }}>
                {editOpp.stageHistory.map((h, i) => (
                  <div key={i} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"flex-start" }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background: STAGE_COLORS[h.stage] || "#8c8c8c", marginTop:4, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <Tag style={{ background: (STAGE_COLORS[h.stage] || "#8c8c8c") + "20", color: STAGE_COLORS[h.stage] || "#8c8c8c", border:"none", borderRadius:20, fontSize:11 }}>
                          {h.stage.replace("_"," ")}
                        </Tag>
                        <Text style={{ fontSize:11, color:"#8c8c8c" }}>{h.enteredAt ? new Date(h.enteredAt).toLocaleDateString("en-GB") : ""}</Text>
                      </div>
                      {h.stageDate && <Text style={{ fontSize:11, color:"#1890ff" }}>Target: {new Date(h.stageDate).toLocaleDateString("en-GB")}</Text>}
                      {h.notes && <Text style={{ fontSize:11, color:"#8c8c8c", display:"block" }}>{h.notes}</Text>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products & Services */}
          <Divider style={{ margin:"10px 0" }}>Products & Services (Optional)</Divider>
          <div style={{ background:"#f6ffed", border:"1px solid #b7eb8f", borderRadius:10, padding:"12px 16px", marginBottom:14 }}>
            <div style={{ marginBottom:8 }}>
              {oppLineItems.map((item, idx) => (
                <Row gutter={8} key={idx} style={{ marginBottom:8 }} align="middle">
                  <Col span={8}>
                    <ProductSelect
                      value={item.productId}
                      onProductSelect={p => {
                        if (p) {
                          const updated = [...oppLineItems];
                          updated[idx] = { ...updated[idx], productId: p.productId, description: p.productName || '', unitPrice: Number(p.unitPrice||0), itemCode: p.productCode || '' };
                          updated[idx].lineTotal = Number(updated[idx].quantity||1) * Number(updated[idx].unitPrice||0);
                          setOppLineItems(updated);
                          const total = updated.reduce((s,l) => s + Number(l.lineTotal||0), 0);
                          form.setFieldsValue({ dealValue: total });
                        }
                      }}
                    />
                  </Col>
                  <Col span={6}><Input value={item.description} placeholder="Description" onChange={e => { const u=[...oppLineItems]; u[idx].description=e.target.value; setOppLineItems(u); }} /></Col>
                  <Col span={2}><InputNumber style={{ width:"100%" }} min={0} step={0.001} value={item.quantity} placeholder="Qty"
                    onChange={v => { const u=[...oppLineItems]; u[idx].quantity=v; u[idx].lineTotal=Number(v||1)*Number(u[idx].unitPrice||0); setOppLineItems(u); const total=u.reduce((s,l)=>s+Number(l.lineTotal||0),0); form.setFieldsValue({dealValue:total}); }} /></Col>
                  <Col span={3}><InputNumber style={{ width:"100%" }} min={0} step={0.001} value={item.unitPrice} placeholder="Price"
                    onChange={v => { const u=[...oppLineItems]; u[idx].unitPrice=v; u[idx].lineTotal=Number(u[idx].quantity||1)*Number(v||0); setOppLineItems(u); const total=u.reduce((s,l)=>s+Number(l.lineTotal||0),0); form.setFieldsValue({dealValue:total}); }} /></Col>
                  <Col span={3}><Text strong style={{ color:"#52c41a" }}>OMR {Number(item.lineTotal||0).toFixed(3)}</Text></Col>
                  <Col span={2}><Button size="small" danger onClick={() => { const u=oppLineItems.filter((_,i)=>i!==idx); setOppLineItems(u); const total=u.reduce((s,l)=>s+Number(l.lineTotal||0),0); form.setFieldsValue({dealValue:total}); }}>×</Button></Col>
                </Row>
              ))}
            </div>
            <Button type="dashed" icon={<PlusOutlined />} size="small"
              onClick={() => setOppLineItems([...oppLineItems, { description:'', quantity:1, unitPrice:0, lineTotal:0, unitOfMeasure:'PCS' }])}>
              + Add Product / Service
            </Button>
            {oppLineItems.length > 0 && (
              <div style={{ marginTop:8, textAlign:'right' }}>
                <Text strong>Total: OMR {oppLineItems.reduce((s,l)=>s+Number(l.lineTotal||0),0).toFixed(3)}</Text>
              </div>
            )}
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
            <Button onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} icon={editOpp ? <EditOutlined /> : <PlusOutlined />}>
              {editOpp ? "Save Changes" : "Create Opportunity"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── Convert to Project Modal ─────────────────────────── */}
      <Modal
        title={<span><ProjectOutlined style={{ color: '#722ed1', marginRight: 8 }} />Convert to Project</span>}
        open={convertModalOpen} onCancel={() => setConvertModalOpen(false)} footer={null} width={640} style={{ top: 30 }}>
        {convertOpp && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f9f0ff', borderRadius: 8, border: '1px solid #d3adf7' }}>
            <Text type="secondary">Converting from opportunity: </Text>
            <Text strong style={{ color: '#722ed1' }}>{convertOpp.opportunityName}</Text>
            {convertOpp.dealValue && <Text type="secondary"> · OMR {Number(convertOpp.dealValue).toLocaleString()}</Text>}
          </div>
        )}
        <Form form={convertForm} layout="vertical" onFinish={handleConvert}>
          <Form.Item name="projectName" label="Project Name" rules={[{ required: true }]}>
            <Input placeholder="Enter project name" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="clientName" label="Client Name">
                <Input placeholder="End client / beneficiary" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="awardedByName" label="Awarded By">
                <Input placeholder="Company who gave the contract" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="contractValue" label="Contract Value (OMR)">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="plannedBudget" label="Planned Budget (OMR)">
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date">
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  {['PLANNING','ACTIVE','ON_HOLD'].map(s => <Option key={s} value={s}>{s.replace('_',' ')}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="projectManagerName" label="Project Manager">
                <Input placeholder="Assigned PM name" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button onClick={() => setConvertModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={convertSaving}
              style={{ background: '#722ed1', borderColor: '#722ed1' }}>
              <ProjectOutlined /> Create Project
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
