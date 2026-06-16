import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';

// ── Products ──────────────────────────────────────────────────────
@Entity('products')
@Index(['tenantId', 'productCode'], { unique: true })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' }) productId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'product_code' }) productCode: string;
  @Column({ name: 'product_name' }) productName: string;
  @Column({ name: 'product_type', default: 'STOCK' }) productType: string;
  @Column({ nullable: true }) brand: string;
  @Column({ nullable: true }) manufacturer: string;
  @Column({ name: 'country_of_origin', nullable: true }) countryOfOrigin: string;
  @Column({ name: 'part_number', nullable: true }) partNumber: string;
  @Column({ name: 'design_number', nullable: true }) designNumber: string;
  @Column({ name: 'model_number', nullable: true }) modelNumber: string;
  @Column({ name: 'hs_code', nullable: true }) hsCode: string;
  @Column({ name: 'tax_category', nullable: true }) taxCategory: string;
  @Column({ name: 'reorder_point', type: 'decimal', precision: 18, scale: 3, default: 0 }) reorderPoint: number;
  @Column({ name: 'reorder_qty', type: 'decimal', precision: 18, scale: 3, default: 0 }) reorderQty: number;
  @Column({ name: 'track_serial', default: false }) trackSerial: boolean;
  @Column({ name: 'track_batch', default: false }) trackBatch: boolean;
  @Column({ name: 'track_expiry', default: false }) trackExpiry: boolean;
  @Column({ name: 'shelf_life_days', type: 'int', nullable: true }) shelfLifeDays: number;
  @Column({ name: 'alt_uom', nullable: true }) altUom: string;
  @Column({ name: 'alt_uom_conversion', type: 'decimal', precision: 18, scale: 6, nullable: true }) altUomConversion: number;
  @Column({ name: 'alt_uom_label', nullable: true }) altUomLabel: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, nullable: true }) weight: number;
  @Column({ name: 'weight_unit', nullable: true }) weightUnit: string;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true }) length: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true }) width: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true }) height: number;
  @Column({ name: 'dimension_unit', nullable: true }) dimensionUnit: string;
  @Column({ name: 'opening_stock', type: 'decimal', precision: 18, scale: 3, nullable: true }) openingStock: number;
  @Column({ name: 'opening_stock_value', type: 'decimal', precision: 18, scale: 3, nullable: true }) openingStockValue: number;
  @Column({ name: 'opening_stock_date', type: 'date', nullable: true }) openingStockDate: string;
  @Column({ name: 'warehouse_id', nullable: true }) warehouseId: string;
  @Column({ name: 'location_id', nullable: true }) locationId: string;
  @Column({ name: 'asset_category', nullable: true }) assetCategory: string;
  @Column({ name: 'useful_life_years', type: 'decimal', precision: 5, scale: 2, nullable: true }) usefulLifeYears: number;
  @Column({ name: 'depreciation_method', nullable: true }) depreciationMethod: string;
  @Column({ name: 'salvage_value', type: 'decimal', precision: 18, scale: 3, nullable: true }) salvageValue: number;
  @Column({ name: 'asset_account', nullable: true }) assetAccount: string;
  @Column({ name: 'expense_account', nullable: true }) expenseAccount: string;
  @Column({ name: 'min_consumable_qty', type: 'decimal', precision: 18, scale: 3, nullable: true }) minConsumableQty: number;
  @Column({ name: 'product_notes', type: 'text', nullable: true }) productNotes: string;
  @Column({ name: 'product_name_ar', nullable: true }) productNameAr: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) category: string;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'cost_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) costPrice: number;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'is_inventory_item', default: true }) isInventoryItem: boolean;
  @Column({ name: 'track_stock', default: true }) trackStock: boolean;
  @Column({ name: 'stock_qty', type: 'decimal', precision: 18, scale: 3, default: 0 }) stockQty: number;
  @Column({ name: 'min_stock_qty', type: 'decimal', precision: 18, scale: 3, default: 0 }) minStockQty: number;
  @Column({ name: 'revenue_account', nullable: true }) revenueAccount: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ── Stock Movements ───────────────────────────────────────────────
@Entity('stock_movements')
@Index(['tenantId', 'productId'])
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'movement_id' }) movementId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'product_id' }) productId: string;
  @Column({ name: 'movement_type' }) movementType: string;
  @Column({ type: 'decimal', precision: 18, scale: 3 }) quantity: number;
  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitCost: number;
  @Column({ name: 'reference_type', nullable: true }) referenceType: string;
  @Column({ name: 'reference_id', nullable: true }) referenceId: string;
  @Column({ name: 'reference_number', nullable: true }) referenceNumber: string;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

// ── Exchange Rates ────────────────────────────────────────────────
@Entity('exchange_rates')
export class ExchangeRateEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'rate_id' }) rateId: string;
  @Column({ name: 'tenant_id', nullable: true }) tenantId: string;
  @Column({ name: 'from_currency', nullable: true }) fromCurrency: string;
  @Column({ name: 'to_currency', nullable: true, default: 'OMR' }) toCurrency: string;
  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true }) rate: number;
  @Column({ name: 'effective_date', type: 'date', nullable: true }) effectiveDate: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ── Quotations ────────────────────────────────────────────────────
@Entity('quotations')
@Index(['tenantId'])
export class QuotationEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'quotation_id' }) quotationId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'quotation_number', nullable: true }) quotationNumber: string;
  @Column({ name: 'quotation_date', type: 'date', nullable: true }) quotationDate: string;
  @Column({ name: 'valid_until', type: 'date', nullable: true }) validUntil: string;
  @Column({ name: 'opportunity_id', nullable: true }) opportunityId: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'contact_id', nullable: true }) contactId: string;
  @Column({ name: 'customer_name', nullable: true }) customerName: string;
  @Column({ name: 'customer_address', type: 'text', nullable: true }) customerAddress: string;
  @Column({ name: 'customer_email', nullable: true }) customerEmail: string;
  @Column({ name: 'customer_phone', nullable: true }) customerPhone: string;
  @Column({ name: 'customer_trn', nullable: true }) customerTrn: string;
  @Column({ nullable: true }) subject: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ name: 'terms_conditions', type: 'text', nullable: true }) termsConditions: string;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }) exchangeRate: number;
  @Column({ name: 'is_inventory', default: true }) isInventory: boolean;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 }) subtotal: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'taxable_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) taxableAmount: number;
  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }) vatRate: number;
  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) vatAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalAmount: number;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'approved_by', nullable: true }) approvedBy: string;
  @Column({ name: 'approved_by_name', nullable: true }) approvedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @Column({ name: 'salesman_id', nullable: true }) salesmanId: string;
  @Column({ name: 'salesman_name', nullable: true }) salesmanName: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => QuotationItemEntity, i => i.quotation, { cascade: true, eager: true })
  items: QuotationItemEntity[];
}

// ── Quotation Items ───────────────────────────────────────────────
@Entity('quotation_items')
export class QuotationItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'quotation_id' }) quotationId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @Column({ name: 'item_code', nullable: true }) itemCode: string;
  @Column() description: string;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }) lineTotal: number;
  @Column({ name: 'is_taxable', default: true }) isTaxable: boolean;
  @Column({ name: 'revenue_account', nullable: true }) revenueAccount: string;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => QuotationEntity, q => q.items)
  @JoinColumn({ name: 'quotation_id' })
  quotation: QuotationEntity;
}

// ── Delivery Notes ────────────────────────────────────────────────
@Entity('delivery_notes')
@Index(['tenantId'])
export class DeliveryNoteEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'dn_id' }) dnId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'dn_number', nullable: true }) dnNumber: string;
  @Column({ name: 'dn_date', type: 'date', nullable: true }) dnDate: string;
  @Column({ name: 'quotation_id', nullable: true }) quotationId: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'contact_id', nullable: true }) contactId: string;
  @Column({ name: 'customer_name', nullable: true }) customerName: string;
  @Column({ name: 'customer_address', type: 'text', nullable: true }) customerAddress: string;
  @Column({ name: 'delivery_address', type: 'text', nullable: true }) deliveryAddress: string;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }) exchangeRate: number;
  @Column({ name: 'is_inventory', default: true }) isInventory: boolean;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 }) subtotal: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }) vatRate: number;
  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) vatAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalAmount: number;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'delivery_date', type: 'date', nullable: true }) deliveryDate: string;
  @Column({ name: 'received_by', nullable: true }) receivedBy: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @Column({ name: 'salesman_id', nullable: true }) salesmanId: string;
  @Column({ name: 'salesman_name', nullable: true }) salesmanName: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => DeliveryNoteItemEntity, i => i.deliveryNote, { cascade: true, eager: true })
  items: DeliveryNoteItemEntity[];
}

// ── Delivery Note Items ───────────────────────────────────────────
@Entity('delivery_note_items')
export class DeliveryNoteItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'dn_id' }) dnId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @Column({ name: 'item_code', nullable: true }) itemCode: string;
  @Column() description: string;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }) lineTotal: number;
  @Column({ name: 'is_taxable', default: true }) isTaxable: boolean;
  @Column({ name: 'revenue_account', nullable: true }) revenueAccount: string;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => DeliveryNoteEntity, d => d.items)
  @JoinColumn({ name: 'dn_id' })
  deliveryNote: DeliveryNoteEntity;
}

// ── Sales Invoices ────────────────────────────────────────────────
@Entity('sales_invoices')
@Index(['tenantId'])
export class SalesInvoiceEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'invoice_id' }) invoiceId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'invoice_number', nullable: true }) invoiceNumber: string;
  @Column({ name: 'invoice_date', type: 'date', nullable: true }) invoiceDate: string;
  @Column({ name: 'due_date', type: 'date', nullable: true }) dueDate: string;
  @Column({ name: 'quotation_id', nullable: true }) quotationId: string;
  @Column({ name: 'dn_id', nullable: true }) dnId: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'contact_id', nullable: true }) contactId: string;
  @Column({ name: 'customer_name', nullable: true }) customerName: string;
  @Column({ name: 'customer_address', type: 'text', nullable: true }) customerAddress: string;
  @Column({ name: 'customer_email', nullable: true }) customerEmail: string;
  @Column({ name: 'customer_trn', nullable: true }) customerTrn: string;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }) exchangeRate: number;
  @Column({ name: 'is_inventory', default: true }) isInventory: boolean;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 }) subtotal: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }) vatRate: number;
  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) vatAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalAmount: number;
  @Column({ name: 'paid_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) paidAmount: number;
  @Column({ name: 'balance_due', type: 'decimal', precision: 18, scale: 3, default: 0 }) balanceDue: number;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ name: 'terms_conditions', type: 'text', nullable: true }) termsConditions: string;
  @Column({ name: 'payment_terms', nullable: true }) paymentTerms: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @Column({ name: 'salesman_id', nullable: true }) salesmanId: string;
  @Column({ name: 'salesman_name', nullable: true }) salesmanName: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => SalesInvoiceItemEntity, i => i.invoice, { cascade: true, eager: true })
  items: SalesInvoiceItemEntity[];
}

// ── Sales Invoice Items ───────────────────────────────────────────
@Entity('sales_invoice_items')
export class SalesInvoiceItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'invoice_id' }) invoiceId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @Column({ name: 'item_code', nullable: true }) itemCode: string;
  @Column() description: string;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }) lineTotal: number;
  @Column({ name: 'is_taxable', default: true }) isTaxable: boolean;
  @Column({ name: 'revenue_account', nullable: true }) revenueAccount: string;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => SalesInvoiceEntity, i => i.items)
  @JoinColumn({ name: 'invoice_id' })
  invoice: SalesInvoiceEntity;
}

// ── Receipts ──────────────────────────────────────────────────────
@Entity('receipts')
@Index(['tenantId'])
export class ReceiptEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'receipt_id' }) receiptId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'receipt_number', nullable: true }) receiptNumber: string;
  @Column({ name: 'receipt_date', type: 'date', nullable: true }) receiptDate: string;
  @Column({ name: 'invoice_id', nullable: true }) invoiceId: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'customer_name', nullable: true }) customerName: string;
  @Column({ type: 'decimal', precision: 18, scale: 3 }) amount: number;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'payment_method', default: 'BANK_TRANSFER' }) paymentMethod: string;
  @Column({ name: 'payment_reference', nullable: true }) paymentReference: string;
  @Column({ name: 'bank_name', nullable: true }) bankName: string;
  @Column({ name: 'cheque_number', nullable: true }) chequeNumber: string;
  @Column({ name: 'cheque_date', type: 'date', nullable: true }) chequeDate: string;
  @Column({ name: 'cheque_bank_name', nullable: true }) chequeBankName: string;
  @Column({ name: 'deposit_bank_account_id', nullable: true }) depositBankAccountId: string;
  @Column({ name: 'cheque_status', nullable: true }) chequeStatus: string;
  @Column({ name: 'allocated_invoice_ids', type: 'text', nullable: true }) allocatedInvoiceIds: string;
  @Column({ nullable: true }) notes: string;
  @Column({ default: 'CONFIRMED' }) status: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ── Sales Returns ─────────────────────────────────────────────────
@Entity('sales_returns')
@Index(['tenantId'])
export class SalesReturnEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'return_id' }) returnId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'return_number', nullable: true }) returnNumber: string;
  @Column({ name: 'return_date', type: 'date', nullable: true }) returnDate: string;
  @Column({ name: 'invoice_id', nullable: true }) invoiceId: string;
  @Column({ name: 'dn_id', nullable: true }) dnId: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'customer_name', nullable: true }) customerName: string;
  @Column({ type: 'text', nullable: true }) reason: string;
  @Column({ name: 'is_inventory', default: true }) isInventory: boolean;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 }) subtotal: number;
  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) vatAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalAmount: number;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'credit_note_number', nullable: true }) creditNoteNumber: string;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => SalesReturnItemEntity, i => i.salesReturn, { cascade: true, eager: true })
  items: SalesReturnItemEntity[];
}

// ── Sales Return Items ────────────────────────────────────────────
@Entity('sales_return_items')
export class SalesReturnItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'return_id' }) returnId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @Column({ name: 'item_code', nullable: true }) itemCode: string;
  @Column() description: string;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }) lineTotal: number;
  @Column({ name: 'is_taxable', default: true }) isTaxable: boolean;
  @Column({ name: 'revenue_account', nullable: true }) revenueAccount: string;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => SalesReturnEntity, r => r.items)
  @JoinColumn({ name: 'return_id' })
  salesReturn: SalesReturnEntity;
}

// ── Chart of Accounts ─────────────────────────────────────────────
@Entity('chart_of_accounts')
export class ChartOfAccountEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'account_id' }) accountId: string;
  @Column({ name: 'tenant_id', nullable: true }) tenantId: string;
  @Column({ name: 'account_code' }) accountCode: string;
  @Column({ name: 'account_name' }) accountName: string;
  @Column({ name: 'account_name_ar', nullable: true }) accountNameAr: string;
  @Column({ name: 'account_type' }) accountType: string;
  @Column({ name: 'account_subtype', nullable: true }) accountSubtype: string;
  @Column({ name: 'parent_account_id', nullable: true }) parentAccountId: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'is_system', default: false }) isSystem: boolean;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ── Suppliers ─────────────────────────────────────────────────────
@Entity('suppliers')
@Index(['tenantId', 'supplierCode'], { unique: true })
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'supplier_id' }) supplierId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'supplier_code' }) supplierCode: string;
  @Column({ name: 'supplier_name' }) supplierName: string;
  @Column({ name: 'supplier_name_ar', nullable: true }) supplierNameAr: string;
  @Column({ name: 'contact_person', nullable: true }) contactPerson: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) mobile: string;
  @Column({ type: 'text', nullable: true }) address: string;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true, default: 'Oman' }) country: string;
  @Column({ nullable: true }) trn: string;
  @Column({ name: 'payment_terms', nullable: true }) paymentTerms: string;
  @Column({ name: 'credit_limit', type: 'decimal', precision: 18, scale: 3, default: 0 }) creditLimit: number;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'bank_name', nullable: true }) bankName: string;
  @Column({ name: 'bank_account', nullable: true }) bankAccount: string;
  @Column({ name: 'bank_iban', nullable: true }) bankIban: string;
  @Column({ nullable: true }) category: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ── Purchase Orders ───────────────────────────────────────────────
@Entity('purchase_orders')
@Index(['tenantId'])
export class PurchaseOrderEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'po_id' }) poId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'po_number', nullable: true }) poNumber: string;
  @Column({ name: 'po_date', type: 'date', nullable: true }) poDate: string;
  @Column({ name: 'expected_date', type: 'date', nullable: true }) expectedDate: string;
  @Column({ name: 'supplier_id', nullable: true }) supplierId: string;
  @Column({ name: 'supplier_name', nullable: true }) supplierName: string;
  @Column({ name: 'supplier_address', type: 'text', nullable: true }) supplierAddress: string;
  @Column({ name: 'supplier_email', nullable: true }) supplierEmail: string;
  @Column({ name: 'supplier_trn', nullable: true }) supplierTrn: string;
  @Column({ nullable: true }) subject: string;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }) exchangeRate: number;
  @Column({ name: 'is_inventory', default: true }) isInventory: boolean;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 }) subtotal: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'taxable_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) taxableAmount: number;
  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }) vatRate: number;
  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) vatAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalAmount: number;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ name: 'terms_conditions', type: 'text', nullable: true }) termsConditions: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'approved_by', nullable: true }) approvedBy: string;
  @Column({ name: 'approved_by_name', nullable: true }) approvedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => PurchaseOrderItemEntity, i => i.purchaseOrder, { cascade: true, eager: true })
  items: PurchaseOrderItemEntity[];
}

// ── Purchase Order Items ──────────────────────────────────────────
@Entity('purchase_order_items')
export class PurchaseOrderItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'po_id' }) poId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @Column({ name: 'item_code', nullable: true }) itemCode: string;
  @Column() description: string;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }) lineTotal: number;
  @Column({ name: 'received_qty', type: 'decimal', precision: 18, scale: 3, default: 0 }) receivedQty: number;
  @Column({ name: 'is_taxable', default: true }) isTaxable: boolean;
  @Column({ name: 'warehouse_location_id', nullable: true }) warehouseLocationId: string;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => PurchaseOrderEntity, p => p.items)
  @JoinColumn({ name: 'po_id' })
  purchaseOrder: PurchaseOrderEntity;
}

// ── Goods Receipt Notes ───────────────────────────────────────────
@Entity('goods_receipt_notes')
@Index(['tenantId'])
export class GoodsReceiptNoteEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'grn_id' }) grnId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'grn_number', nullable: true }) grnNumber: string;
  @Column({ name: 'grn_date', type: 'date', nullable: true }) grnDate: string;
  @Column({ name: 'po_id', nullable: true }) poId: string;
  @Column({ name: 'supplier_id', nullable: true }) supplierId: string;
  @Column({ name: 'supplier_name', nullable: true }) supplierName: string;
  @Column({ name: 'delivery_note_ref', nullable: true }) deliveryNoteRef: string;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }) exchangeRate: number;
  @Column({ name: 'is_inventory', default: true }) isInventory: boolean;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 }) subtotal: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }) vatRate: number;
  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) vatAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalAmount: number;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'received_by', nullable: true }) receivedBy: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => GoodsReceiptNoteItemEntity, i => i.grn, { cascade: true, eager: true })
  items: GoodsReceiptNoteItemEntity[];
}

// ── GRN Items ─────────────────────────────────────────────────────
@Entity('goods_receipt_note_items')
export class GoodsReceiptNoteItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'grn_id' }) grnId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'po_item_id', nullable: true }) poItemId: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @Column({ name: 'item_code', nullable: true }) itemCode: string;
  @Column() description: string;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }) lineTotal: number;
  @Column({ name: 'is_taxable', default: true }) isTaxable: boolean;
  @Column({ name: 'warehouse_location_id', nullable: true }) warehouseLocationId: string;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => GoodsReceiptNoteEntity, g => g.items)
  @JoinColumn({ name: 'grn_id' })
  grn: GoodsReceiptNoteEntity;
}

// ── Purchase Invoices ─────────────────────────────────────────────
@Entity('purchase_invoices')
@Index(['tenantId'])
export class PurchaseInvoiceEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'invoice_id' }) invoiceId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'invoice_number', nullable: true }) invoiceNumber: string;
  @Column({ name: 'supplier_invoice_no', nullable: true }) supplierInvoiceNo: string;
  @Column({ name: 'invoice_date', type: 'date', nullable: true }) invoiceDate: string;
  @Column({ name: 'due_date', type: 'date', nullable: true }) dueDate: string;
  @Column({ name: 'po_id', nullable: true }) poId: string;
  @Column({ name: 'grn_id', nullable: true }) grnId: string;
  @Column({ name: 'supplier_id', nullable: true }) supplierId: string;
  @Column({ name: 'supplier_name', nullable: true }) supplierName: string;
  @Column({ name: 'supplier_address', type: 'text', nullable: true }) supplierAddress: string;
  @Column({ name: 'supplier_trn', nullable: true }) supplierTrn: string;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }) exchangeRate: number;
  @Column({ name: 'is_inventory', default: true }) isInventory: boolean;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 }) subtotal: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5 }) vatRate: number;
  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) vatAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalAmount: number;
  @Column({ name: 'paid_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) paidAmount: number;
  @Column({ name: 'balance_due', type: 'decimal', precision: 18, scale: 3, default: 0 }) balanceDue: number;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'payment_terms', nullable: true }) paymentTerms: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => PurchaseInvoiceItemEntity, i => i.invoice, { cascade: true, eager: true })
  items: PurchaseInvoiceItemEntity[];
}

// ── Purchase Invoice Items ────────────────────────────────────────
@Entity('purchase_invoice_items')
export class PurchaseInvoiceItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'invoice_id' }) invoiceId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @Column({ name: 'item_code', nullable: true }) itemCode: string;
  @Column() description: string;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) discountAmount: number;
  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }) lineTotal: number;
  @Column({ name: 'is_taxable', default: true }) isTaxable: boolean;
  @Column({ name: 'expense_account', nullable: true }) expenseAccount: string;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => PurchaseInvoiceEntity, i => i.items)
  @JoinColumn({ name: 'invoice_id' })
  invoice: PurchaseInvoiceEntity;
}

// ── Payment Vouchers ──────────────────────────────────────────────
@Entity('payment_vouchers')
@Index(['tenantId'])
export class PaymentVoucherEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'voucher_id' }) voucherId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'voucher_number', nullable: true }) voucherNumber: string;
  @Column({ name: 'voucher_date', type: 'date', nullable: true }) voucherDate: string;
  @Column({ name: 'invoice_id', nullable: true }) invoiceId: string;
  @Column({ name: 'supplier_id', nullable: true }) supplierId: string;
  @Column({ name: 'supplier_name', nullable: true }) supplierName: string;
  @Column({ type: 'decimal', precision: 18, scale: 3 }) amount: number;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'payment_method', default: 'BANK_TRANSFER' }) paymentMethod: string;
  @Column({ name: 'payment_reference', nullable: true }) paymentReference: string;
  @Column({ name: 'bank_name', nullable: true }) bankName: string;
  @Column({ name: 'cheque_number', nullable: true }) chequeNumber: string;
  @Column({ name: 'cheque_date', type: 'date', nullable: true }) chequeDate: string;
  @Column({ name: 'bank_account_id', nullable: true }) bankAccountId: string;
  @Column({ name: 'cheque_leaf_id', nullable: true }) chequeLeafId: string;
  @Column({ nullable: true }) notes: string;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'approved_by', nullable: true }) approvedBy: string;
  @Column({ name: 'approved_by_name', nullable: true }) approvedByName: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ── Purchase Returns ──────────────────────────────────────────────
@Entity('purchase_returns')
@Index(['tenantId'])
export class PurchaseReturnEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'return_id' }) returnId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'return_number', nullable: true }) returnNumber: string;
  @Column({ name: 'return_date', type: 'date', nullable: true }) returnDate: string;
  @Column({ name: 'invoice_id', nullable: true }) invoiceId: string;
  @Column({ name: 'grn_id', nullable: true }) grnId: string;
  @Column({ name: 'supplier_id', nullable: true }) supplierId: string;
  @Column({ name: 'supplier_name', nullable: true }) supplierName: string;
  @Column({ type: 'text', nullable: true }) reason: string;
  @Column({ name: 'is_inventory', default: true }) isInventory: boolean;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 }) subtotal: number;
  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) vatAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalAmount: number;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'debit_note_number', nullable: true }) debitNoteNumber: string;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => PurchaseReturnItemEntity, i => i.purchaseReturn, { cascade: true, eager: true })
  items: PurchaseReturnItemEntity[];
}

// ── Purchase Return Items ─────────────────────────────────────────
@Entity('purchase_return_items')
export class PurchaseReturnItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'return_id' }) returnId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @Column({ name: 'item_code', nullable: true }) itemCode: string;
  @Column() description: string;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }) lineTotal: number;
  @Column({ name: 'is_taxable', default: true }) isTaxable: boolean;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => PurchaseReturnEntity, r => r.items)
  @JoinColumn({ name: 'return_id' })
  purchaseReturn: PurchaseReturnEntity;
}

// ── Journal Vouchers ──────────────────────────────────────────────
@Entity('journal_vouchers')
@Index(['tenantId'])
export class JournalVoucherEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'voucher_id' }) voucherId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'voucher_number', nullable: true }) voucherNumber: string;
  @Column({ name: 'voucher_date', type: 'date', nullable: true }) voucherDate: string;
  @Column({ name: 'voucher_type', default: 'JOURNAL' }) voucherType: string;
  @Column({ nullable: true }) reference: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 }) exchangeRate: number;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'is_posted', default: false }) isPosted: boolean;
  @Column({ name: 'posted_at', nullable: true }) postedAt: Date;
  @Column({ name: 'posted_by', nullable: true }) postedBy: string;
  @Column({ name: 'posted_by_name', nullable: true }) postedByName: string;
  @Column({ name: 'total_debit', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalDebit: number;
  @Column({ name: 'total_credit', type: 'decimal', precision: 18, scale: 3, default: 0 }) totalCredit: number;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'approved_by', nullable: true }) approvedBy: string;
  @Column({ name: 'approved_by_name', nullable: true }) approvedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => JournalVoucherLineEntity, l => l.voucher, { cascade: true, eager: true })
  lines: JournalVoucherLineEntity[];
}

// ── Journal Voucher Lines ─────────────────────────────────────────
@Entity('journal_voucher_lines')
export class JournalVoucherLineEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'line_id' }) lineId: string;
  @Column({ name: 'voucher_id' }) voucherId: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'account_code', nullable: true }) accountCode: string;
  @Column({ name: 'account_name', nullable: true }) accountName: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'debit_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) debitAmount: number;
  @Column({ name: 'credit_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) creditAmount: number;
  @Column({ name: 'cost_center', nullable: true }) costCenter: string;
  @Column({ nullable: true }) reference: string;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => JournalVoucherEntity, v => v.lines)
  @JoinColumn({ name: 'voucher_id' })
  voucher: JournalVoucherEntity;
}

// ── Warehouses ────────────────────────────────────────────────────
@Entity('warehouses')
@Index(['tenantId', 'warehouseCode'], { unique: true })
export class WarehouseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'warehouse_id' }) warehouseId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'warehouse_code' }) warehouseCode: string;
  @Column({ name: 'warehouse_name' }) warehouseName: string;
  @Column({ name: 'warehouse_type', default: 'MAIN' }) warehouseType: string;
  @Column({ type: 'text', nullable: true }) address: string;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true, default: 'Oman' }) country: string;
  @Column({ name: 'manager_id', nullable: true }) managerId: string;
  @Column({ name: 'manager_name', nullable: true }) managerName: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, nullable: true }) capacity: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ── Warehouse Locations ───────────────────────────────────────────
@Entity('warehouse_locations')
export class WarehouseLocationEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'location_id' }) locationId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'warehouse_id' }) warehouseId: string;
  @Column({ name: 'location_code' }) locationCode: string;
  @Column({ name: 'location_name', nullable: true }) locationName: string;
  @Column({ nullable: true }) zone: string;
  @Column({ nullable: true }) rack: string;
  @Column({ nullable: true }) shelf: string;
  @Column({ nullable: true }) bin: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, nullable: true }) capacity: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ nullable: true }) notes: string;
}

// ── Stock Transfers ───────────────────────────────────────────────
@Entity('stock_transfers')
@Index(['tenantId'])
export class StockTransferEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'transfer_id' }) transferId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'transfer_number', nullable: true }) transferNumber: string;
  @Column({ name: 'transfer_date', type: 'date', nullable: true }) transferDate: string;
  @Column({ name: 'from_warehouse_id', nullable: true }) fromWarehouseId: string;
  @Column({ name: 'from_warehouse', nullable: true }) fromWarehouse: string;
  @Column({ name: 'to_warehouse_id', nullable: true }) toWarehouseId: string;
  @Column({ name: 'to_warehouse', nullable: true }) toWarehouse: string;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ type: 'text', nullable: true }) reason: string;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => StockTransferItemEntity, i => i.transfer, { cascade: true, eager: true })
  items: StockTransferItemEntity[];
}

// ── Stock Transfer Items ──────────────────────────────────────────
@Entity('stock_transfer_items')
export class StockTransferItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'transfer_id' }) transferId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'product_code', nullable: true }) productCode: string;
  @Column({ name: 'product_name', nullable: true }) productName: string;
  @Column({ name: 'from_location_id', nullable: true }) fromLocationId: string;
  @Column({ name: 'to_location_id', nullable: true }) toLocationId: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_of_measure', nullable: true }) unitOfMeasure: string;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @ManyToOne(() => StockTransferEntity, t => t.items)
  @JoinColumn({ name: 'transfer_id' })
  transfer: StockTransferEntity;
}

// ── Stock Adjustments ─────────────────────────────────────────────
@Entity('stock_adjustments')
@Index(['tenantId'])
export class StockAdjustmentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'adjustment_id' }) adjustmentId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'adjustment_number', nullable: true }) adjustmentNumber: string;
  @Column({ name: 'adjustment_date', type: 'date', nullable: true }) adjustmentDate: string;
  @Column({ name: 'adjustment_type', default: 'IN' }) adjustmentType: string;
  @Column({ name: 'warehouse_id', nullable: true }) warehouseId: string;
  @Column({ name: 'warehouse_name', nullable: true }) warehouseName: string;
  @Column({ nullable: true }) reason: string;
  @Column({ nullable: true }) notes: string;
  @Column({ default: 'DRAFT' }) status: string;
  @Column({ name: 'prepared_by', nullable: true }) preparedBy: string;
  @Column({ name: 'prepared_by_name', nullable: true }) preparedByName: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => StockAdjustmentItemEntity, i => i.adjustment, { cascade: true, eager: true })
  items: StockAdjustmentItemEntity[];
}

// ── Stock Adjustment Items ────────────────────────────────────────
@Entity('stock_adjustment_items')
export class StockAdjustmentItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'adjustment_id' }) adjustmentId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'product_code', nullable: true }) productCode: string;
  @Column({ name: 'product_name', nullable: true }) productName: string;
  @Column({ name: 'location_id', nullable: true }) locationId: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitCost: number;
  @Column({ name: 'unit_of_measure', nullable: true }) unitOfMeasure: string;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
  @ManyToOne(() => StockAdjustmentEntity, a => a.items)
  @JoinColumn({ name: 'adjustment_id' })
  adjustment: StockAdjustmentEntity;
}

// ── Fixed Assets ──────────────────────────────────────────────────────────────
@Entity('fixed_assets')
export class FixedAssetEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'asset_id' }) assetId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'asset_code', nullable: true }) assetCode: string;
  @Column({ name: 'asset_name' }) assetName: string;
  @Column({ nullable: true }) category: string;
  @Column({ name: 'sub_category', nullable: true }) subCategory: string;
  @Column({ nullable: true }) brand: string;
  @Column({ nullable: true }) model: string;
  @Column({ name: 'serial_number', nullable: true }) serialNumber: string;
  @Column({ name: 'purchase_date', type: 'date', nullable: true }) purchaseDate: string;
  @Column({ name: 'purchase_cost', type: 'decimal', precision: 18, scale: 3, default: 0 }) purchaseCost: number;
  @Column({ name: 'supplier_name', nullable: true }) supplierName: string;
  @Column({ name: 'useful_life_years', type: 'decimal', precision: 5, scale: 2, default: 5 }) usefulLifeYears: number;
  @Column({ name: 'salvage_value', type: 'decimal', precision: 18, scale: 3, default: 0 }) salvageValue: number;
  @Column({ name: 'depreciation_method', default: 'STRAIGHT_LINE' }) depreciationMethod: string;
  @Column({ name: 'depreciation_rate', type: 'decimal', precision: 8, scale: 4, default: 0 }) depreciationRate: number;
  @Column({ name: 'accumulated_depreciation', type: 'decimal', precision: 18, scale: 3, default: 0 }) accumulatedDepreciation: number;
  @Column({ name: 'current_book_value', type: 'decimal', precision: 18, scale: 3, default: 0 }) currentBookValue: number;
  @Column({ default: 'ACTIVE' }) status: string;
  @Column({ default: 'GOOD' }) condition: string;
  @Column({ name: 'location_name', nullable: true }) locationName: string;
  @Column({ name: 'location_address', nullable: true }) locationAddress: string;
  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true }) locationLat: number;
  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true }) locationLng: number;
  @Column({ nullable: true }) department: string;
  @Column({ name: 'assigned_to_id', nullable: true }) assignedToId: string;
  @Column({ name: 'assigned_to_name', nullable: true }) assignedToName: string;
  @Column({ name: 'coa_asset_account', nullable: true }) coaAssetAccount: string;
  @Column({ name: 'coa_accum_depr_account', nullable: true }) coaAccumDeprAccount: string;
  @Column({ name: 'coa_depr_expense_account', nullable: true }) coaDeprExpenseAccount: string;
  @Column({ name: 'invoice_number', nullable: true }) invoiceNumber: string;
  @Column({ name: 'warranty_expiry', type: 'date', nullable: true }) warrantyExpiry: string;
  @Column({ name: 'insurance_expiry', type: 'date', nullable: true }) insuranceExpiry: string;
  @Column({ name: 'last_maintenance_date', type: 'date', nullable: true }) lastMaintenanceDate: string;
  @Column({ name: 'next_maintenance_date', type: 'date', nullable: true }) nextMaintenanceDate: string;
  @Column({ nullable: true }) notes: string;
  @Column({ type: 'jsonb', default: '[]' }) photos: string[];
  @Column({ type: 'jsonb', default: '[]' }) tags: string[];
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'disposed_date', type: 'date', nullable: true }) disposedDate: string;
  @Column({ name: 'disposal_reason', nullable: true }) disposalReason: string;
  @Column({ name: 'disposal_value', type: 'decimal', precision: 18, scale: 3, default: 0 }) disposalValue: number;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('asset_depreciation')
export class AssetDepreciationEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'depreciation_id' }) depreciationId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'asset_id', nullable: true }) assetId: string;
  @Column({ name: 'period_year' }) periodYear: number;
  @Column({ name: 'period_month' }) periodMonth: number;
  @Column({ name: 'opening_value', type: 'decimal', precision: 18, scale: 3, default: 0 }) openingValue: number;
  @Column({ name: 'depreciation_amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) depreciationAmount: number;
  @Column({ name: 'closing_value', type: 'decimal', precision: 18, scale: 3, default: 0 }) closingValue: number;
  @Column({ name: 'accumulated_depreciation', type: 'decimal', precision: 18, scale: 3, default: 0 }) accumulatedDepreciation: number;
  @Column({ name: 'journal_voucher_id', nullable: true }) journalVoucherId: string;
  @Column({ default: 'PENDING' }) status: string;
  @Column({ name: 'posted_date', type: 'date', nullable: true }) postedDate: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('asset_maintenance')
export class AssetMaintenanceEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'maintenance_id' }) maintenanceId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'asset_id', nullable: true }) assetId: string;
  @Column({ name: 'maintenance_type', default: 'PREVENTIVE' }) maintenanceType: string;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'scheduled_date', type: 'date', nullable: true }) scheduledDate: string;
  @Column({ name: 'completed_date', type: 'date', nullable: true }) completedDate: string;
  @Column({ name: 'next_due_date', type: 'date', nullable: true }) nextDueDate: string;
  @Column({ name: 'frequency_days', nullable: true }) frequencyDays: number;
  @Column({ name: 'technician_id', nullable: true }) technicianId: string;
  @Column({ name: 'technician_name', nullable: true }) technicianName: string;
  @Column({ name: 'engineer_id', nullable: true }) engineerId: string;
  @Column({ name: 'engineer_name', nullable: true }) engineerName: string;
  @Column({ default: 'SCHEDULED' }) status: string;
  @Column({ default: 'MEDIUM' }) priority: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 }) cost: number;
  @Column({ name: 'parts_used', nullable: true }) partsUsed: string;
  @Column({ nullable: true }) findings: string;
  @Column({ nullable: true }) resolution: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('asset_transfers')
export class AssetTransferEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'transfer_id' }) transferId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'asset_id', nullable: true }) assetId: string;
  @Column({ name: 'transfer_date', type: 'date' }) transferDate: string;
  @Column({ name: 'from_department', nullable: true }) fromDepartment: string;
  @Column({ name: 'from_location', nullable: true }) fromLocation: string;
  @Column({ name: 'from_user_name', nullable: true }) fromUserName: string;
  @Column({ name: 'to_department', nullable: true }) toDepartment: string;
  @Column({ name: 'to_location', nullable: true }) toLocation: string;
  @Column({ name: 'to_user_id', nullable: true }) toUserId: string;
  @Column({ name: 'to_user_name', nullable: true }) toUserName: string;
  @Column({ type: 'text', nullable: true }) reason: string;
  @Column({ name: 'approved_by', nullable: true }) approvedBy: string;
  @Column({ default: 'COMPLETED' }) status: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

// ── Document Signatures ────────────────────────────────
@Entity('document_signatures')
@Index(['tenantId', 'docType', 'docId'])
export class DocumentSignatureEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'signature_id' }) signatureId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'doc_type' }) docType: string;
  @Column({ name: 'doc_id' }) docId: string;
  @Column({ name: 'signer_name' }) signerName: string;
  @Column({ name: 'signer_title', nullable: true }) signerTitle: string;
  @Column({ name: 'signature_image', type: 'text' }) signatureImage: string;
  @Column({ name: 'gps_lat', type: 'decimal', precision: 10, scale: 7, nullable: true }) gpsLat: number;
  @Column({ name: 'gps_lng', type: 'decimal', precision: 10, scale: 7, nullable: true }) gpsLng: number;
  @Column({ name: 'ip_address', nullable: true }) ipAddress: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ name: 'signed_at', type: 'timestamptz', default: () => 'now()' }) signedAt: Date;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
}


// ── Bank Accounts ────────────────────────────────────────────────
@Entity('bank_accounts')
@Index(['tenantId'])
export class BankAccountEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'bank_account_id' }) bankAccountId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'account_name' }) accountName: string;
  @Column({ name: 'bank_name' }) bankName: string;
  @Column({ name: 'account_number', nullable: true }) accountNumber: string;
  @Column({ nullable: true }) iban: string;
  @Column({ nullable: true }) branch: string;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'opening_balance', type: 'decimal', precision: 18, scale: 3, default: 0 }) openingBalance: number;
  @Column({ name: 'current_balance', type: 'decimal', precision: 18, scale: 3, default: 0 }) currentBalance: number;
  @Column({ name: 'gl_account_id', nullable: true }) glAccountId: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ── Cheque Books ─────────────────────────────────────────────────
@Entity('cheque_books')
@Index(['tenantId'])
export class ChequeBookEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'cheque_book_id' }) chequeBookId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'bank_account_id' }) bankAccountId: string;
  @Column({ name: 'book_number' }) bookNumber: string;
  @Column({ name: 'start_leaf_no' }) startLeafNo: string;
  @Column({ name: 'end_leaf_no' }) endLeafNo: string;
  @Column({ name: 'total_leaves', type: 'int', default: 0 }) totalLeaves: number;
  @Column({ name: 'issued_date', type: 'date', nullable: true }) issuedDate: string;
  @Column({ default: 'ACTIVE' }) status: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ── Cheque Leaves ────────────────────────────────────────────────
@Entity('cheque_leaves')
@Index(['tenantId'])
export class ChequeLeafEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'leaf_id' }) leafId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'cheque_book_id' }) chequeBookId: string;
  @Column({ name: 'bank_account_id' }) bankAccountId: string;
  @Column({ name: 'leaf_number' }) leafNumber: string;
  @Column({ default: 'AVAILABLE' }) status: string;
  @Column({ name: 'used_in_voucher_id', nullable: true }) usedInVoucherId: string;
  @Column({ name: 'used_date', type: 'date', nullable: true }) usedDate: string;
  @Column({ name: 'payee_name', nullable: true }) payeeName: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, nullable: true }) amount: number;
  @Column({ name: 'void_reason', nullable: true }) voidReason: string;
  @Column({ name: 'realized_date', type: 'date', nullable: true }) realizedDate: string;
  @Column({ name: 'reconciled_date', type: 'date', nullable: true }) reconciledDate: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
