import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Tooltip, Switch, Popconfirm,
  Avatar, Tabs, Divider, Alert, Badge, Statistic,
} from "antd";
import {
  PlusOutlined, SearchOutlined, EditOutlined, LockOutlined,
  UserOutlined, MailOutlined, PhoneOutlined, ReloadOutlined,
  TeamOutlined, SafetyOutlined, CheckCircleOutlined,
  CloseCircleOutlined, CrownOutlined,
} from "@ant-design/icons";
import { usersApi, permissionsApi } from "../../services/api";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const GROUP_COLORS: Record<string, string> = {
  TENANT_ADMIN:   "purple",
  MANAGEMENT:     "geekblue",
  SALES_MGR:      "blue",
  SALES_REP:      "cyan",
  SUPPORT_MGR:    "red",
  SUPPORT_AGENT:  "orange",
  MARKETING_MGR:  "magenta",
  MARKETING_EXEC: "pink",
  VIEWER:         "default",
};

const GROUP_ICONS: Record<string, React.ReactNode> = {
  TENANT_ADMIN:   <CrownOutlined />,
  MANAGEMENT:     <CrownOutlined />,
  SALES_MGR:      <TeamOutlined />,
  SALES_REP:      <UserOutlined />,
  SUPPORT_MGR:    <TeamOutlined />,
  SUPPORT_AGENT:  <UserOutlined />,
  MARKETING_MGR:  <TeamOutlined />,
  MARKETING_EXEC: <UserOutlined />,
  VIEWER:         <UserOutlined />,
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>();
  const [filterStatus, setFilterStatus] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [resetPwdUser, setResetPwdUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("users");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await usersApi.getUsers({
        page, limit: 20,
        search: search || undefined,
        userGroupId: filterGroup,
        isActive: filterStatus === "active" ? true : filterStatus === "inactive" ? false : undefined,
      });
      setUsers(r.data.data || []); setTotal(r.data.total || 0);
    } catch { message.error("Failed to load users"); }
    finally { setLoading(false); }
  }, [page, search, filterGroup, filterStatus]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => {
    usersApi.getGroups().then(r => setGroups(r.data || [])).catch(() => {});
  }, []);

  const openCreate = () => { setEditUser(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (u: any) => { setEditUser(u); form.setFieldsValue({ ...u, userGroupId: u.userGroup?.userGroupId || u.userGroupId }); setModalOpen(true); };

  const handleSave = async (values: any) => {
    try {
      if (editUser) {
        await usersApi.updateUser(editUser.userId, values);
        message.success("User updated successfully");
      } else {
        await usersApi.createUser(values);
        message.success("User created successfully");
      }
      setModalOpen(false); loadUsers();
    } catch (e: any) { message.error(e.response?.data?.message || "Operation failed"); }
  };

  const handleResetPassword = async (values: any) => {
    try {
      await usersApi.resetPassword(resetPwdUser.userId, values.newPassword);
      message.success("Password reset successfully");
      setResetPwdUser(null); pwdForm.resetFields();
    } catch { message.error("Failed to reset password"); }
  };

  const handleToggle = async (userId: string, isActive: boolean) => {
    try {
      await usersApi.toggleStatus(userId, isActive);
      message.success(isActive ? "User activated" : "User deactivated");
      loadUsers();
    } catch { message.error("Failed to update status"); }
  };

  // Stats
  const activeCount = users.filter(u => u.isActive).length;
  const groupCounts = groups.map(g => ({
    ...g,
    count: users.filter(u => (u.userGroup?.userGroupId || u.userGroupId) === g.userGroupId).length,
  }));

  const columns = [
    {
      title: "User", key: "user", width: 260,
      render: (_: any, r: any) => (
        <Space>
          <Avatar size={40} style={{
            background: r.isActive
              ? "linear-gradient(135deg,#0C2446,#2E6DA4)"
              : "#d9d9d9",
            fontWeight: 700, fontSize: 16,
          }}>
            {r.fullName?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.fullName}</div>
            <div style={{ color: "#8c8c8c", fontSize: 12 }}>{r.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role", key: "role",
      render: (_: any, r: any) => {
        const group = r.userGroup;
        const code = group?.groupCode || "";
        return group ? (
          <Tag color={GROUP_COLORS[code] || "default"} icon={GROUP_ICONS[code]} style={{ borderRadius: 20, padding: "2px 10px" }}>
            {group.groupName}
          </Tag>
        ) : <Text type="secondary">—</Text>;
      },
    },
    { title: "Phone", dataIndex: "phone", render: (v: string) => v || "—" },
    {
      title: "Last Login", dataIndex: "lastLogin",
      render: (v: string) => v ? (
        <div>
          <div style={{ fontSize: 12 }}>{new Date(v).toLocaleDateString("en-GB")}</div>
          <div style={{ fontSize: 11, color: "#8c8c8c" }}>{new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      ) : <Tag color="default">Never</Tag>,
    },
    {
      title: "Status", key: "status",
      render: (_: any, r: any) => (
        <Switch
          checked={r.isActive} size="small"
          checkedChildren="Active" unCheckedChildren="Inactive"
          onChange={val => handleToggle(r.userId, val)}
          style={{ background: r.isActive ? "#52c41a" : undefined }}
        />
      ),
    },
    {
      title: "2FA", dataIndex: "twoFactorEnabled",
      render: (v: boolean) => v
        ? <Tag color="green" icon={<CheckCircleOutlined />}>Enabled</Tag>
        : <Tag color="default" icon={<CloseCircleOutlined />}>Off</Tag>,
    },
    {
      title: "", key: "actions",
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Edit User">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          </Tooltip>
          <Tooltip title="Reset Password">
            <Button size="small" icon={<LockOutlined />}
              onClick={() => { setResetPwdUser(r); pwdForm.resetFields(); }} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>User Management</Title>
          <Text type="secondary">Manage team members and their access roles</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
          Add User
        </Button>
      </div>

      {/* Stats Row */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: "3px solid #1890ff" }}>
            <Statistic title={<Text style={{ fontSize: 11 }}>Total Users</Text>} value={total} valueStyle={{ fontSize: 20, color: "#1890ff" }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: "3px solid #52c41a" }}>
            <Statistic title={<Text style={{ fontSize: 11 }}>Active</Text>} value={activeCount} valueStyle={{ fontSize: 20, color: "#52c41a" }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: "3px solid #2E6DA4" }}>
            <Statistic title={<Text style={{ fontSize: 11 }}>User Groups</Text>} value={groups.length} valueStyle={{ fontSize: 20, color: "#2E6DA4" }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: "3px solid #fa8c16" }}>
            <Statistic title={<Text style={{ fontSize: 11 }}>Inactive</Text>} value={total - activeCount} valueStyle={{ fontSize: 20, color: "#fa8c16" }} />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 12, borderRadius: 12 }}>
        <Row gutter={12}>
          <Col flex="auto">
            <Input prefix={<SearchOutlined />} placeholder="Search by name or email..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              allowClear style={{ borderRadius: 8 }} />
          </Col>
          <Col>
            <Select placeholder="All Roles" allowClear style={{ width: 200 }}
              onChange={v => { setFilterGroup(v); setPage(1); }}>
              {groups.map(g => (
                <Option key={g.userGroupId} value={g.userGroupId}>
                  <Tag color={GROUP_COLORS[g.groupCode] || "default"} style={{ borderRadius: 20 }}>{g.groupName}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select placeholder="All Status" allowClear style={{ width: 130 }}
              onChange={v => { setFilterStatus(v); setPage(1); }}>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={loadUsers} style={{ borderRadius: 8 }} />
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={users} columns={columns} rowKey="userId"
          loading={loading} size="middle"
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: t => t + " users" }}
          rowClassName={r => !r.isActive ? "opacity-50" : ""}
        />
      </Card>

      {/* Create / Edit User Modal */}
      <Modal
        title={
          <Space>
            {editUser ? <EditOutlined /> : <PlusOutlined />}
            {editUser ? "Edit User — " + editUser.fullName : "Add New User"}
          </Space>
        }
        open={modalOpen} onCancel={() => setModalOpen(false)}
        footer={null} width={600} style={{ top: 60 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="fullName" label="Full Name (English)" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="John Doe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fullNameAr" label="Full Name (Arabic)">
                <Input placeholder="الاسم الكامل" style={{ direction: "rtl" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: "email" }]}>
            <Input prefix={<MailOutlined />} placeholder="user@company.com" />
          </Form.Item>

          {!editUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 8, message: "Minimum 8 characters" }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Min 8 characters" />
            </Form.Item>
          )}

          <Form.Item name="userGroupId" label="Role / User Group" rules={[{ required: true, message: "Please select a role" }]}>
            <Select placeholder="Select role" size="large">
              {groups.map(g => (
                <Option key={g.userGroupId} value={g.userGroupId}>
                  <Space>
                    <Tag color={GROUP_COLORS[g.groupCode] || "default"} style={{ borderRadius: 20 }}>
                      {g.groupName}
                    </Tag>
                    {g.description && <Text style={{ fontSize: 12, color: "#8c8c8c" }}>{g.description}</Text>}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input prefix={<PhoneOutlined />} placeholder="+968 xxxx xxxx" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="language" label="Language" initialValue="en">
                <Select>
                  <Option value="en">English</Option>
                  <Option value="ar">العربية</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="timezone" label="Timezone" initialValue="Asia/Muscat">
            <Select>
              <Option value="Asia/Muscat">Asia/Muscat (GMT+4)</Option>
              <Option value="Asia/Dubai">Asia/Dubai (GMT+4)</Option>
              <Option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</Option>
              <Option value="UTC">UTC (GMT+0)</Option>
            </Select>
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editUser ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title={<Space><LockOutlined />Reset Password — {resetPwdUser?.fullName}</Space>}
        open={!!resetPwdUser} onCancel={() => setResetPwdUser(null)} footer={null} width={420}
      >
        <Form form={pwdForm} layout="vertical" onFinish={handleResetPassword} style={{ marginTop: 16 }}>
          <Alert
            message="The user will be required to change this password on next login."
            type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }}
          />
          <Form.Item name="newPassword" label="New Password"
            rules={[{ required: true, min: 8, message: "Minimum 8 characters" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Confirm Password"
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject("Passwords do not match");
                },
              }),
            ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setResetPwdUser(null)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<LockOutlined />}>Reset Password</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
