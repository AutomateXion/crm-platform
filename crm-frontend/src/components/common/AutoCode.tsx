import React, { useState, useEffect } from 'react';
import { Input, Button, Space, Tooltip } from 'antd';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';

interface AutoCodeProps {
  prefix?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function AutoCode({ prefix = '', value, onChange, placeholder, style }: AutoCodeProps) {
  const [manual, setManual] = useState(false);
  const [counter, setCounter] = useState(1);

  const generate = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 9000) + 1000;
    const code = prefix ? `${prefix}-${year}-${rand}` : `${year}-${rand}`;
    onChange?.(code);
  };

  useEffect(() => {
    if (!value && prefix) generate();
  }, [prefix]);

  return (
    <Space.Compact style={{ width: '100%', ...style }}>
      <Input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder || 'Auto-generated code'}
        readOnly={!manual}
        style={{ background: manual ? '#fff' : '#f5f5f5' }}
      />
      <Tooltip title="Regenerate">
        <Button icon={<ReloadOutlined />} onClick={generate} />
      </Tooltip>
      <Tooltip title={manual ? 'Lock' : 'Edit manually'}>
        <Button
          icon={<EditOutlined />}
          type={manual ? 'primary' : 'default'}
          onClick={() => setManual(!manual)}
        />
      </Tooltip>
    </Space.Compact>
  );
}
