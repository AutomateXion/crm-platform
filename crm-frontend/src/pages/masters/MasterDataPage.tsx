import React, { useState, useEffect } from "react";
import {
  Row, Col, Card, List, Tag, Button, Modal, Form, Input,
  Typography, Space, Popconfirm, message, Tabs, Badge, Empty, Spin, Select,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, DatabaseOutlined,
  ReloadOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import { mastersApi } from "../../services/api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const CATEGORY_GROUPS = [
  {
    label: "CRM Core",
    icon: "🎯",
    categories: ["lead_sources","lead_statuses","opportunity_stages","lost_reasons","contact_roles","account_types","account_industries"],
  },
  {
    label: "Activities",
    icon: "📅",
    categories: ["activity_types","activity_outcomes"],
  },
  {
    label: "Support",
    icon: "🎫",
    categories: ["ticket_categories","ticket_priorities","ticket_statuses","sla_types","resolution_types"],
  },
  {
    label: "Marketing",
    icon: "📢",
    categories: ["campaign_types","campaign_statuses"],
  },
  {
    label: "Project Management",
    icon: "🏗️",
    categories: ["project_stages"],
  },
  {
    label: "Finance",
    icon: "💰",
    categories: ["vat_rates", "payment_methods", "sales_terms", "currency_codes", "revenue_accounts", "document_prefixes"],
  },
  {
    label: "Inventory",
    icon: "📦",
    categories: ["product_categories", "uom"],
  },
  {
    label: "Purchase",
    icon: "🛒",
    categories: ["supplier_categories", "expense_accounts"],
  },
  {
    label: "System",
    icon: "⚙️",
    categories: ["user_titles","document_types","note_types","tags"],
  },
];

export default function MasterDataPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [values, setValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [valuesLoading, setValuesLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editValue, setEditValue] = useState<any>(null);
  const [activeGroup, setActiveGroup] = useState("CRM Core");
  const [form] = Form.useForm();

  useEffect(() => {
    mastersApi.getCategories().then(r => {
      setCategories(r.data || []);
      if (r.data?.length > 0) selectCategory(r.data[0]);
    }).catch(() => {});
  }, []);

  const selectCategory = async (cat: any) => {
    setSelected(cat);
    setValuesLoading(true);
    try {
      const r = await mastersApi.getValues(cat.categoryCode);
      setValues(r.data || []);
    } catch { message.error("Failed to load values"); }
    finally { setValuesLoading(false); }
  };

  const openCreate = () => { setEditValue(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (v: any) => { setEditValue(v); form.setFieldsValue(v); setModalOpen(true); };

  const handleSave = async (vals: any) => {
    try {
      if (editValue) {
        await mastersApi.updateValue(editValue.valueId, vals);
        message.success("Value updated");
      } else {
        await mastersApi.createValue(selected.categoryCode, vals);
        message.success("Value added");
      }
      setModalOpen(false); selectCategory(selected);
    } catch (e: any) { message.error(e.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (valueId: string) => {
    try { await mastersApi.deleteValue(valueId); message.success("Removed"); selectCategory(selected); }
    catch (e: any) { message.error(e.response?.data?.message || "Cannot delete system values"); }
  };

  const filteredCategories = categories.filter(cat => {
    const group = CATEGORY_GROUPS.find(g => g.label === activeGroup);
    return group ? group.categories.includes(cat.categoryCode) : true;
  });

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Master Data Management</Title>
        <Text type="secondary">Configure all dropdown values, statuses and classifications used across the CRM</Text>
      </div>

      <Row gutter={16}>
        {/* Left — Categories */}
        <Col xs={24} md={8} lg={7}>
          <Card style={{ borderRadius: 12, height: "calc(100vh - 220px)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            bodyStyle={{ padding: 0, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
            title={<Space><DatabaseOutlined /><Text strong>Categories</Text></Space>}
          >
            {/* Group tabs */}
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", display: "flex", flexWrap: "wrap", gap: 4 }}>
              {CATEGORY_GROUPS.map(g => (
                <Tag
                  key={g.label}
                  style={{ cursor: "pointer", borderRadius: 20, fontWeight: activeGroup === g.label ? 700 : 400,
                    background: activeGroup === g.label ? "#1890ff" : "#f5f5f5",
                    color: activeGroup === g.label ? "#fff" : "#595959",
                    border: "none", padding: "2px 10px",
                  }}
                  onClick={() => setActiveGroup(g.label)}
                >
                  {g.icon} {g.label}
                </Tag>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {filteredCategories.map(cat => (
                <div
                  key={cat.categoryId}
                  onClick={() => selectCategory(cat)}
                  style={{
                    padding: "12px 16px", cursor: "pointer",
                    borderBottom: "1px solid #f5f5f5",
                    borderLeft: selected?.categoryId === cat.categoryId ? "3px solid #1890ff" : "3px solid transparent",
                    background: selected?.categoryId === cat.categoryId ? "#e6f7ff" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: selected?.categoryId === cat.categoryId ? 600 : 400, fontSize: 13 }}>
                        {cat.categoryName}
                      </div>
                      {cat.categoryNameAr && (
                        <div style={{ fontSize: 11, color: "#bfbfbf", direction: "rtl" }}>{cat.categoryNameAr}</div>
                      )}
                    </div>
                    {cat.isGlobal && <Tag color="gold" style={{ fontSize: 10, margin: 0 }}>Global</Tag>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Right — Values */}
        <Col xs={24} md={16} lg={17}>
          <Card
            style={{ borderRadius: 12, height: "calc(100vh - 220px)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            bodyStyle={{ flex: 1, overflowY: "auto" }}
            title={
              <Space>
                <Text strong style={{ fontSize: 15 }}>{selected?.categoryName || "Select a category"}</Text>
                {selected && <Badge count={values.length} style={{ background: "#1890ff" }} showZero />}
                {selected?.isGlobal && <Tag color="gold">Global</Tag>}
              </Space>
            }
            extra={selected && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} size="small" style={{ borderRadius: 8 }}>
                Add Value
              </Button>
            )}
          >
            {!selected && <Empty description="Select a category from the left panel" />}

            {selected && (
              <Spin spinning={valuesLoading}>
                {values.length === 0 && !valuesLoading && (
                  <Empty description={
                    <div>
                      <div>No values yet</div>
                      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ marginTop: 12, borderRadius: 8 }}>
                        Add First Value
                      </Button>
                    </div>
                  } />
                )}
                {values.map((item: any) => (
                  <div key={item.valueId} style={{
                    padding: "12px 0", borderBottom: "1px solid #f5f5f5",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <Space>
                      {/* Color dot */}
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: item.colorCode || "#f0f0f0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, color: item.colorCode ? "#fff" : "#8c8c8c", fontWeight: 700,
                      }}>
                        {item.valueLabel?.[0]}
                      </div>
                      <div>
                        <Space size={6}>
                          <Text strong style={{ fontSize: 13 }}>{item.valueLabel}</Text>
                          {item.valueLabelAr && <Text style={{ color: "#8c8c8c", fontSize: 12 }}>{item.valueLabelAr}</Text>}
                          {item.isDefault && <Tag color="blue" style={{ fontSize: 10, borderRadius: 20 }}>Default</Tag>}
                          {item.isSystem && <Tag color="purple" style={{ fontSize: 10, borderRadius: 20 }}>System</Tag>}
                          {!item.tenantId && <Tag color="gold" style={{ fontSize: 10, borderRadius: 20 }}>Global</Tag>}
                        </Space>
                        <div style={{ fontSize: 11, color: "#bfbfbf", fontFamily: "monospace" }}>{item.valueCode}</div>
                      </div>
                    </Space>
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(item)}
                        disabled={item.isSystem && !item.tenantId} />
                      {!item.isSystem && (
                        <Popconfirm title="Remove this value?" onConfirm={() => handleDelete(item.valueId)}>
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      )}
                    </Space>
                  </div>
                ))}
              </Spin>
            )}
          </Card>
        </Col>
      </Row>

      {/* Add / Edit Modal */}
      <Modal
        title={editValue ? "Edit: " + editValue.valueLabel : "Add Value — " + selected?.categoryName}
        open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          {!editValue && (
            <Form.Item name="valueCode" label="Value Code"
              rules={[{ required: true, pattern: /^[A-Z0-9_]+$/, message: "Uppercase letters, numbers, underscores" }]}
              extra="Unique identifier — cannot be changed after creation"
            >
              <Input placeholder="MY_VALUE" style={{ textTransform: "uppercase", fontFamily: "monospace" }} />
            </Form.Item>
          )}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="valueLabel" label="Label (English)" rules={[{ required: true }]}>
                <Input placeholder="My Value" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="valueLabelAr" label="Label (Arabic)">
                <Input placeholder="قيمة" style={{ direction: "rtl" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="colorCode" label="Badge Color">
                <Input placeholder="#52c41a" maxLength={7} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sortOrder" label="Sort Order">
                <Input type="number" defaultValue={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="isDefault" label="Set as Default">
            <Select defaultValue={false}>
              <Option value={false}>No</Option>
              <Option value={true}>Yes — this will be pre-selected in forms</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional description" />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">{editValue ? "Save Changes" : "Add Value"}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
