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
        return this.svc.getQuotations(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status);
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
    deleteQuotation(req, id) {
        return this.svc.deleteQuotation(req.user.tenantId, id);
    }
    convertQuotationToDN(req, id) {
        return this.svc.convertQuotationToDN(req.user.tenantId, id, req.user.userId);
    }
    getDeliveryNotes(req, q) {
        return this.svc.getDeliveryNotes(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status);
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
        return this.svc.getPurchaseOrders(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status);
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
    deletePurchaseOrder(req, id) {
        return this.svc.deletePurchaseOrder(req.user.tenantId, id);
    }
    getGRNs(req, q) {
        return this.svc.getGRNs(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status);
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
    deleteGRN(req, id) {
        return this.svc.deleteGRN(req.user.tenantId, id);
    }
    convertGRNToInvoice(req, id) {
        return this.svc.convertGRNToInvoice(req.user.tenantId, id, req.user.userId);
    }
    getPurchaseInvoices(req, q) {
        return this.svc.getPurchaseInvoices(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status);
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
    deletePurchaseInvoice(req, id) {
        return this.svc.deletePurchaseInvoice(req.user.tenantId, id);
    }
    getPaymentVouchers(req, q) {
        return this.svc.getPaymentVouchers(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search);
    }
    createPaymentVoucher(req, dto) {
        return this.svc.createPaymentVoucher(req.user.tenantId, dto, req.user.userId);
    }
    deletePaymentVoucher(req, id) {
        return this.svc.deletePaymentVoucher(req.user.tenantId, id);
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
    deletePurchaseReturn(req, id) {
        return this.svc.deletePurchaseReturn(req.user.tenantId, id);
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
    (0, common_1.Delete)('payment-vouchers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deletePaymentVoucher", null);
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
    (0, common_1.Delete)('purchase-returns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "deletePurchaseReturn", null);
exports.SalesController = SalesController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map