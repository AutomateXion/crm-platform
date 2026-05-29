import React from 'react';

export default function PurchaseInvoicePDF({ data }: { data: any }) {
  if (!data) return null;
  const items = data.items || [];
  const subtotal = items.reduce((s: number, i: any) => s + Number(i.lineTotal || 0), 0);
  const vatAmount = Number(data.vatAmount || subtotal * 0.05);
  const total = Number(data.totalAmount || subtotal + vatAmount);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 32, maxWidth: 800, margin: '0 auto', color: '#1a1a2e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, borderBottom: '3px solid #722ed1', paddingBottom: 16 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#722ed1' }}>PURCHASE INVOICE</div>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>#{data.invoiceNumber}</div>
          {data.supplierInvoiceNo && <div style={{ fontSize: 12, color: '#666' }}>Supplier Inv#: {data.supplierInvoiceNo}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13 }}>Date: <strong>{data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString() : '—'}</strong></div>
          {data.dueDate && <div style={{ fontSize: 13 }}>Due: <strong>{new Date(data.dueDate).toLocaleDateString()}</strong></div>}
          <div style={{ fontSize: 13 }}>Status: <strong style={{ color: '#722ed1' }}>{data.status}</strong></div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Supplier</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{data.supplierName}</div>
        {data.supplierAddress && <div style={{ fontSize: 12, color: '#666' }}>{data.supplierAddress}</div>}
        {data.supplierTrn && <div style={{ fontSize: 12 }}>TRN: {data.supplierTrn}</div>}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#722ed1', color: '#fff' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12 }}>#</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12 }}>Description</th>
            <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 12 }}>UOM</th>
            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>Qty</th>
            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>Unit Price</th>
            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
              <td style={{ padding: '8px 12px', fontSize: 12 }}>{idx + 1}</td>
              <td style={{ padding: '8px 12px', fontSize: 12 }}>{item.description}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: 12 }}>{item.unitOfMeasure}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>{Number(item.quantity).toFixed(3)}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>OMR {Number(item.unitPrice).toFixed(3)}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>OMR {Number(item.lineTotal).toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <div style={{ width: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: 13 }}>Subtotal:</span>
            <span style={{ fontSize: 13 }}>OMR {subtotal.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: 13 }}>VAT (5%):</span>
            <span style={{ fontSize: 13 }}>OMR {vatAmount.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#722ed1', color: '#fff', borderRadius: 4, marginTop: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Total:</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>OMR {total.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', marginTop: 8 }}>
            <span style={{ fontSize: 13, color: '#52c41a' }}>Paid:</span>
            <span style={{ fontSize: 13, color: '#52c41a' }}>OMR {Number(data.paidAmount || 0).toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: 13, color: '#ff4d4f', fontWeight: 700 }}>Balance Due:</span>
            <span style={{ fontSize: 13, color: '#ff4d4f', fontWeight: 700 }}>OMR {Number(data.balanceDue || 0).toFixed(3)}</span>
          </div>
        </div>
      </div>

      {data.notes && (
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12, color: '#666' }}>
          <strong>Notes:</strong> {data.notes}
        </div>
      )}
    </div>
  );
}
