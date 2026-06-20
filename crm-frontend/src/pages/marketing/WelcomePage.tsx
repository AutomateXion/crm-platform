import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
.evx{--navy:#0C2446;--navy-2:#13315C;--blue:#2E6DA4;--blue-lt:#4A9BD2;--ink:#0C2446;--paper:#F7F9FB;--paper-2:#EEF3F8;--line:#D8E2EC;--muted:#5B7186;
  font-family:'Inter',-apple-system,sans-serif;color:var(--ink);background:var(--paper);line-height:1.5;-webkit-font-smoothing:antialiased;min-height:100vh}
.evx *{box-sizing:border-box}
.evx .wrap{max-width:1180px;margin:0 auto;padding:0 28px}
.evx .serif{font-family:'Fraunces',Georgia,serif}
.evx section{position:relative}
.evx nav{position:sticky;top:0;z-index:50;background:rgba(247,249,251,.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.evx .nav-in{display:flex;align-items:center;justify-content:space-between;height:68px}
.evx .brand{display:flex;align-items:center;gap:11px;font-family:'Fraunces',serif;font-weight:600;font-size:22px;color:var(--navy);letter-spacing:-.01em}
.evx .brand .mark{width:34px;height:34px;border-radius:8px;background:var(--navy);display:flex;align-items:center;justify-content:center;color:var(--blue-lt);font-family:'Fraunces',serif;font-weight:700;font-size:20px;position:relative;flex-shrink:0}
.evx .brand .mark::after{content:'';position:absolute;top:6px;right:6px;width:5px;height:5px;border-radius:50%;background:#fff}
.evx .nav-links{display:flex;align-items:center;gap:30px}
.evx .nav-links a{color:var(--muted);text-decoration:none;font-size:14.5px;font-weight:500;cursor:pointer}
.evx .nav-links a:hover{color:var(--navy)}
.evx .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:14.5px;border-radius:9px;cursor:pointer;text-decoration:none;padding:10px 20px;border:1px solid transparent;transition:.16s;white-space:nowrap}
.evx .btn-primary{background:var(--blue);color:#fff}
.evx .btn-primary:hover{background:var(--navy)}
.evx .btn-ghost{background:transparent;color:var(--navy);border-color:var(--line)}
.evx .btn-ghost:hover{border-color:var(--blue);color:var(--blue)}
.evx .btn-lg{padding:14px 28px;font-size:16px}
.evx .btn-white{background:#fff;color:var(--navy)}
.evx .btn-white:hover{background:var(--paper-2)}
.evx .hero{padding:74px 0 0;text-align:center;overflow:hidden}
.evx .eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:13px;font-weight:600;color:var(--blue);letter-spacing:.04em;text-transform:uppercase;background:var(--paper-2);border:1px solid var(--line);padding:7px 14px;border-radius:100px;margin-bottom:26px}
.evx .eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--blue-lt)}
.evx h1.hero-h{font-family:'Fraunces',serif;font-weight:600;font-size:clamp(40px,6.5vw,76px);line-height:1.02;letter-spacing:-.025em;color:var(--navy);max-width:16ch;margin:0 auto}
.evx h1.hero-h em{font-style:italic;color:var(--blue)}
.evx .hero-sub{font-size:clamp(17px,2vw,20px);color:var(--muted);margin:26px auto 34px;max-width:60ch;line-height:1.55}
.evx .hero-cta{display:flex;gap:14px;flex-wrap:wrap;align-items:center;justify-content:center}
.evx .hero-note{font-size:13.5px;color:var(--muted);margin-top:18px;display:inline-flex;align-items:center;gap:7px}
.evx .hero-note svg{width:15px;height:15px;color:var(--blue)}
.evx .hero-shot{margin-top:54px;position:relative}
.evx .hero-shot::before{content:'';position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:120%;height:340px;background:radial-gradient(ellipse at center,rgba(74,155,210,.16),transparent 65%);z-index:0}
.evx .hero-shot img{width:100%;max-width:1080px;height:auto;display:block;margin:0 auto;position:relative;z-index:1}
.evx .trust{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:#fff;margin-top:56px}
.evx .trust-in{padding:26px 0;display:flex;align-items:center;gap:30px;flex-wrap:wrap;justify-content:center}
.evx .trust-label{font-size:12.5px;font-weight:600;color:var(--muted);letter-spacing:.05em;text-transform:uppercase}
.evx .logo-slot{height:26px;width:118px;border-radius:6px;background:repeating-linear-gradient(45deg,var(--paper-2),var(--paper-2) 8px,#e6edf4 8px,#e6edf4 16px);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted);font-weight:500}
.evx .sec-head{text-align:center;max-width:640px;margin:0 auto 50px}
.evx .sec-eyebrow{font-size:13px;font-weight:600;color:var(--blue);letter-spacing:.06em;text-transform:uppercase;margin-bottom:14px}
.evx h2.sec-h{font-family:'Fraunces',serif;font-weight:600;font-size:clamp(30px,4vw,46px);line-height:1.08;letter-spacing:-.02em;color:var(--navy)}
.evx .sec-sub{color:var(--muted);font-size:17px;margin-top:14px;line-height:1.55}
.evx .prob{padding:96px 0}
.evx .prob-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.evx .prob-col h3{font-family:'Fraunces',serif;font-size:24px;font-weight:600;margin-bottom:20px;color:var(--navy)}
.evx .prob-list{list-style:none;display:flex;flex-direction:column;gap:14px;padding:0;margin:0}
.evx .prob-list li{display:flex;gap:12px;font-size:15.5px;line-height:1.45;align-items:flex-start}
.evx .prob-list .x{color:#c0504e;flex-shrink:0;margin-top:2px}
.evx .prob-list .c{color:var(--blue);flex-shrink:0;margin-top:2px}
.evx .prob-list svg{width:18px;height:18px}
.evx .prob-before{background:#fff;border:1px solid var(--line);border-radius:18px;padding:34px}
.evx .prob-after{background:var(--navy);color:#dde7f1;border-radius:18px;padding:34px}
.evx .prob-after h3{color:#fff}
.evx .prob-after .prob-list li{color:#cdd9e6}
.evx .mods{padding:0 0 96px}
.evx .mod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.evx .mod-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:28px;transition:.18s}
.evx .mod-card:hover{border-color:var(--blue-lt);box-shadow:0 14px 40px -22px rgba(46,109,164,.4);transform:translateY(-3px)}
.evx .mod-ico{width:46px;height:46px;border-radius:11px;background:var(--paper-2);display:flex;align-items:center;justify-content:center;margin-bottom:18px}
.evx .mod-ico svg{width:23px;height:23px;color:var(--blue);stroke-width:1.8}
.evx .mod-card h3{font-family:'Fraunces',serif;font-size:19px;font-weight:600;color:var(--navy);margin-bottom:8px}
.evx .mod-card p{font-size:14px;color:var(--muted);line-height:1.5}
.evx .evx-const{max-width:620px;margin:0 auto}
.evx .evx-const-svg{width:100%;height:auto;display:block}
.evx .evx-link{stroke:var(--line);stroke-width:1;opacity:.55;transition:opacity .2s,stroke .2s,stroke-width .2s}
.evx .evx-link.lit{stroke:var(--blue);opacity:.9;stroke-width:1.5}
.evx .evx-node{cursor:pointer;transition:transform .18s;outline:none}
.evx .evx-node:hover{transform:scale(1.06)}
.evx .evx-node circle{transition:fill .18s}
.evx .evx-node:focus-visible circle{stroke-width:2.5}
.evx .evx-const-info{text-align:center;min-height:54px;margin-top:18px;max-width:440px;margin-left:auto;margin-right:auto}
.evx .evx-const-info h4{font-family:'Fraunces',serif;font-size:19px;font-weight:600;color:var(--navy);margin-bottom:4px}
.evx .evx-const-info p{font-size:14px;color:var(--muted);line-height:1.55}
.evx .comp{background:var(--navy);color:#fff;padding:84px 0}
.evx .comp-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.evx .comp h2{font-family:'Fraunces',serif;font-size:clamp(28px,3.6vw,40px);font-weight:600;line-height:1.1;letter-spacing:-.02em;margin-bottom:18px}
.evx .comp p{color:#bccbdb;font-size:16.5px;line-height:1.6;margin-bottom:14px}
.evx .comp .badge-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}
.evx .comp .cbadge{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:12px 16px;font-size:13.5px;font-weight:600;display:flex;align-items:center;gap:9px}
.evx .comp .cbadge svg{width:17px;height:17px;color:var(--blue-lt)}
.evx .comp-stat{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:34px}
.evx .comp-stat .row{display:flex;justify-content:space-between;align-items:baseline;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.1)}
.evx .comp-stat .row:last-child{border-bottom:none}
.evx .comp-stat .big{font-family:'Fraunces',serif;font-size:30px;font-weight:600;color:#fff}
.evx .comp-stat .lbl{font-size:13.5px;color:#bccbdb}
.evx .pricing{padding:96px 0 90px}
.evx .bill-toggle{display:flex;align-items:center;justify-content:center;gap:14px;margin:30px 0 8px}
.evx .toggle{position:relative;width:52px;height:28px;border-radius:100px;background:var(--blue);cursor:pointer;border:none;flex-shrink:0}
.evx .toggle .knob{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:.18s}
.evx .toggle.annual .knob{left:27px}
.evx .bill-opt{font-size:14.5px;font-weight:600;color:var(--muted)}
.evx .bill-opt.on{color:var(--navy)}
.evx .save-pill{font-size:12px;font-weight:600;color:var(--blue);background:var(--paper-2);padding:3px 10px;border-radius:100px;border:1px solid var(--line)}
.evx .cur-toggle{display:flex;justify-content:center;margin:18px 0 44px}
.evx .cur-btn{font-size:13px;font-weight:600;color:var(--muted);background:#fff;border:1px solid var(--line);padding:7px 16px;cursor:pointer}
.evx .cur-btn:first-child{border-radius:8px 0 0 8px}
.evx .cur-btn:last-child{border-radius:0 8px 8px 0;border-left:none}
.evx .cur-btn.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.evx .tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;align-items:start}
.evx .tier{background:#fff;border:1px solid var(--line);border-radius:18px;padding:32px 28px;position:relative;transition:.18s}
.evx .tier.feat{border-color:var(--blue);box-shadow:0 18px 50px -22px rgba(46,109,164,.45);transform:translateY(-6px)}
.evx .tier-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--blue);color:#fff;font-size:12px;font-weight:600;padding:5px 16px;border-radius:100px}
.evx .tier-name{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:var(--navy)}
.evx .tier-for{font-size:13.5px;color:var(--muted);margin-top:4px;min-height:38px}
.evx .tier-price{display:flex;align-items:baseline;gap:5px;margin:18px 0 3px}
.evx .tier-price .amt{font-family:'Fraunces',serif;font-size:46px;font-weight:600;color:var(--navy);letter-spacing:-.02em}
.evx .tier-price .per{font-size:14px;color:var(--muted);font-weight:500}
.evx .tier-bill{font-size:13px;color:var(--muted);min-height:18px}
.evx .tier .btn{width:100%;margin:22px 0 24px}
.evx .tier-feat-label{font-size:12.5px;font-weight:600;color:var(--navy);text-transform:uppercase;letter-spacing:.04em;margin-bottom:13px}
.evx .feat-list{list-style:none;display:flex;flex-direction:column;gap:11px;padding:0;margin:0}
.evx .feat-list li{display:flex;gap:10px;font-size:14px;color:#33495d;line-height:1.4}
.evx .feat-list li svg{width:17px;height:17px;flex-shrink:0;color:var(--blue);margin-top:1px}
.evx .min-seat{font-size:12.5px;color:var(--muted);margin-top:16px;padding-top:14px;border-top:1px solid var(--paper-2)}
.evx .seat-note{text-align:center;max-width:680px;margin:0 auto 34px;font-size:14.5px;color:var(--muted);line-height:1.55}
.evx .seat-note strong{color:var(--navy);font-weight:600}
.evx .seat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.evx .seat-tier{background:#fff;border:1px solid var(--line);border-radius:16px;padding:26px 24px;position:relative;transition:.18s;display:flex;flex-direction:column}
.evx .seat-tier:hover{border-color:var(--blue-lt);box-shadow:0 14px 40px -22px rgba(46,109,164,.4);transform:translateY(-3px)}
.evx .seat-tier.feat{border-color:var(--blue);box-shadow:0 18px 50px -22px rgba(46,109,164,.45)}
.evx .seat-users{font-size:13.5px;font-weight:600;color:var(--blue);margin-top:3px}
.evx .seat-tier-for{font-size:13px;color:var(--muted);margin-top:14px;line-height:1.45}
.evx .seat-tier .btn{width:100%;margin-top:6px}
.evx .seat-custom{background:var(--paper-2);border-style:dashed}
.evx .pricing-foot{text-align:center;margin-top:38px;font-size:14.5px;color:var(--muted)}
.evx .pricing-foot strong{color:var(--navy);font-weight:600}
.evx .final{padding:0 0 96px}
.evx .final-card{background:linear-gradient(135deg,var(--navy),var(--blue));border-radius:24px;padding:64px 40px;text-align:center;color:#fff;position:relative;overflow:hidden}
.evx .final-card h2{font-family:'Fraunces',serif;font-size:clamp(30px,4vw,46px);font-weight:600;letter-spacing:-.02em;line-height:1.1;max-width:18ch;margin:0 auto 16px}
.evx .final-card p{color:#dbe6f2;font-size:17px;margin-bottom:30px;max-width:50ch;margin-left:auto;margin-right:auto}
.evx .final-card .hero-note{color:#cdd9e6;margin-top:20px}
.evx .final-card .hero-note svg{color:#fff}
.evx footer{background:var(--navy);color:#9fb3c8;padding:54px 0 30px;border-top:1px solid rgba(255,255,255,.08)}
.evx .foot-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:36px;margin-bottom:40px}
.evx .foot-brand{font-family:'Fraunces',serif;font-size:22px;color:#fff;font-weight:600;display:flex;align-items:center;gap:11px;margin-bottom:14px}
.evx .foot-brand .mark{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:var(--blue-lt);font-family:'Fraunces',serif;font-weight:700;font-size:18px;position:relative}
.evx .foot-brand .mark::after{content:'';position:absolute;top:6px;right:6px;width:4px;height:4px;border-radius:50%;background:#fff}
.evx .foot-tag{font-size:13.5px;color:#7e94aa;max-width:30ch;line-height:1.5}
.evx .foot-col h4{color:#fff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px}
.evx .foot-col a{display:block;color:#9fb3c8;text-decoration:none;font-size:14px;margin-bottom:11px;cursor:pointer}
.evx .foot-col a:hover{color:#fff}
.evx .foot-bottom{border-top:1px solid rgba(255,255,255,.1);padding-top:24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:13px;color:#7e94aa}
@media(max-width:880px){
  .evx .nav-links{display:none}
  .evx .prob-grid,.evx .comp-grid{grid-template-columns:1fr;gap:24px}
  .evx .mod-grid{grid-template-columns:1fr}
  .evx .tiers{grid-template-columns:1fr;gap:18px}
  .evx .seat-grid{grid-template-columns:1fr;gap:14px}
  .evx .tier.feat{transform:none}
  .evx .foot-grid{grid-template-columns:1fr 1fr;gap:28px}
}
@media(prefers-reduced-motion:reduce){.evx *{animation:none!important;transition:none!important}}
`;

const Check = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}><path d="M20 6L9 17l-5-5" /></svg>);

// Seat-bundle pricing — all modules included at every tier.
// Each entry: [monthly, annual] where annual = 2 months free (monthly x 10 / 12 rounded to the charm ending).
const SEAT_TIERS = [
  { name: 'Solo',       users: '1 user',   sub: 'For founders & one-person businesses.' },
  { name: 'Team',       users: '3 users',  sub: 'For small teams getting organised.' },
  { name: 'Business',   users: '5 users',  sub: 'For growing trading & service teams.', popular: true },
  { name: 'Growth',     users: '10 users', sub: 'For scaling operations across departments.' },
  { name: 'Enterprise', users: '15 users', sub: 'For established multi-team businesses.' },
];
const PRICES: any = {
  usd: { sym: '$',   monthly: [18, 35, 59, 107, 143],            annual: [15, 29, 49, 89, 119] },
  omr: { sym: '\uFDFC ', monthly: ['7.900','14.900','22.900','41.900','55.900'], annual: ['5.900','11.900','18.900','34.900','45.900'] },
  lkr: { sym: 'Rs ', monthly: ['4,999','9,999','15,999','28,999','38,999'], annual: ['3,999','7,999','12,999','23,999','31,999'] },
}

const EVX_MODULES = [
  { n: 'Accounting', d: 'General ledger, journals, trial balance — to three decimals.', c: '#2E6DA4', icon: 'M3 3v18h18 M7 14l4-4 3 3 5-6' },
  { n: 'Invoicing', d: 'Sales invoices, receipts and GCC e-invoicing built in.', c: '#2E6DA4', icon: 'M9 7h6 M9 11h6 M9 15h4 M6 2h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z' },
  { n: 'Banking', d: 'Bank accounts, PDC cheques and reconciliation.', c: '#4A9BD2', icon: 'M3 21h18 M5 21V10 M19 21V10 M3 10l9-6 9 6z' },
  { n: 'CRM', d: 'Leads, contacts and pipeline from first touch to close.', c: '#13a89e', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87' },
  { n: 'Sales', d: 'Quotations and delivery notes through the full cycle.', c: '#13a89e', icon: 'M3 17l6-6 4 4 8-8 M21 7v6h-6' },
  { n: 'Purchase', d: 'POs, goods receipt and supplier invoices, matched.', c: '#e08a1e', icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0' },
  { n: 'Inventory', d: 'Multi-location stock with FIFO / average costing.', c: '#13c2c2', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12' },
  { n: 'Assets', d: 'Fixed assets, depreciation and maintenance.', c: '#c2418a', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { n: 'Projects', d: 'Tasks, milestones and project costing.', c: '#7a5af0', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { n: 'Reports', d: 'Financial, sales and stock analytics in real time.', c: '#e0a800', icon: 'M3 3v18h18 M7 16V9 M12 16V5 M17 16v-4' },
  { n: 'Documents', d: 'Central document storage across the platform.', c: '#7a8694', icon: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
];

function ModuleConstellation() {
  const [active, setActive] = useState<number | null>(null);
  const cx = 320, cy = 230, R = 168, Ry = 150;
  const def = { n: 'One platform, every function', d: 'Hover or tap a module to see what it does. They all share the same data, so your numbers, stock and customers stay in sync.' };
  const info = active === null ? def : EVX_MODULES[active];

  return (
    <div className="evx-const">
      <svg viewBox="0 0 640 460" className="evx-const-svg" role="img" aria-label="Envoiso modules connected to a central core">
        {EVX_MODULES.map((m, i) => {
          const ang = (-90 + i * (360 / EVX_MODULES.length)) * Math.PI / 180;
          const x = cx + R * Math.cos(ang), y = cy + Ry * Math.sin(ang);
          return <line key={'l' + i} x1={cx} y1={cy} x2={x} y2={y}
            className={'evx-link' + (active === i ? ' lit' : '')} />;
        })}
        <g style={{ cursor: 'default' }}>
          <circle cx={cx} cy={cy} r={44} fill="#0C2446" />
          <circle cx={cx} cy={cy} r={44} fill="none" stroke="#2E6DA4" strokeWidth={1.5} />
          <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="central"
            style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 30, fill: '#4A9BD2' }}>E</text>
          <text x={cx} y={cy + 24} textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 9, fill: '#9fc4e2', letterSpacing: '.5px' }}>ENVOISO</text>
        </g>
        {EVX_MODULES.map((m, i) => {
          const ang = (-90 + i * (360 / EVX_MODULES.length)) * Math.PI / 180;
          const x = cx + R * Math.cos(ang), y = cy + Ry * Math.sin(ang);
          const on = active === i;
          return (
            <g key={'n' + i} className="evx-node" tabIndex={0} role="button" aria-label={m.n + ': ' + m.d}
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)} onBlur={() => setActive(null)} onClick={() => setActive(i)}>
              <circle cx={x} cy={y} r={26} fill={on ? m.c + '1a' : '#ffffff'} stroke={m.c} strokeWidth={1.5} />
              <g transform={`translate(${x - 9}, ${y - 16})`}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={m.c} strokeWidth={1.8}
                  strokeLinecap="round" strokeLinejoin="round">
                  {m.icon.split(' M').map((seg, k) => <path key={k} d={(k === 0 ? seg : 'M' + seg)} />)}
                </svg>
              </g>
              <text x={x} y={y + 21} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 11, fontWeight: 500, fill: '#5B7186' }}>{m.n}</text>
            </g>
          );
        })}
      </svg>
      <div className="evx-const-info">
        <h4>{info.n}</h4>
        <p>{info.d}</p>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);
  const [cur, setCur] = useState<'usd' | 'omr' | 'lkr'>('usd');

  // Load Fraunces (Inter already loaded by app)
  useEffect(() => {
    const id = 'evx-fraunces';
    if (!document.getElementById(id)) {
      const l = document.createElement('link');
      l.id = id; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  const p = PRICES[cur];
  const priceList = annual ? p.annual : p.monthly;
  const trial = () => navigate('/login');

  return (
    <div className="evx">
      <style>{CSS}</style>

      <nav>
        <div className="wrap nav-in">
          <div className="brand"><span className="mark">E</span>Envoiso</div>
          <div className="nav-links">
            <a onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Product</a>
            <a onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</a>
            <a onClick={() => document.getElementById('compliance')?.scrollIntoView({ behavior: 'smooth' })}>Compliance</a>
            <a onClick={trial} style={{ color: 'var(--navy)', fontWeight: 600 }}>Sign in</a>
          </div>
          <a className="btn btn-primary" onClick={trial}>Start free trial</a>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap">
          <span className="eyebrow"><span className="dot" />Intelligence &middot; Flow &middot; Trust</span>
          <h1 className="hero-h">Your whole business, in <em>one</em> flow.</h1>
          <p className="hero-sub">Envoiso brings accounting, sales, inventory, projects and compliance into a single platform &mdash; so your numbers, stock and customers finally speak to each other. Built for growing businesses, ready for GCC e-invoicing.</p>
          <div className="hero-cta">
            <a className="btn btn-primary btn-lg" onClick={trial}>Start free trial</a>
            <a className="btn btn-ghost btn-lg" onClick={trial}>Watch 2-min tour</a>
          </div>
          <div className="hero-note"><Check />14-day free trial &middot; No credit card required</div>
          <div className="hero-shot">
            <img src="/envoiso_hero_montage.png" alt="Envoiso dashboard, CRM and sales analytics" />
          </div>
        </div>
        <div className="trust">
          <div className="wrap trust-in">
            <span className="trust-label">Trusted by teams across the GCC</span>
            <div className="logo-slot">Your logo</div>
            <div className="logo-slot">Your logo</div>
            <div className="logo-slot">Your logo</div>
            <div className="logo-slot">Your logo</div>
          </div>
        </div>
      </header>

      <section className="prob">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-eyebrow">Why Envoiso</div>
            <h2 className="sec-h">Stop running your business across six disconnected tools</h2>
            <p className="sec-sub">Spreadsheets for accounts, one app for invoices, another for stock, WhatsApp for the sales team. The data never lines up &mdash; and month-end becomes a guessing game.</p>
          </div>
          <div className="prob-grid">
            <div className="prob-before prob-col">
              <h3>Business as usual</h3>
              <ul className="prob-list">
                <li><svg className="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M18 6L6 18M6 6l12 12" /></svg>Accounting in one system, sales in another</li>
                <li><svg className="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M18 6L6 18M6 6l12 12" /></svg>Stock counts that never match the books</li>
                <li><svg className="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M18 6L6 18M6 6l12 12" /></svg>Manual e-invoicing, compliance anxiety</li>
                <li><svg className="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M18 6L6 18M6 6l12 12" /></svg>No single view of cash, receivables or profit</li>
              </ul>
            </div>
            <div className="prob-after prob-col">
              <h3>Business on Envoiso</h3>
              <ul className="prob-list">
                <li><span className="c"><Check /></span>One platform from quote to cash to ledger</li>
                <li><span className="c"><Check /></span>Sales reduce stock and post cost automatically</li>
                <li><span className="c"><Check /></span>GCC e-invoicing built in, compliant by default</li>
                <li><span className="c"><Check /></span>Live dashboards for cash, profit and aging</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mods" id="features">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-eyebrow">One platform, every function</div>
            <h2 className="sec-h">Everything connected, by design</h2>
            <p className="sec-sub">Not a pile of separate apps &mdash; one platform where every module shares the same data, so your numbers, stock and customers always agree.</p>
          </div>
          <ModuleConstellation />
        </div>
      </section>

      <section className="comp" id="compliance">
        <div className="wrap comp-grid">
          <div>
            <div className="sec-eyebrow" style={{ color: 'var(--blue-lt)' }}>Built for the region</div>
            <h2>Compliant in the GCC, by default</h2>
            <p>Envoiso speaks the language of regional finance &mdash; Arabic e-invoicing, OMR to three decimals, multi-currency, and IFRS-standard reporting out of the box. No bolt-ons, no scramble before a deadline.</p>
            <div className="badge-row">
              <div className="cbadge"><Check />E-invoicing ready (Fawtara / UBL 2.1)</div>
              <div className="cbadge"><Check />IFRS financials</div>
              <div className="cbadge"><Check />Multi-currency</div>
              <div className="cbadge"><Check />VAT &amp; tax reporting</div>
            </div>
          </div>
          <div className="comp-stat">
            <div className="row"><span className="lbl">Decimal precision (OMR)</span><span className="big">3</span></div>
            <div className="row"><span className="lbl">Core business modules</span><span className="big">10+</span></div>
            <div className="row"><span className="lbl">Setup to first invoice</span><span className="big">1 day</span></div>
            <div className="row"><span className="lbl">Free trial</span><span className="big">14 days</span></div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-eyebrow">Pricing</div>
            <h2 className="sec-h">Simple plans that grow with you</h2>
            <p className="sec-sub">Start free for 14 days. Add the modules you need, when you need them. No hidden fees, cancel anytime.</p>
          </div>
          <div className="bill-toggle">
            <span className={'bill-opt' + (!annual ? ' on' : '')}>Monthly</span>
            <button className={'toggle' + (annual ? ' annual' : '')} onClick={() => setAnnual(!annual)} aria-label="Toggle billing period"><span className="knob" /></button>
            <span className={'bill-opt' + (annual ? ' on' : '')}>Annual</span>
            <span className="save-pill">14 months for 12</span>
          </div>
          <div className="cur-toggle">
            <button className={'cur-btn' + (cur === 'usd' ? ' on' : '')} onClick={() => setCur('usd')}>USD $</button>
            <button className={'cur-btn' + (cur === 'omr' ? ' on' : '')} onClick={() => setCur('omr')}>OMR &#xFDFC;</button>
            <button className={'cur-btn' + (cur === 'lkr' ? ' on' : '')} onClick={() => setCur('lkr')}>LKR Rs</button>
          </div>
          <div className="seat-note">Every plan includes <strong>all modules</strong> &mdash; accounting, sales, CRM, inventory, purchase, projects, assets and GCC e-invoicing. You only choose your team size.</div>
          <div className="seat-grid">
            {SEAT_TIERS.map((t: any, idx: number) => (
              <div className={'seat-tier' + (t.popular ? ' feat' : '')} key={t.name}>
                {t.popular && <span className="tier-badge">Most popular</span>}
                <div className="tier-name">{t.name}</div>
                <div className="seat-users">{t.users}</div>
                <div className="tier-price"><span className="amt">{p.sym}{priceList[idx]}</span><span className="per">/ mo</span></div>
                <div className="tier-bill">{annual ? 'billed annually · +2 bonus months' : 'billed monthly'}</div>
                <a className={'btn ' + (t.popular ? 'btn-primary' : 'btn-ghost')} onClick={trial}>Start free trial</a>
                <div className="seat-tier-for">{t.sub}</div>
              </div>
            ))}
            <div className="seat-tier seat-custom">
              <div className="tier-name">Custom</div>
              <div className="seat-users">15+ users</div>
              <div className="tier-price"><span className="amt" style={{ fontSize: 30 }}>Let&rsquo;s talk</span></div>
              <div className="tier-bill">tailored to your team</div>
              <a className="btn btn-ghost" onClick={trial}>Contact sales</a>
              <div className="seat-tier-for">For larger teams &amp; multi-entity groups needing custom onboarding.</div>
            </div>
          </div>
          <p className="pricing-foot">All plans include <strong>every module</strong>, <strong>GCC e-invoicing compliance</strong>, IFRS-standard financials, and a <strong>14-day free trial</strong> &mdash; no credit card. {cur === 'lkr' && <strong>Sri Lanka pricing includes a 10% regional discount.</strong>}</p>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <div className="final-card">
            <h2>Bring your business into one flow</h2>
            <p>Join growing teams running finance, sales, stock and projects on a single platform. Set up in a day, free for two weeks.</p>
            <a className="btn btn-white btn-lg" onClick={trial}>Start your free trial</a>
            <div className="hero-note"><Check />No credit card &middot; Cancel anytime</div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="foot-brand"><span className="mark">E</span>Envoiso</div>
              <p className="foot-tag">The all-in-one business platform for growing companies. Intelligence &middot; Flow &middot; Trust.</p>
            </div>
            <div className="foot-col"><h4>Product</h4><a onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Modules</a><a onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</a><a onClick={() => document.getElementById('compliance')?.scrollIntoView({ behavior: 'smooth' })}>Compliance</a></div>
            <div className="foot-col"><h4>Company</h4><a>About</a><a>Contact</a><a>Partners</a></div>
            <div className="foot-col"><h4>Resources</h4><a>Help center</a><a>Guides</a><a>API docs</a></div>
          </div>
          <div className="foot-bottom">
            <span>&copy; 2026 Envoiso. All rights reserved.</span>
            <span>Privacy &middot; Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
