import React, { useState, useEffect, useCallback } from 'react';
import { Select, Modal, Form, Input, InputNumber, message, Button, Space, Switch, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { productsApi } from '../../services/salesApi';
import MasterSelect from './MasterSelect';

const { Option } = Select;

interface ProductSelectProps {
  value?: string;
  onChange?: (value: string, product?: any) => void;
  onProductSelect?: (product: any) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  allowClear?: boolean;
}

export default function ProductSelect({ value, onChange, onProductSelect, placeholder = 'Select product/service', style, allowClear = true }: ProductSelectProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const r = await productsApi.getAll({ limit: 50, search: q || undefined });
      setProducts(r.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val: string) => { setSearch(val); load(val); };

  const handleChange = (val: string) => {
    const product = products.find(p => p.productId === val);
    onChange?.(val, product);
    onProductSelect?.(product);
  };

  const handleCreate = async (values: any) => {
    setCreating(true);
    try {
      const code = values.productCode || `PROD-${new Date().getFullYear()}-${Math.floor(Math.random()*9000)+1000}`;
      const r = await productsApi.create({
        ...values,
        productCode: code,
        isInventoryItem: values.isInventoryItem ?? false,
        trackStock: values.trackStock ?? false,
        currencyCode: 'OMR',
      });
      message.success(`"${values.productName}" created`);
      setCreateOpen(false);
      form.resetFields();
      await load();
      const newProduct = r.data;
      onChange?.(newProduct.productId, newProduct);
      onProductSelect?.(newProduct);
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Failed to create');
    } finally { setCreating(false); }
  };

  return (
    <>
      <Select
        showSearch value={value} placeholder={placeholder}
        filterOption={false} onSearch={handleSearch}
        onChange={handleChange} loading={loading}
        allowClear={allowClear} style={style}
        notFoundContent={
          <div style={{ padding: '8px', textAlign: 'center' }}>
            <div style={{ color: '#8c8c8c', marginBottom: 8 }}>
              {search ? `No product found for "${search}"` : 'No products yet'}
            </div>
            <Button size="small" type="dashed" icon={<PlusOutlined />}
              onClick={() => { form.setFieldsValue({ productName: search }); setCreateOpen(true); }}>
              Create new product
            </Button>
          </div>
        }
        dropdownRender={menu => (
          <>
            {menu}
            <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
              <Button type="dashed" icon={<PlusOutlined />} block size="small"
                onClick={() => { form.resetFields(); setCreateOpen(true); }}>
                + Create New Product / Service
              </Button>
            </div>
          </>
        )}
      >
        {products.map(p => (
          <Option key={p.productId} value={p.productId}>
            <Space>
              <Tag color={p.isInventoryItem ? 'blue' : 'purple'} style={{ fontSize: 10 }}>
                {p.isInventoryItem ? 'ITEM' : 'SVC'}
              </Tag>
              <span>{p.productName}</span>
              {p.unitPrice && <span style={{ color: '#52c41a', fontSize: 11 }}>OMR {Number(p.unitPrice).toFixed(3)}</span>}
            </Space>
          </Option>
        ))}
      </Select>

      <Modal title="Create New Product / Service" open={createOpen}
        onCancel={() => setCreateOpen(false)} footer={null} width={520}>
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 12 }}>
          <Form.Item name="productName" label="Product / Service Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Web Development Service" autoFocus />
          </Form.Item>
          <Form.Item name="productCode" label="Code (optional — auto-generated if empty)">
            <Input placeholder="e.g. WEB-DEV-001" />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <MasterSelect categoryCode="product_categories" placeholder="Select category" />
          </Form.Item>
          <Form.Item name="unitOfMeasure" label="Unit of Measure">
            <MasterSelect categoryCode="uom" placeholder="Select UOM" useLabel={false} />
          </Form.Item>
          <Form.Item name="unitPrice" label="Unit Price (OMR)">
            <InputNumber style={{ width: '100%' }} min={0} step={0.001} precision={3} placeholder="0.000" />
          </Form.Item>
          <Form.Item name="isInventoryItem" label="Item Type" valuePropName="checked">
            <Switch checkedChildren="Inventory Item" unCheckedChildren="Service" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating}>Create</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
