import React, { useState } from 'react';
import { AutoComplete, Typography } from 'antd';
import { suppliersApi } from '../../services/salesApi';

const { Text } = Typography;

interface SupplierSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  onSupplierSelect?: (supplier: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SupplierSelect({ value, onChange, onSupplierSelect, placeholder, disabled }: SupplierSelectProps) {
  const [options, setOptions] = useState<any[]>([]);

  const handleSearch = async (val: string) => {
    if (val.length < 1) { setOptions([]); return; }
    try {
      const r = await suppliersApi.getAll({ search: val, limit: 20 });
      setOptions((r.data.data || []).map((s: any) => ({
        value: s.supplierName,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              <Text strong>{s.supplierName}</Text>
              {s.supplierCode && <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>{s.supplierCode}</Text>}
            </span>
            <span>
              {s.city && <Text type="secondary" style={{ fontSize: 11 }}>{s.city}</Text>}
            </span>
          </div>
        ),
        supplier: s,
      })));
    } catch {}
  };

  const handleSelect = (_: string, option: any) => {
    if (option.supplier && onSupplierSelect) {
      onSupplierSelect(option.supplier);
    }
  };

  return (
    <AutoComplete
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      onSelect={handleSelect}
      options={options}
      placeholder={placeholder || 'Search supplier...'}
      disabled={disabled}
      allowClear
      style={{ width: '100%' }}
    />
  );
}
