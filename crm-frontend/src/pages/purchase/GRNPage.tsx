import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Select, Tag, Space, Modal, Form, Typography, Row, Col, message, Popconfirm, Tooltip, InputNumber, Divider, Switch } from 'antd';
import { FilePdfOutlined, PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PDFModal from '../../components/pdf/PDFModal';
import { updateStatus, grnsApi, suppliersApi, productsApi, purchaseOrdersApi } from '../../services/salesApi';
import SupplierSelect from '../../components/common/SupplierSelect';
import ProductSelect from '../../components/common/ProductSelect';
const { Title, Text } = Typography;
const { Option } = Select;
const STATUS_COLORS: Record<string,string> = { DRAFT:'default', CONFIRMED:'blue', RECEIVED:'green', CANCELLED:'red' };
export default function GRNPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await grnsApi.getAll({ page, limit:20, search:search||undefined }); setItems(r.data.data||[]); setTotal(r.data.total||0); }
    catch {} finally { setLoading(false); }
  }, [page, search]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    suppliersApi.getAll({ limit:100 }).then(r => setSuppliers(r.data.data||[])).catch(()=>{});
    productsApi.getAll({ limit:100 }).then(r => setProducts(r.data.data||[])).catch(()=>{});
    purchaseOrdersApi.getAll({ limit:100, excludeReceived: true }).then(r => setPurchaseOrders(r.data.data||[])).catch(()=>{});
  }, []);
  const defaultLine = () => ({ description:'', quantity:1, unitPrice:0, discountPct:0, lineTotal:0, isTaxable:true, unitOfMeasure:'PCS' });
  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ status:'DRAFT', currencyCode:'OMR', vatRate:5, isInventory:true, grnDate: new Date().toISOString().slice(0,10) });
    setLineItems([defaultLine()]);
    purchaseOrdersApi.getAll({ limit:100, excludeReceived: true }).then(r => setPurchaseOrders(r.data.data||[])).catch(()=>{});
    setModalOpen(true);
  };
  const calcTotals = (lines: any[], vatRate: number) => {
    const subtotal = lines.reduce((s,l) => s + Number(l.lineTotal||0), 0);
    const vatAmount = subtotal * (vatRate/100);
    form.setFieldsValue({ subtotal, vatAmount, totalAmount: subtotal + vatAmount });
  };
  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'productId') { const p = products.find(p => p.productId === value); if (p) { updated[idx].description = p.productName; updated[idx].unitPrice = Number(p.costPrice||p.unitPrice); updated[idx].unitOfMeasure = p.unitOfMeasure; updated[idx].itemCode = p.productCode; } }
    updated[idx].lineTotal = Number(updated[idx].quantity||1) * Number(updated[idx].unitPrice||0);
    setLineItems(updated); calcTotals(updated, Number(form.getFieldValue('vatRate')||5));
  };
  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      // Recalculate totals from line items
      const subtotal = lineItems.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
      const vatRate = Number(values.vatRate || 5);
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount;
      const payload = { ...values, items: lineItems, subtotal, vatAmount, totalAmount };
      if (editRecord) await grnsApi.update(editRecord.grnId, payload);
      else await grnsApi.create(payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };
  const handleConvert = async (id: string) => {
    try { await grnsApi.convertToInvoice(id); message.success('Converted to Purchase Invoice!'); navigate('/purchase/invoices'); }
    catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const columns = [
    { title: 'GRN #', dataIndex: 'grnNumber', render: (v: string) => <Tag color="green">{v}</Tag> },
    { title: 'Date', dataIndex: 'grnDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Supplier', dataIndex: 'supplierName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Total (OMR)', dataIndex: 'totalAmount', render: (v: number) => <Text strong>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    { title: 'Received By', dataIndex: 'receivedBy', render: (v: string) => v || '—' },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && <Tooltip title="Mark as Received"><Button size="small" type="primary" style={{background:'#52c41a'}} onClick={async () => { await updateStatus.grn(r.grnId, 'RECEIVED'); load(); message.success('Marked as Received!'); }}>Receive</Button></Tooltip>}
        <Tooltip title="View PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={async () => { try { const d = await grnsApi.getOne(r.grnId); setPdfData(d.data); setPdfOpen(true); } catch {} }} /></Tooltip>
        <Button size="small" icon={<EditOutlined />} onClick={async () => { setEditRecord(r); try { const d = await grnsApi.getOne(r.grnId); form.setFieldsValue({...d.data, grnDate: d.data.grnDate?.slice(0,10)}); setLineItems(d.data.items||[defaultLine()]); } catch {} setModalOpen(true); }} />
        {r.status === 'RECEIVED' && <Tooltip title="Convert to Invoice"><Button size="small" type="primary" icon={<ArrowRightOutlined />} onClick={() => handleConvert(r.grnId)} style={{background:'#722ed1',borderColor:'#722ed1'}} /></Tooltip>}
        <Popconfirm title="Delete GRN?" onConfirm={async () => { await grnsApi.delete(r.grnId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
        <div><Title level={4} style={{margin:0}}>Goods Receipt Notes</Title><Text type="secondary">Record received goods from suppliers — updates stock automatically</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{borderRadius:8}}>New GRN</Button>
      </div>
      <Card style={{borderRadius:12}}>
        <Input prefix={<SearchOutlined />} placeholder="Search GRNs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{width:260, marginBottom:16}} />
        <Table dataSource={items} columns={columns} rowKey="grnId" loading={loading} size="middle" pagination={{ current:page, total, pageSize:20, onChange:setPage }} />
      </Card>
      <Modal title={editRecord ? 'Edit GRN' : 'New Goods Receipt Note'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={900} style={{top:20}}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{marginTop:12}}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="supplierName" label="Supplier" rules={[{required:true}]}>
                <SupplierSelect onSupplierSelect={s => {
                  form.setFieldsValue({ supplierName: s.supplierName, supplierId: s.supplierId, poId: undefined });
                  purchaseOrdersApi.getAll({ limit: 100, excludeReceived: true })
                    .then(r => setPurchaseOrders((r.data.data || []).filter((p:any) => p.supplierId === s.supplierId || p.supplierName === s.supplierName)))
                    .catch(() => {});
                }} />
              </Form.Item>
              <Form.Item name="supplierId" hidden><input /></Form.Item>
            </Col>
            <Col span={6}><Form.Item name="grnDate" label="GRN Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}><Form.Item name="status" label="Status"><Select>{Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}>{s}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="poId" label="From Purchase Order (Optional)">
                <Select allowClear showSearch optionFilterProp="children"
                  onChange={async v => { if (v) { const po = await purchaseOrdersApi.getOne(v); form.setFieldsValue({ supplierName: po.data.supplierName }); setLineItems(po.data.items||[defaultLine()]); calcTotals(po.data.items||[], 5); } }}>
                  {purchaseOrders.map(po => <Option key={po.poId} value={po.poId}>{po.poNumber} — {po.supplierName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}><Form.Item name="deliveryNoteRef" label="Supplier DN Ref"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="isInventory" label="Update Stock" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
          </Row>
          <Divider>Items Received</Divider>
          <Row gutter={8} style={{marginBottom:8, fontWeight:600, color:'#8c8c8c', fontSize:12}}>
            <Col span={1}>#</Col><Col span={5}>Product</Col><Col span={6}>Description</Col><Col span={2}>UOM</Col><Col span={2}>Qty</Col><Col span={3}>Unit Price</Col><Col span={3}>Total</Col><Col span={1}></Col>
          </Row>
          {lineItems.map((item, idx) => (
            <Row gutter={8} key={idx} style={{marginBottom:8}} align="middle">
              <Col span={1}><Text type="secondary">{idx+1}</Text></Col>
              <Col span={5}><ProductSelect value={item.productId} onProductSelect={p => { if(p) updateLine(idx,'productId',p.productId); }} /></Col>
              <Col span={6}><Input value={item.description} onChange={e => updateLine(idx,'description',e.target.value)} /></Col>
              <Col span={2}><Input value={item.unitOfMeasure} onChange={e => updateLine(idx,'unitOfMeasure',e.target.value)} /></Col>
              <Col span={2}><InputNumber style={{width:'100%'}} min={0} step={0.001} value={item.quantity} onChange={v => updateLine(idx,'quantity',v)} /></Col>
              <Col span={3}><InputNumber style={{width:'100%'}} min={0} step={0.001} value={item.unitPrice} onChange={v => updateLine(idx,'unitPrice',v)} /></Col>
              <Col span={3}><Text strong style={{color:'#52c41a'}}>{Number(item.lineTotal).toFixed(3)}</Text></Col>
              <Col span={1}><Button size="small" danger onClick={() => { const u = lineItems.filter((_,i)=>i!==idx); setLineItems(u); calcTotals(u, Number(form.getFieldValue('vatRate')||5)); }}>×</Button></Col>
            </Row>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLineItems([...lineItems, defaultLine()])} style={{marginBottom:16}}>Add Item</Button>
          <Row justify="end">
            <Col span={8}>
              <div style={{background:'#fafafa', padding:12, borderRadius:8}}>
                <Row justify="space-between" style={{marginBottom:4}}><Text>Subtotal:</Text><Text strong>OMR {Number(form.getFieldValue('subtotal')||0).toFixed(3)}</Text></Row>
                <Row justify="space-between" style={{marginBottom:4}}><Text>VAT (5%):</Text><Text strong>OMR {Number(form.getFieldValue('vatAmount')||0).toFixed(3)}</Text></Row>
                <Divider style={{margin:'8px 0'}} />
                <Row justify="space-between"><Text strong style={{fontSize:15}}>Total:</Text><Text strong style={{fontSize:15, color:'#52c41a'}}>OMR {Number(form.getFieldValue('totalAmount')||0).toFixed(3)}</Text></Row>
              </div>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop:12}}>
            <Col span={12}><Form.Item name="receivedBy" label="Received By"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
          <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save' : 'Create GRN'}</Button>
          </div>
        </Form>
      </Modal>
      <PDFModal open={pdfOpen} onClose={() => setPdfOpen(false)} docType="grn" data={pdfData} />
    </div>
  );
}
