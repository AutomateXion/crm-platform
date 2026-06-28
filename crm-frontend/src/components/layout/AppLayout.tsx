import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Button, Tooltip } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePermissions } from '../../hooks/usePermissions';
import {
  DashboardOutlined, TeamOutlined, SafetyOutlined, SafetyCertificateOutlined, DatabaseOutlined,
  MailOutlined, SettingOutlined, FileTextOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  UserOutlined, LogoutOutlined, KeyOutlined, BellOutlined, GlobalOutlined,
  FunnelPlotOutlined, RiseOutlined, CustomerServiceOutlined,
  NotificationOutlined, BarChartOutlined, FolderOutlined, CalendarOutlined,
  ProjectOutlined, ApartmentOutlined, DollarOutlined,
  CheckCircleOutlined, RollbackOutlined, SwapOutlined, InboxOutlined, CalculatorOutlined,
  ShoppingOutlined, CarOutlined, BankOutlined, ShoppingCartOutlined, ShopOutlined,
  EditOutlined, UnorderedListOutlined, ClockCircleOutlined, FundOutlined, WarningOutlined, UploadOutlined, RocketOutlined, EnvironmentOutlined,
  SyncOutlined, FileSearchOutlined,
} from '@ant-design/icons';
import { logout } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  {
    key: 'crm', icon: <FunnelPlotOutlined />, label: 'CRM',
    children: [
      { key: '/crm/dashboard', icon: <BarChartOutlined />,       label: 'CRM Analytics' },
      { key: '/crm/field-sales', icon: <EnvironmentOutlined />, label: 'Field Sales' },
      { key: '/contacts',   icon: <TeamOutlined />,              label: 'Contacts & Accounts' },
      { key: '/leads',      icon: <FunnelPlotOutlined />,        label: 'Leads' },
      { key: '/sales',      icon: <RiseOutlined />,              label: 'Sales Pipeline' },
      { key: '/activities', icon: <CalendarOutlined />,          label: 'Activities' },
      { key: '/support',    icon: <CustomerServiceOutlined />,   label: 'Support Tickets' },
      { key: '/marketing',  icon: <NotificationOutlined />,      label: 'Marketing' },
    ],
  },
  {
    key: 'pm', icon: <ProjectOutlined />, label: 'Project Management',
    children: [
      { key: '/pm/dashboard', icon: <BarChartOutlined />, label: 'PM Analytics' },
      { key: '/projects', icon: <ApartmentOutlined />, label: 'Projects' },
    ],
  },
  {
    key: 'sales-grp', icon: <DollarOutlined />, label: 'Sales',
    children: [
      { key: '/finance/dashboard',  icon: <BarChartOutlined />,    label: 'Sales Analytics' },
      { key: '/finance/quotations', icon: <FileTextOutlined />,    label: 'Quotations' },
      { key: '/inventory/delivery-notes', icon: <CarOutlined />,   label: 'Delivery Notes' },
      { key: '/finance/invoices',   icon: <DollarOutlined />,      label: 'Sales Invoices' },
      { key: '/finance/receipts',   icon: <CheckCircleOutlined />, label: 'Receipts' },
      { key: '/finance/returns',    icon: <RollbackOutlined />,    label: 'Sales Returns' },
      { key: '/einvoice',           icon: <SafetyCertificateOutlined />, label: 'E-Invoicing (Fawtara)' },
    ],
  },
  {
    key: 'fieldsales-grp', icon: <EnvironmentOutlined />, label: 'Field Sales',
    children: [
      { key: '/crm/field-sales',      icon: <EnvironmentOutlined />, label: 'Visits & Orders' },
      { key: '/field/availability',   icon: <ShopOutlined />,        label: 'Product Availability' },
      { key: '/field/customers',      icon: <TeamOutlined />,        label: 'Customer Snapshot' },
      { key: '/field/quick-order',    icon: <ShoppingCartOutlined />, label: 'Quick Order' },
      { key: '/field/my-orders',      icon: <FileTextOutlined />,    label: 'My Orders' },
      { key: '/field/collections',    icon: <DollarOutlined />,      label: 'Collections' },
      { key: '/field/collect',        icon: <DollarOutlined />,      label: 'Record Collection' },
    ],
  },
  {
        key: 'purchase-grp', icon: <ShoppingCartOutlined />, label: 'Purchase',
    children: [
      { key: '/purchase/suppliers', icon: <ShopOutlined />,        label: 'Suppliers' },
      { key: '/purchase/rfqs',      icon: <FileSearchOutlined />,  label: 'RFQ / Quotations' },
      { key: '/purchase/orders',    icon: <FileTextOutlined />,    label: 'Purchase Orders' },
      { key: '/purchase/grn',       icon: <InboxOutlined />,       label: 'Goods Receipt' },
      { key: '/purchase/invoices',  icon: <DollarOutlined />,      label: 'Purchase Invoices' },
      { key: '/purchase/payments',  icon: <CheckCircleOutlined />, label: 'Payment Vouchers' },
      { key: '/purchase/returns',   icon: <RollbackOutlined />,    label: 'Purchase Returns' },
    ],
  },
  {
    key: 'banking-grp', icon: <BankOutlined />, label: 'Banking & Cash',
    children: [
      { key: '/finance/bank-accounts',     icon: <BankOutlined />,        label: 'Bank Accounts' },
      { key: '/finance/received-cheques',  icon: <ClockCircleOutlined />, label: 'Received Cheques (PDC)' },
      { key: '/finance/bank-reconciliation', icon: <SwapOutlined />,      label: 'Bank Reconciliation' },
    ],
  },
  {
    key: 'accounting-grp', icon: <CalculatorOutlined />, label: 'Accounting',
    children: [
      { key: '/finance/chart-of-accounts', icon: <BankOutlined />,     label: 'Chart of Accounts' },
      { key: '/finance/journal-vouchers',  icon: <EditOutlined />,     label: 'Journal Vouchers' },
      { key: '/finance/exchange-rates',    icon: <SwapOutlined />,     label: 'Exchange Rates' },
      { key: '/finance/general-ledger',    icon: <UnorderedListOutlined />, label: 'General Ledger' },
      { key: '/finance/trial-balance',     icon: <FundOutlined />,     label: 'Trial Balance' },
      { key: '/reports/account-ledger',    icon: <FileTextOutlined />, label: 'Account Ledger' },
    ],
  },
  {
    key: 'inventory', icon: <InboxOutlined />, label: 'Inventory & Warehouse',
    children: [
      { key: '/inventory/dashboard', icon: <BarChartOutlined />, label: 'Inventory Analytics' },
      { key: '/inventory/products',  icon: <ShoppingOutlined />, label: 'Products & Services' },
      {
        key: 'warehouse-mgmt', icon: <FolderOutlined />, label: 'Warehouse Management',
        children: [
          { key: '/warehouse/warehouses',  label: 'Warehouses' },
          { key: '/warehouse/locations',   label: 'Locations / Bins' },
          { key: '/warehouse/transfers',   label: 'Stock Transfers' },
          { key: '/warehouse/adjustments', label: 'Stock Adjustments' },
        ],
      },
    ],
  },
  {
    key: 'assets-grp', icon: <DatabaseOutlined />, label: 'Assets',
    children: [
      { key: '/assets/fixed',       icon: <BankOutlined />, label: 'Fixed Assets' },
      { key: '/assets/consumables', icon: <CalculatorOutlined />, label: 'Consumables' },
    ],
  },
  {
    key: 'reports-grp', icon: <BarChartOutlined />, label: 'Reports',
    children: [
      { key: 'rep-financial', icon: <FolderOutlined />, label: 'Financial', children: [
        { key: '/finance/profit-loss',            label: 'Profit & Loss' },
        { key: '/finance/balance-sheet',          label: 'Balance Sheet' },
        { key: '/finance/cash-flow',              label: 'Cash Flow' },
        { key: '/finance/ar-aging',               label: 'AR Aging' },
        { key: '/finance/ap-aging',               label: 'AP Aging' },
        { key: '/finance/vat-return',             label: 'VAT Return' },
        { key: '/finance/budget-vs-actual',       label: 'Budget vs Actual' },
        { key: '/finance/liquidation-projection', label: 'Liquidation Projection' },
        { key: '/finance/credit-risk',            label: 'Credit Risk' },
      ]},
      { key: 'rep-sales', icon: <FolderOutlined />, label: 'Sales', children: [
        { key: '/finance/daily-report',    label: 'Daily Sales Report' },
        { key: '/reports/sales-vs-target', label: 'Sales vs Target' },
        { key: '/reports/salesman',        label: 'Salesman Performance' },
        { key: '/reports/sales-report',    label: 'Sales Report' },
        { key: '/reports/purchase-report', label: 'Purchase Report' },
        { key: '/reports/sales-purchase',  label: 'Sales & Purchase Reports' },
      ]},
      { key: 'rep-inventory', icon: <FolderOutlined />, label: 'Inventory / Stock', children: [
        { key: '/reports/stock-movement',     label: 'Stock Movement' },
        { key: '/reports/item-profile',       label: 'Item Profile & History' },
        { key: '/reports/stock-summary',      label: 'Stock Summary' },
        { key: '/reports/stock-by-location',  label: 'Stock by Location' },
        { key: '/reports/stock-valuation',    label: 'Stock Valuation' },
        { key: '/reports/reorder-management', label: 'Reorder Management' },
      ]},
      { key: 'rep-crm', icon: <FolderOutlined />, label: 'CRM', children: [
        { key: '/reports', label: 'CRM Reports' },
      ]},
    ],
  },
  {
    key: 'docs-grp', icon: <FolderOutlined />, label: 'Documents',
    children: [
      { key: '/documents', icon: <FolderOutlined />, label: 'All Documents' },
    ],
  },
  {
    key: 'admin', icon: <SettingOutlined />, label: 'Administration',
    children: [
      { key: '/users',             icon: <UserOutlined />,    label: 'Users' },
      { key: '/user-groups',       icon: <TeamOutlined />,    label: 'User Groups' },
      { key: '/admin/import-export', icon: <UploadOutlined />, label: 'Import / Export' },
      { key: '/onboarding', icon: <RocketOutlined />, label: 'Onboarding' },
      { key: '/recurring-expenses', icon: <SyncOutlined />, label: 'Recurring Expenses' },
      { key: '/superadmin', icon: <SafetyCertificateOutlined />, label: '🛡️ Super Admin' },
      { key: '/admin/company-settings', icon: <ShopOutlined />, label: 'Company Settings' },
      { key: '/admin/accounting-config', icon: <SettingOutlined />, label: 'Accounting Configuration' },
      { key: '/admin/document-config', icon: <SettingOutlined />, label: 'Document Configuration' },
      { key: '/admin/email-config', icon: <MailOutlined />, label: 'Email Configuration' },
      { key: '/permissions',  icon: <SafetyOutlined />,  label: 'Permissions' },
      { key: '/masters',      icon: <DatabaseOutlined />,label: 'Master Data' },
      { key: '/settings',     icon: <SettingOutlined />, label: 'Settings' },
      { key: '/audit',        icon: <FileTextOutlined />,label: 'Audit Trail' },
    ],
  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 992);
  const [mobileOpen, setMobileOpen] = useState(false);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccessModule, canAccessPage } = usePermissions();
  const fieldPageCodes: Record<string, { sub: string; code: string }> = {
    '/field/availability': { sub: 'field_info', code: 'fs_availability' },
    '/field/customers':    { sub: 'field_info', code: 'fs_customers' },
    '/field/my-orders':    { sub: 'field_info', code: 'fs_my_orders' },
    '/field/collections':  { sub: 'field_info', code: 'fs_collections' },
    '/field/collect':      { sub: 'field_actions', code: 'fs_record_collection' },
    '/field/quick-order':  { sub: 'field_actions', code: 'fs_quick_order' },
  };
  const filteredNav = (NAV_ITEMS as any[]).map((grp: any) => {
    if (grp?.key !== 'fieldsales-grp') return grp;
    if (!canAccessModule('field_sales')) return null; // hide whole group
    const children = (grp.children || []).filter((it: any) => {
      const m = fieldPageCodes[it.key];
      if (!m) return true; // non-gated item (e.g. legacy Field Sales link) stays
      return canAccessPage('field_sales', m.sub, m.code);
    });
    return children.length ? { ...grp, children } : null;
  }).filter(Boolean);

  const dispatch = useDispatch<AppDispatch>();
  const { user, tenant } = useSelector((s: RootState) => s.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'My Profile' },
      { key: 'password', icon: <KeyOutlined />, label: 'Change Password' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ],
    onClick: ({ key }: any) => { if (key === 'logout') handleLogout(); },
  };

  // Determine active menu key — handle /projects/:id -> highlight /projects
  const activeKey = location.pathname.startsWith('/projects/') ? '/projects' : location.pathname;

  const allItems = NAV_ITEMS.flatMap(i => (i as any).children || [i]);
  const pageLabel = allItems.find(i => i.key === activeKey)?.label || 'Dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <Sider
        collapsible collapsed={isMobile ? false : collapsed} onCollapse={setCollapsed}
        trigger={null} width={240}
        style={{ background: '#001529', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, overflow: 'auto',
          transform: isMobile && !mobileOpen ? 'translateX(-240px)' : 'translateX(0)', transition: 'transform 0.2s' }}
      >
        {/* Logo */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px', borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <img src="/envoiso_icon_192.png" alt="Envoiso"
            style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, objectFit: 'contain' }} />
          {!collapsed && (
            <div style={{ marginLeft: 10 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                {tenant?.companyName || 'Envoiso'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                {tenant?.subscriptionPlan || 'Powered by Envoiso'}
              </div>
            </div>
          )}
        </div>

        <Menu
          theme="dark" mode="inline" selectedKeys={[activeKey]}
          defaultOpenKeys={[]}
          items={filteredNav}
          onClick={({ key }) => { if (key.startsWith('/')) { navigate(key); if (isMobile) setMobileOpen(false); } }}
          style={{ borderRight: 0, marginTop: 8 }}
        />


      </Sider>
      {isMobile && mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99 }} />
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 240), transition: 'margin-left 0.2s' }}>
        {/* ─── Header ─────────────────────────────────────────── */}
        <Header style={{
          background: '#fff', padding: '0 16px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 99,
        }}>
          <Space>
            <Button type="text" icon={(isMobile ? mobileOpen : !collapsed) ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed)}
              style={{ fontSize: 18, color: '#595959', marginRight: 4, flexShrink: 0 }} />
            <Text style={{ fontSize: 18, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '45vw', display: 'inline-block', lineHeight: '64px' }}>{pageLabel}</Text>
          </Space>

          <Space size={isMobile ? 8 : 16}>
            <Tooltip title="Notifications">
              <Badge count={3} size="small">
                <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
              </Badge>
            </Tooltip>
            <Tooltip title="Language">
              <Button type="text" icon={<GlobalOutlined style={{ fontSize: 18 }} />} />
            </Tooltip>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ background: 'linear-gradient(135deg, #0C2446, #2E6DA4)' }}>
                  {user?.fullName?.[0]?.toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{user?.groupCode}</div>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* ─── Content ─────────────────────────────────────────── */}
        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
