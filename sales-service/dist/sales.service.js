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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_entities_1 = require("./sales.entities");
let SalesService = class SalesService {
    constructor(coaRepo, supplierRepo, poRepo, poItemRepo, grnRepo, grnItemRepo, purchaseInvoiceRepo, purchaseInvoiceItemRepo, voucherRepo, purchaseReturnRepo, purchaseReturnItemRepo, jvRepo, jvLineRepo, warehouseRepo, locationRepo, transferRepo, transferItemRepo, adjustmentRepo, fixedAssetRepo, assetDeprRepo, assetMaintRepo, assetTransferRepo, adjustmentItemRepo, productRepo, stockRepo, rateRepo, quotationRepo, quotationItemRepo, dnRepo, dnItemRepo, invoiceRepo, invoiceItemRepo, receiptRepo, returnRepo, returnItemRepo) {
        this.coaRepo = coaRepo;
        this.supplierRepo = supplierRepo;
        this.poRepo = poRepo;
        this.poItemRepo = poItemRepo;
        this.grnRepo = grnRepo;
        this.grnItemRepo = grnItemRepo;
        this.purchaseInvoiceRepo = purchaseInvoiceRepo;
        this.purchaseInvoiceItemRepo = purchaseInvoiceItemRepo;
        this.voucherRepo = voucherRepo;
        this.purchaseReturnRepo = purchaseReturnRepo;
        this.purchaseReturnItemRepo = purchaseReturnItemRepo;
        this.jvRepo = jvRepo;
        this.jvLineRepo = jvLineRepo;
        this.warehouseRepo = warehouseRepo;
        this.locationRepo = locationRepo;
        this.transferRepo = transferRepo;
        this.transferItemRepo = transferItemRepo;
        this.adjustmentRepo = adjustmentRepo;
        this.fixedAssetRepo = fixedAssetRepo;
        this.assetDeprRepo = assetDeprRepo;
        this.assetMaintRepo = assetMaintRepo;
        this.assetTransferRepo = assetTransferRepo;
        this.adjustmentItemRepo = adjustmentItemRepo;
        this.productRepo = productRepo;
        this.stockRepo = stockRepo;
        this.rateRepo = rateRepo;
        this.quotationRepo = quotationRepo;
        this.quotationItemRepo = quotationItemRepo;
        this.dnRepo = dnRepo;
        this.dnItemRepo = dnItemRepo;
        this.invoiceRepo = invoiceRepo;
        this.invoiceItemRepo = invoiceItemRepo;
        this.receiptRepo = receiptRepo;
        this.returnRepo = returnRepo;
        this.returnItemRepo = returnItemRepo;
    }
    async generateNumber(prefix, repo, field) {
        const year = new Date().getFullYear();
        const pattern = `${prefix}-${year}-%`;
        const result = await repo.createQueryBuilder('e')
            .select(`MAX(e.${field})`, 'maxNum')
            .where(`e.${field} LIKE :pattern`, { pattern })
            .getRawOne();
        const maxNum = result === null || result === void 0 ? void 0 : result.maxNum;
        let next = 1;
        if (maxNum) {
            const parts = maxNum.split('-');
            const last = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(last))
                next = last + 1;
        }
        return `${prefix}-${year}-${String(next).padStart(4, '0')}`;
    }
    async getProducts(tenantId, page = 1, limit = 20, search, category) {
        const qb = this.productRepo.createQueryBuilder('p')
            .where('p.tenantId = :tenantId', { tenantId })
            .andWhere('p.isActive = true');
        if (search)
            qb.andWhere('(p.productName ILIKE :s OR p.productCode ILIKE :s)', { s: `%${search}%` });
        if (category)
            qb.andWhere('p.category = :category', { category });
        qb.orderBy('p.productName', 'ASC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getProduct(tenantId, id) {
        const p = await this.productRepo.findOne({ where: { productId: id, tenantId } });
        if (!p)
            throw new common_1.NotFoundException('Product not found');
        return p;
    }
    async createProduct(tenantId, dto, userId) {
        const p = this.productRepo.create(Object.assign(Object.assign({}, dto), { tenantId, createdBy: userId }));
        return this.productRepo.save(p);
    }
    async updateProduct(tenantId, id, dto) {
        await this.productRepo.update({ productId: id, tenantId }, dto);
        return this.getProduct(tenantId, id);
    }
    async deleteProduct(tenantId, id) {
        await this.productRepo.update({ productId: id, tenantId }, { isActive: false });
        return { success: true };
    }
    async adjustStock(tenantId, productId, qty, type, ref, userId) {
        const product = await this.getProduct(tenantId, productId);
        const movement = this.stockRepo.create({
            tenantId, productId, movementType: type, quantity: qty,
            referenceNumber: ref, createdBy: userId,
        });
        await this.stockRepo.save(movement);
        const newQty = type === 'IN' || type === 'RETURN'
            ? Number(product.stockQty) + qty
            : Number(product.stockQty) - qty;
        await this.productRepo.update({ productId }, { stockQty: newQty });
        return movement;
    }
    async getStockMovements(tenantId, productId) {
        const where = { tenantId };
        if (productId)
            where.productId = productId;
        return this.stockRepo.find({ where, order: { createdAt: 'DESC' }, take: 100 });
    }
    async getExchangeRates(tenantId) {
        return this.rateRepo.find({ where: { tenantId, isActive: true }, order: { fromCurrency: 'ASC', effectiveDate: 'DESC' } });
    }
    async createExchangeRate(tenantId, dto, userId) {
        const r = this.rateRepo.create(Object.assign(Object.assign({}, dto), { tenantId, createdBy: userId }));
        return this.rateRepo.save(r);
    }
    async updateExchangeRate(tenantId, id, dto) {
        await this.rateRepo.update({ rateId: id, tenantId }, dto);
        return this.rateRepo.findOne({ where: { rateId: id } });
    }
    async deleteExchangeRate(tenantId, id) {
        await this.rateRepo.update({ rateId: id, tenantId }, { isActive: false });
        return { success: true };
    }
    async getQuotations(tenantId, page = 1, limit = 20, search, status, excludeConverted = false) {
        const qb = this.quotationRepo.createQueryBuilder('q')
            .where('q.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(q.customerName ILIKE :s OR q.quotationNumber ILIKE :s OR q.subject ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('q.status = :status', { status });
        if (excludeConverted)
            qb.andWhere("q.status NOT IN ('CONVERTED', 'CANCELLED')");
        qb.orderBy('q.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getQuotation(tenantId, id) {
        const q = await this.quotationRepo.findOne({ where: { quotationId: id, tenantId }, relations: ['items'] });
        if (!q)
            throw new common_1.NotFoundException('Quotation not found');
        return q;
    }
    async createQuotation(tenantId, dto, userId) {
        const number = await this.generateNumber('QUO', this.quotationRepo, 'quotationNumber');
        const { items, quotationNumber: _qn } = dto, header = __rest(dto, ["items", "quotationNumber"]);
        const q = this.quotationRepo.create(Object.assign(Object.assign({}, header), { tenantId, quotationNumber: number, createdBy: userId, status: header.status || 'DRAFT' }));
        const saved = await this.quotationRepo.save(q);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.quotationItemRepo.create(Object.assign(Object.assign({}, item), { quotationId: saved.quotationId, lineNumber: idx + 1 })));
            await this.quotationItemRepo.save(lineItems);
        }
        return this.getQuotation(tenantId, saved.quotationId);
    }
    async updateQuotation(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.quotationRepo.update({ quotationId: id, tenantId }, header);
        if (items) {
            await this.quotationItemRepo.delete({ quotationId: id });
            const lineItems = items.map((item, idx) => this.quotationItemRepo.create(Object.assign(Object.assign({}, item), { quotationId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.quotationItemRepo.save(lineItems);
        }
        return this.getQuotation(tenantId, id);
    }
    async deleteQuotation(tenantId, id) {
        await this.quotationRepo.delete({ quotationId: id, tenantId });
        return { success: true };
    }
    async getDeliveryNotes(tenantId, page = 1, limit = 20, search, status, excludeInvoiced = false) {
        const qb = this.dnRepo.createQueryBuilder('d')
            .where('d.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(d.customerName ILIKE :s OR d.dnNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('d.status = :status', { status });
        if (excludeInvoiced)
            qb.andWhere("d.status NOT IN ('INVOICED', 'CANCELLED', 'CONVERTED')");
        qb.orderBy('d.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getDeliveryNote(tenantId, id) {
        const d = await this.dnRepo.findOne({ where: { dnId: id, tenantId }, relations: ['items'] });
        if (!d)
            throw new common_1.NotFoundException('Delivery Note not found');
        return d;
    }
    async createDeliveryNote(tenantId, dto, userId) {
        const number = await this.generateNumber('DN', this.dnRepo, 'dnNumber');
        const { items, dnNumber: _dn, invoiceNumber: _in, quotationNumber: _qn } = dto, header = __rest(dto, ["items", "dnNumber", "invoiceNumber", "quotationNumber"]);
        const d = this.dnRepo.create(Object.assign(Object.assign({}, header), { tenantId, dnNumber: number, createdBy: userId }));
        const saved = await this.dnRepo.save(d);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.dnItemRepo.create(Object.assign(Object.assign({}, item), { dnId: saved.dnId, lineNumber: idx + 1 })));
            await this.dnItemRepo.save(lineItems);
            if (dto.isInventory) {
                for (const item of items) {
                    if (item.productId) {
                        await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'OUT', number, userId);
                    }
                }
            }
        }
        if (header.quotationId)
            await this.quotationRepo.update({ quotationId: header.quotationId, tenantId }, { status: 'CONVERTED' });
        return this.getDeliveryNote(tenantId, saved.dnId);
    }
    async updateDeliveryNote(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.dnRepo.update({ dnId: id, tenantId }, header);
        if (items) {
            await this.dnItemRepo.delete({ dnId: id });
            const lineItems = items.map((item, idx) => this.dnItemRepo.create(Object.assign(Object.assign({}, item), { dnId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.dnItemRepo.save(lineItems);
        }
        return this.getDeliveryNote(tenantId, id);
    }
    async deleteDeliveryNote(tenantId, id) {
        await this.dnRepo.delete({ dnId: id, tenantId });
        return { success: true };
    }
    async convertQuotationToDN(tenantId, quotationId, userId) {
        const q = await this.getQuotation(tenantId, quotationId);
        const dto = {
            quotationId: q.quotationId,
            customerName: q.customerName,
            customerAddress: q.customerAddress,
            accountId: q.accountId,
            contactId: q.contactId,
            currencyCode: q.currencyCode,
            exchangeRate: q.exchangeRate,
            isInventory: q.isInventory,
            subtotal: q.subtotal,
            discountAmount: q.discountAmount,
            vatRate: q.vatRate,
            vatAmount: q.vatAmount,
            totalAmount: q.totalAmount,
            items: q.items.map(i => ({
                productId: i.productId,
                itemCode: i.itemCode,
                description: i.description,
                unitOfMeasure: i.unitOfMeasure,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                discountPct: i.discountPct,
                discountAmount: i.discountAmount,
                lineTotal: i.lineTotal,
                isTaxable: i.isTaxable,
                revenueAccount: i.revenueAccount,
            })),
        };
        const dn = await this.createDeliveryNote(tenantId, dto, userId);
        await this.quotationRepo.update({ quotationId, tenantId }, { status: 'CONVERTED' });
        return dn;
    }
    async getInvoices(tenantId, page = 1, limit = 20, search, status, excludePaid = false) {
        const qb = this.invoiceRepo.createQueryBuilder('i')
            .where('i.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(i.customerName ILIKE :s OR i.invoiceNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('i.status = :status', { status });
        if (excludePaid)
            qb.andWhere("i.status NOT IN ('PAID', 'CANCELLED')");
        qb.orderBy('i.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getInvoice(tenantId, id) {
        const i = await this.invoiceRepo.findOne({ where: { invoiceId: id, tenantId }, relations: ['items'] });
        if (!i)
            throw new common_1.NotFoundException('Invoice not found');
        return i;
    }
    async createInvoice(tenantId, dto, userId) {
        const number = await this.generateNumber('INV', this.invoiceRepo, 'invoiceNumber');
        const { items, invoiceNumber: _in, dnNumber: _dn, quotationNumber: _qn, receiptNumber: _rn } = dto, header = __rest(dto, ["items", "invoiceNumber", "dnNumber", "quotationNumber", "receiptNumber"]);
        const balanceDue = Number(header.totalAmount) || 0;
        const i = this.invoiceRepo.create(Object.assign(Object.assign({}, header), { tenantId, invoiceNumber: number, createdBy: userId, balanceDue, paidAmount: 0, status: header.status || 'DRAFT' }));
        const saved = await this.invoiceRepo.save(i);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.invoiceItemRepo.create(Object.assign(Object.assign({}, item), { invoiceId: saved.invoiceId, lineNumber: idx + 1 })));
            await this.invoiceItemRepo.save(lineItems);
        }
        if (header.dnId)
            await this.dnRepo.update({ dnId: header.dnId, tenantId }, { status: 'INVOICED' });
        if (header.quotationId)
            await this.quotationRepo.update({ quotationId: header.quotationId, tenantId }, { status: 'CONVERTED' });
        const invDate = (header.invoiceDate || new Date().toISOString()).slice(0, 10);
        const vatAmt = Number(header.vatAmount || 0);
        const netAmt = Number(header.subtotal || 0);
        const totalAmt = Number(header.totalAmount || 0);
        await this.createAutoJournalEntry(tenantId, userId, {
            voucherNumber: number, description: `Sales Invoice ${number} - ${header.customerName}`,
            voucherDate: invDate, lines: [
                { accountCode: '1130', description: `AR - ${header.customerName}`, debitAmount: totalAmt, creditAmount: 0 },
                { accountCode: '4100', description: `Sales - ${number}`, debitAmount: 0, creditAmount: netAmt },
                ...(vatAmt > 0 ? [{ accountCode: '2121', description: `VAT Output - ${number}`, debitAmount: 0, creditAmount: vatAmt }] : []),
            ],
        });
        return this.getInvoice(tenantId, saved.invoiceId);
    }
    async updateInvoice(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.invoiceRepo.update({ invoiceId: id, tenantId }, header);
        if (items) {
            await this.invoiceItemRepo.delete({ invoiceId: id });
            const lineItems = items.map((item, idx) => this.invoiceItemRepo.create(Object.assign(Object.assign({}, item), { invoiceId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.invoiceItemRepo.save(lineItems);
        }
        return this.getInvoice(tenantId, id);
    }
    async deleteInvoice(tenantId, id) {
        await this.invoiceRepo.delete({ invoiceId: id, tenantId });
        return { success: true };
    }
    async convertDNToInvoice(tenantId, dnId, userId) {
        const d = await this.getDeliveryNote(tenantId, dnId);
        const dto = {
            dnId: d.dnId,
            customerName: d.customerName,
            customerAddress: d.customerAddress,
            accountId: d.accountId,
            contactId: d.contactId,
            currencyCode: d.currencyCode,
            exchangeRate: d.exchangeRate,
            isInventory: d.isInventory,
            subtotal: d.subtotal,
            discountAmount: d.discountAmount,
            vatRate: d.vatRate,
            vatAmount: d.vatAmount,
            totalAmount: d.totalAmount,
            items: d.items.map(i => ({
                productId: i.productId,
                itemCode: i.itemCode,
                description: i.description,
                unitOfMeasure: i.unitOfMeasure,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                discountPct: i.discountPct,
                discountAmount: i.discountAmount,
                lineTotal: i.lineTotal,
                isTaxable: i.isTaxable,
                revenueAccount: i.revenueAccount,
            })),
        };
        const inv = await this.createInvoice(tenantId, dto, userId);
        await this.dnRepo.update({ dnId, tenantId }, { status: 'INVOICED' });
        return inv;
    }
    async getReceipts(tenantId, page = 1, limit = 20, search) {
        const qb = this.receiptRepo.createQueryBuilder('r')
            .where('r.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(r.customerName ILIKE :s OR r.receiptNumber ILIKE :s)', { s: `%${search}%` });
        qb.orderBy('r.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async createReceipt(tenantId, dto, userId) {
        const number = await this.generateNumber('RCT', this.receiptRepo, 'receiptNumber');
        const { invoiceIds, receiptNumber: _rn } = dto, receiptData = __rest(dto, ["invoiceIds", "receiptNumber"]);
        const r = this.receiptRepo.create(Object.assign(Object.assign({}, receiptData), { tenantId, receiptNumber: number, createdBy: userId }));
        const saved = await this.receiptRepo.save(r);
        const invoiceIdList = (invoiceIds === null || invoiceIds === void 0 ? void 0 : invoiceIds.length) ? invoiceIds : (dto.invoiceId ? [dto.invoiceId] : []);
        if (invoiceIdList.length > 0) {
            const totalAmount = Number(dto.amount) || 0;
            const perInvoice = invoiceIdList.length > 1 ? null : totalAmount;
            for (const invoiceId of invoiceIdList) {
                const invoice = await this.invoiceRepo.findOne({ where: { invoiceId, tenantId } });
                if (invoice) {
                    const payment = perInvoice !== null && perInvoice !== void 0 ? perInvoice : Math.min(Number(invoice.balanceDue), totalAmount);
                    const newPaid = Number(invoice.paidAmount) + payment;
                    const newBalance = Number(invoice.totalAmount) - newPaid;
                    const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
                    await this.invoiceRepo.update({ invoiceId }, {
                        paidAmount: newPaid, balanceDue: newBalance, status: newStatus,
                    });
                }
            }
        }
        const rcptDate = (dto.receiptDate || new Date().toISOString()).slice(0, 10);
        const rcptCustomer = dto.customerName || "Customer";
        await this.createAutoJournalEntry(tenantId, userId, {
            voucherNumber: number, description: `Customer Receipt ${number} - ${rcptCustomer}`,
            voucherDate: rcptDate, lines: [
                { accountCode: "1120", description: `Cash/Bank - Receipt from ${rcptCustomer}`, debitAmount: Number(dto.amount || 0), creditAmount: 0 },
                { accountCode: "1130", description: `AR - ${rcptCustomer}`, debitAmount: 0, creditAmount: Number(dto.amount || 0) },
            ],
        });
        return saved;
    }
    async deleteReceipt(tenantId, id) {
        await this.receiptRepo.delete({ receiptId: id, tenantId });
        return { success: true };
    }
    async getReturns(tenantId, page = 1, limit = 20) {
        const qb = this.returnRepo.createQueryBuilder('r')
            .where('r.tenantId = :tenantId', { tenantId });
        qb.orderBy('r.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getReturn(tenantId, id) {
        const r = await this.returnRepo.findOne({ where: { returnId: id, tenantId }, relations: ['items'] });
        if (!r)
            throw new common_1.NotFoundException('Return not found');
        return r;
    }
    async createReturn(tenantId, dto, userId) {
        const number = await this.generateNumber('RTN', this.returnRepo, 'returnNumber');
        const { items, returnNumber: _rn } = dto, header = __rest(dto, ["items", "returnNumber"]);
        const r = this.returnRepo.create(Object.assign(Object.assign({}, header), { tenantId, returnNumber: number, createdBy: userId }));
        const saved = await this.returnRepo.save(r);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.returnItemRepo.create(Object.assign(Object.assign({}, item), { returnId: saved.returnId, lineNumber: idx + 1 })));
            await this.returnItemRepo.save(lineItems);
            if (dto.isInventory) {
                for (const item of items) {
                    if (item.productId) {
                        await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'SALES_RETURN', number, userId);
                    }
                }
            }
            if (dto.invoiceId) {
                const invoice = await this.invoiceRepo.findOne({ where: { invoiceId: dto.invoiceId } });
                if (invoice) {
                    const returnAmount = Number(dto.totalAmount || 0);
                    const currentBalance = Number(invoice.balanceDue);
                    const currentPaid = Number(invoice.paidAmount);
                    if (currentBalance > 0) {
                        const newBalance = Math.max(0, currentBalance - returnAmount);
                        const newPaid = currentPaid + (currentBalance - newBalance);
                        const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
                        await this.invoiceRepo.update({ invoiceId: dto.invoiceId }, {
                            balanceDue: newBalance, paidAmount: newPaid, status: newStatus,
                        });
                    }
                    else {
                        const creditAmount = returnAmount;
                        await this.invoiceRepo.update({ invoiceId: dto.invoiceId }, {
                            balanceDue: -creditAmount, status: 'CREDIT_BALANCE',
                        });
                    }
                }
            }
        }
        const srDate = (dto.returnDate || new Date().toISOString()).slice(0, 10);
        const srTotal = Number(dto.totalAmount || 0);
        if (srTotal > 0) {
            const srLines = [
                { accountCode: "4010", description: `Sales Return ${number} - ${dto.customerName || "Customer"}`, debitAmount: srTotal, creditAmount: 0 },
                { accountCode: "1130", description: `AR - ${dto.customerName || "Customer"}`, debitAmount: 0, creditAmount: srTotal },
            ];
            if (dto.isInventory) {
                const inventoryValue = Number(dto.subtotal || srTotal);
                srLines.push({ accountCode: "1140", description: `Inventory Return - ${number}`, debitAmount: inventoryValue, creditAmount: 0 });
                srLines.push({ accountCode: "5001", description: `COGS Reversal - ${number}`, debitAmount: 0, creditAmount: inventoryValue });
            }
            await this.createAutoJournalEntry(tenantId, userId, {
                voucherNumber: number, description: `Sales Return ${number} - ${dto.customerName || "Customer"}`,
                voucherDate: srDate, lines: srLines,
            });
        }
        return this.getReturn(tenantId, saved.returnId);
    }
    async updateReturn(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.returnRepo.update({ returnId: id, tenantId }, header);
        if (items) {
            await this.returnItemRepo.delete({ returnId: id });
            const lineItems = items.map((item, idx) => this.returnItemRepo.create(Object.assign(Object.assign({}, item), { returnId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.returnItemRepo.save(lineItems);
        }
        return this.getReturn(tenantId, id);
    }
    async deleteReturn(tenantId, id) {
        await this.returnRepo.delete({ returnId: id, tenantId });
        return { success: true };
    }
    async getAccounts(tenantId, type, search) {
        const qb = this.coaRepo.createQueryBuilder('a')
            .where('a.tenantId = :tenantId', { tenantId })
            .andWhere('a.isActive = true');
        if (type)
            qb.andWhere('a.accountType = :type', { type });
        if (search)
            qb.andWhere('(a.accountName ILIKE :s OR a.accountCode ILIKE :s)', { s: `%${search}%` });
        qb.orderBy('a.accountCode', 'ASC');
        return qb.getMany();
    }
    async createAccount(tenantId, dto) {
        const a = this.coaRepo.create(Object.assign(Object.assign({}, dto), { tenantId }));
        return this.coaRepo.save(a);
    }
    async updateAccount(tenantId, id, dto) {
        await this.coaRepo.update({ accountId: id, tenantId }, dto);
        return this.coaRepo.findOne({ where: { accountId: id } });
    }
    async deleteAccount(tenantId, id) {
        const acc = await this.coaRepo.findOne({ where: { accountId: id, tenantId } });
        if (acc === null || acc === void 0 ? void 0 : acc.isSystem)
            throw new Error('Cannot delete system accounts');
        await this.coaRepo.update({ accountId: id, tenantId }, { isActive: false });
        return { success: true };
    }
    async getDashboard(tenantId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [totalQuotations, totalInvoices, totalReceipts, totalReturns, totalPurchaseOrders, totalGRNs, totalPurchaseInvoices, totalSuppliers, lowStockProducts,] = await Promise.all([
            this.quotationRepo.count({ where: { tenantId } }),
            this.invoiceRepo.count({ where: { tenantId } }),
            this.receiptRepo.count({ where: { tenantId } }),
            this.returnRepo.count({ where: { tenantId } }),
            this.poRepo.count({ where: { tenantId } }),
            this.grnRepo.count({ where: { tenantId } }),
            this.purchaseInvoiceRepo.count({ where: { tenantId } }),
            this.supplierRepo.count({ where: { tenantId } }),
            this.productRepo.createQueryBuilder('p')
                .where('p.tenantId = :tenantId', { tenantId })
                .andWhere('p.trackStock = true')
                .andWhere('p.stockQty <= p.minStockQty')
                .getCount(),
        ]);
        const revenueThisMonth = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.totalAmount)', 'total')
            .where('i.tenantId = :tid AND i.createdAt >= :start', { tid: tenantId, start: startOfMonth })
            .getRawOne();
        const revenueLastMonth = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.totalAmount)', 'total')
            .where('i.tenantId = :tid AND i.createdAt >= :start AND i.createdAt <= :end', { tid: tenantId, start: startOfLastMonth, end: endOfLastMonth })
            .getRawOne();
        const totalRevenueResult = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.totalAmount)', 'total')
            .where('i.tenantId = :tid', { tid: tenantId })
            .getRawOne();
        const outstandingResult = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.balanceDue)', 'total')
            .where('i.tenantId = :tid AND i.status NOT IN (:...paid)', { tid: tenantId, paid: ['PAID', 'CANCELLED'] })
            .getRawOne();
        const invoicesByStatus = await this.invoiceRepo.createQueryBuilder('i')
            .select('i.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(i.totalAmount)', 'value')
            .where('i.tenantId = :tid', { tid: tenantId })
            .groupBy('i.status').getRawMany();
        const quotationsByStatus = await this.quotationRepo.createQueryBuilder('q')
            .select('q.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(q.totalAmount)', 'value')
            .where('q.tenantId = :tid', { tid: tenantId })
            .groupBy('q.status').getRawMany();
        const posByStatus = await this.poRepo.createQueryBuilder('p')
            .select('p.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(p.totalAmount)', 'value')
            .where('p.tenantId = :tid', { tid: tenantId })
            .groupBy('p.status').getRawMany();
        const grnsByStatus = await this.grnRepo.createQueryBuilder('g')
            .select('g.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(g.totalAmount)', 'value')
            .where('g.tenantId = :tid', { tid: tenantId })
            .groupBy('g.status').getRawMany();
        const purchaseInvoicesByStatus = await this.purchaseInvoiceRepo.createQueryBuilder('i')
            .select('i.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(i.totalAmount)', 'value')
            .where('i.tenantId = :tid', { tid: tenantId })
            .groupBy('i.status').getRawMany();
        const pendingQuotations = await this.quotationRepo.count({ where: { tenantId, status: 'DRAFT' } });
        const pendingInvoices = await this.invoiceRepo.count({ where: { tenantId, status: 'DRAFT' } });
        const pendingGRNs = await this.grnRepo.count({ where: { tenantId, status: 'DRAFT' } });
        const totalPurchasesResult = await this.purchaseInvoiceRepo.createQueryBuilder('i')
            .select('SUM(i.totalAmount)', 'total').where('i.tenantId = :tid', { tid: tenantId }).getRawOne();
        const outstandingPayablesResult = await this.purchaseInvoiceRepo.createQueryBuilder('i')
            .select('SUM(i.balanceDue)', 'total')
            .where('i.tenantId = :tid AND i.status NOT IN (:...paid)', { tid: tenantId, paid: ['PAID', 'CANCELLED'] })
            .getRawOne();
        return {
            totalQuotations, totalInvoices, totalReceipts, totalReturns,
            totalPurchaseOrders, totalGRNs, totalPurchaseInvoices, totalSuppliers, lowStockProducts,
            revenueThisMonth: (revenueThisMonth === null || revenueThisMonth === void 0 ? void 0 : revenueThisMonth.total) || 0,
            revenueLastMonth: (revenueLastMonth === null || revenueLastMonth === void 0 ? void 0 : revenueLastMonth.total) || 0,
            totalRevenue: (totalRevenueResult === null || totalRevenueResult === void 0 ? void 0 : totalRevenueResult.total) || 0,
            outstandingReceivables: (outstandingResult === null || outstandingResult === void 0 ? void 0 : outstandingResult.total) || 0,
            totalPurchases: (totalPurchasesResult === null || totalPurchasesResult === void 0 ? void 0 : totalPurchasesResult.total) || 0,
            outstandingPayables: (outstandingPayablesResult === null || outstandingPayablesResult === void 0 ? void 0 : outstandingPayablesResult.total) || 0,
            invoicesByStatus, quotationsByStatus, posByStatus, grnsByStatus, purchaseInvoicesByStatus,
            pendingQuotations, pendingInvoices, pendingGRNs,
        };
    }
    async getSuppliers(tenantId, page = 1, limit = 20, search) {
        const qb = this.supplierRepo.createQueryBuilder('s')
            .where('s.tenantId = :tenantId', { tenantId })
            .andWhere('s.isActive = true');
        if (search)
            qb.andWhere('(s.supplierName ILIKE :s OR s.supplierCode ILIKE :s)', { s: `%${search}%` });
        qb.orderBy('s.supplierName', 'ASC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getSupplier(tenantId, id) {
        const s = await this.supplierRepo.findOne({ where: { supplierId: id, tenantId } });
        if (!s)
            throw new common_1.NotFoundException('Supplier not found');
        return s;
    }
    async createSupplier(tenantId, dto, userId) {
        const s = this.supplierRepo.create(Object.assign(Object.assign({}, dto), { tenantId, createdBy: userId }));
        return this.supplierRepo.save(s);
    }
    async updateSupplier(tenantId, id, dto) {
        await this.supplierRepo.update({ supplierId: id, tenantId }, dto);
        return this.getSupplier(tenantId, id);
    }
    async deleteSupplier(tenantId, id) {
        await this.supplierRepo.update({ supplierId: id, tenantId }, { isActive: false });
        return { success: true };
    }
    async getPurchaseOrders(tenantId, page = 1, limit = 20, search, status, excludeReceived = false) {
        const qb = this.poRepo.createQueryBuilder('p').where('p.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(p.supplierName ILIKE :s OR p.poNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('p.status = :status', { status });
        if (excludeReceived)
            qb.andWhere("p.status NOT IN ('RECEIVED', 'CANCELLED')");
        qb.orderBy('p.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getPurchaseOrder(tenantId, id) {
        const p = await this.poRepo.findOne({ where: { poId: id, tenantId }, relations: ['items'] });
        if (!p)
            throw new common_1.NotFoundException('Purchase Order not found');
        return p;
    }
    async createPurchaseOrder(tenantId, dto, userId) {
        const number = await this.generateNumber('PO', this.poRepo, 'poNumber');
        const { items, poNumber: _pn, grnNumber: _gn, invoiceNumber: _in } = dto, header = __rest(dto, ["items", "poNumber", "grnNumber", "invoiceNumber"]);
        const p = this.poRepo.create(Object.assign(Object.assign({}, header), { tenantId, poNumber: number, createdBy: userId }));
        const saved = await this.poRepo.save(p);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.poItemRepo.create(Object.assign(Object.assign({}, item), { poId: saved.poId, lineNumber: idx + 1 })));
            await this.poItemRepo.save(lineItems);
        }
        return this.getPurchaseOrder(tenantId, saved.poId);
    }
    async updatePurchaseOrder(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.poRepo.update({ poId: id, tenantId }, header);
        if (items) {
            await this.poItemRepo.delete({ poId: id });
            const lineItems = items.map((item, idx) => this.poItemRepo.create(Object.assign(Object.assign({}, item), { poId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.poItemRepo.save(lineItems);
        }
        return this.getPurchaseOrder(tenantId, id);
    }
    async deletePurchaseOrder(tenantId, id) {
        await this.poRepo.delete({ poId: id, tenantId });
        return { success: true };
    }
    async getGRNs(tenantId, page = 1, limit = 20, search, status, excludeInvoiced = false) {
        const qb = this.grnRepo.createQueryBuilder('g').where('g.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(g.supplierName ILIKE :s OR g.grnNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('g.status = :status', { status });
        if (excludeInvoiced)
            qb.andWhere("g.status NOT IN ('INVOICED', 'CANCELLED')");
        qb.orderBy('g.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getGRN(tenantId, id) {
        const g = await this.grnRepo.findOne({ where: { grnId: id, tenantId }, relations: ['items'] });
        if (!g)
            throw new common_1.NotFoundException('GRN not found');
        return g;
    }
    async createGRN(tenantId, dto, userId) {
        var _a, _b;
        const number = await this.generateNumber('GRN', this.grnRepo, 'grnNumber');
        const { items, grnNumber: _gn, invoiceNumber: _in, poNumber: _pn } = dto, header = __rest(dto, ["items", "grnNumber", "invoiceNumber", "poNumber"]);
        const g = this.grnRepo.create(Object.assign(Object.assign({}, header), { tenantId, grnNumber: number, createdBy: userId }));
        const saved = await this.grnRepo.save(g);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.grnItemRepo.create(Object.assign(Object.assign({}, item), { grnId: saved.grnId, lineNumber: idx + 1 })));
            await this.grnItemRepo.save(lineItems);
            for (const item of items) {
                if (!item.productId)
                    continue;
                const productResult = await this.invoiceRepo.query(`SELECT product_type, product_name, product_code, unit_of_measure FROM products WHERE product_id=$1`, [item.productId]);
                const productType = ((_a = productResult[0]) === null || _a === void 0 ? void 0 : _a.product_type) || 'STOCK';
                if (productType === 'STOCK' && dto.isInventory) {
                    await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'IN', number, userId);
                }
                else if (productType === 'CONSUMABLE') {
                    await this.receiveConsumable(tenantId, item.productId, Number(item.quantity), number, userId);
                }
                else if (productType === 'FIXED_ASSET' || item.isFixedAsset) {
                    const qty = Math.ceil(Number(item.quantity || 1));
                    for (let i = 0; i < qty; i++) {
                        const count = await this.fixedAssetRepo.count({ where: { tenantId } });
                        const assetCode = `AST-${String(count + i + 1).padStart(4, '0')}`;
                        const asset = this.fixedAssetRepo.create({
                            tenantId, assetCode,
                            assetName: item.description || ((_b = productResult[0]) === null || _b === void 0 ? void 0 : _b.product_name),
                            category: item.assetCategory || 'Other',
                            brand: item.brand || undefined,
                            model: item.model || undefined,
                            serialNumber: qty > 1 ? undefined : item.serialNumber,
                            supplierName: saved.supplierName,
                            purchaseDate: saved.grnDate || new Date().toISOString().slice(0, 10),
                            purchaseCost: Number(item.unitPrice || 0),
                            currentBookValue: Number(item.unitPrice || 0),
                            usefulLifeYears: 5,
                            depreciationMethod: 'STRAIGHT_LINE',
                            status: 'ACTIVE',
                            invoiceNumber: number,
                            createdBy: userId,
                        });
                        await this.fixedAssetRepo.save(asset);
                    }
                    if (item.poItemId) {
                        await this.invoiceRepo.query(`UPDATE purchase_order_items SET assets_created = COALESCE(assets_created,0) + $1 WHERE item_id = $2`, [qty, item.poItemId]);
                    }
                }
            }
        }
        if (header.poId)
            await this.poRepo.update({ poId: header.poId, tenantId }, { status: 'RECEIVED' });
        const grnDate = (header.grnDate || new Date().toISOString()).slice(0, 10);
        const grnTotal = Number(header.totalAmount || 0);
        if (grnTotal > 0) {
            await this.createAutoJournalEntry(tenantId, userId, {
                voucherNumber: number, description: `GRN ${number} - ${header.supplierName}`,
                voucherDate: grnDate, lines: [
                    { accountCode: '1140', description: `Inventory - ${header.supplierName}`, debitAmount: grnTotal, creditAmount: 0 },
                    { accountCode: '1141', description: `GRNI - ${number}`, debitAmount: 0, creditAmount: grnTotal },
                ],
            });
        }
        return this.getGRN(tenantId, saved.grnId);
    }
    async updateGRN(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.grnRepo.update({ grnId: id, tenantId }, header);
        if (items) {
            await this.grnItemRepo.delete({ grnId: id });
            const lineItems = items.map((item, idx) => this.grnItemRepo.create(Object.assign(Object.assign({}, item), { grnId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.grnItemRepo.save(lineItems);
        }
        return this.getGRN(tenantId, id);
    }
    async deleteGRN(tenantId, id) {
        await this.grnRepo.delete({ grnId: id, tenantId });
        return { success: true };
    }
    async convertGRNToInvoice(tenantId, grnId, userId) {
        const g = await this.getGRN(tenantId, grnId);
        const number = await this.generateNumber('PINV', this.purchaseInvoiceRepo, 'invoiceNumber');
        const _a = g, { items: grnItems } = _a, grnHeader = __rest(_a, ["items"]);
        const inv = this.purchaseInvoiceRepo.create(Object.assign(Object.assign({}, grnHeader), { tenantId, invoiceNumber: number, createdBy: userId, balanceDue: grnHeader.totalAmount, grnId: g.grnId }));
        const saved = await this.purchaseInvoiceRepo.save(inv);
        if (grnItems === null || grnItems === void 0 ? void 0 : grnItems.length) {
            const lineItems = grnItems.map((item, idx) => this.purchaseInvoiceItemRepo.create(Object.assign(Object.assign({}, item), { invoiceId: saved.invoiceId, lineNumber: idx + 1 })));
            await this.purchaseInvoiceItemRepo.save(lineItems);
        }
        await this.grnRepo.update({ grnId, tenantId }, { status: 'INVOICED' });
        return this.getPurchaseInvoice(tenantId, saved.invoiceId);
    }
    async getPurchaseInvoices(tenantId, page = 1, limit = 20, search, status, excludePaid = false) {
        const qb = this.purchaseInvoiceRepo.createQueryBuilder('i').where('i.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(i.supplierName ILIKE :s OR i.invoiceNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('i.status = :status', { status });
        if (excludePaid)
            qb.andWhere("i.status NOT IN ('PAID', 'CANCELLED')");
        qb.orderBy('i.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getPurchaseInvoice(tenantId, id) {
        const i = await this.purchaseInvoiceRepo.findOne({ where: { invoiceId: id, tenantId }, relations: ['items'] });
        if (!i)
            throw new common_1.NotFoundException('Purchase Invoice not found');
        return i;
    }
    async createPurchaseInvoice(tenantId, dto, userId) {
        const number = await this.generateNumber('PINV', this.purchaseInvoiceRepo, 'invoiceNumber');
        const { items, invoiceNumber: _ignoreNum, grnNumber: _ignoreGrn, poNumber: _ignorePo } = dto, header = __rest(dto, ["items", "invoiceNumber", "grnNumber", "poNumber"]);
        const i = this.purchaseInvoiceRepo.create(Object.assign(Object.assign({}, header), { tenantId, invoiceNumber: number, createdBy: userId, balanceDue: header.totalAmount }));
        const saved = await this.purchaseInvoiceRepo.save(i);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.purchaseInvoiceItemRepo.create(Object.assign(Object.assign({}, item), { invoiceId: saved.invoiceId, lineNumber: idx + 1 })));
            await this.purchaseInvoiceItemRepo.save(lineItems);
        }
        if (header.grnId) {
            await this.grnRepo.update({ grnId: header.grnId, tenantId }, { status: 'INVOICED' });
        }
        if (header.poId) {
            await this.poRepo.update({ poId: header.poId, tenantId }, { status: 'RECEIVED' });
        }
        const pinvDate = (header.invoiceDate || new Date().toISOString()).slice(0, 10);
        const pvatAmt = Number(header.vatAmount || 0);
        const pnetAmt = Number(header.subtotal || 0);
        const ptotalAmt = Number(header.totalAmount || 0);
        await this.createAutoJournalEntry(tenantId, userId, {
            voucherNumber: number, description: `Purchase Invoice ${number} - ${header.supplierName}`,
            voucherDate: pinvDate, lines: [
                { accountCode: '1141', description: `GRNI - ${header.supplierName}`, debitAmount: pnetAmt, creditAmount: 0 },
                ...(pvatAmt > 0 ? [{ accountCode: '1160', description: `VAT Input - ${number}`, debitAmount: pvatAmt, creditAmount: 0 }] : []),
                { accountCode: '2110', description: `AP - ${header.supplierName}`, debitAmount: 0, creditAmount: ptotalAmt },
            ],
        });
        return this.getPurchaseInvoice(tenantId, saved.invoiceId);
    }
    async updatePurchaseInvoice(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.purchaseInvoiceRepo.update({ invoiceId: id, tenantId }, header);
        if (items) {
            await this.purchaseInvoiceItemRepo.delete({ invoiceId: id });
            const lineItems = items.map((item, idx) => this.purchaseInvoiceItemRepo.create(Object.assign(Object.assign({}, item), { invoiceId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.purchaseInvoiceItemRepo.save(lineItems);
        }
        return this.getPurchaseInvoice(tenantId, id);
    }
    async deletePurchaseInvoice(tenantId, id) {
        await this.purchaseInvoiceRepo.delete({ invoiceId: id, tenantId });
        return { success: true };
    }
    async getPaymentVouchers(tenantId, page = 1, limit = 20, search) {
        const qb = this.voucherRepo.createQueryBuilder('v').where('v.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(v.supplierName ILIKE :s OR v.voucherNumber ILIKE :s)', { s: `%${search}%` });
        qb.orderBy('v.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async createPaymentVoucher(tenantId, dto, userId) {
        const number = await this.generateNumber('PV', this.voucherRepo, 'voucherNumber');
        const v = this.voucherRepo.create(Object.assign(Object.assign({}, dto), { tenantId, voucherNumber: number, createdBy: userId }));
        const saved = await this.voucherRepo.save(v);
        if (dto.invoiceId) {
            const invoice = await this.purchaseInvoiceRepo.findOne({ where: { invoiceId: dto.invoiceId } });
            if (invoice) {
                const newPaid = Number(invoice.paidAmount) + Number(dto.amount);
                const newBalance = Number(invoice.totalAmount) - newPaid;
                const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
                await this.purchaseInvoiceRepo.update({ invoiceId: dto.invoiceId }, { paidAmount: newPaid, balanceDue: newBalance, status: newStatus });
            }
        }
        const pvDate = (dto.voucherDate || new Date().toISOString()).slice(0, 10);
        await this.createAutoJournalEntry(tenantId, userId, {
            voucherNumber: number, description: `Payment ${number} - ${dto.supplierName}`,
            voucherDate: pvDate, lines: [
                { accountCode: '2110', description: `AP - ${dto.supplierName}`, debitAmount: Number(dto.amount || 0), creditAmount: 0 },
                { accountCode: '1120', description: `Payment to ${dto.supplierName}`, debitAmount: 0, creditAmount: Number(dto.amount || 0) },
            ],
        });
        return saved;
    }
    async getPaymentVoucher(tenantId, id) {
        const v = await this.voucherRepo.findOne({ where: { voucherId: id, tenantId } });
        if (!v)
            throw new common_1.NotFoundException('Payment Voucher not found');
        return v;
    }
    async updatePaymentVoucher(tenantId, id, dto) {
        const { voucherNumber: _vn } = dto, data = __rest(dto, ["voucherNumber"]);
        await this.voucherRepo.update({ voucherId: id, tenantId }, data);
        return this.getPaymentVoucher(tenantId, id);
    }
    async deletePaymentVoucher(tenantId, id) {
        await this.voucherRepo.delete({ voucherId: id, tenantId });
        return { success: true };
    }
    async getPurchaseReturns(tenantId, page = 1, limit = 20) {
        const qb = this.purchaseReturnRepo.createQueryBuilder('r').where('r.tenantId = :tenantId', { tenantId });
        qb.orderBy('r.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getPurchaseReturn(tenantId, id) {
        const r = await this.purchaseReturnRepo.findOne({ where: { returnId: id, tenantId }, relations: ['items'] });
        if (!r)
            throw new common_1.NotFoundException('Purchase Return not found');
        return r;
    }
    async createPurchaseReturn(tenantId, dto, userId) {
        const number = await this.generateNumber('PRN', this.purchaseReturnRepo, 'returnNumber');
        const { items, returnNumber: _rn } = dto, header = __rest(dto, ["items", "returnNumber"]);
        const r = this.purchaseReturnRepo.create(Object.assign(Object.assign({}, header), { tenantId, returnNumber: number, createdBy: userId }));
        const saved = await this.purchaseReturnRepo.save(r);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.purchaseReturnItemRepo.create(Object.assign(Object.assign({}, item), { returnId: saved.returnId, lineNumber: idx + 1 })));
            await this.purchaseReturnItemRepo.save(lineItems);
            if (dto.returnToStock === false) {
                for (const item of items) {
                    if (item.productId) {
                        await this.adjustStock(tenantId, item.productId, -Number(item.quantity), 'PURCHASE_RETURN', number, userId);
                    }
                }
            }
            if (dto.invoiceId) {
                const invoice = await this.purchaseInvoiceRepo.findOne({ where: { invoiceId: dto.invoiceId } });
                if (invoice) {
                    const returnAmount = Number(dto.totalAmount || 0);
                    const currentBalance = Number(invoice.balanceDue);
                    if (currentBalance > 0) {
                        const newBalance = Math.max(0, currentBalance - returnAmount);
                        const newPaid = Number(invoice.paidAmount) + (currentBalance - newBalance);
                        const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
                        await this.purchaseInvoiceRepo.update({ invoiceId: dto.invoiceId }, {
                            balanceDue: newBalance, paidAmount: newPaid, status: newStatus,
                        });
                    }
                    else {
                        const debitAmount = returnAmount;
                        await this.purchaseInvoiceRepo.update({ invoiceId: dto.invoiceId }, {
                            balanceDue: -debitAmount, status: 'DEBIT_BALANCE',
                        });
                    }
                }
            }
        }
        const prDate = (dto.returnDate || new Date().toISOString()).slice(0, 10);
        const prTotal = Number(dto.totalAmount || 0);
        if (prTotal > 0) {
            const prLines = [
                { accountCode: '2110', description: `AP - ${dto.supplierName}`, debitAmount: prTotal, creditAmount: 0 },
                { accountCode: '5010', description: `Purchase Return ${number} - ${dto.supplierName}`, debitAmount: 0, creditAmount: prTotal },
            ];
            if (dto.returnToStock === false) {
                const inventoryValue = Number(dto.subtotal || prTotal);
                prLines.push({ accountCode: '1140', description: `Inventory Out - ${number}`, debitAmount: 0, creditAmount: inventoryValue });
                prLines.push({ accountCode: '5001', description: `COGS - ${number}`, debitAmount: inventoryValue, creditAmount: 0 });
            }
            await this.createAutoJournalEntry(tenantId, userId, {
                voucherNumber: number, description: `Purchase Return ${number} - ${dto.supplierName}`,
                voucherDate: prDate, lines: prLines,
            });
        }
        return this.getPurchaseReturn(tenantId, saved.returnId);
    }
    async updatePurchaseReturn(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.purchaseReturnRepo.update({ returnId: id, tenantId }, header);
        if (items) {
            await this.purchaseReturnItemRepo.delete({ returnId: id });
            const lineItems = items.map((item, idx) => this.purchaseReturnItemRepo.create(Object.assign(Object.assign({}, item), { returnId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.purchaseReturnItemRepo.save(lineItems);
        }
        return this.getPurchaseReturn(tenantId, id);
    }
    async deletePurchaseReturn(tenantId, id) {
        await this.purchaseReturnRepo.delete({ returnId: id, tenantId });
        return { success: true };
    }
    async getFinanceDashboard(tenantId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const totalQuotations = await this.quotationRepo.count({ where: { tenantId } });
        const quotationsThisMonth = await this.quotationRepo.createQueryBuilder('q')
            .where('q.tenantId = :tid AND q.createdAt >= :start', { tid: tenantId, start: startOfMonth })
            .getCount();
        const quotationsByStatus = await this.quotationRepo.createQueryBuilder('q')
            .select('q.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(q.totalAmount)', 'value')
            .where('q.tenantId = :tid', { tid: tenantId })
            .groupBy('q.status')
            .getRawMany();
        const totalInvoices = await this.invoiceRepo.count({ where: { tenantId } });
        const invoicesThisMonth = await this.invoiceRepo.createQueryBuilder('i')
            .where('i.tenantId = :tid AND i.createdAt >= :start', { tid: tenantId, start: startOfMonth })
            .getCount();
        const revenueResult = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.totalAmount)', 'total')
            .where('i.tenantId = :tid', { tid: tenantId })
            .getRawOne();
        const totalRevenue = Number((revenueResult === null || revenueResult === void 0 ? void 0 : revenueResult.total) || 0);
        const revenueThisMonth = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.totalAmount)', 'total')
            .where('i.tenantId = :tid AND i.createdAt >= :start', { tid: tenantId, start: startOfMonth })
            .getRawOne();
        const revenueLastMonth = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.totalAmount)', 'total')
            .where('i.tenantId = :tid AND i.createdAt >= :start AND i.createdAt <= :end', { tid: tenantId, start: startOfLastMonth, end: endOfLastMonth })
            .getRawOne();
        const outstandingResult = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.balanceDue)', 'total')
            .where('i.tenantId = :tid AND i.status NOT IN (:...paid)', { tid: tenantId, paid: ['PAID', 'CANCELLED'] })
            .getRawOne();
        const totalOutstanding = Number((outstandingResult === null || outstandingResult === void 0 ? void 0 : outstandingResult.total) || 0);
        const overdueResult = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.balanceDue)', 'total')
            .addSelect('COUNT(*)', 'count')
            .where('i.tenantId = :tid AND i.dueDate < NOW() AND i.status NOT IN (:...paid)', { tid: tenantId, paid: ['PAID', 'CANCELLED'] })
            .getRawOne();
        const invoicesByStatus = await this.invoiceRepo.createQueryBuilder('i')
            .select('i.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(i.totalAmount)', 'value')
            .where('i.tenantId = :tid', { tid: tenantId })
            .groupBy('i.status')
            .getRawMany();
        const receiptsResult = await this.receiptRepo.createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .addSelect('COUNT(*)', 'count')
            .where('r.tenantId = :tid', { tid: tenantId })
            .getRawOne();
        const totalReceived = Number((receiptsResult === null || receiptsResult === void 0 ? void 0 : receiptsResult.total) || 0);
        const receiptsThisMonth = await this.receiptRepo.createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .where('r.tenantId = :tid AND r.createdAt >= :start', { tid: tenantId, start: startOfMonth })
            .getRawOne();
        const monthlyRevenue = await this.invoiceRepo.createQueryBuilder('i')
            .select("TO_CHAR(i.createdAt, 'Mon YY')", 'month')
            .addSelect('SUM(i.totalAmount)', 'revenue')
            .addSelect('SUM(i.vatAmount)', 'vat')
            .where('i.tenantId = :tid AND i.createdAt >= :start', { tid: tenantId, start: new Date(now.getFullYear(), now.getMonth() - 5, 1) })
            .groupBy("TO_CHAR(i.createdAt, 'Mon YY')")
            .orderBy("MIN(i.createdAt)", 'ASC')
            .getRawMany();
        const topCustomers = await this.invoiceRepo.createQueryBuilder('i')
            .select('i.customerName', 'customerName')
            .addSelect('COUNT(*)', 'invoiceCount')
            .addSelect('SUM(i.totalAmount)', 'totalRevenue')
            .addSelect('SUM(i.balanceDue)', 'outstanding')
            .where('i.tenantId = :tid', { tid: tenantId })
            .groupBy('i.customerName')
            .orderBy('SUM(i.totalAmount)', 'DESC')
            .limit(5)
            .getRawMany();
        const purchaseResult = await this.purchaseInvoiceRepo.createQueryBuilder('p')
            .select('SUM(p.totalAmount)', 'total')
            .addSelect('SUM(p.balanceDue)', 'outstanding')
            .addSelect('COUNT(*)', 'count')
            .where('p.tenantId = :tid', { tid: tenantId })
            .getRawOne();
        const vatCollected = await this.invoiceRepo.createQueryBuilder('i')
            .select('SUM(i.vatAmount)', 'total')
            .where('i.tenantId = :tid AND i.createdAt >= :start', { tid: tenantId, start: startOfYear })
            .getRawOne();
        const vatPaid = await this.purchaseInvoiceRepo.createQueryBuilder('p')
            .select('SUM(p.vatAmount)', 'total')
            .where('p.tenantId = :tid AND p.createdAt >= :start', { tid: tenantId, start: startOfYear })
            .getRawOne();
        return {
            quotations: {
                total: totalQuotations,
                thisMonth: quotationsThisMonth,
                byStatus: quotationsByStatus,
            },
            invoices: {
                total: totalInvoices,
                thisMonth: invoicesThisMonth,
                totalRevenue,
                revenueThisMonth: Number((revenueThisMonth === null || revenueThisMonth === void 0 ? void 0 : revenueThisMonth.total) || 0),
                revenueLastMonth: Number((revenueLastMonth === null || revenueLastMonth === void 0 ? void 0 : revenueLastMonth.total) || 0),
                totalOutstanding,
                overdueAmount: Number((overdueResult === null || overdueResult === void 0 ? void 0 : overdueResult.total) || 0),
                overdueCount: Number((overdueResult === null || overdueResult === void 0 ? void 0 : overdueResult.count) || 0),
                byStatus: invoicesByStatus,
                monthlyTrend: monthlyRevenue,
                topCustomers,
            },
            receipts: {
                total: Number((receiptsResult === null || receiptsResult === void 0 ? void 0 : receiptsResult.count) || 0),
                totalReceived,
                thisMonth: Number((receiptsThisMonth === null || receiptsThisMonth === void 0 ? void 0 : receiptsThisMonth.total) || 0),
            },
            purchases: {
                total: Number((purchaseResult === null || purchaseResult === void 0 ? void 0 : purchaseResult.count) || 0),
                totalAmount: Number((purchaseResult === null || purchaseResult === void 0 ? void 0 : purchaseResult.total) || 0),
                outstanding: Number((purchaseResult === null || purchaseResult === void 0 ? void 0 : purchaseResult.outstanding) || 0),
            },
            vat: {
                collected: Number((vatCollected === null || vatCollected === void 0 ? void 0 : vatCollected.total) || 0),
                paid: Number((vatPaid === null || vatPaid === void 0 ? void 0 : vatPaid.total) || 0),
                net: Number((vatCollected === null || vatCollected === void 0 ? void 0 : vatCollected.total) || 0) - Number((vatPaid === null || vatPaid === void 0 ? void 0 : vatPaid.total) || 0),
            },
        };
    }
    async getJournalVouchers(tenantId, page = 1, limit = 20, search, type, status) {
        const qb = this.jvRepo.createQueryBuilder('j').where('j.tenantId = :tid', { tid: tenantId });
        if (search)
            qb.andWhere('(j.voucherNumber ILIKE :s OR j.description ILIKE :s OR j.reference ILIKE :s)', { s: `%${search}%` });
        if (type)
            qb.andWhere('j.voucherType = :type', { type });
        if (status)
            qb.andWhere('j.status = :status', { status });
        qb.orderBy('j.voucherDate', 'DESC').addOrderBy('j.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getJournalVoucher(tenantId, id) {
        const jv = await this.jvRepo.findOne({ where: { voucherId: id, tenantId }, relations: ['lines'] });
        if (!jv)
            throw new common_1.NotFoundException('Journal Voucher not found');
        return jv;
    }
    async createJournalVoucher(tenantId, dto, userId) {
        const number = await this.generateNumber('JV', this.jvRepo, 'voucherNumber');
        const { lines } = dto, header = __rest(dto, ["lines"]);
        const totalDebit = (lines || []).reduce((s, l) => s + Number(l.debitAmount || 0), 0);
        const totalCredit = (lines || []).reduce((s, l) => s + Number(l.creditAmount || 0), 0);
        const jv = this.jvRepo.create(Object.assign(Object.assign({}, header), { tenantId, voucherNumber: number, createdBy: userId, totalDebit, totalCredit }));
        const saved = await this.jvRepo.save(jv);
        if (lines === null || lines === void 0 ? void 0 : lines.length) {
            const lineEntities = lines.map((l, idx) => this.jvLineRepo.create(Object.assign(Object.assign({}, l), { voucherId: saved.voucherId, lineNumber: idx + 1 })));
            await this.jvLineRepo.save(lineEntities);
        }
        return this.getJournalVoucher(tenantId, saved.voucherId);
    }
    async updateJournalVoucher(tenantId, id, dto) {
        const { lines } = dto, header = __rest(dto, ["lines"]);
        if (lines) {
            const totalDebit = lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0);
            const totalCredit = lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0);
            header.totalDebit = totalDebit;
            header.totalCredit = totalCredit;
        }
        await this.jvRepo.update({ voucherId: id, tenantId }, header);
        if (lines) {
            await this.jvLineRepo.delete({ voucherId: id });
            const lineEntities = lines.map((l, idx) => this.jvLineRepo.create(Object.assign(Object.assign({}, l), { voucherId: id, lineNumber: idx + 1 })));
            if (lineEntities.length)
                await this.jvLineRepo.save(lineEntities);
        }
        return this.getJournalVoucher(tenantId, id);
    }
    async postJournalVoucher(tenantId, id, userId) {
        const jv = await this.getJournalVoucher(tenantId, id);
        if (Math.abs(Number(jv.totalDebit) - Number(jv.totalCredit)) > 0.001) {
            throw new Error('Debit and Credit must be equal to post the voucher');
        }
        await this.jvRepo.update({ voucherId: id, tenantId }, {
            isPosted: true, status: 'POSTED',
            postedAt: new Date(), postedBy: userId,
        });
        return this.getJournalVoucher(tenantId, id);
    }
    async deleteJournalVoucher(tenantId, id) {
        const jv = await this.jvRepo.findOne({ where: { voucherId: id, tenantId } });
        if (jv === null || jv === void 0 ? void 0 : jv.isPosted)
            throw new Error('Cannot delete a posted voucher');
        await this.jvRepo.delete({ voucherId: id, tenantId });
        return { success: true };
    }
    async getGeneralLedger(tenantId, accountId, fromDate, toDate, page = 1, limit = 50) {
        const qb = this.jvLineRepo.createQueryBuilder('l')
            .innerJoin('journal_vouchers', 'jv', 'jv.voucher_id = l.voucher_id AND jv.is_posted = true AND jv.tenant_id = :tid', { tid: tenantId })
            .select([
            'l.line_id as "lineId"',
            'l.account_id as "accountId"',
            'l.account_code as "accountCode"',
            'l.account_name as "accountName"',
            'l.description as "description"',
            'l.debit_amount as "debitAmount"',
            'l.credit_amount as "creditAmount"',
            'l.cost_center as "costCenter"',
            'jv.voucher_number as "voucherNumber"',
            'jv.voucher_date as "voucherDate"',
            'jv.voucher_type as "voucherType"',
            'jv.reference as "reference"',
            'jv.description as "voucherDescription"',
        ]);
        if (accountId)
            qb.andWhere('l.account_id = :accountId', { accountId });
        if (fromDate)
            qb.andWhere('jv.voucher_date >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('jv.voucher_date <= :toDate', { toDate });
        qb.orderBy('jv.voucher_date', 'ASC').addOrderBy('jv.voucher_number', 'ASC');
        const allRows = await qb.getRawMany();
        const total = allRows.length;
        let runningBalance = 0;
        const rowsWithBalance = allRows.map(row => {
            runningBalance += Number(row.debitAmount || 0) - Number(row.creditAmount || 0);
            return Object.assign(Object.assign({}, row), { runningBalance });
        });
        const data = rowsWithBalance.slice((page - 1) * limit, page * limit);
        const totalDebit = allRows.reduce((s, r) => s + Number(r.debitAmount || 0), 0);
        const totalCredit = allRows.reduce((s, r) => s + Number(r.creditAmount || 0), 0);
        return { data, total, page, limit, summary: { totalDebit, totalCredit, netBalance: totalDebit - totalCredit } };
    }
    async getTrialBalance(tenantId, fromDate, toDate) {
        const qb = this.jvLineRepo.createQueryBuilder('l')
            .innerJoin('journal_vouchers', 'jv', 'jv.voucher_id = l.voucher_id AND jv.is_posted = true AND jv.tenant_id = :tid', { tid: tenantId })
            .select([
            'l.account_id as "accountId"',
            'l.account_code as "accountCode"',
            'l.account_name as "accountName"',
            'SUM(l.debit_amount) as "totalDebit"',
            'SUM(l.credit_amount) as "totalCredit"',
        ])
            .groupBy('l.account_id, l.account_code, l.account_name');
        if (fromDate)
            qb.andWhere('jv.voucher_date >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('jv.voucher_date <= :toDate', { toDate });
        const rows = await qb.orderBy('l.account_code', 'ASC').getRawMany();
        const accounts = rows.map(r => ({
            accountId: r.accountId,
            accountCode: r.accountCode,
            accountName: r.accountName,
            totalDebit: Number(r.totalDebit || 0),
            totalCredit: Number(r.totalCredit || 0),
            balance: Number(r.totalDebit || 0) - Number(r.totalCredit || 0),
        }));
        const grandTotalDebit = accounts.reduce((s, a) => s + a.totalDebit, 0);
        const grandTotalCredit = accounts.reduce((s, a) => s + a.totalCredit, 0);
        const isBalanced = Math.abs(grandTotalDebit - grandTotalCredit) < 0.001;
        return { accounts, grandTotalDebit, grandTotalCredit, isBalanced };
    }
    async getProfitLoss(tenantId, fromDate, toDate) {
        const salesQb = this.invoiceRepo.createQueryBuilder("i")
            .select("SUM(i.subtotal)", "revenue")
            .addSelect("SUM(i.vatAmount)", "vat")
            .where("i.tenantId = :tid", { tid: tenantId });
        if (fromDate)
            salesQb.andWhere("i.invoiceDate >= :fromDate", { fromDate });
        if (toDate)
            salesQb.andWhere("i.invoiceDate <= :toDate", { toDate });
        const salesResult = await salesQb.getRawOne();
        const purchaseQb = this.purchaseInvoiceRepo.createQueryBuilder("p")
            .select("SUM(p.subtotal)", "cost")
            .where("p.tenantId = :tid", { tid: tenantId });
        if (fromDate)
            purchaseQb.andWhere("p.invoiceDate >= :fromDate", { fromDate });
        if (toDate)
            purchaseQb.andWhere("p.invoiceDate <= :toDate", { toDate });
        const purchaseResult = await purchaseQb.getRawOne();
        const revenue = { items: [{ accountCode: "4000", accountName: "Sales Revenue", amount: Number((salesResult === null || salesResult === void 0 ? void 0 : salesResult.revenue) || 0) }], total: Number((salesResult === null || salesResult === void 0 ? void 0 : salesResult.revenue) || 0) };
        const costOfSales = { items: [{ accountCode: "5000", accountName: "Cost of Goods Sold", amount: Number((purchaseResult === null || purchaseResult === void 0 ? void 0 : purchaseResult.cost) || 0) }], total: Number((purchaseResult === null || purchaseResult === void 0 ? void 0 : purchaseResult.cost) || 0) };
        const grossProfit = revenue.total - costOfSales.total;
        const expenses = { items: [], total: 0 };
        const netProfit = grossProfit - expenses.total;
        return { revenue, costOfSales, grossProfit, expenses, netProfit };
    }
    async getBalanceSheet(tenantId, asOfDate) {
        const assets = { current: { items: [], total: 0 }, nonCurrent: { items: [], total: 0 }, total: 0 };
        const liabilities = { current: { items: [], total: 0 }, nonCurrent: { items: [], total: 0 }, total: 0 };
        const equity = { items: [], total: 0 };
        const arResult = await this.invoiceRepo.createQueryBuilder("i")
            .select("SUM(i.balanceDue)", "total").where("i.tenantId = :tid AND i.status NOT IN (:...s)", { tid: tenantId, s: ["PAID", "CANCELLED"] }).getRawOne();
        const apResult = await this.purchaseInvoiceRepo.createQueryBuilder("p")
            .select("SUM(p.balanceDue)", "total").where("p.tenantId = :tid AND p.status NOT IN (:...s)", { tid: tenantId, s: ["PAID", "CANCELLED"] }).getRawOne();
        if (Number((arResult === null || arResult === void 0 ? void 0 : arResult.total) || 0) > 0) {
            assets.current.items.push({ accountCode: "1130", accountName: "Accounts Receivable", balance: Number(arResult.total) });
            assets.current.total += Number(arResult.total);
        }
        if (Number((apResult === null || apResult === void 0 ? void 0 : apResult.total) || 0) > 0) {
            liabilities.current.items.push({ accountCode: "2110", accountName: "Accounts Payable", balance: Number(apResult.total) });
            liabilities.current.total += Number(apResult.total);
        }
        assets.total = assets.current.total + assets.nonCurrent.total;
        liabilities.total = liabilities.current.total + liabilities.nonCurrent.total;
        return { assets, liabilities, equity, asOfDate };
    }
    async getCashFlow(tenantId, fromDate, toDate) {
        const rQb = this.receiptRepo.createQueryBuilder("r").select("SUM(r.amount)", "total").where("r.tenantId = :tid", { tid: tenantId });
        if (fromDate)
            rQb.andWhere("r.receiptDate >= :fromDate", { fromDate });
        if (toDate)
            rQb.andWhere("r.receiptDate <= :toDate", { toDate });
        const receiptsResult = await rQb.getRawOne();
        const pQb = this.voucherRepo.createQueryBuilder("v").select("SUM(v.amount)", "total").where("v.tenantId = :tid", { tid: tenantId });
        if (fromDate)
            pQb.andWhere("v.voucherDate >= :fromDate", { fromDate });
        if (toDate)
            pQb.andWhere("v.voucherDate <= :toDate", { toDate });
        const paymentsResult = await pQb.getRawOne();
        const operatingInflow = Number((receiptsResult === null || receiptsResult === void 0 ? void 0 : receiptsResult.total) || 0);
        const operatingOutflow = Number((paymentsResult === null || paymentsResult === void 0 ? void 0 : paymentsResult.total) || 0);
        const operatingTotal = operatingInflow - operatingOutflow;
        return {
            operating: { items: [{ description: "Cash received from customers", amount: operatingInflow }, { description: "Cash paid to suppliers", amount: -operatingOutflow }], total: operatingTotal },
            investing: { items: [], total: 0 },
            financing: { items: [], total: 0 },
            openingBalance: 0, netCashFlow: operatingTotal, closingBalance: operatingTotal,
        };
    }
    async getARaging(tenantId, asOfDate) {
        const date = asOfDate ? new Date(asOfDate) : new Date();
        const invoices = await this.invoiceRepo.createQueryBuilder("i")
            .where("i.tenantId = :tid AND i.status NOT IN (:...s) AND i.balanceDue > 0", { tid: tenantId, s: ["PAID", "CANCELLED"] }).getMany();
        const summary = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days91plus: 0 };
        const result = invoices.map(inv => {
            const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
            const daysOverdue = dueDate ? Math.floor((date.getTime() - dueDate.getTime()) / 86400000) : 0;
            const balance = Number(inv.balanceDue || 0);
            if (daysOverdue <= 0)
                summary.current += balance;
            else if (daysOverdue <= 30)
                summary.days1_30 += balance;
            else if (daysOverdue <= 60)
                summary.days31_60 += balance;
            else if (daysOverdue <= 90)
                summary.days61_90 += balance;
            else
                summary.days91plus += balance;
            return Object.assign(Object.assign({}, inv), { daysOverdue: Math.max(0, daysOverdue) });
        });
        return { invoices: result, summary, totalOutstanding: invoices.reduce((s, i) => s + Number(i.balanceDue || 0), 0) };
    }
    async getAPAging(tenantId, asOfDate) {
        const date = asOfDate ? new Date(asOfDate) : new Date();
        const invoices = await this.purchaseInvoiceRepo.createQueryBuilder("i")
            .where("i.tenantId = :tid AND i.status NOT IN (:...s) AND i.balanceDue > 0", { tid: tenantId, s: ["PAID", "CANCELLED"] }).getMany();
        const summary = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days91plus: 0 };
        const result = invoices.map(inv => {
            const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
            const daysOverdue = dueDate ? Math.floor((date.getTime() - dueDate.getTime()) / 86400000) : 0;
            const balance = Number(inv.balanceDue || 0);
            if (daysOverdue <= 0)
                summary.current += balance;
            else if (daysOverdue <= 30)
                summary.days1_30 += balance;
            else if (daysOverdue <= 60)
                summary.days31_60 += balance;
            else if (daysOverdue <= 90)
                summary.days61_90 += balance;
            else
                summary.days91plus += balance;
            return Object.assign(Object.assign({}, inv), { daysOverdue: Math.max(0, daysOverdue) });
        });
        return { invoices: result, summary, totalOutstanding: invoices.reduce((s, i) => s + Number(i.balanceDue || 0), 0) };
    }
    async getVATReturn(tenantId, fromDate, toDate) {
        const sQb = this.invoiceRepo.createQueryBuilder("i").where("i.tenantId = :tid", { tid: tenantId });
        if (fromDate)
            sQb.andWhere("i.invoiceDate >= :fromDate", { fromDate });
        if (toDate)
            sQb.andWhere("i.invoiceDate <= :toDate", { toDate });
        const salesInvoices = await sQb.getMany();
        const pQb = this.purchaseInvoiceRepo.createQueryBuilder("p").where("p.tenantId = :tid", { tid: tenantId });
        if (fromDate)
            pQb.andWhere("p.invoiceDate >= :fromDate", { fromDate });
        if (toDate)
            pQb.andWhere("p.invoiceDate <= :toDate", { toDate });
        const purchaseInvoices = await pQb.getMany();
        const outputVat = salesInvoices.reduce((s, i) => s + Number(i.vatAmount || 0), 0);
        const inputVat = purchaseInvoices.reduce((s, i) => s + Number(i.vatAmount || 0), 0);
        const taxableSales = salesInvoices.reduce((s, i) => s + Number(i.subtotal || 0), 0);
        return {
            outputVat, inputVat, netVat: outputVat - inputVat, taxableSales,
            salesDetails: salesInvoices.map(i => ({ invoiceId: i.invoiceId, invoiceNumber: i.invoiceNumber, customerName: i.customerName, invoiceDate: i.invoiceDate, taxableAmount: i.subtotal, vatAmount: i.vatAmount })),
            purchaseDetails: purchaseInvoices.map(i => ({ invoiceId: i.invoiceId, invoiceNumber: i.invoiceNumber, supplierName: i.supplierName, invoiceDate: i.invoiceDate, taxableAmount: i.subtotal, vatAmount: i.vatAmount })),
        };
    }
    async getBudgetVsActual(tenantId, fromDate, toDate) {
        const accounts = await this.coaRepo.find({ where: { tenantId, isActive: true, accountType: "EXPENSE" } });
        const items = accounts.map(acc => ({ accountId: acc.accountId, accountCode: acc.accountCode, accountName: acc.accountName, budget: 0, actual: 0, variance: 0, utilization: 0 }));
        return { items, totalBudget: 0, totalActual: 0, totalVariance: 0, overallUtilization: 0 };
    }
    async getSalesTargets(tenantId, year, month) {
        const rawSql = `SELECT * FROM sales_targets WHERE tenant_id = $1 ${year ? 'AND period_year = $2' : ''} ${month ? `AND period_month = $${year ? 3 : 2}` : ''} ORDER BY period_year DESC, period_month DESC`;
        const params = [tenantId];
        if (year)
            params.push(year);
        if (month)
            params.push(month);
        return this.invoiceRepo.query(rawSql, params);
    }
    async createSalesTarget(tenantId, dto, userId) {
        const sql = `INSERT INTO sales_targets (tenant_id, period_type, period_year, period_month, period_quarter, salesman_id, salesman_name, target_amount, target_qty, notes, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`;
        const result = await this.invoiceRepo.query(sql, [
            tenantId, dto.periodType || 'MONTHLY', dto.periodYear, dto.periodMonth || null,
            dto.periodQuarter || null, dto.salesmanId || null, dto.salesmanName || null,
            dto.targetAmount || 0, dto.targetQty || 0, dto.notes || null, userId
        ]);
        return result[0];
    }
    async updateSalesTarget(tenantId, id, dto) {
        const sql = `UPDATE sales_targets SET target_amount=$1, target_qty=$2, salesman_id=$3, salesman_name=$4, notes=$5, updated_at=NOW() WHERE target_id=$6 AND tenant_id=$7 RETURNING *`;
        const result = await this.invoiceRepo.query(sql, [dto.targetAmount || 0, dto.targetQty || 0, dto.salesmanId || null, dto.salesmanName || null, dto.notes || null, id, tenantId]);
        return result[0];
    }
    async deleteSalesTarget(tenantId, id) {
        await this.invoiceRepo.query(`DELETE FROM sales_targets WHERE target_id=$1 AND tenant_id=$2`, [id, tenantId]);
        return { success: true };
    }
    async getSalesVsTarget(tenantId, year, month) {
        const targetSql = `SELECT * FROM sales_targets WHERE tenant_id=$1 AND period_year=$2 ${month ? 'AND period_month=$3' : ''}`;
        const targetParams = [tenantId, year];
        if (month)
            targetParams.push(month);
        const targets = await this.invoiceRepo.query(targetSql, targetParams);
        const actualSql = `
      SELECT 
        salesman_id, salesman_name,
        EXTRACT(MONTH FROM invoice_date) as month,
        EXTRACT(YEAR FROM invoice_date) as year,
        SUM(total_amount) as actual_amount,
        COUNT(*) as invoice_count
      FROM sales_invoices 
      WHERE tenant_id=$1 AND EXTRACT(YEAR FROM invoice_date)=$2
      ${month ? 'AND EXTRACT(MONTH FROM invoice_date)=$3' : ''}
      GROUP BY salesman_id, salesman_name, EXTRACT(MONTH FROM invoice_date), EXTRACT(YEAR FROM invoice_date)
      ORDER BY year, month`;
        const actualParams = [tenantId, year];
        if (month)
            actualParams.push(month);
        const actuals = await this.invoiceRepo.query(actualSql, actualParams);
        const monthlyActualSql = `
      SELECT 
        EXTRACT(MONTH FROM invoice_date) as month,
        SUM(total_amount) as actual_amount,
        COUNT(*) as invoice_count
      FROM sales_invoices 
      WHERE tenant_id=$1 AND EXTRACT(YEAR FROM invoice_date)=$2
      GROUP BY EXTRACT(MONTH FROM invoice_date)
      ORDER BY month`;
        const monthlyActuals = await this.invoiceRepo.query(monthlyActualSql, [tenantId, year]);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthly = months.map((name, i) => {
            const m = i + 1;
            const target = targets.find((t) => !t.salesman_id && Number(t.period_month) === m);
            const actual = monthlyActuals.find((a) => Number(a.month) === m);
            const targetAmt = Number((target === null || target === void 0 ? void 0 : target.target_amount) || 0);
            const actualAmt = Number((actual === null || actual === void 0 ? void 0 : actual.actual_amount) || 0);
            return {
                month: name, monthNum: m,
                target: targetAmt,
                actual: actualAmt,
                variance: actualAmt - targetAmt,
                achievement: targetAmt > 0 ? Math.round((actualAmt / targetAmt) * 100) : 0,
                invoiceCount: Number((actual === null || actual === void 0 ? void 0 : actual.invoice_count) || 0),
            };
        });
        const salesmanTargets = targets.filter((t) => t.salesman_id);
        const salesmanActuals = actuals;
        const salesmanMap = {};
        salesmanTargets.forEach((t) => {
            const key = t.salesman_id || 'unassigned';
            if (!salesmanMap[key])
                salesmanMap[key] = { salesmanId: t.salesman_id, salesmanName: t.salesman_name, target: 0, actual: 0 };
            salesmanMap[key].target += Number(t.target_amount || 0);
        });
        salesmanActuals.forEach((a) => {
            const key = a.salesman_id || 'unassigned';
            if (!salesmanMap[key])
                salesmanMap[key] = { salesmanId: a.salesman_id, salesmanName: a.salesman_name, target: 0, actual: 0 };
            salesmanMap[key].actual += Number(a.actual_amount || 0);
        });
        const bySalesman = Object.values(salesmanMap).map((s) => (Object.assign(Object.assign({}, s), { variance: s.actual - s.target, achievement: s.target > 0 ? Math.round((s.actual / s.target) * 100) : 0 })));
        const totalTarget = monthly.reduce((s, m) => s + m.target, 0);
        const totalActual = monthly.reduce((s, m) => s + m.actual, 0);
        return {
            year, month: month || null, targets, monthly, bySalesman,
            summary: {
                totalTarget, totalActual,
                totalVariance: totalActual - totalTarget,
                achievement: totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0,
            }
        };
    }
    async getDailyReport(tenantId, date) {
        const reportDate = date || new Date().toISOString().slice(0, 10);
        const invoices = await this.invoiceRepo.createQueryBuilder("i").where("i.tenantId = :tid AND DATE(i.createdAt) = :d", { tid: tenantId, d: reportDate }).getMany();
        const receipts = await this.receiptRepo.createQueryBuilder("r").where("r.tenantId = :tid AND DATE(r.createdAt) = :d", { tid: tenantId, d: reportDate }).getMany();
        const quotations = await this.quotationRepo.createQueryBuilder("q").where("q.tenantId = :tid AND DATE(q.createdAt) = :d", { tid: tenantId, d: reportDate }).getMany();
        return {
            invoices, receipts, quotations,
            totalSales: invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0),
            totalReceipts: receipts.reduce((s, r) => s + Number(r.amount || 0), 0),
            totalVat: invoices.reduce((s, i) => s + Number(i.vatAmount || 0), 0),
            invoiceCount: invoices.length, receiptCount: receipts.length,
        };
    }
    async getBankReconciliation(tenantId, fromDate, toDate) {
        const rQb = this.receiptRepo.createQueryBuilder("r").where("r.tenantId = :tid", { tid: tenantId });
        if (fromDate)
            rQb.andWhere("r.receiptDate >= :fromDate", { fromDate });
        if (toDate)
            rQb.andWhere("r.receiptDate <= :toDate", { toDate });
        const receipts = await rQb.getMany();
        const vQb = this.voucherRepo.createQueryBuilder("v").where("v.tenantId = :tid", { tid: tenantId });
        if (fromDate)
            vQb.andWhere("v.voucherDate >= :fromDate", { fromDate });
        if (toDate)
            vQb.andWhere("v.voucherDate <= :toDate", { toDate });
        const paymentVouchers = await vQb.getMany();
        return {
            receipts, paymentVouchers,
            totalReceipts: receipts.reduce((s, r) => s + Number(r.amount || 0), 0),
            totalPayments: paymentVouchers.reduce((s, v) => s + Number(v.amount || 0), 0),
            openingBalance: 0,
        };
    }
    async getLiquidationProjection(tenantId, currentCash, salaries, rent) {
        const now = new Date();
        const periods = [30, 60, 90];
        const result = [];
        for (const days of periods) {
            const futureDate = new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);
            const arResult = await this.invoiceRepo.createQueryBuilder("i")
                .select("SUM(i.balanceDue)", "total")
                .where("i.tenantId = :tid AND i.status NOT IN (:...s) AND i.dueDate <= :d", { tid: tenantId, s: ["PAID", "CANCELLED"], d: futureDate })
                .getRawOne();
            const apResult = await this.purchaseInvoiceRepo.createQueryBuilder("p")
                .select("SUM(p.balanceDue)", "total")
                .where("p.tenantId = :tid AND p.status NOT IN (:...s) AND p.dueDate <= :d", { tid: tenantId, s: ["PAID", "CANCELLED"], d: futureDate })
                .getRawOne();
            const expectedAR = Number((arResult === null || arResult === void 0 ? void 0 : arResult.total) || 0);
            const expectedAP = Number((apResult === null || apResult === void 0 ? void 0 : apResult.total) || 0);
            const salaryObligation = salaries * Math.ceil(days / 30);
            const rentObligation = rent * Math.ceil(days / 30);
            const totalInflows = currentCash + expectedAR;
            const totalObligations = expectedAP + salaryObligation + rentObligation;
            const netPosition = totalInflows - totalObligations;
            result.push({ period: days, expectedAR, expectedAP, salaryObligation, rentObligation, totalInflows, totalObligations, netPosition, fundingGap: Math.min(0, netPosition), status: netPosition >= 0 ? "SUFFICIENT" : "DEFICIT" });
        }
        return { periods: result, currentCash };
    }
    async getCreditRiskStatement(tenantId) {
        const invoices = await this.invoiceRepo.createQueryBuilder("i")
            .where("i.tenantId = :tid AND i.status NOT IN (:...s)", { tid: tenantId, s: ["CANCELLED"] })
            .getMany();
        const customerMap = new Map();
        const now = new Date();
        for (const inv of invoices) {
            if (!customerMap.has(inv.customerName)) {
                customerMap.set(inv.customerName, { customerName: inv.customerName, totalInvoiced: 0, totalPaid: 0, totalOverdue: 0, overdueCount: 0, totalInvoices: 0, maxDaysOverdue: 0, avgDaysToPay: 0 });
            }
            const c = customerMap.get(inv.customerName);
            c.totalInvoices++;
            c.totalInvoiced += Number(inv.totalAmount || 0);
            c.totalPaid += Number(inv.paidAmount || 0);
            const balance = Number(inv.balanceDue || 0);
            if (balance > 0 && inv.dueDate && new Date(inv.dueDate) < now) {
                const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000);
                c.totalOverdue += balance;
                c.overdueCount++;
                c.maxDaysOverdue = Math.max(c.maxDaysOverdue, daysOverdue);
            }
        }
        const customers = Array.from(customerMap.values()).map(c => {
            const overdueRatio = c.totalInvoiced > 0 ? (c.totalOverdue / c.totalInvoiced) * 100 : 0;
            let riskScore = 0;
            if (c.totalOverdue > 0)
                riskScore += 30;
            if (c.maxDaysOverdue > 90)
                riskScore += 40;
            else if (c.maxDaysOverdue > 60)
                riskScore += 30;
            else if (c.maxDaysOverdue > 30)
                riskScore += 20;
            if (overdueRatio > 50)
                riskScore += 30;
            else if (overdueRatio > 25)
                riskScore += 15;
            const riskLevel = riskScore >= 70 ? "CRITICAL" : riskScore >= 40 ? "HIGH" : riskScore >= 20 ? "MEDIUM" : "LOW";
            return Object.assign(Object.assign({}, c), { overdueRatio: Math.round(overdueRatio), riskScore, riskLevel });
        }).sort((a, b) => b.riskScore - a.riskScore);
        return { customers, totalExposure: customers.reduce((s, c) => s + c.totalOverdue, 0) };
    }
    async getWarehouses(tenantId, search) {
        const qb = this.warehouseRepo.createQueryBuilder('w')
            .where('w.tenantId = :tid AND w.isActive = true', { tid: tenantId });
        if (search)
            qb.andWhere('(w.warehouseName ILIKE :s OR w.warehouseCode ILIKE :s)', { s: `%${search}%` });
        return qb.orderBy('w.warehouseName', 'ASC').getMany();
    }
    async createWarehouse(tenantId, dto, userId) {
        const w = this.warehouseRepo.create(Object.assign(Object.assign({}, dto), { tenantId, createdBy: userId }));
        return this.warehouseRepo.save(w);
    }
    async updateWarehouse(tenantId, id, dto) {
        await this.warehouseRepo.update({ warehouseId: id, tenantId }, dto);
        return this.warehouseRepo.findOne({ where: { warehouseId: id } });
    }
    async deleteWarehouse(tenantId, id) {
        await this.warehouseRepo.update({ warehouseId: id, tenantId }, { isActive: false });
        return { success: true };
    }
    async getLocations(tenantId, warehouseId) {
        const qb = this.locationRepo.createQueryBuilder('l')
            .where('l.tenantId = :tid AND l.isActive = true', { tid: tenantId });
        if (warehouseId)
            qb.andWhere('l.warehouseId = :wid', { wid: warehouseId });
        return qb.orderBy('l.locationCode', 'ASC').getMany();
    }
    async createLocation(tenantId, dto) {
        const l = this.locationRepo.create(Object.assign(Object.assign({}, dto), { tenantId }));
        return this.locationRepo.save(l);
    }
    async updateLocation(tenantId, id, dto) {
        await this.locationRepo.update({ locationId: id, tenantId }, dto);
        return this.locationRepo.findOne({ where: { locationId: id } });
    }
    async deleteLocation(tenantId, id) {
        await this.locationRepo.update({ locationId: id, tenantId }, { isActive: false });
        return { success: true };
    }
    async getStockTransfers(tenantId, page = 1, limit = 20, search) {
        const qb = this.transferRepo.createQueryBuilder('t').where('t.tenantId = :tid', { tid: tenantId });
        if (search)
            qb.andWhere('(t.transferNumber ILIKE :s OR t.fromWarehouse ILIKE :s OR t.toWarehouse ILIKE :s)', { s: `%${search}%` });
        qb.orderBy('t.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getStockTransfer(tenantId, id) {
        const t = await this.transferRepo.findOne({ where: { transferId: id, tenantId }, relations: ['items'] });
        if (!t)
            throw new common_1.NotFoundException('Stock Transfer not found');
        return t;
    }
    async createStockTransfer(tenantId, dto, userId) {
        const number = await this.generateNumber('ST', this.transferRepo, 'transferNumber');
        const { items } = dto, header = __rest(dto, ["items"]);
        const t = this.transferRepo.create(Object.assign(Object.assign({}, header), { tenantId, transferNumber: number, createdBy: userId }));
        const saved = await this.transferRepo.save(t);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.transferItemRepo.create(Object.assign(Object.assign({}, item), { transferId: saved.transferId, lineNumber: idx + 1 })));
            await this.transferItemRepo.save(lineItems);
        }
        return this.getStockTransfer(tenantId, saved.transferId);
    }
    async updateStockTransfer(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.transferRepo.update({ transferId: id, tenantId }, header);
        if (items) {
            await this.transferItemRepo.delete({ transferId: id });
            const lineItems = items.map((item, idx) => this.transferItemRepo.create(Object.assign(Object.assign({}, item), { transferId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.transferItemRepo.save(lineItems);
        }
        return this.getStockTransfer(tenantId, id);
    }
    async confirmStockTransfer(tenantId, id, userId) {
        const transfer = await this.getStockTransfer(tenantId, id);
        for (const item of transfer.items) {
            if (item.productId) {
                await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'OUT', transfer.transferNumber, userId);
                await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'IN', transfer.transferNumber, userId);
            }
        }
        await this.transferRepo.update({ transferId: id, tenantId }, { status: 'COMPLETED' });
        return this.getStockTransfer(tenantId, id);
    }
    async deleteStockTransfer(tenantId, id) {
        await this.transferRepo.delete({ transferId: id, tenantId });
        return { success: true };
    }
    async getStockAdjustments(tenantId, page = 1, limit = 20, search) {
        const qb = this.adjustmentRepo.createQueryBuilder('a').where('a.tenantId = :tid', { tid: tenantId });
        if (search)
            qb.andWhere('(a.adjustmentNumber ILIKE :s OR a.reason ILIKE :s)', { s: `%${search}%` });
        qb.orderBy('a.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getStockAdjustment(tenantId, id) {
        const a = await this.adjustmentRepo.findOne({ where: { adjustmentId: id, tenantId }, relations: ['items'] });
        if (!a)
            throw new common_1.NotFoundException('Stock Adjustment not found');
        return a;
    }
    async createStockAdjustment(tenantId, dto, userId) {
        const number = await this.generateNumber('ADJ', this.adjustmentRepo, 'adjustmentNumber');
        const { items } = dto, header = __rest(dto, ["items"]);
        const a = this.adjustmentRepo.create(Object.assign(Object.assign({}, header), { tenantId, adjustmentNumber: number, createdBy: userId }));
        const saved = await this.adjustmentRepo.save(a);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.adjustmentItemRepo.create(Object.assign(Object.assign({}, item), { adjustmentId: saved.adjustmentId, lineNumber: idx + 1 })));
            await this.adjustmentItemRepo.save(lineItems);
            if (dto.status === 'CONFIRMED') {
                for (const item of items) {
                    if (item.productId) {
                        await this.adjustStock(tenantId, item.productId, Number(item.quantity), header.adjustmentType || 'IN', number, userId);
                    }
                }
            }
        }
        return this.getStockAdjustment(tenantId, saved.adjustmentId);
    }
    async updateStockAdjustment(tenantId, id, dto) {
        const { items } = dto, header = __rest(dto, ["items"]);
        await this.adjustmentRepo.update({ adjustmentId: id, tenantId }, header);
        if (items) {
            await this.adjustmentItemRepo.delete({ adjustmentId: id });
            const lineItems = items.map((item, idx) => this.adjustmentItemRepo.create(Object.assign(Object.assign({}, item), { adjustmentId: id, lineNumber: idx + 1 })));
            if (lineItems.length)
                await this.adjustmentItemRepo.save(lineItems);
        }
        return this.getStockAdjustment(tenantId, id);
    }
    async deleteStockAdjustment(tenantId, id) {
        await this.adjustmentRepo.delete({ adjustmentId: id, tenantId });
        return { success: true };
    }
    async createAutoJournalEntry(tenantId, userId, dto) {
        try {
            console.log('[JV] Creating auto journal entry for:', dto.voucherNumber, 'tenant:', tenantId);
            const getAccountId = async (code) => {
                const acc = await this.coaRepo.findOne({ where: { tenantId, accountCode: code } });
                return (acc === null || acc === void 0 ? void 0 : acc.accountId) || null;
            };
            const jvNumber = await this.generateNumber('JV', this.jvRepo, 'voucherNumber');
            const totalDebit = dto.lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0);
            const totalCredit = dto.lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0);
            const jv = this.jvRepo.create({
                tenantId, voucherNumber: jvNumber, voucherType: 'JOURNAL',
                description: dto.description, voucherDate: dto.voucherDate,
                status: 'POSTED', createdBy: userId, totalDebit, totalCredit,
                reference: dto.voucherNumber,
            });
            const savedJV = await this.jvRepo.save(jv);
            for (let i = 0; i < dto.lines.length; i++) {
                const line = dto.lines[i];
                const acc = await this.coaRepo.findOne({ where: { tenantId, accountCode: line.accountCode } });
                if (!acc)
                    continue;
                await this.jvLineRepo.save(this.jvLineRepo.create({
                    voucherId: savedJV.voucherId, lineNumber: i + 1,
                    accountId: acc.accountId, accountCode: acc.accountCode,
                    accountName: acc.accountName,
                    description: line.description,
                    debitAmount: line.debitAmount, creditAmount: line.creditAmount,
                }));
            }
            return savedJV;
        }
        catch (e) {
            console.error('Auto journal entry failed:', (e === null || e === void 0 ? void 0 : e.message) || e);
        }
    }
    async getStockMovementReport(tenantId, productId, from, to) {
        const productQb = this.productRepo.createQueryBuilder('p').where('p.tenantId = :tenantId', { tenantId });
        if (productId)
            productQb.andWhere('p.productId = :productId', { productId });
        const products = await productQb.getMany();
        const report = await Promise.all(products.map(async (p) => {
            const salesQb = this.invoiceItemRepo.createQueryBuilder('i')
                .innerJoin('sales_invoices', 'inv', 'inv.invoice_id = i.invoice_id')
                .select('SUM(i.quantity)', 'totalQty').addSelect('SUM(i.line_total)', 'totalValue')
                .where('inv.tenant_id = :tid AND i.product_id = :pid', { tid: tenantId, pid: p.productId });
            if (from)
                salesQb.andWhere('inv.invoice_date >= :from', { from });
            if (to)
                salesQb.andWhere('inv.invoice_date <= :to', { to });
            const salesData = await salesQb.getRawOne();
            const purchQb = this.grnItemRepo.createQueryBuilder('g')
                .innerJoin('goods_receipt_notes', 'grn', 'grn.grn_id = g.grn_id')
                .select('SUM(g.quantity)', 'totalQty').addSelect('SUM(g.line_total)', 'totalValue')
                .where('grn.tenant_id = :tid AND g.product_id = :pid', { tid: tenantId, pid: p.productId });
            if (from)
                purchQb.andWhere('grn.grn_date >= :from', { from });
            if (to)
                purchQb.andWhere('grn.grn_date <= :to', { to });
            const purchData = await purchQb.getRawOne();
            const adjQb = this.stockRepo.createQueryBuilder('s')
                .select('SUM(CASE WHEN s.quantity > 0 THEN s.quantity ELSE 0 END)', 'inQty')
                .addSelect('SUM(CASE WHEN s.quantity < 0 THEN ABS(s.quantity) ELSE 0 END)', 'outQty')
                .where('s.tenantId = :tid AND s.productId = :pid', { tid: tenantId, pid: p.productId });
            const adjData = await adjQb.getRawOne();
            const salesQty = Number((salesData === null || salesData === void 0 ? void 0 : salesData.totalQty) || 0);
            const salesValue = Number((salesData === null || salesData === void 0 ? void 0 : salesData.totalValue) || 0);
            const purchQty = Number((purchData === null || purchData === void 0 ? void 0 : purchData.totalQty) || 0);
            const purchValue = Number((purchData === null || purchData === void 0 ? void 0 : purchData.totalValue) || 0);
            const adjIn = Number((adjData === null || adjData === void 0 ? void 0 : adjData.inQty) || 0);
            const adjOut = Number((adjData === null || adjData === void 0 ? void 0 : adjData.outQty) || 0);
            const currentStock = Number(p.stockQty || 0);
            const openingStock = currentStock + salesQty - purchQty - adjIn + adjOut;
            return {
                productId: p.productId, productCode: p.productCode, productName: p.productName,
                category: p.category, unitOfMeasure: p.unitOfMeasure,
                openingStock, purchasesIn: purchQty, purchasesValue: purchValue,
                salesOut: salesQty, salesValue, adjustmentsIn: adjIn, adjustmentsOut: adjOut,
                closingStock: currentStock, costPrice: p.costPrice, unitPrice: p.unitPrice,
                stockValue: currentStock * Number(p.costPrice || 0),
                isLowStock: p.trackStock && currentStock <= Number(p.minStockQty || 0),
                minStockQty: p.minStockQty,
            };
        }));
        return report;
    }
    async getItemTransactionHistory(tenantId, productId) {
        const product = await this.productRepo.findOne({ where: { productId, tenantId } });
        if (!product)
            throw new Error('Product not found');
        const transactions = [];
        const salesItems = await this.invoiceItemRepo.createQueryBuilder('i')
            .innerJoinAndSelect('i.invoice', 'inv', 'inv.tenantId = :tid', { tid: tenantId })
            .where('i.productId = :pid', { pid: productId })
            .orderBy('inv.invoiceDate', 'DESC').getMany();
        salesItems.forEach((item) => {
            var _a, _b, _c;
            return transactions.push({
                date: (_a = item.invoice) === null || _a === void 0 ? void 0 : _a.invoiceDate, type: 'SALE', reference: (_b = item.invoice) === null || _b === void 0 ? void 0 : _b.invoiceNumber,
                party: (_c = item.invoice) === null || _c === void 0 ? void 0 : _c.customerName, qty: -Number(item.quantity),
                unitPrice: Number(item.unitPrice), value: Number(item.lineTotal),
                direction: 'OUT',
            });
        });
        const grnItems = await this.grnItemRepo.createQueryBuilder('g')
            .innerJoinAndSelect('g.grn', 'grn', 'grn.tenantId = :tid', { tid: tenantId })
            .where('g.productId = :pid', { pid: productId })
            .orderBy('grn.grnDate', 'DESC').getMany();
        grnItems.forEach((item) => {
            var _a, _b, _c;
            return transactions.push({
                date: (_a = item.grn) === null || _a === void 0 ? void 0 : _a.grnDate, type: 'PURCHASE', reference: (_b = item.grn) === null || _b === void 0 ? void 0 : _b.grnNumber,
                party: (_c = item.grn) === null || _c === void 0 ? void 0 : _c.supplierName, qty: Number(item.quantity),
                unitPrice: Number(item.unitPrice), value: Number(item.lineTotal),
                direction: 'IN',
            });
        });
        const adjustments = await this.stockRepo.find({ where: { tenantId, productId }, order: { createdAt: 'DESC' } });
        adjustments.forEach((adj) => transactions.push({
            date: adj.createdAt, type: 'ADJUSTMENT', reference: adj.reference || 'ADJ',
            party: adj.adjustmentType, qty: Number(adj.quantity),
            unitPrice: Number(product.costPrice), value: Math.abs(Number(adj.quantity)) * Number(product.costPrice),
            direction: Number(adj.quantity) > 0 ? 'IN' : 'OUT',
        }));
        transactions.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        const salePrices = salesItems.map((i) => Number(i.unitPrice)).filter(p => p > 0);
        const purchPrices = grnItems.map((i) => Number(i.unitPrice)).filter(p => p > 0);
        return {
            product,
            transactions,
            summary: {
                totalSalesQty: salesItems.reduce((s, i) => s + Number(i.quantity), 0),
                totalSalesValue: salesItems.reduce((s, i) => s + Number(i.lineTotal), 0),
                totalPurchaseQty: grnItems.reduce((s, i) => s + Number(i.quantity), 0),
                totalPurchaseValue: grnItems.reduce((s, i) => s + Number(i.lineTotal), 0),
                currentStock: Number(product.stockQty),
                stockValue: Number(product.stockQty) * Number(product.costPrice),
            },
            priceAnalysis: {
                minSalePrice: salePrices.length ? Math.min(...salePrices) : 0,
                maxSalePrice: salePrices.length ? Math.max(...salePrices) : 0,
                avgSalePrice: salePrices.length ? salePrices.reduce((s, p) => s + p, 0) / salePrices.length : 0,
                minPurchasePrice: purchPrices.length ? Math.min(...purchPrices) : 0,
                maxPurchasePrice: purchPrices.length ? Math.max(...purchPrices) : 0,
                avgPurchasePrice: purchPrices.length ? purchPrices.reduce((s, p) => s + p, 0) / purchPrices.length : 0,
                currentCostPrice: Number(product.costPrice),
                currentSellingPrice: Number(product.unitPrice),
            },
        };
    }
    async getGLLedger(tenantId, accountId, from, to) {
        const account = await this.coaRepo.findOne({ where: { accountId, tenantId } });
        if (!account)
            throw new Error('Account not found');
        const jvQb = this.jvRepo.createQueryBuilder('jv')
            .leftJoinAndSelect('jv.lines', 'line')
            .where('jv.tenantId = :tid', { tid: tenantId })
            .andWhere('line.accountId = :aid', { aid: accountId });
        if (from)
            jvQb.andWhere('jv.voucherDate >= :from', { from });
        if (to)
            jvQb.andWhere('jv.voucherDate <= :to', { to });
        const journals = await jvQb.orderBy('jv.voucherDate', 'ASC').getMany();
        const transactions = [];
        journals.forEach((jv) => {
            var _a;
            (_a = jv.lines) === null || _a === void 0 ? void 0 : _a.filter((l) => l.accountId === accountId).forEach((line) => {
                transactions.push({
                    date: jv.voucherDate, type: 'JOURNAL', reference: jv.voucherNumber,
                    description: line.description || jv.description,
                    debit: Number(line.debitAmount || 0), credit: Number(line.creditAmount || 0),
                });
            });
        });
        transactions.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
        let runningBalance = 0;
        transactions.forEach(t => {
            runningBalance += t.debit - t.credit;
            t.runningBalance = runningBalance;
        });
        return {
            account,
            transactions,
            summary: {
                totalDebit: transactions.reduce((s, t) => s + t.debit, 0),
                totalCredit: transactions.reduce((s, t) => s + t.credit, 0),
                closingBalance: runningBalance,
            },
        };
    }
    async getAllCustomersStatement(tenantId) {
        const customers = await this.invoiceRepo.createQueryBuilder('i')
            .select('i.customerName', 'name')
            .addSelect('SUM(i.totalAmount)', 'totalInvoiced')
            .addSelect('SUM(i.paidAmount)', 'totalPaid')
            .addSelect('SUM(i.balanceDue)', 'totalBalance')
            .addSelect('COUNT(*)', 'invoiceCount')
            .where('i.tenantId = :tid', { tid: tenantId })
            .groupBy('i.customerName')
            .orderBy('SUM(i.balanceDue)', 'DESC')
            .getRawMany();
        return customers;
    }
    async getAllSuppliersStatement(tenantId) {
        const suppliers = await this.purchaseInvoiceRepo.createQueryBuilder('i')
            .select('i.supplierName', 'name')
            .addSelect('SUM(i.totalAmount)', 'totalInvoiced')
            .addSelect('SUM(i.paidAmount)', 'totalPaid')
            .addSelect('SUM(i.balanceDue)', 'totalBalance')
            .addSelect('COUNT(*)', 'invoiceCount')
            .where('i.tenantId = :tid', { tid: tenantId })
            .groupBy('i.supplierName')
            .orderBy('SUM(i.balanceDue)', 'DESC')
            .getRawMany();
        return suppliers;
    }
    async getAccountLedger(tenantId, accountId, customerName, supplierName, from, to) {
        const transactions = [];
        if (!supplierName) {
            const invQb = this.invoiceRepo.createQueryBuilder('i').where('i.tenantId = :tid', { tid: tenantId });
            if (customerName)
                invQb.andWhere('i.customerName ILIKE :name', { name: `%${customerName}%` });
            if (from)
                invQb.andWhere('i.invoiceDate >= :from', { from });
            if (to)
                invQb.andWhere('i.invoiceDate <= :to', { to });
            const invoices = await invQb.orderBy('i.invoiceDate', 'ASC').getMany();
            invoices.forEach(inv => transactions.push({
                date: inv.invoiceDate, type: 'SALES INVOICE', reference: inv.invoiceNumber,
                party: inv.customerName, debit: Number(inv.totalAmount), credit: 0,
                status: inv.status, balanceDue: Number(inv.balanceDue),
            }));
            const rcptQb = this.receiptRepo.createQueryBuilder('r').where('r.tenantId = :tid', { tid: tenantId });
            if (customerName)
                rcptQb.andWhere('r.customerName ILIKE :name', { name: `%${customerName}%` });
            if (from)
                rcptQb.andWhere('r.receiptDate >= :from', { from });
            if (to)
                rcptQb.andWhere('r.receiptDate <= :to', { to });
            const receipts = await rcptQb.orderBy('r.receiptDate', 'ASC').getMany();
            receipts.forEach(r => transactions.push({
                date: r.receiptDate, type: 'RECEIPT', reference: r.receiptNumber,
                party: r.customerName, debit: 0, credit: Number(r.amount),
                status: 'CONFIRMED', balanceDue: 0,
            }));
        }
        if (!customerName) {
            const pinvQb = this.purchaseInvoiceRepo.createQueryBuilder('i').where('i.tenantId = :tid', { tid: tenantId });
            if (supplierName)
                pinvQb.andWhere('i.supplierName ILIKE :name', { name: `%${supplierName}%` });
            if (from)
                pinvQb.andWhere('i.invoiceDate >= :from', { from });
            if (to)
                pinvQb.andWhere('i.invoiceDate <= :to', { to });
            const pinvoices = await pinvQb.orderBy('i.invoiceDate', 'ASC').getMany();
            pinvoices.forEach(inv => transactions.push({
                date: inv.invoiceDate, type: 'PURCHASE INVOICE', reference: inv.invoiceNumber,
                party: inv.supplierName, debit: 0, credit: Number(inv.totalAmount),
                status: inv.status, balanceDue: Number(inv.balanceDue),
            }));
            const pvQb = this.voucherRepo.createQueryBuilder('v').where('v.tenantId = :tid', { tid: tenantId });
            if (supplierName)
                pvQb.andWhere('v.supplierName ILIKE :name', { name: `%${supplierName}%` });
            if (from)
                pvQb.andWhere('v.voucherDate >= :from', { from });
            if (to)
                pvQb.andWhere('v.voucherDate <= :to', { to });
            const vouchers = await pvQb.orderBy('v.voucherDate', 'ASC').getMany();
            vouchers.forEach(v => transactions.push({
                date: v.voucherDate, type: 'PAYMENT', reference: v.voucherNumber,
                party: v.supplierName, debit: Number(v.amount), credit: 0,
                status: 'CONFIRMED', balanceDue: 0,
            }));
        }
        transactions.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
        let runningBalance = 0;
        transactions.forEach(t => {
            runningBalance += t.debit - t.credit;
            t.runningBalance = runningBalance;
        });
        return {
            transactions,
            summary: {
                totalDebit: transactions.reduce((s, t) => s + t.debit, 0),
                totalCredit: transactions.reduce((s, t) => s + t.credit, 0),
                closingBalance: runningBalance,
            },
        };
    }
    async getSalesReport(tenantId, from, to) {
        const qb = this.invoiceRepo.createQueryBuilder('i')
            .leftJoinAndSelect('i.items', 'item')
            .where('i.tenantId = :tid', { tid: tenantId });
        if (from)
            qb.andWhere('i.invoiceDate >= :from', { from });
        if (to)
            qb.andWhere('i.invoiceDate <= :to', { to });
        qb.orderBy('i.invoiceDate', 'DESC');
        const invoices = await qb.getMany();
        const byCustomer = {};
        invoices.forEach((inv) => {
            const name = inv.customerName || 'Unknown';
            if (!byCustomer[name])
                byCustomer[name] = { name, invoiceCount: 0, totalAmount: 0, paidAmount: 0, balanceDue: 0 };
            byCustomer[name].invoiceCount++;
            byCustomer[name].totalAmount += Number(inv.totalAmount || 0);
            byCustomer[name].paidAmount += Number(inv.paidAmount || 0);
            byCustomer[name].balanceDue += Number(inv.balanceDue || 0);
        });
        const byProduct = {};
        invoices.forEach((inv) => {
            (inv.items || []).forEach((item) => {
                const name = item.description || item.productId || 'Unknown';
                if (!byProduct[name])
                    byProduct[name] = { name, qty: 0, totalAmount: 0, invoiceCount: 0 };
                byProduct[name].qty += Number(item.quantity || 0);
                byProduct[name].totalAmount += Number(item.lineTotal || 0);
                byProduct[name].invoiceCount++;
            });
        });
        const byMonth = {};
        invoices.forEach((inv) => {
            const month = inv.invoiceDate ? inv.invoiceDate.toString().slice(0, 7) : 'Unknown';
            if (!byMonth[month])
                byMonth[month] = { month, invoiceCount: 0, totalAmount: 0, paidAmount: 0 };
            byMonth[month].invoiceCount++;
            byMonth[month].totalAmount += Number(inv.totalAmount || 0);
            byMonth[month].paidAmount += Number(inv.paidAmount || 0);
        });
        const totalRevenue = invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
        const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount || 0), 0);
        const totalBalance = invoices.reduce((s, i) => s + Number(i.balanceDue || 0), 0);
        return {
            summary: { totalInvoices: invoices.length, totalRevenue, totalPaid, totalBalance },
            byCustomer: Object.values(byCustomer).sort((a, b) => b.totalAmount - a.totalAmount),
            byProduct: Object.values(byProduct).sort((a, b) => b.totalAmount - a.totalAmount),
            byMonth: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v),
        };
    }
    async getPurchaseReport(tenantId, from, to) {
        const qb = this.purchaseInvoiceRepo.createQueryBuilder('i')
            .leftJoinAndSelect('i.items', 'item')
            .where('i.tenantId = :tid', { tid: tenantId });
        if (from)
            qb.andWhere('i.invoiceDate >= :from', { from });
        if (to)
            qb.andWhere('i.invoiceDate <= :to', { to });
        qb.orderBy('i.invoiceDate', 'DESC');
        const invoices = await qb.getMany();
        const bySupplier = {};
        invoices.forEach((inv) => {
            const name = inv.supplierName || 'Unknown';
            if (!bySupplier[name])
                bySupplier[name] = { name, invoiceCount: 0, totalAmount: 0, paidAmount: 0, balanceDue: 0 };
            bySupplier[name].invoiceCount++;
            bySupplier[name].totalAmount += Number(inv.totalAmount || 0);
            bySupplier[name].paidAmount += Number(inv.paidAmount || 0);
            bySupplier[name].balanceDue += Number(inv.balanceDue || 0);
        });
        const byProduct = {};
        invoices.forEach((inv) => {
            (inv.items || []).forEach((item) => {
                const name = item.description || item.productId || 'Unknown';
                if (!byProduct[name])
                    byProduct[name] = { name, qty: 0, totalAmount: 0 };
                byProduct[name].qty += Number(item.quantity || 0);
                byProduct[name].totalAmount += Number(item.lineTotal || 0);
            });
        });
        const byMonth = {};
        invoices.forEach((inv) => {
            const month = inv.invoiceDate ? inv.invoiceDate.toString().slice(0, 7) : 'Unknown';
            if (!byMonth[month])
                byMonth[month] = { month, invoiceCount: 0, totalAmount: 0 };
            byMonth[month].invoiceCount++;
            byMonth[month].totalAmount += Number(inv.totalAmount || 0);
        });
        const totalPurchases = invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
        const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount || 0), 0);
        const totalBalance = invoices.reduce((s, i) => s + Number(i.balanceDue || 0), 0);
        return {
            summary: { totalInvoices: invoices.length, totalPurchases, totalPaid, totalBalance },
            bySupplier: Object.values(bySupplier).sort((a, b) => b.totalAmount - a.totalAmount),
            byProduct: Object.values(byProduct).sort((a, b) => b.totalAmount - a.totalAmount),
            byMonth: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v),
        };
    }
    async getTopCustomersSuppliers(tenantId, limit = 10) {
        const topCustomers = await this.invoiceRepo.createQueryBuilder('i')
            .select('i.customerName', 'name')
            .addSelect('COUNT(*)', 'invoiceCount')
            .addSelect('SUM(i.totalAmount)', 'totalAmount')
            .addSelect('SUM(i.paidAmount)', 'paidAmount')
            .addSelect('SUM(i.balanceDue)', 'balanceDue')
            .where('i.tenantId = :tid', { tid: tenantId })
            .groupBy('i.customerName')
            .orderBy('SUM(i.totalAmount)', 'DESC')
            .limit(limit)
            .getRawMany();
        const topSuppliers = await this.purchaseInvoiceRepo.createQueryBuilder('i')
            .select('i.supplierName', 'name')
            .addSelect('COUNT(*)', 'invoiceCount')
            .addSelect('SUM(i.totalAmount)', 'totalAmount')
            .addSelect('SUM(i.paidAmount)', 'paidAmount')
            .addSelect('SUM(i.balanceDue)', 'balanceDue')
            .where('i.tenantId = :tid', { tid: tenantId })
            .groupBy('i.supplierName')
            .orderBy('SUM(i.totalAmount)', 'DESC')
            .limit(limit)
            .getRawMany();
        return { topCustomers, topSuppliers };
    }
    async getFinancialReports(tenantId, from, to) {
        const tid = tenantId;
        const accounts = await this.coaRepo.find({ where: { tenantId: tid, isActive: true } });
        let rawSql = `
      SELECT l.account_code as "accountCode", l.account_name as "accountName",
             SUM(l.debit_amount) as "totalDebit", SUM(l.credit_amount) as "totalCredit"
      FROM journal_voucher_lines l
      JOIN journal_vouchers jv ON jv.voucher_id = l.voucher_id
      WHERE jv.tenant_id = $1 AND jv.status = 'POSTED'
    `;
        const params = [tid];
        if (from) {
            rawSql += ` AND jv.voucher_date >= $${params.length + 1}`;
            params.push(from);
        }
        if (to) {
            rawSql += ` AND jv.voucher_date <= $${params.length + 1}`;
            params.push(to);
        }
        rawSql += ` GROUP BY l.account_code, l.account_name ORDER BY l.account_code`;
        const balances = await this.jvLineRepo.query(rawSql, params);
        const balanceMap = {};
        balances.forEach((b) => {
            const debit = Number(b.totalDebit || 0);
            const credit = Number(b.totalCredit || 0);
            balanceMap[b.accountCode] = { debit, credit, balance: debit - credit };
        });
        const accountRows = accounts.filter(a => a.accountSubtype !== 'HEADER').map(acc => {
            const bal = balanceMap[acc.accountCode] || { debit: 0, credit: 0, balance: 0 };
            const normalDebit = ['ASSET', 'EXPENSE'].includes(acc.accountType);
            const netBalance = normalDebit ? bal.balance : -bal.balance;
            return {
                accountId: acc.accountId, accountCode: acc.accountCode, accountName: acc.accountName,
                accountType: acc.accountType, accountSubtype: acc.accountSubtype,
                debit: bal.debit, credit: bal.credit, balance: netBalance,
            };
        });
        const trialBalance = accountRows.filter(a => a.debit > 0 || a.credit > 0)
            .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
        const revenue = accountRows.filter(a => a.accountType === 'REVENUE' && a.accountSubtype !== 'HEADER');
        const cogs = accountRows.filter(a => a.accountType === 'EXPENSE' && ['COGS'].includes(a.accountSubtype || ''));
        const opex = accountRows.filter(a => a.accountType === 'EXPENSE' && ['OPERATING', 'Administration', 'Sales & Marketing Expenses', 'Finance Expenses', 'OTHER'].includes(a.accountSubtype || ''));
        const totalRevenue = revenue.reduce((s, a) => s + a.balance, 0);
        const totalCogs = cogs.reduce((s, a) => s + a.balance, 0);
        const grossProfit = totalRevenue - totalCogs;
        const totalOpex = opex.reduce((s, a) => s + a.balance, 0);
        const netProfit = grossProfit - totalOpex;
        const currentAssets = accountRows.filter(a => a.accountType === 'ASSET' && a.accountSubtype === 'CURRENT');
        const fixedAssets = accountRows.filter(a => a.accountType === 'ASSET' && a.accountSubtype === 'FIXED');
        const currentLiabilities = accountRows.filter(a => a.accountType === 'LIABILITY' && a.accountSubtype === 'CURRENT');
        const longTermLiabilities = accountRows.filter(a => a.accountType === 'LIABILITY' && a.accountSubtype === 'LONG_TERM');
        const equity = accountRows.filter(a => a.accountType === 'EQUITY');
        const totalCurrentAssets = currentAssets.reduce((s, a) => s + a.balance, 0);
        const totalFixedAssets = fixedAssets.reduce((s, a) => s + a.balance, 0);
        const totalAssets = totalCurrentAssets + totalFixedAssets;
        const totalCurrentLiabilities = currentLiabilities.reduce((s, a) => s + a.balance, 0);
        const totalLongTermLiabilities = longTermLiabilities.reduce((s, a) => s + a.balance, 0);
        const totalEquity = equity.reduce((s, a) => s + a.balance, 0) + netProfit;
        const totalLiabilitiesEquity = totalCurrentLiabilities + totalLongTermLiabilities + totalEquity;
        return {
            trialBalance,
            pnl: {
                revenue, cogs, opex,
                totalRevenue, totalCogs, grossProfit, totalOpex, netProfit,
                grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
                netMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
            },
            balanceSheet: {
                currentAssets, fixedAssets, currentLiabilities, longTermLiabilities, equity,
                totalCurrentAssets, totalFixedAssets, totalAssets,
                totalCurrentLiabilities, totalLongTermLiabilities, totalEquity,
                totalLiabilitiesEquity, netProfit,
                isBalanced: Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01,
            },
        };
    }
    async getConsumableStock(tenantId) {
        const sql = `
      SELECT cs.*, p.product_name, p.product_code, p.unit_of_measure, p.brand, p.category,
        CASE WHEN cs.qty_on_hand <= cs.min_qty THEN true ELSE false END as is_low_stock
      FROM consumable_stock cs
      JOIN products p ON p.product_id = cs.product_id
      WHERE cs.tenant_id = $1
      ORDER BY p.product_name`;
        return this.invoiceRepo.query(sql, [tenantId]);
    }
    async getConsumableTransactions(tenantId, productId) {
        let sql = `
      SELECT ct.*, p.product_name, p.product_code, p.unit_of_measure
      FROM consumable_transactions ct
      JOIN products p ON p.product_id = ct.product_id
      WHERE ct.tenant_id = $1`;
        const params = [tenantId];
        if (productId) {
            sql += ` AND ct.product_id = $2`;
            params.push(productId);
        }
        sql += ` ORDER BY ct.created_at DESC LIMIT 200`;
        return this.invoiceRepo.query(sql, params);
    }
    async issueConsumable(tenantId, dto, userId) {
        const stockResult = await this.invoiceRepo.query(`SELECT * FROM consumable_stock WHERE tenant_id=$1 AND product_id=$2`, [tenantId, dto.productId]);
        if (!stockResult.length)
            throw new Error('Product not found in consumable stock');
        const stock = stockResult[0];
        const newQty = Number(stock.qty_on_hand) - Number(dto.quantity);
        if (newQty < 0)
            throw new Error(`Insufficient stock. Available: ${stock.qty_on_hand}`);
        await this.invoiceRepo.query(`UPDATE consumable_stock SET qty_on_hand=$1, last_issued_date=$2, updated_at=NOW() WHERE tenant_id=$3 AND product_id=$4`, [newQty, new Date().toISOString().slice(0, 10), tenantId, dto.productId]);
        await this.invoiceRepo.query(`INSERT INTO consumable_transactions (tenant_id, product_id, transaction_type, quantity, balance_qty, department, issued_to_id, issued_to_name, reason, notes, created_by)
       VALUES ($1,$2,'ISSUE',$3,$4,$5,$6,$7,$8,$9,$10)`, [tenantId, dto.productId, dto.quantity, newQty, dto.department || null, dto.issuedToId || null, dto.issuedToName || null, dto.reason || null, dto.notes || null, userId]);
        return { success: true, remainingQty: newQty };
    }
    async receiveConsumable(tenantId, productId, quantity, referenceNo, userId) {
        const existing = await this.invoiceRepo.query(`SELECT * FROM consumable_stock WHERE tenant_id=$1 AND product_id=$2`, [tenantId, productId]);
        if (existing.length) {
            const newQty = Number(existing[0].qty_on_hand) + Number(quantity);
            await this.invoiceRepo.query(`UPDATE consumable_stock SET qty_on_hand=$1, last_received_date=$2, updated_at=NOW() WHERE tenant_id=$3 AND product_id=$4`, [newQty, new Date().toISOString().slice(0, 10), tenantId, productId]);
            await this.invoiceRepo.query(`INSERT INTO consumable_transactions (tenant_id, product_id, transaction_type, quantity, balance_qty, reference_no, created_by)
         VALUES ($1,$2,'RECEIPT',$3,$4,$5,$6)`, [tenantId, productId, quantity, newQty, referenceNo, userId]);
        }
        else {
            const productResult = await this.invoiceRepo.query(`SELECT * FROM products WHERE product_id=$1`, [productId]);
            if (productResult.length) {
                await this.invoiceRepo.query(`INSERT INTO consumable_stock (tenant_id, product_id, product_name, product_code, qty_on_hand, unit_of_measure, last_received_date)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`, [tenantId, productId, productResult[0].product_name, productResult[0].product_code, quantity, productResult[0].unit_of_measure, new Date().toISOString().slice(0, 10)]);
                await this.invoiceRepo.query(`INSERT INTO consumable_transactions (tenant_id, product_id, transaction_type, quantity, balance_qty, reference_no, created_by)
           VALUES ($1,$2,'RECEIPT',$3,$4,$5,$6)`, [tenantId, productId, quantity, quantity, referenceNo, userId]);
            }
        }
        return { success: true };
    }
    async getConsumableStats(tenantId) {
        const sql = `
      SELECT 
        COUNT(*) as total_items,
        SUM(qty_on_hand) as total_qty,
        COUNT(CASE WHEN qty_on_hand <= min_qty THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN qty_on_hand = 0 THEN 1 END) as out_of_stock_count
      FROM consumable_stock WHERE tenant_id=$1`;
        const result = await this.invoiceRepo.query(sql, [tenantId]);
        return result[0];
    }
    async getPOAssetItems(tenantId) {
        const sql = `
      SELECT 
        poi.item_id as id,
        poi.description,
        poi.brand,
        poi.model,
        poi.serial_number as "serialNumber",
        poi.asset_category as "assetCategory",
        poi.warranty_months as "warrantyMonths",
        poi.unit_price as "unitPrice",
        CEIL(poi.quantity) as quantity,
        COALESCE(poi.assets_created, 0) as "assetsCreated",
        CEIL(poi.quantity) - COALESCE(poi.assets_created, 0) as "remaining",
        po.supplier_name as "supplierName",
        po.po_number as "poNumber",
        po.po_date as "poDate",
        CASE WHEN poi.warranty_months IS NOT NULL 
          THEN (po.po_date::date + (poi.warranty_months || ' months')::interval)::date
          ELSE NULL 
        END as "warrantyExpiry"
      FROM purchase_order_items poi
      JOIN purchase_orders po ON po.po_id = poi.po_id
      WHERE po.tenant_id = $1 
        AND po.status IN ('RECEIVED','PARTIALLY_RECEIVED','CONFIRMED')
        AND CEIL(poi.quantity) > COALESCE(poi.assets_created, 0)
      ORDER BY po.po_date DESC, poi.description
    `;
        const items = await this.invoiceRepo.query(sql, [tenantId]);
        const expanded = [];
        for (const item of items) {
            const remaining = Number(item.remaining || 1);
            for (let i = 0; i < remaining; i++) {
                expanded.push(Object.assign(Object.assign({}, item), { id: `${item.id}-${i}`, baseId: item.id, unitIndex: i + 1, displayName: remaining > 1 ? `${item.description} (Unit ${i + 1} of ${Number(item.quantity)})` : item.description }));
            }
        }
        return expanded;
    }
    async getBrands(tenantId, category) {
        let sql = `SELECT * FROM asset_brands WHERE tenant_id=$1 AND is_active=true`;
        const params = [tenantId];
        if (category) {
            sql += ` AND category=$2`;
            params.push(category);
        }
        sql += ` ORDER BY brand_name`;
        return this.invoiceRepo.query(sql, params);
    }
    async createBrand(tenantId, dto) {
        const sql = `INSERT INTO asset_brands (tenant_id, brand_name, category) VALUES ($1,$2,$3) RETURNING *`;
        const result = await this.invoiceRepo.query(sql, [tenantId, dto.brandName, dto.category || null]);
        return result[0];
    }
    async deleteBrand(tenantId, id) {
        await this.invoiceRepo.query(`UPDATE asset_brands SET is_active=false WHERE brand_id=$1 AND tenant_id=$2`, [id, tenantId]);
        return { success: true };
    }
    async createDraftAssetsFromPO(tenantId, poId, userId) {
        const poResult = await this.invoiceRepo.query(`
      SELECT po.*, poi.* FROM purchase_orders po
      JOIN purchase_order_items poi ON poi.po_id = po.po_id
      WHERE po.po_id=$1 AND po.tenant_id=$2 AND poi.is_fixed_asset=true`, [poId, tenantId]);
        const assets = [];
        for (const item of poResult) {
            const count = await this.fixedAssetRepo.count({ where: { tenantId } });
            const assetCode = `AST-${String(count + assets.length + 1).padStart(4, '0')}`;
            const warrantyExpiry = item.warranty_months ?
                new Date(new Date(item.expected_delivery || Date.now()).setMonth(new Date(item.expected_delivery || Date.now()).getMonth() + item.warranty_months)).toISOString().slice(0, 10) : null;
            const asset = this.fixedAssetRepo.create({
                tenantId, assetCode, status: 'ACTIVE',
                assetName: item.description || item.product_name,
                category: item.asset_category || 'Other',
                brand: item.brand,
                model: item.model,
                serialNumber: item.serial_number,
                supplierName: item.supplier_name,
                purchaseDate: item.po_date || new Date().toISOString().slice(0, 10),
                purchaseCost: Number(item.unit_price || 0),
                warrantyExpiry,
                invoiceNumber: item.po_number,
                currentBookValue: Number(item.unit_price || 0),
                usefulLifeYears: 5,
                depreciationMethod: 'STRAIGHT_LINE',
                createdBy: userId,
            });
            const saved = await this.fixedAssetRepo.save(asset);
            assets.push(saved);
        }
        await this.invoiceRepo.query(`UPDATE purchase_orders SET asset_draft_created=true WHERE po_id=$1`, [poId]);
        return { created: assets.length, assets };
    }
    async getAssets(tenantId, page = 1, limit = 20, search, status, category) {
        const qb = this.fixedAssetRepo.createQueryBuilder('a').where('a.tenantId = :tid', { tid: tenantId });
        if (search)
            qb.andWhere('(a.assetName ILIKE :s OR a.assetCode ILIKE :s OR a.serialNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('a.status = :status', { status });
        if (category)
            qb.andWhere('a.category = :category', { category });
        qb.orderBy('a.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getAsset(tenantId, id) {
        return this.fixedAssetRepo.findOne({ where: { assetId: id, tenantId } });
    }
    async createAsset(tenantId, dto, userId) {
        const count = await this.fixedAssetRepo.count({ where: { tenantId } });
        const assetCode = dto.assetCode || `AST-${String(count + 1).padStart(4, '0')}`;
        const purchaseCost = Number(dto.purchaseCost || 0);
        const salvageValue = Number(dto.salvageValue || 0);
        const usefulLife = Number(dto.usefulLifeYears || 5);
        const depreciableAmount = purchaseCost - salvageValue;
        const annualDepreciation = usefulLife > 0 ? depreciableAmount / usefulLife : 0;
        const depreciationRate = purchaseCost > 0 ? (annualDepreciation / purchaseCost) * 100 : 0;
        const { poItemBaseId } = dto, assetDto = __rest(dto, ["poItemBaseId"]);
        const asset = this.fixedAssetRepo.create(Object.assign(Object.assign({}, assetDto), { tenantId, assetCode, createdBy: userId, currentBookValue: purchaseCost, depreciationRate, accumulatedDepreciation: 0 }));
        const saved = await this.fixedAssetRepo.save(asset);
        if (poItemBaseId) {
            await this.invoiceRepo.query(`UPDATE purchase_order_items SET assets_created = COALESCE(assets_created, 0) + 1 WHERE item_id = $1`, [poItemBaseId]);
        }
        if (purchaseCost > 0 && dto.coaAssetAccount) {
            const creditAccount = dto.supplierName ? '2110' : '1120';
            await this.createAutoJournalEntry(tenantId, userId, {
                voucherNumber: assetCode, description: `Asset Purchase: ${dto.assetName}`,
                voucherDate: dto.purchaseDate || new Date().toISOString().slice(0, 10),
                lines: [
                    { accountCode: dto.coaAssetAccount, description: `Asset: ${dto.assetName}`, debitAmount: purchaseCost, creditAmount: 0 },
                    { accountCode: creditAccount, description: `Purchase of ${dto.assetName}`, debitAmount: 0, creditAmount: purchaseCost },
                ],
            });
        }
        return saved;
    }
    async updateAsset(tenantId, id, dto) {
        await this.fixedAssetRepo.update({ assetId: id, tenantId }, dto);
        return this.fixedAssetRepo.findOne({ where: { assetId: id } });
    }
    async deleteAsset(tenantId, id) {
        await this.fixedAssetRepo.delete({ assetId: id, tenantId });
        return { success: true };
    }
    async calculateDepreciation(tenantId, assetId, year, month, userId) {
        const asset = await this.fixedAssetRepo.findOne({ where: { assetId, tenantId } });
        if (!asset)
            throw new Error('Asset not found');
        const purchaseCost = Number(asset.purchaseCost || 0);
        const salvageValue = Number(asset.salvageValue || 0);
        const usefulLife = Number(asset.usefulLifeYears || 5);
        const accumulatedDepr = Number(asset.accumulatedDepreciation || 0);
        const currentValue = Number(asset.currentBookValue || purchaseCost);
        const depreciableAmount = purchaseCost - salvageValue;
        let monthlyDepr = 0;
        if (asset.depreciationMethod === 'STRAIGHT_LINE') {
            monthlyDepr = usefulLife > 0 ? depreciableAmount / (usefulLife * 12) : 0;
        }
        else if (asset.depreciationMethod === 'DECLINING_BALANCE') {
            const rate = Number(asset.depreciationRate || 0) / 100 / 12;
            monthlyDepr = currentValue * rate;
        }
        monthlyDepr = Math.min(monthlyDepr, Math.max(0, currentValue - salvageValue));
        const newAccumDepr = accumulatedDepr + monthlyDepr;
        const newBookValue = purchaseCost - newAccumDepr;
        const deprRecord = this.assetDeprRepo.create({
            tenantId, assetId, periodYear: year, periodMonth: month,
            openingValue: currentValue, depreciationAmount: monthlyDepr,
            closingValue: newBookValue, accumulatedDepreciation: newAccumDepr,
            status: 'POSTED', postedDate: new Date().toISOString().slice(0, 10),
        });
        await this.assetDeprRepo.save(deprRecord);
        await this.fixedAssetRepo.update({ assetId }, {
            accumulatedDepreciation: newAccumDepr, currentBookValue: newBookValue,
        });
        if (monthlyDepr > 0 && asset.coaDeprExpenseAccount && asset.coaAccumDeprAccount) {
            await this.createAutoJournalEntry(tenantId, userId, {
                voucherNumber: `DEPR-${assetId.slice(-6)}-${year}-${month}`,
                description: `Depreciation: ${asset.assetName} (${year}/${month})`,
                voucherDate: `${year}-${String(month).padStart(2, '0')}-01`,
                lines: [
                    { accountCode: asset.coaDeprExpenseAccount, description: `Depreciation - ${asset.assetName}`, debitAmount: monthlyDepr, creditAmount: 0 },
                    { accountCode: asset.coaAccumDeprAccount, description: `Accum. Depr - ${asset.assetName}`, debitAmount: 0, creditAmount: monthlyDepr },
                ],
            });
        }
        return deprRecord;
    }
    async runBulkDepreciation(tenantId, year, month, userId) {
        const assets = await this.fixedAssetRepo.find({ where: { tenantId, status: 'ACTIVE', isActive: true } });
        const results = [];
        for (const asset of assets) {
            try {
                const result = await this.calculateDepreciation(tenantId, asset.assetId, year, month, userId);
                results.push({ assetId: asset.assetId, assetName: asset.assetName, status: 'success', amount: result.depreciationAmount });
            }
            catch (e) {
                results.push({ assetId: asset.assetId, assetName: asset.assetName, status: 'error', error: e.message });
            }
        }
        return { processed: results.length, results };
    }
    async getDepreciationSchedule(tenantId, assetId) {
        return this.assetDeprRepo.find({ where: { tenantId, assetId }, order: { periodYear: 'DESC', periodMonth: 'DESC' } });
    }
    async getMaintenance(tenantId, assetId, status) {
        const where = { tenantId };
        if (assetId)
            where.assetId = assetId;
        if (status)
            where.status = status;
        return this.assetMaintRepo.find({ where, order: { scheduledDate: 'ASC' } });
    }
    async createMaintenance(tenantId, dto, userId) {
        const m = this.assetMaintRepo.create(Object.assign(Object.assign({}, dto), { tenantId, createdBy: userId }));
        const saved = await this.assetMaintRepo.save(m);
        if (dto.assetId && dto.nextDueDate) {
            await this.fixedAssetRepo.update({ assetId: dto.assetId }, { nextMaintenanceDate: dto.nextDueDate });
        }
        return saved;
    }
    async updateMaintenance(tenantId, id, dto) {
        await this.assetMaintRepo.update({ maintenanceId: id, tenantId }, dto);
        if (dto.status === 'COMPLETED' && dto.assetId) {
            await this.fixedAssetRepo.update({ assetId: dto.assetId }, {
                lastMaintenanceDate: dto.completedDate || new Date().toISOString().slice(0, 10),
                nextMaintenanceDate: dto.nextDueDate,
                condition: dto.condition || 'GOOD',
            });
        }
        return this.assetMaintRepo.findOne({ where: { maintenanceId: id } });
    }
    async getTransfers(tenantId, assetId) {
        const where = { tenantId };
        if (assetId)
            where.assetId = assetId;
        return this.assetTransferRepo.find({ where, order: { createdAt: 'DESC' } });
    }
    async createTransfer(tenantId, dto, userId) {
        const t = this.assetTransferRepo.create(Object.assign(Object.assign({}, dto), { tenantId, createdBy: userId }));
        const saved = await this.assetTransferRepo.save(t);
        await this.fixedAssetRepo.update({ assetId: dto.assetId }, {
            department: dto.toDepartment,
            locationName: dto.toLocation,
            assignedToId: dto.toUserId,
            assignedToName: dto.toUserName,
        });
        return saved;
    }
    async getAssetStats(tenantId) {
        const assets = await this.fixedAssetRepo.find({ where: { tenantId } });
        const totalAssets = assets.length;
        const totalCost = assets.reduce((s, a) => s + Number(a.purchaseCost || 0), 0);
        const totalBookValue = assets.reduce((s, a) => s + Number(a.currentBookValue || 0), 0);
        const totalAccumDepr = assets.reduce((s, a) => s + Number(a.accumulatedDepreciation || 0), 0);
        const byStatus = assets.reduce((acc, a) => { const s = a.status || 'ACTIVE'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
        const byCategory = assets.reduce((acc, a) => { const c = a.category || 'Uncategorized'; acc[c] = (acc[c] || 0) + 1; return acc; }, {});
        const dueForMaintenance = await this.assetMaintRepo.count({ where: { tenantId, status: 'SCHEDULED' } });
        const expiredWarranty = assets.filter((a) => a.warrantyExpiry && new Date(a.warrantyExpiry) < new Date()).length;
        return { totalAssets, totalCost, totalBookValue, totalAccumDepr, byStatus, byCategory, dueForMaintenance, expiredWarranty };
    }
    async getSalesmanReport(tenantId, from, to) {
        const qb = this.invoiceRepo.createQueryBuilder('i')
            .select('i.salesmanId', 'salesmanId')
            .addSelect('i.salesmanName', 'salesmanName')
            .addSelect('COUNT(*)', 'invoiceCount')
            .addSelect('SUM(i.totalAmount)', 'totalSales')
            .addSelect('SUM(i.paidAmount)', 'totalCollected')
            .addSelect('SUM(i.balanceDue)', 'totalOutstanding')
            .where('i.tenantId = :tid', { tid: tenantId })
            .andWhere('i.salesmanId IS NOT NULL');
        if (from)
            qb.andWhere('i.invoiceDate >= :from', { from });
        if (to)
            qb.andWhere('i.invoiceDate <= :to', { to });
        const bySalesman = await qb.groupBy('i.salesmanId, i.salesmanName')
            .orderBy('SUM(i.totalAmount)', 'DESC').getRawMany();
        const qbQ = this.quotationRepo.createQueryBuilder('q')
            .select('q.salesmanId', 'salesmanId')
            .addSelect('q.salesmanName', 'salesmanName')
            .addSelect('COUNT(*)', 'quotationCount')
            .addSelect('SUM(q.totalAmount)', 'totalQuoted')
            .addSelect("COUNT(CASE WHEN q.status = 'CONVERTED' THEN 1 END)", "converted")
            .where('q.tenantId = :tid', { tid: tenantId })
            .andWhere('q.salesmanId IS NOT NULL');
        if (from)
            qbQ.andWhere('q.quotationDate >= :from', { from });
        if (to)
            qbQ.andWhere('q.quotationDate <= :to', { to });
        const quotationsBySalesman = await qbQ.groupBy('q.salesmanId, q.salesmanName')
            .orderBy('SUM(q.totalAmount)', 'DESC').getRawMany();
        const visits = await this.invoiceRepo.query(`SELECT salesman_id, salesman_name, COUNT(*) as visit_count 
       FROM customer_visits WHERE tenant_id = $1 
       GROUP BY salesman_id, salesman_name ORDER BY COUNT(*) DESC`, [tenantId]).catch(() => []);
        return { bySalesman, quotationsBySalesman, visits };
    }
    async getStockReport(tenantId) {
        const products = await this.productRepo.createQueryBuilder('p')
            .where('p.tenantId = :tid AND p.isActive = true', { tid: tenantId })
            .orderBy('p.productName', 'ASC')
            .getMany();
        return products.map(p => ({
            productId: p.productId, productCode: p.productCode, productName: p.productName,
            category: p.category, unitOfMeasure: p.unitOfMeasure,
            stockQty: Number(p.stockQty || 0), minStockQty: Number(p.minStockQty || 0),
            costPrice: Number(p.costPrice || 0), unitPrice: Number(p.unitPrice || 0),
            stockValue: Number(p.stockQty || 0) * Number(p.costPrice || 0),
            isLowStock: p.trackStock && Number(p.stockQty || 0) <= Number(p.minStockQty || 0),
            trackStock: p.trackStock,
            margin: Number(p.unitPrice) > 0 ? Math.round(((Number(p.unitPrice) - Number(p.costPrice)) / Number(p.unitPrice)) * 100) : 0,
        }));
    }
    async getDashboardAnalytics(tenantId) {
        const t = { tenantId };
        const safe = async (fn, fallback) => {
            try {
                return await fn();
            }
            catch (e) {
                return fallback;
            }
        };
        const stockByType = await safe(() => this.productRepo.createQueryBuilder('p')
            .select('p.productType', 'type')
            .addSelect('COUNT(*)', 'count')
            .addSelect('COALESCE(SUM(p.stockQty * p.costPrice),0)', 'value')
            .where('p.tenantId = :tenantId', t)
            .groupBy('p.productType').getRawMany(), []);
        const topProducts = await safe(() => this.productRepo.createQueryBuilder('p')
            .select('p.productName', 'name')
            .addSelect('COALESCE(p.stockQty * p.costPrice,0)', 'value')
            .where('p.tenantId = :tenantId', t)
            .orderBy('value', 'DESC').limit(5).getRawMany(), []);
        const stockMovement = await safe(() => this.stockRepo.createQueryBuilder('s')
            .select("TO_CHAR(s.createdAt,'IW')", 'week')
            .addSelect("SUM(CASE WHEN s.movementType IN ('IN','RECEIPT','ADJUSTMENT_IN') THEN s.quantity ELSE 0 END)", 'inQty')
            .addSelect("SUM(CASE WHEN s.movementType IN ('OUT','ISSUE','ADJUSTMENT_OUT') THEN s.quantity ELSE 0 END)", 'outQty')
            .where('s.tenantId = :tenantId', t)
            .andWhere("s.createdAt > NOW() - INTERVAL '30 days'")
            .groupBy('week').orderBy('week', 'ASC').getRawMany(), []);
        const assetsByCategory = await safe(() => this.fixedAssetRepo.createQueryBuilder('a')
            .select('a.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .addSelect('COALESCE(SUM(a.currentBookValue),0)', 'value')
            .where('a.tenantId = :tenantId', t)
            .andWhere('a.isActive = true')
            .groupBy('a.category').getRawMany(), []);
        const assetCostVsDepr = await safe(() => this.fixedAssetRepo.createQueryBuilder('a')
            .select('a.category', 'category')
            .addSelect('COALESCE(SUM(a.currentBookValue),0)', 'bookValue')
            .addSelect('COALESCE(SUM(a.accumulatedDepreciation),0)', 'depreciation')
            .where('a.tenantId = :tenantId', t)
            .andWhere('a.isActive = true')
            .groupBy('a.category').getRawMany(), []);
        const assetCondition = await safe(() => this.fixedAssetRepo.createQueryBuilder('a')
            .select('a.condition', 'condition')
            .addSelect('COUNT(*)', 'count')
            .where('a.tenantId = :tenantId', t)
            .andWhere('a.isActive = true')
            .groupBy('a.condition').getRawMany(), []);
        const pipeline = await safe(() => this.quotationRepo.createQueryBuilder('q')
            .select('q.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .addSelect('COALESCE(SUM(q.totalAmount),0)', 'value')
            .where('q.tenantId = :tenantId', t)
            .groupBy('q.status').getRawMany(), []);
        const documentCounts = await safe(async () => ({
            quotations: await this.quotationRepo.count({ where: t }),
            invoices: await this.invoiceRepo.count({ where: t }),
            pos: await this.poRepo.count({ where: t }),
            grns: await this.grnRepo.count({ where: t }),
        }), { quotations: 0, invoices: 0, pos: 0, grns: 0 });
        const revenueByMonth = await safe(() => this.invoiceRepo.createQueryBuilder('i')
            .select("TO_CHAR(i.invoiceDate,'YYYY-MM')", 'month')
            .addSelect('COALESCE(SUM(i.totalAmount),0)', 'revenue')
            .where('i.tenantId = :tenantId', t)
            .andWhere("i.invoiceDate > NOW() - INTERVAL '6 months'")
            .groupBy('month').orderBy('month', 'ASC').getRawMany(), []);
        return {
            stockByType, topProducts, stockMovement,
            assetsByCategory, assetCostVsDepr, assetCondition,
            pipeline, documentCounts, revenueByMonth,
        };
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_entities_1.ChartOfAccountEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(sales_entities_1.SupplierEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(sales_entities_1.PurchaseOrderEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(sales_entities_1.PurchaseOrderItemEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(sales_entities_1.GoodsReceiptNoteEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(sales_entities_1.GoodsReceiptNoteItemEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(sales_entities_1.PurchaseInvoiceEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(sales_entities_1.PurchaseInvoiceItemEntity)),
    __param(8, (0, typeorm_1.InjectRepository)(sales_entities_1.PaymentVoucherEntity)),
    __param(9, (0, typeorm_1.InjectRepository)(sales_entities_1.PurchaseReturnEntity)),
    __param(10, (0, typeorm_1.InjectRepository)(sales_entities_1.PurchaseReturnItemEntity)),
    __param(11, (0, typeorm_1.InjectRepository)(sales_entities_1.JournalVoucherEntity)),
    __param(12, (0, typeorm_1.InjectRepository)(sales_entities_1.JournalVoucherLineEntity)),
    __param(13, (0, typeorm_1.InjectRepository)(sales_entities_1.WarehouseEntity)),
    __param(14, (0, typeorm_1.InjectRepository)(sales_entities_1.WarehouseLocationEntity)),
    __param(15, (0, typeorm_1.InjectRepository)(sales_entities_1.StockTransferEntity)),
    __param(16, (0, typeorm_1.InjectRepository)(sales_entities_1.StockTransferItemEntity)),
    __param(17, (0, typeorm_1.InjectRepository)(sales_entities_1.StockAdjustmentEntity)),
    __param(18, (0, typeorm_1.InjectRepository)(sales_entities_1.FixedAssetEntity)),
    __param(19, (0, typeorm_1.InjectRepository)(sales_entities_1.AssetDepreciationEntity)),
    __param(20, (0, typeorm_1.InjectRepository)(sales_entities_1.AssetMaintenanceEntity)),
    __param(21, (0, typeorm_1.InjectRepository)(sales_entities_1.AssetTransferEntity)),
    __param(22, (0, typeorm_1.InjectRepository)(sales_entities_1.StockAdjustmentItemEntity)),
    __param(23, (0, typeorm_1.InjectRepository)(sales_entities_1.ProductEntity)),
    __param(24, (0, typeorm_1.InjectRepository)(sales_entities_1.StockMovementEntity)),
    __param(25, (0, typeorm_1.InjectRepository)(sales_entities_1.ExchangeRateEntity)),
    __param(26, (0, typeorm_1.InjectRepository)(sales_entities_1.QuotationEntity)),
    __param(27, (0, typeorm_1.InjectRepository)(sales_entities_1.QuotationItemEntity)),
    __param(28, (0, typeorm_1.InjectRepository)(sales_entities_1.DeliveryNoteEntity)),
    __param(29, (0, typeorm_1.InjectRepository)(sales_entities_1.DeliveryNoteItemEntity)),
    __param(30, (0, typeorm_1.InjectRepository)(sales_entities_1.SalesInvoiceEntity)),
    __param(31, (0, typeorm_1.InjectRepository)(sales_entities_1.SalesInvoiceItemEntity)),
    __param(32, (0, typeorm_1.InjectRepository)(sales_entities_1.ReceiptEntity)),
    __param(33, (0, typeorm_1.InjectRepository)(sales_entities_1.SalesReturnEntity)),
    __param(34, (0, typeorm_1.InjectRepository)(sales_entities_1.SalesReturnItemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SalesService);
//# sourceMappingURL=sales.service.js.map