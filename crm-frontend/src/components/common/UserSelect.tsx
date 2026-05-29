import React, { useState, useEffect, useCallback } from 'react';
import { Select, Spin, Button, Modal, Form, Input, message, Space, Tag } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

interface UserSelectProps {
  value?: string;
  onChange?: (value: string, user?: any) => void;
  onUserSelect?: (user: any) => void;
  placeholder?: string;
  allowCreate?: boolean;
  style?: React.CSSProperties;
}

export default function UserSelect({ value, onChange, onUserSelect, placeholder = 'Select user', allowCreate = true, style }: UserSelectProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm] = Form.useForm();

  const loadUsers = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const r = await api.get('/users', { params: { limit: 50, search: q || undefined } });
      setUsers(r.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  const loadGroups = useCallback(async () => {
    try {
      const r = await api.get('/users/groups');
      setGroups(r.data || []);
    } catch {}
  }, []);

  useEffect(() => { loadUsers(); loadGroups(); }, [loadUsers, loadGroups]);

  const handleSearch = (val: string) => {
    setSearch(val);
    loadUsers(val);
  };

  const handleChange = (val: string) => {
    const user = users.find(u => u.fullName === val || u.userId === val);
    const enriched = user ? { ...user, groupName: user.userGroup?.groupName || user.groupName || '' } : user;
    onChange?.(val, enriched);
    onUserSelect?.(enriched);
  };

  const handleCreate = async (values: any) => {
    setCreating(true);
    try {
      const r = await api.post('/users', values);
      message.success(`User ${values.fullName} created successfully`);
      setCreateOpen(false);
      createForm.resetFields();
      await loadUsers();
      const newUser = r.data;
      onChange?.(newUser.fullName, newUser);
      onUserSelect?.(newUser);
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Failed to create user');
    } finally { setCreating(false); }
  };

  return (
    <>
      <Select
        showSearch
        value={value}
        placeholder={placeholder}
        filterOption={false}
        onSearch={handleSearch}
        onChange={handleChange}
        loading={loading}
        notFoundContent={
          loading ? <Spin size="small" /> : (
            <div style={{ padding: '8px 0', textAlign: 'center' }}>
              <div style={{ color: '#8c8c8c', marginBottom: 8 }}>
                {search ? `No user found for "${search}"` : 'No users found'}
              </div>
              {allowCreate && (
                <Button size="small" type="dashed" icon={<PlusOutlined />}
                  onClick={() => { createForm.setFieldsValue({ fullName: search }); setCreateOpen(true); }}>
                  Create new user
                </Button>
              )}
            </div>
          )
        }
        style={style}
        allowClear
        dropdownRender={menu => (
          <>
            {menu}
            {allowCreate && (
              <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                <Button size="small" type="dashed" icon={<PlusOutlined />} block
                  onClick={() => { createForm.resetFields(); setCreateOpen(true); }}>
                  + Create New User
                </Button>
              </div>
            )}
          </>
        )}
      >
        {users.map(u => (
          <Option key={u.userId} value={u.fullName}>
            <Space>
              <UserOutlined style={{ color: '#1890ff' }} />
              <span>{u.fullName}</span>
              {(u.userGroup?.groupName || u.groupName) && (
                <Tag style={{ fontSize: 10, marginLeft: 4 }} color="blue">{u.userGroup?.groupName || u.groupName}</Tag>
              )}
              <Tag style={{ fontSize: 10 }} color="default">{u.email}</Tag>
            </Space>
          </Option>
        ))}
      </Select>

      <Modal title="Create New User" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} width={480}>
        <Form form={createForm} layout="vertical" onFinish={handleCreate} style={{ marginTop: 12 }}>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="John Smith" />
          </Form.Item>
          <Form.Item name="email" label="Email Address" rules={[{ required: true }, { type: 'email' }]}>
            <Input placeholder="john@company.com" />
          </Form.Item>
          <Form.Item name="userGroupId" label="User Group" rules={[{ required: true }]}>
            <Select placeholder="Select a group">
              {groups.map((g: any) => (
                <Option key={g.userGroupId} value={g.userGroupId}>{g.groupName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="password" label="Temporary Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="Min 6 characters" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating}>Create User</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
