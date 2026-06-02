import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, Row, Col, Typography, message, Popconfirm, Tabs, Statistic, DatePicker, Upload, Progress, Alert, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, ToolOutlined, SwapOutlined, DollarOutlined, WarningOutlined, CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import axios from 'axios';
import api from '../../services/api';
import dayjs from 'dayjs';
import COASelect from '../../components/common/COASelect';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const sApi = axios.create({ baseURL: '/sales-api' });
sApi.interceptors.request.use(c => { const t = localStorage.getItem('accessToken'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const STATUS_COLOR: Record<string,string> = { ACTIVE:'#52c41a', DISPOSED:'#ff4d4f', UNDER_MAINTENANCE:'#fa8c16', WRITTEN_OFF:'#8c8c8c', IDLE:'#1890ff' };
const CONDITION_COLOR: Record<string,string> = { EXCELLENT:'#52c41a', GOOD:'#1890ff', FAIR:'#fa8c16', POOR:'#ff4d4f', CRITICAL:'#f5222d' };
const PRIORITY_COLOR: Record<string,string> = { LOW:'#52c41a', MEDIUM:'#fa8c16', HIGH:'#ff4d4f', CRITICAL:'#f5222d' };

const CATEGORIES = ['IT Equipment','Office Furniture','Vehicles','Machinery','Buildings','Land','Electrical Equipment','Plumbing','Security Systems','Other'];
const DEPR_METHODS = ['STRAIGHT_LINE','DECLINING_BALANCE','UNITS_OF_PRODUCTION'];

// ── Asset Form Modal ──────────────────────────────────────────
function AssetModal({ open, onClose, onSuccess, editRecord, coaAccounts, users, suppliers }: any) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [poAssets, setPoAssets] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetch('/sales-api/sales/asset-brands',{headers:{Authorization:'Bearer '+localStorage.getItem('accessToken')}}).then(r=>r.json()).then(d=>setBrands((d||[]).map((b:any)=>b.brand_name))).catch(()=>{});
      fetch('/sales-api/sales/po-asset-items',{headers:{Authorization:'Bearer '+localStorage.getItem('accessToken')}}).then(r=>r.json()).then(d=>setPoAssets(Array.isArray(d)?d:[])).catch(()=>{});
      if (editRecord) {
        form.setFieldsValue({ ...editRecord, purchaseDate: editRecord.purchaseDate ? dayjs(editRecord.purchaseDate) : null });
        if (editRecord.locationLat) setLocation({ lat: editRecord.locationLat, lng: editRecord.locationLng });
      } else {
        form.resetFields();
        form.setFieldsValue({ status: 'ACTIVE', condition: 'GOOD', depreciationMethod: 'STRAIGHT_LINE', usefulLifeYears: 5, salvageValue: 0, coaAssetAccount: '1210', coaAccumDeprAccount: '1220', coaDeprExpenseAccount: '6700' });
        setLocation(null);
      }
    }
  }, [open, editRecord]);

  const getLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) { message.error('GPS not supported'); setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        form.setFieldsValue({ locationLat: loc.lat, locationLng: loc.lng });
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`)
          .then(r => r.json()).then(d => { if(d.display_name) form.setFieldsValue({ locationAddress: d.display_name }); }).catch(()=>{});
        setLocating(false);
        message.success('GPS captured!');
      },
      () => { setLocating(false); message.error('Could not get location'); }
    );
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const payload = { ...values, locationLat: location?.lat, locationLng: location?.lng,
        purchaseDate: values.purchaseDate?.format('YYYY-MM-DD') };
      if (editRecord) await sApi.put(`/sales/assets/${editRecord.assetId}`, payload);
      else await sApi.post('/sales/assets', payload);
      message.success('Asset saved!');
      // Refresh PO assets dropdown
      fetch('/sales-api/sales/po-asset-items',{headers:{Authorization:'Bearer '+localStorage.getItem('accessToken')}}).then(r=>r.json()).then(d=>setPoAssets(Array.isArray(d)?d:[])).catch(()=>{});
      onSuccess();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const purchaseCost = Form.useWatch('purchaseCost', form) || 0;
  const salvageValue = Form.useWatch('salvageValue', form) || 0;
  const usefulLife = Form.useWatch('usefulLifeYears', form) || 5;
  const annualDepr = usefulLife > 0 ? (purchaseCost - salvageValue) / usefulLife : 0;
  const monthlyDepr = annualDepr / 12;

  return (
    <Modal title={editRecord ? 'Edit Fixed Asset' : 'Add Fixed Asset'} open={open} onCancel={onClose} footer={null} width={860} style={{ top: 20 }}>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
        {poAssets.length > 0 && (
          <div style={{background:'#e6f7ff',border:'1px solid #91d5ff',borderRadius:8,padding:'10px 12px',marginBottom:12}}>
            <div style={{fontSize:12,color:'#1890ff',fontWeight:600,marginBottom:6}}>📦 Auto-fill from Purchase Order</div>
            <Select style={{width:'100%'}} placeholder="Select purchased item to auto-fill all details..." allowClear showSearch
              onChange={(v:any) => {
                const item = poAssets.find((a:any) => String(a.id)===String(v));
                if (item) {
                  try {
                    form.setFieldsValue({
                      assetName: item.description || undefined,
                      brand: item.brand || undefined,
                      model: item.model || undefined,
                      serialNumber: item.serialNumber || undefined,
                      supplierName: item.supplierName || undefined,
                      purchaseCost: item.unitPrice ? Number(item.unitPrice) : undefined,
                      category: item.assetCategory || undefined,
                      invoiceNumber: item.poNumber || undefined,
                      warrantyExpiry: item.warrantyExpiry ? String(item.warrantyExpiry).slice(0,10) : undefined,
                      purchaseDate: item.poDate ? dayjs(String(item.poDate).slice(0,10)) : undefined,
                      poItemBaseId: item.baseId || item.id,
                    });
                  } catch(e) { console.error('Auto-fill error:', e); }
                }
              }}>
              {poAssets.map((a:any) => {
                const label = `${a.displayName||a.description}${a.brand?' — '+a.brand:''} | ${a.supplierName} | OMR ${Number(a.unitPrice||0).toFixed(3)}${Number(a.quantity)>1?' ('+a.remaining+' remaining)':''}`;
                return <Option key={a.id} value={a.id}>{label}</Option>;
              })}
            </Select>
          </div>
        )}
        <Row gutter={12}>
          <Col span={8}><Form.Item name="assetName" label="Asset Name" rules={[{required:true}]}><Input placeholder="e.g. Dell Laptop" /></Form.Item></Col>
          <Col span={4}><Form.Item name="assetCode" label="Asset Code"><Input placeholder="Auto-generated" /></Form.Item></Col>
          <Col span={6}><Form.Item name="category" label="Category"><Select showSearch>{CATEGORIES.map(c=><Option key={c} value={c}>{c}</Option>)}</Select></Form.Item></Col>
          <Col span={6}><Form.Item name="subCategory" label="Sub Category"><Input placeholder="Laptop, Printer..." /></Form.Item></Col>
        </Row>
        <Row gutter={12}>
          <Col span={6}><Form.Item name="brand" label="Brand">
              <Select showSearch allowClear placeholder="Select brand..."
                dropdownRender={menu => (<>
                  {menu}
                  <div style={{padding:'8px',borderTop:'1px solid #f0f0f0',display:'flex',gap:8}}>
                    <Input size="small" placeholder="Add new brand" value={newBrand} onChange={e=>setNewBrand(e.target.value)} onPressEnter={async()=>{
                      if(!newBrand.trim()) return;
                      await fetch('/sales-api/sales/asset-brands',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('accessToken')},body:JSON.stringify({brandName:newBrand})});
                      setBrands([...brands,newBrand]); setNewBrand('');
                    }} />
                    <Button size="small" type="primary" onClick={async()=>{
                      if(!newBrand.trim()) return;
                      await fetch('/sales-api/sales/asset-brands',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('accessToken')},body:JSON.stringify({brandName:newBrand})});
                      setBrands([...brands,newBrand]); setNewBrand('');
                    }}>Add</Button>
                  </div>
                </>)}>
                {brands.map((b:string)=><Option key={b} value={b}>{b}</Option>)}
              </Select>
            </Form.Item></Col>
          <Col span={6}><Form.Item name="model" label="Model"><Input /></Form.Item></Col>
          <Col span={6}><Form.Item name="serialNumber" label="Serial Number"><Input /></Form.Item></Col>
          <Col span={6}><Form.Item name="invoiceNumber" label="Invoice #"><Input /></Form.Item></Col>
        </Row>
        <Divider>Purchase & Depreciation</Divider>
        <Row gutter={12}>
          <Col span={6}><Form.Item name="purchaseDate" label="Purchase Date"><DatePicker style={{width:'100%'}} /></Form.Item></Col>
          <Col span={6}><Form.Item name="purchaseCost" label="Purchase Cost (OMR)" rules={[{required:true}]}><InputNumber style={{width:'100%'}} min={0} step={0.001} precision={3} /></Form.Item></Col>
          <Col span={6}><Form.Item name="salvageValue" label="Salvage Value (OMR)"><InputNumber style={{width:'100%'}} min={0} step={0.001} precision={3} /></Form.Item></Col>
          <Col span={6}><Form.Item name="usefulLifeYears" label="Useful Life (Years)"><InputNumber style={{width:'100%'}} min={1} max={100} /></Form.Item></Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}><Form.Item name="depreciationMethod" label="Depreciation Method"><Select>{DEPR_METHODS.map(m=><Option key={m} value={m}>{m.replace('_',' ')}</Option>)}</Select></Form.Item></Col>
          <Col span={8}><Form.Item name="supplierName" label="Supplier"><Input placeholder="Supplier name" /></Form.Item></Col>
          <Col span={8}>
            <div style={{ background:'#f6ffed', border:'1px solid #b7eb8f', borderRadius:8, padding:'8px 12px', marginTop:24 }}>
              <Text style={{ fontSize:11, color:'#52c41a' }}>Annual: OMR {annualDepr.toFixed(3)} | Monthly: OMR {monthlyDepr.toFixed(3)}</Text>
            </div>
          </Col>
        </Row>
        <Divider>COA Accounts (for Auto Journal)</Divider>
        <Row gutter={12}>
          <Col span={8}><Form.Item name="coaAssetAccount" label="Asset Account">
            <COASelect accountTypes={['ASSET']} placeholder="Select asset account..." />
          </Form.Item></Col>
          <Col span={8}><Form.Item name="coaAccumDeprAccount" label="Accum. Depreciation Account">
            <COASelect accountTypes={['ASSET']} placeholder="Select accum. depreciation account..." />
          </Form.Item></Col>
          <Col span={8}><Form.Item name="coaDeprExpenseAccount" label="Depreciation Expense Account">
            <COASelect accountTypes={['EXPENSE']} placeholder="Select depreciation expense account..." />
          </Form.Item></Col>
        </Row>
        <Divider>Location & Assignment</Divider>
        <Row gutter={12}>
          <Col span={8}><Form.Item name="department" label="Department"><Input placeholder="IT, Finance, HR..." /></Form.Item></Col>
          <Col span={8}><Form.Item name="assignedToName" label="Assigned To"><Input placeholder="Employee name" /></Form.Item></Col>
          <Col span={8}><Form.Item name="locationName" label="Location Name"><Input placeholder="Office, Warehouse..." /></Form.Item></Col>
        </Row>
        <Row gutter={12}>
          <Col span={14}><Form.Item name="locationAddress" label="Location Address"><Input placeholder="Full address (auto-filled from GPS)" /></Form.Item></Col>
          <Col span={4} style={{ paddingTop: 28 }}>
            <Button icon={<EnvironmentOutlined />} onClick={getLocation} loading={locating} type={location?'primary':'default'} block>
              {location?'✓ GPS':'Get GPS'}
            </Button>
          </Col>
          <Col span={3}><Form.Item name="locationLat" label="Lat"><InputNumber style={{width:'100%'}} step={0.0001} precision={7} /></Form.Item></Col>
          <Col span={3}><Form.Item name="locationLng" label="Lng"><InputNumber style={{width:'100%'}} step={0.0001} precision={7} /></Form.Item></Col>
        </Row>
        <Row gutter={12}>
          <Col span={6}><Form.Item name="status" label="Status"><Select>{Object.keys(STATUS_COLOR).map(s=><Option key={s} value={s}>{s.replace('_',' ')}</Option>)}</Select></Form.Item></Col>
          <Col span={6}><Form.Item name="condition" label="Condition"><Select>{Object.keys(CONDITION_COLOR).map(c=><Option key={c} value={c}>{c}</Option>)}</Select></Form.Item></Col>
          <Col span={6}><Form.Item name="warrantyExpiry" label="Warranty Expiry"><Input type="date" /></Form.Item></Col>
          <Col span={6}><Form.Item name="insuranceExpiry" label="Insurance Expiry"><Input type="date" /></Form.Item></Col>
        </Row>
        <Form.Item name="poItemBaseId" hidden><Input /></Form.Item>
        <Form.Item name="notes" label="Notes"><TextArea rows={2} /></Form.Item>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>{editRecord?'Save':'Add Asset'}</Button>
        </div>
      </Form>
    </Modal>
  );
}

// ── Maintenance Modal ─────────────────────────────────────────
function MaintenanceModal({ open, onClose, onSuccess, assets, users }: any) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await sApi.post('/sales/maintenance', values);
      message.success('Maintenance scheduled!'); form.resetFields(); onSuccess();
    } catch { message.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Schedule Maintenance" open={open} onCancel={onClose} footer={null} width={640}>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
        <Row gutter={12}>
          <Col span={12}><Form.Item name="assetId" label="Asset" rules={[{required:true}]}>
            <Select showSearch optionFilterProp="children" placeholder="Select asset...">
              {assets.map((a:any) => <Option key={a.assetId} value={a.assetId}>{a.assetName} ({a.assetCode})</Option>)}
            </Select>
          </Form.Item></Col>
          <Col span={12}><Form.Item name="maintenanceType" label="Type" rules={[{required:true}]}>
            <Select><Option value="PREVENTIVE">Preventive</Option><Option value="CORRECTIVE">Corrective</Option><Option value="INSPECTION">Inspection</Option></Select>
          </Form.Item></Col>
        </Row>
        <Form.Item name="title" label="Title" rules={[{required:true}]}><Input placeholder="e.g. Annual Service" /></Form.Item>
        <Form.Item name="description" label="Description"><TextArea rows={2} /></Form.Item>
        <Row gutter={12}>
          <Col span={6}><Form.Item name="scheduledDate" label="Scheduled Date"><Input type="date" /></Form.Item></Col>
          <Col span={6}><Form.Item name="nextDueDate" label="Next Due Date"><Input type="date" /></Form.Item></Col>
          <Col span={6}><Form.Item name="frequencyDays" label="Frequency (days)"><InputNumber style={{width:'100%'}} min={1} /></Form.Item></Col>
          <Col span={6}><Form.Item name="priority" label="Priority"><Select><Option value="LOW">Low</Option><Option value="MEDIUM">Medium</Option><Option value="HIGH">High</Option><Option value="CRITICAL">Critical</Option></Select></Form.Item></Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}><Form.Item name="technicianName" label="Technician"><Input placeholder="Technician name" /></Form.Item></Col>
          <Col span={12}><Form.Item name="engineerName" label="Engineer"><Input placeholder="Engineer name" /></Form.Item></Col>
        </Row>
        <Form.Item name="cost" label="Estimated Cost (OMR)"><InputNumber style={{width:'100%'}} min={0} step={0.001} precision={3} /></Form.Item>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>Schedule</Button>
        </div>
      </Form>
    </Modal>
  );
}

// ── Transfer Modal ────────────────────────────────────────────
function TransferModal({ open, onClose, onSuccess, asset }: any) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/users', { params: { limit: 100 } }).then(r => setUsers(r.data.data || r.data || [])).catch(()=>{});
    if (asset) {
      form.setFieldsValue({ assetId: asset.assetId, fromDepartment: asset.department, fromLocation: asset.locationName, fromUserName: asset.assignedToName, transferDate: new Date().toISOString().slice(0,10) });
    }
  }, [asset, open]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await sApi.post('/sales/asset-transfers', values);
      message.success('Asset transferred!'); form.resetFields(); onSuccess();
    } catch { message.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`Transfer Asset: ${asset?.assetName || ''}`} open={open} onCancel={onClose} footer={null} width={580}>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
        <Form.Item name="assetId" hidden><Input /></Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <div style={{ background:'#fff2f0', borderRadius:8, padding:12, marginBottom:12 }}>
              <Text type="secondary" style={{ fontSize:11 }}>FROM</Text>
              <Form.Item name="fromDepartment" label="Department"><Input /></Form.Item>
              <Form.Item name="fromLocation" label="Location"><Input /></Form.Item>
              <Form.Item name="fromUserName" label="Current User"><Input /></Form.Item>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ background:'#f6ffed', borderRadius:8, padding:12, marginBottom:12 }}>
              <Text type="secondary" style={{ fontSize:11 }}>TO</Text>
              <Form.Item name="toDepartment" label="Department" rules={[{required:true}]}><Input placeholder="New department" /></Form.Item>
              <Form.Item name="toLocation" label="Location"><Input placeholder="New location" /></Form.Item>
              <Form.Item name="toUserName" label="New User">
                <Select showSearch optionFilterProp="children" allowClear placeholder="Select user..."
                  onChange={(v, opt:any) => form.setFieldsValue({ toUserId: v, toUserName: opt?.children })}>
                  {users.map(u => <Option key={u.userId} value={u.userId}>{u.fullName}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="toUserId" hidden><Input /></Form.Item>
            </div>
          </Col>
        </Row>
        <Form.Item name="transferDate" label="Transfer Date"><Input type="date" /></Form.Item>
        <Form.Item name="reason" label="Reason"><TextArea rows={2} /></Form.Item>
        <Form.Item name="approvedBy" label="Approved By"><Input /></Form.Item>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>Transfer</Button>
        </div>
      </Form>
    </Modal>
  );
}

// ── Depreciation Modal ────────────────────────────────────────
function DepreciationModal({ open, onClose, onSuccess }: any) {
  const [form] = Form.useForm();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRun = async (values: any) => {
    setRunning(true);
    try {
      const r = await sApi.post('/sales/assets/depreciation/bulk', { year: values.year, month: values.month });
      setResults(r.data);
      message.success(`Depreciation run complete — ${r.data.processed} assets processed`);
      onSuccess();
    } catch { message.error('Failed'); }
    finally { setRunning(false); }
  };

  return (
    <Modal title="Run Monthly Depreciation" open={open} onCancel={() => { setResults(null); onClose(); }} footer={null} width={560}>
      <Form form={form} layout="vertical" onFinish={handleRun} style={{ marginTop: 12 }}
        initialValues={{ year: new Date().getFullYear(), month: new Date().getMonth() + 1 }}>
        <Alert type="info" showIcon message="This will calculate and post depreciation journal entries for ALL active assets for the selected period." style={{ marginBottom: 16 }} />
        <Row gutter={12}>
          <Col span={12}><Form.Item name="year" label="Year" rules={[{required:true}]}><InputNumber style={{width:'100%'}} min={2020} max={2030} /></Form.Item></Col>
          <Col span={12}><Form.Item name="month" label="Month" rules={[{required:true}]}>
            <Select>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i)=><Option key={i+1} value={i+1}>{m}</Option>)}</Select>
          </Form.Item></Col>
        </Row>
        {!results && <Button type="primary" htmlType="submit" loading={running} block size="large" icon={<DollarOutlined />}>Run Depreciation</Button>}
        {results && (
          <div>
            <div style={{ background:'#f6ffed', borderRadius:8, padding:12, marginBottom:12 }}>
              <Text strong style={{ color:'#52c41a' }}>✅ Processed {results.processed} assets</Text>
            </div>
            <Table size="small" dataSource={results.results} rowKey="assetId" pagination={false}
              columns={[
                { title:'Asset', dataIndex:'assetName' },
                { title:'Status', dataIndex:'status', render:(v:string)=><Tag color={v==='success'?'green':'red'}>{v}</Tag> },
                { title:'Amount', dataIndex:'amount', align:'right' as const, render:(v:number)=>v?`OMR ${Number(v).toFixed(3)}`:'—' },
              ]} />
          </div>
        )}
      </Form>
    </Modal>
  );
}

// ── Asset Map ─────────────────────────────────────────────────
function AssetMap({ assets }: any) {
  const withLoc = assets.filter((a:any) => a.locationLat && a.locationLng);
  const [selected, setSelected] = useState<any>(null);
  if (withLoc.length === 0) return <div style={{ textAlign:'center', padding:40, color:'#8c8c8c' }}>No assets with GPS coordinates. Add location when creating assets.</div>;
  const center = withLoc[0];
  return (
    <Row gutter={12}>
      <Col span={16}>
        <iframe title="Asset Map" style={{ width:'100%', height:450, border:'none', borderRadius:12 }}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(center.locationLng)-0.2},${Number(center.locationLat)-0.2},${Number(center.locationLng)+0.2},${Number(center.locationLat)+0.2}&layer=mapnik&marker=${center.locationLat},${center.locationLng}`}
        />
      </Col>
      <Col span={8}>
        <div style={{ maxHeight:450, overflow:'auto' }}>
          {withLoc.map((a:any) => (
            <div key={a.assetId} onClick={() => setSelected(a)} style={{ padding:'10px 12px', marginBottom:8, borderRadius:10, cursor:'pointer', background: selected?.assetId===a.assetId?'#e6f7ff':'#fafafa', border:`1px solid ${selected?.assetId===a.assetId?'#1890ff':'#f0f0f0'}` }}>
              <Text strong style={{ fontSize:13 }}>{a.assetName}</Text>
              <Tag color={STATUS_COLOR[a.status]||'default'} style={{ marginLeft:6, fontSize:10 }}>{a.status}</Tag>
              <div style={{ fontSize:11, color:'#8c8c8c' }}>{a.department} — {a.locationName}</div>
              <Button type="link" size="small" style={{ padding:0, fontSize:11 }} onClick={e=>{ e.stopPropagation(); window.open(`https://www.google.com/maps?q=${a.locationLat},${a.locationLng}`,'_blank'); }}>Open in Google Maps →</Button>
            </div>
          ))}
        </div>
      </Col>
    </Row>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function FixedAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [deprModalOpen, setDeprModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [transferAsset, setTransferAsset] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [assetsR, statsR, maintR] = await Promise.allSettled([
        sApi.get('/sales/assets', { params: { page, limit: 20, search: search||undefined, status: statusFilter||undefined } }),
        sApi.get('/sales/assets/stats'),
        sApi.get('/sales/maintenance', { params: { status: 'SCHEDULED' } }),
      ]);
      if (assetsR.status === 'fulfilled') { setAssets(assetsR.value.data.data || []); setTotal(assetsR.value.data.total || 0); }
      if (statsR.status === 'fulfilled') setStats(statsR.value.data);
      if (maintR.status === 'fulfilled') setMaintenance(maintR.value.data || []);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/users', { params: { limit: 100 } }).then(r => setUsers(r.data.data || r.data || [])).catch(()=>{});
  }, []);

  const handleDelete = async (id: string) => {
    await sApi.delete(`/sales/assets/${id}`);
    message.success('Asset deleted'); load();
  };

  const columns = [
    { title:'Code', dataIndex:'assetCode', width:90, render:(v:string)=><Tag>{v}</Tag> },
    { title:'Asset Name', dataIndex:'assetName', render:(v:string, r:any) => (
      <Space direction="vertical" size={0}>
        <Text strong>{v}</Text>
        <Text type="secondary" style={{fontSize:11}}>{r.category}{r.brand?` — ${r.brand}`:''}</Text>
      </Space>
    )},
    { title:'Status', dataIndex:'status', width:100, render:(v:string) => <Tag color={STATUS_COLOR[v]||'default'}>{v?.replace('_',' ')}</Tag> },
    { title:'Condition', dataIndex:'condition', width:90, render:(v:string) => <Tag color={CONDITION_COLOR[v]||'default'}>{v}</Tag> },
    { title:'Purchase Cost', dataIndex:'purchaseCost', align:'right' as const, render:(v:number)=><Text>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Book Value', dataIndex:'currentBookValue', align:'right' as const, render:(v:number)=><Text strong style={{color:'#1890ff'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title:'Depreciated', align:'center' as const, render:(_:any, r:any) => {
      const cost = Number(r.purchaseCost||0);
      const pct = cost > 0 ? Math.round((Number(r.accumulatedDepreciation||0)/cost)*100) : 0;
      return <Progress percent={pct} size="small" style={{width:80,margin:0}} strokeColor={pct>80?'#ff4d4f':pct>50?'#fa8c16':'#52c41a'} />;
    }},
    { title:'Department', dataIndex:'department', render:(v:string)=>v||'—' },
    { title:'Location', dataIndex:'locationName', render:(v:string, r:any) => (
      <Space>
        {v||'—'}
        {r.locationLat && <Button type="link" size="small" icon={<EnvironmentOutlined />} onClick={() => window.open(`https://www.google.com/maps?q=${r.locationLat},${r.locationLng}`,'_blank')} style={{padding:0}} />}
      </Space>
    )},
    { title:'', width:150, render:(_:any, r:any) => (
      <Space size={4}>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditRecord(r); setModalOpen(true); }} />
        <Button size="small" icon={<SwapOutlined />} onClick={() => { setTransferAsset(r); setTransferModalOpen(true); }} title="Transfer" />
        <Button size="small" icon={<ToolOutlined />} onClick={() => { setMaintModalOpen(true); }} title="Maintenance" />
        <Popconfirm title="Delete asset?" onConfirm={()=>handleDelete(r.assetId)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  const maintColumns = [
    { title:'Asset', dataIndex:'assetName', render:(v:string)=><Text strong>{v}</Text> },
    { title:'Type', dataIndex:'maintenanceType', render:(v:string)=><Tag color={v==='PREVENTIVE'?'blue':'orange'}>{v}</Tag> },
    { title:'Title', dataIndex:'title' },
    { title:'Scheduled', dataIndex:'scheduledDate', render:(v:string)=>v?dayjs(v).format('DD/MM/YYYY'):'—' },
    { title:'Priority', dataIndex:'priority', render:(v:string)=><Tag color={PRIORITY_COLOR[v]||'default'}>{v}</Tag> },
    { title:'Technician', dataIndex:'technicianName', render:(v:string)=>v||'—' },
    { title:'Status', dataIndex:'status', render:(v:string)=><Tag color={v==='COMPLETED'?'green':v==='IN_PROGRESS'?'blue':'orange'}>{v}</Tag> },
    { title:'', render:(_:any, r:any) => (
      <Button size="small" type="primary" style={{background:'#52c41a'}} onClick={async() => {
        await sApi.put(`/sales/maintenance/${r.maintenanceId}`, { status:'COMPLETED', completedDate: new Date().toISOString().slice(0,10) });
        message.success('Marked complete!'); load();
      }}>Complete</Button>
    )},
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <Title level={4} style={{ margin:0 }}>Fixed Asset Management</Title>
          <Text type="secondary">Track, depreciate and maintain company assets</Text>
        </div>
        <Space>
          <Button icon={<DollarOutlined />} onClick={() => setDeprModalOpen(true)}>Run Depreciation</Button>
          <Button icon={<ToolOutlined />} onClick={() => setMaintModalOpen(true)}>Schedule Maintenance</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); setModalOpen(true); }}>Add Asset</Button>
        </Space>
      </div>

      {/* KPI Stats */}
      <Row gutter={12} style={{ marginBottom:16 }}>
        <Col span={4}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #1890ff', textAlign:'center' }}><Statistic title="Total Assets" value={stats.totalAssets||0} valueStyle={{color:'#1890ff',fontSize:20}} /></Card></Col>
        <Col span={5}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #722ed1', textAlign:'center' }}><Statistic title="Total Cost" prefix="OMR " value={Number(stats.totalCost||0).toFixed(3)} valueStyle={{color:'#722ed1',fontSize:18}} /></Card></Col>
        <Col span={5}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #52c41a', textAlign:'center' }}><Statistic title="Book Value" prefix="OMR " value={Number(stats.totalBookValue||0).toFixed(3)} valueStyle={{color:'#52c41a',fontSize:18}} /></Card></Col>
        <Col span={5}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #fa8c16', textAlign:'center' }}><Statistic title="Total Depreciation" prefix="OMR " value={Number(stats.totalAccumDepr||0).toFixed(3)} valueStyle={{color:'#fa8c16',fontSize:18}} /></Card></Col>
        <Col span={2}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #ff4d4f', textAlign:'center' }}><Statistic title="Maintenance Due" value={stats.dueForMaintenance||0} valueStyle={{color:'#ff4d4f',fontSize:20}} /></Card></Col>
        <Col span={3}><Card size="small" style={{ borderRadius:12, borderTop:'3px solid #f5222d', textAlign:'center' }}><Statistic title="Warranty Expired" value={stats.expiredWarranty||0} valueStyle={{color:'#f5222d',fontSize:20}} /></Card></Col>
      </Row>

      {/* Alerts */}
      {(stats.dueForMaintenance > 0) && (
        <Alert type="warning" showIcon icon={<WarningOutlined />} style={{ marginBottom:12, borderRadius:10 }}
          message={`${stats.dueForMaintenance} asset(s) scheduled for maintenance. Please review the Maintenance tab.`} />
      )}

      <Tabs defaultActiveKey="assets" items={[
        {
          key:'assets', label:'📋 Asset Register',
          children: (
            <Card style={{ borderRadius:12 }} size="small">
              <Row gutter={12} style={{ marginBottom:12 }}>
                <Col span={8}><Input.Search placeholder="Search assets..." value={search} onChange={e=>setSearch(e.target.value)} onSearch={()=>load()} /></Col>
                <Col span={4}>
                  <Select placeholder="Filter by status" style={{width:'100%'}} allowClear onChange={setStatusFilter}>
                    {Object.keys(STATUS_COLOR).map(s=><Option key={s} value={s}>{s.replace('_',' ')}</Option>)}
                  </Select>
                </Col>
              </Row>
              <Table dataSource={assets} columns={columns} rowKey="assetId" loading={loading} size="small"
                pagination={{ current:page, total, pageSize:20, onChange:setPage, showTotal:t=>`${t} assets` }} />
            </Card>
          )
        },
        {
          key:'maintenance', label:`🔧 Maintenance (${maintenance.length})`,
          children: (
            <Card style={{ borderRadius:12 }} size="small"
              extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={()=>setMaintModalOpen(true)}>Schedule</Button>}>
              <Table dataSource={maintenance} columns={maintColumns} rowKey="maintenanceId" size="small" pagination={{ pageSize:10 }} />
            </Card>
          )
        },
        {
          key:'map', label:'🗺️ Asset Map',
          children: <Card style={{ borderRadius:12 }} size="small"><AssetMap assets={assets} /></Card>
        },
        {
          key:'summary', label:'📊 Summary',
          children: (
            <Row gutter={12}>
              <Col span={12}>
                <Card title="Assets by Status" size="small" style={{ borderRadius:12, marginBottom:12 }}>
                  {Object.entries(stats.byStatus||{}).map(([status, count]:any) => (
                    <div key={status} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f5f5f5' }}>
                      <Tag color={STATUS_COLOR[status]||'default'}>{status.replace('_',' ')}</Tag>
                      <Text strong>{count}</Text>
                    </div>
                  ))}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Assets by Category" size="small" style={{ borderRadius:12 }}>
                  {Object.entries(stats.byCategory||{}).map(([cat, count]:any) => (
                    <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f5f5f5' }}>
                      <Text>{cat}</Text>
                      <Tag color="blue">{count}</Tag>
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>
          )
        },
      ]} />

      <AssetModal open={modalOpen} onClose={() => setModalOpen(false)} editRecord={editRecord}
        users={users} suppliers={[]}
        onSuccess={() => { setModalOpen(false); load(); }} />
      <MaintenanceModal open={maintModalOpen} onClose={() => setMaintModalOpen(false)} assets={assets} users={users}
        onSuccess={() => { setMaintModalOpen(false); load(); }} />
      <TransferModal open={transferModalOpen} onClose={() => setTransferModalOpen(false)} asset={transferAsset}
        onSuccess={() => { setTransferModalOpen(false); load(); }} />
      <DepreciationModal open={deprModalOpen} onClose={() => setDeprModalOpen(false)}
        onSuccess={() => { setDeprModalOpen(false); load(); }} />
    </div>
  );
}
