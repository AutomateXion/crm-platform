import React, { useState } from 'react';
import {
  Card, Button, Typography, Steps, Table, Input, InputNumber, DatePicker,
  Space, message, Alert, Result, Statistic, Row, Col, Empty, Upload, Tooltip,
} from 'antd';
import {
  ShopOutlined, FileTextOutlined, ShoppingOutlined, BankOutlined,
  HomeOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined,
  RocketOutlined, SettingOutlined, ReloadOutlined, DownloadOutlined, UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import salesApi from '../../services/salesApi';
import { downloadTemplate, parseExcelFile } from '../../utils/importExport';

const { Title, Text, Paragraph } = Typography;

// ===== Rich templates + header->field maps per step =====
const TPL: any = {
  stock: {
    name: 'Opening_Stock',
    headers: ['Product Code*', 'Quantity*', 'Unit Cost*', 'Warehouse', 'Location', 'Batch No', 'Expiry Date', 'UoM'],
    sample: [['PROD-001', '100', '10.000', 'Main Warehouse', 'A-1', 'BATCH-01', '2027-12-31', 'PCS']],
    map: { 'Product Code*': 'productCode', 'Quantity*': 'quantity', 'Unit Cost*': 'unitCost',
           'Warehouse': 'warehouse', 'Location': 'location', 'Batch No': 'batchNo',
           'Expiry Date': 'expiryDate', 'UoM': 'uom' },
  },
  ar: {
    name: 'Opening_AR',
    headers: ['Invoice #*', 'Invoice Date*', 'Due Date', 'Customer Name*', 'Customer Code', 'TRN', 'Email', 'Address',
              'Subtotal', 'VAT Rate %', 'VAT Amount', 'Total Amount*', 'Outstanding Amount', 'Currency', 'Exchange Rate',
              'Salesman', 'Payment Terms', 'Notes'],
    sample: [['INV-001', '2026-03-15', '2026-04-14', 'Gulf Traders LLC', 'CUST-01', '1234567890', 'ar@gulf.com', 'Muscat',
              '952.380', '5', '47.620', '1000.000', '1000.000', 'OMR', '1', 'Ahmed', 'Net 30', 'Migrated']],
    map: { 'Invoice #*': 'invoiceNumber', 'Invoice Date*': 'invoiceDate', 'Due Date': 'dueDate',
           'Customer Name*': 'customerName', 'Customer Code': 'accountId', 'TRN': 'customerTrn',
           'Email': 'customerEmail', 'Address': 'customerAddress', 'Subtotal': 'subtotal',
           'VAT Rate %': 'vatRate', 'VAT Amount': 'vatAmount', 'Total Amount*': 'totalAmount',
           'Outstanding Amount': 'outstandingAmount', 'Currency': 'currencyCode', 'Exchange Rate': 'exchangeRate',
           'Salesman': 'salesmanName', 'Payment Terms': 'paymentTerms', 'Notes': 'notes' },
  },
  ap: {
    name: 'Opening_AP',
    headers: ['Bill #*', 'Supplier Invoice #', 'Invoice Date*', 'Due Date', 'Supplier Name*', 'Supplier Code', 'TRN', 'Address',
              'Subtotal', 'VAT Rate %', 'VAT Amount', 'Total Amount*', 'Outstanding Amount', 'Currency', 'Exchange Rate',
              'Payment Terms', 'Notes'],
    sample: [['BILL-001', 'SINV-9001', '2026-04-01', '2026-05-01', 'Oman Wholesale Co', 'SUP-01', '9876543210', 'Sohar',
              '1904.760', '5', '95.240', '2000.000', '2000.000', 'OMR', '1', 'Net 30', 'Migrated']],
    map: { 'Bill #*': 'invoiceNumber', 'Supplier Invoice #': 'supplierInvoiceNo', 'Invoice Date*': 'invoiceDate',
           'Due Date': 'dueDate', 'Supplier Name*': 'supplierName', 'Supplier Code': 'supplierId', 'TRN': 'supplierTrn',
           'Address': 'supplierAddress', 'Subtotal': 'subtotal', 'VAT Rate %': 'vatRate', 'VAT Amount': 'vatAmount',
           'Total Amount*': 'totalAmount', 'Outstanding Amount': 'outstandingAmount', 'Currency': 'currencyCode',
           'Exchange Rate': 'exchangeRate', 'Payment Terms': 'paymentTerms', 'Notes': 'notes' },
  },
  assets: {
    name: 'Opening_Fixed_Assets',
    headers: ['Asset Name*', 'Category', 'Sub-Category', 'Brand', 'Model', 'Serial No', 'Purchase Date', 'Cost*',
              'Accumulated Depreciation', 'Useful Life (Years)', 'Salvage Value', 'Depreciation Method',
              'Location', 'Department', 'Custodian', 'Supplier', 'Warranty Expiry', 'Insurance Expiry'],
    sample: [['Toyota Hilux', 'Vehicles', 'Pickup', 'Toyota', 'Hilux 2024', 'VIN12345', '2024-01-15', '12000.000',
              '4800.000', '5', '1000.000', 'STRAIGHT_LINE', 'Head Office', 'Logistics', 'Driver A', 'Al Futtaim',
              '2027-01-15', '2026-12-31']],
    map: { 'Asset Name*': 'assetName', 'Category': 'category', 'Sub-Category': 'subCategory', 'Brand': 'brand',
           'Model': 'model', 'Serial No': 'serialNumber', 'Purchase Date': 'purchaseDate', 'Cost*': 'cost',
           'Accumulated Depreciation': 'accumulatedDepreciation', 'Useful Life (Years)': 'usefulLifeYears',
           'Salvage Value': 'salvageValue', 'Depreciation Method': 'depreciationMethod', 'Location': 'locationName',
           'Department': 'department', 'Custodian': 'assignedToName', 'Supplier': 'supplierName',
           'Warranty Expiry': 'warrantyExpiry', 'Insurance Expiry': 'insuranceExpiry' },
  },
  gl: {
    name: 'Opening_GL',
    headers: ['Account Code*', 'Description', 'Debit', 'Credit', 'Cost Center', 'Reference'],
    sample: [['1120', 'Opening bank balance', '25000.000', '', '', 'OB-2026'],
             ['2210', 'Opening bank loan', '', '15000.000', '', 'OB-2026']],
    map: { 'Account Code*': 'accountCode', 'Description': 'description', 'Debit': 'debitAmount',
           'Credit': 'creditAmount', 'Cost Center': 'costCenter', 'Reference': 'reference' },
  },
};

const blankStock = () => ({ key: Math.random(), productCode: '', quantity: undefined, unitCost: undefined });
const blankAR = () => ({ key: Math.random(), invoiceNumber: '', invoiceDate: '', dueDate: '', customerName: '', totalAmount: undefined, outstandingAmount: undefined });
const blankAP = () => ({ key: Math.random(), invoiceNumber: '', invoiceDate: '', dueDate: '', supplierName: '', totalAmount: undefined, outstandingAmount: undefined });
const blankAsset = () => ({ key: Math.random(), assetName: '', category: '', purchaseDate: '', cost: undefined, accumulatedDepreciation: undefined, usefulLifeYears: undefined });
const blankGL = () => ({ key: Math.random(), accountCode: '', description: '', debitAmount: undefined, creditAmount: undefined });

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [cutoffDate, setCutoffDate] = useState<string>(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
  const [busy, setBusy] = useState(false);

  const [stockRows, setStockRows] = useState<any[]>([blankStock()]);
  const [arRows, setArRows] = useState<any[]>([blankAR()]);
  const [apRows, setApRows] = useState<any[]>([blankAP()]);
  const [assetRows, setAssetRows] = useState<any[]>([blankAsset()]);
  const [glRows, setGlRows] = useState<any[]>([blankGL()]);

  const [results, setResults] = useState<Record<string, any>>({});
  const [tb, setTb] = useState<any>(null);
  const [tbLoading, setTbLoading] = useState(false);

  const setRowField = (rows: any[], setRows: any, key: any, field: string, val: any) =>
    setRows(rows.map(r => r.key === key ? { ...r, [field]: val } : r));
  const addRow = (rows: any[], setRows: any, gen: any) => setRows([...rows, gen()]);
  const delRow = (rows: any[], setRows: any, key: any) => setRows(rows.length > 1 ? rows.filter(r => r.key !== key) : rows);

  // ---- bulk import: parse Excel -> map headers to fields -> fill grid ----
  const handleUpload = async (file: File, tplKey: string, setRows: any) => {
    try {
      const parsed = await parseExcelFile(file);
      if (!parsed.length) { message.warning('No data rows found in the file.'); return false; }
      const map = TPL[tplKey].map;
      const numFields = ['quantity', 'unitCost', 'totalAmount', 'outstandingAmount', 'subtotal', 'vatRate',
        'vatAmount', 'exchangeRate', 'cost', 'accumulatedDepreciation', 'usefulLifeYears',
        'salvageValue', 'debitAmount', 'creditAmount'];
      const dateFields = ['invoiceDate', 'dueDate', 'purchaseDate', 'expiryDate', 'warrantyExpiry', 'insuranceExpiry'];
      const rows = parsed.map((raw: any) => {
        const row: any = { key: Math.random() };
        Object.keys(map).forEach((header) => {
          const field = map[header];
          let v = raw[header];
          if (v === '' || v === undefined || v === null) return;
          if (numFields.includes(field)) { const n = Number(v); v = Number.isFinite(n) ? n : undefined; }
          if (dateFields.includes(field) && v) { const d = dayjs(v); if (d.isValid()) v = d.format('YYYY-MM-DD'); }
          row[field] = v;
        });
        return row;
      });
      setRows(rows);
      message.success(`Loaded ${rows.length} row(s) from Excel. Review below, then Save & next.`);
    } catch (e) {
      message.error('Could not read that file. Use the downloaded template format.');
    }
    return false; // prevent AntD auto-upload
  };

  // ---- post handlers (send ALL fields; loaders use what they know) ----
  const postStock = async () => {
    const items = stockRows.filter(r => r.productCode && Number(r.quantity) > 0)
      .map(r => ({ ...r, quantity: Number(r.quantity), unitCost: Number(r.unitCost || 0) }));
    if (!items.length) { message.info('No stock rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/stock', { cutoffDate, items });
      setResults(r => ({ ...r, stock: data }));
      message.success(`Loaded ${data.itemsLoaded} stock item(s), value ${data.totalValue}`); return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'Stock load failed'); return false; }
    finally { setBusy(false); }
  };
  const postAR = async () => {
    const items = arRows.filter(r => r.invoiceNumber && Number(r.totalAmount) > 0)
      .map(r => ({ ...r, invoiceDate: r.invoiceDate || cutoffDate, dueDate: r.dueDate || r.invoiceDate || cutoffDate,
        totalAmount: Number(r.totalAmount), outstandingAmount: Number(r.outstandingAmount ?? r.totalAmount) }));
    if (!items.length) { message.info('No AR rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/ar', { cutoffDate, items });
      setResults(r => ({ ...r, ar: data }));
      message.success(`Loaded ${data.itemsLoaded} invoice(s), outstanding ${data.grandOutstanding}`); return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'AR load failed'); return false; }
    finally { setBusy(false); }
  };
  const postAP = async () => {
    const items = apRows.filter(r => r.invoiceNumber && Number(r.totalAmount) > 0)
      .map(r => ({ ...r, invoiceDate: r.invoiceDate || cutoffDate, dueDate: r.dueDate || r.invoiceDate || cutoffDate,
        totalAmount: Number(r.totalAmount), outstandingAmount: Number(r.outstandingAmount ?? r.totalAmount) }));
    if (!items.length) { message.info('No AP rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/ap', { cutoffDate, items });
      setResults(r => ({ ...r, ap: data }));
      message.success(`Loaded ${data.itemsLoaded} bill(s), outstanding ${data.grandOutstanding}`); return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'AP load failed'); return false; }
    finally { setBusy(false); }
  };
  const postAssets = async () => {
    const assets = assetRows.filter(r => r.assetName && Number(r.cost) > 0)
      .map(r => ({ ...r, category: r.category || 'General', purchaseDate: r.purchaseDate || cutoffDate,
        cost: Number(r.cost), accumulatedDepreciation: Number(r.accumulatedDepreciation || 0),
        usefulLifeYears: r.usefulLifeYears ? Number(r.usefulLifeYears) : undefined }));
    if (!assets.length) { message.info('No asset rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/assets', { cutoffDate, assets });
      setResults(r => ({ ...r, assets: data }));
      message.success(`Loaded ${data.assetsLoaded} asset(s), net book value ${data.netBookValue}`); return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'Asset load failed'); return false; }
    finally { setBusy(false); }
  };
  const postGL = async () => {
    const lines = glRows.filter(r => r.accountCode && (Number(r.debitAmount) > 0 || Number(r.creditAmount) > 0))
      .map(r => ({ ...r, debitAmount: Number(r.debitAmount || 0), creditAmount: Number(r.creditAmount || 0),
        description: r.description || 'Opening balance' }));
    if (!lines.length) { message.info('No GL rows to load — skipping.'); return true; }
    setBusy(true);
    try {
      const { data } = await salesApi.post('/sales/opening-balance/gl', { cutoffDate, lines });
      setResults(r => ({ ...r, gl: data }));
      message.success(`Posted GL opening journal ${data.voucherNumber}`); return true;
    } catch (e: any) { message.error(e?.response?.data?.message || 'GL load failed'); return false; }
    finally { setBusy(false); }
  };

  const loadTrialBalance = async () => {
    setTbLoading(true);
    try { const { data } = await salesApi.get('/sales/opening-balance/trial-balance'); setTb(data); }
    catch (e: any) { message.error('Could not load trial balance'); }
    finally { setTbLoading(false); }
  };

  const stepPost: Record<number, () => Promise<boolean>> = { 1: postStock, 2: postAR, 3: postAP, 4: postAssets, 5: postGL };
  const next = async () => {
    const fn = stepPost[current];
    if (fn) { const ok = await fn(); if (!ok) return; }
    if (current === 5) await loadTrialBalance();
    setCurrent(current + 1);
  };
  const skip = () => { if (current === 5) loadTrialBalance(); setCurrent(current + 1); };
  const prev = () => setCurrent(current - 1);

  // ---- grid cell renderers ----
  const actionCol = (rows: any[], setRows: any) => ({
    title: '', width: 44, render: (_: any, r: any) =>
      <Button size="small" danger type="text" icon={<DeleteOutlined />} onClick={() => delRow(rows, setRows, r.key)} />,
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
    { title: 'Quantity', width: 120, render: numc(stockRows, setStockRows, 'quantity') },
    { title: 'Unit Cost', width: 120, render: numc(stockRows, setStockRows, 'unitCost') },
    actionCol(stockRows, setStockRows),
  ];
  const arCols = [
    { title: 'Invoice #', render: txt(arRows, setArRows, 'invoiceNumber', 'INV-001') },
    { title: 'Date', width: 130, render: datec(arRows, setArRows, 'invoiceDate') },
    { title: 'Customer', render: txt(arRows, setArRows, 'customerName', 'Customer name') },
    { title: 'Total', width: 110, render: numc(arRows, setArRows, 'totalAmount') },
    { title: 'Outstanding', width: 120, render: numc(arRows, setArRows, 'outstandingAmount') },
    actionCol(arRows, setArRows),
  ];
  const apCols = [
    { title: 'Bill #', render: txt(apRows, setApRows, 'invoiceNumber', 'BILL-001') },
    { title: 'Date', width: 130, render: datec(apRows, setApRows, 'invoiceDate') },
    { title: 'Supplier', render: txt(apRows, setApRows, 'supplierName', 'Supplier name') },
    { title: 'Total', width: 110, render: numc(apRows, setApRows, 'totalAmount') },
    { title: 'Outstanding', width: 120, render: numc(apRows, setApRows, 'outstandingAmount') },
    actionCol(apRows, setApRows),
  ];
  const assetCols = [
    { title: 'Asset Name', render: txt(assetRows, setAssetRows, 'assetName', 'e.g. Toyota Hilux') },
    { title: 'Category', width: 130, render: txt(assetRows, setAssetRows, 'category', 'Vehicles') },
    { title: 'Cost', width: 110, render: numc(assetRows, setAssetRows, 'cost') },
    { title: 'Accum. Depr.', width: 120, render: numc(assetRows, setAssetRows, 'accumulatedDepreciation') },
    { title: 'Life (yrs)', width: 90, render: numc(assetRows, setAssetRows, 'usefulLifeYears') },
    actionCol(assetRows, setAssetRows),
  ];
  const glCols = [
    { title: 'Account Code', width: 140, render: txt(glRows, setGlRows, 'accountCode', 'e.g. 1120') },
    { title: 'Description', render: txt(glRows, setGlRows, 'description', 'Opening bank balance') },
    { title: 'Debit', width: 120, render: numc(glRows, setGlRows, 'debitAmount') },
    { title: 'Credit', width: 120, render: numc(glRows, setGlRows, 'creditAmount') },
    actionCol(glRows, setGlRows),
  ];

  const ResultTag = ({ data, fields }: { data: any; fields: [string, string][] }) =>
    data ? (
      <Alert type="success" showIcon style={{ marginTop: 12 }}
        message={fields.map(([k, label]) => `${label}: ${data[k]}`).join('  ·  ')
          + (data.skipped?.length ? `  ·  Skipped: ${data.skipped.length}` : '')
          + (data.tallyMismatches?.length ? `  ·  ⚠ ${data.tallyMismatches.length} tally mismatch` : '')} />
    ) : null;

  // import toolbar (download template + upload)
  const ImportBar = ({ tplKey, setRows }: { tplKey: string; setRows: any }) => (
    <Space style={{ marginBottom: 12 }} wrap>
      <Tooltip title="Download an Excel template with all available fields">
        <Button icon={<DownloadOutlined />} onClick={() => downloadTemplate(TPL[tplKey].name, TPL[tplKey].headers, TPL[tplKey].sample)}>
          Download template
        </Button>
      </Tooltip>
      <Upload accept=".xlsx,.xls,.csv" showUploadList={false} beforeUpload={(f) => handleUpload(f as File, tplKey, setRows)}>
        <Button icon={<UploadOutlined />} type="primary" ghost>Upload Excel</Button>
      </Upload>
      <Text type="secondary">Bulk-load hundreds of rows from your old system, then review below.</Text>
    </Space>
  );

  const gridStep = (title: string, desc: string, tplKey: string, cols: any[], rows: any[], setRows: any, gen: any, resultKey: string, resultFields: [string, string][]) => (
    <Card>
      <Title level={4}>{title}</Title>
      <Paragraph type="secondary">{desc}</Paragraph>
      <ImportBar tplKey={tplKey} setRows={setRows} />
      <Table size="small" pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
        columns={cols} dataSource={rows} rowKey="key" scroll={{ y: 360 }} />
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
            posts dated to this day. You can skip any step that doesn't apply, and use Excel upload for large volumes.
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
      content: gridStep('Opening stock', 'Stock on hand at go-live. Download the template, fill it in Excel (or export from your old system), and upload — or type rows directly. Works for stock and consumables; cost layers are created so COGS works later.',
        'stock', stockCols, stockRows, setStockRows, blankStock, 'stock', [['itemsLoaded', 'Loaded'], ['totalValue', 'Value']]),
    },
    {
      title: 'Open AR', icon: <FileTextOutlined />,
      content: gridStep('Open receivables (invoice-wise)', 'Each unpaid customer invoice, loaded individually so aging and statements work. The template captures full details (TRN, currency, salesman, etc.). Outstanding defaults to the total if blank.',
        'ar', arCols, arRows, setArRows, blankAR, 'ar', [['itemsLoaded', 'Loaded'], ['grandOutstanding', 'Outstanding']]),
    },
    {
      title: 'Open AP', icon: <ShoppingOutlined />,
      content: gridStep('Open payables (bill-wise)', 'Each unpaid supplier bill, loaded individually so payables aging works. Full supplier details captured via the template.',
        'ap', apCols, apRows, setApRows, blankAP, 'ap', [['itemsLoaded', 'Loaded'], ['grandOutstanding', 'Outstanding']]),
    },
    {
      title: 'Fixed Assets', icon: <HomeOutlined />,
      content: gridStep('Fixed asset register', 'Existing assets with cost and accumulated depreciation to date — depreciation continues from here. The template captures brand, model, serial, location, custodian, warranty and more.',
        'assets', assetCols, assetRows, setAssetRows, blankAsset, 'assets', [['assetsLoaded', 'Loaded'], ['netBookValue', 'Net book value']]),
    },
    {
      title: 'Direct GL', icon: <BankOutlined />,
      content: gridStep('Direct GL balances', 'Everything else the trial balance carries — bank, cash, loans, prepayments, capital, retained earnings. Enter account code and debit or credit.',
        'gl', glCols, glRows, setGlRows, blankGL, 'gl', [['voucherNumber', 'Voucher'], ['totalDebit', 'Debit'], ['totalCredit', 'Credit']]),
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
              <Table size="small" pagination={false} rowKey="accountCode" dataSource={tb.lines}
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
        straight to verification. For large volumes, download the Excel template, fill it from your old system, and upload.
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
