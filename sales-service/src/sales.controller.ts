import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { SalesService } from './sales.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly svc: SalesService) {}

  // ── Products ──────────────────────────────────────────────────
  @Get('products')
  getProducts(@Request() req: any, @Query() q: any) {
    return this.svc.getProducts(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.category);
  }

  @Get('products/:id')
  getProduct(@Request() req: any, @Param('id') id: string) {
    return this.svc.getProduct(req.user.tenantId, id);
  }

  @Post('products')
  createProduct(@Request() req: any, @Body() dto: any) {
    return this.svc.createProduct(req.user.tenantId, dto, req.user.userId);
  }

  @Put('products/:id')
  updateProduct(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateProduct(req.user.tenantId, id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteProduct(req.user.tenantId, id);
  }

  @Get('stock-movements')
  getStockMovements(@Request() req: any, @Query() q: any) {
    return this.svc.getStockMovements(req.user.tenantId, q.productId);
  }

  @Post('stock-adjustments')
  adjustStock(@Request() req: any, @Body() dto: any) {
    return this.svc.adjustStock(req.user.tenantId, dto.productId, dto.quantity, dto.type, dto.reference, req.user.userId);
  }

  // ── Exchange Rates ─────────────────────────────────────────────
  @Get('exchange-rates')
  getExchangeRates(@Request() req: any) {
    return this.svc.getExchangeRates(req.user.tenantId);
  }

  @Post('exchange-rates')
  createExchangeRate(@Request() req: any, @Body() dto: any) {
    return this.svc.createExchangeRate(req.user.tenantId, dto, req.user.userId);
  }

  @Put('exchange-rates/:id')
  updateExchangeRate(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateExchangeRate(req.user.tenantId, id, dto);
  }

  @Delete('exchange-rates/:id')
  deleteExchangeRate(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteExchangeRate(req.user.tenantId, id);
  }

  // ── Quotations ────────────────────────────────────────────────
  @Get('quotations')
  getQuotations(@Request() req: any, @Query() q: any) {
    return this.svc.getQuotations(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status, q.excludeConverted === 'true');
  }

  @Get('quotations/:id')
  getQuotation(@Request() req: any, @Param('id') id: string) {
    return this.svc.getQuotation(req.user.tenantId, id);
  }

  @Post('quotations')
  createQuotation(@Request() req: any, @Body() dto: any) {
    return this.svc.createQuotation(req.user.tenantId, dto, req.user.userId);
  }

  @Put('quotations/:id')
  updateQuotation(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateQuotation(req.user.tenantId, id, dto);
  }

  @Patch('quotations/:id/status')
  updateQuotationStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.svc.updateQuotation(req.user.tenantId, id, { status });
  }
  @Delete('quotations/:id')
  deleteQuotation(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteQuotation(req.user.tenantId, id);
  }

  @Post('quotations/:id/convert-to-dn')
  convertQuotationToDN(@Request() req: any, @Param('id') id: string) {
    return this.svc.convertQuotationToDN(req.user.tenantId, id, req.user.userId);
  }

  // ── Delivery Notes ────────────────────────────────────────────
  @Get('delivery-notes')
  getDeliveryNotes(@Request() req: any, @Query() q: any) {
    return this.svc.getDeliveryNotes(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status, q.excludeInvoiced === 'true');
  }

  @Get('delivery-notes/:id')
  getDeliveryNote(@Request() req: any, @Param('id') id: string) {
    return this.svc.getDeliveryNote(req.user.tenantId, id);
  }

  @Post('delivery-notes')
  createDeliveryNote(@Request() req: any, @Body() dto: any) {
    return this.svc.createDeliveryNote(req.user.tenantId, dto, req.user.userId);
  }

  @Put('delivery-notes/:id')
  updateDeliveryNote(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateDeliveryNote(req.user.tenantId, id, dto);
  }

  @Patch('delivery-notes/:id/status')
  updateDNStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.svc.updateDeliveryNote(req.user.tenantId, id, { status });
  }
  @Delete('delivery-notes/:id')
  deleteDeliveryNote(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteDeliveryNote(req.user.tenantId, id);
  }

  @Post('delivery-notes/:id/convert-to-invoice')
  convertDNToInvoice(@Request() req: any, @Param('id') id: string) {
    return this.svc.convertDNToInvoice(req.user.tenantId, id, req.user.userId);
  }

  // ── Sales Invoices ────────────────────────────────────────────
  @Get('invoices')
  getInvoices(@Request() req: any, @Query() q: any) {
    return this.svc.getInvoices(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search, q.status);
  }

  @Get('invoices/:id')
  getInvoice(@Request() req: any, @Param('id') id: string) {
    return this.svc.getInvoice(req.user.tenantId, id);
  }

  @Post('invoices')
  createInvoice(@Request() req: any, @Body() dto: any) {
    return this.svc.createInvoice(req.user.tenantId, dto, req.user.userId);
  }

  @Put('invoices/:id')
  updateInvoice(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateInvoice(req.user.tenantId, id, dto);
  }

  @Patch('invoices/:id/status')
  updateInvoiceStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.svc.updateInvoice(req.user.tenantId, id, { status });
  }
  @Delete('invoices/:id')
  deleteInvoice(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteInvoice(req.user.tenantId, id);
  }

  // ── Receipts ──────────────────────────────────────────────────
  @Get('receipts')
  getReceipts(@Request() req: any, @Query() q: any) {
    return this.svc.getReceipts(req.user.tenantId, +q.page || 1, +q.limit || 20, q.search);
  }

  @Post('receipts')
  createReceipt(@Request() req: any, @Body() dto: any) {
    return this.svc.createReceipt(req.user.tenantId, dto, req.user.userId);
  }

  @Delete('receipts/:id')
  deleteReceipt(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteReceipt(req.user.tenantId, id);
  }

  // ── Sales Returns ─────────────────────────────────────────────
  @Get('returns')
  getReturns(@Request() req: any, @Query() q: any) {
    return this.svc.getReturns(req.user.tenantId, +q.page || 1, +q.limit || 20);
  }

  @Get('returns/:id')
  getReturn(@Request() req: any, @Param('id') id: string) {
    return this.svc.getReturn(req.user.tenantId, id);
  }

  @Post('returns')
  createReturn(@Request() req: any, @Body() dto: any) {
    return this.svc.createReturn(req.user.tenantId, dto, req.user.userId);
  }

  @Put('returns/:id')
  updateReturn(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateReturn(req.user.tenantId, id, dto);
  }

  @Patch('returns/:id/status')
  updateReturnStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.svc.updateReturn(req.user.tenantId, id, { status });
  }
  @Delete('returns/:id')
  deleteReturn(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteReturn(req.user.tenantId, id);
  }

  // ── Chart of Accounts ─────────────────────────────────────────
  @Get('chart-of-accounts')
  getAccounts(@Request() req: any, @Query() q: any) {
    return this.svc.getAccounts(req.user.tenantId, q.type, q.search);
  }

  @Post('chart-of-accounts')
  createAccount(@Request() req: any, @Body() dto: any) {
    return this.svc.createAccount(req.user.tenantId, dto);
  }

  @Put('chart-of-accounts/:id')
  updateAccount(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateAccount(req.user.tenantId, id, dto);
  }

  @Delete('chart-of-accounts/:id')
  deleteAccount(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteAccount(req.user.tenantId, id);
  }

  // ── Dashboard ─────────────────────────────────────────────────
  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.svc.getDashboard(req.user.tenantId);
  }

  // ── Finance Dashboard ─────────────────────────────────────────
  @Get('finance-dashboard')
  getFinanceDashboard(@Request() req: any) {
    return this.svc.getFinanceDashboard(req.user.tenantId);
  }

  // ── Suppliers ─────────────────────────────────────────────────
  @Get('suppliers')
  getSuppliers(@Request() req: any, @Query() q: any) {
    return this.svc.getSuppliers(req.user.tenantId, +q.page||1, +q.limit||20, q.search);
  }
  @Get('suppliers/:id')
  getSupplier(@Request() req: any, @Param('id') id: string) {
    return this.svc.getSupplier(req.user.tenantId, id);
  }
  @Post('suppliers')
  createSupplier(@Request() req: any, @Body() dto: any) {
    return this.svc.createSupplier(req.user.tenantId, dto, req.user.userId);
  }
  @Put('suppliers/:id')
  updateSupplier(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateSupplier(req.user.tenantId, id, dto);
  }
  @Delete('suppliers/:id')
  deleteSupplier(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteSupplier(req.user.tenantId, id);
  }

  // ── Purchase Orders ───────────────────────────────────────────
  @Get('purchase-orders')
  getPurchaseOrders(@Request() req: any, @Query() q: any) {
    return this.svc.getPurchaseOrders(req.user.tenantId, +q.page||1, +q.limit||20, q.search, q.status, q.excludeReceived === 'true');
  }
  @Get('purchase-orders/:id')
  getPurchaseOrder(@Request() req: any, @Param('id') id: string) {
    return this.svc.getPurchaseOrder(req.user.tenantId, id);
  }
  @Post('purchase-orders')
  createPurchaseOrder(@Request() req: any, @Body() dto: any) {
    return this.svc.createPurchaseOrder(req.user.tenantId, dto, req.user.userId);
  }
  @Put('purchase-orders/:id')
  updatePurchaseOrder(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updatePurchaseOrder(req.user.tenantId, id, dto);
  }
  @Patch('purchase-orders/:id/status')
  updatePOStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.svc.updatePurchaseOrder(req.user.tenantId, id, { status });
  }
  @Delete('purchase-orders/:id')
  deletePurchaseOrder(@Request() req: any, @Param('id') id: string) {
    return this.svc.deletePurchaseOrder(req.user.tenantId, id);
  }

  // ── GRN ──────────────────────────────────────────────────────
  @Get('grns')
  getGRNs(@Request() req: any, @Query() q: any) {
    return this.svc.getGRNs(req.user.tenantId, +q.page||1, +q.limit||20, q.search, q.status, q.excludeInvoiced === 'true');
  }
  @Get('grns/:id')
  getGRN(@Request() req: any, @Param('id') id: string) {
    return this.svc.getGRN(req.user.tenantId, id);
  }
  @Post('grns')
  createGRN(@Request() req: any, @Body() dto: any) {
    return this.svc.createGRN(req.user.tenantId, dto, req.user.userId);
  }
  @Put('grns/:id')
  updateGRN(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateGRN(req.user.tenantId, id, dto);
  }
  @Patch('grns/:id/status')
  updateGRNStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.svc.updateGRN(req.user.tenantId, id, { status });
  }
  @Delete('grns/:id')
  deleteGRN(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteGRN(req.user.tenantId, id);
  }
  @Post('grns/:id/convert-to-invoice')
  convertGRNToInvoice(@Request() req: any, @Param('id') id: string) {
    return this.svc.convertGRNToInvoice(req.user.tenantId, id, req.user.userId);
  }

  // ── Purchase Invoices ─────────────────────────────────────────
  @Get('purchase-invoices')
  getPurchaseInvoices(@Request() req: any, @Query() q: any) {
    return this.svc.getPurchaseInvoices(req.user.tenantId, +q.page||1, +q.limit||20, q.search, q.status, q.excludePaid === 'true');
  }
  @Get('purchase-invoices/:id')
  getPurchaseInvoice(@Request() req: any, @Param('id') id: string) {
    return this.svc.getPurchaseInvoice(req.user.tenantId, id);
  }
  @Post('purchase-invoices')
  createPurchaseInvoice(@Request() req: any, @Body() dto: any) {
    return this.svc.createPurchaseInvoice(req.user.tenantId, dto, req.user.userId);
  }
  @Put('purchase-invoices/:id')
  updatePurchaseInvoice(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updatePurchaseInvoice(req.user.tenantId, id, dto);
  }
  @Patch('purchase-invoices/:id/status')
  updatePurchaseInvoiceStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.svc.updatePurchaseInvoice(req.user.tenantId, id, { status });
  }
  @Delete('purchase-invoices/:id')
  deletePurchaseInvoice(@Request() req: any, @Param('id') id: string) {
    return this.svc.deletePurchaseInvoice(req.user.tenantId, id);
  }

  // ── Payment Vouchers ──────────────────────────────────────────
  @Get('payment-vouchers')
  getPaymentVouchers(@Request() req: any, @Query() q: any) {
    return this.svc.getPaymentVouchers(req.user.tenantId, +q.page||1, +q.limit||20, q.search);
  }
  @Post('payment-vouchers')
  createPaymentVoucher(@Request() req: any, @Body() dto: any) {
    return this.svc.createPaymentVoucher(req.user.tenantId, dto, req.user.userId);
  }
  @Get('payment-vouchers/:id')
  getPaymentVoucher(@Request() req: any, @Param('id') id: string) {
    return this.svc.getPaymentVoucher(req.user.tenantId, id);
  }
  @Put('payment-vouchers/:id')
  updatePaymentVoucher(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updatePaymentVoucher(req.user.tenantId, id, dto);
  }
  @Delete('payment-vouchers/:id')
  deletePaymentVoucher(@Request() req: any, @Param('id') id: string) {
    return this.svc.deletePaymentVoucher(req.user.tenantId, id);
  }

  // ── Reports ──────────────────────────────────────────────────
  @Get('reports/stock-movement')
  getStockMovementReport(@Request() req: any, @Query() q: any) {
    return this.svc.getStockMovementReport(req.user.tenantId, q.productId, q.from, q.to);
  }
  @Get('reports/item-history/:productId')
  getItemTransactionHistory(@Request() req: any, @Param('productId') productId: string) {
    return this.svc.getItemTransactionHistory(req.user.tenantId, productId);
  }
  @Get('reports/account-ledger')
  getAccountLedger(@Request() req: any, @Query() q: any) {
    return this.svc.getAccountLedger(req.user.tenantId, q.accountId, q.customerName, q.supplierName, q.from, q.to);
  }
  @Get('reports/sales')
  getSalesReport(@Request() req: any, @Query() q: any) {
    return this.svc.getSalesReport(req.user.tenantId, q.from, q.to);
  }
  @Get('reports/purchases')
  getPurchaseReport(@Request() req: any, @Query() q: any) {
    return this.svc.getPurchaseReport(req.user.tenantId, q.from, q.to);
  }
  @Get('reports/top-customers-suppliers')
  getTopCustomersSuppliers(@Request() req: any, @Query() q: any) {
    return this.svc.getTopCustomersSuppliers(req.user.tenantId, +q.limit || 10);
  }
  @Get('reports/financial')
  getFinancialReports(@Request() req: any, @Query() q: any) {
    return this.svc.getFinancialReports(req.user.tenantId, q.from, q.to);
  }
  @Get('sales-targets')
  getSalesTargets(@Request() req: any, @Query() q: any) {
    return this.svc.getSalesTargets(req.user.tenantId, q.year ? +q.year : undefined, q.month ? +q.month : undefined);
  }
  @Post('sales-targets')
  createSalesTarget(@Request() req: any, @Body() dto: any) {
    return this.svc.createSalesTarget(req.user.tenantId, dto, req.user.userId);
  }
  @Put('sales-targets/:id')
  updateSalesTarget(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateSalesTarget(req.user.tenantId, id, dto);
  }
  @Delete('sales-targets/:id')
  deleteSalesTarget(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteSalesTarget(req.user.tenantId, id);
  }
  @Get('sales-vs-target')
  getSalesVsTarget(@Request() req: any, @Query() q: any) {
    return this.svc.getSalesVsTarget(req.user.tenantId, q.year ? +q.year : new Date().getFullYear(), q.month ? +q.month : undefined);
  }
  @Get('reports/salesman')
  getSalesmanReport(@Request() req: any, @Query() q: any) {
    return this.svc.getSalesmanReport(req.user.tenantId, q.from, q.to);
  }
  @Get('reports/stock')
  getStockReport(@Request() req: any) {
    return this.svc.getStockReport(req.user.tenantId);
  }
  @Get('reports/gl-ledger')
  getGLLedger(@Request() req: any, @Query() q: any) {
    return this.svc.getGLLedger(req.user.tenantId, q.accountId, q.from, q.to);
  }
  @Get('reports/customers-statement')
  getAllCustomersStatement(@Request() req: any) {
    return this.svc.getAllCustomersStatement(req.user.tenantId);
  }
  @Get('reports/suppliers-statement')
  getAllSuppliersStatement(@Request() req: any) {
    return this.svc.getAllSuppliersStatement(req.user.tenantId);
  }
  // ── Purchase Returns ──────────────────────────────────────────
  @Get('purchase-returns')
  getPurchaseReturns(@Request() req: any, @Query() q: any) {
    return this.svc.getPurchaseReturns(req.user.tenantId, +q.page||1, +q.limit||20);
  }
  @Get('purchase-returns/:id')
  getPurchaseReturn(@Request() req: any, @Param('id') id: string) {
    return this.svc.getPurchaseReturn(req.user.tenantId, id);
  }
  @Post('purchase-returns')
  createPurchaseReturn(@Request() req: any, @Body() dto: any) {
    return this.svc.createPurchaseReturn(req.user.tenantId, dto, req.user.userId);
  }
  @Put('purchase-returns/:id')
  updatePurchaseReturn(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updatePurchaseReturn(req.user.tenantId, id, dto);
  }
  @Patch('purchase-returns/:id/status')
  updatePurchaseReturnStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.svc.updatePurchaseReturn(req.user.tenantId, id, { status });
  }
  @Delete('purchase-returns/:id')
  deletePurchaseReturn(@Request() req: any, @Param('id') id: string) {
    return this.svc.deletePurchaseReturn(req.user.tenantId, id);
  }

  // ── Journal Vouchers ──────────────────────────────────────────
  @Get('journal-vouchers')
  getJournalVouchers(@Request() req: any, @Query() q: any) {
    return this.svc.getJournalVouchers(req.user.tenantId, +q.page||1, +q.limit||20, q.search, q.type, q.status);
  }
  @Get('journal-vouchers/:id')
  getJournalVoucher(@Request() req: any, @Param('id') id: string) {
    return this.svc.getJournalVoucher(req.user.tenantId, id);
  }
  @Post('journal-vouchers')
  createJournalVoucher(@Request() req: any, @Body() dto: any) {
    return this.svc.createJournalVoucher(req.user.tenantId, dto, req.user.userId);
  }
  @Put('journal-vouchers/:id')
  updateJournalVoucher(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateJournalVoucher(req.user.tenantId, id, dto);
  }
  @Post('journal-vouchers/:id/post')
  postJournalVoucher(@Request() req: any, @Param('id') id: string) {
    return this.svc.postJournalVoucher(req.user.tenantId, id, req.user.userId);
  }
  @Delete('journal-vouchers/:id')
  deleteJournalVoucher(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteJournalVoucher(req.user.tenantId, id);
  }
  // ── General Ledger ────────────────────────────────────────────
  @Get('general-ledger')
  getGeneralLedger(@Request() req: any, @Query() q: any) {
    return this.svc.getGeneralLedger(req.user.tenantId, q.accountId, q.fromDate, q.toDate, +q.page||1, +q.limit||50);
  }

  // ── Trial Balance ─────────────────────────────────────────────
  @Get('trial-balance')
  getTrialBalance(@Request() req: any, @Query() q: any) {
    return this.svc.getTrialBalance(req.user.tenantId, q.fromDate, q.toDate);
  }

  // ── Financial Reports ─────────────────────────────────────────
  @Get('profit-loss')
  getProfitLoss(@Request() req: any, @Query() q: any) {
    return this.svc.getProfitLoss(req.user.tenantId, q.fromDate, q.toDate);
  }
  @Get('balance-sheet')
  getBalanceSheet(@Request() req: any, @Query() q: any) {
    return this.svc.getBalanceSheet(req.user.tenantId, q.asOfDate);
  }
  @Get('cash-flow')
  getCashFlow(@Request() req: any, @Query() q: any) {
    return this.svc.getCashFlow(req.user.tenantId, q.fromDate, q.toDate);
  }
  @Get('ar-aging')
  getARaging(@Request() req: any, @Query() q: any) {
    return this.svc.getARaging(req.user.tenantId, q.asOfDate);
  }
  @Get('ap-aging')
  getAPAging(@Request() req: any, @Query() q: any) {
    return this.svc.getAPAging(req.user.tenantId, q.asOfDate);
  }
  @Get('vat-return')
  getVATReturn(@Request() req: any, @Query() q: any) {
    return this.svc.getVATReturn(req.user.tenantId, q.fromDate, q.toDate);
  }
  @Get('budget-vs-actual')
  getBudgetVsActual(@Request() req: any, @Query() q: any) {
    return this.svc.getBudgetVsActual(req.user.tenantId, q.fromDate, q.toDate);
  }
  @Get('daily-report')
  getDailyReport(@Request() req: any, @Query() q: any) {
    return this.svc.getDailyReport(req.user.tenantId, q.date);
  }
  @Get('bank-reconciliation')
  getBankReconciliation(@Request() req: any, @Query() q: any) {
    return this.svc.getBankReconciliation(req.user.tenantId, q.fromDate, q.toDate);
  }
  @Get('liquidation-projection')
  getLiquidationProjection(@Request() req: any, @Query() q: any) {
    return this.svc.getLiquidationProjection(req.user.tenantId, +q.currentCash||0, +q.salaries||0, +q.rent||0);
  }
  @Get('credit-risk')
  getCreditRiskStatement(@Request() req: any) {
    return this.svc.getCreditRiskStatement(req.user.tenantId);
  }

  // ── Warehouses ────────────────────────────────────────────────
  @Get('warehouses')
  getWarehouses(@Request() req: any, @Query() q: any) {
    return this.svc.getWarehouses(req.user.tenantId, q.search);
  }
  @Post('warehouses')
  createWarehouse(@Request() req: any, @Body() dto: any) {
    return this.svc.createWarehouse(req.user.tenantId, dto, req.user.userId);
  }
  @Put('warehouses/:id')
  updateWarehouse(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateWarehouse(req.user.tenantId, id, dto);
  }
  @Delete('warehouses/:id')
  deleteWarehouse(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteWarehouse(req.user.tenantId, id);
  }

  // ── Warehouse Locations ───────────────────────────────────────
  @Get('warehouse-locations')
  getLocations(@Request() req: any, @Query() q: any) {
    return this.svc.getLocations(req.user.tenantId, q.warehouseId);
  }
  @Post('warehouse-locations')
  createLocation(@Request() req: any, @Body() dto: any) {
    return this.svc.createLocation(req.user.tenantId, dto);
  }
  @Put('warehouse-locations/:id')
  updateLocation(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateLocation(req.user.tenantId, id, dto);
  }
  @Delete('warehouse-locations/:id')
  deleteLocation(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteLocation(req.user.tenantId, id);
  }

  // ── Stock Transfers ───────────────────────────────────────────
  @Get('stock-transfers')
  getStockTransfers(@Request() req: any, @Query() q: any) {
    return this.svc.getStockTransfers(req.user.tenantId, +q.page||1, +q.limit||20, q.search);
  }
  @Get('stock-transfers/:id')
  getStockTransfer(@Request() req: any, @Param('id') id: string) {
    return this.svc.getStockTransfer(req.user.tenantId, id);
  }
  @Post('stock-transfers')
  createStockTransfer(@Request() req: any, @Body() dto: any) {
    return this.svc.createStockTransfer(req.user.tenantId, dto, req.user.userId);
  }
  @Put('stock-transfers/:id')
  updateStockTransfer(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateStockTransfer(req.user.tenantId, id, dto);
  }
  @Post('stock-transfers/:id/confirm')
  confirmStockTransfer(@Request() req: any, @Param('id') id: string) {
    return this.svc.confirmStockTransfer(req.user.tenantId, id, req.user.userId);
  }
  @Delete('stock-transfers/:id')
  deleteStockTransfer(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteStockTransfer(req.user.tenantId, id);
  }

  // ── Stock Adjustments ─────────────────────────────────────────
  @Get('stock-adjustments')
  getStockAdjustments(@Request() req: any, @Query() q: any) {
    return this.svc.getStockAdjustments(req.user.tenantId, +q.page||1, +q.limit||20, q.search);
  }
  @Get('stock-adjustments/:id')
  getStockAdjustment(@Request() req: any, @Param('id') id: string) {
    return this.svc.getStockAdjustment(req.user.tenantId, id);
  }
  @Post('stock-adjustments')
  createStockAdjustment(@Request() req: any, @Body() dto: any) {
    return this.svc.createStockAdjustment(req.user.tenantId, dto, req.user.userId);
  }
  @Put('stock-adjustments/:id')
  updateStockAdjustment(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateStockAdjustment(req.user.tenantId, id, dto);
  }
  @Delete('stock-adjustments/:id')
  deleteStockAdjustment(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteStockAdjustment(req.user.tenantId, id);
  }

  @Get('po-asset-items')
  getPOAssetItems(@Request() req: any) {
    return this.svc.getPOAssetItems(req.user.tenantId);
  }

  // ── Consumables ──────────────────────────────────────────────
  @Get('consumables/stock')
  getConsumableStock(@Request() req: any) {
    return this.svc.getConsumableStock(req.user.tenantId);
  }
  @Get('consumables/stats')
  getConsumableStats(@Request() req: any) {
    return this.svc.getConsumableStats(req.user.tenantId);
  }
  @Get('consumables/transactions')
  getConsumableTransactions(@Request() req: any, @Query() q: any) {
    return this.svc.getConsumableTransactions(req.user.tenantId, q.productId);
  }
  @Post('consumables/issue')
  issueConsumable(@Request() req: any, @Body() dto: any) {
    return this.svc.issueConsumable(req.user.tenantId, dto, req.user.userId);
  }
  @Post('consumables/receive')
  receiveConsumable(@Request() req: any, @Body() dto: any) {
    return this.svc.receiveConsumable(req.user.tenantId, dto.productId, dto.quantity, dto.referenceNo, req.user.userId);
  }

  // ── Asset Brands ─────────────────────────────────────────────
  @Get('asset-brands')
  getBrands(@Request() req: any, @Query() q: any) {
    return this.svc.getBrands(req.user.tenantId, q.category);
  }
  @Post('asset-brands')
  createBrand(@Request() req: any, @Body() dto: any) {
    return this.svc.createBrand(req.user.tenantId, dto);
  }
  @Delete('asset-brands/:id')
  deleteBrand(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteBrand(req.user.tenantId, id);
  }
  @Post('assets/create-from-po/:poId')
  createDraftAssetsFromPO(@Request() req: any, @Param('poId') poId: string) {
    return this.svc.createDraftAssetsFromPO(req.user.tenantId, poId, req.user.userId);
  }

  // ── Fixed Assets ─────────────────────────────────────────────
  @Get('assets/stats')
  getAssetStats(@Request() req: any) {
    return this.svc.getAssetStats(req.user.tenantId);
  }
  @Get('assets')
  getAssets(@Request() req: any, @Query() q: any) {
    return this.svc.getAssets(req.user.tenantId, +q.page||1, +q.limit||20, q.search, q.status, q.category);
  }
  @Get('assets/:id')
  getAsset(@Request() req: any, @Param('id') id: string) {
    return this.svc.getAsset(req.user.tenantId, id);
  }
  @Post('assets')
  createAsset(@Request() req: any, @Body() dto: any) {
    return this.svc.createAsset(req.user.tenantId, dto, req.user.userId);
  }
  @Put('assets/:id')
  updateAsset(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateAsset(req.user.tenantId, id, dto);
  }
  @Delete('assets/:id')
  deleteAsset(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteAsset(req.user.tenantId, id);
  }
  @Post('assets/:id/depreciation')
  calculateDepreciation(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.calculateDepreciation(req.user.tenantId, id, +dto.year, +dto.month, req.user.userId);
  }
  @Post('assets/depreciation/bulk')
  runBulkDepreciation(@Request() req: any, @Body() dto: any) {
    return this.svc.runBulkDepreciation(req.user.tenantId, +dto.year, +dto.month, req.user.userId);
  }
  @Get('assets/:id/depreciation')
  getDepreciationSchedule(@Request() req: any, @Param('id') id: string) {
    return this.svc.getDepreciationSchedule(req.user.tenantId, id);
  }
  @Get('maintenance')
  getMaintenance(@Request() req: any, @Query() q: any) {
    return this.svc.getMaintenance(req.user.tenantId, q.assetId, q.status);
  }
  @Post('maintenance')
  createMaintenance(@Request() req: any, @Body() dto: any) {
    return this.svc.createMaintenance(req.user.tenantId, dto, req.user.userId);
  }
  @Put('maintenance/:id')
  updateMaintenance(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateMaintenance(req.user.tenantId, id, dto);
  }
  @Get('asset-transfers')
  getTransfers(@Request() req: any, @Query() q: any) {
    return this.svc.getTransfers(req.user.tenantId, q.assetId);
  }
  @Post('asset-transfers')
  createTransfer(@Request() req: any, @Body() dto: any) {
    return this.svc.createTransfer(req.user.tenantId, dto, req.user.userId);
  }
}
