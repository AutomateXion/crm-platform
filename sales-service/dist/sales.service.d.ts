import { Repository } from 'typeorm';
import { ProductEntity, StockMovementEntity, ExchangeRateEntity, QuotationEntity, QuotationItemEntity, DeliveryNoteEntity, DeliveryNoteItemEntity, SalesInvoiceEntity, SalesInvoiceItemEntity, ReceiptEntity, SalesReturnEntity, SalesReturnItemEntity, ChartOfAccountEntity, SupplierEntity, PurchaseOrderEntity, PurchaseOrderItemEntity, GoodsReceiptNoteEntity, GoodsReceiptNoteItemEntity, PurchaseInvoiceEntity, PurchaseInvoiceItemEntity, PaymentVoucherEntity, PurchaseReturnEntity, PurchaseReturnItemEntity, JournalVoucherEntity, JournalVoucherLineEntity, WarehouseEntity, WarehouseLocationEntity, StockTransferEntity, StockTransferItemEntity, StockAdjustmentEntity, StockAdjustmentItemEntity, FixedAssetEntity, AssetDepreciationEntity, AssetMaintenanceEntity, AssetTransferEntity, DocumentSignatureEntity } from './sales.entities';
export declare class SalesService {
    private coaRepo;
    private sigRepo;
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
    private jvRepo;
    private jvLineRepo;
    private warehouseRepo;
    private locationRepo;
    private transferRepo;
    private transferItemRepo;
    private adjustmentRepo;
    private fixedAssetRepo;
    private assetDeprRepo;
    private assetMaintRepo;
    private assetTransferRepo;
    private adjustmentItemRepo;
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
    constructor(coaRepo: Repository<ChartOfAccountEntity>, sigRepo: Repository<DocumentSignatureEntity>, supplierRepo: Repository<SupplierEntity>, poRepo: Repository<PurchaseOrderEntity>, poItemRepo: Repository<PurchaseOrderItemEntity>, grnRepo: Repository<GoodsReceiptNoteEntity>, grnItemRepo: Repository<GoodsReceiptNoteItemEntity>, purchaseInvoiceRepo: Repository<PurchaseInvoiceEntity>, purchaseInvoiceItemRepo: Repository<PurchaseInvoiceItemEntity>, voucherRepo: Repository<PaymentVoucherEntity>, purchaseReturnRepo: Repository<PurchaseReturnEntity>, purchaseReturnItemRepo: Repository<PurchaseReturnItemEntity>, jvRepo: Repository<JournalVoucherEntity>, jvLineRepo: Repository<JournalVoucherLineEntity>, warehouseRepo: Repository<WarehouseEntity>, locationRepo: Repository<WarehouseLocationEntity>, transferRepo: Repository<StockTransferEntity>, transferItemRepo: Repository<StockTransferItemEntity>, adjustmentRepo: Repository<StockAdjustmentEntity>, fixedAssetRepo: Repository<FixedAssetEntity>, assetDeprRepo: Repository<AssetDepreciationEntity>, assetMaintRepo: Repository<AssetMaintenanceEntity>, assetTransferRepo: Repository<AssetTransferEntity>, adjustmentItemRepo: Repository<StockAdjustmentItemEntity>, productRepo: Repository<ProductEntity>, stockRepo: Repository<StockMovementEntity>, rateRepo: Repository<ExchangeRateEntity>, quotationRepo: Repository<QuotationEntity>, quotationItemRepo: Repository<QuotationItemEntity>, dnRepo: Repository<DeliveryNoteEntity>, dnItemRepo: Repository<DeliveryNoteItemEntity>, invoiceRepo: Repository<SalesInvoiceEntity>, invoiceItemRepo: Repository<SalesInvoiceItemEntity>, receiptRepo: Repository<ReceiptEntity>, returnRepo: Repository<SalesReturnEntity>, returnItemRepo: Repository<SalesReturnItemEntity>);
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
    getQuotations(tenantId: string, page?: number, limit?: number, search?: string, status?: string, excludeConverted?: boolean): Promise<{
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
    getDeliveryNotes(tenantId: string, page?: number, limit?: number, search?: string, status?: string, excludeInvoiced?: boolean): Promise<{
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
    getInvoices(tenantId: string, page?: number, limit?: number, search?: string, status?: string, excludePaid?: boolean): Promise<{
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
        totalPurchaseOrders: number;
        totalGRNs: number;
        totalPurchaseInvoices: number;
        totalSuppliers: number;
        lowStockProducts: number;
        revenueThisMonth: any;
        revenueLastMonth: any;
        totalRevenue: any;
        outstandingReceivables: any;
        totalPurchases: any;
        outstandingPayables: any;
        invoicesByStatus: any[];
        quotationsByStatus: any[];
        posByStatus: any[];
        grnsByStatus: any[];
        purchaseInvoicesByStatus: any[];
        pendingQuotations: number;
        pendingInvoices: number;
        pendingGRNs: number;
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
    getPurchaseOrders(tenantId: string, page?: number, limit?: number, search?: string, status?: string, excludeReceived?: boolean): Promise<{
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
    getGRNs(tenantId: string, page?: number, limit?: number, search?: string, status?: string, excludeInvoiced?: boolean): Promise<{
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
    getPurchaseInvoices(tenantId: string, page?: number, limit?: number, search?: string, status?: string, excludePaid?: boolean): Promise<{
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
    getPaymentVoucher(tenantId: string, id: string): Promise<PaymentVoucherEntity>;
    updatePaymentVoucher(tenantId: string, id: string, dto: any): Promise<PaymentVoucherEntity>;
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
    getFinanceDashboard(tenantId: string): Promise<{
        quotations: {
            total: number;
            thisMonth: number;
            byStatus: any[];
        };
        invoices: {
            total: number;
            thisMonth: number;
            totalRevenue: number;
            revenueThisMonth: number;
            revenueLastMonth: number;
            totalOutstanding: number;
            overdueAmount: number;
            overdueCount: number;
            byStatus: any[];
            monthlyTrend: any[];
            topCustomers: any[];
        };
        receipts: {
            total: number;
            totalReceived: number;
            thisMonth: number;
        };
        purchases: {
            total: number;
            totalAmount: number;
            outstanding: number;
        };
        vat: {
            collected: number;
            paid: number;
            net: number;
        };
    }>;
    getJournalVouchers(tenantId: string, page?: number, limit?: number, search?: string, type?: string, status?: string): Promise<{
        data: JournalVoucherEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getJournalVoucher(tenantId: string, id: string): Promise<JournalVoucherEntity>;
    createJournalVoucher(tenantId: string, dto: any, userId: string): Promise<JournalVoucherEntity>;
    updateJournalVoucher(tenantId: string, id: string, dto: any): Promise<JournalVoucherEntity>;
    postJournalVoucher(tenantId: string, id: string, userId: string): Promise<JournalVoucherEntity>;
    deleteJournalVoucher(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getGeneralLedger(tenantId: string, accountId?: string, fromDate?: string, toDate?: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        summary: {
            totalDebit: any;
            totalCredit: any;
            netBalance: number;
        };
    }>;
    getTrialBalance(tenantId: string, fromDate?: string, toDate?: string): Promise<{
        accounts: {
            accountId: any;
            accountCode: any;
            accountName: any;
            totalDebit: number;
            totalCredit: number;
            balance: number;
        }[];
        grandTotalDebit: number;
        grandTotalCredit: number;
        isBalanced: boolean;
    }>;
    getProfitLoss(tenantId: string, fromDate?: string, toDate?: string): Promise<{
        revenue: {
            items: {
                accountCode: string;
                accountName: string;
                amount: number;
            }[];
            total: number;
        };
        costOfSales: {
            items: {
                accountCode: string;
                accountName: string;
                amount: number;
            }[];
            total: number;
        };
        grossProfit: number;
        expenses: {
            items: any[];
            total: number;
        };
        netProfit: number;
    }>;
    getBalanceSheet(tenantId: string, asOfDate?: string): Promise<{
        assets: any;
        liabilities: any;
        equity: any;
        asOfDate: string;
    }>;
    getCashFlow(tenantId: string, fromDate?: string, toDate?: string): Promise<{
        operating: {
            items: {
                description: string;
                amount: number;
            }[];
            total: number;
        };
        investing: {
            items: any[];
            total: number;
        };
        financing: {
            items: any[];
            total: number;
        };
        openingBalance: number;
        netCashFlow: number;
        closingBalance: number;
    }>;
    getARaging(tenantId: string, asOfDate?: string): Promise<{
        invoices: {
            daysOverdue: number;
            invoiceId: string;
            tenantId: string;
            invoiceNumber: string;
            invoiceDate: string;
            dueDate: string;
            quotationId: string;
            dnId: string;
            accountId: string;
            contactId: string;
            customerName: string;
            customerAddress: string;
            customerEmail: string;
            customerTrn: string;
            currencyCode: string;
            exchangeRate: number;
            isInventory: boolean;
            subtotal: number;
            discountAmount: number;
            vatRate: number;
            vatAmount: number;
            totalAmount: number;
            paidAmount: number;
            balanceDue: number;
            status: string;
            notes: string;
            termsConditions: string;
            paymentTerms: string;
            preparedBy: string;
            preparedByName: string;
            createdBy: string;
            salesmanId: string;
            salesmanName: string;
            createdAt: Date;
            updatedAt: Date;
            items: SalesInvoiceItemEntity[];
        }[];
        summary: any;
        totalOutstanding: number;
    }>;
    getAPAging(tenantId: string, asOfDate?: string): Promise<{
        invoices: {
            daysOverdue: number;
            invoiceId: string;
            tenantId: string;
            invoiceNumber: string;
            supplierInvoiceNo: string;
            invoiceDate: string;
            dueDate: string;
            poId: string;
            grnId: string;
            supplierId: string;
            supplierName: string;
            supplierAddress: string;
            supplierTrn: string;
            currencyCode: string;
            exchangeRate: number;
            isInventory: boolean;
            subtotal: number;
            discountAmount: number;
            vatRate: number;
            vatAmount: number;
            totalAmount: number;
            paidAmount: number;
            balanceDue: number;
            status: string;
            paymentTerms: string;
            notes: string;
            preparedBy: string;
            preparedByName: string;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
            items: PurchaseInvoiceItemEntity[];
        }[];
        summary: any;
        totalOutstanding: number;
    }>;
    getVATReturn(tenantId: string, fromDate?: string, toDate?: string): Promise<{
        outputVat: number;
        inputVat: number;
        netVat: number;
        taxableSales: number;
        salesDetails: {
            invoiceId: string;
            invoiceNumber: string;
            customerName: string;
            invoiceDate: string;
            taxableAmount: number;
            vatAmount: number;
        }[];
        purchaseDetails: {
            invoiceId: string;
            invoiceNumber: string;
            supplierName: string;
            invoiceDate: string;
            taxableAmount: number;
            vatAmount: number;
        }[];
    }>;
    getBudgetVsActual(tenantId: string, fromDate?: string, toDate?: string): Promise<{
        items: {
            accountId: string;
            accountCode: string;
            accountName: string;
            budget: number;
            actual: number;
            variance: number;
            utilization: number;
        }[];
        totalBudget: number;
        totalActual: number;
        totalVariance: number;
        overallUtilization: number;
    }>;
    getSalesTargets(tenantId: string, year?: number, month?: number): Promise<any>;
    createSalesTarget(tenantId: string, dto: any, userId: string): Promise<any>;
    updateSalesTarget(tenantId: string, id: string, dto: any): Promise<any>;
    deleteSalesTarget(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getSalesVsTarget(tenantId: string, year: number, month?: number): Promise<{
        year: number;
        month: number;
        targets: any;
        monthly: {
            month: string;
            monthNum: number;
            target: number;
            actual: number;
            variance: number;
            achievement: number;
            invoiceCount: number;
        }[];
        bySalesman: any[];
        summary: {
            totalTarget: number;
            totalActual: number;
            totalVariance: number;
            achievement: number;
        };
    }>;
    getDailyReport(tenantId: string, date?: string): Promise<{
        invoices: SalesInvoiceEntity[];
        receipts: ReceiptEntity[];
        quotations: QuotationEntity[];
        totalSales: number;
        totalReceipts: number;
        totalVat: number;
        invoiceCount: number;
        receiptCount: number;
    }>;
    getBankReconciliation(tenantId: string, fromDate?: string, toDate?: string): Promise<{
        receipts: ReceiptEntity[];
        paymentVouchers: PaymentVoucherEntity[];
        totalReceipts: number;
        totalPayments: number;
        openingBalance: number;
    }>;
    getLiquidationProjection(tenantId: string, currentCash: number, salaries: number, rent: number): Promise<{
        periods: any[];
        currentCash: number;
    }>;
    getCreditRiskStatement(tenantId: string): Promise<{
        customers: any[];
        totalExposure: any;
    }>;
    getWarehouses(tenantId: string, search?: string): Promise<WarehouseEntity[]>;
    createWarehouse(tenantId: string, dto: any, userId: string): Promise<WarehouseEntity[]>;
    updateWarehouse(tenantId: string, id: string, dto: any): Promise<WarehouseEntity>;
    deleteWarehouse(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getLocations(tenantId: string, warehouseId?: string): Promise<WarehouseLocationEntity[]>;
    createLocation(tenantId: string, dto: any): Promise<WarehouseLocationEntity[]>;
    updateLocation(tenantId: string, id: string, dto: any): Promise<WarehouseLocationEntity>;
    deleteLocation(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getStockTransfers(tenantId: string, page?: number, limit?: number, search?: string): Promise<{
        data: StockTransferEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStockTransfer(tenantId: string, id: string): Promise<StockTransferEntity>;
    createStockTransfer(tenantId: string, dto: any, userId: string): Promise<StockTransferEntity>;
    updateStockTransfer(tenantId: string, id: string, dto: any): Promise<StockTransferEntity>;
    confirmStockTransfer(tenantId: string, id: string, userId: string): Promise<StockTransferEntity>;
    deleteStockTransfer(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getStockAdjustments(tenantId: string, page?: number, limit?: number, search?: string): Promise<{
        data: StockAdjustmentEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStockAdjustment(tenantId: string, id: string): Promise<StockAdjustmentEntity>;
    createStockAdjustment(tenantId: string, dto: any, userId: string): Promise<StockAdjustmentEntity>;
    updateStockAdjustment(tenantId: string, id: string, dto: any): Promise<StockAdjustmentEntity>;
    deleteStockAdjustment(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    private createAutoJournalEntry;
    getStockMovementReport(tenantId: string, productId?: string, from?: string, to?: string): Promise<{
        productId: string;
        productCode: string;
        productName: string;
        category: string;
        unitOfMeasure: string;
        openingStock: number;
        purchasesIn: number;
        purchasesValue: number;
        salesOut: number;
        salesValue: number;
        adjustmentsIn: number;
        adjustmentsOut: number;
        closingStock: number;
        costPrice: number;
        unitPrice: number;
        stockValue: number;
        isLowStock: boolean;
        minStockQty: number;
    }[]>;
    getItemTransactionHistory(tenantId: string, productId: string): Promise<{
        product: ProductEntity;
        transactions: any[];
        summary: {
            totalSalesQty: number;
            totalSalesValue: number;
            totalPurchaseQty: number;
            totalPurchaseValue: number;
            currentStock: number;
            stockValue: number;
        };
        priceAnalysis: {
            minSalePrice: number;
            maxSalePrice: number;
            avgSalePrice: number;
            minPurchasePrice: number;
            maxPurchasePrice: number;
            avgPurchasePrice: number;
            currentCostPrice: number;
            currentSellingPrice: number;
        };
    }>;
    getGLLedger(tenantId: string, accountId: string, from?: string, to?: string): Promise<{
        account: ChartOfAccountEntity;
        transactions: any[];
        summary: {
            totalDebit: any;
            totalCredit: any;
            closingBalance: number;
        };
    }>;
    getAllCustomersStatement(tenantId: string): Promise<any[]>;
    getAllSuppliersStatement(tenantId: string): Promise<any[]>;
    getAccountLedger(tenantId: string, accountId?: string, customerName?: string, supplierName?: string, from?: string, to?: string): Promise<{
        transactions: any[];
        summary: {
            totalDebit: any;
            totalCredit: any;
            closingBalance: number;
        };
    }>;
    getSalesReport(tenantId: string, from?: string, to?: string): Promise<{
        summary: {
            totalInvoices: number;
            totalRevenue: number;
            totalPaid: number;
            totalBalance: number;
        };
        byCustomer: any[];
        byProduct: any[];
        byMonth: any[];
    }>;
    getPurchaseReport(tenantId: string, from?: string, to?: string): Promise<{
        summary: {
            totalInvoices: number;
            totalPurchases: number;
            totalPaid: number;
            totalBalance: number;
        };
        bySupplier: any[];
        byProduct: any[];
        byMonth: any[];
    }>;
    getTopCustomersSuppliers(tenantId: string, limit?: number): Promise<{
        topCustomers: any[];
        topSuppliers: any[];
    }>;
    getFinancialReports(tenantId: string, from?: string, to?: string): Promise<{
        trialBalance: {
            accountId: string;
            accountCode: string;
            accountName: string;
            accountType: string;
            accountSubtype: string;
            debit: number;
            credit: number;
            balance: number;
        }[];
        pnl: {
            revenue: {
                accountId: string;
                accountCode: string;
                accountName: string;
                accountType: string;
                accountSubtype: string;
                debit: number;
                credit: number;
                balance: number;
            }[];
            cogs: {
                accountId: string;
                accountCode: string;
                accountName: string;
                accountType: string;
                accountSubtype: string;
                debit: number;
                credit: number;
                balance: number;
            }[];
            opex: {
                accountId: string;
                accountCode: string;
                accountName: string;
                accountType: string;
                accountSubtype: string;
                debit: number;
                credit: number;
                balance: number;
            }[];
            totalRevenue: number;
            totalCogs: number;
            grossProfit: number;
            totalOpex: number;
            netProfit: number;
            grossMargin: number;
            netMargin: number;
        };
        balanceSheet: {
            currentAssets: {
                accountId: string;
                accountCode: string;
                accountName: string;
                accountType: string;
                accountSubtype: string;
                debit: number;
                credit: number;
                balance: number;
            }[];
            fixedAssets: {
                accountId: string;
                accountCode: string;
                accountName: string;
                accountType: string;
                accountSubtype: string;
                debit: number;
                credit: number;
                balance: number;
            }[];
            currentLiabilities: {
                accountId: string;
                accountCode: string;
                accountName: string;
                accountType: string;
                accountSubtype: string;
                debit: number;
                credit: number;
                balance: number;
            }[];
            longTermLiabilities: {
                accountId: string;
                accountCode: string;
                accountName: string;
                accountType: string;
                accountSubtype: string;
                debit: number;
                credit: number;
                balance: number;
            }[];
            equity: {
                accountId: string;
                accountCode: string;
                accountName: string;
                accountType: string;
                accountSubtype: string;
                debit: number;
                credit: number;
                balance: number;
            }[];
            totalCurrentAssets: number;
            totalFixedAssets: number;
            totalAssets: number;
            totalCurrentLiabilities: number;
            totalLongTermLiabilities: number;
            totalEquity: number;
            totalLiabilitiesEquity: number;
            netProfit: number;
            isBalanced: boolean;
        };
    }>;
    getConsumableStock(tenantId: string): Promise<any>;
    getConsumableTransactions(tenantId: string, productId?: string): Promise<any>;
    issueConsumable(tenantId: string, dto: any, userId: string): Promise<{
        success: boolean;
        remainingQty: number;
    }>;
    receiveConsumable(tenantId: string, productId: string, quantity: number, referenceNo: string, userId: string): Promise<{
        success: boolean;
    }>;
    getConsumableStats(tenantId: string): Promise<any>;
    getPOAssetItems(tenantId: string): Promise<any[]>;
    getBrands(tenantId: string, category?: string): Promise<any>;
    createBrand(tenantId: string, dto: any): Promise<any>;
    deleteBrand(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    createDraftAssetsFromPO(tenantId: string, poId: string, userId: string): Promise<{
        created: number;
        assets: any[];
    }>;
    getAssets(tenantId: string, page?: number, limit?: number, search?: string, status?: string, category?: string): Promise<{
        data: FixedAssetEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAsset(tenantId: string, id: string): Promise<FixedAssetEntity>;
    createAsset(tenantId: string, dto: any, userId: string): Promise<any>;
    updateAsset(tenantId: string, id: string, dto: any): Promise<FixedAssetEntity>;
    deleteAsset(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    calculateDepreciation(tenantId: string, assetId: string, year: number, month: number, userId: string): Promise<AssetDepreciationEntity[]>;
    runBulkDepreciation(tenantId: string, year: number, month: number, userId: string): Promise<{
        processed: number;
        results: any[];
    }>;
    getDepreciationSchedule(tenantId: string, assetId: string): Promise<AssetDepreciationEntity[]>;
    getMaintenance(tenantId: string, assetId?: string, status?: string): Promise<AssetMaintenanceEntity[]>;
    createMaintenance(tenantId: string, dto: any, userId: string): Promise<AssetMaintenanceEntity[]>;
    updateMaintenance(tenantId: string, id: string, dto: any): Promise<AssetMaintenanceEntity>;
    getTransfers(tenantId: string, assetId?: string): Promise<AssetTransferEntity[]>;
    createTransfer(tenantId: string, dto: any, userId: string): Promise<AssetTransferEntity[]>;
    getAssetStats(tenantId: string): Promise<{
        totalAssets: number;
        totalCost: number;
        totalBookValue: number;
        totalAccumDepr: number;
        byStatus: any;
        byCategory: any;
        dueForMaintenance: number;
        expiredWarranty: number;
    }>;
    getSalesmanReport(tenantId: string, from?: string, to?: string): Promise<{
        bySalesman: any[];
        quotationsBySalesman: any[];
        visits: any;
    }>;
    getStockReport(tenantId: string): Promise<{
        productId: string;
        productCode: string;
        productName: string;
        category: string;
        unitOfMeasure: string;
        stockQty: number;
        minStockQty: number;
        costPrice: number;
        unitPrice: number;
        stockValue: number;
        isLowStock: boolean;
        trackStock: boolean;
        margin: number;
    }[]>;
    getDashboardAnalytics(tenantId: string): Promise<{
        stockByType: any;
        topProducts: any;
        stockMovement: any;
        assetsByCategory: any;
        assetCostVsDepr: any;
        assetCondition: any;
        pipeline: any;
        documentCounts: any;
        revenueByMonth: any;
    }>;
    signInPerson(tenantId: string, userId: string, dto: any): Promise<DocumentSignatureEntity>;
    getSignatures(tenantId: string, docType: string, docId: string): Promise<DocumentSignatureEntity[]>;
    getSignatureStatus(tenantId: string, docType: string): Promise<any[]>;
}
