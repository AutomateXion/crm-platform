import React from 'react';
import { Modal, Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import EmailDocumentModal from '../common/EmailDocumentModal';
import { useState, useEffect } from 'react';
import { documentConfigApi } from '../../services/api';
import QuotationPDF from './QuotationPDF';
import InvoicePDF from './InvoicePDF';
import DeliveryNotePDF from './DeliveryNotePDF';
import PurchaseOrderPDF from './PurchaseOrderPDF';
import PaymentVoucherPDF from './PaymentVoucherPDF';
import GRNPDF from './GRNPDF';
import PurchaseInvoicePDF from './PurchaseInvoicePDF';
import ReceiptPDF from './ReceiptPDF';

interface PDFModalProps {
  open: boolean;
  onClose: () => void;
  docType: 'quotation' | 'invoice' | 'delivery-note' | 'purchase-order' | 'payment-voucher' | 'receipt' | 'grn' | 'purchase-invoice';
  data: any;
  companyInfo?: any;
}

export default function PDFModal({ open, onClose, docType, data, companyInfo }: PDFModalProps) {
  const [config, setConfig] = useState<any>(null);
  useEffect(() => {
    if (open && docType) {
      documentConfigApi.get(docType).then((r) => setConfig(r.data || null)).catch(() => setConfig(null));
    }
  }, [open, docType]);
  const [emailOpen, setEmailOpen] = useState(false);

  // Map each doc type to its rendered page-div id prefix (multi-page) or single id
  const pageIdInfo: Record<string, { prefix?: string; single?: string }> = {
    'invoice': { prefix: 'inv-page-' },
    'quotation': { prefix: 'quo-page-' },
    'purchase-order': { prefix: 'po-page-' },
    'grn': { prefix: 'grn-page-' },
    'purchase-invoice': { prefix: 'pinv-page-' },
    'delivery-note': { single: 'dn-pdf-content' },
    'receipt': { single: 'receipt-pdf-content' },
    'payment-voucher': { single: 'pv-pdf-content' },
  };
  const collectPageIds = (): string[] => {
    const info = pageIdInfo[docType] || {};
    if (info.single) return [info.single];
    if (info.prefix) {
      const ids: string[] = [];
      let i = 0;
      while (document.getElementById(`${info.prefix}${i}`)) { ids.push(`${info.prefix}${i}`); i++; }
      return ids;
    }
    return [];
  };
  const docNumbers: Record<string, string> = {
    'invoice': data?.invoiceNumber, 'quotation': data?.quotationNumber,
    'delivery-note': data?.dnNumber, 'purchase-order': data?.poNumber,
    'payment-voucher': data?.voucherNumber, 'receipt': data?.receiptNumber,
    'grn': data?.grnNumber, 'purchase-invoice': data?.invoiceNumber,
  };
  const docNumber = docNumbers[docType] || 'document';
  const recipientEmail = data?.customerEmail || data?.supplierEmail || '';

    const titles: Record<string, string> = {
    'quotation': `Quotation — ${data?.quotationNumber || ''}`,
    'invoice': `Invoice — ${data?.invoiceNumber || ''}`,
    'delivery-note': `Delivery Note — ${data?.dnNumber || ''}`,
    'purchase-order': `Purchase Order — ${data?.poNumber || ''}`,
    'payment-voucher': `Payment Voucher — ${data?.voucherNumber || ''}`,
    'receipt': `Receipt — ${data?.receiptNumber || ''}`,
  };

  const renderPDF = () => {
    switch (docType) {
      case 'quotation': return <QuotationPDF data={data} companyInfo={companyInfo} config={config} />;
      case 'invoice': return <InvoicePDF data={data} companyInfo={companyInfo} config={config} />;
      case 'delivery-note': return <DeliveryNotePDF data={data} companyInfo={companyInfo} config={config} />;
      case 'purchase-order': return <PurchaseOrderPDF data={data} companyInfo={companyInfo} config={config} />;
      case 'payment-voucher': return <PaymentVoucherPDF data={data} companyInfo={companyInfo} config={config} />;
      case 'receipt': return <ReceiptPDF data={data} companyInfo={companyInfo} config={config} />;
      case 'grn': return <GRNPDF data={data} config={config} />;
      case 'purchase-invoice': return <PurchaseInvoicePDF data={data} config={config} />;
      default: return null;
    }
  };

  return (
    <Modal
      title={titles[docType]}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      style={{ top: 20 }}
    >
      <div style={{ marginBottom: 12, textAlign: 'right' }}>
        <Button icon={<MailOutlined />} onClick={() => setEmailOpen(true)}>Email this document</Button>
      </div>
      <EmailDocumentModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        pageIds={collectPageIds()}
        fileName={`${docNumber}.pdf`}
        defaultTo={recipientEmail}
        defaultSubject={titles[docType] || docNumber}
        docLabel={titles[docType] || docNumber}
      />
      {data && renderPDF()}
    </Modal>
  );
}
