import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

interface Props {
  value?: string;
  onChange?: (salesmanId: string, salesmanName: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function SalesmanSelect({ value, onChange, placeholder = 'Select salesman...', style }: Props) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/users', { params: { limit: 100 } })
      .then(r => setUsers(r.data.data || r.data || []))
      .catch(() => {});
  }, []);

  return (
    <Select showSearch optionFilterProp="children" placeholder={placeholder}
      style={style} value={value || undefined} allowClear
      onChange={(v) => {
        const user = users.find(u => u.userId === v);
        if (onChange && user) onChange(user.userId, user.fullName);
        else if (onChange && !v) onChange('', '');
      }}>
      {users.map(u => (
        <Option key={u.userId} value={u.userId}>
          <UserOutlined /> {u.fullName} {u.email ? `(${u.email})` : ''}
        </Option>
      ))}
    </Select>
  );
}
