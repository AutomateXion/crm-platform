import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Space, Tooltip, Tabs } from 'antd';
import { BarcodeOutlined, QrcodeOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface BarcodeQRProps {
  value?: string;
  productName?: string;
  productCode?: string;
  price?: number;
}

function BarcodeDisplay({ value, productName, productCode, price }: BarcodeQRProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128', width: 2, height: 80,
          displayValue: true, fontSize: 14, margin: 10,
        });
      } catch {}
    }
  }, [value]);

  return (
    <div style={{ textAlign: 'center', padding: 16 }}>
      {productName && <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{productName}</div>}
      <svg ref={svgRef} style={{ maxWidth: '100%' }} />
      {productCode && <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>{productCode}</div>}
      {price && price > 0 && <div style={{ fontSize: 16, fontWeight: 700, color: '#1890ff' }}>OMR {Number(price).toFixed(3)}</div>}
    </div>
  );
}

function QRDisplay({ value, productName, productCode, price }: BarcodeQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, { width: 200, margin: 2 }).catch(() => {});
    }
  }, [value]);

  return (
    <div style={{ textAlign: 'center', padding: 16 }}>
      {productName && <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{productName}</div>}
      <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
      {productCode && <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>{productCode}</div>}
      {price && price > 0 && <div style={{ fontSize: 16, fontWeight: 700, color: '#1890ff' }}>OMR {Number(price).toFixed(3)}</div>}
    </div>
  );
}

export default function BarcodeQR({ value, productName, productCode, price }: BarcodeQRProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('barcode');
  const barcodeValue = value || productCode || '000000';
  const qrValue = JSON.stringify({ code: productCode, name: productName, price: price || 0 });

  const handlePrint = () => {
    const content = document.getElementById('label-print-area');
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Print</title><style>
      body{margin:20px;font-family:Arial,sans-serif;}
      .label{text-align:center;border:1px solid #ddd;padding:16px;display:inline-block;}
    </style></head><body><div class="label">${content.innerHTML}</div></body></html>`);
    win.document.close(); win.print();
  };

  return (
    <>
      <Space size={4}>
        <Tooltip title="Barcode / QR Code">
          <Button size="small" icon={<BarcodeOutlined />} onClick={() => setOpen(true)} />
        </Tooltip>
      </Space>
      <Modal title={`Label — ${productName || productCode}`} open={open} onCancel={() => setOpen(false)} footer={null} width={440}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          {
            key: 'barcode', label: <span><BarcodeOutlined /> Barcode</span>,
            children: (
              <div id="label-print-area">
                <BarcodeDisplay value={barcodeValue} productName={productName} productCode={productCode} price={price} />
              </div>
            )
          },
          {
            key: 'qr', label: <span><QrcodeOutlined /> QR Code</span>,
            children: (
              <div id="label-print-area">
                <QRDisplay value={qrValue} productName={productName} productCode={productCode} price={price} />
              </div>
            )
          },
        ]} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8 }}>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>Print Label</Button>
        </div>
      </Modal>
    </>
  );
}
