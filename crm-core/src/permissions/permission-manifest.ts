// ============================================================================
// PERMISSION MANIFEST — single source of truth for the app's permission tree.
// Add a new module/sub-module/page HERE and it auto-registers on sync.
// Idempotent: syncing never destroys existing grants.
// ============================================================================
export interface ManifestField  { code: string; label: string; type?: string; sort?: number; }
export interface ManifestPage   { code: string; name: string; route?: string; sort?: number; fields?: ManifestField[]; }
export interface ManifestSub     { code: string; name: string; sort?: number; pages: ManifestPage[]; }
export interface ManifestModule  { code: string; name: string; sort?: number; subModules: ManifestSub[]; }

export const PERMISSION_MANIFEST: ManifestModule[] = [
  { code: 'contacts', name: 'Contacts & Accounts', sort: 1, subModules: [
    { code: 'contacts_main', name: 'Contacts & Accounts', pages: [
      { code: 'customers', name: 'Customers / Accounts', route: '/contacts', sort: 1, fields: [{ code: 'cust_credit_limit_pg', label: 'Credit Limit', type: 'amount' }, { code: 'cust_pricing', label: 'Special Pricing', type: 'amount' }] },
      { code: 'contacts_people', name: 'Contacts (People)', route: '/contacts', sort: 2 },
    ]},
  ]},
  { code: 'leads', name: 'Leads & Pipeline', sort: 2, subModules: [
    { code: 'leads_main', name: 'Leads & Pipeline', pages: [
      { code: 'leads', name: 'Leads', route: '/leads', sort: 1 },
      { code: 'sales_pipeline', name: 'Sales Pipeline', route: '/sales', sort: 2 },
    ]},
  ]},
  { code: 'activities', name: 'Activities & Calendar', sort: 4, subModules: [
    { code: 'activities_main', name: 'Activities', pages: [
      { code: 'activities', name: 'Activities', route: '/activities', sort: 1 },
    ]},
  ]},
  { code: 'support', name: 'Customer Support', sort: 5, subModules: [
    { code: 'support_main', name: 'Support', pages: [
      { code: 'support_tickets', name: 'Support Tickets', route: '/support', sort: 1 },
    ]},
  ]},
  { code: 'marketing', name: 'Marketing Campaigns', sort: 6, subModules: [
    { code: 'marketing_main', name: 'Marketing', pages: [
      { code: 'marketing', name: 'Marketing', route: '/marketing', sort: 1 },
    ]},
  ]},
  { code: 'crm', name: 'CRM', sort: 20, subModules: [
    { code: 'crm_main', name: 'CRM', pages: [
      { code: 'crm_analytics', name: 'CRM Analytics', route: '/crm/dashboard', sort: 1 },
      { code: 'crm_reports', name: 'CRM Reports', route: '/reports', sort: 2 },
    ]},
  ]},
  { code: 'pm', name: 'Project Management', sort: 23, subModules: [
    { code: 'pm_main', name: 'Project Management', pages: [
      { code: 'pm_analytics', name: 'PM Analytics', route: '/pm/dashboard', sort: 1 },
      { code: 'projects', name: 'Projects', route: '/projects', sort: 2 },
    ]},
  ]},
  { code: 'sales', name: 'Sales', sort: 21, subModules: [
    { code: 'sales_main', name: 'Sales', pages: [
      { code: 'sales_analytics', name: 'Sales Analytics', route: '/finance/dashboard', sort: 1 },
      { code: 'einvoicing', name: 'E-Invoicing (Fawtara)', route: '/einvoice', sort: 8 },
    ]},
    { code: 'sales_documents', name: 'Sales Documents', pages: [
      { code: 'vch_quotation',     name: 'Quotation',     route: '/finance/quotations',       sort: 1, fields: [{ code: 'quo_cost', label: 'Cost / Purchase Price', type: 'amount' }, { code: 'quo_margin', label: 'Margin / Profit', type: 'amount' }, { code: 'quo_discount', label: 'Discount', type: 'amount' }] },
      { code: 'vch_sales_order',   name: 'Sales Order',   route: '/field/quick-order',        sort: 2 },
      { code: 'vch_delivery_note', name: 'Delivery Note', route: '/inventory/delivery-notes', sort: 3 },
      { code: 'vch_sales_return',  name: 'Sales Return',  route: '/finance/returns',          sort: 4 },
    ]},
  ]},
  { code: 'invoicing', name: 'Invoicing', sort: 11, subModules: [
    { code: 'invoicing_documents', name: 'Invoicing Documents', pages: [
      { code: 'vch_sales_invoice', name: 'Sales Invoice', route: '/finance/invoices', sort: 1, fields: [{ code: 'inv_cost', label: 'Cost / Purchase Price', type: 'amount' }, { code: 'inv_margin', label: 'Margin / Profit', type: 'amount' }, { code: 'inv_discount', label: 'Discount', type: 'amount' }, { code: 'inv_approve', label: 'Approve / Post', type: 'action' }] },
    ]},
  ]},
  { code: 'banking', name: 'Banking & Cash', sort: 12, subModules: [
    { code: 'banking_main', name: 'Banking & Cash', pages: [
      { code: 'bank_accounts',       name: 'Bank Accounts',        route: '/finance/bank-accounts',       sort: 1 },
      { code: 'received_cheques',    name: 'Received Cheques (PDC)',route: '/finance/received-cheques',    sort: 2 },
      { code: 'bank_reconciliation', name: 'Bank Reconciliation',  route: '/finance/bank-reconciliation', sort: 3 },
    ]},
    { code: 'banking_documents', name: 'Banking Documents', pages: [
      { code: 'vch_receipt',         name: 'Receipt',         route: '/finance/receipts', sort: 1 },
      { code: 'vch_payment_voucher', name: 'Payment Voucher', route: '/purchase/payments', sort: 2, fields: [{ code: 'pay_approve', label: 'Approve Payment', type: 'action' }] },
    ]},
  ]},
  { code: 'accounting', name: 'Accounting & Finance', sort: 10, subModules: [
    { code: 'accounting_main', name: 'Accounting', pages: [
      { code: 'chart_of_accounts', name: 'Chart of Accounts', route: '/finance/chart-of-accounts', sort: 1 },
      { code: 'exchange_rates',    name: 'Exchange Rates',    route: '/finance/exchange-rates',    sort: 2 },
      { code: 'general_ledger',    name: 'General Ledger',    route: '/finance/general-ledger',    sort: 3 },
      { code: 'trial_balance',     name: 'Trial Balance',     route: '/finance/trial-balance',     sort: 4 },
      { code: 'account_ledger',    name: 'Account Ledger',    route: '/reports/account-ledger',    sort: 5 },
    ]},
    { code: 'accounting_documents', name: 'Accounting Documents', pages: [
      { code: 'vch_journal_voucher', name: 'Journal Voucher', route: '/finance/journal-vouchers', sort: 1, fields: [{ code: 'jv_approve', label: 'Post Journal', type: 'action' }] },
    ]},
  ]},
  { code: 'purchase', name: 'Purchase', sort: 22, subModules: [
    { code: 'purchase_main', name: 'Purchase', pages: [
      { code: 'suppliers', name: 'Suppliers',        route: '/purchase/suppliers', sort: 1 },
      { code: 'rfq',       name: 'RFQ / Quotations', route: '/purchase/rfqs',      sort: 2 },
    ]},
    { code: 'purchase_documents', name: 'Purchase Documents', pages: [
      { code: 'vch_purchase_order',   name: 'Purchase Order',   route: '/purchase/orders',   sort: 1, fields: [{ code: 'po_approve', label: 'Approve PO', type: 'action' }] },
      { code: 'vch_grn',              name: 'Goods Receipt',    route: '/purchase/grn',      sort: 2 },
      { code: 'vch_purchase_invoice', name: 'Purchase Invoice', route: '/purchase/invoices', sort: 3 },
      { code: 'vch_purchase_return',  name: 'Purchase Return',  route: '/purchase/returns',  sort: 4 },
    ]},
  ]},
  { code: 'inventory', name: 'Inventory & Warehouse', sort: 24, subModules: [
    { code: 'inventory_main', name: 'Inventory', pages: [
      { code: 'inventory_analytics', name: 'Inventory Analytics', route: '/inventory/dashboard', sort: 1 },
      { code: 'products',            name: 'Products & Services', route: '/inventory/products', sort: 2, fields: [{ code: 'prod_cost', label: 'Cost Price', type: 'amount' }, { code: 'prod_margin', label: 'Margin %', type: 'amount' }] },
      { code: 'warehouses',          name: 'Warehouses',          route: '/warehouse/warehouses', sort: 3 },
      { code: 'locations',           name: 'Locations / Bins',    route: '/warehouse/locations', sort: 4 },
    ]},
    { code: 'inventory_documents', name: 'Inventory Documents', pages: [
      { code: 'vch_stock_transfer',   name: 'Stock Transfer',   route: '/warehouse/transfers',   sort: 1 },
      { code: 'vch_stock_adjustment', name: 'Stock Adjustment', route: '/warehouse/adjustments', sort: 2 },
    ]},
  ]},
  { code: 'assets', name: 'Assets', sort: 25, subModules: [
    { code: 'assets_main', name: 'Assets', pages: [
      { code: 'fixed_assets', name: 'Fixed Assets', route: '/assets/fixed',       sort: 1 },
      { code: 'consumables',  name: 'Consumables',  route: '/assets/consumables', sort: 2 },
    ]},
  ]},
  { code: 'reports', name: 'Reports & Analytics', sort: 26, subModules: [
    { code: 'reports_financial', name: 'Financial Reports', pages: [
      { code: 'rpt_profit_loss',   name: 'Profit & Loss',          route: '/finance/profit-loss',            sort: 1 },
      { code: 'rpt_balance_sheet', name: 'Balance Sheet',          route: '/finance/balance-sheet',          sort: 2 },
      { code: 'rpt_cash_flow',     name: 'Cash Flow',              route: '/finance/cash-flow',              sort: 3 },
      { code: 'rpt_ar_aging',      name: 'AR Aging',               route: '/finance/ar-aging',               sort: 4 },
      { code: 'rpt_ap_aging',      name: 'AP Aging',               route: '/finance/ap-aging',               sort: 5 },
      { code: 'rpt_vat_return',    name: 'VAT Return',             route: '/finance/vat-return',             sort: 6 },
      { code: 'rpt_budget_actual', name: 'Budget vs Actual',       route: '/finance/budget-vs-actual',       sort: 7 },
      { code: 'rpt_liquidation',   name: 'Liquidation Projection', route: '/finance/liquidation-projection', sort: 8 },
      { code: 'rpt_credit_risk',   name: 'Credit Risk',            route: '/finance/credit-risk',            sort: 9 },
    ]},
    { code: 'reports_sales', name: 'Sales Reports', pages: [
      { code: 'rpt_daily_sales',     name: 'Daily Sales Report',   route: '/finance/daily-report',    sort: 1 },
      { code: 'rpt_sales_target',    name: 'Sales vs Target',      route: '/reports/sales-vs-target', sort: 2 },
      { code: 'rpt_salesman',        name: 'Salesman Performance', route: '/reports/salesman',        sort: 3 },
      { code: 'rpt_sales_report',    name: 'Sales Report',         route: '/reports/sales-report',    sort: 4 },
      { code: 'rpt_purchase_report', name: 'Purchase Report',      route: '/reports/purchase-report', sort: 5 },
      { code: 'rpt_sales_purchase',  name: 'Sales & Purchase',     route: '/reports/sales-purchase',  sort: 6 },
    ]},
    { code: 'reports_inventory', name: 'Inventory Reports', pages: [
      { code: 'rpt_stock_movement',  name: 'Stock Movement',     route: '/reports/stock-movement',     sort: 1 },
      { code: 'rpt_item_profile',    name: 'Item Profile',       route: '/reports/item-profile',       sort: 2 },
      { code: 'rpt_stock_summary',   name: 'Stock Summary',      route: '/reports/stock-summary',      sort: 3 },
      { code: 'rpt_stock_location',  name: 'Stock by Location',  route: '/reports/stock-by-location',  sort: 4 },
      { code: 'rpt_stock_valuation', name: 'Stock Valuation',    route: '/reports/stock-valuation',    sort: 5 },
      { code: 'rpt_reorder',         name: 'Reorder Management', route: '/reports/reorder-management', sort: 6 },
    ]},
  ]},
  { code: 'documents', name: 'Document Management', sort: 13, subModules: [
    { code: 'documents_main', name: 'Documents', pages: [
      { code: 'all_documents', name: 'All Documents', route: '/documents', sort: 1 },
    ]},
  ]},
  { code: 'core', name: 'Administration', sort: 0, subModules: [
    { code: 'admin_main', name: 'Administration', pages: [
      { code: 'users',              name: 'Users',              route: '/users',                   sort: 1 },
      { code: 'user_groups',        name: 'User Groups',        route: '/user-groups',             sort: 2 },
      { code: 'import_export',      name: 'Import / Export',    route: '/admin/import-export',     sort: 3 },
      { code: 'onboarding',         name: 'Onboarding',         route: '/onboarding',              sort: 4 },
      { code: 'recurring_expenses', name: 'Recurring Expenses', route: '/recurring-expenses',      sort: 5 },
      { code: 'company_settings',   name: 'Company Settings',   route: '/admin/company-settings',  sort: 6 },
      { code: 'accounting_config',  name: 'Accounting Config',  route: '/admin/accounting-config', sort: 7 },
      { code: 'document_config',    name: 'Document Config',    route: '/admin/document-config',   sort: 8 },
      { code: 'email_config',       name: 'Email Config',       route: '/admin/email-config',      sort: 9 },
      { code: 'permissions',        name: 'Permissions',        route: '/permissions',             sort: 10 },
      { code: 'master_data',        name: 'Master Data',        route: '/masters',                 sort: 11 },
      { code: 'settings',           name: 'Settings',           route: '/settings',                sort: 12 },
      { code: 'superadmin',         name: 'Super Admin',        route: '/superadmin',              sort: 13 },
    ]},
  ]},
];
