import React from 'react';
import { Button, Space } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { downloadPDF, printDocument } from '../../utils/pdfGenerator';
import dayjs from 'dayjs';
import { useCompanySettings } from '../../hooks/useCompanySettings';

// ── Shared styles ─────────────────────────────────────────────
const BRAND = '#1890ff';
const PAGE_STYLE: React.CSSProperties = {
  width: '210mm', minHeight: '297mm', background: '#fff',
  padding: '12mm 15mm', fontFamily: 'Arial, sans-serif',
  fontSize: '9pt', color: '#333', margin: '0 auto',
  border: '1px solid #e0e0e0',
};

// ── Report Header ─────────────────────────────────────────────
function ReportHeader({ title, subtitle, period, color = BRAND, company }: any) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, borderBottom:`3px solid ${color}`, paddingBottom:14 }}>
      <div>
        {company?.logoUrl && <img src={company.logoUrl} alt="logo" style={{ height:40, objectFit:'contain', marginBottom:6, display:'block' }} />}
        <div style={{ fontSize:20, fontWeight:700, color, marginBottom:3 }}>{company?.companyName || 'My Company'}</div>
        <div style={{ fontSize:10, color:'#666', lineHeight:1.6 }}>
          {company?.addressLine1 || 'Muscat, Sultanate of Oman'}<br />
          {company?.phone && `Tel: ${company.phone}`}{company?.phone && company?.email && ' | '}{company?.email && `Email: ${company.email}`}<br />
          {company?.trn && `VAT TRN: ${company.trn}`}
        </div>
      </div>
      <div style={{ textAlign:'right' }}>
        <div style={{ fontSize:16, fontWeight:700, color, marginBottom:3 }}>{title}</div>
        {subtitle && <div style={{ fontSize:10, color:'#666', marginBottom:2 }}>{subtitle}</div>}
        <div style={{ fontSize:10, color:'#888' }}>{period}</div>
        <div style={{ fontSize:9, color:'#aaa', marginTop:2 }}>Generated: {dayjs().format('DD MMM YYYY HH:mm')}</div>
      </div>
    </div>
  );
}

// ── Section Title ─────────────────────────────────────────────
function SectionTitle({ title, color = BRAND }: any) {
  return (
    <div style={{ background:`${color}15`, borderLeft:`4px solid ${color}`, padding:'6px 10px', fontWeight:700, fontSize:11, color, marginBottom:6, marginTop:12 }}>
      {title}
    </div>
  );
}

// ── Summary Row ───────────────────────────────────────────────
function SummaryRow({ label, value, bold=false, color='#333', indent=false, borderTop=false }: any) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 10px', borderTop: borderTop ? '2px solid #e0e0e0' : '1px solid #f5f5f5', background: bold ? '#fafafa' : 'transparent' }}>
      <span style={{ paddingLeft: indent ? 16 : 0, fontSize: bold ? 11 : 10, fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? 12 : 10, fontWeight: bold ? 700 : 400, color }}>{value}</span>
    </div>
  );
}

// ── Report Table ──────────────────────────────────────────────
function ReportTable({ columns, data, color = BRAND }: any) {
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9 }}>
      <thead>
        <tr style={{ background:color, color:'#fff' }}>
          {columns.map((col: any, i: number) => (
            <th key={i} style={{ padding:'7px 8px', textAlign: col.align || 'left', width: col.width, fontSize:9, fontWeight:600 }}>{col.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(data || []).map((row: any, i: number) => (
          <tr key={i} style={{ background: i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
            {columns.map((col: any, j: number) => (
              <td key={j} style={{ padding:'6px 8px', textAlign: col.align || 'left', fontSize:9 }}>
                {col.render ? col.render(row[col.key], row, i) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
        {data?.length === 0 && (
          <tr><td colSpan={columns.length} style={{ padding:'20px', textAlign:'center', color:'#999' }}>No data available</td></tr>
        )}
      </tbody>
    </table>
  );
}

// ── Report Footer ─────────────────────────────────────────────
function ReportFooter({ notes }: any) {
  return (
    <div style={{ marginTop:24, paddingTop:10, borderTop:'1px solid #e0e0e0', display:'flex', justifyContent:'space-between', fontSize:8, color:'#aaa' }}>
      <span>All amounts in Omani Riyal (OMR) — 3 decimal places</span>
      <span>Confidential — For internal use only</span>
      <span>Page 1 of 1</span>
    </div>
  );
}

const fmt = (n: number) => `OMR ${Math.abs(Number(n||0)).toFixed(3)}`;
const fmtSigned = (n: number) => Number(n)<0 ? `(OMR ${Math.abs(Number(n)).toFixed(3)})` : `OMR ${Number(n).toFixed(3)}`;

// ── P&L PDF ───────────────────────────────────────────────────
export function ProfitLossPDF({ data, period }: { data: any, period: string }) {
  const { settings: company } = useCompanySettings();
  if (!data) return null;
  const { revenue, cogs, opex, totalRevenue, totalCogs, grossProfit, totalOpex, netProfit, grossMargin, netMargin } = data;

  return (
    <div>
      <Space style={{ marginBottom:16 }}>
        <Button icon={<PrinterOutlined />} onClick={() => printDocument('pnl-pdf')}>Print</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('pnl-pdf', `profit-loss-${dayjs().format('YYYY-MM-DD')}.pdf`)}>Download PDF</Button>
      </Space>
      <div id="pnl-pdf" style={PAGE_STYLE}>
        <ReportHeader title="PROFIT & LOSS STATEMENT" period={period} color="#52c41a" company={company} />

        {/* KPI Summary */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
          {[
            { label:'Total Revenue', value:fmt(totalRevenue), color:'#52c41a' },
            { label:'Gross Profit', value:fmt(grossProfit), color:'#1890ff' },
            { label:`Net ${netProfit>=0?'Profit':'Loss'}`, value:fmt(netProfit), color:netProfit>=0?'#52c41a':'#ff4d4f' },
            { label:'Net Margin', value:`${Number(netMargin||0).toFixed(1)}%`, color:'#722ed1' },
          ].map((k,i) => (
            <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}30`, borderRadius:6, padding:'8px 10px', textAlign:'center' }}>
              <div style={{ fontSize:14, fontWeight:700, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:9, color:'#666', marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <SectionTitle title="REVENUE" color="#52c41a" />
        <ReportTable color="#52c41a" columns={[
          { title:'Code', key:'accountCode', width:60 },
          { title:'Account', key:'accountName' },
          { title:'Amount (OMR)', key:'balance', align:'right', render:(v:number)=><span style={{color:'#52c41a'}}>{fmt(v)}</span> },
        ]} data={revenue} />
        <SummaryRow label="Total Revenue" value={fmt(totalRevenue)} bold color="#52c41a" borderTop />

        {/* COGS */}
        <SectionTitle title="COST OF GOODS SOLD" color="#fa8c16" />
        <ReportTable color="#fa8c16" columns={[
          { title:'Code', key:'accountCode', width:60 },
          { title:'Account', key:'accountName' },
          { title:'Amount (OMR)', key:'balance', align:'right', render:(v:number)=><span style={{color:'#fa8c16'}}>{fmt(v)}</span> },
        ]} data={cogs} />
        <SummaryRow label="Total COGS" value={fmt(totalCogs)} bold color="#fa8c16" borderTop />
        <SummaryRow label={`Gross Profit (${Number(grossMargin||0).toFixed(1)}% margin)`} value={fmtSigned(grossProfit)} bold color={grossProfit>=0?'#1890ff':'#ff4d4f'} borderTop />

        {/* OpEx */}
        <SectionTitle title="OPERATING EXPENSES" color="#ff4d4f" />
        <ReportTable color="#ff4d4f" columns={[
          { title:'Code', key:'accountCode', width:60 },
          { title:'Account', key:'accountName' },
          { title:'Amount (OMR)', key:'balance', align:'right', render:(v:number)=><span style={{color:'#ff4d4f'}}>{fmt(v)}</span> },
        ]} data={opex} />
        <SummaryRow label="Total Operating Expenses" value={fmt(totalOpex)} bold color="#ff4d4f" borderTop />

        {/* Net Profit */}
        <div style={{ background:netProfit>=0?'#f6ffed':'#fff2f0', border:`2px solid ${netProfit>=0?'#52c41a':'#ff4d4f'}`, borderRadius:6, padding:'10px 14px', marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:14, fontWeight:800 }}>NET {netProfit>=0?'PROFIT':'LOSS'}</span>
          <span style={{ fontSize:18, fontWeight:800, color:netProfit>=0?'#52c41a':'#ff4d4f' }}>{fmtSigned(netProfit)} ({Number(netMargin||0).toFixed(1)}%)</span>
        </div>
        <ReportFooter />
      </div>
    </div>
  );
}

// ── Balance Sheet PDF ─────────────────────────────────────────
export function BalanceSheetPDF({ data, period }: { data: any, period: string }) {
  const { settings: company } = useCompanySettings();
  if (!data) return null;
  const { currentAssets, fixedAssets, currentLiabilities, longTermLiabilities, equity,
    totalCurrentAssets, totalFixedAssets, totalAssets,
    totalCurrentLiabilities, totalLongTermLiabilities, totalEquity,
    totalLiabilitiesEquity, netProfit, isBalanced } = data;

  const accCols = [
    { title:'Code', key:'accountCode', width:60 },
    { title:'Account', key:'accountName' },
    { title:'Amount (OMR)', key:'balance', align:'right' as const, render:(v:number,_:any,__:number,color?:string)=><span>{fmt(v)}</span> },
  ];

  return (
    <div>
      <Space style={{ marginBottom:16 }}>
        <Button icon={<PrinterOutlined />} onClick={() => printDocument('bs-pdf')}>Print</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('bs-pdf', `balance-sheet-${dayjs().format('YYYY-MM-DD')}.pdf`)}>Download PDF</Button>
      </Space>
      <div id="bs-pdf" style={{ ...PAGE_STYLE, minHeight:'auto' }}>
        <ReportHeader title="BALANCE SHEET" period={period} color="#1890ff" company={company} />

        {/* Balanced indicator */}
        <div style={{ background:isBalanced?'#f6ffed':'#fff2f0', border:`1px solid ${isBalanced?'#b7eb8f':'#ffccc7'}`, borderRadius:6, padding:'6px 12px', marginBottom:14, fontSize:10, color:isBalanced?'#52c41a':'#ff4d4f', fontWeight:600 }}>
          {isBalanced ? '✓ Balance Sheet is balanced — Total Assets = Total Liabilities + Equity' : `⚠ Out of balance by OMR ${Math.abs(Number(totalAssets||0)-Number(totalLiabilitiesEquity||0)).toFixed(3)}`}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* ASSETS */}
          <div>
            <div style={{ background:'#1890ff', color:'#fff', padding:'8px 12px', fontWeight:700, fontSize:12, textAlign:'center', borderRadius:'6px 6px 0 0' }}>ASSETS</div>
            <SectionTitle title="CURRENT ASSETS" color="#1890ff" />
            <ReportTable color="#1890ff" columns={accCols} data={currentAssets} />
            <SummaryRow label="Total Current Assets" value={fmt(totalCurrentAssets)} bold color="#1890ff" borderTop />
            <SectionTitle title="FIXED ASSETS" color="#2f54eb" />
            <ReportTable color="#2f54eb" columns={accCols} data={fixedAssets} />
            <SummaryRow label="Total Fixed Assets" value={fmt(totalFixedAssets)} bold color="#2f54eb" borderTop />
            <div style={{ background:'#1890ff', color:'#fff', padding:'8px 12px', display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:11, marginTop:6, borderRadius:4 }}>
              <span>TOTAL ASSETS</span><span>{fmt(totalAssets)}</span>
            </div>
          </div>

          {/* LIABILITIES + EQUITY */}
          <div>
            <div style={{ background:'#ff4d4f', color:'#fff', padding:'8px 12px', fontWeight:700, fontSize:12, textAlign:'center', borderRadius:'6px 6px 0 0' }}>LIABILITIES & EQUITY</div>
            <SectionTitle title="CURRENT LIABILITIES" color="#ff4d4f" />
            <ReportTable color="#ff4d4f" columns={accCols} data={currentLiabilities} />
            <SummaryRow label="Total Current Liabilities" value={fmt(totalCurrentLiabilities)} bold color="#ff4d4f" borderTop />
            <SectionTitle title="LONG-TERM LIABILITIES" color="#c41d7f" />
            <ReportTable color="#c41d7f" columns={accCols} data={longTermLiabilities} />
            <SummaryRow label="Total Long-term Liabilities" value={fmt(totalLongTermLiabilities)} bold color="#c41d7f" borderTop />
            <SectionTitle title="EQUITY" color="#722ed1" />
            <ReportTable color="#722ed1" columns={accCols} data={equity} />
            <SummaryRow label={`Current Year ${netProfit>=0?'Profit':'Loss'}`} value={fmtSigned(netProfit)} color={netProfit>=0?'#52c41a':'#ff4d4f'} indent />
            <SummaryRow label="Total Equity" value={fmt(totalEquity)} bold color="#722ed1" borderTop />
            <div style={{ background:'#ff4d4f', color:'#fff', padding:'8px 12px', display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:11, marginTop:6, borderRadius:4 }}>
              <span>TOTAL LIABILITIES & EQUITY</span><span>{fmt(totalLiabilitiesEquity)}</span>
            </div>
          </div>
        </div>
        <ReportFooter />
      </div>
    </div>
  );
}

// ── Trial Balance PDF ─────────────────────────────────────────
export function TrialBalancePDF({ data, period }: { data: any[], period: string }) {
  const { settings: company } = useCompanySettings();
  const totalDebit = (data||[]).reduce((s:number,a:any) => s+Number(a.debit||0), 0);
  const totalCredit = (data||[]).reduce((s:number,a:any) => s+Number(a.credit||0), 0);
  const isBalanced = Math.abs(totalDebit-totalCredit) < 0.01;
  const groups = ['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'];
  const TYPE_COLOR: Record<string,string> = { ASSET:'#1890ff', LIABILITY:'#ff4d4f', EQUITY:'#722ed1', REVENUE:'#52c41a', EXPENSE:'#fa8c16' };

  return (
    <div>
      <Space style={{ marginBottom:16 }}>
        <Button icon={<PrinterOutlined />} onClick={() => printDocument('tb-pdf')}>Print</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadPDF('tb-pdf', `trial-balance-${dayjs().format('YYYY-MM-DD')}.pdf`)}>Download PDF</Button>
      </Space>
      <div id="tb-pdf" style={PAGE_STYLE}>
        <ReportHeader title="TRIAL BALANCE" period={period} company={company} />
        <div style={{ background:isBalanced?'#f6ffed':'#fff2f0', border:`1px solid ${isBalanced?'#b7eb8f':'#ffccc7'}`, borderRadius:6, padding:'6px 12px', marginBottom:14, fontSize:10, color:isBalanced?'#52c41a':'#ff4d4f', fontWeight:600 }}>
          {isBalanced ? '✓ Trial Balance is balanced — Total Debits = Total Credits' : `⚠ Out of balance by OMR ${Math.abs(totalDebit-totalCredit).toFixed(3)}`}
        </div>

        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9 }}>
          <thead>
            <tr style={{ background:BRAND, color:'#fff' }}>
              <th style={{ padding:'7px 8px', textAlign:'left', width:60 }}>Code</th>
              <th style={{ padding:'7px 8px', textAlign:'left' }}>Account Name</th>
              <th style={{ padding:'7px 8px', textAlign:'center', width:80 }}>Type</th>
              <th style={{ padding:'7px 8px', textAlign:'right', width:100 }}>Debit (OMR)</th>
              <th style={{ padding:'7px 8px', textAlign:'right', width:100 }}>Credit (OMR)</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(grp => {
              const grpAccs = (data||[]).filter(a => a.accountType === grp);
              if (!grpAccs.length) return null;
              const gD = grpAccs.reduce((s,a) => s+Number(a.debit||0),0);
              const gC = grpAccs.reduce((s,a) => s+Number(a.credit||0),0);
              return (
                <React.Fragment key={grp}>
                  <tr style={{ background:`${TYPE_COLOR[grp]}15` }}>
                    <td colSpan={5} style={{ padding:'6px 8px', fontWeight:700, color:TYPE_COLOR[grp], fontSize:10, borderBottom:`2px solid ${TYPE_COLOR[grp]}` }}>{grp}</td>
                  </tr>
                  {grpAccs.map((a,i) => (
                    <tr key={i} style={{ background:i%2===0?'#fff':'#f9f9f9', borderBottom:'1px solid #eee' }}>
                      <td style={{ padding:'5px 8px', color:'#8c8c8c' }}>{a.accountCode}</td>
                      <td style={{ padding:'5px 8px', paddingLeft:16 }}>{a.accountName}</td>
                      <td style={{ padding:'5px 8px', textAlign:'center' }}>
                        <span style={{ background:`${TYPE_COLOR[a.accountType]}15`, color:TYPE_COLOR[a.accountType], padding:'1px 6px', borderRadius:3, fontSize:8, fontWeight:600 }}>{a.accountSubtype}</span>
                      </td>
                      <td style={{ padding:'5px 8px', textAlign:'right', color:'#52c41a' }}>{a.debit>0?`OMR ${Number(a.debit).toFixed(3)}`:'—'}</td>
                      <td style={{ padding:'5px 8px', textAlign:'right', color:'#ff4d4f' }}>{a.credit>0?`OMR ${Number(a.credit).toFixed(3)}`:'—'}</td>
                    </tr>
                  ))}
                  <tr style={{ background:`${TYPE_COLOR[grp]}08`, borderTop:`1px solid ${TYPE_COLOR[grp]}` }}>
                    <td colSpan={3} style={{ padding:'5px 8px', fontWeight:700, color:TYPE_COLOR[grp], fontSize:9 }}>Subtotal — {grp}</td>
                    <td style={{ padding:'5px 8px', textAlign:'right', fontWeight:700, color:'#52c41a' }}>{gD>0?`OMR ${gD.toFixed(3)}`:'—'}</td>
                    <td style={{ padding:'5px 8px', textAlign:'right', fontWeight:700, color:'#ff4d4f' }}>{gC>0?`OMR ${gC.toFixed(3)}`:'—'}</td>
                  </tr>
                  <tr><td colSpan={5} style={{ padding:4 }} /></tr>
                </React.Fragment>
              );
            })}
            <tr style={{ background:BRAND, color:'#fff', borderTop:`3px solid ${BRAND}` }}>
              <td colSpan={3} style={{ padding:'10px 8px', fontWeight:800, fontSize:11 }}>GRAND TOTAL</td>
              <td style={{ padding:'10px 8px', textAlign:'right', fontWeight:800, fontSize:11 }}>OMR {totalDebit.toFixed(3)}</td>
              <td style={{ padding:'10px 8px', textAlign:'right', fontWeight:800, fontSize:11 }}>OMR {totalCredit.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
        <ReportFooter />
      </div>
    </div>
  );
}
