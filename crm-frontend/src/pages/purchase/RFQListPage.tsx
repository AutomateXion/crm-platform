import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Typography, Tag, Space, Modal, Form, Input, DatePicker,
         Select, InputNumber, message, Popconfirm, Tooltip, Row, Col, Divider } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, StopOutlined,
         EyeOutlined, FileSearchOutlined, DeleteRowOutlined, SendOutlined, LinkOutlined, CopyOutlined } from '@ant-design/icons';
import { rfqApi, suppliersApi, productsApi } from '../../services/salesApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'default', SENT: 'blue', CLOSED: 'orange', AWARDED: 'green', CANCELLED: 'red',
};

export default function RFQListPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [linksModalOpen, setLinksModalOpen] = useState(false);
  const [vendorLinks, setVendorLinks] = useState<any[]>([]);
  const [linksRfq, setLinksRfq] = useState<any>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await rfqApi.getAll(statusFilter ? { status: statusFilter } : {});
      setRows(Array.isArray(r.data) ? r.data : (r.data?.data || []));
    } catch { /* empty */ } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    suppliersApi.getAll({ limit: 200 }).then(r => setSuppliers(r.data?.data || [])).catch(() => {});
    productsApi.getAll({ limit: 500 }).then(r => setProducts(r.data?.data || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setItems([{ key: Date.now(), description: '', quantity: 1, unitOfMeasure: '', specNotes: '', productId: undefined }]);
    setVendorIds([]);
    setModalOpen(true);
  };

  const openEdit = async (row: any) => {
    try {
      const r = await rfqApi.getOne(row.rfqId);
      const d = r.data;
      setEditing(d);
      form.setFieldsValue({
        title: d.title, description: d.description,
        responseDeadline: d.responseDeadline ? dayjs(d.responseDeadline) : null,
        currencyCode: d.currencyCode || 'OMR', termsText: d.termsText,
      });
      setItems((d.items || []).map((it: any, i: number) => ({
        key: it.rfqItemId || i, productId: it.productId, description: it.description,
        quantity: it.quantity, unitOfMeasure: it.unitOfMeasure, specNotes: it.specNotes,
      })));
      setVendorIds((d.vendors || []).map((v: any) => v.supplierId).filter(Boolean));
      setModalOpen(true);
    } catch { message.error('Could not load RFQ'); }
  };

  const addItem = () => setItems(prev => [...prev, { key: Date.now(), description: '', quantity: 1, unitOfMeasure: '', specNotes: '', productId: undefined }]);
  const removeItem = (key: any) => setItems(prev => prev.filter(i => i.key !== key));
  const updateItem = (key: any, field: string, value: any) => {
    setItems(prev => prev.map(i => {
      if (i.key !== key) return i;
      const next = { ...i, [field]: value };
      if (field === 'productId' && value) {
        const p = products.find(pr => (pr.productId || pr.product_id) === value);
        if (p) { next.description = p.productName || p.product_name; next.unitOfMeasure = p.unitOfMeasure || p.unit_of_measure || ''; next.itemCode = p.productCode || p.product_code; }
      }
      return next;
    }));
  };

  const handleSave = async () => {
    let header: any;
    try { header = await form.validateFields(); } catch { return; }
    const validItems = items.filter(i => (i.description || '').trim() && Number(i.quantity) > 0);
    if (!validItems.length) { message.warning('Add at least one item with a description and quantity'); return; }
    const vendors = vendorIds.map(sid => {
      const s = suppliers.find(x => (x.supplierId || x.supplier_id) === sid);
      return { supplierId: sid, vendorName: s?.supplierName || s?.supplier_name || '', vendorEmail: s?.email || '' };
    });
    const noEmail = vendors.filter(v => !v.vendorEmail);
    if (noEmail.length) {
      message.warning(`${noEmail.length} selected vendor(s) have no email on file — add an email to their supplier record before sending invites.`);
    }
    const payload: any = {
      title: header.title, description: header.description,
      responseDeadline: header.responseDeadline ? header.responseDeadline.toISOString() : null,
      currencyCode: header.currencyCode || 'OMR', termsText: header.termsText,
      items: validItems.map(i => ({ productId: i.productId || null, itemCode: i.itemCode || null,
        description: i.description, quantity: Number(i.quantity), unitOfMeasure: i.unitOfMeasure, specNotes: i.specNotes })),
      vendors,
    };
    setSaving(true);
    try {
      if (editing) { await rfqApi.update(editing.rfqId, payload); message.success('RFQ updated'); }
      else { await rfqApi.create(payload); message.success('RFQ created (draft)'); }
      setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const doCancel = async (row: any) => { try { await rfqApi.cancel(row.rfqId); message.success('RFQ cancelled'); load(); } catch { message.error('Cancel failed'); } };
  const doDelete = async (row: any) => { try { await rfqApi.delete(row.rfqId); message.success('RFQ deleted'); load(); } catch (e: any) { message.error(e.response?.data?.message || 'Delete failed'); } };

  const doSend = async (row: any) => {
    setSending(true);
    try {
      const r = await rfqApi.send(row.rfqId, { frontendBaseUrl: window.location.origin });
      message.success(r.data?.message || 'Invitations processed');
      load();
      // immediately show the links so the buyer can copy/share
      openLinks(row);
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Could not send invitations');
    } finally { setSending(false); }
  };

  const openLinks = async (row: any) => {
    try {
      const r = await rfqApi.getVendorLinks(row.rfqId);
      setVendorLinks(Array.isArray(r.data) ? r.data : []);
      setLinksRfq(row);
      setLinksModalOpen(true);
    } catch { message.error('Could not load vendor links'); }
  };

  const copyLink = (link: string) => {
    navigator.clipboard?.writeText(link).then(
      () => message.success('Link copied'),
      () => message.warning('Copy failed — select and copy manually')
    );
  };

  const columns = [
    { title: 'RFQ #', dataIndex: 'rfqNumber', key: 'num', width: 150, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Items', dataIndex: 'itemCount', key: 'items', width: 70, align: 'center' as const },
    { title: 'Vendors', dataIndex: 'vendorCount', key: 'vendors', width: 80, align: 'center' as const },
    { title: 'Responses', key: 'resp', width: 100, align: 'center' as const,
      render: (_: any, r: any) => <Text>{r.responseCount}/{r.vendorCount}</Text> },
    { title: 'Deadline', dataIndex: 'responseDeadline', key: 'dl', width: 140,
      render: (v: string) => v ? dayjs(v).format('DD MMM YYYY') : '—' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: (v: string) => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag> },
    { title: '', key: 'actions', width: 140, render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>}
        {['DRAFT', 'SENT'].includes(r.status) && (
          <Popconfirm title={r.status === 'SENT' ? 'Re-send invitations to all vendors?' : 'Send invitations to all invited vendors?'} onConfirm={() => doSend(r)}>
            <Tooltip title="Send invitations"><Button size="small" type="primary" ghost icon={<SendOutlined />} loading={sending} /></Tooltip>
          </Popconfirm>)}
        {['SENT', 'CLOSED', 'AWARDED'].includes(r.status) && (
          <Tooltip title="Vendor links"><Button size="small" icon={<LinkOutlined />} onClick={() => openLinks(r)} /></Tooltip>)}
        {['DRAFT', 'SENT'].includes(r.status) && (
          <Popconfirm title="Cancel this RFQ?" onConfirm={() => doCancel(r)}>
            <Tooltip title="Cancel"><Button size="small" icon={<StopOutlined />} /></Tooltip>
          </Popconfirm>)}
        {['DRAFT', 'CANCELLED'].includes(r.status) && (
          <Popconfirm title="Delete this RFQ permanently?" onConfirm={() => doDelete(r)}>
            <Tooltip title="Delete"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>)}
      </Space>
    ) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}><FileSearchOutlined /> Request for Quotation (RFQ)</Title>
          <Text type="secondary">Invite vendors to quote, compare bids, and convert the winner to a purchase order</Text>
        </div>
        <Space>
          <Select placeholder="All statuses" allowClear style={{ width: 160 }} value={statusFilter} onChange={setStatusFilter}>
            {['DRAFT', 'SENT', 'CLOSED', 'AWARDED', 'CANCELLED'].map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New RFQ</Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={rows} columns={columns} rowKey="rfqId" loading={loading} size="middle"
          pagination={{ pageSize: 20, showTotal: t => `${t} RFQs` }} />
      </Card>

      <Modal title={editing ? `Edit ${editing.rfqNumber}` : 'New RFQ'} open={modalOpen}
        onCancel={() => setModalOpen(false)} onOk={handleSave} confirmLoading={saving}
        okText={editing ? 'Save changes' : 'Create draft'} width={900}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={16}><Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter a title' }]}><Input placeholder="e.g. Q3 stationery supply" /></Form.Item></Col>
            <Col span={8}><Form.Item name="currencyCode" label="Currency" initialValue="OMR"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}><Form.Item name="description" label="Description / scope"><TextArea rows={2} placeholder="Optional scope or instructions for vendors" /></Form.Item></Col>
            <Col span={8}><Form.Item name="responseDeadline" label="Response deadline"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0' }}>Items</Divider>
          <Table dataSource={items} rowKey="key" size="small" pagination={false}
            columns={[
              { title: 'Product', dataIndex: 'productId', width: 200, render: (v: any, r: any) => (
                <Select showSearch allowClear optionFilterProp="children" placeholder="Pick / free-text below"
                  style={{ width: '100%' }} value={v} onChange={val => updateItem(r.key, 'productId', val)}>
                  {products.map(p => { const id = p.productId || p.product_id; return <Option key={id} value={id}>{p.productName || p.product_name}</Option>; })}
                </Select>) },
              { title: 'Description', dataIndex: 'description', render: (v: string, r: any) => (
                <Input value={v} placeholder="Item description" onChange={e => updateItem(r.key, 'description', e.target.value)} />) },
              { title: 'Qty', dataIndex: 'quantity', width: 90, render: (v: number, r: any) => (
                <InputNumber min={0} value={v} style={{ width: '100%' }} onChange={val => updateItem(r.key, 'quantity', val)} />) },
              { title: 'UOM', dataIndex: 'unitOfMeasure', width: 80, render: (v: string, r: any) => (
                <Input value={v} onChange={e => updateItem(r.key, 'unitOfMeasure', e.target.value)} />) },
              { title: '', width: 40, render: (_: any, r: any) => items.length > 1 && (
                <Button size="small" danger type="text" icon={<DeleteRowOutlined />} onClick={() => removeItem(r.key)} />) },
            ] as any} />
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addItem} style={{ marginTop: 8 }}>Add item</Button>

          <Divider orientation="left" style={{ margin: '16px 0 8px' }}>Invite vendors</Divider>
          <Select mode="multiple" showSearch optionFilterProp="children" placeholder="Select suppliers to invite"
            style={{ width: '100%' }} value={vendorIds} onChange={setVendorIds}>
            {suppliers.map(s => { const id = s.supplierId || s.supplier_id; const nm = s.supplierName || s.supplier_name;
              const noEmail = !s.email; return <Option key={id} value={id}>{nm}{noEmail ? ' (no email)' : ''}</Option>; })}
          </Select>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 6 }}>
            Vendors need an email to receive their quote link. The RFQ is saved as a draft; you'll send invitations from the RFQ once ready.
          </Text>

          <Form.Item name="termsText" label="Terms & conditions" style={{ marginTop: 16 }}>
            <TextArea rows={2} placeholder="Payment terms, delivery expectations, validity required, etc." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`Vendor quote links${linksRfq ? ' — ' + linksRfq.rfqNumber : ''}`} open={linksModalOpen}
        onCancel={() => setLinksModalOpen(false)} footer={null} width={760}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Each link is unique to one vendor and opens their private quote form. Share manually (e.g. email, WhatsApp) if automatic email is off.
        </Text>
        <Table style={{ marginTop: 12 }} dataSource={vendorLinks} rowKey={(r: any) => r.vendorName + r.link}
          size="small" pagination={false}
          columns={[
            { title: 'Vendor', dataIndex: 'vendorName', render: (v: string, r: any) => (
              <Space direction="vertical" size={0}>
                <Text strong>{v}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{r.vendorEmail || 'no email'}</Text>
              </Space>) },
            { title: 'Status', dataIndex: 'status', width: 100, render: (v: string) => <Tag>{v}</Tag> },
            { title: 'Link', key: 'link', render: (_: any, r: any) => (
              <Space>
                <Input value={r.link} readOnly size="small" style={{ width: 320 }} />
                <Tooltip title="Copy"><Button size="small" icon={<CopyOutlined />} onClick={() => copyLink(r.link)} /></Tooltip>
              </Space>) },
          ] as any} />
      </Modal>
    </div>
  );
}
