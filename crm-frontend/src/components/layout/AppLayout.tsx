import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Button, Tooltip } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DashboardOutlined, TeamOutlined, SafetyOutlined, SafetyCertificateOutlined, DatabaseOutlined,
  MailOutlined, SettingOutlined, FileTextOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  UserOutlined, LogoutOutlined, KeyOutlined, BellOutlined, GlobalOutlined,
  FunnelPlotOutlined, RiseOutlined, CustomerServiceOutlined,
  NotificationOutlined, BarChartOutlined, FolderOutlined, CalendarOutlined,
  ProjectOutlined, ApartmentOutlined, DollarOutlined,
  CheckCircleOutlined, RollbackOutlined, SwapOutlined, InboxOutlined, CalculatorOutlined,
  ShoppingOutlined, CarOutlined, BankOutlined, ShoppingCartOutlined, ShopOutlined,
  EditOutlined, UnorderedListOutlined, ClockCircleOutlined, FundOutlined, WarningOutlined, UploadOutlined, EnvironmentOutlined,
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
      { key: '/sales',      icon: <RiseOutlined />,              label: 'Sales' },
      { key: '/activities', icon: <CalendarOutlined />,          label: 'Activities' },
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
    key: 'finance', icon: <DollarOutlined />, label: 'Finance',
    children: [
      { key: '/finance/dashboard',         icon: <BarChartOutlined />,    label: 'Finance Analytics' },
      { key: '/finance/quotations',        icon: <FileTextOutlined />,    label: 'Quotations' },
      { key: '/finance/invoices',          icon: <DollarOutlined />,      label: 'Sales Invoices' },
      { key: '/finance/receipts',          icon: <CheckCircleOutlined />, label: 'Receipts' },
      { key: '/finance/returns',           icon: <RollbackOutlined />,    label: 'Sales Returns' },
      { key: '/finance/exchange-rates',    icon: <SwapOutlined />,        label: 'Exchange Rates' },
      { key: '/finance/chart-of-accounts', icon: <BankOutlined />,        label: 'Chart of Accounts' },
      { key: '/einvoice', icon: <SafetyCertificateOutlined />, label: '🧾 E-Invoicing (Fawtara)' },
      { key: '/finance/journal-vouchers',  icon: <EditOutlined />,        label: 'Journal Vouchers' },
      { key: '/finance/bank-accounts',     icon: <BankOutlined />,        label: 'Bank Accounts' },
    ],
  },
  {
    key: 'inventory', icon: <InboxOutlined />, label: 'Inventory & Warehouse',
    children: [
      { key: '/inventory/dashboard',      icon: <BarChartOutlined />,    label: 'Inventory Analytics' },
      {
        key: 'warehouse-mgmt',
        icon: <FolderOutlined />,
        label: '🏭 Warehouse Management',
        children: [
          { key: '/warehouse/warehouses',    label: 'Warehouses' },
          { key: '/warehouse/locations',     label: 'Locations / Bins' },
          { key: '/warehouse/transfers',     label: 'Stock Transfers' },
          { key: '/warehouse/adjustments',   label: 'Stock Adjustments' },
        ],
      },
      { key: '/inventory/products',       icon: <ShoppingOutlined />,    label: 'Products & Services' },
      { key: '/inventory/delivery-notes', icon: <CarOutlined />,         label: 'Delivery Notes' },
      {
        key: 'purchase-sub',
        icon: <FolderOutlined />,
        label: '🛒 Purchase',
        children: [
          { key: '/purchase/suppliers', label: 'Suppliers' },
          { key: '/purchase/orders',    label: 'Purchase Orders' },
          { key: '/purchase/grn',       label: 'Goods Receipt' },
          { key: '/purchase/invoices',  label: 'Purchase Invoices' },
          { key: '/purchase/payments',  label: 'Payment Vouchers' },
          { key: '/purchase/returns',   label: 'Purchase Returns' },
        ],
      },
    ],
  },
  {
    key: 'ext', icon: <CustomerServiceOutlined />, label: 'Extended',
    children: [
      { key: '/assets/fixed',        icon: <BankOutlined />,  label: '🏭 Fixed Assets' },
      { key: '/assets/consumables',   icon: <BankOutlined />,  label: '🔧 Consumables' },
      { key: '/support',    icon: <CustomerServiceOutlined />,   label: 'Support Tickets' },
      { key: '/marketing',  icon: <NotificationOutlined />,      label: 'Marketing' },
      { key: 'reports-group', icon: <BarChartOutlined />, label: '📊 Reports', children: [
        { key: 'rep-financial', icon: <FolderOutlined />, label: 'Financial', children: [
          { key: '/finance/general-ledger',         label: 'General Ledger' },
          { key: '/finance/trial-balance',          label: 'Trial Balance' },
          { key: '/finance/profit-loss',            label: 'Profit & Loss' },
          { key: '/finance/balance-sheet',          label: 'Balance Sheet' },
          { key: '/finance/cash-flow',              label: 'Cash Flow' },
          { key: '/finance/ar-aging',               label: 'AR Aging' },
          { key: '/finance/ap-aging',               label: 'AP Aging' },
          { key: '/finance/vat-return',             label: 'VAT Return' },
          { key: '/finance/budget-vs-actual',       label: 'Budget vs Actual' },
          { key: '/finance/bank-reconciliation',    label: 'Bank Reconciliation' },
          { key: '/finance/liquidation-projection', label: 'Liquidation Projection' },
          { key: '/finance/credit-risk',            label: 'Credit Risk' },
          { key: '/reports/account-ledger',         label: 'Account Ledger' },
          { key: '/reports/outstanding-agewise',          label: 'Outstanding – Agewise ·soon' },
          { key: '/reports/outstanding-salesman',         label: 'Outstanding – Salesman ·soon' },
          { key: '/reports/outstanding-customer-group',   label: 'Outstanding – Customer Group ·soon' },
          { key: '/reports/sales-register',         label: 'Sales Register ·soon' },
          { key: '/reports/cash-register',          label: 'Cash Register ·soon' },
          { key: '/reports/bank-register',          label: 'Bank Register ·soon' },
          { key: '/reports/petty-cash-book',        label: 'Petty Cash Book ·soon' },
          { key: '/reports/bank-book',              label: 'Bank Book (Monthly) ·soon' },
          { key: '/reports/pdc-report',             label: 'PDC Report ·soon' },
          { key: '/reports/cheque-book',            label: 'Cheque Book Mgmt ·soon' },
          { key: '/reports/cash-flow-projection',   label: 'Cash Flow Projection ·soon' },
          { key: '/reports/collection-projection',  label: 'Collection Projection ·soon' },
          { key: '/reports/monthly-cash-management',label: 'Monthly Cash Mgmt ·soon' },
        ]},
        { key: 'rep-sales', icon: <FolderOutlined />, label: 'Sales', children: [
          { key: '/finance/daily-report',         label: 'Daily Sales Report' },
          { key: '/reports/sales-vs-target',      label: '🎯 Sales vs Target' },
          { key: '/reports/salesman',             label: 'Salesman Performance' },
          { key: '/reports/sales-report',         label: '📈 Sales Report' },
          { key: '/reports/purchase-report',      label: '📦 Purchase Report' },
          { key: '/reports/sales-purchase',       label: 'Sales & Purchase Reports' },
        ]},
        { key: 'rep-inventory', icon: <FolderOutlined />, label: 'Inventory / Stock', children: [
          { key: '/reports/stock-movement',           label: 'Stock Movement' },
          { key: '/reports/item-profile',             label: 'Item Profile & History' },
          { key: '/reports/stock-summary',            label: 'Stock Summary' },
          { key: '/reports/net-stock-available',      label: 'Net Stock Available ·soon' },
          { key: '/reports/stock-in-transit',         label: 'Stock in Transit ·soon' },
          { key: '/reports/stock-by-location',        label: 'Stock by Location ·soon' },
          { key: '/reports/stock-aging',              label: 'Stock Aging ·soon' },
          { key: '/reports/item-sales-purchase-history', label: 'Item Sales/Purchase History ·soon' },
          { key: '/reports/stock-expiry',             label: 'Stock Expiry ·soon' },
          { key: '/reports/batch-expiry',             label: 'Batch Expiry ·soon' },
          { key: '/reports/physical-stock-variation', label: 'Physical Stock Variation ·soon' },
          { key: '/reports/stock-valuation',          label: 'Stock Valuation (FIFO/WA) ·soon' },
          { key: '/reports/reorder-management',       label: 'Reorder Management' },
          { key: '/reports/dn-vs-so',                 label: 'DN vs Sales Order ·soon' },
          { key: '/reports/partial-delivery',         label: 'Partial Delivery ·soon' },
          { key: '/reports/partial-receipt',          label: 'Partial Receipt ·soon' },
        ]},
        { key: 'rep-crm', icon: <FolderOutlined />, label: 'CRM', children: [
          { key: '/reports', label: 'CRM Reports' },
        ]},
    ]},
      { key: '/documents',  icon: <FolderOutlined />,            label: 'Documents' },
    ],
  },
  {
    key: 'admin', icon: <SettingOutlined />, label: 'Administration',
    children: [
      { key: '/users',             icon: <UserOutlined />,    label: 'Users' },
      { key: '/user-groups',       icon: <TeamOutlined />,    label: 'User Groups' },
      { key: '/admin/import-export', icon: <UploadOutlined />, label: 'Import / Export' },
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
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1890ff, #722ed1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>C</div>
          {!collapsed && (
            <div style={{ marginLeft: 10 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                {tenant?.companyName || 'CRM Platform'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                {tenant?.subscriptionPlan}
              </div>
            </div>
          )}
        </div>

        <Menu
          theme="dark" mode="inline" selectedKeys={[activeKey]}
          defaultOpenKeys={[]}
          items={NAV_ITEMS}
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
                <Avatar style={{ background: 'linear-gradient(135deg, #1890ff, #722ed1)' }}>
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
