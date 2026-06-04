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
    updateQuotationStatus(req: any, id: string, status: string): Promise<import("./sales.entities").QuotationEntity>;
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
    updateDNStatus(req: any, id: string, status: string): Promise<import("./sales.entities").DeliveryNoteEntity>;
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
    updateInvoiceStatus(req: any, id: string, status: string): Promise<import("./sales.entities").SalesInvoiceEntity>;
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
    updateReturnStatus(req: any, id: string, status: string): Promise<import("./sales.entities").SalesReturnEntity>;
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
    getDashboardAnalytics(req: any): Promise<{
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
    getFinanceDashboard(req: any): Promise<{
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
    updatePOStatus(req: any, id: string, status: string): Promise<import("./sales.entities").PurchaseOrderEntity>;
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
    updateGRNStatus(req: any, id: string, status: string): Promise<import("./sales.entities").GoodsReceiptNoteEntity>;
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
    updatePurchaseInvoiceStatus(req: any, id: string, status: string): Promise<import("./sales.entities").PurchaseInvoiceEntity>;
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
    getPaymentVoucher(req: any, id: string): Promise<import("./sales.entities").PaymentVoucherEntity>;
    updatePaymentVoucher(req: any, id: string, dto: any): Promise<import("./sales.entities").PaymentVoucherEntity>;
    deletePaymentVoucher(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getStockMovementReport(req: any, q: any): Promise<{
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
    getItemTransactionHistory(req: any, productId: string): Promise<{
        product: import("./sales.entities").ProductEntity;
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
    getAccountLedger(req: any, q: any): Promise<{
        transactions: any[];
        summary: {
            totalDebit: any;
            totalCredit: any;
            closingBalance: number;
        };
    }>;
    getSalesReport(req: any, q: any): Promise<{
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
    getPurchaseReport(req: any, q: any): Promise<{
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
    getTopCustomersSuppliers(req: any, q: any): Promise<{
        topCustomers: any[];
        topSuppliers: any[];
    }>;
    getFinancialReports(req: any, q: any): Promise<{
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
    getSalesTargets(req: any, q: any): Promise<any>;
    createSalesTarget(req: any, dto: any): Promise<any>;
    updateSalesTarget(req: any, id: string, dto: any): Promise<any>;
    deleteSalesTarget(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getSalesVsTarget(req: any, q: any): Promise<{
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
    getSalesmanReport(req: any, q: any): Promise<{
        bySalesman: any[];
        quotationsBySalesman: any[];
        visits: any;
    }>;
    getStockReport(req: any): Promise<{
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
    getGLLedger(req: any, q: any): Promise<{
        account: import("./sales.entities").ChartOfAccountEntity;
        transactions: any[];
        summary: {
            totalDebit: any;
            totalCredit: any;
            closingBalance: number;
        };
    }>;
    getAllCustomersStatement(req: any): Promise<any[]>;
    getAllSuppliersStatement(req: any): Promise<any[]>;
    getPurchaseReturns(req: any, q: any): Promise<{
        data: import("./sales.entities").PurchaseReturnEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPurchaseReturn(req: any, id: string): Promise<import("./sales.entities").PurchaseReturnEntity>;
    createPurchaseReturn(req: any, dto: any): Promise<import("./sales.entities").PurchaseReturnEntity>;
    updatePurchaseReturn(req: any, id: string, dto: any): Promise<import("./sales.entities").PurchaseReturnEntity>;
    updatePurchaseReturnStatus(req: any, id: string, status: string): Promise<import("./sales.entities").PurchaseReturnEntity>;
    deletePurchaseReturn(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getJournalVouchers(req: any, q: any): Promise<{
        data: import("./sales.entities").JournalVoucherEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getJournalVoucher(req: any, id: string): Promise<import("./sales.entities").JournalVoucherEntity>;
    createJournalVoucher(req: any, dto: any): Promise<import("./sales.entities").JournalVoucherEntity>;
    updateJournalVoucher(req: any, id: string, dto: any): Promise<import("./sales.entities").JournalVoucherEntity>;
    postJournalVoucher(req: any, id: string): Promise<import("./sales.entities").JournalVoucherEntity>;
    deleteJournalVoucher(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getGeneralLedger(req: any, q: any): Promise<{
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
    getTrialBalance(req: any, q: any): Promise<{
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
    getProfitLoss(req: any, q: any): Promise<{
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
    getBalanceSheet(req: any, q: any): Promise<{
        assets: any;
        liabilities: any;
        equity: any;
        asOfDate: string;
    }>;
    getCashFlow(req: any, q: any): Promise<{
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
    getARaging(req: any, q: any): Promise<{
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
            items: import("./sales.entities").SalesInvoiceItemEntity[];
        }[];
        summary: any;
        totalOutstanding: number;
    }>;
    getAPAging(req: any, q: any): Promise<{
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
            items: import("./sales.entities").PurchaseInvoiceItemEntity[];
        }[];
        summary: any;
        totalOutstanding: number;
    }>;
    getVATReturn(req: any, q: any): Promise<{
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
    getBudgetVsActual(req: any, q: any): Promise<{
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
    getDailyReport(req: any, q: any): Promise<{
        invoices: import("./sales.entities").SalesInvoiceEntity[];
        receipts: import("./sales.entities").ReceiptEntity[];
        quotations: import("./sales.entities").QuotationEntity[];
        totalSales: number;
        totalReceipts: number;
        totalVat: number;
        invoiceCount: number;
        receiptCount: number;
    }>;
    getBankReconciliation(req: any, q: any): Promise<{
        receipts: import("./sales.entities").ReceiptEntity[];
        paymentVouchers: import("./sales.entities").PaymentVoucherEntity[];
        totalReceipts: number;
        totalPayments: number;
        openingBalance: number;
    }>;
    getLiquidationProjection(req: any, q: any): Promise<{
        periods: any[];
        currentCash: number;
    }>;
    getCreditRiskStatement(req: any): Promise<{
        customers: any[];
        totalExposure: any;
    }>;
    getWarehouses(req: any, q: any): Promise<import("./sales.entities").WarehouseEntity[]>;
    createWarehouse(req: any, dto: any): Promise<import("./sales.entities").WarehouseEntity[]>;
    updateWarehouse(req: any, id: string, dto: any): Promise<import("./sales.entities").WarehouseEntity>;
    deleteWarehouse(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getLocations(req: any, q: any): Promise<import("./sales.entities").WarehouseLocationEntity[]>;
    createLocation(req: any, dto: any): Promise<import("./sales.entities").WarehouseLocationEntity[]>;
    updateLocation(req: any, id: string, dto: any): Promise<import("./sales.entities").WarehouseLocationEntity>;
    deleteLocation(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getStockTransfers(req: any, q: any): Promise<{
        data: import("./sales.entities").StockTransferEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStockTransfer(req: any, id: string): Promise<import("./sales.entities").StockTransferEntity>;
    createStockTransfer(req: any, dto: any): Promise<import("./sales.entities").StockTransferEntity>;
    updateStockTransfer(req: any, id: string, dto: any): Promise<import("./sales.entities").StockTransferEntity>;
    confirmStockTransfer(req: any, id: string): Promise<import("./sales.entities").StockTransferEntity>;
    deleteStockTransfer(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getStockAdjustments(req: any, q: any): Promise<{
        data: import("./sales.entities").StockAdjustmentEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStockAdjustment(req: any, id: string): Promise<import("./sales.entities").StockAdjustmentEntity>;
    createStockAdjustment(req: any, dto: any): Promise<import("./sales.entities").StockAdjustmentEntity>;
    updateStockAdjustment(req: any, id: string, dto: any): Promise<import("./sales.entities").StockAdjustmentEntity>;
    deleteStockAdjustment(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getPOAssetItems(req: any): Promise<any[]>;
    getConsumableStock(req: any): Promise<any>;
    getConsumableStats(req: any): Promise<any>;
    getConsumableTransactions(req: any, q: any): Promise<any>;
    issueConsumable(req: any, dto: any): Promise<{
        success: boolean;
        remainingQty: number;
    }>;
    receiveConsumable(req: any, dto: any): Promise<{
        success: boolean;
    }>;
    getBrands(req: any, q: any): Promise<any>;
    createBrand(req: any, dto: any): Promise<any>;
    deleteBrand(req: any, id: string): Promise<{
        success: boolean;
    }>;
    createDraftAssetsFromPO(req: any, poId: string): Promise<{
        created: number;
        assets: any[];
    }>;
    getAssetStats(req: any): Promise<{
        totalAssets: number;
        totalCost: number;
        totalBookValue: number;
        totalAccumDepr: number;
        byStatus: any;
        byCategory: any;
        dueForMaintenance: number;
        expiredWarranty: number;
    }>;
    getAssets(req: any, q: any): Promise<{
        data: import("./sales.entities").FixedAssetEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAsset(req: any, id: string): Promise<import("./sales.entities").FixedAssetEntity>;
    createAsset(req: any, dto: any): Promise<any>;
    updateAsset(req: any, id: string, dto: any): Promise<import("./sales.entities").FixedAssetEntity>;
    deleteAsset(req: any, id: string): Promise<{
        success: boolean;
    }>;
    calculateDepreciation(req: any, id: string, dto: any): Promise<import("./sales.entities").AssetDepreciationEntity[]>;
    runBulkDepreciation(req: any, dto: any): Promise<{
        processed: number;
        results: any[];
    }>;
    getDepreciationSchedule(req: any, id: string): Promise<import("./sales.entities").AssetDepreciationEntity[]>;
    getMaintenance(req: any, q: any): Promise<import("./sales.entities").AssetMaintenanceEntity[]>;
    createMaintenance(req: any, dto: any): Promise<import("./sales.entities").AssetMaintenanceEntity[]>;
    updateMaintenance(req: any, id: string, dto: any): Promise<import("./sales.entities").AssetMaintenanceEntity>;
    getTransfers(req: any, q: any): Promise<import("./sales.entities").AssetTransferEntity[]>;
    createTransfer(req: any, dto: any): Promise<import("./sales.entities").AssetTransferEntity[]>;
}
