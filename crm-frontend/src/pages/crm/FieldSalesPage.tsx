import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Tag, Space, Modal, Form, Input, InputNumber, Select, Statistic, Table, Tabs, message, Empty, Drawer, List, Avatar, Badge } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined, LogoutOutlined, UserOutlined, PhoneOutlined, BarChartOutlined, CalendarOutlined, ClockCircleOutlined, ShoppingOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const STATUS_COLOR: Record<string,string> = { CHECKED_IN:'#1890ff', COMPLETED:'#52c41a', CANCELLED:'#ff4d4f' };
const PURPOSE_ICON: Record<string,string> = { SALES_CALL:'📞', FOLLOW_UP:'🔄', DEMO:'💻', COLLECTION:'💰', COMPLAINT:'⚠️', NEW_PROSPECT:'🌟', RELATIONSHIP:'🤝', ORDER_TAKING:'🛒' };

// Detect mobile
const isMobile = () => window.innerWidth < 768;

// ── GPS Button ────────────────────────────────────────────────
function GPSButton({ onCapture }: { onCapture: (loc: any) => void }) {
  const [locating, setLocating] = useState(false);
  const [captured, setCaptured] = useState(false);

  const getLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) { message.warning('GPS not supported on this device'); setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCaptured(true); setLocating(false);
        message.success('📍 Location captured!');
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json&accept-language=en`)
          .then(r => r.json()).then(d => onCapture({ ...loc, address: d.display_name || `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` }))
          .catch(() => onCapture({ ...loc, address: `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` }));
      },
      err => {
        setLocating(false);
        if (err.code === 1) message.error('Location permission denied. Please allow in browser settings.');
        else message.warning('Could not get GPS. Enter address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Button block size="large" icon={<EnvironmentOutlined />} onClick={getLocation} loading={locating}
      type={captured ? 'primary' : 'default'}
      style={{ height: 52, fontSize: 16, borderRadius: 12, background: captured ? '#52c41a' : undefined, borderColor: captured ? '#52c41a' : undefined }}>
      {captured ? '✅ Location Captured' : locating ? 'Getting Location...' : '📍 Capture My Location'}
    </Button>
  );
}

// ── Check-in Drawer (mobile-first) ────────────────────────────
function CheckInDrawer({ open, onClose, onSuccess, accounts, products }: any) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderLines, setOrderLines] = useState<any[]>([{ description:'', quantity:1, unitPrice:0, lineTotal:0 }]);
  const mobile = isMobile();

  const updateOrderLineProduct = (idx: number, productId: string, productName: string, unitPrice: number) => {
    const updated = [...orderLines];
    updated[idx] = { ...updated[idx], productId, description: productName, unitPrice, lineTotal: Number(updated[idx].quantity||1) * unitPrice };
    setOrderLines([...updated]);
  };

  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...orderLines];
    updated[idx] = { ...updated[idx], [field]: value };
    updated[idx].lineTotal = Number(updated[idx].quantity||1) * Number(updated[idx].unitPrice||0);
    setOrderLines([...updated]);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const visit = await api.post('/visits', values);
      message.success('✅ Checked in!');
      if (values.purpose === 'ORDER_TAKING' && orderLines.some(l => l.lineTotal > 0)) {
        const acc = accounts.find((a:any) => a.accountId === values.accountId);
        const subtotal = orderLines.reduce((s,l) => s+Number(l.lineTotal||0), 0);
        const vatAmount = subtotal * 0.05;
        const sApi2 = (await import('axios')).default.create({ baseURL: '/sales-api' });
        sApi2.interceptors.request.use((c:any) => { const t = localStorage.getItem('accessToken'); if(t) c.headers.Authorization=`Bearer ${t}`; return c; });
        await sApi2.post('/sales/quotations', {
          customerName: acc?.accountName || values.accountName,
          accountId: values.accountId,
          quotationDate: new Date().toISOString().slice(0,10),
          status: 'DRAFT', vatRate: 5, subtotal, vatAmount, totalAmount: subtotal + vatAmount,
          items: orderLines.filter(l => l.lineTotal > 0).map((l, i) => ({
            lineNumber: i+1, productId: l.productId, description: l.description,
            quantity: Number(l.quantity||1), unitPrice: Number(l.unitPrice||0),
            lineTotal: Number(l.lineTotal||0), unitOfMeasure: 'PCS', isTaxable: true,
          })),
          notes: `Field Order - Visit: ${visit.data?.visitId}`,
        });
        message.success('📋 Order/Quotation created!');
      }
      form.resetFields();
      setOrderLines([{ description:'', quantity:1, unitPrice:0, lineTotal:0 }]);
      setShowOrderForm(false);
      onSuccess();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const orderTotal = orderLines.reduce((s,l) => s+Number(l.lineTotal||0), 0);

  return (
    <Drawer title={<Space><EnvironmentOutlined style={{ color: '#1890ff' }} /><span>Customer Visit Check-In</span></Space>}
      open={open} onClose={onClose} placement="bottom"
      height={mobile ? '95vh' : 600} style={{ borderRadius: '20px 20px 0 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ paddingBottom: 80 }}>

        {/* Customer */}
        <Form.Item name="accountId" label={<Text strong style={{ fontSize: 15 }}>👤 Customer</Text>} rules={[{required:true}]}>
          <Select showSearch optionFilterProp="children" placeholder="Select customer..." size="large"
            style={{ borderRadius: 10 }}
            onChange={v => { const acc = accounts.find((a:any) => a.accountId === v); if(acc) form.setFieldsValue({ accountName: acc.accountName }); }}>
            {accounts.map((a:any) => <Option key={a.accountId} value={a.accountId}>{a.accountName}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="accountName" hidden><Input /></Form.Item>

        {/* Purpose */}
        <Form.Item name="purpose" label={<Text strong style={{ fontSize: 15 }}>🎯 Visit Purpose</Text>} rules={[{required:true}]}>
          <Select placeholder="What's the purpose?" size="large"
            onChange={v => setShowOrderForm(v === 'ORDER_TAKING')}>
            {[
              ['SALES_CALL','📞 Sales Call'], ['FOLLOW_UP','🔄 Follow Up'], ['DEMO','💻 Product Demo'],
              ['COLLECTION','💰 Payment Collection'], ['COMPLAINT','⚠️ Complaint'], ['NEW_PROSPECT','🌟 New Prospect'],
              ['RELATIONSHIP','🤝 Relationship Building'], ['ORDER_TAKING','🛒 Order Taking'],
            ].map(([v, l]) => <Option key={v} value={v}>{l}</Option>)}
          </Select>
        </Form.Item>

        {/* GPS */}
        <Form.Item label={<Text strong style={{ fontSize: 15 }}>📍 Location</Text>}>
          <GPSButton onCapture={loc => form.setFieldsValue({ checkInLat: loc.lat, checkInLng: loc.lng, checkInAddress: loc.address })} />
        </Form.Item>
        <Form.Item name="checkInLat" hidden><Input /></Form.Item>
        <Form.Item name="checkInLng" hidden><Input /></Form.Item>
        <Form.Item name="checkInAddress">
          <Input placeholder="Address (auto-filled from GPS or enter manually)" size="large" />
        </Form.Item>

        {/* Notes */}
        <Form.Item name="notes" label={<Text strong style={{ fontSize: 15 }}>📝 Notes</Text>}>
          <TextArea rows={3} placeholder="Visit purpose, key points..." style={{ borderRadius: 10, fontSize: 15 }} />
        </Form.Item>

        {/* Order Form */}
        {showOrderForm && (
          <div style={{ background: '#f6ffed', border: '2px solid #b7eb8f', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text strong style={{ color: '#52c41a', fontSize: 16, display: 'block', marginBottom: 12 }}>🛒 Order Items</Text>
            {orderLines.map((line, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <Select showSearch style={{ width: '100%', marginBottom: 8 }} size="large"
                  placeholder="Select product..." optionFilterProp="children"
                  value={line.productId || undefined}
                  onChange={(v, opt:any) => updateOrderLineProduct(idx, v as string, opt.label as string, Number(opt.price)||0)}>
                  {products.map((p:any) => (
                    <Option key={p.productId} value={p.productId} label={p.productName} price={p.unitPrice}>
                      {p.productName} — OMR {Number(p.unitPrice).toFixed(3)}
                    </Option>
                  ))}
                </Select>
                {line.description && <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>{line.description}</Text>}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Qty</Text>
                    <InputNumber style={{ width: '100%' }} size="large" min={1} value={line.quantity} onChange={v => updateLine(idx,'quantity',v)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Unit Price</Text>
                    <InputNumber style={{ width: '100%' }} size="large" min={0} step={0.001} value={line.unitPrice} onChange={v => updateLine(idx,'unitPrice',v)} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Total</Text>
                    <div><Text strong style={{ color: '#52c41a', fontSize: 16 }}>OMR {Number(line.lineTotal||0).toFixed(3)}</Text></div>
                  </div>
                  <Button danger size="small" onClick={() => setOrderLines(orderLines.filter((_,i)=>i!==idx))} style={{ marginTop: 16 }}>✕</Button>
                </div>
              </div>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} size="large" style={{ borderRadius: 12, marginBottom: 12 }}
              onClick={() => setOrderLines([...orderLines,{ description:'', quantity:1, unitPrice:0, lineTotal:0 }])}>
              Add Item
            </Button>
            <div style={{ textAlign: 'right', padding: '8px 0' }}>
              <Text strong style={{ fontSize: 18, color: '#52c41a' }}>Total: OMR {orderTotal.toFixed(3)}</Text>
            </div>
          </div>
        )}

        {/* Fixed bottom bar */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', boxShadow: '0 -2px 12px rgba(0,0,0,0.1)', display: 'flex', gap: 12 }}>
          <Button size="large" block onClick={onClose} style={{ borderRadius: 12 }}>Cancel</Button>
          <Button type="primary" size="large" block loading={saving}
            style={{ borderRadius: 12, height: 48, fontSize: 16 }}
            onClick={() => form.submit()}>
            {showOrderForm ? '🛒 Check In & Create Order' : '📍 Check In'}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}

// ── Check-out Drawer ──────────────────────────────────────────
function CheckOutDrawer({ open, onClose, visit, onSuccess }: any) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const mobile = isMobile();

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await api.patch(`/visits/${visit.visitId}/checkout`, values);
      message.success('✅ Visit completed!');
      form.resetFields(); onSuccess();
    } catch { message.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Drawer title={<Space><LogoutOutlined style={{ color: '#52c41a' }} /><span>Check Out — {visit?.accountName}</span></Space>}
      open={open} onClose={onClose} placement="bottom"
      height={mobile ? '80vh' : 500} style={{ borderRadius: '20px 20px 0 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ paddingBottom: 80 }}>
        <Form.Item name="outcome" label={<Text strong style={{ fontSize: 15 }}>📊 Visit Outcome</Text>} rules={[{required:true}]}>
          <Select placeholder="How did it go?" size="large">
            {[
              ['POSITIVE','✅ Positive — Will proceed'], ['QUOTATION_REQUESTED','📋 Quotation Requested'],
              ['ORDER_PLACED','🛒 Order Placed'], ['PAYMENT_COLLECTED','💰 Payment Collected'],
              ['FOLLOW_UP_NEEDED','🔄 Follow Up Needed'], ['NOT_INTERESTED','❌ Not Interested'],
              ['POSTPONED','⏸️ Postponed'],
            ].map(([v,l]) => <Option key={v} value={v}>{l}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="notes" label={<Text strong style={{ fontSize: 15 }}>📝 Visit Summary</Text>}>
          <TextArea rows={4} placeholder="What was discussed? Key decisions made..." style={{ fontSize: 15, borderRadius: 10 }} />
        </Form.Item>
        <Form.Item name="nextAction" label={<Text strong style={{ fontSize: 15 }}>⏭️ Next Action</Text>}>
          <Input size="large" placeholder="e.g. Send quotation by Thursday..." style={{ borderRadius: 10 }} />
        </Form.Item>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', boxShadow: '0 -2px 12px rgba(0,0,0,0.1)', display: 'flex', gap: 12 }}>
          <Button size="large" block onClick={onClose} style={{ borderRadius: 12 }}>Cancel</Button>
          <Button type="primary" size="large" block htmlType="submit" loading={saving}
            style={{ borderRadius: 12, height: 48, fontSize: 16, background: '#52c41a', borderColor: '#52c41a' }}>
            ✅ Complete Visit
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}

// ── Visit Card (mobile) ───────────────────────────────────────
function VisitCard({ visit, onCheckout, currentUserId }: any) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${STATUS_COLOR[visit.status] || '#ddd'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <Text strong style={{ fontSize: 16 }}>{visit.accountName}</Text>
          <Tag color={STATUS_COLOR[visit.status]} style={{ marginLeft: 8 }}>{visit.status?.replace('_',' ')}</Tag>
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {visit.visitDate ? new Date(visit.visitDate).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : ''}
        </Text>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <Tag>{PURPOSE_ICON[visit.purpose] || '📋'} {visit.purpose?.replace('_',' ')}</Tag>
        {visit.durationMinutes && <Tag color="orange"><ClockCircleOutlined /> {visit.durationMinutes} mins</Tag>}
        {visit.outcome && <Tag color={visit.outcome === 'ORDER_PLACED' ? 'green' : 'blue'}>{visit.outcome?.replace('_',' ')}</Tag>}
      </div>
      {visit.checkInAddress && <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>📍 {visit.checkInAddress?.slice(0,60)}...</Text>}
      {visit.salesmanName && <Text type="secondary" style={{ fontSize: 12 }}><UserOutlined /> {visit.salesmanName}</Text>}
      {visit.status === 'CHECKED_IN' && visit.salesmanId === currentUserId && (
        <Button type="primary" block size="large" icon={<LogoutOutlined />} onClick={() => onCheckout(visit)}
          style={{ marginTop: 10, borderRadius: 10, background: '#52c41a', borderColor: '#52c41a' }}>
          Check Out
        </Button>
      )}
    </div>
  );
}

// ── Customer Map ──────────────────────────────────────────────
function CustomerMapView({ accounts }: any) {
  const withLoc = accounts.filter((a:any) => a.locationLat && a.locationLng);
  const [selected, setSelected] = useState<any>(null);
  const mobile = isMobile();

  if (withLoc.length === 0) return (
    <Empty description="No customers with GPS coordinates. Add location in customer profile." style={{ padding: 40 }} />
  );
  const center = withLoc[0];

  return (
    <div>
      <iframe title="Customer Map" style={{ width:'100%', height: mobile ? 300 : 450, border:'none', borderRadius:12 }}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(center.locationLng)-0.3},${Number(center.locationLat)-0.3},${Number(center.locationLng)+0.3},${Number(center.locationLat)+0.3}&layer=mapnik&marker=${center.locationLat},${center.locationLng}`}
      />
      <div style={{ marginTop: 12 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>📍 {withLoc.length} customers with GPS</Text>
        <div style={{ maxHeight: 300, overflow: 'auto' }}>
          {withLoc.map((acc:any) => (
            <div key={acc.accountId} onClick={() => setSelected(acc)}
              style={{ padding: '10px 14px', marginBottom: 8, borderRadius: 12, cursor: 'pointer',
                background: selected?.accountId === acc.accountId ? '#e6f7ff' : '#fafafa',
                border: `1px solid ${selected?.accountId === acc.accountId ? '#1890ff' : '#f0f0f0'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>{acc.accountName}</Text>
                <Button type="link" size="small" style={{ padding: 0 }}
                  onClick={e => { e.stopPropagation(); window.open(`https://www.google.com/maps?q=${acc.locationLat},${acc.locationLng}`,'_blank'); }}>
                  Maps →
                </Button>
              </div>
              {acc.phone && <div style={{ fontSize: 12, color: '#1890ff' }}><PhoneOutlined /> {acc.phone}</div>}
              {acc.salesmanName && <div style={{ fontSize: 12, color: '#2E6DA4' }}><UserOutlined /> {acc.salesmanName}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function FieldSalesPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [visits, setVisits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [accounts, setAccounts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeVisit, setActiveVisit] = useState<any>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkOutVisit, setCheckOutVisit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const mobile = isMobile();

  useEffect(() => {
    import('axios').then(({default: axios}) => {
      const sApi = axios.create({ baseURL: '/sales-api' });
      sApi.interceptors.request.use((c:any) => { const t = localStorage.getItem('accessToken'); if(t) c.headers.Authorization=`Bearer ${t}`; return c; });
      sApi.get('/sales/products', { params: { limit: 500 } }).then(r => setProducts(r.data.data || [])).catch(()=>{});
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vR, sR, aR] = await Promise.allSettled([
        api.get('/visits', { params: { limit: 100 } }),
        api.get('/visits/stats'),
        api.get('/accounts', { params: { limit: 500 } }),
      ]);
      if (vR.status === 'fulfilled') {
        const v = vR.value.data.data || [];
        setVisits(v);
        setActiveVisit(v.find((x:any) => x.status === 'CHECKED_IN' && x.salesmanId === user?.userId));
      }
      if (sR.status === 'fulfilled') setStats(sR.value.data);
      if (aR.status === 'fulfilled') setAccounts(aR.value.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const todayVisits = visits.filter(v => new Date(v.visitDate).toDateString() === new Date().toDateString());

  const visitCols = [
    { title: 'Time', dataIndex: 'visitDate', width: 90, render: (v:string) => v ? new Date(v).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '—' },
    { title: 'Customer', dataIndex: 'accountName', render: (v:string) => <Text strong>{v}</Text> },
    { title: 'Purpose', dataIndex: 'purpose', render: (v:string) => <Tag>{PURPOSE_ICON[v]||'📋'} {v?.replace('_',' ')}</Tag> },
    { title: 'Status', dataIndex: 'status', render: (v:string) => <Tag color={STATUS_COLOR[v]}>{v?.replace('_',' ')}</Tag> },
    { title: 'Duration', dataIndex: 'durationMinutes', render: (v:number) => v ? `${v}m` : '—' },
    { title: '', render: (_:any, r:any) => r.status === 'CHECKED_IN' && r.salesmanId === user?.userId && (
      <Button size="small" type="primary" style={{background:'#52c41a'}} onClick={() => { setCheckOutVisit(r); setCheckOutOpen(true); }}>Out</Button>
    )},
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Title level={mobile ? 5 : 4} style={{ margin: 0 }}>Field Sales</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>GPS check-ins, visits and order taking</Text>
      </div>

      {/* Active Visit Banner */}
      {activeVisit && (
        <div style={{ background: 'linear-gradient(135deg, #1890ff, #096dd9)', borderRadius: 16, padding: 16, marginBottom: 16, color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 2 }}>🔵 Active Visit</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{activeVisit.accountName}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                Started {new Date(activeVisit.visitDate).toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'})}
              </div>
            </div>
            <Button size="large" onClick={() => { setCheckOutVisit(activeVisit); setCheckOutOpen(true); }}
              style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff', borderRadius: 12, fontWeight: 600, height: 46 }}
              icon={<LogoutOutlined />}>Check Out</Button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: "Today's Visits", value: todayVisits.length, color: '#1890ff' },
          { label: 'Active Now', value: (stats.byStatus||[]).find((s:any)=>s.status==='CHECKED_IN')?.count||0, color: '#52c41a' },
          { label: 'Total Visits', value: stats.total||0, color: '#2E6DA4' },
          { label: 'With GPS', value: accounts.filter(a=>a.locationLat).length, color: '#fa8c16' },
        ].map((s,i) => (
          <Card key={i} size="small" style={{ borderRadius: 14, borderTop: `3px solid ${s.color}`, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultActiveKey="today" size={mobile ? 'small' : 'middle'} items={[
        {
          key: 'today', label: <><CalendarOutlined /> Today</>,
          children: (
            <div>
              {todayVisits.length === 0 ? (
                <Empty description="No visits today yet" style={{ padding: 30 }} />
              ) : mobile ? (
                todayVisits.map(v => (
                  <VisitCard key={v.visitId} visit={v} currentUserId={user?.userId}
                    onCheckout={(visit:any) => { setCheckOutVisit(visit); setCheckOutOpen(true); }} />
                ))
              ) : (
                <Table dataSource={todayVisits} columns={visitCols} rowKey="visitId" size="small" pagination={false} loading={loading} />
              )}
            </div>
          )
        },
        {
          key: 'all', label: '📋 All',
          children: mobile ? (
            <div>{visits.map(v => (
              <VisitCard key={v.visitId} visit={v} currentUserId={user?.userId}
                onCheckout={(visit:any) => { setCheckOutVisit(visit); setCheckOutOpen(true); }} />
            ))}</div>
          ) : (
            <Table dataSource={visits} columns={visitCols} rowKey="visitId" size="small" pagination={{ showSizeChanger: true, pageSizeOptions: ['10','20','50','100'], defaultPageSize: 10 }} loading={loading} />
          )
        },
        {
          key: 'map', label: <><EnvironmentOutlined /> Map</>,
          children: <CustomerMapView accounts={accounts} />
        },
        {
          key: 'stats', label: <><BarChartOutlined /> Stats</>,
          children: (
            <div>
              <Card title="Visits by Salesman" size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
                {(stats.bySalesman||[]).map((s:any,i:number) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f5f5f5' }}>
                    <Text><UserOutlined /> {s.name||'Unknown'}</Text>
                    <Tag color="blue">{s.count} visits</Tag>
                  </div>
                ))}
              </Card>
              <Card title="Visits by Status" size="small" style={{ borderRadius: 12 }}>
                {(stats.byStatus||[]).map((s:any,i:number) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f5f5f5' }}>
                    <Tag color={STATUS_COLOR[s.status]}>{s.status?.replace('_',' ')}</Tag>
                    <Tag>{s.count}</Tag>
                  </div>
                ))}
              </Card>
            </div>
          )
        },
      ]} />

      {/* Fixed Check-In Button (mobile) */}
      {mobile ? (
        <div style={{ position: 'fixed', bottom: 20, left: 16, right: 16, zIndex: 100 }}>
          <Button type="primary" block size="large" icon={<EnvironmentOutlined />}
            onClick={() => setCheckInOpen(true)} disabled={!!activeVisit}
            style={{ height: 56, borderRadius: 16, fontSize: 18, fontWeight: 700,
              background: activeVisit ? '#8c8c8c' : '#1890ff',
              boxShadow: '0 4px 20px rgba(24,144,255,0.4)' }}>
            {activeVisit ? '🔵 Visit In Progress' : '📍 Check In'}
          </Button>
        </div>
      ) : (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
          <Button type="primary" size="large" icon={<EnvironmentOutlined />}
            onClick={() => setCheckInOpen(true)} disabled={!!activeVisit}
            style={{ height: 52, borderRadius: 26, paddingLeft: 24, paddingRight: 24, fontSize: 16,
              background: activeVisit ? '#8c8c8c' : '#1890ff',
              boxShadow: '0 4px 20px rgba(24,144,255,0.35)' }}>
            {activeVisit ? '🔵 Visit In Progress' : '📍 Check In'}
          </Button>
        </div>
      )}

      <CheckInDrawer open={checkInOpen} onClose={() => setCheckInOpen(false)}
        accounts={accounts} products={products} onSuccess={() => { setCheckInOpen(false); load(); }} />
      <CheckOutDrawer open={checkOutOpen} onClose={() => setCheckOutOpen(false)}
        visit={checkOutVisit || activeVisit} onSuccess={() => { setCheckOutOpen(false); load(); }} />
    </div>
  );
}
