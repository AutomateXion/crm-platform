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
    constructor(coaRepo, supplierRepo, poRepo, poItemRepo, grnRepo, grnItemRepo, purchaseInvoiceRepo, purchaseInvoiceItemRepo, voucherRepo, purchaseReturnRepo, purchaseReturnItemRepo, productRepo, stockRepo, rateRepo, quotationRepo, quotationItemRepo, dnRepo, dnItemRepo, invoiceRepo, invoiceItemRepo, receiptRepo, returnRepo, returnItemRepo) {
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
        const count = await repo.count();
        return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
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
    async getQuotations(tenantId, page = 1, limit = 20, search, status) {
        const qb = this.quotationRepo.createQueryBuilder('q')
            .where('q.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(q.customerName ILIKE :s OR q.quotationNumber ILIKE :s OR q.subject ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('q.status = :status', { status });
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
        const { items } = dto, header = __rest(dto, ["items"]);
        const q = this.quotationRepo.create(Object.assign(Object.assign({}, header), { tenantId, quotationNumber: number, createdBy: userId }));
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
    async getDeliveryNotes(tenantId, page = 1, limit = 20, search, status) {
        const qb = this.dnRepo.createQueryBuilder('d')
            .where('d.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(d.customerName ILIKE :s OR d.dnNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('d.status = :status', { status });
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
        const { items } = dto, header = __rest(dto, ["items"]);
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
        return this.createDeliveryNote(tenantId, dto, userId);
    }
    async getInvoices(tenantId, page = 1, limit = 20, search, status) {
        const qb = this.invoiceRepo.createQueryBuilder('i')
            .where('i.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(i.customerName ILIKE :s OR i.invoiceNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('i.status = :status', { status });
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
        const { items } = dto, header = __rest(dto, ["items"]);
        const i = this.invoiceRepo.create(Object.assign(Object.assign({}, header), { tenantId, invoiceNumber: number, createdBy: userId, balanceDue: header.totalAmount }));
        const saved = await this.invoiceRepo.save(i);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.invoiceItemRepo.create(Object.assign(Object.assign({}, item), { invoiceId: saved.invoiceId, lineNumber: idx + 1 })));
            await this.invoiceItemRepo.save(lineItems);
        }
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
        return this.createInvoice(tenantId, dto, userId);
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
        const r = this.receiptRepo.create(Object.assign(Object.assign({}, dto), { tenantId, receiptNumber: number, createdBy: userId }));
        const saved = await this.receiptRepo.save(r);
        if (dto.invoiceId) {
            const invoice = await this.invoiceRepo.findOne({ where: { invoiceId: dto.invoiceId } });
            if (invoice) {
                const newPaid = Number(invoice.paidAmount) + Number(dto.amount);
                const newBalance = Number(invoice.totalAmount) - newPaid;
                const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
                await this.invoiceRepo.update({ invoiceId: dto.invoiceId }, {
                    paidAmount: newPaid, balanceDue: newBalance, status: newStatus,
                });
            }
        }
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
        const { items } = dto, header = __rest(dto, ["items"]);
        const r = this.returnRepo.create(Object.assign(Object.assign({}, header), { tenantId, returnNumber: number, createdBy: userId }));
        const saved = await this.returnRepo.save(r);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.returnItemRepo.create(Object.assign(Object.assign({}, item), { returnId: saved.returnId, lineNumber: idx + 1 })));
            await this.returnItemRepo.save(lineItems);
            if (dto.isInventory) {
                for (const item of items) {
                    if (item.productId) {
                        await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'RETURN', number, userId);
                    }
                }
            }
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
        const [totalQuotations, totalInvoices, totalReceipts, totalReturns, lowStockProducts] = await Promise.all([
            this.quotationRepo.count({ where: { tenantId } }),
            this.invoiceRepo.count({ where: { tenantId } }),
            this.receiptRepo.count({ where: { tenantId } }),
            this.returnRepo.count({ where: { tenantId } }),
            this.productRepo.createQueryBuilder('p')
                .where('p.tenantId = :tenantId', { tenantId })
                .andWhere('p.trackStock = true')
                .andWhere('p.stockQty <= p.minStockQty')
                .getCount(),
        ]);
        return { totalQuotations, totalInvoices, totalReceipts, totalReturns, lowStockProducts };
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
    async getPurchaseOrders(tenantId, page = 1, limit = 20, search, status) {
        const qb = this.poRepo.createQueryBuilder('p').where('p.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(p.supplierName ILIKE :s OR p.poNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('p.status = :status', { status });
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
        const { items } = dto, header = __rest(dto, ["items"]);
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
    async getGRNs(tenantId, page = 1, limit = 20, search, status) {
        const qb = this.grnRepo.createQueryBuilder('g').where('g.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(g.supplierName ILIKE :s OR g.grnNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('g.status = :status', { status });
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
        const number = await this.generateNumber('GRN', this.grnRepo, 'grnNumber');
        const { items } = dto, header = __rest(dto, ["items"]);
        const g = this.grnRepo.create(Object.assign(Object.assign({}, header), { tenantId, grnNumber: number, createdBy: userId }));
        const saved = await this.grnRepo.save(g);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.grnItemRepo.create(Object.assign(Object.assign({}, item), { grnId: saved.grnId, lineNumber: idx + 1 })));
            await this.grnItemRepo.save(lineItems);
            if (dto.isInventory) {
                for (const item of items) {
                    if (item.productId) {
                        await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'IN', number, userId);
                    }
                }
            }
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
        return this.getPurchaseInvoice(tenantId, saved.invoiceId);
    }
    async getPurchaseInvoices(tenantId, page = 1, limit = 20, search, status) {
        const qb = this.purchaseInvoiceRepo.createQueryBuilder('i').where('i.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(i.supplierName ILIKE :s OR i.invoiceNumber ILIKE :s)', { s: `%${search}%` });
        if (status)
            qb.andWhere('i.status = :status', { status });
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
        const { items } = dto, header = __rest(dto, ["items"]);
        const i = this.purchaseInvoiceRepo.create(Object.assign(Object.assign({}, header), { tenantId, invoiceNumber: number, createdBy: userId, balanceDue: header.totalAmount }));
        const saved = await this.purchaseInvoiceRepo.save(i);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.purchaseInvoiceItemRepo.create(Object.assign(Object.assign({}, item), { invoiceId: saved.invoiceId, lineNumber: idx + 1 })));
            await this.purchaseInvoiceItemRepo.save(lineItems);
        }
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
        return saved;
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
        const { items } = dto, header = __rest(dto, ["items"]);
        const r = this.purchaseReturnRepo.create(Object.assign(Object.assign({}, header), { tenantId, returnNumber: number, createdBy: userId }));
        const saved = await this.purchaseReturnRepo.save(r);
        if (items === null || items === void 0 ? void 0 : items.length) {
            const lineItems = items.map((item, idx) => this.purchaseReturnItemRepo.create(Object.assign(Object.assign({}, item), { returnId: saved.returnId, lineNumber: idx + 1 })));
            await this.purchaseReturnItemRepo.save(lineItems);
            if (dto.isInventory) {
                for (const item of items) {
                    if (item.productId) {
                        await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'OUT', number, userId);
                    }
                }
            }
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
    __param(11, (0, typeorm_1.InjectRepository)(sales_entities_1.ProductEntity)),
    __param(12, (0, typeorm_1.InjectRepository)(sales_entities_1.StockMovementEntity)),
    __param(13, (0, typeorm_1.InjectRepository)(sales_entities_1.ExchangeRateEntity)),
    __param(14, (0, typeorm_1.InjectRepository)(sales_entities_1.QuotationEntity)),
    __param(15, (0, typeorm_1.InjectRepository)(sales_entities_1.QuotationItemEntity)),
    __param(16, (0, typeorm_1.InjectRepository)(sales_entities_1.DeliveryNoteEntity)),
    __param(17, (0, typeorm_1.InjectRepository)(sales_entities_1.DeliveryNoteItemEntity)),
    __param(18, (0, typeorm_1.InjectRepository)(sales_entities_1.SalesInvoiceEntity)),
    __param(19, (0, typeorm_1.InjectRepository)(sales_entities_1.SalesInvoiceItemEntity)),
    __param(20, (0, typeorm_1.InjectRepository)(sales_entities_1.ReceiptEntity)),
    __param(21, (0, typeorm_1.InjectRepository)(sales_entities_1.SalesReturnEntity)),
    __param(22, (0, typeorm_1.InjectRepository)(sales_entities_1.SalesReturnItemEntity)),
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
        typeorm_2.Repository])
], SalesService);
//# sourceMappingURL=sales.service.js.map