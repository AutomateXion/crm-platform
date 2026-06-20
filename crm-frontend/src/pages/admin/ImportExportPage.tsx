import React, { useState } from 'react';
import {
  Card, Button, Typography, Row, Col, Table, Tag, Upload, Alert,
  Tabs, Progress, message, Space, Modal, Divider, Steps,
} from 'antd';
import {
  DownloadOutlined, UploadOutlined, FileExcelOutlined,
  CheckCircleOutlined, CloseCircleOutlined, InboxOutlined,
} from '@ant-design/icons';
import { downloadTemplate, parseExcelFile, TEMPLATES } from '../../utils/importExport';
import salesApi from '../../services/salesApi';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const IMPORT_CONFIGS = [
  {
    key: 'products',
    title: 'Products & Services',
    description: 'Import your product catalog with pricing, stock, and warehouse details',
    icon: '📦',
    color: '#1890ff',
    template: TEMPLATES.products,
    fields: ['productCode', 'productName', 'description', 'category', 'unitOfMeasure', 'unitPrice', 'costPrice', 'isInventoryItem', 'trackStock', 'minStockQty', 'reorderPoint', 'reorderQty', 'brand', 'manufacturer', 'countryOfOrigin', 'partNumber', 'modelNumber', 'taxCategory', 'hsCode', 'weight', 'openingStock', 'openingStockValue', 'openingStockDate', 'notes'],
    apiEndpoint: '/sales/products/bulk',
    mapRow: (row: any) => ({
      productCode: row['Product Code*'] || '',
      productName: row['Product Name*'] || '',
      description: row['Description'] || '',
      category: row['Category'] || '',
      unitOfMeasure: row['Unit of Measure*'] || 'PCS',
      unitPrice: parseFloat(row['Unit Price (OMR)'] || '0'),
      costPrice: parseFloat(row['Cost Price (OMR)'] || '0'),
      isInventoryItem: (row['Is Inventory Item (Yes/No)'] || 'Yes').toLowerCase() === 'yes',
      trackStock: (row['Track Stock (Yes/No)'] || 'Yes').toLowerCase() === 'yes',
      minStockQty: parseFloat(row['Min Stock Qty'] || '0'),
      reorderPoint: parseFloat(row['Reorder Point'] || '0'),
      reorderQty: parseFloat(row['Reorder Qty'] || '0'),
      brand: row['Brand'] || '',
      manufacturer: row['Manufacturer'] || '',
      countryOfOrigin: row['Country of Origin'] || '',
      partNumber: row['Part Number'] || '',
      modelNumber: row['Model Number'] || '',
      taxCategory: row['Tax Category'] || 'STANDARD',
      hsCode: row['HS Code'] || '',
      weight: parseFloat(row['Weight (KG)'] || '0'),
      openingStock: parseFloat(row['Opening Stock'] || '0'),
      openingStockValue: parseFloat(row['Opening Stock Value'] || '0'),
      openingStockDate: row['Opening Stock Date'] || '',
      notes: row['Notes'] || '',
    }),
    validate: (row: any) => {
      const errors = [];
      if (!row['Product Code*']) errors.push('Product Code is required');
      if (!row['Product Name*']) errors.push('Product Name is required');
      if (!row['Unit of Measure*']) errors.push('Unit of Measure is required');
      return errors;
    },
  },
  {
    key: 'chartOfAccounts',
    title: 'Chart of Accounts',
    description: 'Import your full chart of accounts structure',
    icon: '📊',
    color: '#52c41a',
    template: TEMPLATES.chartOfAccounts,
    apiEndpoint: '/sales/chart-of-accounts/bulk',
    mapRow: (row: any) => ({
      accountCode: row['Account Code*'] || '',
      accountName: row['Account Name*'] || '',
      accountType: row['Account Type*'] || '',
      accountSubtype: row['Account Subtype'] || '',
      description: row['Description'] || '',
      isActive: (row['Is Active (Yes/No)'] || 'Yes').toLowerCase() === 'yes',
    }),
    validate: (row: any) => {
      const errors = [];
      if (!row['Account Code*']) errors.push('Account Code is required');
      if (!row['Account Name*']) errors.push('Account Name is required');
      if (!row['Account Type*']) errors.push('Account Type is required');
      const validTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
      if (row['Account Type*'] && !validTypes.includes(row['Account Type*'].toUpperCase())) errors.push(`Account Type must be one of: ${validTypes.join(', ')}`);
      return errors;
    },
  },
  {
    key: 'suppliers',
    title: 'Suppliers',
    description: 'Import supplier master data with contact and banking details',
    icon: '🏭',
    color: '#fa8c16',
    template: TEMPLATES.suppliers,
    apiEndpoint: '/sales/suppliers/bulk',
    mapRow: (row: any) => ({
      supplierCode: row['Supplier Code*'] || '',
      supplierName: row['Supplier Name*'] || '',
      category: row['Category'] || '',
      contactPerson: row['Contact Person'] || '',
      phone: row['Phone'] || '',
      email: row['Email'] || '',
      website: row['Website'] || '',
      address: row['Address'] || '',
      city: row['City'] || '',
      country: row['Country'] || 'Oman',
      poBox: row['P.O. Box'] || '',
      trn: row['TRN'] || '',
      paymentTerms: row['Payment Terms'] || '',
      creditLimit: parseFloat(row['Credit Limit (OMR)'] || '0'),
      currencyCode: row['Currency'] || 'OMR',
      bankName: row['Bank Name'] || '',
      bankAccount: row['Bank Account No.'] || '',
      bankIban: row['IBAN'] || '',
      notes: row['Notes'] || '',
    }),
    validate: (row: any) => {
      const errors = [];
      if (!row['Supplier Code*']) errors.push('Supplier Code is required');
      if (!row['Supplier Name*']) errors.push('Supplier Name is required');
      return errors;
    },
  },
  {
    key: 'accounts',
    title: 'Accounts & Customers',
    description: 'Import customer and supplier accounts from your existing records',
    icon: '🏢',
    color: '#2E6DA4',
    template: TEMPLATES.accounts,
    apiEndpoint: '/accounts/bulk',
    mapRow: (row: any) => ({
      accountName: row['Account Name*'] || '',
      accountCode: row['Account Code'] || '',
      isCustomer: (row['Is Customer (Yes/No)'] || 'Yes').toLowerCase() === 'yes',
      isSupplier: (row['Is Supplier (Yes/No)'] || 'No').toLowerCase() === 'yes',
      phone: row['Phone'] || '',
      email: row['Email'] || '',
      website: row['Website'] || '',
      contactPerson: row['Contact Person'] || '',
      trn: row['TRN'] || '',
      addressLine1: row['Address Line 1'] || '',
      addressLine2: row['Address Line 2'] || '',
      city: row['City'] || '',
      state: row['State'] || '',
      poBox: row['P.O. Box'] || '',
      paymentTerms: row['Payment Terms'] || '',
      creditLimit: parseFloat(row['Credit Limit (OMR)'] || '0'),
      currencyCode: row['Currency'] || 'OMR',
      bankName: row['Bank Name'] || '',
      bankAccount: row['Bank Account No.'] || '',
      bankIban: row['IBAN'] || '',
    }),
    validate: (row: any) => {
      const errors = [];
      if (!row['Account Name*']) errors.push('Account Name is required');
      return errors;
    },
  },
  {
    key: 'contacts',
    title: 'Contacts',
    description: 'Import contact persons linked to accounts',
    icon: '👤',
    color: '#13c2c2',
    template: TEMPLATES.contacts,
    apiEndpoint: '/contacts/bulk',
    mapRow: (row: any) => ({
      firstName: row['First Name*'] || '',
      lastName: row['Last Name*'] || '',
      accountName: row['Account Name'] || '',
      jobTitle: row['Job Title'] || '',
      email: row['Email'] || '',
      phone: row['Phone'] || '',
      mobile: row['Mobile'] || '',
      department: row['Department'] || '',
      notes: row['Notes'] || '',
    }),
    validate: (row: any) => {
      const errors = [];
      if (!row['First Name*']) errors.push('First Name is required');
      if (!row['Last Name*']) errors.push('Last Name is required');
      return errors;
    },
  },
  {
    key: 'masterData',
    title: 'Master Data',
    description: 'Import dropdown values — categories, UOM, brands, etc.',
    icon: '⚙️',
    color: '#eb2f96',
    template: TEMPLATES.masterData,
    apiEndpoint: '/masters/bulk-import',
    mapRow: (row: any) => ({
      categoryCode: row['Category Code*'] || '',
      categoryName: row['Category Name'] || '',
      valueCode: row['Value Code*'] || '',
      valueLabel: row['Value Label*'] || '',
      sortOrder: parseInt(row['Sort Order'] || '0'),
      isActive: (row['Is Active (Yes/No)'] || 'Yes').toLowerCase() === 'yes',
    }),
    validate: (row: any) => {
      const errors = [];
      if (!row['Category Code*']) errors.push('Category Code is required');
      if (!row['Value Code*']) errors.push('Value Code is required');
      if (!row['Value Label*']) errors.push('Value Label is required');
      return errors;
    },
  },
];

function ImportCard({ config }: { config: typeof IMPORT_CONFIGS[0] }) {
  const [step, setStep] = useState(0);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleFile = async (file: File) => {
    try {
      const rows = await parseExcelFile(file);
      const results = rows.map((row, i) => ({
        rowNum: i + 2,
        data: row,
        errors: config.validate(row),
        mapped: config.mapRow(row),
      }));
      setParsedRows(rows);
      setValidationResults(results);
      setStep(1);
      setModalOpen(true);
    } catch (e) {
      message.error('Failed to parse file. Please use the provided template.');
    }
    return false;
  };

  const validRows = validationResults.filter(r => r.errors.length === 0);
  const invalidRows = validationResults.filter(r => r.errors.length > 0);

  const handleImport = async () => {
    setImporting(true);
    try {
      const payload = validRows.map(r => r.mapped);
      let successCount = 0, failCount = 0;

      const endpointMap: Record<string, {client: any, path: string}> = {
        products: { client: salesApi, path: '/sales/products' },
        chartOfAccounts: { client: salesApi, path: '/sales/chart-of-accounts' },
        suppliers: { client: salesApi, path: '/sales/suppliers' },
        accounts: { client: api, path: '/accounts' },
        contacts: { client: api, path: '/contacts' },
        masterData: { client: api, path: '/masters/values' },
      };
      const ep = endpointMap[config.key] || { client: salesApi, path: '/products' };
      for (const item of payload) {
        try {
          await ep.client.post(ep.path, item);
          successCount++;
        } catch (e: any) {
          console.error('Import error:', e?.response?.status, e?.response?.data, item);
          failCount++;
        }
      }

      setImportResults({ success: successCount, failed: failCount, total: payload.length });
      setStep(2);
    } catch { message.error('Import failed'); }
    finally { setImporting(false); }
  };

  const reset = () => { setStep(0); setParsedRows([]); setValidationResults([]); setImportResults(null); setModalOpen(false); };

  return (
    <>
      <Card style={{ borderRadius: 12, borderTop: `4px solid ${config.color}`, height: '100%' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{config.icon}</div>
        <Title level={5} style={{ margin: 0, color: config.color }}>{config.title}</Title>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>{config.description}</Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<DownloadOutlined />} block onClick={() => downloadTemplate(config.template.name, config.template.headers, config.template.sample)}>
            Download Template
          </Button>
          <Upload accept=".xlsx,.xls,.csv" showUploadList={false} beforeUpload={handleFile}>
            <Button icon={<UploadOutlined />} type="primary" block style={{ background: config.color, borderColor: config.color }}>
              Upload & Import
            </Button>
          </Upload>
        </Space>
      </Card>

      <Modal title={`Import ${config.title}`} open={modalOpen} onCancel={reset} footer={null} width={800} style={{ top: 20 }}>
        <Steps current={step} style={{ marginBottom: 24 }} items={[
          { title: 'Validate' }, { title: 'Review' }, { title: 'Done' }
        ]} />

        {step === 1 && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}><Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #1890ff' }}><div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}>{parsedRows.length}</div><Text type="secondary">Total Rows</Text></Card></Col>
              <Col span={8}><Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #52c41a' }}><div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{validRows.length}</div><Text type="secondary">Valid</Text></Card></Col>
              <Col span={8}><Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #ff4d4f' }}><div style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f' }}>{invalidRows.length}</div><Text type="secondary">Errors</Text></Card></Col>
            </Row>

            {invalidRows.length > 0 && (
              <Alert type="warning" style={{ marginBottom: 16 }} message={`${invalidRows.length} rows have errors and will be skipped`}
                description={invalidRows.slice(0, 3).map(r => `Row ${r.rowNum}: ${r.errors.join(', ')}`).join(' | ')} />
            )}

            <Table size="small" pagination={{ showSizeChanger: true, pageSizeOptions: ['10','20','50','100'], defaultPageSize: 5 }}
              dataSource={validationResults}
              rowKey="rowNum"
              columns={[
                { title: 'Row', dataIndex: 'rowNum', width: 60 },
                { title: 'Status', key: 'status', width: 80, render: (_: any, r: any) => r.errors.length === 0 ? <Tag color="success">Valid</Tag> : <Tag color="error">Error</Tag> },
                { title: 'Data Preview', render: (_: any, r: any) => <Text ellipsis style={{ maxWidth: 400 }}>{Object.values(r.data).slice(0, 4).join(' | ')}</Text> },
                { title: 'Errors', render: (_: any, r: any) => r.errors.length > 0 ? <Text type="danger" style={{ fontSize: 11 }}>{r.errors.join(', ')}</Text> : '—' },
              ]}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Button onClick={reset}>Cancel</Button>
              <Button type="primary" onClick={handleImport} loading={importing} disabled={validRows.length === 0}>
                Import {validRows.length} Valid Rows
              </Button>
            </div>
          </>
        )}

        {step === 2 && importResults && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>Import Complete!</Title>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}><Card size="small" style={{ borderLeft: '4px solid #1890ff' }}><Statistic title="Total" value={importResults.total} /></Card></Col>
              <Col span={8}><Card size="small" style={{ borderLeft: '4px solid #52c41a' }}><Statistic title="Imported" value={importResults.success} /></Card></Col>
              <Col span={8}><Card size="small" style={{ borderLeft: '4px solid #ff4d4f' }}><Statistic title="Failed" value={importResults.failed} /></Card></Col>
            </Row>
            <Button type="primary" onClick={reset} style={{ marginTop: 24 }}>Done</Button>
          </div>
        )}
      </Modal>
    </>
  );
}

// Need to import Statistic
import { Statistic } from 'antd';

export default function ImportExportPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Import / Export</Title>
        <Text type="secondary">Download templates, fill in your data, and upload to import records in bulk</Text>
      </div>

      <Alert type="info" style={{ marginBottom: 24, borderRadius: 8 }} showIcon
        message="How to Import"
        description="1. Download the Excel template for the data type you want to import. 2. Fill in your data following the sample row. 3. Upload the completed file. 4. Review validation results and confirm import." />

      <Row gutter={[16, 16]}>
        {IMPORT_CONFIGS.map(config => (
          <Col span={8} key={config.key}>
            <ImportCard config={config} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
