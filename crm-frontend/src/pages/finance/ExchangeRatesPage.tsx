import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Tag, Space, Modal, Form, Input,
  Typography, Row, Col, message, Popconfirm, Tooltip, Select, InputNumber,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { exchangeRatesApi } from '../../services/salesApi';

const { Title, Text } = Typography;
const { Option } = Select;

const CURRENCIES = ['USD','EUR','GBP','AED','SAR','QAR','KWD','BHD','INR'];

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await exchangeRatesApi.getAll(); setRates(r.data || []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ toCurrency: 'OMR', effectiveDate: new Date().toISOString().slice(0, 10), isActive: true });
    setModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditRecord(r);
    form.setFieldsValue({ ...r, effectiveDate: r.effectiveDate?.slice(0, 10) });
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editRecord) await exchangeRatesApi.update(editRecord.rateId, values);
      else await exchangeRatesApi.create(values);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await exchangeRatesApi.delete(id); message.success('Rate deleted'); load();
  };

  const columns = [
    {
      title: 'From Currency', dataIndex: 'fromCurrency',
      render: (v: string) => <Tag color="blue" style={{ fontWeight: 700, fontSize: 13 }}>{v}</Tag>,
    },
    {
      title: '', key: 'arrow',
      render: () => <SwapOutlined style={{ color: '#8c8c8c' }} />,
      width: 40,
    },
    {
      title: 'To Currency', dataIndex: 'toCurrency',
      render: (v: string) => <Tag color="green" style={{ fontWeight: 700, fontSize: 13 }}>{v}</Tag>,
    },
    {
      title: 'Exchange Rate', dataIndex: 'rate',
      render: (v: number) => <Text strong style={{ fontSize: 15 }}>1 : {Number(v).toFixed(6)}</Text>,
    },
    {
      title: 'Effective Date', dataIndex: 'effectiveDate',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      title: 'Status', dataIndex: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Popconfirm title="Delete rate?" onConfirm={() => handleDelete(r.rateId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Exchange Rates</Title>
          <Text type="secondary">Manage currency exchange rates for financial documents</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
          Add Rate
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={rates} columns={columns} rowKey="rateId" loading={loading} size="middle" pagination={false} />
      </Card>

      <Modal title={editRecord ? 'Edit Exchange Rate' : 'New Exchange Rate'} open={modalOpen}
        onCancel={() => setModalOpen(false)} footer={null} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="fromCurrency" label="From Currency" rules={[{ required: true }]}>
                <Select placeholder="Select currency">
                  {CURRENCIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toCurrency" label="To Currency" rules={[{ required: true }]}>
                <Select>
                  <Option value="OMR">OMR (Omani Rial)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="rate" label="Exchange Rate (1 unit of From = ? OMR)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.000001} precision={6} placeholder="e.g. 0.385000" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="Effective Date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input placeholder="Optional notes" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
