import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import axios from 'axios';

const { Option, OptGroup } = Select;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  accountTypes?: string[];  // filter by type: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  style?: any;
  allowClear?: boolean;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
}

let cachedAccounts: any[] | null = null;

export default function COASelect({ value, onChange, placeholder, accountTypes, style, allowClear = true, size, disabled }: Props) {
  const [accounts, setAccounts] = useState<any[]>(cachedAccounts || []);

  useEffect(() => {
    if (cachedAccounts) { setAccounts(cachedAccounts); return; }
    sApi.get('/sales/chart-of-accounts').then(r => {
      const data = r.data || [];
      cachedAccounts = data;
      setAccounts(data);
    }).catch(() => {});
  }, []);

  const filtered = accounts.filter(a => {
    if (a.accountSubtype === 'HEADER') return false;
    if (accountTypes?.length) return accountTypes.includes(a.accountType);
    return true;
  });

  // Group by account type
  const groups = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
  const GROUP_LABELS: Record<string,string> = {
    ASSET: '📦 Assets', LIABILITY: '💳 Liabilities', 
    EQUITY: '🏦 Equity', REVENUE: '💰 Revenue', EXPENSE: '💸 Expenses'
  };

  return (
    <Select
      showSearch value={value} onChange={onChange}
      placeholder={placeholder || 'Select account...'}
      optionFilterProp="children"
      filterOption={(input, option) => 
        String(option?.children || '').toLowerCase().includes(input.toLowerCase()) ||
        String(option?.value || '').includes(input)
      }
      style={style} allowClear={allowClear} size={size} disabled={disabled}
    >
      {groups.map(grp => {
        const grpAccounts = filtered.filter(a => a.accountType === grp);
        if (!grpAccounts.length) return null;
        return (
          <OptGroup key={grp} label={GROUP_LABELS[grp]}>
            {grpAccounts.map((a: any) => (
              <Option key={a.accountCode} value={a.accountCode}>
                {a.accountCode} — {a.accountName}
              </Option>
            ))}
          </OptGroup>
        );
      })}
    </Select>
  );
}
