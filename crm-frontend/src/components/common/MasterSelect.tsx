import React, { useState, useEffect, useCallback } from 'react';
import { Select, Modal, Form, Input, message, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

interface MasterSelectProps {
  categoryCode: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  allowClear?: boolean;
  useLabel?: boolean; // if true, value=valueLabel; if false, value=valueCode
  disabled?: boolean;
}

export default function MasterSelect({
  categoryCode, value, onChange, placeholder, style,
  allowClear = true, useLabel = true, disabled = false,
}: MasterSelectProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/masters/${categoryCode}/values`);
      setOptions(r.data || []);
    } catch {} finally { setLoading(false); }
  }, [categoryCode]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    setCreating(true);
    try {
      const r = await api.post(`/masters/${categoryCode}/values`, {
        valueLabel: newLabel.trim(),
        valueCode: newLabel.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_'),
        isActive: true,
      });
      message.success(`"${newLabel}" added successfully`);
      await load();
      onChange?.(useLabel ? newLabel.trim() : r.data?.valueCode);
      setCreateOpen(false);
      setNewLabel('');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Failed to create');
    } finally { setCreating(false); }
  };

  const categoryLabel = categoryCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <>
      <Select
        showSearch value={value} onChange={onChange}
        placeholder={placeholder || `Select ${categoryLabel}`}
        loading={loading} allowClear={allowClear} style={style}
        disabled={disabled} optionFilterProp="children"
        dropdownRender={menu => (
          <>
            {menu}
            <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
              <Button type="dashed" icon={<PlusOutlined />} block size="small"
                onClick={() => { setNewLabel(''); setCreateOpen(true); }}>
                + Add New {categoryLabel.replace(/s$/, '')}
              </Button>
            </div>
          </>
        )}
      >
        {options.map((o: any) => (
          <Option key={o.valueId || o.valueCode} value={useLabel ? o.valueLabel : o.valueCode}>
            {o.valueLabel}
          </Option>
        ))}
      </Select>

      <Modal
        title={`Add New ${categoryLabel.replace(/s$/, '')}`}
        open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} width={400}>
        <div style={{ marginTop: 16 }}>
          <Input
            placeholder={`Enter ${categoryLabel.replace(/s$/, '').toLowerCase()} name`}
            value={newLabel} onChange={e => setNewLabel(e.target.value)}
            onPressEnter={handleCreate}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="primary" loading={creating} onClick={handleCreate}>Add</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
