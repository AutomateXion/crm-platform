import { Repository } from 'typeorm';
import { ProductEntity, StockMovementEntity, ExchangeRateEntity, QuotationEntity, QuotationItemEntity, DeliveryNoteEntity, DeliveryNoteItemEntity, SalesInvoiceEntity, SalesInvoiceItemEntity, ReceiptEntity, SalesReturnEntity, SalesReturnItemEntity, ChartOfAccountEntity, SupplierEntity, PurchaseOrderEntity, PurchaseOrderItemEntity, GoodsReceiptNoteEntity, GoodsReceiptNoteItemEntity, PurchaseInvoiceEntity, PurchaseInvoiceItemEntity, PaymentVoucherEntity, PurchaseReturnEntity, PurchaseReturnItemEntity } from './sales.entities';
export declare class SalesService {
    private coaRepo;
    private supplierRepo;
    private poRepo;
    private poItemRepo;
    private grnRepo;
    private grnItemRepo;
    private purchaseInvoiceRepo;
    private purchaseInvoiceItemRepo;
    private voucherRepo;
    private purchaseReturnRepo;
    private purchaseReturnItemRepo;
    private productRepo;
    private stockRepo;
    private rateRepo;
    private quotationRepo;
    private quotationItemRepo;
    private dnRepo;
    private dnItemRepo;
    private invoiceRepo;
    private invoiceItemRepo;
    private receiptRepo;
    private returnRepo;
    private returnItemRepo;
    constructor(coaRepo: Repository<ChartOfAccountEntity>, supplierRepo: Repository<SupplierEntity>, poRepo: Repository<PurchaseOrderEntity>, poItemRepo: Repository<PurchaseOrderItemEntity>, grnRepo: Repository<GoodsReceiptNoteEntity>, grnItemRepo: Repository<GoodsReceiptNoteItemEntity>, purchaseInvoiceRepo: Repository<PurchaseInvoiceEntity>, purchaseInvoiceItemRepo: Repository<PurchaseInvoiceItemEntity>, voucherRepo: Repository<PaymentVoucherEntity>, purchaseReturnRepo: Repository<PurchaseReturnEntity>, purchaseReturnItemRepo: Repository<PurchaseReturnItemEntity>, productRepo: Repository<ProductEntity>, stockRepo: Repository<StockMovementEntity>, rateRepo: Repository<ExchangeRateEntity>, quotationRepo: Repository<QuotationEntity>, quotationItemRepo: Repository<QuotationItemEntity>, dnRepo: Repository<DeliveryNoteEntity>, dnItemRepo: Repository<DeliveryNoteItemEntity>, invoiceRepo: Repository<SalesInvoiceEntity>, invoiceItemRepo: Repository<SalesInvoiceItemEntity>, receiptRepo: Repository<ReceiptEntity>, returnRepo: Repository<SalesReturnEntity>, returnItemRepo: Repository<SalesReturnItemEntity>);
    private generateNumber;
    getProducts(tenantId: string, page?: number, limit?: number, search?: string, category?: string): Promise<{
        data: ProductEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getProduct(tenantId: string, id: string): Promise<ProductEntity>;
    createProduct(tenantId: string, dto: any, userId: string): Promise<ProductEntity[]>;
    updateProduct(tenantId: string, id: string, dto: any): Promise<ProductEntity>;
    deleteProduct(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    adjustStock(tenantId: string, productId: string, qty: number, type: string, ref: string, userId: string): Promise<StockMovementEntity>;
    getStockMovements(tenantId: string, productId?: string): Promise<StockMovementEntity[]>;
    getExchangeRates(tenantId: string): Promise<ExchangeRateEntity[]>;
    createExchangeRate(tenantId: string, dto: any, userId: string): Promise<ExchangeRateEntity[]>;
    updateExchangeRate(tenantId: string, id: string, dto: any): Promise<ExchangeRateEntity>;
    deleteExchangeRate(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getQuotations(tenantId: string, page?: number, limit?: number, search?: string, status?: string): Promise<{
        data: QuotationEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getQuotation(tenantId: string, id: string): Promise<QuotationEntity>;
    createQuotation(tenantId: string, dto: any, userId: string): Promise<QuotationEntity>;
    updateQuotation(tenantId: string, id: string, dto: any): Promise<QuotationEntity>;
    deleteQuotation(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getDeliveryNotes(tenantId: string, page?: number, limit?: number, search?: string, status?: string): Promise<{
        data: DeliveryNoteEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getDeliveryNote(tenantId: string, id: string): Promise<DeliveryNoteEntity>;
    createDeliveryNote(tenantId: string, dto: any, userId: string): Promise<DeliveryNoteEntity>;
    updateDeliveryNote(tenantId: string, id: string, dto: any): Promise<DeliveryNoteEntity>;
    deleteDeliveryNote(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    convertQuotationToDN(tenantId: string, quotationId: string, userId: string): Promise<DeliveryNoteEntity>;
    getInvoices(tenantId: string, page?: number, limit?: number, search?: string, status?: string): Promise<{
        data: SalesInvoiceEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getInvoice(tenantId: string, id: string): Promise<SalesInvoiceEntity>;
    createInvoice(tenantId: string, dto: any, userId: string): Promise<SalesInvoiceEntity>;
    updateInvoice(tenantId: string, id: string, dto: any): Promise<SalesInvoiceEntity>;
    deleteInvoice(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    convertDNToInvoice(tenantId: string, dnId: string, userId: string): Promise<SalesInvoiceEntity>;
    getReceipts(tenantId: string, page?: number, limit?: number, search?: string): Promise<{
        data: ReceiptEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    createReceipt(tenantId: string, dto: any, userId: string): Promise<ReceiptEntity[]>;
    deleteReceipt(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getReturns(tenantId: string, page?: number, limit?: number): Promise<{
        data: SalesReturnEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getReturn(tenantId: string, id: string): Promise<SalesReturnEntity>;
    createReturn(tenantId: string, dto: any, userId: string): Promise<SalesReturnEntity>;
    updateReturn(tenantId: string, id: string, dto: any): Promise<SalesReturnEntity>;
    deleteReturn(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getAccounts(tenantId: string, type?: string, search?: string): Promise<ChartOfAccountEntity[]>;
    createAccount(tenantId: string, dto: any): Promise<ChartOfAccountEntity[]>;
    updateAccount(tenantId: string, id: string, dto: any): Promise<ChartOfAccountEntity>;
    deleteAccount(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getDashboard(tenantId: string): Promise<{
        totalQuotations: number;
        totalInvoices: number;
        totalReceipts: number;
        totalReturns: number;
        lowStockProducts: number;
    }>;
    getSuppliers(tenantId: string, page?: number, limit?: number, search?: string): Promise<{
        data: SupplierEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getSupplier(tenantId: string, id: string): Promise<SupplierEntity>;
    createSupplier(tenantId: string, dto: any, userId: string): Promise<SupplierEntity[]>;
    updateSupplier(tenantId: string, id: string, dto: any): Promise<SupplierEntity>;
    deleteSupplier(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getPurchaseOrders(tenantId: string, page?: number, limit?: number, search?: string, status?: string): Promise<{
        data: PurchaseOrderEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPurchaseOrder(tenantId: string, id: string): Promise<PurchaseOrderEntity>;
    createPurchaseOrder(tenantId: string, dto: any, userId: string): Promise<PurchaseOrderEntity>;
    updatePurchaseOrder(tenantId: string, id: string, dto: any): Promise<PurchaseOrderEntity>;
    deletePurchaseOrder(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getGRNs(tenantId: string, page?: number, limit?: number, search?: string, status?: string): Promise<{
        data: GoodsReceiptNoteEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getGRN(tenantId: string, id: string): Promise<GoodsReceiptNoteEntity>;
    createGRN(tenantId: string, dto: any, userId: string): Promise<GoodsReceiptNoteEntity>;
    updateGRN(tenantId: string, id: string, dto: any): Promise<GoodsReceiptNoteEntity>;
    deleteGRN(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    convertGRNToInvoice(tenantId: string, grnId: string, userId: string): Promise<PurchaseInvoiceEntity>;
    getPurchaseInvoices(tenantId: string, page?: number, limit?: number, search?: string, status?: string): Promise<{
        data: PurchaseInvoiceEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPurchaseInvoice(tenantId: string, id: string): Promise<PurchaseInvoiceEntity>;
    createPurchaseInvoice(tenantId: string, dto: any, userId: string): Promise<PurchaseInvoiceEntity>;
    updatePurchaseInvoice(tenantId: string, id: string, dto: any): Promise<PurchaseInvoiceEntity>;
    deletePurchaseInvoice(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getPaymentVouchers(tenantId: string, page?: number, limit?: number, search?: string): Promise<{
        data: PaymentVoucherEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    createPaymentVoucher(tenantId: string, dto: any, userId: string): Promise<any>;
    deletePaymentVoucher(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getPurchaseReturns(tenantId: string, page?: number, limit?: number): Promise<{
        data: PurchaseReturnEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPurchaseReturn(tenantId: string, id: string): Promise<PurchaseReturnEntity>;
    createPurchaseReturn(tenantId: string, dto: any, userId: string): Promise<PurchaseReturnEntity>;
    updatePurchaseReturn(tenantId: string, id: string, dto: any): Promise<PurchaseReturnEntity>;
    deletePurchaseReturn(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
