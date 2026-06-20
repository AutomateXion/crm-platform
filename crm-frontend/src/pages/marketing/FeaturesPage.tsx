import { useNavigate } from 'react-router-dom';

// Reused brand icons (same paths as the welcome-page constellation)
const MODULES = [
  {
    n: 'Accounting',
    c: '#2E6DA4',
    icon: 'M3 3v18h18 M7 14l4-4 3 3 5-6',
    promise: 'A real double-entry ledger at the core of everything.',
    body: 'Every transaction across Envoiso posts straight to the general ledger, so your books are always live — never a month-end reconstruction. Built to GCC standards with three-decimal precision for OMR.',
    points: [
      'Standard chart of accounts provisioned on day one — ready to use, easy to extend',
      'Automatic journals from every invoice, payment, receipt and stock movement',
      'Manual journal vouchers with full approval and posting workflow',
      'Trial balance, general ledger and account statements in real time',
      'Opening-balance migration that ties your books out from go-live',
    ],
  },
  {
    n: 'Invoicing',
    c: '#2E6DA4',
    icon: 'M9 7h6 M9 11h6 M9 15h4 M6 2h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z',
    promise: 'Compliant invoices, ready for GCC e-invoicing.',
    body: 'Raise professional tax invoices, credit notes and receipts that post to the ledger automatically — and meet Oman e-invoicing (Fawtara) requirements with UBL 2.1 output built in, ahead of the OTA rollout.',
    points: [
      'Fawtara-ready e-invoicing with UBL 2.1 XML generation',
      'VAT handled correctly — input and output split, configurable rate',
      'Receipts, part-payments and credit notes fully supported',
      'PDF invoices with your branding, emailed straight to customers',
      'Every invoice posts Dr Receivable / Cr Revenue + VAT automatically',
    ],
  },
  {
    n: 'Banking',
    c: '#4A9BD2',
    icon: 'M3 21h18 M5 21V10 M19 21V10 M3 10l9-6 9 6z',
    promise: 'Cash, cheques and reconciliation in one place.',
    body: 'Track every bank and cash account, manage post-dated cheques through their full lifecycle, and reconcile against your statements — all flowing back to the ledger.',
    points: [
      'Multiple bank and cash accounts with live balances',
      'Post-dated cheque (PDC) register — received and issued',
      'Bank reconciliation against statement lines',
      'Payment and receipt vouchers linked to invoices and bills',
      'Opening bank balances loaded cleanly at migration',
    ],
  },
  {
    n: 'CRM',
    c: '#13a89e',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87',
    promise: 'From first touch to closed deal — one pipeline.',
    body: 'Capture leads, manage contacts and companies, and move opportunities through your pipeline. Because CRM shares the same data as Sales and Accounting, a won deal becomes a quotation without re-keying a thing.',
    points: [
      'Leads, contacts and company records in one view',
      'Visual sales pipeline with stages and value tracking',
      'Activities, follow-ups and reminders',
      'Convert a won opportunity straight into a quotation',
      'Full history — every quote, invoice and payment per customer',
    ],
  },
  {
    n: 'Sales',
    c: '#13a89e',
    icon: 'M3 17l6-6 4 4 8-8 M21 7v6h-6',
    promise: 'The full sell cycle, quote to delivery.',
    body: 'Run quotations, sales orders and delivery notes through one connected flow. Stock, pricing and customer credit are all checked as you go, so what you sell always matches what you have and who you trust.',
    points: [
      'Quotations that convert to orders and invoices in a click',
      'Delivery notes with stock deducted at the right cost',
      'Customer credit limits enforced at the point of sale',
      'Multi-currency pricing with live exchange rates',
      'Sales returns handled with correct stock and GL reversal',
    ],
  },
  {
    n: 'Purchase',
    c: '#e08a1e',
    icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
    promise: 'Three-way matched procurement.',
    body: 'Purchase orders, goods receipts and supplier invoices that reconcile against each other automatically. Goods received but not yet invoiced are tracked properly, so your payables and stock are never out of step.',
    points: [
      'Purchase orders through to goods receipt and supplier invoice',
      'Three-way match: PO ↔ GRN ↔ invoice',
      'Goods-received-not-invoiced (GRNI) tracked in the ledger',
      'Stock received at landed cost into the right location',
      'Supplier balances, ageing and payment scheduling',
    ],
  },
  {
    n: 'Inventory',
    c: '#13c2c2',
    icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
    promise: 'Stock you can actually trust.',
    body: 'Multi-location inventory with proper cost layers — FIFO or weighted average — so every item carries a real cost and your margins are honest. Consumables, stock counts and adjustments all included.',
    points: [
      'Multi-warehouse, multi-location stock tracking',
      'FIFO or weighted-average costing, per your policy',
      'Consumables managed alongside trading stock',
      'Stock adjustments and counts with full audit trail',
      'Opening stock loaded with cost layers from day one',
    ],
  },
  {
    n: 'Assets',
    c: '#c2418a',
    icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    promise: 'Your fixed assets, fully accounted for.',
    body: 'A complete fixed-asset register with automatic depreciation, maintenance scheduling and location tracking — posting depreciation to the ledger so your balance sheet always reflects reality.',
    points: [
      'Asset register with categories, cost and useful life',
      'Automatic depreciation posted to the ledger',
      'Maintenance scheduling and service history',
      'Location and custodian tracking, with GPS support',
      'Disposal handling with gain/loss on sale',
    ],
  },
  {
    n: 'Projects',
    c: '#7a5af0',
    icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    promise: 'Deliver on time and on budget.',
    body: 'Plan projects with tasks and milestones, then track actual cost against budget as invoices, purchases and time flow in. You always know whether a job is making money.',
    points: [
      'Projects with tasks, milestones and dependencies',
      'Budget vs actual cost tracking in real time',
      'Link invoices, purchases and expenses to a project',
      'Team assignment and progress visibility',
      'Project profitability at a glance',
    ],
  },
  {
    n: 'Reports',
    c: '#e0a800',
    icon: 'M3 3v18h18 M7 16V9 M12 16V5 M17 16v-4',
    promise: 'Answers, not just data.',
    body: 'Financial statements, sales analytics, stock valuation and ageing — all live, all drawn from the same single source of truth. Export to PDF or Excel when you need to share.',
    points: [
      'Profit & loss, balance sheet and cash flow',
      'AR / AP ageing and customer statements',
      'Stock valuation, movement and reorder reports',
      'Sales analysis by customer, product and period',
      'One-click export to PDF and Excel',
    ],
  },
  {
    n: 'Documents',
    c: '#7a8694',
    icon: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    promise: 'Every document, where you need it.',
    body: 'Attach and store documents against any record — invoices, purchase orders, assets, customers — so the paperwork lives with the transaction, not in a separate folder somewhere.',
    points: [
      'Attach files to any transaction or master record',
      'Central, searchable document store',
      'Versioning and access control',
      'Linked to the record it belongs to',
      'Secure cloud storage with your data kept in region',
    ],
  },
];

const CSS = `
.evxf{--navy:#0C2446;--blue:#2E6DA4;--blue-lt:#4A9BD2;--ink:#1a2530;--muted:#5B7186;--line:#E4EBF2;--bg:#F7FAFC;
  font-family:'Inter',system-ui,-apple-system,sans-serif;color:var(--ink);background:#fff;min-height:100vh}
.evxf .wrap{max-width:1080px;margin:0 auto;padding:0 24px}
.evxf nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.evxf .nav-in{display:flex;align-items:center;justify-content:space-between;height:64px}
.evxf .brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:20px;color:var(--navy);cursor:pointer}
.evxf .mark{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:8px;background:var(--navy);color:var(--blue-lt);font-family:'Fraunces',serif;font-weight:600}
.evxf .nav-links{display:flex;gap:28px;align-items:center}
.evxf .nav-links a{color:var(--ink);font-size:15px;cursor:pointer;text-decoration:none}
.evxf .nav-links a:hover{color:var(--blue)}
.evxf .btn{display:inline-flex;align-items:center;gap:8px;border-radius:9px;padding:10px 18px;font-weight:600;font-size:15px;cursor:pointer;border:1px solid transparent;text-decoration:none}
.evxf .btn-primary{background:var(--blue);color:#fff}
.evxf .btn-primary:hover{background:var(--navy)}
.evxf .fhead{background:linear-gradient(160deg,#0C2446,#173a63);color:#fff;padding:72px 0 64px;text-align:center}
.evxf .fhead .eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#cfe0f0;border-radius:100px;padding:6px 16px;font-size:13px;font-weight:600;letter-spacing:.3px;margin-bottom:22px}
.evxf .fhead .dot{width:7px;height:7px;border-radius:50%;background:var(--blue-lt)}
.evxf .fhead h1{font-family:'Fraunces',serif;font-size:46px;line-height:1.08;margin:0 0 18px;font-weight:600}
.evxf .fhead h1 em{font-style:italic;color:var(--blue-lt)}
.evxf .fhead p{max-width:620px;margin:0 auto;font-size:18px;line-height:1.6;color:#c5d6e8}
.evxf .mods{padding:64px 0}
.evxf .mod{display:grid;grid-template-columns:64px 1fr;gap:24px;padding:36px 0;border-bottom:1px solid var(--line)}
.evxf .mod:last-child{border-bottom:none}
.evxf .mod-ic{width:56px;height:56px;border-radius:14px;display:grid;place-items:center;border:1.5px solid;background:#fff}
.evxf .mod-ic svg{width:28px;height:28px;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.evxf .mod h2{font-family:'Fraunces',serif;font-size:26px;margin:0 0 4px;color:var(--navy);font-weight:600}
.evxf .mod .promise{font-size:16px;font-weight:600;color:var(--blue);margin:0 0 12px}
.evxf .mod .body{font-size:16px;line-height:1.65;color:var(--muted);margin:0 0 18px;max-width:760px}
.evxf .mod ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:10px 28px;max-width:820px}
.evxf .mod li{position:relative;padding-left:26px;font-size:14.5px;line-height:1.5;color:var(--ink)}
.evxf .mod li::before{content:'';position:absolute;left:0;top:7px;width:14px;height:14px;border-radius:50%;background:rgba(46,109,164,.12);
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232E6DA4' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'/></svg>");
  background-size:10px;background-repeat:no-repeat;background-position:center}
.evxf .fcta{background:var(--bg);border-top:1px solid var(--line);padding:64px 0;text-align:center}
.evxf .fcta h2{font-family:'Fraunces',serif;font-size:32px;color:var(--navy);margin:0 0 12px;font-weight:600}
.evxf .fcta p{color:var(--muted);font-size:17px;margin:0 0 24px}
.evxf .foot{background:var(--navy);color:#9fb4c8;padding:32px 0;text-align:center;font-size:14px}
@media(max-width:720px){
  .evxf .fhead h1{font-size:34px}
  .evxf .mod{grid-template-columns:1fr;gap:14px}
  .evxf .mod ul{grid-template-columns:1fr}
  .evxf .nav-links{display:none}
}
`;

export default function FeaturesPage() {
  const nav = useNavigate();
  const go = () => nav('/welcome');
  const trial = () => nav('/login');

  return (
    <div className="evxf">
      <style>{CSS}</style>

      <nav>
        <div className="wrap nav-in">
          <div className="brand" onClick={go}><span className="mark">E</span>Envoiso</div>
          <div className="nav-links">
            <a onClick={go}>Home</a>
            <a onClick={() => nav('/welcome')}>Pricing</a>
            <a onClick={trial} style={{ color: 'var(--navy)', fontWeight: 600 }}>Sign in</a>
          </div>
          <a className="btn btn-primary" onClick={trial}>Start free trial</a>
        </div>
      </nav>

      <header className="fhead">
        <div className="wrap">
          <span className="eyebrow"><span className="dot" />Eleven modules · One platform</span>
          <h1>Everything your business runs on, <em>connected</em>.</h1>
          <p>Envoiso isn’t a pile of separate apps bolted together. Every module shares one database, so your numbers, stock and customers always agree. Here’s what each one does.</p>
        </div>
      </header>

      <section className="mods">
        <div className="wrap">
          {MODULES.map((m) => (
            <div className="mod" key={m.n}>
              <div className="mod-ic" style={{ borderColor: m.c }}>
                <svg viewBox="0 0 24 24" style={{ stroke: m.c }}>
                  {m.icon.split(' M').map((seg, i) => (
                    <path key={i} d={(i === 0 ? seg : 'M' + seg)} />
                  ))}
                </svg>
              </div>
              <div>
                <h2>{m.n}</h2>
                <p className="promise">{m.promise}</p>
                <p className="body">{m.body}</p>
                <ul>
                  {m.points.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="fcta">
        <div className="wrap">
          <h2>One platform. Every function. One source of truth.</h2>
          <p>Start free for 14 days — no credit card required.</p>
          <a className="btn btn-primary" onClick={trial} style={{ fontSize: 16, padding: '13px 28px' }}>Start free trial</a>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">© {new Date().getFullYear()} Envoiso · Intelligence · Flow · Trust</div>
      </footer>
    </div>
  );
}
