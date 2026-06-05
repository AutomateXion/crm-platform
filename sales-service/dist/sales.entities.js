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
exports.DocumentSignatureEntity = exports.AssetTransferEntity = exports.AssetMaintenanceEntity = exports.AssetDepreciationEntity = exports.FixedAssetEntity = exports.StockAdjustmentItemEntity = exports.StockAdjustmentEntity = exports.StockTransferItemEntity = exports.StockTransferEntity = exports.WarehouseLocationEntity = exports.WarehouseEntity = exports.JournalVoucherLineEntity = exports.JournalVoucherEntity = exports.PurchaseReturnItemEntity = exports.PurchaseReturnEntity = exports.PaymentVoucherEntity = exports.PurchaseInvoiceItemEntity = exports.PurchaseInvoiceEntity = exports.GoodsReceiptNoteItemEntity = exports.GoodsReceiptNoteEntity = exports.PurchaseOrderItemEntity = exports.PurchaseOrderEntity = exports.SupplierEntity = exports.ChartOfAccountEntity = exports.SalesReturnItemEntity = exports.SalesReturnEntity = exports.ReceiptEntity = exports.SalesInvoiceItemEntity = exports.SalesInvoiceEntity = exports.DeliveryNoteItemEntity = exports.DeliveryNoteEntity = exports.QuotationItemEntity = exports.QuotationEntity = exports.ExchangeRateEntity = exports.StockMovementEntity = exports.ProductEntity = void 0;
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
    (0, typeorm_1.Column)({ name: 'product_type', default: 'STOCK' }),
    __metadata("design:type", String)
], ProductEntity.prototype, "productType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'country_of_origin', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "countryOfOrigin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'part_number', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "partNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'design_number', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "designNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'model_number', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "modelNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hs_code', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "hsCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_category', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "taxCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reorder_point', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "reorderPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reorder_qty', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "reorderQty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'track_serial', default: false }),
    __metadata("design:type", Boolean)
], ProductEntity.prototype, "trackSerial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'track_batch', default: false }),
    __metadata("design:type", Boolean)
], ProductEntity.prototype, "trackBatch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'track_expiry', default: false }),
    __metadata("design:type", Boolean)
], ProductEntity.prototype, "trackExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shelf_life_days', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "shelfLifeDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alt_uom', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "altUom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alt_uom_conversion', type: 'decimal', precision: 18, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "altUomConversion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alt_uom_label', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "altUomLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weight_unit', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "weightUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "length", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dimension_unit', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "dimensionUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opening_stock', type: 'decimal', precision: 18, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "openingStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opening_stock_value', type: 'decimal', precision: 18, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "openingStockValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opening_stock_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "openingStockDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warehouse_id', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_id', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_category', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "assetCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'useful_life_years', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "usefulLifeYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'depreciation_method', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "depreciationMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salvage_value', type: 'decimal', precision: 18, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "salvageValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_account', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "assetAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expense_account', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "expenseAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_consumable_qty', type: 'decimal', precision: 18, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "minConsumableQty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "productNotes", void 0);
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
    (0, typeorm_1.Column)({ name: 'salesman_id', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "salesmanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salesman_name', nullable: true }),
    __metadata("design:type", String)
], QuotationEntity.prototype, "salesmanName", void 0);
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
    (0, typeorm_1.Column)({ name: 'salesman_id', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "salesmanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salesman_name', nullable: true }),
    __metadata("design:type", String)
], DeliveryNoteEntity.prototype, "salesmanName", void 0);
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
    (0, typeorm_1.Column)({ name: 'salesman_id', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "salesmanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salesman_name', nullable: true }),
    __metadata("design:type", String)
], SalesInvoiceEntity.prototype, "salesmanName", void 0);
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
let JournalVoucherEntity = class JournalVoucherEntity {
};
exports.JournalVoucherEntity = JournalVoucherEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'voucher_id' }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "voucherId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voucher_number', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "voucherNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voucher_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "voucherDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voucher_type', default: 'JOURNAL' }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "voucherType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], JournalVoucherEntity.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_posted', default: false }),
    __metadata("design:type", Boolean)
], JournalVoucherEntity.prototype, "isPosted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'posted_at', nullable: true }),
    __metadata("design:type", Date)
], JournalVoucherEntity.prototype, "postedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'posted_by', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "postedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'posted_by_name', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "postedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_debit', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], JournalVoucherEntity.prototype, "totalDebit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_credit', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], JournalVoucherEntity.prototype, "totalCredit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by_name', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "approvedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], JournalVoucherEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], JournalVoucherEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => JournalVoucherLineEntity, l => l.voucher, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], JournalVoucherEntity.prototype, "lines", void 0);
exports.JournalVoucherEntity = JournalVoucherEntity = __decorate([
    (0, typeorm_1.Entity)('journal_vouchers'),
    (0, typeorm_1.Index)(['tenantId'])
], JournalVoucherEntity);
let JournalVoucherLineEntity = class JournalVoucherLineEntity {
};
exports.JournalVoucherLineEntity = JournalVoucherLineEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'line_id' }),
    __metadata("design:type", String)
], JournalVoucherLineEntity.prototype, "lineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voucher_id' }),
    __metadata("design:type", String)
], JournalVoucherLineEntity.prototype, "voucherId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], JournalVoucherLineEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherLineEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_code', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherLineEntity.prototype, "accountCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherLineEntity.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JournalVoucherLineEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debit_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], JournalVoucherLineEntity.prototype, "debitAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], JournalVoucherLineEntity.prototype, "creditAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', nullable: true }),
    __metadata("design:type", String)
], JournalVoucherLineEntity.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JournalVoucherLineEntity.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JournalVoucherLineEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => JournalVoucherEntity, v => v.lines),
    (0, typeorm_1.JoinColumn)({ name: 'voucher_id' }),
    __metadata("design:type", JournalVoucherEntity)
], JournalVoucherLineEntity.prototype, "voucher", void 0);
exports.JournalVoucherLineEntity = JournalVoucherLineEntity = __decorate([
    (0, typeorm_1.Entity)('journal_voucher_lines')
], JournalVoucherLineEntity);
let WarehouseEntity = class WarehouseEntity {
};
exports.WarehouseEntity = WarehouseEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'warehouse_id' }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warehouse_code' }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "warehouseCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warehouse_name' }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "warehouseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warehouse_type', default: 'MAIN' }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "warehouseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'Oman' }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', nullable: true }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_name', nullable: true }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "managerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], WarehouseEntity.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], WarehouseEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], WarehouseEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WarehouseEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WarehouseEntity.prototype, "updatedAt", void 0);
exports.WarehouseEntity = WarehouseEntity = __decorate([
    (0, typeorm_1.Entity)('warehouses'),
    (0, typeorm_1.Index)(['tenantId', 'warehouseCode'], { unique: true })
], WarehouseEntity);
let WarehouseLocationEntity = class WarehouseLocationEntity {
};
exports.WarehouseLocationEntity = WarehouseLocationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'location_id' }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warehouse_id' }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_code' }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "locationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_name', nullable: true }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "locationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "zone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "rack", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "shelf", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "bin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], WarehouseLocationEntity.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], WarehouseLocationEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WarehouseLocationEntity.prototype, "notes", void 0);
exports.WarehouseLocationEntity = WarehouseLocationEntity = __decorate([
    (0, typeorm_1.Entity)('warehouse_locations')
], WarehouseLocationEntity);
let StockTransferEntity = class StockTransferEntity {
};
exports.StockTransferEntity = StockTransferEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'transfer_id' }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "transferId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transfer_number', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "transferNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transfer_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "transferDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_warehouse_id', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "fromWarehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_warehouse', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "fromWarehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_warehouse_id', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "toWarehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_warehouse', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "toWarehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], StockTransferEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StockTransferEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StockTransferEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StockTransferItemEntity, i => i.transfer, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], StockTransferEntity.prototype, "items", void 0);
exports.StockTransferEntity = StockTransferEntity = __decorate([
    (0, typeorm_1.Entity)('stock_transfers'),
    (0, typeorm_1.Index)(['tenantId'])
], StockTransferEntity);
let StockTransferItemEntity = class StockTransferItemEntity {
};
exports.StockTransferItemEntity = StockTransferItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], StockTransferItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transfer_id' }),
    __metadata("design:type", String)
], StockTransferItemEntity.prototype, "transferId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], StockTransferItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_code', nullable: true }),
    __metadata("design:type", String)
], StockTransferItemEntity.prototype, "productCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_name', nullable: true }),
    __metadata("design:type", String)
], StockTransferItemEntity.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_location_id', nullable: true }),
    __metadata("design:type", String)
], StockTransferItemEntity.prototype, "fromLocationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_location_id', nullable: true }),
    __metadata("design:type", String)
], StockTransferItemEntity.prototype, "toLocationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], StockTransferItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', nullable: true }),
    __metadata("design:type", String)
], StockTransferItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StockTransferItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], StockTransferItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StockTransferEntity, t => t.items),
    (0, typeorm_1.JoinColumn)({ name: 'transfer_id' }),
    __metadata("design:type", StockTransferEntity)
], StockTransferItemEntity.prototype, "transfer", void 0);
exports.StockTransferItemEntity = StockTransferItemEntity = __decorate([
    (0, typeorm_1.Entity)('stock_transfer_items')
], StockTransferItemEntity);
let StockAdjustmentEntity = class StockAdjustmentEntity {
};
exports.StockAdjustmentEntity = StockAdjustmentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'adjustment_id' }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "adjustmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_number', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "adjustmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "adjustmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_type', default: 'IN' }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "adjustmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warehouse_id', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warehouse_name', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "warehouseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'DRAFT' }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "preparedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prepared_by_name', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "preparedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StockAdjustmentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StockAdjustmentEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StockAdjustmentItemEntity, i => i.adjustment, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], StockAdjustmentEntity.prototype, "items", void 0);
exports.StockAdjustmentEntity = StockAdjustmentEntity = __decorate([
    (0, typeorm_1.Entity)('stock_adjustments'),
    (0, typeorm_1.Index)(['tenantId'])
], StockAdjustmentEntity);
let StockAdjustmentItemEntity = class StockAdjustmentItemEntity {
};
exports.StockAdjustmentItemEntity = StockAdjustmentItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'item_id' }),
    __metadata("design:type", String)
], StockAdjustmentItemEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_id' }),
    __metadata("design:type", String)
], StockAdjustmentItemEntity.prototype, "adjustmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_code', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentItemEntity.prototype, "productCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_name', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentItemEntity.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_id', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentItemEntity.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], StockAdjustmentItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], StockAdjustmentItemEntity.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StockAdjustmentItemEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', default: 1 }),
    __metadata("design:type", Number)
], StockAdjustmentItemEntity.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StockAdjustmentEntity, a => a.items),
    (0, typeorm_1.JoinColumn)({ name: 'adjustment_id' }),
    __metadata("design:type", StockAdjustmentEntity)
], StockAdjustmentItemEntity.prototype, "adjustment", void 0);
exports.StockAdjustmentItemEntity = StockAdjustmentItemEntity = __decorate([
    (0, typeorm_1.Entity)('stock_adjustment_items')
], StockAdjustmentItemEntity);
let FixedAssetEntity = class FixedAssetEntity {
};
exports.FixedAssetEntity = FixedAssetEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'asset_id' }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_code', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "assetCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_name' }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "assetName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_category', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "subCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'serial_number', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_cost', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], FixedAssetEntity.prototype, "purchaseCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'useful_life_years', type: 'decimal', precision: 5, scale: 2, default: 5 }),
    __metadata("design:type", Number)
], FixedAssetEntity.prototype, "usefulLifeYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salvage_value', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], FixedAssetEntity.prototype, "salvageValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'depreciation_method', default: 'STRAIGHT_LINE' }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "depreciationMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'depreciation_rate', type: 'decimal', precision: 8, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], FixedAssetEntity.prototype, "depreciationRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accumulated_depreciation', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], FixedAssetEntity.prototype, "accumulatedDepreciation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_book_value', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], FixedAssetEntity.prototype, "currentBookValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ACTIVE' }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'GOOD' }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_name', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "locationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_address', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "locationAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], FixedAssetEntity.prototype, "locationLat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], FixedAssetEntity.prototype, "locationLng", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to_id', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "assignedToId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to_name', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "assignedToName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coa_asset_account', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "coaAssetAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coa_accum_depr_account', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "coaAccumDeprAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coa_depr_expense_account', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "coaDeprExpenseAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warranty_expiry', type: 'date', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "warrantyExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_expiry', type: 'date', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "insuranceExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_maintenance_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "lastMaintenanceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_maintenance_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "nextMaintenanceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], FixedAssetEntity.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], FixedAssetEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], FixedAssetEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disposed_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "disposedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disposal_reason', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "disposalReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disposal_value', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], FixedAssetEntity.prototype, "disposalValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], FixedAssetEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FixedAssetEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FixedAssetEntity.prototype, "updatedAt", void 0);
exports.FixedAssetEntity = FixedAssetEntity = __decorate([
    (0, typeorm_1.Entity)('fixed_assets')
], FixedAssetEntity);
let AssetDepreciationEntity = class AssetDepreciationEntity {
};
exports.AssetDepreciationEntity = AssetDepreciationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'depreciation_id' }),
    __metadata("design:type", String)
], AssetDepreciationEntity.prototype, "depreciationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], AssetDepreciationEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_id', nullable: true }),
    __metadata("design:type", String)
], AssetDepreciationEntity.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_year' }),
    __metadata("design:type", Number)
], AssetDepreciationEntity.prototype, "periodYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_month' }),
    __metadata("design:type", Number)
], AssetDepreciationEntity.prototype, "periodMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opening_value', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], AssetDepreciationEntity.prototype, "openingValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'depreciation_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], AssetDepreciationEntity.prototype, "depreciationAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'closing_value', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], AssetDepreciationEntity.prototype, "closingValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accumulated_depreciation', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], AssetDepreciationEntity.prototype, "accumulatedDepreciation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'journal_voucher_id', nullable: true }),
    __metadata("design:type", String)
], AssetDepreciationEntity.prototype, "journalVoucherId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'PENDING' }),
    __metadata("design:type", String)
], AssetDepreciationEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'posted_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], AssetDepreciationEntity.prototype, "postedDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AssetDepreciationEntity.prototype, "createdAt", void 0);
exports.AssetDepreciationEntity = AssetDepreciationEntity = __decorate([
    (0, typeorm_1.Entity)('asset_depreciation')
], AssetDepreciationEntity);
let AssetMaintenanceEntity = class AssetMaintenanceEntity {
};
exports.AssetMaintenanceEntity = AssetMaintenanceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'maintenance_id' }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "maintenanceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_id', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maintenance_type', default: 'PREVENTIVE' }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "maintenanceType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "completedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_due_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "nextDueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'frequency_days', nullable: true }),
    __metadata("design:type", Number)
], AssetMaintenanceEntity.prototype, "frequencyDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'technician_id', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "technicianId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'technician_name', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "technicianName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'engineer_id', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "engineerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'engineer_name', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "engineerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'SCHEDULED' }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'MEDIUM' }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], AssetMaintenanceEntity.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parts_used', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "partsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "findings", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], AssetMaintenanceEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AssetMaintenanceEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AssetMaintenanceEntity.prototype, "updatedAt", void 0);
exports.AssetMaintenanceEntity = AssetMaintenanceEntity = __decorate([
    (0, typeorm_1.Entity)('asset_maintenance')
], AssetMaintenanceEntity);
let AssetTransferEntity = class AssetTransferEntity {
};
exports.AssetTransferEntity = AssetTransferEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'transfer_id' }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "transferId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_id', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transfer_date', type: 'date' }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "transferDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_department', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "fromDepartment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_location', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "fromLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_user_name', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "fromUserName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_department', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "toDepartment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_location', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "toLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_user_id', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "toUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_user_name', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "toUserName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'COMPLETED' }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], AssetTransferEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AssetTransferEntity.prototype, "createdAt", void 0);
exports.AssetTransferEntity = AssetTransferEntity = __decorate([
    (0, typeorm_1.Entity)('asset_transfers')
], AssetTransferEntity);
let DocumentSignatureEntity = class DocumentSignatureEntity {
};
exports.DocumentSignatureEntity = DocumentSignatureEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'signature_id' }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "signatureId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doc_type' }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "docType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doc_id' }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "docId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signer_name' }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "signerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signer_title', nullable: true }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "signerTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_image', type: 'text' }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "signatureImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gps_lat', type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], DocumentSignatureEntity.prototype, "gpsLat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gps_lng', type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], DocumentSignatureEntity.prototype, "gpsLng", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', nullable: true }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signed_at', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], DocumentSignatureEntity.prototype, "signedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], DocumentSignatureEntity.prototype, "createdBy", void 0);
exports.DocumentSignatureEntity = DocumentSignatureEntity = __decorate([
    (0, typeorm_1.Entity)('document_signatures'),
    (0, typeorm_1.Index)(['tenantId', 'docType', 'docId'])
], DocumentSignatureEntity);
//# sourceMappingURL=sales.entities.js.map