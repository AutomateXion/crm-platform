import React from 'react';

export default function GRNPDF({ data }: { data: any }) {
  if (!data) return null;
  const items = data.items || [];
  const subtotal = items.reduce((s: number, i: any) => s + Number(i.lineTotal || 0), 0);
  const vatAmount = Number(data.vatAmount || subtotal * 0.05);
  const total = Number(data.totalAmount || subtotal + vatAmount);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 32, maxWidth: 800, margin: '0 auto', color: '#1a1a2e' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, borderBottom: '3px solid #52c41a', paddingBottom: 16 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>GOODS RECEIPT NOTE</div>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>GRN #{data.grnNumber}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13 }}>Date: <strong>{data.grnDate ? new Date(data.grnDate).toLocaleDateString() : '—'}</strong></div>
          <div style={{ fontSize: 13 }}>Status: <strong style={{ color: '#52c41a' }}>{data.status}</strong></div>
          {data.poNumber && <div style={{ fontSize: 13 }}>PO Ref: <strong>{data.poNumber}</strong></div>}
        </div>
      </div>

      {/* Supplier Info */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Supplier</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{data.supplierName}</div>
        {data.supplierAddress && <div style={{ fontSize: 12, color: '#666' }}>{data.supplierAddress}</div>}
        {data.supplierTrn && <div style={{ fontSize: 12 }}>TRN: {data.supplierTrn}</div>}
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#52c41a', color: '#fff' }}>
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

      {/* Totals */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', background: '#52c41a', color: '#fff', borderRadius: 4, marginTop: 4, paddingLeft: 12, paddingRight: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Total:</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>OMR {total.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Received By */}
      {data.receivedBy && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#666' }}>Received By: </span>
          <strong style={{ fontSize: 12 }}>{data.receivedBy}</strong>
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12, color: '#666' }}>
          <strong>Notes:</strong> {data.notes}
        </div>
      )}
    </div>
  );
}
