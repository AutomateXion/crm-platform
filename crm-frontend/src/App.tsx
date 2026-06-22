import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import AppLayout from './components/layout/AppLayout';
import ComingSoon from './pages/ComingSoon';
import StockByLocationPage from './pages/reports/StockByLocationPage';
import StockValuationPage from './pages/reports/StockValuationPage';
import ReceivedChequesPage from './pages/finance/ReceivedChequesPage';
import StockSummaryReport from './pages/reports/StockSummaryReport';
import SalesReport from './pages/reports/SalesReport';
import PurchaseReport from './pages/reports/PurchaseReport';
import ReorderManagementReport from './pages/reports/ReorderManagementReport';
// Auth
import LoginPage from './pages/auth/LoginPage';
import WelcomePage from './pages/marketing/WelcomePage';
import FeaturesPage from './pages/marketing/FeaturesPage';
// Core
import DashboardPage    from './pages/dashboard/DashboardPage';
import UsersPage        from './pages/users/UsersPage';
import UserGroupsPage   from './pages/users/UserGroupsPage';
import PermissionMatrixPage from './pages/permissions/PermissionMatrixPage';
import MasterDataPage   from './pages/masters/MasterDataPage';
import TenantSettingsPage from './pages/settings/TenantSettingsPage';
import AuditTrailPage   from './pages/settings/AuditTrailPage';
// Phase 1 — CRM
import ContactsPage    from './pages/contacts/ContactsPage';
import LeadsPage       from './pages/leads/LeadsPage';
import SalesPage       from './pages/sales/SalesPage';
import ActivitiesPage  from './pages/activities/ActivitiesPage';
// Phase 2 — Extended
import SupportPage     from './pages/support/SupportPage';
import MarketingPage   from './pages/marketing/MarketingPage';
import FinancialReportsPage  from './pages/reports/FinancialReportsPage';
import ConsumablesPage     from './pages/assets/ConsumablesPage';
import SuperAdminPage      from './pages/superadmin/SuperAdminPage';
import EInvoicePage        from './pages/einvoice/EInvoicePage';
import FixedAssetsPage      from './pages/assets/FixedAssetsPage';
import SalesVsTargetPage   from './pages/reports/SalesVsTargetPage';
import SalesmanReport        from './pages/reports/SalesmanReport';
import SalesPurchaseReports    from './pages/reports/SalesPurchaseReports';
import StockMovementReport    from './pages/reports/StockMovementReport';
import ItemProfileReport      from './pages/reports/ItemProfileReport';
import AccountLedgerReport    from './pages/reports/AccountLedgerReport';
import ReportsPage     from './pages/reports/ReportsPage';
import DocumentsPage   from './pages/documents/DocumentsPage';
// PM Dashboard
import PMDashboardPage from './pages/pm/PMDashboardPage';
// Phase 3 — PM
import ProjectsPage      from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
// CRM Dashboard
import FieldSalesPage     from './pages/crm/FieldSalesPage';
import CRMDashboardPage from './pages/crm/CRMDashboardPage';
// Phase 4 — Finance
import FinanceDashboardPage from './pages/finance/FinanceDashboardPage';
import QuotationsPage       from './pages/finance/QuotationsPage';
import InvoicesPage         from './pages/finance/InvoicesPage';
import ReceiptsPage         from './pages/finance/ReceiptsPage';
import SalesReturnsPage     from './pages/finance/SalesReturnsPage';
import ExchangeRatesPage    from './pages/finance/ExchangeRatesPage';
import ChartOfAccountsPage    from './pages/finance/ChartOfAccountsPage';
import JournalVouchersPage   from './pages/finance/JournalVouchersPage';
import BankAccountsPage      from './pages/finance/BankAccountsPage';
import GeneralLedgerPage     from './pages/finance/GeneralLedgerPage';
import TrialBalancePage          from './pages/finance/TrialBalancePage';
import ProfitLossPage           from './pages/finance/reports/ProfitLossPage';
import BalanceSheetPage         from './pages/finance/reports/BalanceSheetPage';
import CashFlowPage             from './pages/finance/reports/CashFlowPage';
import ARAgingPage              from './pages/finance/reports/ARAgingPage';
import APAgingPage              from './pages/finance/reports/APAgingPage';
import VATReturnPage            from './pages/finance/reports/VATReturnPage';
import BudgetVsActualPage       from './pages/finance/reports/BudgetVsActualPage';
import DailySalesReportPage     from './pages/finance/reports/DailySalesReportPage';
import BankReconciliationPage   from './pages/finance/reports/BankReconciliationPage';
import LiquidationProjectionPage from './pages/finance/reports/LiquidationProjectionPage';
import CreditRiskPage           from './pages/finance/reports/CreditRiskPage';
// Phase 5 — Inventory
import InventoryDashboardPage from './pages/inventory/InventoryDashboardPage';
import ProductsPage           from './pages/inventory/ProductsPage';
import DeliveryNotesPage   from './pages/inventory/DeliveryNotesPage';
// Warehouse Management
import WarehousesPage       from './pages/warehouse/WarehousesPage';
import LocationsPage        from './pages/warehouse/LocationsPage';
import StockTransfersPage   from './pages/warehouse/StockTransfersPage';
import StockAdjustmentsPage from './pages/warehouse/StockAdjustmentsPage';
// Phase 6 — Purchase
import SuppliersPage         from './pages/purchase/SuppliersPage';
import PurchaseOrdersPage    from './pages/purchase/PurchaseOrdersPage';
import GRNPage               from './pages/purchase/GRNPage';
import PurchaseInvoicesPage  from './pages/purchase/PurchaseInvoicesPage';
import PurchaseReturnsPage    from './pages/purchase/PurchaseReturnsPage';
import PaymentVouchersPage   from './pages/purchase/PaymentVouchersPage';
import ImportExportPage      from './pages/admin/ImportExportPage';
import OnboardingPage       from './pages/admin/OnboardingPage';
import RecurringExpensesPage from './pages/admin/RecurringExpensesPage';
import CompanySettingsPage    from './pages/admin/CompanySettingsPage';
import AccountingConfigPage   from './pages/admin/AccountingConfigPage';
import DocumentConfigPage     from './pages/admin/DocumentConfigPage';
import EmailConfigPage       from './pages/admin/EmailConfigPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((s: RootState) => s.auth.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        {/* Core */}
        <Route path="dashboard"   element={<DashboardPage />} />
        <Route path="users"       element={<UsersPage />} />
        <Route path="user-groups" element={<UserGroupsPage />} />
        <Route path="permissions" element={<PermissionMatrixPage />} />
        <Route path="masters"     element={<MasterDataPage />} />
        <Route path="onboarding"  element={<OnboardingPage />} />
        <Route path="recurring-expenses" element={<RecurringExpensesPage />} />
        <Route path="settings"    element={<TenantSettingsPage />} />
        <Route path="audit"       element={<AuditTrailPage />} />
        {/* Phase 1 */}
        <Route path="contacts"    element={<ContactsPage />} />
        <Route path="crm/field-sales"    element={<FieldSalesPage />} />
        <Route path="crm/dashboard" element={<CRMDashboardPage />} />
        <Route path="leads"       element={<LeadsPage />} />
        <Route path="sales"       element={<SalesPage />} />
        <Route path="activities"  element={<ActivitiesPage />} />
        {/* Phase 2 */}
        <Route path="support"     element={<SupportPage />} />
        <Route path="marketing"   element={<MarketingPage />} />
        <Route path="reports"                    element={<ReportsPage />} />
        <Route path="reports/financial"        element={<FinancialReportsPage />} />
        <Route path="assets/consumables"  element={<ConsumablesPage />} />
        <Route path="superadmin"             element={<SuperAdminPage />} />
        <Route path="einvoice"               element={<EInvoicePage />} />
        <Route path="assets/fixed"            element={<FixedAssetsPage />} />
        <Route path="reports/sales-vs-target"  element={<SalesVsTargetPage />} />
        <Route path="reports/salesman"         element={<SalesmanReport />} />
        <Route path="reports/sales-purchase"     element={<SalesPurchaseReports />} />
        <Route path="reports/stock-movement"     element={<StockMovementReport />} />
        <Route path="reports/item-profile"       element={<ItemProfileReport />} />
        <Route path="reports/account-ledger"     element={<AccountLedgerReport />} />
        <Route path="reports/outstanding-agewise" element={<ComingSoon />} />
        <Route path="reports/outstanding-salesman" element={<ComingSoon />} />
        <Route path="reports/outstanding-customer-group" element={<ComingSoon />} />
        <Route path="reports/sales-register" element={<ComingSoon />} />
        <Route path="reports/cash-register" element={<ComingSoon />} />
        <Route path="reports/bank-register" element={<ComingSoon />} />
        <Route path="reports/petty-cash-book" element={<ComingSoon />} />
        <Route path="reports/bank-book" element={<ComingSoon />} />
        <Route path="reports/pdc-report" element={<ReceivedChequesPage />} />
        <Route path="finance/received-cheques" element={<ReceivedChequesPage />} />
        <Route path="reports/cheque-book" element={<ComingSoon />} />
        <Route path="reports/cash-flow-projection" element={<ComingSoon />} />
        <Route path="reports/collection-projection" element={<ComingSoon />} />
        <Route path="reports/monthly-cash-management" element={<ComingSoon />} />
        <Route path="reports/stock-summary" element={<StockSummaryReport />} />
        <Route path="reports/sales-report" element={<SalesReport />} />
        <Route path="reports/purchase-report" element={<PurchaseReport />} />
        <Route path="reports/net-stock-available" element={<ComingSoon />} />
        <Route path="reports/stock-in-transit" element={<ComingSoon />} />
        <Route path="reports/stock-by-location" element={<StockByLocationPage />} />
        <Route path="reports/stock-valuation" element={<StockValuationPage />} />
        <Route path="reports/stock-aging" element={<ComingSoon />} />
        <Route path="reports/item-sales-purchase-history" element={<ComingSoon />} />
        <Route path="reports/stock-expiry" element={<ComingSoon />} />
        <Route path="reports/batch-expiry" element={<ComingSoon />} />
        <Route path="reports/physical-stock-variation" element={<ComingSoon />} />
        <Route path="reports/stock-valuation" element={<ComingSoon />} />
        <Route path="reports/reorder-management" element={<ReorderManagementReport />} />
        <Route path="reports/dn-vs-so" element={<ComingSoon />} />
        <Route path="reports/partial-delivery" element={<ComingSoon />} />
        <Route path="reports/partial-receipt" element={<ComingSoon />} />
        <Route path="documents"   element={<DocumentsPage />} />
        {/* Phase 3 — PM */}
        <Route path="pm/dashboard"     element={<PMDashboardPage />} />
        <Route path="projects"         element={<ProjectsPage />} />
        <Route path="projects/:id"     element={<ProjectDetailPage />} />
        {/* Phase 4 — Finance */}
        <Route path="finance/dashboard"       element={<FinanceDashboardPage />} />
        <Route path="finance/quotations"      element={<QuotationsPage />} />
        <Route path="finance/invoices"        element={<InvoicesPage />} />
        <Route path="finance/receipts"        element={<ReceiptsPage />} />
        <Route path="finance/returns"         element={<SalesReturnsPage />} />
        <Route path="finance/exchange-rates"  element={<ExchangeRatesPage />} />
        <Route path="finance/chart-of-accounts"  element={<ChartOfAccountsPage />} />
        <Route path="finance/journal-vouchers"   element={<JournalVouchersPage />} />
        <Route path="finance/bank-accounts"      element={<BankAccountsPage />} />
        <Route path="finance/general-ledger"      element={<GeneralLedgerPage />} />
        <Route path="finance/trial-balance"          element={<TrialBalancePage />} />
        <Route path="finance/profit-loss"            element={<ProfitLossPage />} />
        <Route path="finance/balance-sheet"          element={<BalanceSheetPage />} />
        <Route path="finance/cash-flow"              element={<CashFlowPage />} />
        <Route path="finance/ar-aging"               element={<ARAgingPage />} />
        <Route path="finance/ap-aging"               element={<APAgingPage />} />
        <Route path="finance/vat-return"             element={<VATReturnPage />} />
        <Route path="finance/budget-vs-actual"       element={<BudgetVsActualPage />} />
        <Route path="finance/daily-report"           element={<DailySalesReportPage />} />
        <Route path="finance/bank-reconciliation"    element={<BankReconciliationPage />} />
        <Route path="finance/liquidation-projection" element={<LiquidationProjectionPage />} />
        <Route path="finance/credit-risk"            element={<CreditRiskPage />} />
        {/* Phase 5 — Inventory */}
        <Route path="inventory/dashboard"       element={<InventoryDashboardPage />} />
        <Route path="inventory/products"        element={<ProductsPage />} />
        <Route path="inventory/delivery-notes"  element={<DeliveryNotesPage />} />
        {/* Warehouse Management */}
        <Route path="warehouse/warehouses"      element={<WarehousesPage />} />
        <Route path="warehouse/locations"       element={<LocationsPage />} />
        <Route path="warehouse/transfers"       element={<StockTransfersPage />} />
        <Route path="warehouse/adjustments"     element={<StockAdjustmentsPage />} />
        {/* Phase 6 — Purchase */}
        <Route path="purchase/suppliers"        element={<SuppliersPage />} />
        <Route path="purchase/orders"           element={<PurchaseOrdersPage />} />
        <Route path="purchase/grn"              element={<GRNPage />} />
        <Route path="purchase/invoices"         element={<PurchaseInvoicesPage />} />
        <Route path="purchase/returns"          element={<PurchaseReturnsPage />} />
        <Route path="purchase/payments"         element={<PaymentVouchersPage />} />
        <Route path="admin/import-export"        element={<ImportExportPage />} />
        <Route path="admin/company-settings"    element={<CompanySettingsPage />} />
        <Route path="admin/accounting-config"   element={<AccountingConfigPage />} />
        <Route path="admin/document-config"     element={<DocumentConfigPage />} />
        <Route path="admin/email-config"         element={<EmailConfigPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
