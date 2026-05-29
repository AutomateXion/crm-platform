import { SalesService } from './sales.service';
export declare class SalesController {
    private readonly svc;
    constructor(svc: SalesService);
    getProducts(req: any, q: any): Promise<{
        data: import("./sales.entities").ProductEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getProduct(req: any, id: string): Promise<import("./sales.entities").ProductEntity>;
    createProduct(req: any, dto: any): Promise<import("./sales.entities").ProductEntity[]>;
    updateProduct(req: any, id: string, dto: any): Promise<import("./sales.entities").ProductEntity>;
    deleteProduct(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getStockMovements(req: any, q: any): Promise<import("./sales.entities").StockMovementEntity[]>;
    adjustStock(req: any, dto: any): Promise<import("./sales.entities").StockMovementEntity>;
    getExchangeRates(req: any): Promise<import("./sales.entities").ExchangeRateEntity[]>;
    createExchangeRate(req: any, dto: any): Promise<import("./sales.entities").ExchangeRateEntity[]>;
    updateExchangeRate(req: any, id: string, dto: any): Promise<import("./sales.entities").ExchangeRateEntity>;
    deleteExchangeRate(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getQuotations(req: any, q: any): Promise<{
        data: import("./sales.entities").QuotationEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getQuotation(req: any, id: string): Promise<import("./sales.entities").QuotationEntity>;
    createQuotation(req: any, dto: any): Promise<import("./sales.entities").QuotationEntity>;
    updateQuotation(req: any, id: string, dto: any): Promise<import("./sales.entities").QuotationEntity>;
    deleteQuotation(req: any, id: string): Promise<{
        success: boolean;
    }>;
    convertQuotationToDN(req: any, id: string): Promise<import("./sales.entities").DeliveryNoteEntity>;
    getDeliveryNotes(req: any, q: any): Promise<{
        data: import("./sales.entities").DeliveryNoteEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getDeliveryNote(req: any, id: string): Promise<import("./sales.entities").DeliveryNoteEntity>;
    createDeliveryNote(req: any, dto: any): Promise<import("./sales.entities").DeliveryNoteEntity>;
    updateDeliveryNote(req: any, id: string, dto: any): Promise<import("./sales.entities").DeliveryNoteEntity>;
    deleteDeliveryNote(req: any, id: string): Promise<{
        success: boolean;
    }>;
    convertDNToInvoice(req: any, id: string): Promise<import("./sales.entities").SalesInvoiceEntity>;
    getInvoices(req: any, q: any): Promise<{
        data: import("./sales.entities").SalesInvoiceEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getInvoice(req: any, id: string): Promise<import("./sales.entities").SalesInvoiceEntity>;
    createInvoice(req: any, dto: any): Promise<import("./sales.entities").SalesInvoiceEntity>;
    updateInvoice(req: any, id: string, dto: any): Promise<import("./sales.entities").SalesInvoiceEntity>;
    deleteInvoice(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getReceipts(req: any, q: any): Promise<{
        data: import("./sales.entities").ReceiptEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    createReceipt(req: any, dto: any): Promise<import("./sales.entities").ReceiptEntity[]>;
    deleteReceipt(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getReturns(req: any, q: any): Promise<{
        data: import("./sales.entities").SalesReturnEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getReturn(req: any, id: string): Promise<import("./sales.entities").SalesReturnEntity>;
    createReturn(req: any, dto: any): Promise<import("./sales.entities").SalesReturnEntity>;
    updateReturn(req: any, id: string, dto: any): Promise<import("./sales.entities").SalesReturnEntity>;
    deleteReturn(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getAccounts(req: any, q: any): Promise<import("./sales.entities").ChartOfAccountEntity[]>;
    createAccount(req: any, dto: any): Promise<import("./sales.entities").ChartOfAccountEntity[]>;
    updateAccount(req: any, id: string, dto: any): Promise<import("./sales.entities").ChartOfAccountEntity>;
    deleteAccount(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getDashboard(req: any): Promise<{
        totalQuotations: number;
        totalInvoices: number;
        totalReceipts: number;
        totalReturns: number;
        lowStockProducts: number;
    }>;
    getSuppliers(req: any, q: any): Promise<{
        data: import("./sales.entities").SupplierEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getSupplier(req: any, id: string): Promise<import("./sales.entities").SupplierEntity>;
    createSupplier(req: any, dto: any): Promise<import("./sales.entities").SupplierEntity[]>;
    updateSupplier(req: any, id: string, dto: any): Promise<import("./sales.entities").SupplierEntity>;
    deleteSupplier(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getPurchaseOrders(req: any, q: any): Promise<{
        data: import("./sales.entities").PurchaseOrderEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPurchaseOrder(req: any, id: string): Promise<import("./sales.entities").PurchaseOrderEntity>;
    createPurchaseOrder(req: any, dto: any): Promise<import("./sales.entities").PurchaseOrderEntity>;
    updatePurchaseOrder(req: any, id: string, dto: any): Promise<import("./sales.entities").PurchaseOrderEntity>;
    deletePurchaseOrder(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getGRNs(req: any, q: any): Promise<{
        data: import("./sales.entities").GoodsReceiptNoteEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getGRN(req: any, id: string): Promise<import("./sales.entities").GoodsReceiptNoteEntity>;
    createGRN(req: any, dto: any): Promise<import("./sales.entities").GoodsReceiptNoteEntity>;
    updateGRN(req: any, id: string, dto: any): Promise<import("./sales.entities").GoodsReceiptNoteEntity>;
    deleteGRN(req: any, id: string): Promise<{
        success: boolean;
    }>;
    convertGRNToInvoice(req: any, id: string): Promise<import("./sales.entities").PurchaseInvoiceEntity>;
    getPurchaseInvoices(req: any, q: any): Promise<{
        data: import("./sales.entities").PurchaseInvoiceEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPurchaseInvoice(req: any, id: string): Promise<import("./sales.entities").PurchaseInvoiceEntity>;
    createPurchaseInvoice(req: any, dto: any): Promise<import("./sales.entities").PurchaseInvoiceEntity>;
    updatePurchaseInvoice(req: any, id: string, dto: any): Promise<import("./sales.entities").PurchaseInvoiceEntity>;
    deletePurchaseInvoice(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getPaymentVouchers(req: any, q: any): Promise<{
        data: import("./sales.entities").PaymentVoucherEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    createPaymentVoucher(req: any, dto: any): Promise<any>;
    deletePaymentVoucher(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getPurchaseReturns(req: any, q: any): Promise<{
        data: import("./sales.entities").PurchaseReturnEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPurchaseReturn(req: any, id: string): Promise<import("./sales.entities").PurchaseReturnEntity>;
    createPurchaseReturn(req: any, dto: any): Promise<import("./sales.entities").PurchaseReturnEntity>;
    updatePurchaseReturn(req: any, id: string, dto: any): Promise<import("./sales.entities").PurchaseReturnEntity>;
    deletePurchaseReturn(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
