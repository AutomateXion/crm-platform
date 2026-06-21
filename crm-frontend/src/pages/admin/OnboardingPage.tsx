import React, { useState } from 'react';
import {
  Card, Button, Typography, Steps, Table, Input, InputNumber, DatePicker,
  Space, message, Tag, Alert, Result, Statistic, Row, Col, Divider, Select, Empty,
} from 'antd';
import {
  ShopOutlined, FileTextOutlined, ShoppingOutlined, BankOutlined,
  HomeOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined,
  RocketOutlined, SettingOutlined, ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import salesApi from '../../services/salesApi';

const { Title, Text, Paragraph } = Typography;

// helper: empty row generators
const blankStock = () => ({ key: Math.random(), productCode: '', quantity: undefined, unitCost: undefined });
const blankAR = () => ({ key: Math.random(), invoiceNumber: '', invoiceDate: '', dueDate: '', customerName: '', totalAmount: undefined, outstandingAmount: undefined });
const blankAP = () => ({ key: Math.random(), invoiceNumber: '', invoiceDate: '', dueDate: '', supplierName: '', totalAmount: undefined, outstandingAmount: undefined });
const blankAsset = () => ({ key: Math.random(), assetName: '', category: '', purchaseDate: '', cost: undefined, accumulatedDepreciation: undefined, usefulLifeYears: undefined });
const blankGL = () => ({ key: Math.random(), accountCode: '', description: '', debitAmount: undefined, creditAmount: undefined });

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [cutoffDate, setCutoffDate] = useState<string>(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
  const [busy, setBusy] = useState(false);

  // data per step
  const [stockRows, setStockRows] = useState<any[]>([blankStock()]);
  const [arRows, setArRows] = useState<any[]>([blankAR()]);
  const [apRows, setApRows] = useState<any[]>([blankAP()]);
  const [assetRows, setAssetRows] = useState<any[]>([blankAsset()]);
  const [glRows, setGlRows] = useState<any[]>([blankGL()]);

  // results per step
  const [results, setResults] = useState<Record<string, any>>({});

  // verification
  const [tb, setTb] = useState<any>(null);
  const [tbLoading, setTbLoading] = useState(false);

  const setRowField = (rows: any[], setRows: any, key: any, field: string, val: any) => {
    setRows(rows.map(r => r.key === key ? { ...r, [field]: val } : r));
  };
  const addRow = (rows: any[], setRows: any, gen: any) => setRows([...rows, gen()]);
  const delRow = (rows: any[], setRows: any, key: any) => setRows(rows.length > 1 ? rows.filter(r => r.key !== key) : rows);

  // ---- post handlers ----
  const postStock = async () => {
    const items = stockRows.filter(r => r.productCode && Number(r.quantity) > 0)
      .map(r => ({ productCode: r.productCode, quantity: Number(r.quantity), unitCost: Number(r.unitCost || 0) }));
    if (!items.length) { message.info('No stock rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/stock', { cutoffDate, items });
      setResults(r => ({ ...r, stock: data }));
      message.success(`Loaded ${data.itemsLoaded} stock item(s), value ${data.totalValue}`);
      return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'Stock load failed'); return false; }
    finally { setBusy(false); }
  };

  const postAR = async () => {
    const items = arRows.filter(r => r.invoiceNumber && Number(r.totalAmount) > 0)
      .map(r => ({ invoiceNumber: r.invoiceNumber, invoiceDate: r.invoiceDate || cutoffDate,
        dueDate: r.dueDate || r.invoiceDate || cutoffDate, customerName: r.customerName,
        totalAmount: Number(r.totalAmount), outstandingAmount: Number(r.outstandingAmount ?? r.totalAmount) }));
    if (!items.length) { message.info('No AR rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/ar', { cutoffDate, items });
      setResults(r => ({ ...r, ar: data }));
      message.success(`Loaded ${data.itemsLoaded} invoice(s), outstanding ${data.grandOutstanding}`);
      return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'AR load failed'); return false; }
    finally { setBusy(false); }
  };

  const postAP = async () => {
    const items = apRows.filter(r => r.invoiceNumber && Number(r.totalAmount) > 0)
      .map(r => ({ invoiceNumber: r.invoiceNumber, invoiceDate: r.invoiceDate || cutoffDate,
        dueDate: r.dueDate || r.invoiceDate || cutoffDate, supplierName: r.supplierName,
        totalAmount: Number(r.totalAmount), outstandingAmount: Number(r.outstandingAmount ?? r.totalAmount) }));
    if (!items.length) { message.info('No AP rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/ap', { cutoffDate, items });
      setResults(r => ({ ...r, ap: data }));
      message.success(`Loaded ${data.itemsLoaded} bill(s), outstanding ${data.grandOutstanding}`);
      return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'AP load failed'); return false; }
    finally { setBusy(false); }
  };

  const postAssets = async () => {
    const assets = assetRows.filter(r => r.assetName && Number(r.cost) > 0)
      .map(r => ({ assetName: r.assetName, category: r.category || 'General',
        purchaseDate: r.purchaseDate || cutoffDate, cost: Number(r.cost),
        accumulatedDepreciation: Number(r.accumulatedDepreciation || 0),
        usefulLifeYears: r.usefulLifeYears ? Number(r.usefulLifeYears) : undefined }));
    if (!assets.length) { message.info('No asset rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/assets', { cutoffDate, assets });
      setResults(r => ({ ...r, assets: data }));
      message.success(`Loaded ${data.assetsLoaded} asset(s), net book value ${data.netBookValue}`);
      return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'Asset load failed'); return false; }
    finally { setBusy(false); }
  };

  const postGL = async () => {
    const lines = glRows.filter(r => r.accountCode && (Number(r.debitAmount) > 0 || Number(r.creditAmount) > 0))
      .map(r => ({ accountCode: r.accountCode, description: r.description || 'Opening balance',
        debitAmount: Number(r.debitAmount || 0), creditAmount: Number(r.creditAmount || 0) }));
    if (!lines.length) { message.info('No GL rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/gl', { cutoffDate, lines });
      setResults(r => ({ ...r, gl: data }));
      message.success(`Posted GL opening journal ${data.voucherNumber}`);
      return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'GL load failed'); return false; }
    finally { setBusy(false); }
  };

  const loadTrialBalance = async () => {
    setTbLoading(true);
    try {
      const { data } = await salesApi.get('/sales/opening-balance/trial-balance');
      setTb(data);
    } catch (e: any) { message.error('Could not load trial balance'); }
    finally { setTbLoading(false); }
  };

  // step navigation: each "Next" posts the current step then advances
  const stepPost: Record<number, () => Promise<boolean>> = {
    1: postStock, 2: postAR, 3: postAP, 4: postAssets, 5: postGL,
  };

  const next = async () => {
    const fn = stepPost[current];
    if (fn) { const ok = await fn(); if (!ok) return; }
    if (current === 5) await loadTrialBalance();
    setCurrent(current + 1);
  };
  const skip = () => { if (current === 5) loadTrialBalance(); setCurrent(current + 1); };
  const prev = () => setCurrent(current - 1);

  // ---- column builders ----
  const actionCol = (rows: any[], setRows: any) => ({
    title: '', width: 44, render: (_: any, r: any) => (
      <Button size="small" danger type="text" icon={<DeleteOutlined />} onClick={() => delRow(rows, setRows, r.key)} />
    ),
  });
  const txt = (rows: any[], setRows: any, field: string, ph: string) => (_: any, r: any) =>
    <Input size="small" placeholder={ph} value={r[field]} onChange={e => setRowField(rows, setRows, r.key, field, e.target.value)} />;
  const datec = (rows: any[], setRows: any, field: string) => (_: any, r: any) =>
    <DatePicker size="small" style={{ width: '100%' }} value={r[field] ? dayjs(r[field]) : null}
      onChange={(d) => setRowField(rows, setRows, r.key, field, d ? d.format('YYYY-MM-DD') : '')} />;
  const numc = (rows: any[], setRows: any, field: string) => (_: any, r: any) =>
    <InputNumber size="small" style={{ width: '100%' }} min={0} value={r[field]}
      onChange={(v) => setRowField(rows, setRows, r.key, field, v)} />;

  const stockCols = [
    { title: 'Product Code', render: txt(stockRows, setStockRows, 'productCode', 'PROD-...') },
    { title: 'Quantity', width: 130, render: numc(stockRows, setStockRows, 'quantity') },
    { title: 'Unit Cost', width: 130, render: numc(stockRows, setStockRows, 'unitCost') },
    actionCol(stockRows, setStockRows),
  ];
  const arCols = [
    { title: 'Invoice #', render: txt(arRows, setArRows, 'invoiceNumber', 'INV-001') },
    { title: 'Date', width: 130, render: datec(arRows, setArRows, 'invoiceDate') },
    { title: 'Due', width: 130, render: datec(arRows, setArRows, 'dueDate') },
    { title: 'Customer', render: txt(arRows, setArRows, 'customerName', 'Customer name') },
    { title: 'Total', width: 120, render: numc(arRows, setArRows, 'totalAmount') },
    { title: 'Outstanding', width: 120, render: numc(arRows, setArRows, 'outstandingAmount') },
    actionCol(arRows, setArRows),
  ];
  const apCols = [
    { title: 'Bill #', render: txt(apRows, setApRows, 'invoiceNumber', 'BILL-001') },
    { title: 'Date', width: 130, render: datec(apRows, setApRows, 'invoiceDate') },
    { title: 'Due', width: 130, render: datec(apRows, setApRows, 'dueDate') },
    { title: 'Supplier', render: txt(apRows, setApRows, 'supplierName', 'Supplier name') },
    { title: 'Total', width: 120, render: numc(apRows, setApRows, 'totalAmount') },
    { title: 'Outstanding', width: 120, render: numc(apRows, setApRows, 'outstandingAmount') },
    actionCol(apRows, setApRows),
  ];
  const assetCols = [
    { title: 'Asset Name', render: txt(assetRows, setAssetRows, 'assetName', 'e.g. Toyota Hilux') },
    { title: 'Category', width: 140, render: txt(assetRows, setAssetRows, 'category', 'Vehicles') },
    { title: 'Purchase Date', width: 140, render: datec(assetRows, setAssetRows, 'purchaseDate') },
    { title: 'Cost', width: 120, render: numc(assetRows, setAssetRows, 'cost') },
    { title: 'Accum. Depr.', width: 130, render: numc(assetRows, setAssetRows, 'accumulatedDepreciation') },
    { title: 'Life (yrs)', width: 100, render: numc(assetRows, setAssetRows, 'usefulLifeYears') },
    actionCol(assetRows, setAssetRows),
  ];
  const glCols = [
    { title: 'Account Code', width: 140, render: txt(glRows, setGlRows, 'accountCode', 'e.g. 1120') },
    { title: 'Description', render: txt(glRows, setGlRows, 'description', 'Opening bank balance') },
    { title: 'Debit', width: 130, render: numc(glRows, setGlRows, 'debitAmount') },
    { title: 'Credit', width: 130, render: numc(glRows, setGlRows, 'creditAmount') },
    actionCol(glRows, setGlRows),
  ];

  const ResultTag = ({ data, fields }: { data: any; fields: [string, string][] }) =>
    data ? (
      <Alert type="success" showIcon style={{ marginTop: 12 }}
        message={fields.map(([k, label]) => `${label}: ${data[k]}`).join('  ·  ')
          + (data.skipped?.length ? `  ·  Skipped: ${data.skipped.length}` : '')
          + (data.tallyMismatches?.length ? `  ·  ⚠ ${data.tallyMismatches.length} tally mismatch` : '')} />
    ) : null;

  const gridStep = (title: string, desc: string, cols: any[], rows: any[], setRows: any, gen: any, resultKey: string, resultFields: [string, string][]) => (
    <Card>
      <Title level={4}>{title}</Title>
      <Paragraph type="secondary">{desc}</Paragraph>
      <Table size="small" pagination={false} columns={cols} dataSource={rows} rowKey="key" />
      <Button type="dashed" icon={<PlusOutlined />} onClick={() => addRow(rows, setRows, gen)} style={{ marginTop: 12 }}>Add row</Button>
      <ResultTag data={results[resultKey]} fields={resultFields} />
    </Card>
  );

  const steps = [
    {
      title: 'Setup', icon: <SettingOutlined />,
      content: (
        <Card>
          <Title level={4}>Company setup</Title>
          <Paragraph type="secondary">
            Your chart of accounts is already provisioned. Set the migration cut-off date — every opening balance
            posts dated to this day (typically the day before you go live). You can skip any step that doesn't apply.
          </Paragraph>
          <Space direction="vertical" size="large">
            <div>
              <Text strong>Migration cut-off date</Text><br />
              <DatePicker value={dayjs(cutoffDate)} onChange={(d) => d && setCutoffDate(d.format('YYYY-MM-DD'))} style={{ width: 240, marginTop: 6 }} />
            </div>
            <Alert type="info" showIcon message="Opening Balance Equity (3900) is the contra account. After all balances load, it nets to your opening equity, and the trial balance ties out." />
          </Space>
        </Card>
      ),
    },
    {
      title: 'Opening Stock', icon: <ShopOutlined />,
      content: gridStep('Opening stock', 'Stock on hand at go-live. Enter the product code, quantity and unit cost. Works for stock items and consumables — cost layers are created so COGS works later.',
        stockCols, stockRows, setStockRows, blankStock, 'stock', [['itemsLoaded', 'Loaded'], ['totalValue', 'Value']]),
    },
    {
      title: 'Open AR', icon: <FileTextOutlined />,
      content: gridStep('Open receivables (invoice-wise)', 'Each unpaid customer invoice, loaded individually so aging and statements work. Outstanding defaults to the total if left blank.',
        arCols, arRows, setArRows, blankAR, 'ar', [['itemsLoaded', 'Loaded'], ['grandOutstanding', 'Outstanding']]),
    },
    {
      title: 'Open AP', icon: <ShoppingOutlined />,
      content: gridStep('Open payables (bill-wise)', 'Each unpaid supplier bill, loaded individually so payables aging works.',
        apCols, apRows, setApRows, blankAP, 'ap', [['itemsLoaded', 'Loaded'], ['grandOutstanding', 'Outstanding']]),
    },
    {
      title: 'Fixed Assets', icon: <HomeOutlined />,
      content: gridStep('Fixed asset register', 'Existing assets with cost and accumulated depreciation to date. Depreciation continues from here.',
        assetCols, assetRows, setAssetRows, blankAsset, 'assets', [['assetsLoaded', 'Loaded'], ['netBookValue', 'Net book value']]),
    },
    {
      title: 'Direct GL', icon: <BankOutlined />,
      content: gridStep('Direct GL balances', 'Everything else the trial balance carries — bank, cash, loans, prepayments, capital, retained earnings. Enter account code and debit or credit.',
        glCols, glRows, setGlRows, blankGL, 'gl', [['voucherNumber', 'Voucher'], ['totalDebit', 'Debit'], ['totalCredit', 'Credit']]),
    },
    {
      title: 'Verify & Go live', icon: <CheckCircleOutlined />,
      content: (
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>Opening trial balance</Title>
            <Button icon={<ReloadOutlined />} onClick={loadTrialBalance} loading={tbLoading}>Refresh</Button>
          </Space>
          <Paragraph type="secondary">Your complete opening position. It must balance before you go live.</Paragraph>
          {!tb || !tb.hasOpeningData ? (
            <Empty description="No opening balances posted yet" />
          ) : (
            <>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}><Statistic title="Total Debit" value={tb.totalDebit} precision={3} /></Col>
                <Col span={8}><Statistic title="Total Credit" value={tb.totalCredit} precision={3} /></Col>
                <Col span={8}><Statistic title="Difference" value={tb.difference} precision={3}
                  valueStyle={{ color: tb.balanced ? '#1E7D4F' : '#c0392b' }} /></Col>
              </Row>
              {tb.balanced
                ? <Alert type="success" showIcon style={{ marginBottom: 16 }} message="Balanced — debits equal credits. Your opening position is ready." />
                : <Alert type="error" showIcon style={{ marginBottom: 16 }} message={`Out of balance by ${tb.difference}. Review your entries before going live.`} />}
              {Math.abs(tb.obeBalance) > 0.0005 &&
                <Alert type="info" showIcon style={{ marginBottom: 16 }}
                  message={`Opening Balance Equity carries ${tb.obeBalance}. This is your net opening equity — reclassify it to Retained Earnings / Capital once you confirm the numbers.`} />}
              <Table size="small" pagination={false} rowKey="accountCode"
                dataSource={tb.lines}
                columns={[
                  { title: 'Code', dataIndex: 'accountCode', width: 100 },
                  { title: 'Account', dataIndex: 'accountName' },
                  { title: 'Debit', dataIndex: 'debit', align: 'right' as const, render: (v: number) => v ? v.toFixed(3) : '' },
                  { title: 'Credit', dataIndex: 'credit', align: 'right' as const, render: (v: number) => v ? v.toFixed(3) : '' },
                ]} />
              {tb.balanced && (
                <Result style={{ paddingBottom: 0 }} status="success" icon={<RocketOutlined />}
                  title="Ready to go live"
                  subTitle="Your books are balanced and tied out. You can start transacting."
                  extra={<Button type="primary" size="large" onClick={() => message.success('Company activated — you are live!')}>Finish onboarding</Button>} />
              )}
            </>
          )}
        </Card>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 0 40px' }}>
      <Title level={2}>Company onboarding</Title>
      <Paragraph type="secondary">
        Load your opening balances and go live. Each step is optional — do a full migration, a partial one, or skip
        straight to verification for a fresh start.
      </Paragraph>

      <Steps current={current} items={steps.map(s => ({ title: s.title, icon: s.icon }))} style={{ marginBottom: 24 }} size="small" />

      <div>{steps[current].content}</div>

      <Space style={{ marginTop: 24 }}>
        {current > 0 && <Button onClick={prev} disabled={busy}>Back</Button>}
        {current < steps.length - 1 && current > 0 && <Button onClick={skip} disabled={busy}>Skip</Button>}
        {current < steps.length - 1 &&
          <Button type="primary" onClick={next} loading={busy}>
            {current === 0 ? 'Start' : current === 5 ? 'Post & verify' : 'Save & next'}
          </Button>}
      </Space>
    </div>
  );
}
