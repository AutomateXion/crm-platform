"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("./auth.guard");
const sales_service_1 = require("./sales.service");
let SalesController = class SalesController {
    constructor(svc) {
        this.svc = svc;
    }
    getProducts(req, q) {
        return this.svc.getProducts(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.category);
    }
    getProduct(req, id) {
        return this.svc.getProduct(req.user.tenantId, id);
    }
    createProduct(req, dto) {
        return this.svc.createProduct(req.user.tenantId, dto, req.user.userId);
    }
    updateProduct(req, id, dto) {
        return this.svc.updateProduct(req.user.tenantId, id, dto);
    }
    deleteProduct(req, id) {
        return this.svc.deleteProduct(req.user.tenantId, id);
    }
    getStockMovements(req, q) {
        return this.svc.getStockMovements(req.user.tenantId, q.productId);
    }
    adjustStock(req, dto) {
        return this.svc.adjustStock(req.user.tenantId, dto.productId, dto.quantity, dto.type, dto.reference, req.user.userId);
    }
    getExchangeRates(req) {
        return this.svc.getExchangeRates(req.user.tenantId);
    }
    createExchangeRate(req, dto) {
        return this.svc.createExchangeRate(req.user.tenantId, dto, req.user.userId);
    }
    updateExchangeRate(req, id, dto) {
        return this.svc.updateExchangeRate(req.user.tenantId, id, dto);
    }
    deleteExchangeRate(req, id) {
        return this.svc.deleteExchangeRate(req.user.tenantId, id);
    }
    getQuotations(req, q) {
        return this.svc.getQuotations(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status, q.excludeConverted === 'true');
    }
    getQuotation(req, id) {
        return this.svc.getQuotation(req.user.tenantId, id);
    }
    createQuotation(req, dto) {
        return this.svc.createQuotation(req.user.tenantId, dto, req.user.userId);
    }
    updateQuotation(req, id, dto) {
        return this.svc.updateQuotation(req.user.tenantId, id, dto);
    }
    updateQuotationStatus(req, id, status) {
        return this.svc.updateQuotation(req.user.tenantId, id, { status });
    }
    deleteQuotation(req, id) {
        return this.svc.deleteQuotation(req.user.tenantId, id);
    }
    convertQuotationToDN(req, id) {
        return this.svc.convertQuotationToDN(req.user.tenantId, id, req.user.userId);
    }
    getDeliveryNotes(req, q) {
        return this.svc.getDeliveryNotes(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status, q.excludeInvoiced === 'true');
    }
    getDeliveryNote(req, id) {
        return this.svc.getDeliveryNote(req.user.tenantId, id);
    }
    createDeliveryNote(req, dto) {
        return this.svc.createDeliveryNote(req.user.tenantId, dto, req.user.userId);
    }
    updateDeliveryNote(req, id, dto) {
        return this.svc.updateDeliveryNote(req.user.tenantId, id, dto);
    }
    updateDNStatus(req, id, status) {
        return this.svc.updateDeliveryNote(req.user.tenantId, id, { status });
    }
    deleteDeliveryNote(req, id) {
        return this.svc.deleteDeliveryNote(req.user.tenantId, id);
    }
    convertDNToInvoice(req, id) {
        return this.svc.convertDNToInvoice(req.user.tenantId, id, req.user.userId);
    }
    getInvoices(req, q) {
        return this.svc.getInvoices(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status);
    }
    getInvoice(req, id) {
        return this.svc.getInvoice(req.user.tenantId, id);
    }
    createInvoice(req, dto) {
        return this.svc.createInvoice(req.user.tenantId, dto, req.user.userId);
    }
    updateInvoice(req, id, dto) {
        return this.svc.updateInvoice(req.user.tenantId, id, dto);
    }
    updateInvoiceStatus(req, id, status) {
        return this.svc.updateInvoice(req.user.tenantId, id, { status });
    }
    deleteInvoice(req, id) {
        return this.svc.deleteInvoice(req.user.tenantId, id);
    }
    getReceipts(req, q) {
        return this.svc.getReceipts(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search);
    }
    createReceipt(req, dto) {
        return this.svc.createReceipt(req.user.tenantId, dto, req.user.userId);
    }
    deleteReceipt(req, id) {
        return this.svc.deleteReceipt(req.user.tenantId, id);
    }
    getReturns(req, q) {
        return this.svc.getReturns(req.user.tenantId, +q.page || 1, +q.limit || 20);
    }
    getReturn(req, id) {
        return this.svc.getReturn(req.user.tenantId, id);
    }
    createReturn(req, dto) {
        return this.svc.createReturn(req.user.tenantId, dto, req.user.userId);
    }
    updateReturn(req, id, dto) {
        return this.svc.updateReturn(req.user.tenantId, id, dto);
    }
    updateReturnStatus(req, id, status) {
        return this.svc.updateReturn(req.user.tenantId, id, { status });
    }
    deleteReturn(req, id) {
        return this.svc.deleteReturn(req.user.tenantId, id);
    }
    getAccounts(req, q) {
        return this.svc.getAccounts(req.user.tenantId, q.type, q.search);
    }
    createAccount(req, dto) {
        return this.svc.createAccount(req.user.tenantId, dto);
    }
    updateAccount(req, id, dto) {
        return this.svc.updateAccount(req.user.tenantId, id, dto);
    }
    deleteAccount(req, id) {
        return this.svc.deleteAccount(req.user.tenantId, id);
    }
    getDashboard(req) {
        return this.svc.getDashboard(req.user.tenantId);
    }
    getDashboardAnalytics(req) {
        return this.svc.getDashboardAnalytics(req.user.tenantId);
    }
    getFinanceDashboard(req) {
        return this.svc.getFinanceDashboard(req.user.tenantId);
    }
    getSuppliers(req, q) {
        return this.svc.getSuppliers(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search);
    }
    getSupplier(req, id) {
        return this.svc.getSupplier(req.user.tenantId, id);
    }
    createSupplier(req, dto) {
        return this.svc.createSupplier(req.user.tenantId, dto, req.user.userId);
    }
    updateSupplier(req, id, dto) {
        return this.svc.updateSupplier(req.user.tenantId, id, dto);
    }
    deleteSupplier(req, id) {
        return this.svc.deleteSupplier(req.user.tenantId, id);
    }
    getPurchaseOrders(req, q) {
        return this.svc.getPurchaseOrders(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status, q.excludeReceived === 'true');
    }
    getPurchaseOrder(req, id) {
        return this.svc.getPurchaseOrder(req.user.tenantId, id);
    }
    createPurchaseOrder(req, dto) {
        return this.svc.createPurchaseOrder(req.user.tenantId, dto, req.user.userId);
    }
    updatePurchaseOrder(req, id, dto) {
        return this.svc.updatePurchaseOrder(req.user.tenantId, id, dto);
    }
    updatePOStatus(req, id, status) {
        return this.svc.updatePurchaseOrder(req.user.tenantId, id, { status });
    }
    deletePurchaseOrder(req, id) {
        return this.svc.deletePurchaseOrder(req.user.tenantId, id);
    }
    getGRNs(req, q) {
        return this.svc.getGRNs(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status, q.excludeInvoiced === 'true');
    }
    getGRN(req, id) {
        return this.svc.getGRN(req.user.tenantId, id);
    }
    createGRN(req, dto) {
        return this.svc.createGRN(req.user.tenantId, dto, req.user.userId);
    }
    updateGRN(req, id, dto) {
        return this.svc.updateGRN(req.user.tenantId, id, dto);
    }
    updateGRNStatus(req, id, status) {
        return this.svc.updateGRN(req.user.tenantId, id, { status });
    }
    deleteGRN(req, id) {
        return this.svc.deleteGRN(req.user.tenantId, id);
    }
    convertGRNToInvoice(req, id) {
        return this.svc.convertGRNToInvoice(req.user.tenantId, id, req.user.userId);
    }
    getPurchaseInvoices(req, q) {
        return this.svc.getPurchaseInvoices(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status, q.excludePaid === 'true');
    }
    getPurchaseInvoice(req, id) {
        return this.svc.getPurchaseInvoice(req.user.tenantId, id);
    }
    createPurchaseInvoice(req, dto) {
        return this.svc.createPurchaseInvoice(req.user.tenantId, dto, req.user.userId);
    }
    updatePurchaseInvoice(req, id, dto) {
        return this.svc.updatePurchaseInvoice(req.user.tenantId, id, dto);
    }
    updatePurchaseInvoiceStatus(req, id, status) {
        return this.svc.updatePurchaseInvoice(req.user.tenantId, id, { status });
    }
    deletePurchaseInvoice(req, id) {
        return this.svc.deletePurchaseInvoice(req.user.tenantId, id);
    }
    getPaymentVouchers(req, q) {
        return this.svc.getPaymentVouchers(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search);
    }
    createPaymentVoucher(req, dto) {
        return this.svc.createPaymentVoucher(req.user.tenantId, dto, req.user.userId);
    }
    getPaymentVoucher(req, id) {
        return this.svc.getPaymentVoucher(req.user.tenantId, id);
    }
    updatePaymentVoucher(req, id, dto) {
        return this.svc.updatePaymentVoucher(req.user.tenantId, id, dto);
    }
    deletePaymentVoucher(req, id) {
        return this.svc.deletePaymentVoucher(req.user.tenantId, id);
    }
    getStockMovementReport(req, q) {
        return this.svc.getStockMovementReport(req.user.tenantId, q.productId, q.from, q.to);
    }
    getItemTransactionHistory(req, productId) {
        return this.svc.getItemTransactionHistory(req.user.tenantId, productId);
    }
    getAccountLedger(req, q) {
        return this.svc.getAccountLedger(req.user.tenantId, q.accountId, q.customerName, q.supplierName, q.from, q.to);
    }
    getSalesReport(req, q) {
        return this.svc.getSalesReport(req.user.tenantId, q.from, q.to);
    }
    getPurchaseReport(req, q) {
        return this.svc.getPurchaseReport(req.user.tenantId, q.from, q.to);
    }
    getTopCustomersSuppliers(req, q) {
        return this.svc.getTopCustomersSuppliers(req.user.tenantId, +q.limit || 10);
    }
    getFinancialReports(req, q) {
        return this.svc.getFinancialReports(req.user.tenantId, q.from, q.to);
    }
    getSalesTargets(req, q) {
        return this.svc.getSalesTargets(req.user.tenantId, q.year ? +q.year : undefined, q.month ? +q.month : undefined);
    }
    createSalesTarget(req, dto) {
        return this.svc.createSalesTarget(req.user.tenantId, dto, req.user.userId);
    }
    updateSalesTarget(req, id, dto) {
        return this.svc.updateSalesTarget(req.user.tenantId, id, dto);
    }
    deleteSalesTarget(req, id) {
        return this.svc.deleteSalesTarget(req.user.tenantId, id);
    }
    getSalesVsTarget(req, q) {
        return this.svc.getSalesVsTarget(req.user.tenantId, q.year ? +q.year : new Date().getFullYear(), q.month ? +q.month : undefined);
    }
    getSalesmanReport(req, q) {
        return this.svc.getSalesmanReport(req.user.tenantId, q.from, q.to);
    }
    getStockReport(req) {
        return this.svc.getStockReport(req.user.tenantId);
    }
    getGLLedger(req, q) {
        return this.svc.getGLLedger(req.user.tenantId, q.accountId, q.from, q.to);
    }
    getAllCustomersStatement(req) {
        return this.svc.getAllCustomersStatement(req.user.tenantId);
    }
    getAllSuppliersStatement(req) {
        return this.svc.getAllSuppliersStatement(req.user.tenantId);
    }
    getPurchaseReturns(req, q) {
        return this.svc.getPurchaseReturns(req.user.tenantId, +q.page || 1, +q.limit || 20);
    }
    getPurchaseReturn(req, id) {
        return this.svc.getPurchaseReturn(req.user.tenantId, id);
    }
    createPurchaseReturn(req, dto) {
        return this.svc.createPurchaseReturn(req.user.tenantId, dto, req.user.userId);
    }
    updatePurchaseReturn(req, id, dto) {
        return this.svc.updatePurchaseReturn(req.user.tenantId, id, dto);
    }
    updatePurchaseReturnStatus(req, id, status) {
        return this.svc.updatePurchaseReturn(req.user.tenantId, id, { status });
    }
    deletePurchaseReturn(req, id) {
        return this.svc.deletePurchaseReturn(req.user.tenantId, id);
    }
    getJournalVouchers(req, q) {
        return this.svc.getJournalVouchers(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.type, q.status);
    }
    getJournalVoucher(req, id) {
        return this.svc.getJournalVoucher(req.user.tenantId, id);
    }
    createJournalVoucher(req, dto) {
        return this.svc.createJournalVoucher(req.user.tenantId, dto, req.user.userId);
    }
    updateJournalVoucher(req, id, dto) {
        return this.svc.updateJournalVoucher(req.user.tenantId, id, dto);
    }
    postJournalVoucher(req, id) {
        return this.svc.postJournalVoucher(req.user.tenantId, id, req.user.userId);
    }
    deleteJournalVoucher(req, id) {
        return this.svc.deleteJournalVoucher(req.user.tenantId, id);
    }
    getGeneralLedger(req, q) {
        return this.svc.getGeneralLedger(req.user.tenantId, q.accountId, q.fromDate, q.toDate, +q.page || 1, +q.limit || 50);
    }
    getTrialBalance(req, q) {
        return this.svc.getTrialBalance(req.user.tenantId, q.fromDate, q.toDate);
    }
    getProfitLoss(req, q) {
        return this.svc.getProfitLoss(req.user.tenantId, q.fromDate, q.toDate);
    }
    getBalanceSheet(req, q) {
        return this.svc.getBalanceSheet(req.user.tenantId, q.asOfDate);
    }
    getCashFlow(req, q) {
        return this.svc.getCashFlow(req.user.tenantId, q.fromDate, q.toDate);
    }
    getARaging(req, q) {
        return this.svc.getARaging(req.user.tenantId, q.asOfDate);
    }
    getAPAging(req, q) {
        return this.svc.getAPAging(req.user.tenantId, q.asOfDate);
    }
    getVATReturn(req, q) {
        return this.svc.getVATReturn(req.user.tenantId, q.fromDate, q.toDate);
    }
    getBudgetVsActual(req, q) {
        return this.svc.getBudgetVsActual(req.user.tenantId, q.fromDate, q.toDate);
    }
    getDailyReport(req, q) {
        return this.svc.getDailyReport(req.user.tenantId, q.date);
    }
    getBankReconciliation(req, q) {
        return this.svc.getBankReconciliation(req.user.tenantId, q.fromDate, q.toDate);
    }
    getLiquidationProjection(req, q) {
        return this.svc.getLiquidationProjection(req.user.tenantId, +q.currentCash || 0, +q.salaries || 0, +q.rent || 0);
    }
    getCreditRiskStatement(req) {
        return this.svc.getCreditRiskStatement(req.user.tenantId);
    }
    getWarehouses(req, q) {
        return this.svc.getWarehouses(req.user.tenantId, q.search);
    }
    createWarehouse(req, dto) {
        return this.svc.createWarehouse(req.user.tenantId, dto, req.user.userId);
    }
    updateWarehouse(req, id, dto) {
        return this.svc.updateWarehouse(req.user.tenantId, id, dto);
    }
    deleteWarehouse(req, id) {
        return this.svc.deleteWarehouse(req.user.tenantId, id);
    }
    getLocations(req, q) {
        return this.svc.getLocations(req.user.tenantId, q.warehouseId);
    }
    createLocation(req, dto) {
        return this.svc.createLocation(req.user.tenantId, dto);
    }
    updateLocation(req, id, dto) {
        return this.svc.updateLocation(req.user.tenantId, id, dto);
    }
    deleteLocation(req, id) {
        return this.svc.deleteLocation(req.user.tenantId, id);
    }
    getStockTransfers(req, q) {
        return this.svc.getStockTransfers(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search);
    }
    getStockTransfer(req, id) {
        return this.svc.getStockTransfer(req.user.tenantId, id);
    }
    createStockTransfer(req, dto) {
        return this.svc.createStockTransfer(req.user.tenantId, dto, req.user.userId);
    }
    updateStockTransfer(req, id, dto) {
        return this.svc.updateStockTransfer(req.user.tenantId, id, dto);
    }
    confirmStockTransfer(req, id) {
        return this.svc.confirmStockTransfer(req.user.tenantId, id, req.user.userId);
    }
    deleteStockTransfer(req, id) {
        return this.svc.deleteStockTransfer(req.user.tenantId, id);
    }
    getStockAdjustments(req, q) {
        return this.svc.getStockAdjustments(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search);
    }
    getStockAdjustment(req, id) {
        return this.svc.getStockAdjustment(req.user.tenantId, id);
    }
    createStockAdjustment(req, dto) {
        return this.svc.createStockAdjustment(req.user.tenantId, dto, req.user.userId);
    }
    updateStockAdjustment(req, id, dto) {
        return this.svc.updateStockAdjustment(req.user.tenantId, id, dto);
    }
    deleteStockAdjustment(req, id) {
        return this.svc.deleteStockAdjustment(req.user.tenantId, id);
    }
    getPOAssetItems(req) {
        return this.svc.getPOAssetItems(req.user.tenantId);
    }
    getConsumableStock(req) {
        return this.svc.getConsumableStock(req.user.tenantId);
    }
    getConsumableStats(req) {
        return this.svc.getConsumableStats(req.user.tenantId);
    }
    getConsumableTransactions(req, q) {
        return this.svc.getConsumableTransactions(req.user.tenantId, q.productId);
    }
    issueConsumable(req, dto) {
        return this.svc.issueConsumable(req.user.tenantId, dto, req.user.userId);
    }
    receiveConsumable(req, dto) {
        return this.svc.receiveConsumable(req.user.tenantId, dto.productId, dto.quantity, dto.referenceNo, req.user.userId);
    }
    getBrands(req, q) {
        return this.svc.getBrands(req.user.tenantId, q.category);
    }
    createBrand(req, dto) {
        return this.svc.createBrand(req.user.tenantId, dto);
    }
    deleteBrand(req, id) {
        return this.svc.deleteBrand(req.user.tenantId, id);
    }
    createDraftAssetsFromPO(req, poId) {
        return this.svc.createDraftAssetsFromPO(req.user.tenantId, poId, req.user.userId);
    }
    getAssetStats(req) {
        return this.svc.getAssetStats(req.user.tenantId);
    }
    getAssets(req, q) {
        return this.svc.getAssets(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status, q.category);
    }
    getAsset(req, id) {
        return this.svc.getAsset(req.user.tenantId, id);
    }
    createAsset(req, dto) {
        return this.svc.createAsset(req.user.tenantId, dto, req.user.userId);
    }
    updateAsset(req, id, dto) {
        return this.svc.updateAsset(req.user.tenantId, id, dto);
    }
    deleteAsset(req, id) {
        return this.svc.deleteAsset(req.user.tenantId, id);
    }
    calculateDepreciation(req, id, dto) {
        return this.svc.calculateDepreciation(req.user.tenantId, id, +dto.year, +dto.month, req.user.userId);
    }
    runBulkDepreciation(req, dto) {
        return this.svc.runBulkDepreciation(req.user.tenantId, +dto.year, +dto.month, req.user.userId);
    }
    getDepreciationSchedule(req, id) {
        return this.svc.getDepreciationSchedule(req.user.tenantId, id);
    }
    getMaintenance(req, q) {
        return this.svc.getMaintenance(req.user.tenantId, q.assetId, q.status);
    }
    createMaintenance(req, dto) {
        return this.svc.createMaintenance(req.user.tenantId, dto, req.user.userId);
    }
    updateMaintenance(req, id, dto) {
        return this.svc.updateMaintenance(req.user.tenantId, id, dto);
    }
    getTransfers(req, q) {
        return this.svc.getTransfers(req.user.tenantId, q.assetId);
    }
    createTransfer(req, dto) {
        return this.svc.createTransfer(req.user.tenantId, dto, req.user.userId);
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('stock-movements'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getStockMovements", null);
__decorate([
    (0, common_1.Post)('stock-adjustments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Get)('exchange-rates'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getExchangeRates", null);
__decorate([
    (0, common_1.Post)('exchange-rates'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createExchangeRate", null);
__decorate([
    (0, common_1.Put)('exchange-rates/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateExchangeRate", null);
__decorate([
    (0, common_1.Delete)('exchange-rates/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteExchangeRate", null);
__decorate([
    (0, common_1.Get)('quotations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getQuotations", null);
__decorate([
    (0, common_1.Get)('quotations/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getQuotation", null);
__decorate([
    (0, common_1.Post)('quotations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createQuotation", null);
__decorate([
    (0, common_1.Put)('quotations/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateQuotation", null);
__decorate([
    (0, common_1.Patch)('quotations/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateQuotationStatus", null);
__decorate([
    (0, common_1.Delete)('quotations/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteQuotation", null);
__decorate([
    (0, common_1.Post)('quotations/:id/convert-to-dn'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "convertQuotationToDN", null);
__decorate([
    (0, common_1.Get)('delivery-notes'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getDeliveryNotes", null);
__decorate([
    (0, common_1.Get)('delivery-notes/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getDeliveryNote", null);
__decorate([
    (0, common_1.Post)('delivery-notes'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createDeliveryNote", null);
__decorate([
    (0, common_1.Put)('delivery-notes/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateDeliveryNote", null);
__decorate([
    (0, common_1.Patch)('delivery-notes/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateDNStatus", null);
__decorate([
    (0, common_1.Delete)('delivery-notes/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteDeliveryNote", null);
__decorate([
    (0, common_1.Post)('delivery-notes/:id/convert-to-invoice'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "convertDNToInvoice", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)('invoices'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Put)('invoices/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateInvoice", null);
__decorate([
    (0, common_1.Patch)('invoices/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateInvoiceStatus", null);
__decorate([
    (0, common_1.Delete)('invoices/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteInvoice", null);
__decorate([
    (0, common_1.Get)('receipts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getReceipts", null);
__decorate([
    (0, common_1.Post)('receipts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createReceipt", null);
__decorate([
    (0, common_1.Delete)('receipts/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteReceipt", null);
__decorate([
    (0, common_1.Get)('returns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getReturns", null);
__decorate([
    (0, common_1.Get)('returns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getReturn", null);
__decorate([
    (0, common_1.Post)('returns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createReturn", null);
__decorate([
    (0, common_1.Put)('returns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateReturn", null);
__decorate([
    (0, common_1.Patch)('returns/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateReturnStatus", null);
__decorate([
    (0, common_1.Delete)('returns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteReturn", null);
__decorate([
    (0, common_1.Get)('chart-of-accounts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Post)('chart-of-accounts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Put)('chart-of-accounts/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateAccount", null);
__decorate([
    (0, common_1.Delete)('chart-of-accounts/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('dashboard/analytics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getDashboardAnalytics", null);
__decorate([
    (0, common_1.Get)('finance-dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getFinanceDashboard", null);
__decorate([
    (0, common_1.Get)('suppliers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getSuppliers", null);
__decorate([
    (0, common_1.Get)('suppliers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getSupplier", null);
__decorate([
    (0, common_1.Post)('suppliers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Put)('suppliers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateSupplier", null);
__decorate([
    (0, common_1.Delete)('suppliers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteSupplier", null);
__decorate([
    (0, common_1.Get)('purchase-orders'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPurchaseOrders", null);
__decorate([
    (0, common_1.Get)('purchase-orders/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPurchaseOrder", null);
__decorate([
    (0, common_1.Post)('purchase-orders'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createPurchaseOrder", null);
__decorate([
    (0, common_1.Put)('purchase-orders/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updatePurchaseOrder", null);
__decorate([
    (0, common_1.Patch)('purchase-orders/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updatePOStatus", null);
__decorate([
    (0, common_1.Delete)('purchase-orders/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deletePurchaseOrder", null);
__decorate([
    (0, common_1.Get)('grns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getGRNs", null);
__decorate([
    (0, common_1.Get)('grns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getGRN", null);
__decorate([
    (0, common_1.Post)('grns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createGRN", null);
__decorate([
    (0, common_1.Put)('grns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateGRN", null);
__decorate([
    (0, common_1.Patch)('grns/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateGRNStatus", null);
__decorate([
    (0, common_1.Delete)('grns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteGRN", null);
__decorate([
    (0, common_1.Post)('grns/:id/convert-to-invoice'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "convertGRNToInvoice", null);
__decorate([
    (0, common_1.Get)('purchase-invoices'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPurchaseInvoices", null);
__decorate([
    (0, common_1.Get)('purchase-invoices/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPurchaseInvoice", null);
__decorate([
    (0, common_1.Post)('purchase-invoices'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createPurchaseInvoice", null);
__decorate([
    (0, common_1.Put)('purchase-invoices/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updatePurchaseInvoice", null);
__decorate([
    (0, common_1.Patch)('purchase-invoices/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updatePurchaseInvoiceStatus", null);
__decorate([
    (0, common_1.Delete)('purchase-invoices/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deletePurchaseInvoice", null);
__decorate([
    (0, common_1.Get)('payment-vouchers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPaymentVouchers", null);
__decorate([
    (0, common_1.Post)('payment-vouchers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createPaymentVoucher", null);
__decorate([
    (0, common_1.Get)('payment-vouchers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPaymentVoucher", null);
__decorate([
    (0, common_1.Put)('payment-vouchers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updatePaymentVoucher", null);
__decorate([
    (0, common_1.Delete)('payment-vouchers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deletePaymentVoucher", null);
__decorate([
    (0, common_1.Get)('reports/stock-movement'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getStockMovementReport", null);
__decorate([
    (0, common_1.Get)('reports/item-history/:productId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getItemTransactionHistory", null);
__decorate([
    (0, common_1.Get)('reports/account-ledger'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getAccountLedger", null);
__decorate([
    (0, common_1.Get)('reports/sales'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('reports/purchases'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPurchaseReport", null);
__decorate([
    (0, common_1.Get)('reports/top-customers-suppliers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getTopCustomersSuppliers", null);
__decorate([
    (0, common_1.Get)('reports/financial'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getFinancialReports", null);
__decorate([
    (0, common_1.Get)('sales-targets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getSalesTargets", null);
__decorate([
    (0, common_1.Post)('sales-targets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createSalesTarget", null);
__decorate([
    (0, common_1.Put)('sales-targets/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateSalesTarget", null);
__decorate([
    (0, common_1.Delete)('sales-targets/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteSalesTarget", null);
__decorate([
    (0, common_1.Get)('sales-vs-target'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getSalesVsTarget", null);
__decorate([
    (0, common_1.Get)('reports/salesman'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getSalesmanReport", null);
__decorate([
    (0, common_1.Get)('reports/stock'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getStockReport", null);
__decorate([
    (0, common_1.Get)('reports/gl-ledger'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getGLLedger", null);
__decorate([
    (0, common_1.Get)('reports/customers-statement'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getAllCustomersStatement", null);
__decorate([
    (0, common_1.Get)('reports/suppliers-statement'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getAllSuppliersStatement", null);
__decorate([
    (0, common_1.Get)('purchase-returns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPurchaseReturns", null);
__decorate([
    (0, common_1.Get)('purchase-returns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPurchaseReturn", null);
__decorate([
    (0, common_1.Post)('purchase-returns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createPurchaseReturn", null);
__decorate([
    (0, common_1.Put)('purchase-returns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updatePurchaseReturn", null);
__decorate([
    (0, common_1.Patch)('purchase-returns/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updatePurchaseReturnStatus", null);
__decorate([
    (0, common_1.Delete)('purchase-returns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deletePurchaseReturn", null);
__decorate([
    (0, common_1.Get)('journal-vouchers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getJournalVouchers", null);
__decorate([
    (0, common_1.Get)('journal-vouchers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getJournalVoucher", null);
__decorate([
    (0, common_1.Post)('journal-vouchers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createJournalVoucher", null);
__decorate([
    (0, common_1.Put)('journal-vouchers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateJournalVoucher", null);
__decorate([
    (0, common_1.Post)('journal-vouchers/:id/post'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "postJournalVoucher", null);
__decorate([
    (0, common_1.Delete)('journal-vouchers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteJournalVoucher", null);
__decorate([
    (0, common_1.Get)('general-ledger'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getGeneralLedger", null);
__decorate([
    (0, common_1.Get)('trial-balance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('profit-loss'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getProfitLoss", null);
__decorate([
    (0, common_1.Get)('balance-sheet'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getBalanceSheet", null);
__decorate([
    (0, common_1.Get)('cash-flow'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getCashFlow", null);
__decorate([
    (0, common_1.Get)('ar-aging'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getARaging", null);
__decorate([
    (0, common_1.Get)('ap-aging'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getAPAging", null);
__decorate([
    (0, common_1.Get)('vat-return'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getVATReturn", null);
__decorate([
    (0, common_1.Get)('budget-vs-actual'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getBudgetVsActual", null);
__decorate([
    (0, common_1.Get)('daily-report'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getDailyReport", null);
__decorate([
    (0, common_1.Get)('bank-reconciliation'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getBankReconciliation", null);
__decorate([
    (0, common_1.Get)('liquidation-projection'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getLiquidationProjection", null);
__decorate([
    (0, common_1.Get)('credit-risk'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getCreditRiskStatement", null);
__decorate([
    (0, common_1.Get)('warehouses'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getWarehouses", null);
__decorate([
    (0, common_1.Post)('warehouses'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createWarehouse", null);
__decorate([
    (0, common_1.Put)('warehouses/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateWarehouse", null);
__decorate([
    (0, common_1.Delete)('warehouses/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteWarehouse", null);
__decorate([
    (0, common_1.Get)('warehouse-locations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Post)('warehouse-locations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Put)('warehouse-locations/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Delete)('warehouse-locations/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteLocation", null);
__decorate([
    (0, common_1.Get)('stock-transfers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getStockTransfers", null);
__decorate([
    (0, common_1.Get)('stock-transfers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getStockTransfer", null);
__decorate([
    (0, common_1.Post)('stock-transfers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createStockTransfer", null);
__decorate([
    (0, common_1.Put)('stock-transfers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateStockTransfer", null);
__decorate([
    (0, common_1.Post)('stock-transfers/:id/confirm'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "confirmStockTransfer", null);
__decorate([
    (0, common_1.Delete)('stock-transfers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteStockTransfer", null);
__decorate([
    (0, common_1.Get)('stock-adjustments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getStockAdjustments", null);
__decorate([
    (0, common_1.Get)('stock-adjustments/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getStockAdjustment", null);
__decorate([
    (0, common_1.Post)('stock-adjustments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createStockAdjustment", null);
__decorate([
    (0, common_1.Put)('stock-adjustments/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateStockAdjustment", null);
__decorate([
    (0, common_1.Delete)('stock-adjustments/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteStockAdjustment", null);
__decorate([
    (0, common_1.Get)('po-asset-items'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getPOAssetItems", null);
__decorate([
    (0, common_1.Get)('consumables/stock'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getConsumableStock", null);
__decorate([
    (0, common_1.Get)('consumables/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getConsumableStats", null);
__decorate([
    (0, common_1.Get)('consumables/transactions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getConsumableTransactions", null);
__decorate([
    (0, common_1.Post)('consumables/issue'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "issueConsumable", null);
__decorate([
    (0, common_1.Post)('consumables/receive'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "receiveConsumable", null);
__decorate([
    (0, common_1.Get)('asset-brands'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getBrands", null);
__decorate([
    (0, common_1.Post)('asset-brands'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createBrand", null);
__decorate([
    (0, common_1.Delete)('asset-brands/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteBrand", null);
__decorate([
    (0, common_1.Post)('assets/create-from-po/:poId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('poId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createDraftAssetsFromPO", null);
__decorate([
    (0, common_1.Get)('assets/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getAssetStats", null);
__decorate([
    (0, common_1.Get)('assets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getAssets", null);
__decorate([
    (0, common_1.Get)('assets/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getAsset", null);
__decorate([
    (0, common_1.Post)('assets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createAsset", null);
__decorate([
    (0, common_1.Put)('assets/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateAsset", null);
__decorate([
    (0, common_1.Delete)('assets/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deleteAsset", null);
__decorate([
    (0, common_1.Post)('assets/:id/depreciation'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "calculateDepreciation", null);
__decorate([
    (0, common_1.Post)('assets/depreciation/bulk'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "runBulkDepreciation", null);
__decorate([
    (0, common_1.Get)('assets/:id/depreciation'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getDepreciationSchedule", null);
__decorate([
    (0, common_1.Get)('maintenance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getMaintenance", null);
__decorate([
    (0, common_1.Post)('maintenance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createMaintenance", null);
__decorate([
    (0, common_1.Put)('maintenance/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateMaintenance", null);
__decorate([
    (0, common_1.Get)('asset-transfers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getTransfers", null);
__decorate([
    (0, common_1.Post)('asset-transfers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createTransfer", null);
exports.SalesController = SalesController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map