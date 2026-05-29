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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseReturnItemEntity = exports.PurchaseReturnEntity = exports.PaymentVoucherEntity = exports.PurchaseInvoiceItemEntity = exports.PurchaseInvoiceEntity = exports.GoodsReceiptNoteItemEntity = exports.GoodsReceiptNoteEntity = exports.PurchaseOrderItemEntity = exports.PurchaseOrderEntity = exports.SupplierEntity = exports.ChartOfAccountEntity = exports.SalesReturnItemEntity = exports.SalesReturnEntity = exports.ReceiptEntity = exports.SalesInvoiceItemEntity = exports.SalesInvoiceEntity = exports.DeliveryNoteItemEntity = exports.DeliveryNoteEntity = exports.QuotationItemEntity = exports.QuotationEntity = exports.ExchangeRateEntity = exports.StockMovementEntity = exports.ProductEntity = void 0;
const typeorm_1 = require("typeorm");
let ProductEntity = class ProductEntity {
};
exports.ProductEntity = ProductEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'product_id' }),
    __metadata("design:type", String)
], ProductEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ProductEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_code' }),
    __metadata("design:type", String)
], ProductEntity.prototype, "productCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_name' }),
    __metadata("design:type", String)
], ProductEntity.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_name_ar', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "productNameAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', default: 'PCS' }),
    __metadata("design:type", String)
], ProductEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "costPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], ProductEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_inventory_item', default: true }),
    __metadata("design:type", Boolean)
], ProductEntity.prototype, "isInventoryItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'track_stock', default: true }),
    __metadata("design:type", Boolean)
], ProductEntity.prototype, "trackStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock_qty', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "stockQty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_stock_qty', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "minStockQty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_account', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "revenueAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ProductEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProductEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ProductEntity.prototype, "updatedAt", void 0);
exports.ProductEntity = ProductEntity = __decorate([
    (0, typeorm_1.Entity)('products'),
    (0, typeorm_1.Index)(['tenantId', 'productCode'], { unique: true })
], ProductEntity);
let StockMovementEntity = class StockMovementEntity {
};
exports.StockMovementEntity = StockMovementEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'movement_id' }),
    __metadata("design:type", String)
], StockMovementEntity.prototype, "movementId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], StockMovementEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    __metadata("design:type", String)
], StockMovementEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'movement_type' }),
    __metadata("design:type", String)
], StockMovementEntity.prototype, "movementType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3 }),
    __metadata("design:type", Number)
], StockMovementEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], StockMovementEntity.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_type', nullable: true }),
    __metadata("design:type", String)
], StockMovementEntity.prototype, "referenceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_id', nullable: true }),
    __metadata("design:type", String)
], StockMovementEntity.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', nullable: true }),
    __metadata("design:type", String)
], StockMovementEntity.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StockMovementEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], StockMovementEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StockMovementEntity.prototype, "createdAt", void 0);
exports.StockMovementEntity = StockMovementEntity = __decorate([
    (0, typeorm_1.Entity)('stock_movements'),
    (0, typeorm_1.Index)(['tenantId', 'productId'])
], StockMovementEntity);
let ExchangeRateEntity = class ExchangeRateEntity {
};
exports.ExchangeRateEntity = ExchangeRateEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'rate_id' }),
    __metadata("design:type", String)
], ExchangeRateEntity.prototype, "rateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', nullable: true }),
    __metadata("design:type", String)
], ExchangeRateEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_currency', nullable: true }),
    __metadata("design:type", String)
], ExchangeRateEntity.prototype, "fromCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_currency', nullable: true, default: 'OMR' }),
    __metadata("design:type", String)
], ExchangeRateEntity.prototype, "toCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], ExchangeRateEntity.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], ExchangeRateEntity.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ExchangeRateEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ExchangeRateEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], ExchangeRateEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ExchangeRateEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ExchangeRateEntity.prototype, "updatedAt", void 0);
exports.ExchangeRateEntity = ExchangeRateEntity = __decorate([
    (0, typeorm_1.Entity)('exchange_rates')
], ExchangeRateEntity);
let QuotationEntity = class QuotationEntity {
};
exports.QuotationEntity = QuotationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'quotation_id' }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_number', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "quotationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "quotationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valid_until', type: 'date', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opportunity_id', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "opportunityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_id', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "contactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "customerAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_email', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "customerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_phone', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "customerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_trn', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "customerTrn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'terms_conditions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "termsConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], QuotationEntity.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_inventory', default: true }),
    __metadata("design:type", Boolean)
], QuotationEntity.prototype, "isInventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], QuotationEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], QuotationEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationEntity.prototype, "discountPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taxable_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], QuotationEntity.prototype, "taxableAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }),
    __metadata("design:type", Number)
], QuotationEntity.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], QuotationEntity.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], QuotationEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by_name', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "approvedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], QuotationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], QuotationEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => QuotationItemEntity, i => i.quotation, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], QuotationEntity.prototype, "items", void 0);
exports.QuotationEntity = QuotationEntity = __decorate([
    (0, typeorm_1.Entity)('quotations'),
    (0, typeorm_1.Index)(['tenantId'])
], QuotationEntity);
let QuotationItemEntity = class QuotationItemEntity {
};
exports.QuotationItemEntity = QuotationItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], QuotationItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_id' }),
    __metadata("design:type", String)
], QuotationItemEntity.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], QuotationItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], QuotationItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', nullable: true }),
    __metadata("design:type", String)
], QuotationItemEntity.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], QuotationItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', default: 'PCS' }),
    __metadata("design:type", String)
], QuotationItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], QuotationItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], QuotationItemEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationItemEntity.prototype, "discountPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], QuotationItemEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], QuotationItemEntity.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_taxable', default: true }),
    __metadata("design:type", Boolean)
], QuotationItemEntity.prototype, "isTaxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_account', nullable: true }),
    __metadata("design:type", String)
], QuotationItemEntity.prototype, "revenueAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QuotationItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => QuotationEntity, q => q.items),
    (0, typeorm_1.JoinColumn)({ name: 'quotation_id' }),
    __metadata("design:type", QuotationEntity)
], QuotationItemEntity.prototype, "quotation", void 0);
exports.QuotationItemEntity = QuotationItemEntity = __decorate([
    (0, typeorm_1.Entity)('quotation_items')
], QuotationItemEntity);
let DeliveryNoteEntity = class DeliveryNoteEntity {
};
exports.DeliveryNoteEntity = DeliveryNoteEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'dn_id' }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "dnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dn_number', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "dnNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dn_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "dnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_id', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_id', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "contactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "customerAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "deliveryAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], DeliveryNoteEntity.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_inventory', default: true }),
    __metadata("design:type", Boolean)
], DeliveryNoteEntity.prototype, "isInventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], DeliveryNoteEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], DeliveryNoteEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }),
    __metadata("design:type", Number)
], DeliveryNoteEntity.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], DeliveryNoteEntity.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], DeliveryNoteEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "deliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'received_by', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "receivedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DeliveryNoteEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DeliveryNoteEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DeliveryNoteItemEntity, i => i.deliveryNote, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], DeliveryNoteEntity.prototype, "items", void 0);
exports.DeliveryNoteEntity = DeliveryNoteEntity = __decorate([
    (0, typeorm_1.Entity)('delivery_notes'),
    (0, typeorm_1.Index)(['tenantId'])
], DeliveryNoteEntity);
let DeliveryNoteItemEntity = class DeliveryNoteItemEntity {
};
exports.DeliveryNoteItemEntity = DeliveryNoteItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], DeliveryNoteItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dn_id' }),
    __metadata("design:type", String)
], DeliveryNoteItemEntity.prototype, "dnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], DeliveryNoteItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteItemEntity.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DeliveryNoteItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', default: 'PCS' }),
    __metadata("design:type", String)
], DeliveryNoteItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], DeliveryNoteItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], DeliveryNoteItemEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DeliveryNoteItemEntity.prototype, "discountPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], DeliveryNoteItemEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], DeliveryNoteItemEntity.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_taxable', default: true }),
    __metadata("design:type", Boolean)
], DeliveryNoteItemEntity.prototype, "isTaxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_account', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteItemEntity.prototype, "revenueAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DeliveryNoteEntity, d => d.items),
    (0, typeorm_1.JoinColumn)({ name: 'dn_id' }),
    __metadata("design:type", DeliveryNoteEntity)
], DeliveryNoteItemEntity.prototype, "deliveryNote", void 0);
exports.DeliveryNoteItemEntity = DeliveryNoteItemEntity = __decorate([
    (0, typeorm_1.Entity)('delivery_note_items')
], DeliveryNoteItemEntity);
let SalesInvoiceEntity = class SalesInvoiceEntity {
};
exports.SalesInvoiceEntity = SalesInvoiceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'invoice_id' }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "invoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_id', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dn_id', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "dnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_id', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "contactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "customerAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_email', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "customerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_trn', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "customerTrn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], SalesInvoiceEntity.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_inventory', default: true }),
    __metadata("design:type", Boolean)
], SalesInvoiceEntity.prototype, "isInventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }),
    __metadata("design:type", Number)
], SalesInvoiceEntity.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceEntity.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceEntity.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_due', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceEntity.prototype, "balanceDue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'terms_conditions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "termsConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_terms', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SalesInvoiceEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SalesInvoiceEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SalesInvoiceItemEntity, i => i.invoice, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], SalesInvoiceEntity.prototype, "items", void 0);
exports.SalesInvoiceEntity = SalesInvoiceEntity = __decorate([
    (0, typeorm_1.Entity)('sales_invoices'),
    (0, typeorm_1.Index)(['tenantId'])
], SalesInvoiceEntity);
let SalesInvoiceItemEntity = class SalesInvoiceItemEntity {
};
exports.SalesInvoiceItemEntity = SalesInvoiceItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], SalesInvoiceItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id' }),
    __metadata("design:type", String)
], SalesInvoiceItemEntity.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], SalesInvoiceItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceItemEntity.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SalesInvoiceItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', default: 'PCS' }),
    __metadata("design:type", String)
], SalesInvoiceItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], SalesInvoiceItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceItemEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceItemEntity.prototype, "discountPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceItemEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesInvoiceItemEntity.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_taxable', default: true }),
    __metadata("design:type", Boolean)
], SalesInvoiceItemEntity.prototype, "isTaxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_account', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceItemEntity.prototype, "revenueAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SalesInvoiceEntity, i => i.items),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id' }),
    __metadata("design:type", SalesInvoiceEntity)
], SalesInvoiceItemEntity.prototype, "invoice", void 0);
exports.SalesInvoiceItemEntity = SalesInvoiceItemEntity = __decorate([
    (0, typeorm_1.Entity)('sales_invoice_items')
], SalesInvoiceItemEntity);
let ReceiptEntity = class ReceiptEntity {
};
exports.ReceiptEntity = ReceiptEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'receipt_id' }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "receiptId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_number', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "receiptNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "receiptDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3 }),
    __metadata("design:type", Number)
], ReceiptEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', default: 'BANK_TRANSFER' }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_reference', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'CONFIRMED' }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], ReceiptEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ReceiptEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ReceiptEntity.prototype, "updatedAt", void 0);
exports.ReceiptEntity = ReceiptEntity = __decorate([
    (0, typeorm_1.Entity)('receipts'),
    (0, typeorm_1.Index)(['tenantId'])
], ReceiptEntity);
let SalesReturnEntity = class SalesReturnEntity {
};
exports.SalesReturnEntity = SalesReturnEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'return_id' }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "returnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_number', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "returnNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "returnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dn_id', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "dnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_inventory', default: true }),
    __metadata("design:type", Boolean)
], SalesReturnEntity.prototype, "isInventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesReturnEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesReturnEntity.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesReturnEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_note_number', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "creditNoteNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], SalesReturnEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SalesReturnEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SalesReturnEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SalesReturnItemEntity, i => i.salesReturn, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], SalesReturnEntity.prototype, "items", void 0);
exports.SalesReturnEntity = SalesReturnEntity = __decorate([
    (0, typeorm_1.Entity)('sales_returns'),
    (0, typeorm_1.Index)(['tenantId'])
], SalesReturnEntity);
let SalesReturnItemEntity = class SalesReturnItemEntity {
};
exports.SalesReturnItemEntity = SalesReturnItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], SalesReturnItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_id' }),
    __metadata("design:type", String)
], SalesReturnItemEntity.prototype, "returnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], SalesReturnItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], SalesReturnItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', nullable: true }),
    __metadata("design:type", String)
], SalesReturnItemEntity.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SalesReturnItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', default: 'PCS' }),
    __metadata("design:type", String)
], SalesReturnItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], SalesReturnItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesReturnItemEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SalesReturnItemEntity.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_taxable', default: true }),
    __metadata("design:type", Boolean)
], SalesReturnItemEntity.prototype, "isTaxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_account', nullable: true }),
    __metadata("design:type", String)
], SalesReturnItemEntity.prototype, "revenueAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SalesReturnItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SalesReturnEntity, r => r.items),
    (0, typeorm_1.JoinColumn)({ name: 'return_id' }),
    __metadata("design:type", SalesReturnEntity)
], SalesReturnItemEntity.prototype, "salesReturn", void 0);
exports.SalesReturnItemEntity = SalesReturnItemEntity = __decorate([
    (0, typeorm_1.Entity)('sales_return_items')
], SalesReturnItemEntity);
let ChartOfAccountEntity = class ChartOfAccountEntity {
};
exports.ChartOfAccountEntity = ChartOfAccountEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'account_id' }),
    __metadata("design:type", String)
], ChartOfAccountEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', nullable: true }),
    __metadata("design:type", String)
], ChartOfAccountEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_code' }),
    __metadata("design:type", String)
], ChartOfAccountEntity.prototype, "accountCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name' }),
    __metadata("design:type", String)
], ChartOfAccountEntity.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name_ar', nullable: true }),
    __metadata("design:type", String)
], ChartOfAccountEntity.prototype, "accountNameAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_type' }),
    __metadata("design:type", String)
], ChartOfAccountEntity.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_subtype', nullable: true }),
    __metadata("design:type", String)
], ChartOfAccountEntity.prototype, "accountSubtype", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_account_id', nullable: true }),
    __metadata("design:type", String)
], ChartOfAccountEntity.prototype, "parentAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ChartOfAccountEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_system', default: false }),
    __metadata("design:type", Boolean)
], ChartOfAccountEntity.prototype, "isSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ChartOfAccountEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ChartOfAccountEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ChartOfAccountEntity.prototype, "updatedAt", void 0);
exports.ChartOfAccountEntity = ChartOfAccountEntity = __decorate([
    (0, typeorm_1.Entity)('chart_of_accounts')
], ChartOfAccountEntity);
let SupplierEntity = class SupplierEntity {
};
exports.SupplierEntity = SupplierEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'supplier_id' }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_code' }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "supplierCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name' }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name_ar', nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "supplierNameAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_person', nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "contactPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'Oman' }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "trn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_terms', nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_limit', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], SupplierEntity.prototype, "creditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account', nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_iban', nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "bankIban", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], SupplierEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], SupplierEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SupplierEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SupplierEntity.prototype, "updatedAt", void 0);
exports.SupplierEntity = SupplierEntity = __decorate([
    (0, typeorm_1.Entity)('suppliers'),
    (0, typeorm_1.Index)(['tenantId', 'supplierCode'], { unique: true })
], SupplierEntity);
let PurchaseOrderEntity = class PurchaseOrderEntity {
};
exports.PurchaseOrderEntity = PurchaseOrderEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'po_id' }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "poId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'po_number', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "poNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'po_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "poDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "expectedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "supplierAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_email', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "supplierEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_trn', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "supplierTrn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], PurchaseOrderEntity.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_inventory', default: true }),
    __metadata("design:type", Boolean)
], PurchaseOrderEntity.prototype, "isInventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderEntity.prototype, "discountPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taxable_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderEntity.prototype, "taxableAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }),
    __metadata("design:type", Number)
], PurchaseOrderEntity.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderEntity.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'terms_conditions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "termsConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by_name', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "approvedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PurchaseOrderEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PurchaseOrderEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PurchaseOrderItemEntity, i => i.purchaseOrder, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], PurchaseOrderEntity.prototype, "items", void 0);
exports.PurchaseOrderEntity = PurchaseOrderEntity = __decorate([
    (0, typeorm_1.Entity)('purchase_orders'),
    (0, typeorm_1.Index)(['tenantId'])
], PurchaseOrderEntity);
let PurchaseOrderItemEntity = class PurchaseOrderItemEntity {
};
exports.PurchaseOrderItemEntity = PurchaseOrderItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], PurchaseOrderItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'po_id' }),
    __metadata("design:type", String)
], PurchaseOrderItemEntity.prototype, "poId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], PurchaseOrderItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderItemEntity.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PurchaseOrderItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', default: 'PCS' }),
    __metadata("design:type", String)
], PurchaseOrderItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], PurchaseOrderItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderItemEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderItemEntity.prototype, "discountPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderItemEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderItemEntity.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'received_qty', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderItemEntity.prototype, "receivedQty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_taxable', default: true }),
    __metadata("design:type", Boolean)
], PurchaseOrderItemEntity.prototype, "isTaxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PurchaseOrderItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PurchaseOrderEntity, p => p.items),
    (0, typeorm_1.JoinColumn)({ name: 'po_id' }),
    __metadata("design:type", PurchaseOrderEntity)
], PurchaseOrderItemEntity.prototype, "purchaseOrder", void 0);
exports.PurchaseOrderItemEntity = PurchaseOrderItemEntity = __decorate([
    (0, typeorm_1.Entity)('purchase_order_items')
], PurchaseOrderItemEntity);
let GoodsReceiptNoteEntity = class GoodsReceiptNoteEntity {
};
exports.GoodsReceiptNoteEntity = GoodsReceiptNoteEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'grn_id' }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "grnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grn_number', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "grnNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grn_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "grnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'po_id', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "poId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_note_ref', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "deliveryNoteRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteEntity.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_inventory', default: true }),
    __metadata("design:type", Boolean)
], GoodsReceiptNoteEntity.prototype, "isInventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteEntity.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteEntity.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'received_by', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "receivedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], GoodsReceiptNoteEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], GoodsReceiptNoteEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => GoodsReceiptNoteItemEntity, i => i.grn, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], GoodsReceiptNoteEntity.prototype, "items", void 0);
exports.GoodsReceiptNoteEntity = GoodsReceiptNoteEntity = __decorate([
    (0, typeorm_1.Entity)('goods_receipt_notes'),
    (0, typeorm_1.Index)(['tenantId'])
], GoodsReceiptNoteEntity);
let GoodsReceiptNoteItemEntity = class GoodsReceiptNoteItemEntity {
};
exports.GoodsReceiptNoteItemEntity = GoodsReceiptNoteItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], GoodsReceiptNoteItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grn_id' }),
    __metadata("design:type", String)
], GoodsReceiptNoteItemEntity.prototype, "grnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'po_item_id', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteItemEntity.prototype, "poItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteItemEntity.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GoodsReceiptNoteItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', default: 'PCS' }),
    __metadata("design:type", String)
], GoodsReceiptNoteItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteItemEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteItemEntity.prototype, "discountPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteItemEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], GoodsReceiptNoteItemEntity.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_taxable', default: true }),
    __metadata("design:type", Boolean)
], GoodsReceiptNoteItemEntity.prototype, "isTaxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GoodsReceiptNoteItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => GoodsReceiptNoteEntity, g => g.items),
    (0, typeorm_1.JoinColumn)({ name: 'grn_id' }),
    __metadata("design:type", GoodsReceiptNoteEntity)
], GoodsReceiptNoteItemEntity.prototype, "grn", void 0);
exports.GoodsReceiptNoteItemEntity = GoodsReceiptNoteItemEntity = __decorate([
    (0, typeorm_1.Entity)('goods_receipt_note_items')
], GoodsReceiptNoteItemEntity);
let PurchaseInvoiceEntity = class PurchaseInvoiceEntity {
};
exports.PurchaseInvoiceEntity = PurchaseInvoiceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'invoice_id' }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_invoice_no', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "supplierInvoiceNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "invoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'po_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "poId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grn_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "grnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "supplierAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_trn', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "supplierTrn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], PurchaseInvoiceEntity.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_inventory', default: true }),
    __metadata("design:type", Boolean)
], PurchaseInvoiceEntity.prototype, "isInventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }),
    __metadata("design:type", Number)
], PurchaseInvoiceEntity.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceEntity.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceEntity.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_due', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceEntity.prototype, "balanceDue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_terms', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PurchaseInvoiceEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PurchaseInvoiceEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PurchaseInvoiceItemEntity, i => i.invoice, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], PurchaseInvoiceEntity.prototype, "items", void 0);
exports.PurchaseInvoiceEntity = PurchaseInvoiceEntity = __decorate([
    (0, typeorm_1.Entity)('purchase_invoices'),
    (0, typeorm_1.Index)(['tenantId'])
], PurchaseInvoiceEntity);
let PurchaseInvoiceItemEntity = class PurchaseInvoiceItemEntity {
};
exports.PurchaseInvoiceItemEntity = PurchaseInvoiceItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], PurchaseInvoiceItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id' }),
    __metadata("design:type", String)
], PurchaseInvoiceItemEntity.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], PurchaseInvoiceItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceItemEntity.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PurchaseInvoiceItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', default: 'PCS' }),
    __metadata("design:type", String)
], PurchaseInvoiceItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], PurchaseInvoiceItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceItemEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceItemEntity.prototype, "discountPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceItemEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceItemEntity.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_taxable', default: true }),
    __metadata("design:type", Boolean)
], PurchaseInvoiceItemEntity.prototype, "isTaxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expense_account', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceItemEntity.prototype, "expenseAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PurchaseInvoiceEntity, i => i.items),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id' }),
    __metadata("design:type", PurchaseInvoiceEntity)
], PurchaseInvoiceItemEntity.prototype, "invoice", void 0);
exports.PurchaseInvoiceItemEntity = PurchaseInvoiceItemEntity = __decorate([
    (0, typeorm_1.Entity)('purchase_invoice_items')
], PurchaseInvoiceItemEntity);
let PaymentVoucherEntity = class PaymentVoucherEntity {
};
exports.PaymentVoucherEntity = PaymentVoucherEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'voucher_id' }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "voucherId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voucher_number', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "voucherNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voucher_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "voucherDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3 }),
    __metadata("design:type", Number)
], PaymentVoucherEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', default: 'BANK_TRANSFER' }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_reference', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cheque_number', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "chequeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cheque_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "chequeDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by_name', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "approvedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], PaymentVoucherEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PaymentVoucherEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PaymentVoucherEntity.prototype, "updatedAt", void 0);
exports.PaymentVoucherEntity = PaymentVoucherEntity = __decorate([
    (0, typeorm_1.Entity)('payment_vouchers'),
    (0, typeorm_1.Index)(['tenantId'])
], PaymentVoucherEntity);
let PurchaseReturnEntity = class PurchaseReturnEntity {
};
exports.PurchaseReturnEntity = PurchaseReturnEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'return_id' }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "returnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_number', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "returnNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "returnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grn_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "grnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_inventory', default: true }),
    __metadata("design:type", Boolean)
], PurchaseReturnEntity.prototype, "isInventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseReturnEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseReturnEntity.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseReturnEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debit_note_number', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "debitNoteNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PurchaseReturnEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PurchaseReturnEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PurchaseReturnItemEntity, i => i.purchaseReturn, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], PurchaseReturnEntity.prototype, "items", void 0);
exports.PurchaseReturnEntity = PurchaseReturnEntity = __decorate([
    (0, typeorm_1.Entity)('purchase_returns'),
    (0, typeorm_1.Index)(['tenantId'])
], PurchaseReturnEntity);
let PurchaseReturnItemEntity = class PurchaseReturnItemEntity {
};
exports.PurchaseReturnItemEntity = PurchaseReturnItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], PurchaseReturnItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_id' }),
    __metadata("design:type", String)
], PurchaseReturnItemEntity.prototype, "returnId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], PurchaseReturnItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnItemEntity.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PurchaseReturnItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', default: 'PCS' }),
    __metadata("design:type", String)
], PurchaseReturnItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], PurchaseReturnItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseReturnItemEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseReturnItemEntity.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_taxable', default: true }),
    __metadata("design:type", Boolean)
], PurchaseReturnItemEntity.prototype, "isTaxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PurchaseReturnItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PurchaseReturnEntity, r => r.items),
    (0, typeorm_1.JoinColumn)({ name: 'return_id' }),
    __metadata("design:type", PurchaseReturnEntity)
], PurchaseReturnItemEntity.prototype, "purchaseReturn", void 0);
exports.PurchaseReturnItemEntity = PurchaseReturnItemEntity = __decorate([
    (0, typeorm_1.Entity)('purchase_return_items')
], PurchaseReturnItemEntity);
//# sourceMappingURL=sales.entities.js.map