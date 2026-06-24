import React, { useState, useEffect } from 'react';
import { Card, Checkbox, Button, Typography, message, Row, Col, Space, Spin, Tag } from 'antd';
import { SearchOutlined, SaveOutlined } from '@ant-design/icons';
import { productSearchSettingsApi } from '../../services/salesApi';

const { Title, Text } = Typography;

// Name & Code are always-on (locked) so search can never return nothing.
const LOCKED = ['name', 'code'];

export default function ProductSearchSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState<{ key: string; label: string }[]>([]);
  const [enabled, setEnabled] = useState<string[]>(['name', 'code']);

  useEffect(() => {
    productSearchSettingsApi.get()
      .then((r: any) => {
        setAvailable(r.data?.available || []);
        const en = r.data?.enabled || ['name', 'code'];
        // ensure locked ones are present
        const merged = Array.from(new Set([...LOCKED, ...en]));
        setEnabled(merged);
      })
      .catch(() => message.error('Could not load search settings'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string, checked: boolean) => {
    if (LOCKED.includes(key)) return; // can't toggle locked fields
    setEnabled(prev => checked ? Array.from(new Set([...prev, key])) : prev.filter(k => k !== key));
  };

  const save = async () => {
    setSaving(true);
    try {
      await productSearchSettingsApi.update(enabled);
      message.success('Product search settings saved. Changes apply across Field Sales, orders, quotations, and RFQs.');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <Card style={{ borderRadius: 12 }}><div style={{ textAlign: 'center', padding: 40 }}><Spin /></div></Card>;

  return (
    <Card style={{ borderRadius: 12 }}>
      <Space align="start" style={{ marginBottom: 8 }}>
        <SearchOutlined style={{ fontSize: 20, color: '#1A4D8F' }} />
        <div>
          <Title level={5} style={{ margin: 0 }}>Product Search Settings</Title>
          <Text type="secondary">Choose which product fields your team can search by when picking products — in Field Sales, sales orders, quotations, and RFQs.</Text>
        </div>
      </Space>

      <div style={{ marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 8 }}>
        <Row gutter={[16, 12]}>
          {available.map(f => {
            const locked = LOCKED.includes(f.key);
            return (
              <Col xs={12} sm={8} md={6} key={f.key}>
                <Checkbox
                  checked={enabled.includes(f.key)}
                  disabled={locked}
                  onChange={e => toggle(f.key, e.target.checked)}>
                  {f.label}{locked && <Tag style={{ marginLeft: 6 }} color="blue">always on</Tag>}
                </Checkbox>
              </Col>
            );
          })}
        </Row>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Name and Code are always searchable. Enable more fields to let salesmen find products by brand, barcode, part/model number, and more.
        </Text>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save}>Save settings</Button>
      </div>
    </Card>
  );
}
