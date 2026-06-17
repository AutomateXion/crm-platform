import React, { useState, useEffect } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Tag, Space, Popconfirm,
  Typography, message, Tooltip, Row, Col, Statistic, Avatar, Badge,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined,
  TeamOutlined, CrownOutlined, UserOutlined, ArrowRightOutlined,
} from "@ant-design/icons";
import { usersApi } from "../../services/api";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const GROUP_CONFIG: Record<string, { color: string; icon: React.ReactNode; dept: string }> = {
  TENANT_ADMIN:   { color: "#2E6DA4", icon: <CrownOutlined />, dept: "System" },
  MANAGEMENT:     { color: "#1890ff", icon: <CrownOutlined />, dept: "Management" },
  SALES_MGR:      { color: "#13c2c2", icon: <TeamOutlined />,  dept: "Sales" },
  SALES_REP:      { color: "#13c2c2", icon: <UserOutlined />,  dept: "Sales" },
  SUPPORT_MGR:    { color: "#ff4d4f", icon: <TeamOutlined />,  dept: "Support" },
  SUPPORT_AGENT:  { color: "#ff4d4f", icon: <UserOutlined />,  dept: "Support" },
  MARKETING_MGR:  { color: "#eb2f96", icon: <TeamOutlined />,  dept: "Marketing" },
  MARKETING_EXEC: { color: "#eb2f96", icon: <UserOutlined />,  dept: "Marketing" },
  VIEWER:         { color: "#8c8c8c", icon: <UserOutlined />,  dept: "General" },
};

export default function UserGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<any>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try { const r = await usersApi.getGroups(); setGroups(r.data || []); }
    catch { message.error("Failed to load groups"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditGroup(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (g: any) => { setEditGroup(g); form.setFieldsValue(g); setModalOpen(true); };

  const handleSave = async (values: any) => {
    try {
      if (editGroup) { await usersApi.updateGroup(editGroup.userGroupId, values); message.success("Group updated"); }
      else { await usersApi.createGroup(values); message.success("Group created"); }
      setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    try { await usersApi.deleteGroup(id); message.success("Group deactivated"); load(); }
    catch (e: any) { message.error(e.response?.data?.message || "Cannot delete — users may be assigned"); }
  };

  // Group by department
  const departments = [...new Set(groups.map(g => GROUP_CONFIG[g.groupCode]?.dept || "Custom"))];

  const columns = [
    {
      title: "Group", key: "group",
      render: (_: any, r: any) => {
        const cfg = GROUP_CONFIG[r.groupCode];
        return (
          <Space>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: cfg ? cfg.color + "20" : "#f0f0f0",
              border: "2px solid " + (cfg?.color || "#d9d9d9"),
              display: "flex", alignItems: "center", justifyContent: "center",
              color: cfg?.color || "#8c8c8c", fontSize: 18,
            }}>
              {cfg?.icon || <TeamOutlined />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{r.groupName}</div>
              {r.groupNameAr && <div style={{ color: "#8c8c8c", fontSize: 12, direction: "rtl" }}>{r.groupNameAr}</div>}
            </div>
          </Space>
        );
      },
    },
    {
      title: "Code", dataIndex: "groupCode",
      render: (v: string) => <Tag style={{ fontFamily: "monospace", borderRadius: 6, fontSize: 11 }}>{v}</Tag>,
    },
    {
      title: "Department", dataIndex: "groupCode",
      render: (v: string) => {
        const dept = GROUP_CONFIG[v]?.dept || "Custom";
        const colors: Record<string, string> = {
          System: "purple", Management: "geekblue", Sales: "cyan",
          Support: "red", Marketing: "magenta", General: "default", Custom: "green",
        };
        return <Tag color={colors[dept] || "default"} style={{ borderRadius: 20 }}>{dept}</Tag>;
      },
    },
    { title: "Description", dataIndex: "description", render: (v: string) => v || "—" },
    {
      title: "Type", dataIndex: "isSystemGroup",
      render: (v: boolean) => v ? <Tag color="purple">System</Tag> : <Tag color="green">Custom</Tag>,
    },
    {
      title: "Actions", key: "actions",
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} disabled={r.isSystemGroup} />
          </Tooltip>
          <Tooltip title="Configure Permissions">
            <Button size="small" icon={<SafetyOutlined />} type="primary" ghost
              onClick={() => navigate("/permissions?groupId=" + r.userGroupId)}>
              Permissions
            </Button>
          </Tooltip>
          {!r.isSystemGroup && (
            <Popconfirm title="Deactivate this group?" onConfirm={() => handleDelete(r.userGroupId)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>User Groups & Roles</Title>
          <Text type="secondary">Define roles, departments and configure permissions for each group</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
          Create Group
        </Button>
      </div>

      {/* Department overview */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        {[
          { dept: "Sales",      color: "#13c2c2", count: groups.filter(g => GROUP_CONFIG[g.groupCode]?.dept === "Sales").length },
          { dept: "Support",    color: "#ff4d4f", count: groups.filter(g => GROUP_CONFIG[g.groupCode]?.dept === "Support").length },
          { dept: "Marketing",  color: "#eb2f96", count: groups.filter(g => GROUP_CONFIG[g.groupCode]?.dept === "Marketing").length },
          { dept: "Management", color: "#1890ff", count: groups.filter(g => GROUP_CONFIG[g.groupCode]?.dept === "Management").length },
        ].map(d => (
          <Col xs={12} sm={6} key={d.dept}>
            <Card size="small" style={{ borderRadius: 10, borderLeft: "3px solid " + d.color }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>{d.dept}</Text>}
                value={d.count + " groups"}
                valueStyle={{ fontSize: 16, color: d.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={groups} columns={columns} rowKey="userGroupId" loading={loading} pagination={false} />
      </Card>

      <Modal
        title={editGroup ? "Edit Group — " + editGroup.groupName : "Create New User Group"}
        open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          {!editGroup && (
            <Form.Item name="groupCode" label="Group Code"
              rules={[{ required: true, pattern: /^[A-Z0-9_]+$/, message: "Uppercase letters, numbers, underscores only" }]}
              extra="e.g. SALES_REP — cannot be changed after creation"
            >
              <Input placeholder="DEPT_ROLE" style={{ textTransform: "uppercase", fontFamily: "monospace", letterSpacing: 1 }} />
            </Form.Item>
          )}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="groupName" label="Name (English)" rules={[{ required: true }]}>
                <Input placeholder="Sales Manager" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="groupNameAr" label="Name (Arabic)">
                <Input placeholder="مدير المبيعات" style={{ direction: "rtl" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="What can this role access and do?" />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">{editGroup ? "Save" : "Create Group"}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
