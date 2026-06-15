import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Popconfirm, Tooltip, InputNumber, Divider, Switch,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, FilePdfOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { updateStatus, purchaseOrdersApi, suppliersApi, productsApi, warehousesApi, warehouseLocationsApi } from '../../services/salesApi';
import PDFModal from '../../components/pdf/PDFModal';
import ProductSelect from '../../components/common/ProductSelect';
import SupplierSelect from '../../components/common/SupplierSelect';
import api from '../../services/api';
const { Title, Text } = Typography;
const { Option } = Select;
const STATUS_COLORS: Record<string,string> = { DRAFT:'default', SENT:'blue', CONFIRMED:'green', PARTIALLY_RECEIVED:'orange', RECEIVED:'cyan', CANCELLED:'red' };
export default function PurchaseOrdersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [vatRates, setVatRates] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [isAssetPurchase, setIsAssetPurchase] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const navigate = useNavigate();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await purchaseOrdersApi.getAll({ page, limit: 20, search: search||undefined, status: statusFilter||undefined }); setItems(r.data.data||[]); setTotal(r.data.total||0); }
    catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    suppliersApi.getAll({ limit: 100 }).then(r => setSuppliers(r.data.data||[])).catch(()=>{});
    productsApi.getAll({ limit: 100 }).then(r => setProducts(r.data.data||[])).catch(()=>{});
    warehousesApi.getAll().then(r => setWarehouses(r.data||[])).catch(()=>{});
    warehouseLocationsApi.getAll().then(r => setLocations(r.data||[])).catch(()=>{});
    api.post('/masters/bulk-values', { categoryCodes: ['vat_rates'] }).then(r => setVatRates(r.data.vat_rates||[])).catch(()=>{});
    fetch('/sales-api/sales/asset-brands', {headers:{Authorization:'Bearer '+localStorage.getItem('accessToken')}}).then(r=>r.json()).then(d=>setBrands((d||[]).map((b:any)=>b.brand_name))).catch(()=>{});
  }, []);
  const defaultLine = () => ({ description:'', quantity:1, unitPrice:0, discountPct:0, lineTotal:0, isTaxable:true, unitOfMeasure:'PCS', isFixedAsset:false, brand:'', model:'', serialNumber:'', warrantyMonths:0, assetCategory:'', warehouseLocationId:'' });
  const openCreate = () => {
    setEditRecord(null); form.resetFields();
    form.setFieldsValue({ status:'DRAFT', currencyCode:'OMR', vatRate:5, isInventory:true, isAssetPurchase:false, poDate: new Date().toISOString().slice(0,10) });
    setLineItems([defaultLine()]); setModalOpen(true);
  };
  const openEdit = async (r: any) => {
    setEditRecord(r);
    try { const d = await purchaseOrdersApi.getOne(r.poId); form.setFieldsValue({ ...d.data, poDate: d.data.poDate?.slice(0,10), expectedDate: d.data.expectedDate?.slice(0,10) }); setLineItems(d.data.items?.length ? d.data.items : [defaultLine()]); }
    catch {} setModalOpen(true);
  };
  const calcTotals = (lines: any[], vatRate: number) => {
    const subtotal = lines.reduce((s,l) => s + Number(l.lineTotal||0), 0);
    const taxable = lines.filter(l => l.isTaxable).reduce((s,l) => s + Number(l.lineTotal||0), 0);
    const vatAmount = taxable * (vatRate/100);
    form.setFieldsValue({ subtotal, vatAmount, totalAmount: subtotal + vatAmount });
  };
  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'productId') { const p = products.find(p => p.productId === value); if (p) { updated[idx].description = p.productName; updated[idx].unitPrice = Number(p.costPrice||p.unitPrice); updated[idx].unitOfMeasure = p.unitOfMeasure; updated[idx].itemCode = p.productCode; if (p.locationId && !updated[idx].warehouseLocationId) { updated[idx].warehouseLocationId = p.locationId; } } }
    const qty = Number(updated[idx].quantity||1); const price = Number(updated[idx].unitPrice||0); const disc = Number(updated[idx].discountPct||0);
    updated[idx].discountAmount = (qty * price * disc) / 100;
    updated[idx].lineTotal = qty * price - updated[idx].discountAmount;
    setLineItems(updated); calcTotals(updated, Number(form.getFieldValue('vatRate')||5));
  };
  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      // Recalculate totals from line items
      const subtotal = lineItems.reduce((s: number, l: any) => s + Number(l.lineTotal || 0), 0);
      const vatRate = Number(values.vatRate || 5);
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount;
      const payload = { ...values, items: lineItems, subtotal, vatAmount, totalAmount };
      if (editRecord) await purchaseOrdersApi.update(editRecord.poId, payload);
      else await purchaseOrdersApi.create(payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };
  const columns = [
    { title: 'PO #', dataIndex: 'poNumber', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Date', dataIndex: 'poDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Supplier', dataIndex: 'supplierName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Subject', dataIndex: 'subject', render: (v: string) => v ? <Text ellipsis style={{maxWidth:150}}>{v}</Text> : '—' },
    { title: 'Total (OMR)', dataIndex: 'totalAmount', render: (v: number) => <Text strong>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Expected', dataIndex: 'expectedDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v?.replace('_',' ')}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
                {r.status === 'DRAFT' && <Tooltip title="Confirm PO"><Button size="small" type="primary" style={{background:'#1890ff'}} onClick={async () => { await updateStatus.purchaseOrder(r.poId, 'CONFIRMED'); load(); message.success('PO Confirmed!'); }}>Confirm</Button></Tooltip>}
        <Tooltip title="View PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={async () => { try { const d = await purchaseOrdersApi.getOne(r.poId); setPdfData(d.data); setPdfOpen(true); } catch {} }} /></Tooltip>
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
        {r.status === 'CONFIRMED' && <Tooltip title="Create GRN"><Button size="small" type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate('/purchase/grn')} style={{background:'#52c41a',borderColor:'#52c41a'}} /></Tooltip>}
        <Popconfirm title="Delete PO?" onConfirm={async () => { await purchaseOrdersApi.delete(r.poId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <div><Title level={4} style={{margin:0}}>Purchase Orders</Title><Text type="secondary">Manage purchase orders to suppliers</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{borderRadius:8}}>New PO</Button>
      </div>
      <Card style={{borderRadius:12}}>
        <Space style={{marginBottom:16}}>
          <Input prefix={<SearchOutlined />} placeholder="Search POs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{width:260}} />
          <Select placeholder="Status" value={statusFilter||undefined} onChange={v => { setStatusFilter(v||''); setPage(1); }} allowClear style={{width:180}}>
            {Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}><Tag color={STATUS_COLORS[s]}>{s.replace('_',' ')}</Tag></Option>)}
          </Select>
        </Space>
        <Table dataSource={items} columns={columns} rowKey="poId" loading={loading} size="middle"
          pagination={{ current:page, total, pageSize:20, onChange:setPage }} />
      </Card>
      <Modal title={editRecord ? 'Edit Purchase Order' : 'New Purchase Order'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={900} style={{top:20}}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{marginTop:12}}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="supplierName" label="Supplier" rules={[{required:true}]}>
                <SupplierSelect onSupplierSelect={s => form.setFieldsValue({
                  supplierName: s.supplierName, supplierId: s.supplierId,
                  supplierAddress: s.address, supplierEmail: s.email, supplierTrn: s.trn,
                })} />
              </Form.Item>
              <Form.Item name="supplierId" hidden><input /></Form.Item>
            </Col>
            <Col span={12}><Form.Item name="subject" label="Subject"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="poDate" label="PO Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}><Form.Item name="expectedDate" label="Expected Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}><Form.Item name="status" label="Status"><Select>{Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}>{s.replace('_',' ')}</Option>)}</Select></Form.Item></Col>
            <Col span={6}><Form.Item name="vatRate" label="VAT Rate"><Select onChange={v => calcTotals(lineItems, Number(v))}>{vatRates.length ? vatRates.map((vr:any) => <Option key={vr.valueCode} value={Number(vr.metadata?.rate??5)}>{vr.valueLabel}</Option>) : <><Option value={0}>No VAT</Option><Option value={5}>5%</Option></>}</Select></Form.Item></Col>
          <Col span={6}><Form.Item name="isAssetPurchase" label="Asset Purchase" valuePropName="checked"><Switch checkedChildren="Asset" unCheckedChildren="Regular" onChange={v => setIsAssetPurchase(v)} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="supplierAddress"  label="Supplier Address"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={6}><Form.Item name="supplierEmail" label="Email"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="supplierTrn" label="TRN"><Input /></Form.Item></Col>
          </Row>
          <Divider>Line Items</Divider>
          <Row gutter={8} style={{marginBottom:8, fontWeight:600, color:'#8c8c8c', fontSize:12}}>
            <Col span={1}>#</Col><Col span={5}>Product</Col><Col span={5}>Description</Col><Col span={2}>UOM</Col><Col span={2}>Qty</Col><Col span={3}>Unit Price</Col><Col span={2}>Disc%</Col><Col span={3}>Total</Col><Col span={1}></Col>
          </Row>
          {lineItems.map((item, idx) => (<React.Fragment key={idx}>
            <Row gutter={8} style={{marginBottom:8}} align="middle">
              <Col span={1}><Text type="secondary">{idx+1}</Text></Col>
              <Col span={5}><ProductSelect value={item.productId} onProductSelect={p => { if(p) updateLine(idx,'productId',p.productId); }} /></Col>
              <Col span={5}><Input value={item.description} onChange={e => updateLine(idx,'description',e.target.value)} placeholder="Description" /></Col>
              <Col span={2}><Input value={item.unitOfMeasure} onChange={e => updateLine(idx,'unitOfMeasure',e.target.value)} /></Col>
              <Col span={2}><InputNumber style={{width:'100%'}} min={0} step={0.001} value={item.quantity} onChange={v => updateLine(idx,'quantity',v)} /></Col>
              <Col span={3}><InputNumber style={{width:'100%'}} min={0} step={0.001} value={item.unitPrice} onChange={v => updateLine(idx,'unitPrice',v)} /></Col>
              <Col span={2}><InputNumber style={{width:'100%'}} min={0} max={100} value={item.discountPct} onChange={v => updateLine(idx,'discountPct',v)} /></Col>
              <Col span={3}><Text strong style={{color:'#1890ff'}}>{Number(item.lineTotal).toFixed(3)}</Text></Col>
              <Col span={1}><Button size="small" danger onClick={() => { const u = lineItems.filter((_,i)=>i!==idx); setLineItems(u); calcTotals(u, Number(form.getFieldValue('vatRate')||5)); }}>×</Button></Col>
            </Row>
            <Row gutter={8} style={{marginBottom:4, background:'#e6f7ff', padding:'4px 0', borderRadius:6}} align="middle">
              <Col span={1}></Col>
              <Col span={8} style={{display:'flex',alignItems:'center',gap:6}}>
                <Text type="secondary" style={{fontSize:11,whiteSpace:'nowrap'}}>📦 Location:</Text>
                <Select
                  size="small"
                  style={{ flex:1 }}
                  placeholder="Select warehouse location"
                  allowClear showSearch optionFilterProp="children"
                  value={item.warehouseLocationId || undefined}
                  onChange={v => updateLine(idx,'warehouseLocationId',v)}
                >
                  {warehouses.map((w: any) => (
                    <Select.OptGroup key={w.warehouseId} label={w.warehouseName}>
                      {locations.filter((l: any) => l.warehouseId === w.warehouseId).map((l: any) => (
                        <Option key={l.locationId} value={l.locationId}>{l.locationCode}{l.locationName ? ` – ${l.locationName}` : ''}</Option>
                      ))}
                    </Select.OptGroup>
                  ))}
                </Select>
              </Col>
            </Row>
            {isAssetPurchase && <Row gutter={8} style={{marginBottom:8, background:'#f6ffed', padding:'4px 0', borderRadius:6}} align="middle">
                <Col span={1}></Col>
                <Col span={4}><Select style={{width:'100%'}} placeholder="Brand" allowClear showSearch value={item.brand} onChange={v=>updateLine(idx,'brand',v)}>
                  {brands.map((b:string)=><Option key={b} value={b}>{b}</Option>)}
                </Select></Col>
                <Col span={4}><Input value={item.model} onChange={e=>updateLine(idx,'model',e.target.value)} placeholder="Model #" /></Col>
                <Col span={5}><Input value={item.serialNumber} onChange={e=>updateLine(idx,'serialNumber',e.target.value)} placeholder="Serial Number" /></Col>
                <Col span={3}><InputNumber style={{width:'100%'}} min={0} value={item.warrantyMonths} onChange={v=>updateLine(idx,'warrantyMonths',v)} /></Col>
                <Col span={4}><Select style={{width:'100%'}} placeholder="Asset Category" allowClear value={item.assetCategory} onChange={v=>updateLine(idx,'assetCategory',v)}>
                  {['IT Equipment','Office Furniture','Vehicles','Machinery','Buildings','Electrical Equipment','Security Systems','Other'].map(c=><Option key={c} value={c}>{c}</Option>)}
                </Select></Col>
                <Col span={3}><Select style={{width:'100%'}} value={item.isFixedAsset} onChange={v=>updateLine(idx,'isFixedAsset',v)}>
                  <Option value={true}>Fixed Asset</Option><Option value={false}>Consumable</Option>
                </Select></Col>
              </Row>}
          </React.Fragment>))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLineItems([...lineItems, defaultLine()])} style={{marginBottom:16}}>Add Line Item</Button>
          <Row gutter={12} justify="end">
            <Col span={8}>
              <div style={{background:'#fafafa', padding:12, borderRadius:8}}>
                <Row justify="space-between" style={{marginBottom:4}}><Text>Subtotal:</Text><Text strong>OMR {Number(form.getFieldValue('subtotal')||0).toFixed(3)}</Text></Row>
                <Row justify="space-between" style={{marginBottom:4}}><Text>VAT:</Text><Text strong>OMR {Number(form.getFieldValue('vatAmount')||0).toFixed(3)}</Text></Row>
                <Divider style={{margin:'8px 0'}} />
                <Row justify="space-between"><Text strong style={{fontSize:15}}>Total:</Text><Text strong style={{fontSize:15, color:'#1890ff'}}>OMR {Number(form.getFieldValue('totalAmount')||0).toFixed(3)}</Text></Row>
              </div>
            </Col>
          </Row>
          <Form.Item name="notes" label="Notes" style={{marginTop:12}}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="termsConditions" label="Terms & Conditions"><Input.TextArea rows={2} /></Form.Item>
          <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save Changes' : 'Create PO'}</Button>
          </div>
        </Form>
      </Modal>
      <PDFModal open={pdfOpen} onClose={() => setPdfOpen(false)} docType="purchase-order" data={pdfData} />
    </div>
  );
}
