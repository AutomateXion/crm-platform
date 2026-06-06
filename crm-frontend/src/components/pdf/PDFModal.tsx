import React from 'react';
import { Modal } from 'antd';
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
      {data && renderPDF()}
    </Modal>
  );
}
