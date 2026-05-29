import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Select, Tag, Space, Modal, Form, Typography, Row, Col, Statistic, message, Popconfirm, Tooltip, InputNumber, Divider } from 'antd';
import { FilePdfOutlined, PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import PDFModal from '../../components/pdf/PDFModal';
import SupplierSelect from '../../components/common/SupplierSelect';
import { updateStatus, purchaseInvoicesApi, paymentVouchersApi, suppliersApi, productsApi, grnApi } from '../../services/salesApi';
import ProductSelect from '../../components/common/ProductSelect';
import api from '../../services/api';
const { Title, Text } = Typography;
const { Option } = Select;
const STATUS_COLORS: Record<string,string> = { DRAFT:'default', RECEIVED:'blue', PARTIALLY_PAID:'orange', PAID:'green', OVERDUE:'red', CANCELLED:'default' };
export default function PurchaseInvoicesPage() {
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
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [grns, setGrns] = useState<any[]>([]);
  const [filteredGrns, setFilteredGrns] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await purchaseInvoicesApi.getAll({ page, limit:20, search:search||undefined, status:statusFilter||undefined }); setItems(r.data.data||[]); setTotal(r.data.total||0); }
    catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    suppliersApi.getAll({ limit:100 }).then(r => setSuppliers(r.data.data||[])).catch(()=>{});
    productsApi.getAll({ limit:100 }).then(r => setProducts(r.data.data||[])).catch(()=>{});
    api.post('/masters/bulk-values', { categoryCodes: ['payment_methods'] }).then(r => setPaymentMethods(r.data.payment_methods||[])).catch(()=>{});
  }, []);
  const defaultLine = () => ({ description:'', quantity:1, unitPrice:0, discountPct:0, lineTotal:0, isTaxable:true, unitOfMeasure:'PCS' });
  useEffect(() => {
    grnApi.getAll({ limit: 200, excludeInvoiced: true }).then(r => setGrns(r.data.data || [])).catch(() => {});
  }, []);

  const handleSupplierSelect = (s: any) => {
    form.setFieldsValue({ supplierName: s.supplierName, supplierId: s.supplierId, supplierTrn: s.trn, grnId: undefined });
    // Filter GRNs by supplier from backend
    grnApi.getAll({ limit: 200, excludeInvoiced: true })
      .then(r => {
        const filtered = (r.data.data || []).filter((g:any) => g.supplierId === s.supplierId || g.supplierName === s.supplierName);
        setFilteredGrns(filtered);
        setGrns(r.data.data || []);
      }).catch(() => {});
  };

  const handleGRNSelect = async (grnId: string) => {
    try {
      const r = await grnApi.getOne(grnId);
      const grn = r.data;
      const grnItems = (grn.items || []).map((i: any) => ({
        description: i.description || i.productName,
        productId: i.productId,
        quantity: Number(i.quantityReceived || i.quantity || 1),
        unitPrice: Number(i.unitPrice || 0),
        unitOfMeasure: i.unitOfMeasure || 'PCS',
        discountPct: 0,
        lineTotal: Number(i.quantityReceived || i.quantity || 1) * Number(i.unitPrice || 0),
        isTaxable: true,
      }));
      setLineItems(grnItems.length > 0 ? grnItems : [defaultLine()]);
      calcTotals(grnItems, Number(form.getFieldValue('vatRate') || 5));
      form.setFieldsValue({ grnId, supplierName: grn.supplierName, supplierId: grn.supplierId, invoiceNumber: undefined });
    } catch {}
  };

  const openCreate = () => {
    setEditRecord(null); form.resetFields(); setFilteredGrns([]);
    form.setFieldsValue({ status:'DRAFT', currencyCode:'OMR', vatRate:5, invoiceDate: new Date().toISOString().slice(0,10) });
    setLineItems([defaultLine()]);
    grnApi.getAll({ limit: 200, excludeInvoiced: true }).then(r => setGrns(r.data.data || [])).catch(() => {});
    setModalOpen(true);
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
    if (field === 'productId') { const p = products.find(p => p.productId === value); if (p) { updated[idx].description = p.productName; updated[idx].unitPrice = Number(p.costPrice||p.unitPrice); updated[idx].unitOfMeasure = p.unitOfMeasure; updated[idx].itemCode = p.productCode; } }
    const qty = Number(updated[idx].quantity||1); const price = Number(updated[idx].unitPrice||0); const disc = Number(updated[idx].discountPct||0);
    updated[idx].discountAmount = (qty * price * disc) / 100;
    updated[idx].lineTotal = qty * price - updated[idx].discountAmount;
    setLineItems(updated); calcTotals(updated, Number(form.getFieldValue('vatRate')||5));
  };
  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const subtotal = lineItems.reduce((s, l) => s + Number(l.lineTotal || 0), 0);
      const vatRate = Number(values.vatRate || 5);
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount;
      // Strip auto-generated fields to prevent duplicate key errors
      const { invoiceNumber, grnNumber, poNumber, ...cleanValues } = values;
      const payload = { ...cleanValues, items: lineItems, subtotal, vatAmount, totalAmount };
      if (editRecord) await purchaseInvoicesApi.update(editRecord.invoiceId, payload);
      else await purchaseInvoicesApi.create(payload);
      message.success('Saved'); setModalOpen(false); load();
    } catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };
  const openPayment = (inv: any) => {
    setSelectedInvoice(inv);
    paymentForm.setFieldsValue({ invoiceId: inv.invoiceId, supplierName: inv.supplierName, amount: Number(inv.balanceDue), voucherDate: new Date().toISOString().slice(0,10), currencyCode: inv.currencyCode||'OMR', paymentMethod:'BANK_TRANSFER', status:'CONFIRMED' });
    setPaymentModalOpen(true);
  };
  const handlePayment = async (values: any) => {
    try { await paymentVouchersApi.create(values); message.success('Payment recorded!'); setPaymentModalOpen(false); load(); }
    catch (e: any) { message.error(e.response?.data?.message || 'Failed'); }
  };
  const totalInvoiced = items.reduce((s,i) => s + Number(i.totalAmount||0), 0);
  const totalPaid = items.reduce((s,i) => s + Number(i.paidAmount||0), 0);
  const totalBalance = items.reduce((s,i) => s + Number(i.balanceDue||0), 0);
  const columns = [
    { title: 'Invoice #', dataIndex: 'invoiceNumber', render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: 'Supplier Inv#', dataIndex: 'supplierInvoiceNo', render: (v: string) => v || '—' },
    { title: 'Date', dataIndex: 'invoiceDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
    { title: 'Supplier', dataIndex: 'supplierName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Total', dataIndex: 'totalAmount', render: (v: number) => <Text strong>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Paid', dataIndex: 'paidAmount', render: (v: number) => <Text style={{color:'#52c41a'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Balance', dataIndex: 'balanceDue', render: (v: number) => <Text strong style={{color: Number(v)>0?'#ff4d4f':'#52c41a'}}>OMR {Number(v).toFixed(3)}</Text> },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v?.replace('_',' ')}</Tag> },
    { title: '', key: 'actions', render: (_: any, r: any) => (
      <Space>
        {r.status === 'DRAFT' && <Tooltip title="Mark as Received"><Button size="small" type="primary" style={{background:'#722ed1'}} onClick={async () => { await updateStatus.purchaseInvoice(r.invoiceId, 'RECEIVED'); load(); message.success('Marked as Received!'); }}>Receive</Button></Tooltip>}
        <Tooltip title="View PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={async () => { try { const d = await purchaseInvoicesApi.getOne(r.invoiceId); setPdfData(d.data); setPdfOpen(true); } catch {} }} /></Tooltip>
        <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={async () => { setEditRecord(r); try { const d = await purchaseInvoicesApi.getOne(r.invoiceId); form.setFieldsValue({...d.data, invoiceDate: d.data.invoiceDate?.slice(0,10), dueDate: d.data.dueDate?.slice(0,10)}); setLineItems(d.data.items||[defaultLine()]); } catch {} setModalOpen(true); }} /></Tooltip>
        {['RECEIVED','PARTIALLY_PAID','OVERDUE'].includes(r.status) && <Tooltip title="Record Payment"><Button size="small" type="primary" icon={<DollarOutlined />} onClick={() => openPayment(r)} style={{background:'#52c41a',borderColor:'#52c41a'}} /></Tooltip>}
        <Popconfirm title="Delete?" onConfirm={async () => { await purchaseInvoicesApi.delete(r.invoiceId); load(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
        <div><Title level={4} style={{margin:0}}>Purchase Invoices</Title><Text type="secondary">Manage supplier invoices and payments</Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{borderRadius:8}}>New Invoice</Button>
      </div>
      <Row gutter={16} style={{marginBottom:20}}>
        <Col span={8}><Card style={{borderRadius:12, borderLeft:'4px solid #722ed1'}}><Statistic title="Total Invoiced" value={`OMR ${totalInvoiced.toFixed(3)}`} /></Card></Col>
        <Col span={8}><Card style={{borderRadius:12, borderLeft:'4px solid #52c41a'}}><Statistic title="Total Paid" value={`OMR ${totalPaid.toFixed(3)}`} /></Card></Col>
        <Col span={8}><Card style={{borderRadius:12, borderLeft:'4px solid #ff4d4f'}}><Statistic title="Outstanding" value={`OMR ${totalBalance.toFixed(3)}`} /></Card></Col>
      </Row>
      <Card style={{borderRadius:12}}>
        <Space style={{marginBottom:16}}>
          <Input prefix={<SearchOutlined />} placeholder="Search invoices..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{width:260}} />
          <Select placeholder="Status" value={statusFilter||undefined} onChange={v => { setStatusFilter(v||''); setPage(1); }} allowClear style={{width:200}}>
            {Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}><Tag color={STATUS_COLORS[s]}>{s.replace('_',' ')}</Tag></Option>)}
          </Select>
        </Space>
        <Table dataSource={items} columns={columns} rowKey="invoiceId" loading={loading} size="middle" pagination={{ current:page, total, pageSize:20, onChange:setPage }} />
      </Card>
      <Modal title={editRecord ? 'Edit Purchase Invoice' : 'New Purchase Invoice'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={900} style={{top:20}}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{marginTop:12}}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="supplierName" label="Supplier" rules={[{required:true}]}>
                <SupplierSelect onSupplierSelect={handleSupplierSelect} />
              </Form.Item>
              <Form.Item name="supplierId" hidden><input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="grnId" label="Link to GRN (Optional)">
                <Select allowClear showSearch optionFilterProp="children" placeholder="Select GRN to auto-fill items..."
                  onChange={v => { if (v) handleGRNSelect(v); }}>
                  {(filteredGrns.length > 0 ? filteredGrns : grns).map((g: any) => (
                    <Option key={g.grnId} value={g.grnId}>
                      {g.grnNumber} — {g.supplierName} {Number(g.totalAmount) > 0 ? `— OMR ${Number(g.totalAmount).toFixed(3)}` : g.grnDate ? `— ${new Date(g.grnDate).toLocaleDateString()}` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="supplierInvoiceNo" label="Supplier Invoice Number"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="invoiceDate" label="Invoice Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}><Form.Item name="dueDate" label="Due Date"><Input type="date" /></Form.Item></Col>
            <Col span={6}><Form.Item name="vatRate" label="VAT Rate"><Select onChange={v => calcTotals(lineItems, Number(v))}><Option value={0}>No VAT</Option><Option value={5}>5%</Option></Select></Form.Item></Col>
            <Col span={6}><Form.Item name="status" label="Status"><Select>{Object.keys(STATUS_COLORS).map(s => <Option key={s} value={s}>{s.replace('_',' ')}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Divider>Line Items</Divider>
          <Row gutter={8} style={{marginBottom:8, fontWeight:600, color:'#8c8c8c', fontSize:12}}>
            <Col span={1}>#</Col><Col span={5}>Product</Col><Col span={5}>Description</Col><Col span={2}>UOM</Col><Col span={2}>Qty</Col><Col span={3}>Unit Price</Col><Col span={2}>Disc%</Col><Col span={3}>Total</Col><Col span={1}></Col>
          </Row>
          {lineItems.map((item, idx) => (
            <Row gutter={8} key={idx} style={{marginBottom:8}} align="middle">
              <Col span={1}><Text type="secondary">{idx+1}</Text></Col>
              <Col span={5}><ProductSelect value={item.productId} onProductSelect={p => { if(p) updateLine(idx,'productId',p.productId); }} /></Col>
              <Col span={5}><Input value={item.description} onChange={e => updateLine(idx,'description',e.target.value)} /></Col>
              <Col span={2}><Input value={item.unitOfMeasure} onChange={e => updateLine(idx,'unitOfMeasure',e.target.value)} /></Col>
              <Col span={2}><InputNumber style={{width:'100%'}} min={0} step={0.001} value={item.quantity} onChange={v => updateLine(idx,'quantity',v)} /></Col>
              <Col span={3}><InputNumber style={{width:'100%'}} min={0} step={0.001} value={item.unitPrice} onChange={v => updateLine(idx,'unitPrice',v)} /></Col>
              <Col span={2}><InputNumber style={{width:'100%'}} min={0} max={100} value={item.discountPct} onChange={v => updateLine(idx,'discountPct',v)} /></Col>
              <Col span={3}><Text strong style={{color:'#722ed1'}}>{Number(item.lineTotal).toFixed(3)}</Text></Col>
              <Col span={1}><Button size="small" danger onClick={() => { const u = lineItems.filter((_,i)=>i!==idx); setLineItems(u); calcTotals(u, Number(form.getFieldValue('vatRate')||5)); }}>×</Button></Col>
            </Row>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setLineItems([...lineItems, defaultLine()])} style={{marginBottom:16}}>Add Line Item</Button>
          <Row justify="end">
            <Col span={8}>
              <div style={{background:'#fafafa', padding:12, borderRadius:8}}>
                <Row justify="space-between" style={{marginBottom:4}}><Text>Subtotal:</Text><Text strong>OMR {Number(form.getFieldValue('subtotal')||0).toFixed(3)}</Text></Row>
                <Row justify="space-between" style={{marginBottom:4}}><Text>VAT:</Text><Text strong>OMR {Number(form.getFieldValue('vatAmount')||0).toFixed(3)}</Text></Row>
                <Divider style={{margin:'8px 0'}} />
                <Row justify="space-between"><Text strong style={{fontSize:15}}>Total:</Text><Text strong style={{fontSize:15, color:'#722ed1'}}>OMR {Number(form.getFieldValue('totalAmount')||0).toFixed(3)}</Text></Row>
              </div>
            </Col>
          </Row>
          <Form.Item name="notes" label="Notes" style={{marginTop:12}}><Input.TextArea rows={2} /></Form.Item>
          <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>{editRecord ? 'Save' : 'Create Invoice'}</Button>
          </div>
        </Form>
      </Modal>
      <Modal title="Record Payment" open={paymentModalOpen} onCancel={() => setPaymentModalOpen(false)} footer={null} width={480}>
        <Form form={paymentForm} layout="vertical" onFinish={handlePayment} style={{marginTop:12}}>
          {selectedInvoice && <div style={{background:'#f9f0ff', padding:12, borderRadius:8, marginBottom:16, border:'1px solid #d3adf7'}}><Text>Invoice: <strong>{selectedInvoice.invoiceNumber}</strong> · Balance: <strong style={{color:'#ff4d4f'}}>OMR {Number(selectedInvoice.balanceDue).toFixed(3)}</strong></Text></div>}
          <Form.Item name="invoiceId" hidden><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="supplierName" label="Supplier" rules={[{required:true}]}>
                <SupplierSelect onSupplierSelect={handleSupplierSelect} />
              </Form.Item>
              <Form.Item name="supplierId" hidden><input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="grnId" label="Link to GRN (Optional)">
                <Select allowClear showSearch optionFilterProp="children" placeholder="Select GRN to auto-fill items..."
                  onChange={v => { if (v) handleGRNSelect(v); }}>
                  {(filteredGrns.length > 0 ? filteredGrns : grns).map((g: any) => (
                    <Option key={g.grnId} value={g.grnId}>
                      {g.grnNumber} — {g.supplierName} {g.totalAmount ? `— OMR ${Number(g.totalAmount).toFixed(3)}` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="amount" label="Amount (OMR)" rules={[{required:true}]}><InputNumber style={{width:'100%'}} min={0} step={0.001} precision={3} /></Form.Item></Col>
            <Col span={12}><Form.Item name="voucherDate" label="Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Form.Item name="paymentMethod" label="Payment Method"><Select>{paymentMethods.length ? paymentMethods.map((m:any) => <Option key={m.valueCode} value={m.valueCode}>{m.valueLabel}</Option>) : <><Option value="CASH">Cash</Option><Option value="BANK_TRANSFER">Bank Transfer</Option><Option value="CHEQUE">Cheque</Option></>}</Select></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="paymentReference" label="Reference"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="bankName" label="Bank Name"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="chequeNumber" label="Cheque Number"><Input /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
          <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
            <Button onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{background:'#722ed1', borderColor:'#722ed1'}}>Record Payment</Button>
          </div>
        </Form>
      </Modal>
      <PDFModal open={pdfOpen} onClose={() => setPdfOpen(false)} docType="purchase-invoice" data={pdfData} />
    </div>
  );
}
