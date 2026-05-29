import { useState, useEffect } from 'react';
import api from '../services/api';

export interface CompanySettings {
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  trn: string;
  poBox: string;
  fax: string;
  logoUrl: string;
  primaryColor: string;
  currencyCode: string;
  timezone: string;
  dateFormat: string;
}

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'My Company',
  addressLine1: 'Muscat, Sultanate of Oman',
  addressLine2: '',
  city: 'Muscat',
  country: 'Oman',
  phone: '+968 XXXX XXXX',
  email: 'info@company.com',
  website: '',
  trn: '',
  poBox: '',
  fax: '',
  logoUrl: '',
  primaryColor: '#1890ff',
  currencyCode: 'OMR',
  timezone: 'Asia/Muscat',
  dateFormat: 'DD/MM/YYYY',
};

let cachedSettings: CompanySettings | null = null;

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>(cachedSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) { setSettings(cachedSettings); setLoading(false); return; }
    api.get('/tenants/company-settings')
      .then(r => {
        const s = { ...DEFAULT_SETTINGS, ...r.data };
        // Load logo from localStorage if stored there
        const localLogo = localStorage.getItem('company_logo');
        if (localLogo && s.logoUrl === 'local') s.logoUrl = localLogo;
        cachedSettings = s;
        setSettings(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
