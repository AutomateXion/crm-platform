import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Typography, Tag, Space, Modal, Form, Input, DatePicker,
         Select, InputNumber, message, Popconfirm, Tooltip, Row, Col, Divider, Radio, Alert } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, StopOutlined,
         EyeOutlined, FileSearchOutlined, DeleteRowOutlined, SendOutlined, LinkOutlined, CopyOutlined, BarChartOutlined, TrophyOutlined } from '@ant-design/icons';
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
  const [cmpOpen, setCmpOpen] = useState(false);
  const [cmp, setCmp] = useState<any>(null);
  const [cmpLoading, setCmpLoading] = useState(false);
  const [awardMode, setAwardMode] = useState<'WHOLE' | 'SPLIT'>('WHOLE');
  const [wholeVendor, setWholeVendor] = useState<string | undefined>();
  const [lineAward, setLineAward] = useState<Record<string, string>>({});
  const [awarding, setAwarding] = useState(false);

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

  const autoPickLowest = () => {
    if (!cmp) return;
    const la: Record<string, string> = {};
    cmp.items.forEach((it: any) => {
      let best: any = null;
      cmp.vendors.forEach((v: any, vi: number) => {
        const cell = it.perVendor[vi];
        if (cell && cell.unitPrice != null && cell.unitPrice > 0) {
          if (!best || cell.unitPrice < best.price) best = { rfqVendorId: v.rfqVendorId, price: cell.unitPrice };
        }
      });
      if (best) la[it.rfqItemId] = best.rfqVendorId;
    });
    setLineAward(la);
    message.success('Lowest-priced vendor selected for each line');
  };

  const awardSummary = () => {
    if (!cmp) return { pos: 0, total: 0 };
    if (awardMode === 'WHOLE') {
      const v = cmp.vendors.find((x: any) => x.rfqVendorId === wholeVendor);
      return { pos: v ? 1 : 0, total: v ? v.totalAmount : 0 };
    }
    // SPLIT: group by vendor, sum line totals
    const vendorSet = new Set<string>();
    let total = 0;
    cmp.items.forEach((it: any) => {
      const vid = lineAward[it.rfqItemId];
      if (!vid) return;
      const vi = cmp.vendors.findIndex((v: any) => v.rfqVendorId === vid);
      const cell = it.perVendor[vi];
      if (cell && cell.unitPrice != null) { total += cell.unitPrice * it.quantity; vendorSet.add(vid); }
    });
    return { pos: vendorSet.size, total };
  };

  const doAward = async () => {
    if (!cmp) return;
    const payload: any = { mode: awardMode };
    if (awardMode === 'WHOLE') {
      if (!wholeVendor) { message.warning('Select a winning vendor'); return; }
      payload.rfqVendorId = wholeVendor;
    } else {
      const lineAwards = cmp.items
        .filter((it: any) => lineAward[it.rfqItemId])
        .map((it: any) => ({ rfqItemId: it.rfqItemId, rfqVendorId: lineAward[it.rfqItemId] }));
      if (!lineAwards.length) { message.warning('Assign at least one line to a vendor'); return; }
      payload.lineAwards = lineAwards;
    }
    setAwarding(true);
    try {
      const r = await rfqApi.award(cmp.rfqId, payload);
      const pos = (r.data?.purchaseOrders || []).map((x: any) => x.poNumber).join(', ');
      message.success(`${r.data?.posCreated || 0} draft PO(s) created: ${pos}`);
      setCmpOpen(false); load();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Award failed');
    } finally { setAwarding(false); }
  };

  const openComparison = async (row: any) => {
    setCmpOpen(true); setCmpLoading(true); setCmp(null);
    try {
      const r = await rfqApi.getComparison(row.rfqId);
      setCmp(r.data);
      // seed award defaults
      const d = r.data;
      const lowestV = (d.vendors || []).find((v: any) => v.isLowestTotal) || (d.vendors || [])[0];
      setWholeVendor(lowestV?.rfqVendorId);
      setAwardMode('WHOLE');
      const la: Record<string, string> = {};
      (d.items || []).forEach((it: any) => {
        // pick the vendor with the lowest unit price on this line
        let best: any = null;
        (d.vendors || []).forEach((v: any, vi: number) => {
          const cell = it.perVendor[vi];
          if (cell && cell.unitPrice != null && cell.unitPrice > 0) {
            if (!best || cell.unitPrice < best.price) best = { rfqVendorId: v.rfqVendorId, price: cell.unitPrice };
          }
        });
        if (best) la[it.rfqItemId] = best.rfqVendorId;
      });
      setLineAward(la);
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Could not load comparison');
    } finally { setCmpLoading(false); }
  };

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
        {['SENT', 'CLOSED', 'AWARDED'].includes(r.status) && (
          <Tooltip title="Compare quotes"><Button size="small" type="primary" ghost icon={<BarChartOutlined />} onClick={() => openComparison(r)} /></Tooltip>)}
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

      <Modal title={`Comparison${cmp ? ' — ' + cmp.rfqNumber : ''}`} open={cmpOpen}
        onCancel={() => setCmpOpen(false)} footer={null} width={Math.min(1100, 520 + (cmp?.vendors?.length || 1) * 180)}
        className="comparison-modal">
        {cmpLoading && <div style={{ textAlign: 'center', padding: 40 }}><Text>Loading comparison…</Text></div>}
        {cmp && !cmpLoading && (
          <div>
            {(!cmp.vendors || !cmp.vendors.length) ? (
              <Text type="secondary">No vendor has submitted a quote yet.</Text>
            ) : (
              <>
                <Table dataSource={cmp.items} rowKey="rfqItemId" size="small" pagination={false}
                  scroll={{ x: true }}
                  columns={[
                    { title: 'Item', dataIndex: 'description', fixed: 'left' as const, width: 200, render: (v: string, r: any) => (
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 12 }}>{v}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{Number(r.quantity).toFixed(2)} {r.unitOfMeasure}</Text>
                      </Space>) },
                    ...cmp.vendors.map((v: any, vi: number) => ({
                      title: <span style={{ fontSize: 12 }}>{v.vendorName}{v.isLowestTotal ? ' 🏆' : ''}</span>,
                      key: 'v' + vi, align: 'right' as const, width: 160,
                      render: (_: any, r: any) => {
                        const cell = r.perVendor[vi];
                        if (!cell || cell.unitPrice == null) return <Text type="secondary">—</Text>;
                        const isLow = r.lowestPrice != null && cell.unitPrice === r.lowestPrice;
                        return (
                          <Space direction="vertical" size={0} style={{ width: '100%' }}>
                            <Text strong style={{ color: isLow ? '#389e0d' : undefined, background: isLow ? '#f6ffed' : undefined, padding: isLow ? '0 6px' : 0, borderRadius: 4 }}>
                              {cmp.currencyCode} {Number(cell.unitPrice).toFixed(3)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {cell.leadTimeDays != null ? `${cell.leadTimeDays}d` : '—'}{cell.brandOffered ? ` · ${cell.brandOffered}` : ''}
                            </Text>
                          </Space>);
                      },
                    })),
                  ] as any} />

                <Table style={{ marginTop: 16 }} dataSource={cmp.vendors} rowKey="rfqVendorId" size="small" pagination={false}
                  title={() => <Text strong>Vendor totals & terms</Text>}
                  columns={[
                    { title: 'Vendor', dataIndex: 'vendorName', render: (v: string, r: any) => (
                      <Space>{r.isLowestTotal && <TrophyOutlined style={{ color: '#faad14' }} />}<Text strong={r.isLowestTotal}>{v}</Text>
                        {r.isSubmitted ? <Tag color="green">Submitted</Tag> : <Tag>Draft</Tag>}</Space>) },
                    { title: 'Total', dataIndex: 'totalAmount', align: 'right' as const,
                      render: (v: number, r: any) => <Text strong style={{ color: r.isLowestTotal ? '#389e0d' : undefined }}>{cmp.currencyCode} {Number(v).toFixed(3)}</Text> },
                    { title: 'Validity', dataIndex: 'validityDays', align: 'center' as const, render: (v: any) => v ? `${v}d` : '—' },
                    { title: 'Lead', dataIndex: 'overallLeadDays', align: 'center' as const, render: (v: any) => v ? `${v}d` : '—' },
                    { title: 'Payment', dataIndex: 'paymentTerms', render: (v: string) => v || '—' },
                    { title: 'Delivery', dataIndex: 'deliveryTerms', render: (v: string) => v || '—' },
                  ] as any} />
                <Divider style={{ margin: '16px 0 12px' }} />
                <Text strong>Award decision</Text>
                {cmp.status === 'AWARDED' ? (
                  <Alert style={{ marginTop: 8 }} type="success" showIcon message="This RFQ has already been awarded." />
                ) : (
                <div style={{ marginTop: 8 }}>
                  <Radio.Group value={awardMode} onChange={e => setAwardMode(e.target.value)} style={{ marginBottom: 12 }}>
                    <Radio.Button value="WHOLE">Award all to one vendor</Radio.Button>
                    <Radio.Button value="SPLIT">Award per line (split)</Radio.Button>
                  </Radio.Group>
                  {awardMode === 'WHOLE' ? (
                    <div>
                      <Text>Winning vendor: </Text>
                      <Select style={{ width: 320 }} value={wholeVendor} onChange={setWholeVendor}>
                        {cmp.vendors.map((v: any) => <Option key={v.rfqVendorId} value={v.rfqVendorId}>{v.vendorName} — {cmp.currencyCode} {Number(v.totalAmount).toFixed(3)}{v.isLowestTotal ? ' 🏆' : ''}</Option>)}
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <Button size="small" onClick={autoPickLowest} style={{ marginBottom: 8 }}>Auto-pick lowest per line</Button>
                      <Table dataSource={cmp.items} rowKey="rfqItemId" size="small" pagination={false}
                        columns={[
                          { title: 'Item', dataIndex: 'description', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
                          { title: 'Award to', width: 280, render: (_: any, r: any) => (
                            <Select style={{ width: '100%' }} value={lineAward[r.rfqItemId]}
                              onChange={val => setLineAward(prev => ({ ...prev, [r.rfqItemId]: val }))}
                              placeholder="Select vendor">
                              {cmp.vendors.map((v: any, vi: number) => {
                                const cell = r.perVendor[vi];
                                if (!cell || cell.unitPrice == null) return null;
                                const isLow = r.lowestPrice != null && cell.unitPrice === r.lowestPrice;
                                return <Option key={v.rfqVendorId} value={v.rfqVendorId}>{v.vendorName} — {cmp.currencyCode} {Number(cell.unitPrice).toFixed(3)}{isLow ? ' ✓' : ''}</Option>;
                              })}
                            </Select>) },
                        ] as any} />
                    </div>
                  )}
                  <div style={{ marginTop: 12, padding: 12, background: '#f6ffed', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Will create <strong>{awardSummary().pos}</strong> draft PO(s) · projected total <strong>{cmp.currencyCode} {awardSummary().total.toFixed(3)}</strong></Text>
                    <Popconfirm title={`Create ${awardSummary().pos} draft PO(s) and mark this RFQ awarded?`} onConfirm={doAward}>
                      <Button type="primary" icon={<TrophyOutlined />} loading={awarding} disabled={!awardSummary().pos}>Award & create PO(s)</Button>
                    </Popconfirm>
                  </div>
                </div>
                )}
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
                  Green = lowest unit price for that line · 🏆 = lowest overall total. Split award groups your per-line picks into one PO per vendor.
                </Text>
              </>
            )}
          </div>
        )}
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
