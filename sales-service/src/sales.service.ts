import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import {
  ProductEntity, StockMovementEntity, ExchangeRateEntity,
  QuotationEntity, QuotationItemEntity,
  DeliveryNoteEntity, DeliveryNoteItemEntity,
  SalesInvoiceEntity, SalesInvoiceItemEntity,
  ReceiptEntity, SalesReturnEntity, SalesReturnItemEntity,
  ChartOfAccountEntity,
  SupplierEntity,
  PurchaseOrderEntity, PurchaseOrderItemEntity,
  GoodsReceiptNoteEntity, GoodsReceiptNoteItemEntity,
  PurchaseInvoiceEntity, PurchaseInvoiceItemEntity,
  PaymentVoucherEntity,
  PurchaseReturnEntity, PurchaseReturnItemEntity,
  JournalVoucherEntity, JournalVoucherLineEntity,
  WarehouseEntity, WarehouseLocationEntity,
  StockTransferEntity, StockTransferItemEntity,
  StockAdjustmentEntity, StockAdjustmentItemEntity,
  FixedAssetEntity, AssetDepreciationEntity, AssetMaintenanceEntity, AssetTransferEntity,
  DocumentSignatureEntity,
  BankAccountEntity, ChequeBookEntity, ChequeLeafEntity,
} from './sales.entities';

@Injectable()
export class SalesService {

  constructor(
    @InjectRepository(ChartOfAccountEntity) private coaRepo: Repository<ChartOfAccountEntity>,
    @InjectRepository(DocumentSignatureEntity) private sigRepo: Repository<DocumentSignatureEntity>,
    @InjectRepository(SupplierEntity) private supplierRepo: Repository<SupplierEntity>,
    @InjectRepository(PurchaseOrderEntity) private poRepo: Repository<PurchaseOrderEntity>,
    @InjectRepository(PurchaseOrderItemEntity) private poItemRepo: Repository<PurchaseOrderItemEntity>,
    @InjectRepository(GoodsReceiptNoteEntity) private grnRepo: Repository<GoodsReceiptNoteEntity>,
    @InjectRepository(GoodsReceiptNoteItemEntity) private grnItemRepo: Repository<GoodsReceiptNoteItemEntity>,
    @InjectRepository(PurchaseInvoiceEntity) private purchaseInvoiceRepo: Repository<PurchaseInvoiceEntity>,
    @InjectRepository(PurchaseInvoiceItemEntity) private purchaseInvoiceItemRepo: Repository<PurchaseInvoiceItemEntity>,
    @InjectRepository(PaymentVoucherEntity) private voucherRepo: Repository<PaymentVoucherEntity>,
    @InjectRepository(PurchaseReturnEntity) private purchaseReturnRepo: Repository<PurchaseReturnEntity>,
    @InjectRepository(PurchaseReturnItemEntity) private purchaseReturnItemRepo: Repository<PurchaseReturnItemEntity>,
    @InjectRepository(JournalVoucherEntity) private jvRepo: Repository<JournalVoucherEntity>,
    @InjectRepository(JournalVoucherLineEntity) private jvLineRepo: Repository<JournalVoucherLineEntity>,
    @InjectRepository(WarehouseEntity) private warehouseRepo: Repository<WarehouseEntity>,
    @InjectRepository(WarehouseLocationEntity) private locationRepo: Repository<WarehouseLocationEntity>,
    @InjectRepository(StockTransferEntity) private transferRepo: Repository<StockTransferEntity>,
    @InjectRepository(StockTransferItemEntity) private transferItemRepo: Repository<StockTransferItemEntity>,
    @InjectRepository(StockAdjustmentEntity) private adjustmentRepo: Repository<StockAdjustmentEntity>,
    @InjectRepository(FixedAssetEntity) private fixedAssetRepo: Repository<FixedAssetEntity>,
    @InjectRepository(BankAccountEntity) private bankAccountRepo: Repository<BankAccountEntity>,
    @InjectRepository(ChequeBookEntity) private chequeBookRepo: Repository<ChequeBookEntity>,
    @InjectRepository(ChequeLeafEntity) private chequeLeafRepo: Repository<ChequeLeafEntity>,
    @InjectRepository(AssetDepreciationEntity) private assetDeprRepo: Repository<AssetDepreciationEntity>,
    @InjectRepository(AssetMaintenanceEntity) private assetMaintRepo: Repository<AssetMaintenanceEntity>,
    @InjectRepository(AssetTransferEntity) private assetTransferRepo: Repository<AssetTransferEntity>,
    @InjectRepository(StockAdjustmentItemEntity) private adjustmentItemRepo: Repository<StockAdjustmentItemEntity>,
    @InjectRepository(ProductEntity) private productRepo: Repository<ProductEntity>,
    @InjectRepository(StockMovementEntity) private stockRepo: Repository<StockMovementEntity>,
    @InjectRepository(ExchangeRateEntity) private rateRepo: Repository<ExchangeRateEntity>,
    @InjectRepository(QuotationEntity) private quotationRepo: Repository<QuotationEntity>,
    @InjectRepository(QuotationItemEntity) private quotationItemRepo: Repository<QuotationItemEntity>,
    @InjectRepository(DeliveryNoteEntity) private dnRepo: Repository<DeliveryNoteEntity>,
    @InjectRepository(DeliveryNoteItemEntity) private dnItemRepo: Repository<DeliveryNoteItemEntity>,
    @InjectRepository(SalesInvoiceEntity) private invoiceRepo: Repository<SalesInvoiceEntity>,
    @InjectRepository(SalesInvoiceItemEntity) private invoiceItemRepo: Repository<SalesInvoiceItemEntity>,
    @InjectRepository(ReceiptEntity) private receiptRepo: Repository<ReceiptEntity>,
    @InjectRepository(SalesReturnEntity) private returnRepo: Repository<SalesReturnEntity>,
    @InjectRepository(SalesReturnItemEntity) private returnItemRepo: Repository<SalesReturnItemEntity>,
  ) {}

  // ── Document Number Generator ─────────────────────────────────
  private async generateNumber(prefix: string, repo: Repository<any>, field: string): Promise<string> {
    const year = new Date().getFullYear();
    const pattern = `${prefix}-${year}-%`;
    const result = await repo.createQueryBuilder('e')
      .select(`MAX(e.${field})`, 'maxNum')
      .where(`e.${field} LIKE :pattern`, { pattern })
      .getRawOne();
    const maxNum = result?.maxNum;
    let next = 1;
    if (maxNum) {
      const parts = maxNum.split('-');
      const last = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(last)) next = last + 1;
    }
    return `${prefix}-${year}-${String(next).padStart(4, '0')}`;
  }

  // ── Products ──────────────────────────────────────────────────
  async getProducts(tenantId: string, page = 1, limit = 20, search?: string, category?: string) {
    const qb = this.productRepo.createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId })
      .andWhere('p.isActive = true');
    if (search) {
      const fields = await this.resolveProductSearchFields(tenantId);
      const ors = fields.map((f) => `p.${f} ILIKE :s`).join(' OR ');
      qb.andWhere(`(${ors})`, { s: `%${search}%` });
    }
    if (category) qb.andWhere('p.category = :category', { category });
    qb.orderBy('p.productName', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getProduct(tenantId: string, id: string) {
    const p = await this.productRepo.findOne({ where: { productId: id, tenantId } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  // Locations where a product currently has stock (for transfer/adjustment From-Location pickers)
  async getProductStockLocations(tenantId: string, productId: string) {
    const rows = await this.productRepo.query(
      `SELECT pws.location_id::text as "locationId", pws.warehouse_id::text as "warehouseId",
              pws.warehouse_name as "warehouseName",
              COALESCE(wl.location_code, pws.location_code) as "locationCode",
              wl.zone, wl.rack, wl.shelf, wl.bin,
              pws.quantity as "quantity", pws.available_qty as "availableQty", pws.reserved_qty as "reservedQty"
       FROM product_warehouse_stock pws
       LEFT JOIN warehouse_locations wl ON wl.location_id = pws.location_id
       WHERE pws.tenant_id::text = $1 AND pws.product_id::text = $2 AND pws.quantity > 0
       ORDER BY pws.quantity DESC`,
      [tenantId, productId]
    );
    return rows.map((r: any) => {
      const pathParts = [r.zone, r.rack, r.shelf, r.bin].filter(Boolean);
      const path = pathParts.length ? pathParts.join(' / ') : (r.locationCode || 'Unassigned');
      return {
        locationId: r.locationId, warehouseId: r.warehouseId, warehouseName: r.warehouseName,
        locationCode: r.locationCode, path,
        quantity: Number(r.quantity || 0), availableQty: Number(r.availableQty || r.quantity || 0),
        reservedQty: Number(r.reservedQty || 0),
        label: `${path} — ${Number(r.availableQty || r.quantity || 0).toFixed(3)} avail`,
      };
    });
  }

  async createProduct(tenantId: string, dto: any, userId: string) {
    const p = this.productRepo.create({ ...dto, tenantId, createdBy: userId }) as any;
    const saved = await this.productRepo.save(p) as any;
    await this.syncProductLocationStock(tenantId, saved.productId);
    return saved;
  }

  async updateProduct(tenantId: string, id: string, dto: any) {
    await this.productRepo.update({ productId: id, tenantId }, dto);
    await this.syncProductLocationStock(tenantId, id);
    return this.getProduct(tenantId, id);
  }

  async syncProductLocationStock(tenantId: string, productId: string) {
    try {
      const rows = await this.productRepo.query(
        `SELECT p.stock_qty, p.location_id::text as location_id, wl.warehouse_id::text as warehouse_id,
                wl.location_code, w.warehouse_name
         FROM products p
         JOIN warehouse_locations wl ON wl.location_id = p.location_id
         JOIN warehouses w ON w.warehouse_id = wl.warehouse_id
         WHERE p.product_id::text = $1 AND p.tenant_id::text = $2 AND p.location_id IS NOT NULL`,
        [productId, tenantId]
      );
      if (!rows.length) return;
      const r = rows[0];
      const stockQty = Number(r.stock_qty || 0);
      if (stockQty <= 0) return;
      const existing = await this.productRepo.query(
        `SELECT COALESCE(SUM(quantity),0) as total FROM product_warehouse_stock WHERE product_id::text = $1 AND quantity > 0`,
        [productId]
      );
      const ledgerTotal = Number(existing[0]?.total || 0);
      if (ledgerTotal > 0) return;
      await this.productRepo.query(
        `INSERT INTO product_warehouse_stock (tenant_id, product_id, warehouse_id, warehouse_name, location_id, location_code, quantity, available_qty)
         VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, $6, $7, $7)
         ON CONFLICT (product_id, warehouse_id, location_id)
         DO UPDATE SET quantity = EXCLUDED.quantity, available_qty = EXCLUDED.quantity, updated_at = now()`,
        [tenantId, productId, r.warehouse_id, r.warehouse_name, r.location_id, r.location_code, stockQty]
      );
    } catch (e) { console.warn('syncProductLocationStock failed:', (e as any)?.message); }
  }

  async deleteProduct(tenantId: string, id: string) {
    await this.productRepo.update({ productId: id, tenantId }, { isActive: false });
    return { success: true };
  }

  async adjustStock(tenantId: string, productId: string, qty: number, type: string, ref: string, userId: string, warehouseLocationId?: string, unitCost?: number) {
    const qtyNum = Number(qty);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      throw new BadRequestException(`Invalid quantity for stock movement (product ${productId}, type ${type}): received "${qty}"`);
    }
    qty = qtyNum;
    const product = await this.getProduct(tenantId, productId);
    const isInbound = type === 'IN' || type === 'RETURN' || type === 'SALES_RETURN';

    // Determine the cost of this movement
    let movementUnitCost = Number(unitCost ?? 0);
    let issueCost = 0; // total COGS for OUT movements
    if (isInbound) {
      // Use provided cost, else fall back to product cost_price
      if (!movementUnitCost) movementUnitCost = Number(product.costPrice || 0);
    } else {
      // OUT: compute issue cost per costing method
      const computed = await this.computeIssueCost(tenantId, productId, qty);
      issueCost = computed.totalCost;
      movementUnitCost = qty > 0 ? issueCost / qty : 0;
    }

    const movement = this.stockRepo.create({
      tenantId, productId, movementType: type, quantity: qty,
      referenceNumber: ref, createdBy: userId, unitCost: movementUnitCost,
      ...(warehouseLocationId ? { warehouseId: warehouseLocationId } : {}),
    });
    await this.stockRepo.save(movement);

    const newQty = isInbound
      ? Number(product.stockQty) + qty
      : Number(product.stockQty) - qty;
    await this.productRepo.update({ productId }, { stockQty: newQty });

    // Cost layers + average cost maintenance
    try {
      if (isInbound) {
        await this.createCostLayer(tenantId, productId, qty, movementUnitCost, warehouseLocationId, type, ref);
        await this.recomputeAverageCost(tenantId, productId);
      }
      // (OUT layer consumption already done inside computeIssueCost)
    } catch (e) { console.warn('Cost layer update failed:', (e as any)?.message); }

    // Maintain per-location stock ledger (product_warehouse_stock)
    try {
      if (isInbound) {
        await this.addLocationStock(tenantId, productId, warehouseLocationId, qty);
      } else {
        await this.deductLocationStock(tenantId, productId, qty);
      }
    } catch (e) { console.warn('Location stock update failed:', (e as any)?.message); }

    return { ...movement, issueCost } as any;
  }

  // ── Stock Costing Engine ───────────────────────────────────────
  async getCostingMethod(tenantId: string): Promise<string> {
    try {
      const rows = await this.productRepo.query(
        `SELECT costing_method FROM tenants WHERE tenant_id::text = $1`, [tenantId]
      );
      return rows[0]?.costing_method || 'WEIGHTED_AVG';
    } catch { return 'WEIGHTED_AVG'; }
  }

  async createCostLayer(tenantId: string, productId: string, qty: number, unitCost: number, locationId: string | undefined, refType: string, refNum: string) {
    if (qty <= 0) return;
    await this.productRepo.query(
      `INSERT INTO stock_cost_layers (tenant_id, product_id, location_id, original_qty, remaining_qty, unit_cost, reference_type, reference_number)
       VALUES ($1, $2, $3, $4, $4, $5, $6, $7)`,
      [tenantId, productId, locationId || null, qty, unitCost, refType, refNum]
    );
  }

  // Compute the cost of issuing `qty` of a product, consuming layers (FIFO) or using average (AVCO)
  async computeIssueCost(tenantId: string, productId: string, qty: number): Promise<{ totalCost: number, method: string }> {
    const method = await this.getCostingMethod(tenantId);
    if (qty <= 0) return { totalCost: 0, method };

    if (method === 'FIFO') {
      // Consume oldest layers first
      const layers = await this.productRepo.query(
        `SELECT layer_id, remaining_qty, unit_cost FROM stock_cost_layers
         WHERE tenant_id = $1 AND product_id = $2 AND remaining_qty > 0
         ORDER BY received_at ASC, created_at ASC`,
        [tenantId, productId]
      );
      let remaining = qty;
      let totalCost = 0;
      for (const layer of layers) {
        if (remaining <= 0) break;
        const take = Math.min(Number(layer.remaining_qty), remaining);
        totalCost += take * Number(layer.unit_cost);
        await this.productRepo.query(
          `UPDATE stock_cost_layers SET remaining_qty = remaining_qty - $1 WHERE layer_id = $2`,
          [take, layer.layer_id]
        );
        remaining -= take;
      }
      // If layers insufficient, value the shortfall at last known cost (or product cost_price)
      if (remaining > 0) {
        const fallback = await this.productRepo.query(
          `SELECT COALESCE(avg_cost, cost_price, 0) as c FROM products WHERE product_id::text = $1`, [productId]
        );
        totalCost += remaining * Number(fallback[0]?.c || 0);
      }
      return { totalCost: Number(totalCost.toFixed(3)), method };
    } else {
      // Weighted Average: qty * current avg_cost
      const rows = await this.productRepo.query(
        `SELECT COALESCE(avg_cost, cost_price, 0) as avg_cost FROM products WHERE product_id::text = $1`, [productId]
      );
      const avg = Number(rows[0]?.avg_cost || 0);
      // Also reduce FIFO layers proportionally so valuation report stays consistent
      await this.consumeLayersFIFOSilent(tenantId, productId, qty);
      return { totalCost: Number((qty * avg).toFixed(3)), method };
    }
  }

  // For AVCO: still consume layers oldest-first so remaining_qty reflects on-hand (valuation uses avg though)
  async consumeLayersFIFOSilent(tenantId: string, productId: string, qty: number) {
    const layers = await this.productRepo.query(
      `SELECT layer_id, remaining_qty FROM stock_cost_layers
       WHERE tenant_id = $1 AND product_id = $2 AND remaining_qty > 0
       ORDER BY received_at ASC, created_at ASC`,
      [tenantId, productId]
    );
    let remaining = qty;
    for (const layer of layers) {
      if (remaining <= 0) break;
      const take = Math.min(Number(layer.remaining_qty), remaining);
      await this.productRepo.query(
        `UPDATE stock_cost_layers SET remaining_qty = remaining_qty - $1 WHERE layer_id = $2`,
        [take, layer.layer_id]
      );
      remaining -= take;
    }
  }

  // Recompute weighted-average cost from remaining layers
  async recomputeAverageCost(tenantId: string, productId: string) {
    const rows = await this.productRepo.query(
      `SELECT COALESCE(SUM(remaining_qty * unit_cost),0) as total_val, COALESCE(SUM(remaining_qty),0) as total_qty
       FROM stock_cost_layers WHERE tenant_id = $1 AND product_id = $2 AND remaining_qty > 0`,
      [tenantId, productId]
    );
    const totalQty = Number(rows[0]?.total_qty || 0);
    const totalVal = Number(rows[0]?.total_val || 0);
    const avg = totalQty > 0 ? totalVal / totalQty : 0;
    await this.productRepo.query(
      `UPDATE products SET avg_cost = $1 WHERE product_id::text = $2`, [Number(avg.toFixed(3)), productId]
    );
  }

  // ── Stock Valuation Report ─────────────────────────────────────
  async getStockValuation(tenantId: string, q: any = {}) {
    const method = await this.getCostingMethod(tenantId);
    // Per-product on-hand qty (from products.stock_qty), avg cost, and FIFO layer value
    const rows = await this.productRepo.query(
      `SELECT p.product_id::text as "productId", p.product_code as "productCode",
              p.product_name as "productName", p.category, p.unit_of_measure as "unitOfMeasure",
              COALESCE(p.stock_qty,0) as "qtyOnHand",
              COALESCE(p.avg_cost,0) as "avgCost",
              COALESCE(p.cost_price,0) as "costPrice",
              COALESCE((SELECT SUM(remaining_qty * unit_cost) FROM stock_cost_layers scl
                        WHERE scl.tenant_id = p.tenant_id::text AND scl.product_id = p.product_id::text AND scl.remaining_qty > 0),0) as "fifoValue",
              COALESCE((SELECT SUM(remaining_qty) FROM stock_cost_layers scl2
                        WHERE scl2.tenant_id = p.tenant_id::text AND scl2.product_id = p.product_id::text AND scl2.remaining_qty > 0),0) as "fifoQty"
       FROM products p
       WHERE p.tenant_id::text = $1 AND p.is_active = true
         AND (p.product_type = 'STOCK' OR p.is_inventory_item = true)
         AND COALESCE(p.stock_qty,0) <> 0
       ORDER BY p.product_name`,
      [tenantId]
    );

    let totalValue = 0;
    const items = rows.map((r: any) => {
      const qty = Number(r.qtyOnHand);
      const avgCost = Number(r.avgCost);
      const fifoValue = Number(r.fifoValue);
      // Valuation per method
      const value = method === 'FIFO'
        ? fifoValue
        : Number((qty * avgCost).toFixed(3));
      totalValue += value;
      const unitValue = qty !== 0 ? value / qty : 0;
      return {
        productId: r.productId, productCode: r.productCode, productName: r.productName,
        category: r.category, unitOfMeasure: r.unitOfMeasure,
        qtyOnHand: qty, avgCost, costPrice: Number(r.costPrice),
        unitValue: Number(unitValue.toFixed(3)),
        totalValue: Number(value.toFixed(3)),
        fifoQty: Number(r.fifoQty),
      };
    });

    return {
      method,
      asOf: new Date().toISOString(),
      totalValue: Number(totalValue.toFixed(3)),
      itemCount: items.length,
      items,
    };
  }

  // ── Location Stock Ledger ──────────────────────────────────────
  // Resolve the warehouse_id for a given location
  private async resolveWarehouseForLocation(locationId: string): Promise<{ warehouseId: string, locationCode: string, warehouseName: string } | null> {
    const rows = await this.productRepo.query(
      `SELECT wl.warehouse_id::text as warehouse_id, wl.location_code, w.warehouse_name
       FROM warehouse_locations wl JOIN warehouses w ON w.warehouse_id = wl.warehouse_id
       WHERE wl.location_id::text = $1`, [locationId]
    );
    return rows.length ? rows[0] : null;
  }

  // Add stock to a specific location (upsert)
  async addLocationStock(tenantId: string, productId: string, locationId: string | undefined, qty: number) {
    // Determine target location: provided, else product's default location
    let targetLocation = locationId;
    if (!targetLocation) {
      const prodRows = await this.productRepo.query(
        `SELECT location_id::text as location_id FROM products WHERE product_id::text = $1 AND location_id IS NOT NULL`, [productId]
      );
      targetLocation = prodRows.length ? prodRows[0].location_id : undefined;
    }
    if (!targetLocation) return; // no location to assign — skip (counts as unassigned)
    const loc = await this.resolveWarehouseForLocation(targetLocation);
    if (!loc) return;
    await this.productRepo.query(
      `INSERT INTO product_warehouse_stock (tenant_id, product_id, warehouse_id, warehouse_name, location_id, location_code, quantity, available_qty)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, $6, $7, $7)
       ON CONFLICT (product_id, warehouse_id, location_id)
       DO UPDATE SET quantity = product_warehouse_stock.quantity + $7,
         available_qty = product_warehouse_stock.quantity + $7 - product_warehouse_stock.reserved_qty,
         updated_at = now()`,
      [tenantId, productId, loc.warehouseId, loc.warehouseName, targetLocation, loc.locationCode, qty]
    );
  }

  // Deduct stock: default location first, then overflow in hierarchy order (zone->rack->shelf->bin)
  async deductLocationStock(tenantId: string, productId: string, qty: number) {
    let remaining = qty;
    // Get product's default location to prioritize
    const prodRows = await this.productRepo.query(
      `SELECT location_id::text as location_id FROM products WHERE product_id::text = $1`, [productId]
    );
    const defaultLoc = prodRows.length ? prodRows[0].location_id : null;
    // Fetch all locations holding this product, default first, then hierarchy order
    const stockRows = await this.productRepo.query(
      `SELECT pws.stock_id::text as stock_id, pws.location_id::text as location_id, pws.quantity
       FROM product_warehouse_stock pws
       JOIN warehouse_locations wl ON wl.location_id = pws.location_id
       WHERE pws.tenant_id::text = $1 AND pws.product_id::text = $2 AND pws.quantity > 0
       ORDER BY
         CASE WHEN pws.location_id::text = $3 THEN 0 ELSE 1 END,
         wl.zone NULLS FIRST, wl.rack NULLS FIRST, wl.shelf NULLS FIRST, wl.bin NULLS FIRST`,
      [tenantId, productId, defaultLoc || '00000000-0000-0000-0000-000000000000']
    );
    for (const row of stockRows) {
      if (remaining <= 0) break;
      const avail = Number(row.quantity);
      const take = Math.min(avail, remaining);
      await this.productRepo.query(
        `UPDATE product_warehouse_stock SET quantity = quantity - $1,
           available_qty = quantity - $1 - reserved_qty, updated_at = now()
         WHERE stock_id::text = $2`,
        [take, row.stock_id]
      );
      remaining -= take;
    }
    // If remaining > 0, stock went negative somewhere — log it (oversell / untracked location)
    if (remaining > 0) {
      console.warn(`Location stock short by ${remaining} for product ${productId} — deducted from available locations only`);
    }
  }

  async getStockMovements(tenantId: string, productId?: string) {
    const where: any = { tenantId };
    if (productId) where.productId = productId;
    return this.stockRepo.find({ where, order: { createdAt: 'DESC' }, take: 100 });
  }

  // ── Exchange Rates ─────────────────────────────────────────────
  async getExchangeRates(tenantId: string) {
    return this.rateRepo.find({ where: { tenantId, isActive: true }, order: { fromCurrency: 'ASC', effectiveDate: 'DESC' } });
  }

  async createExchangeRate(tenantId: string, dto: any, userId: string) {
    const r = this.rateRepo.create({ ...dto, tenantId, createdBy: userId });
    return this.rateRepo.save(r);
  }

  async updateExchangeRate(tenantId: string, id: string, dto: any) {
    await this.rateRepo.update({ rateId: id, tenantId }, dto);
    return this.rateRepo.findOne({ where: { rateId: id } });
  }

  async deleteExchangeRate(tenantId: string, id: string) {
    await this.rateRepo.update({ rateId: id, tenantId }, { isActive: false });
    return { success: true };
  }

  // ── Quotations ────────────────────────────────────────────────
  async getQuotations(tenantId: string, page = 1, limit = 20, search?: string, status?: string, excludeConverted = false) {
    const qb = this.quotationRepo.createQueryBuilder('q')
      .where('q.tenantId = :tenantId', { tenantId });
    if (search) qb.andWhere('(q.customerName ILIKE :s OR q.quotationNumber ILIKE :s OR q.subject ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('q.status = :status', { status });
    if (excludeConverted) qb.andWhere("q.status NOT IN ('CONVERTED', 'CANCELLED')");
    qb.orderBy('q.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getQuotation(tenantId: string, id: string) {
    const q = await this.quotationRepo.findOne({ where: { quotationId: id, tenantId }, relations: ['items'] });
    if (!q) throw new NotFoundException('Quotation not found');
    return q;
  }

  async createQuotation(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('QUO', this.quotationRepo, 'quotationNumber');
    const { items, quotationNumber: _qn, ...header } = dto;
    const q = this.quotationRepo.create({ ...header, tenantId, quotationNumber: number, createdBy: userId, status: header.status || 'DRAFT' });
    const saved = await this.quotationRepo.save(q) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.quotationItemRepo.create({ ...item, quotationId: saved.quotationId, lineNumber: idx + 1 })
      );
      await this.quotationItemRepo.save(lineItems);
    }
    return this.getQuotation(tenantId, saved.quotationId);
  }

  async updateQuotation(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.quotationRepo.update({ quotationId: id, tenantId }, header);
    if (items) {
      await this.quotationItemRepo.delete({ quotationId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.quotationItemRepo.create({ ...item, quotationId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.quotationItemRepo.save(lineItems);
    }
    return this.getQuotation(tenantId, id);
  }

  async deleteQuotation(tenantId: string, id: string) {
    await this.quotationRepo.delete({ quotationId: id, tenantId });
    return { success: true };
  }

  // ── Delivery Notes ────────────────────────────────────────────
  async getDeliveryNotes(tenantId: string, page = 1, limit = 20, search?: string, status?: string, excludeInvoiced = false) {
    const qb = this.dnRepo.createQueryBuilder('d')
      .where('d.tenantId = :tenantId', { tenantId });
    if (search) qb.andWhere('(d.customerName ILIKE :s OR d.dnNumber ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('d.status = :status', { status });
    if (excludeInvoiced) qb.andWhere("d.status NOT IN ('INVOICED', 'CANCELLED', 'CONVERTED')");
    qb.orderBy('d.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getDeliveryNote(tenantId: string, id: string) {
    const d = await this.dnRepo.findOne({ where: { dnId: id, tenantId }, relations: ['items'] });
    if (!d) throw new NotFoundException('Delivery Note not found');
    return d;
  }

  // ── Negative-stock guard ─────────────────────────────────────
  // Returns true if the user may override the negative-stock block (super admin or TENANT_ADMIN).
  async userCanOverrideStock(tenantId: string, userId: string): Promise<boolean> {
    try {
      const rows = await this.productRepo.query(
        `SELECT u.is_super_admin, ug.group_code
         FROM users u LEFT JOIN user_groups ug ON ug.user_group_id = u.user_group_id
         WHERE u.user_id::text = $1 AND u.tenant_id::text = $2`,
        [userId, tenantId]
      );
      const u = rows?.[0];
      return !!(u && (u.is_super_admin === true || u.group_code === 'TENANT_ADMIN'));
    } catch { return false; }
  }

  // Blocks a stock-reducing sale that would drive any tracked product below zero,
  // naming each short product. An admin may override via allowNegativeStock.
  async checkNegativeStock(tenantId: string, items: any[], allowNegativeStock: boolean, userId: string) {
    if (!items?.length) return;
    const shortfalls: string[] = [];
    for (const item of items) {
      if (!item.productId) continue;
      const rows = await this.productRepo.query(
        `SELECT product_name, stock_qty, track_stock FROM products WHERE product_id::text = $1 AND tenant_id::text = $2`,
        [item.productId, tenantId]
      );
      const prod = rows?.[0];
      if (prod && prod.track_stock === true) {
        const available = Number(prod.stock_qty || 0);
        const requested = Number(item.quantity || 0);
        if (available - requested < 0) {
          shortfalls.push(`"${prod.product_name}" (available ${available}, requested ${requested})`);
        }
      }
    }
    if (shortfalls.length) {
      if (allowNegativeStock && await this.userCanOverrideStock(tenantId, userId)) return; // admin override honoured
      throw new BadRequestException(
        `Cannot proceed — insufficient stock for: ${shortfalls.join('; ')}. An administrator can override this rule.`
      );
    }
  }

  // ── Backend Credit Guard ─────────────────────────────────────
  async enforceCreditLimit(tenantId: string, customerName: string, accountId?: string, newAmount: number = 0) {
    if (!customerName && !accountId) return;
    try {
      // Get account
      let accRows: any[];
      if (accountId) {
        accRows = await this.invoiceRepo.query(
          `SELECT account_id::text as id, account_name, credit_limit, credit_period_days, credit_blocked, credit_block_override, credit_block_reason
           FROM accounts WHERE account_id::text = $1 AND tenant_id::text = $2`,
          [accountId, tenantId]
        );
      } else {
        accRows = await this.invoiceRepo.query(
          `SELECT account_id::text as id, account_name, credit_limit, credit_period_days, credit_blocked, credit_block_override, credit_block_reason
           FROM accounts WHERE account_name ILIKE $1 AND tenant_id::text = $2 LIMIT 1`,
          [customerName, tenantId]
        );
      }
      if (!accRows.length) return; // unknown customer, allow
      const acc = accRows[0];

      // Check manual block
      if (acc.credit_blocked && !acc.credit_block_override) {
        throw new BadRequestException(`Customer "${acc.account_name}" is credit blocked. Reason: ${acc.credit_block_reason || 'Contact Administrator'}. Please settle outstanding dues or contact Administrator.`);
      }

      const creditLimit = Number(acc.credit_limit || 0);
      const creditPeriodDays = Number(acc.credit_period_days || 30);
      if (creditLimit === 0 && creditPeriodDays === 0) return; // no credit control

      // Get current outstanding
      const balRows = await this.invoiceRepo.query(
        `SELECT COALESCE(SUM(balance_due), 0) as outstanding
         FROM sales_invoices
         WHERE tenant_id = $1
         AND (account_id::text = $2 OR customer_name ILIKE $3)
         AND status NOT IN ('CANCELLED','DRAFT','PAID')`,
        [tenantId, acc.id || '', customerName]
      );
      const outstanding = Number(balRows[0]?.outstanding || 0);

      // Check credit limit (existing outstanding + new document value)
      const projectedTotal = outstanding + Number(newAmount || 0);
      if (creditLimit > 0 && projectedTotal > creditLimit) {
        const newAmtMsg = newAmount > 0 ? ` This document (OMR ${Number(newAmount).toFixed(3)}) would bring total exposure to OMR ${projectedTotal.toFixed(3)}.` : '';
        throw new BadRequestException(`Credit limit exceeded for "${acc.account_name}". Current outstanding: OMR ${outstanding.toFixed(3)}, Limit: OMR ${creditLimit.toFixed(3)}.${newAmtMsg} Please settle dues or increase credit limit.`);
      }

      // Check overdue
      const overdueRows = await this.invoiceRepo.query(
        `SELECT COUNT(*) as cnt FROM sales_invoices
         WHERE tenant_id = $1
         AND (account_id::text = $2 OR customer_name ILIKE $3)
         AND status NOT IN ('PAID','CANCELLED','DRAFT')
         AND due_date < CURRENT_DATE`,
        [tenantId, acc.id || '', customerName]
      );
      const overdueCount = Number(overdueRows[0]?.cnt || 0);
      if (overdueCount > 0) {
        throw new BadRequestException(`"${acc.account_name}" has ${overdueCount} overdue invoice(s). Please clear overdue balances before creating new documents.`);
      }
    } catch(e: any) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      // DB/other errors — log but don't block
      console.warn('Credit guard error:', e?.message);
    }
  }

  async createDeliveryNote(tenantId: string, dto: any, userId: string) {
    await this.enforceCreditLimit(tenantId, dto.customerName, dto.accountId, Number(dto.totalAmount || 0));
    // Negative-stock guard (only when this DN actually reduces inventory).
    if (dto.isInventory) {
      await this.checkNegativeStock(tenantId, dto.items, dto.allowNegativeStock === true, userId);
    }
    const number = await this.generateNumber('DN', this.dnRepo, 'dnNumber');
    const { items, dnNumber: _dn, invoiceNumber: _in, quotationNumber: _qn, ...header } = dto;
    const d = this.dnRepo.create({ ...header, tenantId, dnNumber: number, createdBy: userId });
    const saved = await this.dnRepo.save(d) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.dnItemRepo.create({ ...item, dnId: saved.dnId, lineNumber: idx + 1 })
      );
      await this.dnItemRepo.save(lineItems);
      // Update stock if inventory mode + accumulate COGS
      if (dto.isInventory) {
        let totalCOGS = 0;
        for (const item of items) {
          if (item.productId) {
            const res: any = await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'OUT', number, userId);
            totalCOGS += Number(res?.issueCost || 0);
          }
        }
        // Auto-post COGS journal: Dr 5001 COGS / Cr 1140 Inventory at computed cost
        if (totalCOGS > 0) {
          const dnDate = (dto.dnDate || dto.deliveryDate || new Date().toISOString()).slice(0, 10);
          await this.createAutoJournalEntry(tenantId, userId, {
            voucherNumber: number,
            description: `COGS - Delivery ${number}${header.customerName ? ' - ' + header.customerName : ''}`,
            voucherDate: dnDate,
            lines: [
              { accountCode: '5001', description: `COGS - ${number}`, debitAmount: Number(totalCOGS.toFixed(3)), creditAmount: 0 },
              { accountCode: '1140', description: `Inventory issue - ${number}`, debitAmount: 0, creditAmount: Number(totalCOGS.toFixed(3)) },
            ],
          });
        }
      }
    }
    // Mark linked Quotation as CONVERTED
    if (header.quotationId) await this.quotationRepo.update({ quotationId: header.quotationId, tenantId }, { status: 'CONVERTED' } as any);
    return this.getDeliveryNote(tenantId, saved.dnId);
  }

  async updateDeliveryNote(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.dnRepo.update({ dnId: id, tenantId }, header);
    if (items) {
      await this.dnItemRepo.delete({ dnId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.dnItemRepo.create({ ...item, dnId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.dnItemRepo.save(lineItems);
    }
    return this.getDeliveryNote(tenantId, id);
  }

  async deleteDeliveryNote(tenantId: string, id: string) {
    await this.dnRepo.delete({ dnId: id, tenantId });
    return { success: true };
  }

  // Convert Quotation to Delivery Note
  async convertQuotationToDN(tenantId: string, quotationId: string, userId: string) {
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
    // Mark quotation as CONVERTED
    await this.quotationRepo.update({ quotationId, tenantId }, { status: 'CONVERTED' } as any);
    return dn;
  }

  // ── Sales Invoices ────────────────────────────────────────────
  async getInvoices(tenantId: string, page = 1, limit = 20, search?: string, status?: string, excludePaid = false) {
    const qb = this.invoiceRepo.createQueryBuilder('i')
      .where('i.tenantId = :tenantId', { tenantId });
    if (search) qb.andWhere('(i.customerName ILIKE :s OR i.invoiceNumber ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('i.status = :status', { status });
    if (excludePaid) qb.andWhere("i.status NOT IN ('PAID', 'CANCELLED')");
    qb.orderBy('i.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getInvoice(tenantId: string, id: string) {
    const i = await this.invoiceRepo.findOne({ where: { invoiceId: id, tenantId }, relations: ['items'] });
    if (!i) throw new NotFoundException('Invoice not found');
    return i;
  }

  async createInvoice(tenantId: string, dto: any, userId: string) {
    await this.enforceCreditLimit(tenantId, dto.customerName, dto.accountId, Number(dto.totalAmount || 0));
    // Negative-stock guard: only for direct invoices (DN-sourced already shipped the goods).
    if (!dto.dnId && dto.isInventory !== false) {
      await this.checkNegativeStock(tenantId, dto.items, dto.allowNegativeStock === true, userId);
    }
    const number = await this.generateNumber('INV', this.invoiceRepo, 'invoiceNumber');
    const { items, invoiceNumber: _in, dnNumber: _dn, quotationNumber: _qn, receiptNumber: _rn, ...header } = dto;
    const balanceDue = Number(header.totalAmount) || 0;
    // Auto-set due date if not provided: invoice date + customer credit period (default 30 days)
    if (!header.dueDate) {
      let creditDays = 30;
      try {
        const accId = header.accountId || null;
        const acc = accId
          ? await this.invoiceRepo.query(`SELECT credit_period_days FROM accounts WHERE account_id::text = $1 AND tenant_id::text = $2`, [accId, tenantId])
          : (header.customerName ? await this.invoiceRepo.query(`SELECT credit_period_days FROM accounts WHERE account_name ILIKE $1 AND tenant_id::text = $2 LIMIT 1`, [header.customerName, tenantId]) : []);
        if (acc?.length && acc[0].credit_period_days != null) creditDays = Number(acc[0].credit_period_days);
      } catch {}
      const base = new Date((header.invoiceDate || new Date().toISOString()).slice(0,10));
      base.setDate(base.getDate() + creditDays);
      header.dueDate = base.toISOString().slice(0,10);
    }
    const i = this.invoiceRepo.create({ ...header, tenantId, invoiceNumber: number, createdBy: userId, balanceDue, paidAmount: 0, status: header.status || 'DRAFT' });
    const saved = await this.invoiceRepo.save(i) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.invoiceItemRepo.create({ ...item, invoiceId: saved.invoiceId, lineNumber: idx + 1 })
      );
      await this.invoiceItemRepo.save(lineItems);

      // COGS recognition: stock leaves (and COGS posts) ONCE, at whichever document
      // reduces stock first. If this invoice is sourced from a Delivery Note (dnId set),
      // the DN already reduced stock + posted COGS, so we skip here to avoid double-posting.
      // For a DIRECT invoice (no DN), this is where the goods leave — reduce stock + post COGS.
      if (!header.dnId && header.isInventory !== false) {
        let totalCOGS = 0;
        for (const item of items) {
          if (item.productId) {
            const res: any = await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'OUT', number, userId, item.warehouseLocationId || item.locationId);
            totalCOGS += Number(res?.issueCost || 0);
          }
        }
        if (totalCOGS > 0) {
          const cogsDate = (header.invoiceDate || new Date().toISOString()).slice(0, 10);
          await this.createAutoJournalEntry(tenantId, userId, {
            voucherNumber: number,
            description: `COGS - Invoice ${number}${header.customerName ? ' - ' + header.customerName : ''}`,
            voucherDate: cogsDate,
            lines: [
              { accountCode: '5001', description: `COGS - ${number}`, debitAmount: Number(totalCOGS.toFixed(3)), creditAmount: 0 },
              { accountCode: '1140', description: `Inventory issue - ${number}`, debitAmount: 0, creditAmount: Number(totalCOGS.toFixed(3)) },
            ],
          });
        }
      }
    }
    // Mark linked DN as INVOICED
    if (header.dnId) await this.dnRepo.update({ dnId: header.dnId, tenantId }, { status: 'INVOICED' } as any);
    // Mark linked Quotation as CONVERTED
    if (header.quotationId) await this.quotationRepo.update({ quotationId: header.quotationId, tenantId }, { status: 'CONVERTED' } as any);
    // Auto journal: Dr AR / Cr Sales Revenue / Cr VAT
    const invDate = (header.invoiceDate || new Date().toISOString()).slice(0,10);
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
    await this.checkAndUpdateCreditStatus(tenantId, header.accountId || '', header.customerName);
    return this.getInvoice(tenantId, saved.invoiceId);
  }

  async updateInvoice(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.invoiceRepo.update({ invoiceId: id, tenantId }, header);
    if (items) {
      await this.invoiceItemRepo.delete({ invoiceId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.invoiceItemRepo.create({ ...item, invoiceId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.invoiceItemRepo.save(lineItems);
    }
    return this.getInvoice(tenantId, id);
  }

  async deleteInvoice(tenantId: string, id: string) {
    await this.invoiceRepo.delete({ invoiceId: id, tenantId });
    return { success: true };
  }

  // Convert DN to Invoice
  async convertDNToInvoice(tenantId: string, dnId: string, userId: string) {
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
    await this.dnRepo.update({ dnId, tenantId }, { status: 'INVOICED' } as any);
    return inv;
  }

  // ── Receipts ──────────────────────────────────────────────────
  async getReceipts(tenantId: string, page = 1, limit = 20, search?: string) {
    const qb = this.receiptRepo.createQueryBuilder('r')
      .where('r.tenantId = :tenantId', { tenantId });
    if (search) qb.andWhere('(r.customerName ILIKE :s OR r.receiptNumber ILIKE :s)', { s: `%${search}%` });
    qb.orderBy('r.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async updateReceipt(tenantId: string, id: string, dto: any) {
    await this.receiptRepo.update({ tenantId, receiptId: id } as any, dto);
    return this.receiptRepo.findOne({ where: { tenantId, receiptId: id } as any });
  }
  async createReceipt(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('RCT', this.receiptRepo, 'receiptNumber');
    const { invoiceIds, receiptNumber: _rn, ...receiptData } = dto;
    if (receiptData.paymentMethod === 'CHEQUE' && !receiptData.chequeStatus) {
      receiptData.chequeStatus = 'RECEIVED';
    }
    // Persist the invoice allocation list on the receipt so POST can apply it.
    const invoiceIdList = invoiceIds?.length ? invoiceIds : (dto.invoiceId ? [dto.invoiceId] : []);
    // Create as DRAFT — no GL, no invoice application, no credit unblock until POST.
    const r = this.receiptRepo.create({
      ...receiptData, tenantId, receiptNumber: number, status: 'DRAFT', createdBy: userId,
      ...(invoiceIdList.length ? { allocatedInvoiceIds: JSON.stringify(invoiceIdList) } : {}),
    });
    const saved = await this.receiptRepo.save(r);
    return saved;
  }

  async postReceipt(tenantId: string, id: string, userId: string) {
    const receipt = await this.receiptRepo.findOne({ where: { receiptId: id, tenantId } as any }) as any;
    if (!receipt) throw new NotFoundException('Receipt not found');
    if (receipt.status === 'POSTED') throw new BadRequestException('Receipt is already posted');

    // Apply payment to linked invoice(s)
    let invoiceIdList: string[] = [];
    try { invoiceIdList = receipt.allocatedInvoiceIds ? JSON.parse(receipt.allocatedInvoiceIds) : []; } catch { invoiceIdList = []; }
    if (!invoiceIdList.length && receipt.invoiceId) invoiceIdList = [receipt.invoiceId];
    if (invoiceIdList.length > 0) {
      const totalAmount = Number(receipt.amount) || 0;
      const perInvoice = invoiceIdList.length > 1 ? null : totalAmount;
      for (const invoiceId of invoiceIdList) {
        const invoice = await this.invoiceRepo.findOne({ where: { invoiceId, tenantId } });
        if (invoice) {
          const payment = perInvoice ?? Math.min(Number(invoice.balanceDue), totalAmount);
          const newPaid = Number(invoice.paidAmount) + payment;
          const newBalance = Number(invoice.totalAmount) - newPaid;
          const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
          await this.invoiceRepo.update({ invoiceId }, { paidAmount: newPaid, balanceDue: newBalance, status: newStatus });
        }
      }
    }

    // Auto journal — cheque receipts go to PDC holding account (bank credited only on deposit)
    const rcptDate = (receipt.receiptDate || new Date().toISOString()).slice(0,10);
    const rcptCustomer = receipt.customerName || "Customer";
    const isCheque = receipt.paymentMethod === 'CHEQUE';
    const debitAccount = isCheque ? "1119" : "1120";
    const debitDesc = isCheque
      ? `Cheques in Hand (PDC) - ${rcptCustomer} - Chq ${receipt.chequeNumber || ''}`
      : `Cash/Bank - Receipt from ${rcptCustomer}`;
    await this.createAutoJournalEntry(tenantId, userId, {
      voucherNumber: receipt.receiptNumber, description: `Customer Receipt ${receipt.receiptNumber} - ${rcptCustomer}${isCheque ? ' (PDC)' : ''}`,
      voucherDate: rcptDate, lines: [
        { accountCode: debitAccount, description: debitDesc, debitAmount: Number(receipt.amount || 0), creditAmount: 0 },
        { accountCode: "1130", description: `AR - ${rcptCustomer}`, debitAmount: 0, creditAmount: Number(receipt.amount || 0) },
      ],
    });

    await this.receiptRepo.update({ receiptId: id, tenantId } as any, { status: 'POSTED' } as any);
    // Auto credit check — may unblock if payment clears balance
    await this.checkAndUpdateCreditStatus(tenantId, receipt.accountId || '', receipt.customerName);
    return this.receiptRepo.findOne({ where: { receiptId: id, tenantId } as any });
  }

  async deleteReceipt(tenantId: string, id: string) {
    await this.receiptRepo.delete({ receiptId: id, tenantId });
    return { success: true };
  }

  // ── Sales Returns ─────────────────────────────────────────────
  async getReturns(tenantId: string, page = 1, limit = 20) {
    const qb = this.returnRepo.createQueryBuilder('r')
      .where('r.tenantId = :tenantId', { tenantId });
    qb.orderBy('r.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getReturn(tenantId: string, id: string) {
    const r = await this.returnRepo.findOne({ where: { returnId: id, tenantId }, relations: ['items'] });
    if (!r) throw new NotFoundException('Return not found');
    return r;
  }

  async createReturn(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('RTN', this.returnRepo, 'returnNumber');
    const { items, returnNumber: _rn, ...header } = dto;
    const r = this.returnRepo.create({ ...header, tenantId, returnNumber: number, createdBy: userId });
    const saved = await this.returnRepo.save(r) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.returnItemRepo.create({ ...item, returnId: saved.returnId, lineNumber: idx + 1 })
      );
      await this.returnItemRepo.save(lineItems);
      // 1. Return stock if inventory mode
      if (dto.isInventory) {
        for (const item of items) {
          if (item.productId) {
            await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'SALES_RETURN', number, userId);
          }
        }
      }
      // 2. Update linked invoice balance (credit the customer account)
      if (dto.invoiceId) {
        const invoice = await this.invoiceRepo.findOne({ where: { invoiceId: dto.invoiceId } });
        if (invoice) {
          const returnAmount = Number(dto.totalAmount || 0);
          const currentBalance = Number((invoice as any).balanceDue);
          const currentPaid = Number((invoice as any).paidAmount);
          if (currentBalance > 0) {
            // Invoice not fully paid - reduce balance
            const newBalance = Math.max(0, currentBalance - returnAmount);
            const newPaid = currentPaid + (currentBalance - newBalance);
            const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
            await this.invoiceRepo.update({ invoiceId: dto.invoiceId }, {
              balanceDue: newBalance, paidAmount: newPaid, status: newStatus,
            } as any);
          } else {
            // Invoice already paid - create credit balance (negative balance)
            const creditAmount = returnAmount;
            await this.invoiceRepo.update({ invoiceId: dto.invoiceId }, {
              balanceDue: -creditAmount, status: 'CREDIT_BALANCE',
            } as any);
          }
        }
      }
    }
        // Auto journal: Dr Sales Returns / Cr AR
    const srDate = (dto.returnDate || new Date().toISOString()).slice(0,10);
    const srTotal = Number(dto.totalAmount || 0);
    if (srTotal > 0) {
      const srLines: any[] = [
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

  async updateReturn(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.returnRepo.update({ returnId: id, tenantId }, header);
    if (items) {
      await this.returnItemRepo.delete({ returnId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.returnItemRepo.create({ ...item, returnId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.returnItemRepo.save(lineItems);
    }
    return this.getReturn(tenantId, id);
  }

  async deleteReturn(tenantId: string, id: string) {
    await this.returnRepo.delete({ returnId: id, tenantId });
    return { success: true };
  }

  // ── Chart of Accounts ────────────────────────────────────────
  async getAccounts(tenantId: string, type?: string, search?: string) {
    const qb = this.coaRepo.createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId })
      .andWhere('a.isActive = true');
    if (type) qb.andWhere('a.accountType = :type', { type });
    if (search) qb.andWhere('(a.accountName ILIKE :s OR a.accountCode ILIKE :s)', { s: `%${search}%` });
    qb.orderBy('a.accountCode', 'ASC');
    return qb.getMany();
  }

  async createAccount(tenantId: string, dto: any) {
    const a = this.coaRepo.create({ ...dto, tenantId });
    return this.coaRepo.save(a);
  }

  async updateAccount(tenantId: string, id: string, dto: any) {
    await this.coaRepo.update({ accountId: id, tenantId }, dto);
    return this.coaRepo.findOne({ where: { accountId: id } });
  }

  async deleteAccount(tenantId: string, id: string) {
    const acc = await this.coaRepo.findOne({ where: { accountId: id, tenantId } });
    if (acc?.isSystem) throw new Error('Cannot delete system accounts');
    await this.coaRepo.update({ accountId: id, tenantId }, { isActive: false });
    return { success: true };
  }

  // ── Dashboard Summary ─────────────────────────────────────────
  async getDashboard(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalQuotations, totalInvoices, totalReceipts, totalReturns,
      totalPurchaseOrders, totalGRNs, totalPurchaseInvoices, totalSuppliers, lowStockProducts,
    ] = await Promise.all([
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

    // Revenue stats
    const revenueThisMonth = await this.invoiceRepo.createQueryBuilder('i')
      .select('SUM(i.totalAmount)', 'total')
      .where('i.tenantId = :tid AND i.createdAt >= :start', { tid: tenantId, start: startOfMonth })
      .getRawOne();
    const revenueLastMonth = await this.invoiceRepo.createQueryBuilder('i')
      .select('SUM(i.totalAmount)', 'total')
      .where('i.tenantId = :tid AND i.createdAt >= :start AND i.createdAt <= :end',
        { tid: tenantId, start: startOfLastMonth, end: endOfLastMonth })
      .getRawOne();
    const totalRevenueResult = await this.invoiceRepo.createQueryBuilder('i')
      .select('SUM(i.totalAmount)', 'total')
      .where('i.tenantId = :tid', { tid: tenantId })
      .getRawOne();
    const outstandingResult = await this.invoiceRepo.createQueryBuilder('i')
      .select('SUM(i.balanceDue)', 'total')
      .where('i.tenantId = :tid AND i.status NOT IN (:...paid)', { tid: tenantId, paid: ['PAID', 'CANCELLED'] })
      .getRawOne();

    // Invoice by status
    const invoicesByStatus = await this.invoiceRepo.createQueryBuilder('i')
      .select('i.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(i.totalAmount)', 'value')
      .where('i.tenantId = :tid', { tid: tenantId })
      .groupBy('i.status').getRawMany();

    // Quotation by status
    const quotationsByStatus = await this.quotationRepo.createQueryBuilder('q')
      .select('q.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(q.totalAmount)', 'value')
      .where('q.tenantId = :tid', { tid: tenantId })
      .groupBy('q.status').getRawMany();

    // PO by status
    const posByStatus = await this.poRepo.createQueryBuilder('p')
      .select('p.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(p.totalAmount)', 'value')
      .where('p.tenantId = :tid', { tid: tenantId })
      .groupBy('p.status').getRawMany();

    // GRN by status
    const grnsByStatus = await this.grnRepo.createQueryBuilder('g')
      .select('g.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(g.totalAmount)', 'value')
      .where('g.tenantId = :tid', { tid: tenantId })
      .groupBy('g.status').getRawMany();

    // Purchase Invoice by status
    const purchaseInvoicesByStatus = await this.purchaseInvoiceRepo.createQueryBuilder('i')
      .select('i.status', 'status').addSelect('COUNT(*)', 'count').addSelect('SUM(i.totalAmount)', 'value')
      .where('i.tenantId = :tid', { tid: tenantId })
      .groupBy('i.status').getRawMany();

    // Pending counts
    const pendingQuotations = await this.quotationRepo.count({ where: { tenantId, status: 'DRAFT' } as any });
    const pendingInvoices = await this.invoiceRepo.count({ where: { tenantId, status: 'DRAFT' } as any });
    const pendingGRNs = await this.grnRepo.count({ where: { tenantId, status: 'DRAFT' } as any });

    // Total purchases
    const totalPurchasesResult = await this.purchaseInvoiceRepo.createQueryBuilder('i')
      .select('SUM(i.totalAmount)', 'total').where('i.tenantId = :tid', { tid: tenantId }).getRawOne();
    const outstandingPayablesResult = await this.purchaseInvoiceRepo.createQueryBuilder('i')
      .select('SUM(i.balanceDue)', 'total')
      .where('i.tenantId = :tid AND i.status NOT IN (:...paid)', { tid: tenantId, paid: ['PAID', 'CANCELLED'] })
      .getRawOne();

    // Real COGS from the Cost of Goods Sold account (5001) — posted by delivery/costing journals.
    // Gross profit = revenue - COGS (NOT revenue - purchases; purchases include unsold inventory).
    let totalCogs = 0;
    try {
      const cogsRow = await this.invoiceRepo.query(
        `SELECT COALESCE(SUM(jvl.debit_amount - jvl.credit_amount),0) as cogs
         FROM journal_voucher_lines jvl
         JOIN journal_vouchers jv ON jv.voucher_id = jvl.voucher_id
         WHERE jv.tenant_id::text = $1 AND jvl.account_code = '5001'`,
        [tenantId]
      );
      totalCogs = Number(cogsRow?.[0]?.cogs || 0);
    } catch {}
    return {
      totalQuotations, totalInvoices, totalReceipts, totalReturns,
      totalPurchaseOrders, totalGRNs, totalPurchaseInvoices, totalSuppliers, lowStockProducts,
      revenueThisMonth: revenueThisMonth?.total || 0,
      revenueLastMonth: revenueLastMonth?.total || 0,
      totalRevenue: totalRevenueResult?.total || 0,
      totalCogs,
      outstandingReceivables: outstandingResult?.total || 0,
      totalPurchases: totalPurchasesResult?.total || 0,
      outstandingPayables: outstandingPayablesResult?.total || 0,
      invoicesByStatus, quotationsByStatus, posByStatus, grnsByStatus, purchaseInvoicesByStatus,
      pendingQuotations, pendingInvoices, pendingGRNs,
    };
  }

  // ── Suppliers ─────────────────────────────────────────────────
  async getSuppliers(tenantId: string, page = 1, limit = 20, search?: string) {
    const qb = this.supplierRepo.createQueryBuilder('s')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.isActive = true');
    if (search) qb.andWhere('(s.supplierName ILIKE :s OR s.supplierCode ILIKE :s)', { s: `%${search}%` });
    qb.orderBy('s.supplierName', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
  async getSupplier(tenantId: string, id: string) {
    const s = await this.supplierRepo.findOne({ where: { supplierId: id, tenantId } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }
  async createSupplier(tenantId: string, dto: any, userId: string) {
    const s = this.supplierRepo.create({ ...dto, tenantId, createdBy: userId });
    return this.supplierRepo.save(s);
  }
  async updateSupplier(tenantId: string, id: string, dto: any) {
    await this.supplierRepo.update({ supplierId: id, tenantId }, dto);
    return this.getSupplier(tenantId, id);
  }
  async deleteSupplier(tenantId: string, id: string) {
    await this.supplierRepo.update({ supplierId: id, tenantId }, { isActive: false });
    return { success: true };
  }

  // ── Purchase Orders ───────────────────────────────────────────
  async getPurchaseOrders(tenantId: string, page = 1, limit = 20, search?: string, status?: string, excludeReceived = false) {
    const qb = this.poRepo.createQueryBuilder('p').where('p.tenantId = :tenantId', { tenantId });
    if (search) qb.andWhere('(p.supplierName ILIKE :s OR p.poNumber ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('p.status = :status', { status });
    if (excludeReceived) qb.andWhere("p.status NOT IN ('RECEIVED', 'CANCELLED')");
    qb.orderBy('p.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
  async getPurchaseOrder(tenantId: string, id: string) {
    const p = await this.poRepo.findOne({ where: { poId: id, tenantId }, relations: ['items'] });
    if (!p) throw new NotFoundException('Purchase Order not found');
    return p;
  }
  async createPurchaseOrder(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('PO', this.poRepo, 'poNumber');
    const { items, poNumber: _pn, grnNumber: _gn, invoiceNumber: _in, ...header } = dto;
    const p = this.poRepo.create({ ...header, tenantId, poNumber: number, createdBy: userId });
    const saved = await this.poRepo.save(p) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.poItemRepo.create({ ...item, poId: saved.poId, lineNumber: idx + 1 })
      );
      await this.poItemRepo.save(lineItems);
    }
    return this.getPurchaseOrder(tenantId, saved.poId);
  }
  async updatePurchaseOrder(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.poRepo.update({ poId: id, tenantId }, header);
    if (items) {
      await this.poItemRepo.delete({ poId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.poItemRepo.create({ ...item, poId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.poItemRepo.save(lineItems);
    }
    return this.getPurchaseOrder(tenantId, id);
  }
  async deletePurchaseOrder(tenantId: string, id: string) {
    await this.poRepo.delete({ poId: id, tenantId });
    return { success: true };
  }

  // ── GRN ──────────────────────────────────────────────────────
  async getGRNs(tenantId: string, page = 1, limit = 20, search?: string, status?: string, excludeInvoiced = false) {
    const qb = this.grnRepo.createQueryBuilder('g').where('g.tenantId = :tenantId', { tenantId });
    if (search) qb.andWhere('(g.supplierName ILIKE :s OR g.grnNumber ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('g.status = :status', { status });
    if (excludeInvoiced) qb.andWhere("g.status NOT IN ('INVOICED', 'CANCELLED')");
    qb.orderBy('g.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
  async getGRN(tenantId: string, id: string) {
    const g = await this.grnRepo.findOne({ where: { grnId: id, tenantId }, relations: ['items'] });
    if (!g) throw new NotFoundException('GRN not found');
    return g;
  }
  async createGRN(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('GRN', this.grnRepo, 'grnNumber');
    const { items, grnNumber: _gn, invoiceNumber: _in, poNumber: _pn, ...header } = dto;
    const g = this.grnRepo.create({ ...header, tenantId, grnNumber: number, createdBy: userId });
    const saved = await this.grnRepo.save(g) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.grnItemRepo.create({ ...item, grnId: saved.grnId, lineNumber: idx + 1 })
      );
      await this.grnItemRepo.save(lineItems);
      for (const item of items) {
        if (!item.productId) continue;
        // Get product type
        const productResult = await this.invoiceRepo.query(
          `SELECT product_type, product_name, product_code, unit_of_measure FROM products WHERE product_id=$1`,
          [item.productId]
        );
        const productType = productResult[0]?.product_type || 'STOCK';

        if (productType === 'STOCK' && dto.isInventory) {
          // Regular stock item - update inventory
          let locationId = item.warehouseLocationId;
          if (!locationId && item.poItemId) {
            const poItemResult = await this.invoiceRepo.query(
              `SELECT warehouse_location_id FROM purchase_order_items WHERE item_id=$1`, [item.poItemId]
            );
            locationId = poItemResult[0]?.warehouse_location_id;
          }
          if (!locationId && item.productId) {
            const grnItemResult = await this.invoiceRepo.query(
              `SELECT warehouse_location_id FROM goods_receipt_note_items WHERE grn_id=$1 AND product_id=$2 ORDER BY line_number LIMIT 1`,
              [saved.grnId, item.productId]
            );
            locationId = grnItemResult[0]?.warehouse_location_id;
          }
          const grnUnitCost = Number(item.unitCost ?? item.unitPrice ?? item.costPrice ?? 0);
          await this.adjustStock(tenantId, item.productId, Number(item.quantity), 'IN', number, userId, locationId, grnUnitCost);
        } else if (productType === 'CONSUMABLE') {
          // Consumable - update consumable stock
          await this.receiveConsumable(tenantId, item.productId, Number(item.quantity), number, userId);
        } else if (productType === 'FIXED_ASSET' || item.isFixedAsset) {
          // Fixed Asset - create draft assets (one per unit)
          const qty = Math.ceil(Number(item.quantity || 1));
          for (let i = 0; i < qty; i++) {
            const count = await this.fixedAssetRepo.count({ where: { tenantId } as any });
            const assetCode = `AST-${String(count + i + 1).padStart(4,'0')}`;
            let assetLocationId = item.warehouseLocationId;
            if (!assetLocationId && item.poItemId) {
              const poItemResult2 = await this.invoiceRepo.query(
                `SELECT warehouse_location_id FROM purchase_order_items WHERE item_id=$1`, [item.poItemId]
              );
              assetLocationId = poItemResult2[0]?.warehouse_location_id;
            }
            const asset = this.fixedAssetRepo.create({
              tenantId, assetCode,
              assetName: item.description || productResult[0]?.product_name,
              category: item.assetCategory || 'Other',
              brand: item.brand || undefined,
              model: item.model || undefined,
              serialNumber: qty > 1 ? undefined : item.serialNumber,
              supplierName: saved.supplierName,
              purchaseDate: saved.grnDate || new Date().toISOString().slice(0,10),
              purchaseCost: Number(item.unitPrice || 0),
              currentBookValue: Number(item.unitPrice || 0),
              usefulLifeYears: 5,
              depreciationMethod: 'STRAIGHT_LINE',
              status: 'ACTIVE',
              invoiceNumber: number,
              createdBy: userId,
              ...(assetLocationId ? { locationName: assetLocationId } : {}),
            } as any);
            await this.fixedAssetRepo.save(asset);
          }
          // Mark PO item assets_created
          if (item.poItemId) {
            await this.invoiceRepo.query(
              `UPDATE purchase_order_items SET assets_created = COALESCE(assets_created,0) + $1 WHERE item_id = $2`,
              [qty, item.poItemId]
            );
          }
        }
      }
    }
    // Mark linked PO as RECEIVED
    if (header.poId) await this.poRepo.update({ poId: header.poId, tenantId }, { status: 'RECEIVED' } as any);
    // Auto journal: Dr Inventory / Cr GRNI
    const grnDate = (header.grnDate || new Date().toISOString()).slice(0,10);
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
  async updateGRN(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.grnRepo.update({ grnId: id, tenantId }, header);
    if (items) {
      await this.grnItemRepo.delete({ grnId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.grnItemRepo.create({ ...item, grnId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.grnItemRepo.save(lineItems);
    }
    return this.getGRN(tenantId, id);
  }
  async deleteGRN(tenantId: string, id: string) {
    await this.grnRepo.delete({ grnId: id, tenantId });
    return { success: true };
  }
  async convertGRNToInvoice(tenantId: string, grnId: string, userId: string) {
    const g = await this.getGRN(tenantId, grnId);
    const number = await this.generateNumber('PINV', this.purchaseInvoiceRepo, 'invoiceNumber');
    const { items: grnItems, ...grnHeader } = g as any;
    const inv = this.purchaseInvoiceRepo.create({
      ...grnHeader, tenantId, invoiceNumber: number, createdBy: userId,
      balanceDue: grnHeader.totalAmount, grnId: g.grnId,
    });
    const saved = await this.purchaseInvoiceRepo.save(inv) as any;
    if (grnItems?.length) {
      const lineItems = grnItems.map((item: any, idx: number) =>
        this.purchaseInvoiceItemRepo.create({ ...item, invoiceId: saved.invoiceId, lineNumber: idx + 1 })
      );
      await this.purchaseInvoiceItemRepo.save(lineItems);
    }
    // Mark GRN as INVOICED so it doesn't appear in dropdowns again
    await this.grnRepo.update({ grnId, tenantId }, { status: 'INVOICED' } as any);
    return this.getPurchaseInvoice(tenantId, saved.invoiceId);
  }

  // ── Purchase Invoices ─────────────────────────────────────────
  async getPurchaseInvoices(tenantId: string, page = 1, limit = 20, search?: string, status?: string, excludePaid = false) {
    const qb = this.purchaseInvoiceRepo.createQueryBuilder('i').where('i.tenantId = :tenantId', { tenantId });
    if (search) qb.andWhere('(i.supplierName ILIKE :s OR i.invoiceNumber ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('i.status = :status', { status });
    if (excludePaid) qb.andWhere("i.status NOT IN ('PAID', 'CANCELLED')");
    qb.orderBy('i.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
  async getPurchaseInvoice(tenantId: string, id: string) {
    const i = await this.purchaseInvoiceRepo.findOne({ where: { invoiceId: id, tenantId }, relations: ['items'] });
    if (!i) throw new NotFoundException('Purchase Invoice not found');
    return i;
  }
  async createPurchaseInvoice(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('PINV', this.purchaseInvoiceRepo, 'invoiceNumber');
    const { items, invoiceNumber: _ignoreNum, grnNumber: _ignoreGrn, poNumber: _ignorePo, ...header } = dto;
    // Auto-set due date if not provided: invoice date + payment terms (parse a number from
    // payment_terms like "Net 30" / "30"; default 30 days).
    if (!header.dueDate) {
      let termDays = 30;
      const tmatch = String(header.paymentTerms || '').match(/\d+/);
      if (tmatch) termDays = Number(tmatch[0]);
      const base = new Date((header.invoiceDate || new Date().toISOString()).slice(0,10));
      base.setDate(base.getDate() + termDays);
      header.dueDate = base.toISOString().slice(0,10);
    }
    const i = this.purchaseInvoiceRepo.create({ ...header, tenantId, invoiceNumber: number, createdBy: userId, balanceDue: header.totalAmount });
    const saved = await this.purchaseInvoiceRepo.save(i) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.purchaseInvoiceItemRepo.create({ ...item, invoiceId: saved.invoiceId, lineNumber: idx + 1 })
      );
      await this.purchaseInvoiceItemRepo.save(lineItems);
    }
    // Mark linked GRN as INVOICED so it doesn't appear in dropdowns again
    if (header.grnId) {
      await this.grnRepo.update({ grnId: header.grnId, tenantId }, { status: 'INVOICED' } as any);
    }
    // Mark linked PO as RECEIVED so it doesn't appear in dropdowns again
    if (header.poId) {
      await this.poRepo.update({ poId: header.poId, tenantId }, { status: 'RECEIVED' } as any);
    }
    // Auto journal: Dr GRNI + Dr VAT Receivable / Cr AP
    const pinvDate = (header.invoiceDate || new Date().toISOString()).slice(0,10);
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
  async updatePurchaseInvoice(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.purchaseInvoiceRepo.update({ invoiceId: id, tenantId }, header);
    if (items) {
      await this.purchaseInvoiceItemRepo.delete({ invoiceId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.purchaseInvoiceItemRepo.create({ ...item, invoiceId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.purchaseInvoiceItemRepo.save(lineItems);
    }
    return this.getPurchaseInvoice(tenantId, id);
  }
  async deletePurchaseInvoice(tenantId: string, id: string) {
    await this.purchaseInvoiceRepo.delete({ invoiceId: id, tenantId });
    return { success: true };
  }

  // ── Payment Vouchers ──────────────────────────────────────────
  async getPaymentVouchers(tenantId: string, page = 1, limit = 20, search?: string) {
    const qb = this.voucherRepo.createQueryBuilder('v').where('v.tenantId = :tenantId', { tenantId });
    if (search) qb.andWhere('(v.supplierName ILIKE :s OR v.voucherNumber ILIKE :s)', { s: `%${search}%` });
    qb.orderBy('v.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
  async createPaymentVoucher(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('PV', this.voucherRepo, 'voucherNumber');
    let voucherData = { ...dto };
    // On DRAFT create: validate + reserve the cheque leaf reference, but DO NOT consume it,
    // do NOT post GL, do NOT mark invoice paid. Those happen on POST.
    if (voucherData.paymentMethod === 'CHEQUE' && voucherData.bankAccountId) {
      let leaf: any = null;
      if (voucherData.chequeLeafId) {
        leaf = await this.chequeLeafRepo.findOne({ where: { tenantId, leafId: voucherData.chequeLeafId, status: 'AVAILABLE' } as any });
        if (!leaf) throw new BadRequestException('Selected cheque leaf is not available');
      } else {
        const leafWhere: any = { tenantId, bankAccountId: voucherData.bankAccountId, status: 'AVAILABLE' };
        if (voucherData.chequeBookId) leafWhere.chequeBookId = voucherData.chequeBookId;
        leaf = await this.chequeLeafRepo.findOne({ where: leafWhere, order: { leafNumber: 'ASC' } as any });
        if (!leaf) throw new BadRequestException('No available cheque leaves for this bank account/cheque book');
      }
      voucherData.chequeNumber = leaf.leafNumber;
      voucherData.chequeLeafId = leaf.leafId;
      const acc = await this.bankAccountRepo.findOne({ where: { tenantId, bankAccountId: voucherData.bankAccountId } as any });
      if (acc) voucherData.bankName = acc.bankName;
    }
    const v = this.voucherRepo.create({ ...voucherData, tenantId, voucherNumber: number, status: 'DRAFT', createdBy: userId });
    const saved = await this.voucherRepo.save(v) as any;
    return saved;
  }

  async postPaymentVoucher(tenantId: string, id: string, userId: string) {
    const voucher = await this.voucherRepo.findOne({ where: { voucherId: id, tenantId } as any }) as any;
    if (!voucher) throw new NotFoundException('Payment Voucher not found');
    if (voucher.status === 'POSTED') throw new BadRequestException('Payment Voucher is already posted');

    // Consume the cheque leaf now (AVAILABLE -> USED)
    if (voucher.paymentMethod === 'CHEQUE' && voucher.chequeLeafId) {
      const leaf = await this.chequeLeafRepo.findOne({ where: { tenantId, leafId: voucher.chequeLeafId } as any }) as any;
      if (leaf && leaf.status === 'AVAILABLE') {
        await this.chequeLeafRepo.update({ leafId: leaf.leafId } as any, {
          status: 'USED', usedInVoucherId: voucher.voucherId,
          usedDate: voucher.voucherDate || new Date().toISOString().slice(0,10),
          payeeName: voucher.supplierName, amount: voucher.amount,
        });
      } else if (!leaf || leaf.status !== 'AVAILABLE') {
        throw new BadRequestException('Cheque leaf is no longer available; cannot post');
      }
    }

    // Apply payment to the linked purchase invoice
    if (voucher.invoiceId) {
      const invoice = await this.purchaseInvoiceRepo.findOne({ where: { invoiceId: voucher.invoiceId } });
      if (invoice) {
        const newPaid = Number(invoice.paidAmount) + Number(voucher.amount);
        const newBalance = Number(invoice.totalAmount) - newPaid;
        const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
        await this.purchaseInvoiceRepo.update({ invoiceId: voucher.invoiceId }, { paidAmount: newPaid, balanceDue: newBalance, status: newStatus });
      }
    }

    // Auto journal: Dr AP / Cr Bank
    const pvDate = (voucher.voucherDate || new Date().toISOString()).slice(0,10);
    await this.createAutoJournalEntry(tenantId, userId, {
      voucherNumber: voucher.voucherNumber, description: `Payment ${voucher.voucherNumber} - ${voucher.supplierName}`,
      voucherDate: pvDate, lines: [
        { accountCode: '2110', description: `AP - ${voucher.supplierName}`, debitAmount: Number(voucher.amount || 0), creditAmount: 0 },
        { accountCode: '1120', description: `Payment to ${voucher.supplierName}`, debitAmount: 0, creditAmount: Number(voucher.amount || 0) },
      ],
    });

    await this.voucherRepo.update({ voucherId: id, tenantId } as any, { status: 'POSTED', approvedBy: userId } as any);
    return this.getPaymentVoucher(tenantId, id);
  }
  async getPaymentVoucher(tenantId: string, id: string) {
    const v = await this.voucherRepo.findOne({ where: { voucherId: id, tenantId } });
    if (!v) throw new NotFoundException('Payment Voucher not found');
    return v;
  }
  async updatePaymentVoucher(tenantId: string, id: string, dto: any) {
    const { voucherNumber: _vn, ...data } = dto;
    await this.voucherRepo.update({ voucherId: id, tenantId }, data);
    return this.getPaymentVoucher(tenantId, id);
  }
  async deletePaymentVoucher(tenantId: string, id: string) {
    await this.voucherRepo.delete({ voucherId: id, tenantId });
    return { success: true };
  }

  // ── Purchase Returns ──────────────────────────────────────────
  async getPurchaseReturns(tenantId: string, page = 1, limit = 20) {
    const qb = this.purchaseReturnRepo.createQueryBuilder('r').where('r.tenantId = :tenantId', { tenantId });
    qb.orderBy('r.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
  async getPurchaseReturn(tenantId: string, id: string) {
    const r = await this.purchaseReturnRepo.findOne({ where: { returnId: id, tenantId }, relations: ['items'] });
    if (!r) throw new NotFoundException('Purchase Return not found');
    return r;
  }
  async createPurchaseReturn(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('PRN', this.purchaseReturnRepo, 'returnNumber');
    const { items, returnNumber: _rn, ...header } = dto;
    const r = this.purchaseReturnRepo.create({ ...header, tenantId, returnNumber: number, createdBy: userId });
    const saved = await this.purchaseReturnRepo.save(r) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.purchaseReturnItemRepo.create({ ...item, returnId: saved.returnId, lineNumber: idx + 1 })
      );
      await this.purchaseReturnItemRepo.save(lineItems);
      // 1. Reduce stock if inventory mode
      if (dto.returnToStock === false) {
        for (const item of items) {
          if (item.productId) {
            await this.adjustStock(tenantId, item.productId, -Number(item.quantity), 'PURCHASE_RETURN', number, userId);
          }
        }
      }
      // 2. Update linked purchase invoice balance
      if (dto.invoiceId) {
        const invoice = await this.purchaseInvoiceRepo.findOne({ where: { invoiceId: dto.invoiceId } });
        if (invoice) {
          const returnAmount = Number(dto.totalAmount || 0);
          const currentBalance = Number((invoice as any).balanceDue);
          if (currentBalance > 0) {
            // Invoice not fully paid - reduce balance
            const newBalance = Math.max(0, currentBalance - returnAmount);
            const newPaid = Number((invoice as any).paidAmount) + (currentBalance - newBalance);
            const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
            await this.purchaseInvoiceRepo.update({ invoiceId: dto.invoiceId }, {
              balanceDue: newBalance, paidAmount: newPaid, status: newStatus,
            } as any);
          } else {
            // Invoice already paid - create debit balance (supplier owes us)
            const debitAmount = returnAmount;
            await this.purchaseInvoiceRepo.update({ invoiceId: dto.invoiceId }, {
              balanceDue: -debitAmount, status: 'DEBIT_BALANCE',
            } as any);
          }
        }
      }
    }
    // Auto journal: Dr AP / Cr Purchase Returns
    const prDate = (dto.returnDate || new Date().toISOString()).slice(0,10);
    const prTotal = Number(dto.totalAmount || 0);
    if (prTotal > 0) {
      const prLines: any[] = [
        { accountCode: '2110', description: `AP - ${dto.supplierName}`, debitAmount: prTotal, creditAmount: 0 },
        { accountCode: '5010', description: `Purchase Return ${number} - ${dto.supplierName}`, debitAmount: 0, creditAmount: prTotal },
      ];
      // If stock is being returned to supplier
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
  async updatePurchaseReturn(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.purchaseReturnRepo.update({ returnId: id, tenantId }, header);
    if (items) {
      await this.purchaseReturnItemRepo.delete({ returnId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.purchaseReturnItemRepo.create({ ...item, returnId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.purchaseReturnItemRepo.save(lineItems);
    }
    return this.getPurchaseReturn(tenantId, id);
  }
  async deletePurchaseReturn(tenantId: string, id: string) {
    await this.purchaseReturnRepo.delete({ returnId: id, tenantId });
    return { success: true };
  }

  // ── Finance Dashboard ─────────────────────────────────────────
  async getFinanceDashboard(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // ── Quotations ────────────────────────────────────────────
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

    // ── Invoices ──────────────────────────────────────────────
    const totalInvoices = await this.invoiceRepo.count({ where: { tenantId } });
    const invoicesThisMonth = await this.invoiceRepo.createQueryBuilder('i')
      .where('i.tenantId = :tid AND i.createdAt >= :start', { tid: tenantId, start: startOfMonth })
      .getCount();
    const revenueResult = await this.invoiceRepo.createQueryBuilder('i')
      .select('SUM(i.totalAmount)', 'total')
      .where('i.tenantId = :tid', { tid: tenantId })
      .getRawOne();
    const totalRevenue = Number(revenueResult?.total || 0);

    const revenueThisMonth = await this.invoiceRepo.createQueryBuilder('i')
      .select('SUM(i.totalAmount)', 'total')
      .where('i.tenantId = :tid AND i.createdAt >= :start', { tid: tenantId, start: startOfMonth })
      .getRawOne();
    const revenueLastMonth = await this.invoiceRepo.createQueryBuilder('i')
      .select('SUM(i.totalAmount)', 'total')
      .where('i.tenantId = :tid AND i.createdAt >= :start AND i.createdAt <= :end', 
        { tid: tenantId, start: startOfLastMonth, end: endOfLastMonth })
      .getRawOne();

    const outstandingResult = await this.invoiceRepo.createQueryBuilder('i')
      .select('SUM(i.balanceDue)', 'total')
      .where('i.tenantId = :tid AND i.status NOT IN (:...paid)', 
        { tid: tenantId, paid: ['PAID', 'CANCELLED'] })
      .getRawOne();
    const totalOutstanding = Number(outstandingResult?.total || 0);

    const overdueResult = await this.invoiceRepo.createQueryBuilder('i')
      .select('SUM(i.balanceDue)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('i.tenantId = :tid AND i.dueDate < NOW() AND i.status NOT IN (:...paid)',
        { tid: tenantId, paid: ['PAID', 'CANCELLED'] })
      .getRawOne();

    const invoicesByStatus = await this.invoiceRepo.createQueryBuilder('i')
      .select('i.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(i.totalAmount)', 'value')
      .where('i.tenantId = :tid', { tid: tenantId })
      .groupBy('i.status')
      .getRawMany();

    // ── Receipts ──────────────────────────────────────────────
    const receiptsResult = await this.receiptRepo.createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('r.tenantId = :tid', { tid: tenantId })
      .getRawOne();
    const totalReceived = Number(receiptsResult?.total || 0);

    const receiptsThisMonth = await this.receiptRepo.createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.tenantId = :tid AND r.createdAt >= :start', { tid: tenantId, start: startOfMonth })
      .getRawOne();

    // ── Monthly Revenue Trend (last 6 months) ─────────────────
    const monthlyRevenue = await this.invoiceRepo.createQueryBuilder('i')
      .select("TO_CHAR(i.createdAt, 'Mon YY')", 'month')
      .addSelect('SUM(i.totalAmount)', 'revenue')
      .addSelect('SUM(i.vatAmount)', 'vat')
      .where('i.tenantId = :tid AND i.createdAt >= :start',
        { tid: tenantId, start: new Date(now.getFullYear(), now.getMonth() - 5, 1) })
      .groupBy("TO_CHAR(i.createdAt, 'Mon YY')")
      .orderBy("MIN(i.createdAt)", 'ASC')
      .getRawMany();

    // ── Top Customers by Revenue ──────────────────────────────
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

    // ── Purchase Summary ──────────────────────────────────────
    const purchaseResult = await this.purchaseInvoiceRepo.createQueryBuilder('p')
      .select('SUM(p.totalAmount)', 'total')
      .addSelect('SUM(p.balanceDue)', 'outstanding')
      .addSelect('COUNT(*)', 'count')
      .where('p.tenantId = :tid', { tid: tenantId })
      .getRawOne();

    // ── VAT Summary ───────────────────────────────────────────
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
        revenueThisMonth: Number(revenueThisMonth?.total || 0),
        revenueLastMonth: Number(revenueLastMonth?.total || 0),
        totalOutstanding,
        overdueAmount: Number(overdueResult?.total || 0),
        overdueCount: Number(overdueResult?.count || 0),
        byStatus: invoicesByStatus,
        monthlyTrend: monthlyRevenue,
        topCustomers,
      },
      receipts: {
        total: Number(receiptsResult?.count || 0),
        totalReceived,
        thisMonth: Number(receiptsThisMonth?.total || 0),
      },
      purchases: {
        total: Number(purchaseResult?.count || 0),
        totalAmount: Number(purchaseResult?.total || 0),
        outstanding: Number(purchaseResult?.outstanding || 0),
      },
      vat: {
        collected: Number(vatCollected?.total || 0),
        paid: Number(vatPaid?.total || 0),
        net: Number(vatCollected?.total || 0) - Number(vatPaid?.total || 0),
      },
    };
  }

  // ── Journal Vouchers ──────────────────────────────────────────
  async getJournalVouchers(tenantId: string, page = 1, limit = 20, search?: string, type?: string, status?: string) {
    const qb = this.jvRepo.createQueryBuilder('j').where('j.tenantId = :tid', { tid: tenantId });
    if (search) qb.andWhere('(j.voucherNumber ILIKE :s OR j.description ILIKE :s OR j.reference ILIKE :s)', { s: `%${search}%` });
    if (type) qb.andWhere('j.voucherType = :type', { type });
    if (status) qb.andWhere('j.status = :status', { status });
    qb.orderBy('j.voucherDate', 'DESC').addOrderBy('j.createdAt', 'DESC').skip((page-1)*limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getJournalVoucher(tenantId: string, id: string) {
    const jv = await this.jvRepo.findOne({ where: { voucherId: id, tenantId }, relations: ['lines'] });
    if (!jv) throw new NotFoundException('Journal Voucher not found');
    return jv;
  }

  async createJournalVoucher(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('JV', this.jvRepo, 'voucherNumber');
    const { lines, ...header } = dto;
    const totalDebit = (lines || []).reduce((s: number, l: any) => s + Number(l.debitAmount || 0), 0);
    const totalCredit = (lines || []).reduce((s: number, l: any) => s + Number(l.creditAmount || 0), 0);
    const jv = this.jvRepo.create({ ...header, tenantId, voucherNumber: number, createdBy: userId, totalDebit, totalCredit });
    const saved = await this.jvRepo.save(jv) as any;
    if (lines?.length) {
      const lineEntities = lines.map((l: any, idx: number) =>
        this.jvLineRepo.create({ ...l, voucherId: saved.voucherId, lineNumber: idx + 1 })
      );
      await this.jvLineRepo.save(lineEntities);
    }
    return this.getJournalVoucher(tenantId, saved.voucherId);
  }

  async updateJournalVoucher(tenantId: string, id: string, dto: any) {
    const { lines, ...header } = dto;
    if (lines) {
      const totalDebit = lines.reduce((s: number, l: any) => s + Number(l.debitAmount || 0), 0);
      const totalCredit = lines.reduce((s: number, l: any) => s + Number(l.creditAmount || 0), 0);
      header.totalDebit = totalDebit;
      header.totalCredit = totalCredit;
    }
    await this.jvRepo.update({ voucherId: id, tenantId }, header);
    if (lines) {
      await this.jvLineRepo.delete({ voucherId: id });
      const lineEntities = lines.map((l: any, idx: number) =>
        this.jvLineRepo.create({ ...l, voucherId: id, lineNumber: idx + 1 })
      );
      if (lineEntities.length) await this.jvLineRepo.save(lineEntities);
    }
    return this.getJournalVoucher(tenantId, id);
  }

  async postJournalVoucher(tenantId: string, id: string, userId: string) {
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

  async deleteJournalVoucher(tenantId: string, id: string) {
    const jv = await this.jvRepo.findOne({ where: { voucherId: id, tenantId } });
    if (jv?.isPosted) throw new Error('Cannot delete a posted voucher');
    await this.jvRepo.delete({ voucherId: id, tenantId });
    return { success: true };
  }

  // ── General Ledger ────────────────────────────────────────────
  async getGeneralLedger(tenantId: string, accountId?: string, fromDate?: string, toDate?: string, page = 1, limit = 50) {
    // Get all journal voucher lines for the account
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

    if (accountId) qb.andWhere('l.account_id = :accountId', { accountId });
    if (fromDate) qb.andWhere('jv.voucher_date >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('jv.voucher_date <= :toDate', { toDate });

    qb.orderBy('jv.voucher_date', 'ASC').addOrderBy('jv.voucher_number', 'ASC');

    const allRows = await qb.getRawMany();
    const total = allRows.length;

    // Calculate running balance
    let runningBalance = 0;
    const rowsWithBalance = allRows.map(row => {
      runningBalance += Number(row.debitAmount || 0) - Number(row.creditAmount || 0);
      return { ...row, runningBalance };
    });

    // Paginate
    const data = rowsWithBalance.slice((page - 1) * limit, page * limit);

    // Summary
    const totalDebit = allRows.reduce((s, r) => s + Number(r.debitAmount || 0), 0);
    const totalCredit = allRows.reduce((s, r) => s + Number(r.creditAmount || 0), 0);

    return { data, total, page, limit, summary: { totalDebit, totalCredit, netBalance: totalDebit - totalCredit } };
  }
  // ── Trial Balance ─────────────────────────────────────────────
  async getTrialBalance(tenantId: string, fromDate?: string, toDate?: string) {
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

    if (fromDate) qb.andWhere('jv.voucher_date >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('jv.voucher_date <= :toDate', { toDate });

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

  // ── Profit & Loss ─────────────────────────────────────────────
  async getProfitLoss(tenantId: string, fromDate?: string, toDate?: string) {
    const salesQb = this.invoiceRepo.createQueryBuilder("i")
      .select("SUM(i.subtotal)", "revenue")
      .addSelect("SUM(i.vatAmount)", "vat")
      .where("i.tenantId = :tid", { tid: tenantId });
    if (fromDate) salesQb.andWhere("i.invoiceDate >= :fromDate", { fromDate });
    if (toDate) salesQb.andWhere("i.invoiceDate <= :toDate", { toDate });
    const salesResult = await salesQb.getRawOne();

    const purchaseQb = this.purchaseInvoiceRepo.createQueryBuilder("p")
      .select("SUM(p.subtotal)", "cost")
      .where("p.tenantId = :tid", { tid: tenantId });
    if (fromDate) purchaseQb.andWhere("p.invoiceDate >= :fromDate", { fromDate });
    if (toDate) purchaseQb.andWhere("p.invoiceDate <= :toDate", { toDate });
    const purchaseResult = await purchaseQb.getRawOne();

    const revenue = { items: [{ accountCode: "4000", accountName: "Sales Revenue", amount: Number(salesResult?.revenue || 0) }], total: Number(salesResult?.revenue || 0) };
    const costOfSales = { items: [{ accountCode: "5000", accountName: "Cost of Goods Sold", amount: Number(purchaseResult?.cost || 0) }], total: Number(purchaseResult?.cost || 0) };
    const grossProfit = revenue.total - costOfSales.total;
    const expenses = { items: [], total: 0 };
    const netProfit = grossProfit - expenses.total;
    return { revenue, costOfSales, grossProfit, expenses, netProfit };
  }

  // ── Balance Sheet ─────────────────────────────────────────────
  async getBalanceSheet(tenantId: string, asOfDate?: string) {
    const assets = { current: { items: [], total: 0 }, nonCurrent: { items: [], total: 0 }, total: 0 } as any;
    const liabilities = { current: { items: [], total: 0 }, nonCurrent: { items: [], total: 0 }, total: 0 } as any;
    const equity = { items: [], total: 0 } as any;

    const arResult = await this.invoiceRepo.createQueryBuilder("i")
      .select("SUM(i.balanceDue)", "total").where("i.tenantId = :tid AND i.status NOT IN (:...s)", { tid: tenantId, s: ["PAID","CANCELLED"] }).getRawOne();
    const apResult = await this.purchaseInvoiceRepo.createQueryBuilder("p")
      .select("SUM(p.balanceDue)", "total").where("p.tenantId = :tid AND p.status NOT IN (:...s)", { tid: tenantId, s: ["PAID","CANCELLED"] }).getRawOne();

    if (Number(arResult?.total || 0) > 0) { assets.current.items.push({ accountCode: "1130", accountName: "Accounts Receivable", balance: Number(arResult.total) }); assets.current.total += Number(arResult.total); }
    if (Number(apResult?.total || 0) > 0) { liabilities.current.items.push({ accountCode: "2110", accountName: "Accounts Payable", balance: Number(apResult.total) }); liabilities.current.total += Number(apResult.total); }
    assets.total = assets.current.total + assets.nonCurrent.total;
    liabilities.total = liabilities.current.total + liabilities.nonCurrent.total;
    return { assets, liabilities, equity, asOfDate };
  }

  // ── Cash Flow ─────────────────────────────────────────────────
  async getCashFlow(tenantId: string, fromDate?: string, toDate?: string) {
    const rQb = this.receiptRepo.createQueryBuilder("r").select("SUM(r.amount)", "total").where("r.tenantId = :tid", { tid: tenantId });
    if (fromDate) rQb.andWhere("r.receiptDate >= :fromDate", { fromDate });
    if (toDate) rQb.andWhere("r.receiptDate <= :toDate", { toDate });
    const receiptsResult = await rQb.getRawOne();

    const pQb = this.voucherRepo.createQueryBuilder("v").select("SUM(v.amount)", "total").where("v.tenantId = :tid", { tid: tenantId });
    if (fromDate) pQb.andWhere("v.voucherDate >= :fromDate", { fromDate });
    if (toDate) pQb.andWhere("v.voucherDate <= :toDate", { toDate });
    const paymentsResult = await pQb.getRawOne();

    const operatingInflow = Number(receiptsResult?.total || 0);
    const operatingOutflow = Number(paymentsResult?.total || 0);
    const operatingTotal = operatingInflow - operatingOutflow;
    return {
      operating: { items: [{ description: "Cash received from customers", amount: operatingInflow }, { description: "Cash paid to suppliers", amount: -operatingOutflow }], total: operatingTotal },
      investing: { items: [], total: 0 },
      financing: { items: [], total: 0 },
      openingBalance: 0, netCashFlow: operatingTotal, closingBalance: operatingTotal,
    };
  }

  // ── AR Aging ──────────────────────────────────────────────────
  async getARaging(tenantId: string, asOfDate?: string) {
    const date = asOfDate ? new Date(asOfDate) : new Date();
    const invoices = await this.invoiceRepo.createQueryBuilder("i")
      .where("i.tenantId = :tid AND i.status NOT IN (:...s) AND i.balanceDue > 0", { tid: tenantId, s: ["PAID","CANCELLED"] }).getMany();
    const summary = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days91plus: 0 } as any;
    const result = invoices.map(inv => {
      // Bucket by due date. If no due date is set, derive it from invoice date + 30 days
      // (standard net-30) so aging still computes instead of defaulting everything to Current.
      let dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
      if (!dueDate && (inv as any).invoiceDate) {
        const baseDate = new Date((inv as any).invoiceDate);
        baseDate.setDate(baseDate.getDate() + 30);
        dueDate = baseDate;
      }
      const daysOverdue = dueDate ? Math.floor((date.getTime() - dueDate.getTime()) / 86400000) : 0;
      const balance = Number(inv.balanceDue || 0);
      if (daysOverdue <= 0) summary.current += balance;
      else if (daysOverdue <= 30) summary.days1_30 += balance;
      else if (daysOverdue <= 60) summary.days31_60 += balance;
      else if (daysOverdue <= 90) summary.days61_90 += balance;
      else summary.days91plus += balance;
      return { ...inv, daysOverdue: Math.max(0, daysOverdue) };
    });
    return { invoices: result, summary, totalOutstanding: invoices.reduce((s,i) => s + Number(i.balanceDue||0), 0) };
  }

  // ── AP Aging ──────────────────────────────────────────────────
  async getAPAging(tenantId: string, asOfDate?: string) {
    const date = asOfDate ? new Date(asOfDate) : new Date();
    const invoices = await this.purchaseInvoiceRepo.createQueryBuilder("i")
      .where("i.tenantId = :tid AND i.status NOT IN (:...s) AND i.balanceDue > 0", { tid: tenantId, s: ["PAID","CANCELLED"] }).getMany();
    const summary = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days91plus: 0 } as any;
    const result = invoices.map(inv => {
      // Bucket by due date. If no due date is set, derive it from invoice date + 30 days
      // (standard net-30) so aging still computes instead of defaulting everything to Current.
      let dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
      if (!dueDate && (inv as any).invoiceDate) {
        const baseDate = new Date((inv as any).invoiceDate);
        baseDate.setDate(baseDate.getDate() + 30);
        dueDate = baseDate;
      }
      const daysOverdue = dueDate ? Math.floor((date.getTime() - dueDate.getTime()) / 86400000) : 0;
      const balance = Number(inv.balanceDue || 0);
      if (daysOverdue <= 0) summary.current += balance;
      else if (daysOverdue <= 30) summary.days1_30 += balance;
      else if (daysOverdue <= 60) summary.days31_60 += balance;
      else if (daysOverdue <= 90) summary.days61_90 += balance;
      else summary.days91plus += balance;
      return { ...inv, daysOverdue: Math.max(0, daysOverdue) };
    });
    return { invoices: result, summary, totalOutstanding: invoices.reduce((s,i) => s + Number(i.balanceDue||0), 0) };
  }

  // ── VAT Return ────────────────────────────────────────────────
  async getVATReturn(tenantId: string, fromDate?: string, toDate?: string) {
    const sQb = this.invoiceRepo.createQueryBuilder("i").where("i.tenantId = :tid", { tid: tenantId });
    if (fromDate) sQb.andWhere("i.invoiceDate >= :fromDate", { fromDate });
    if (toDate) sQb.andWhere("i.invoiceDate <= :toDate", { toDate });
    const salesInvoices = await sQb.getMany();

    const pQb = this.purchaseInvoiceRepo.createQueryBuilder("p").where("p.tenantId = :tid", { tid: tenantId });
    if (fromDate) pQb.andWhere("p.invoiceDate >= :fromDate", { fromDate });
    if (toDate) pQb.andWhere("p.invoiceDate <= :toDate", { toDate });
    const purchaseInvoices = await pQb.getMany();

    const outputVat = salesInvoices.reduce((s,i) => s + Number(i.vatAmount||0), 0);
    const inputVat = purchaseInvoices.reduce((s,i) => s + Number(i.vatAmount||0), 0);
    const taxableSales = salesInvoices.reduce((s,i) => s + Number(i.subtotal||0), 0);
    return {
      outputVat, inputVat, netVat: outputVat - inputVat, taxableSales,
      salesDetails: salesInvoices.map(i => ({ invoiceId: i.invoiceId, invoiceNumber: i.invoiceNumber, customerName: i.customerName, invoiceDate: i.invoiceDate, taxableAmount: i.subtotal, vatAmount: i.vatAmount })),
      purchaseDetails: purchaseInvoices.map(i => ({ invoiceId: i.invoiceId, invoiceNumber: i.invoiceNumber, supplierName: i.supplierName, invoiceDate: i.invoiceDate, taxableAmount: i.subtotal, vatAmount: i.vatAmount })),
    };
  }

  // ── Budget vs Actual ──────────────────────────────────────────
  async getBudgetVsActual(tenantId: string, fromDate?: string, toDate?: string) {
    const accounts = await this.coaRepo.find({ where: { tenantId, isActive: true, accountType: "EXPENSE" } });
    const items = accounts.map(acc => ({ accountId: acc.accountId, accountCode: acc.accountCode, accountName: acc.accountName, budget: 0, actual: 0, variance: 0, utilization: 0 }));
    return { items, totalBudget: 0, totalActual: 0, totalVariance: 0, overallUtilization: 0 };
  }

  // ── Sales Targets ─────────────────────────────────────────────
  async getSalesTargets(tenantId: string, year?: number, month?: number) {
    const rawSql = `SELECT * FROM sales_targets WHERE tenant_id = $1 ${year ? 'AND period_year = $2' : ''} ${month ? `AND period_month = $${year ? 3 : 2}` : ''} ORDER BY period_year DESC, period_month DESC`;
    const params: any[] = [tenantId];
    if (year) params.push(year);
    if (month) params.push(month);
    return this.invoiceRepo.query(rawSql, params);
  }

  async createSalesTarget(tenantId: string, dto: any, userId: string) {
    const sql = `INSERT INTO sales_targets (tenant_id, period_type, period_year, period_month, period_quarter, salesman_id, salesman_name, target_amount, target_qty, notes, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`;
    const result = await this.invoiceRepo.query(sql, [
      tenantId, dto.periodType||'MONTHLY', dto.periodYear, dto.periodMonth||null,
      dto.periodQuarter||null, dto.salesmanId||null, dto.salesmanName||null,
      dto.targetAmount||0, dto.targetQty||0, dto.notes||null, userId
    ]);
    return result[0];
  }

  async updateSalesTarget(tenantId: string, id: string, dto: any) {
    const sql = `UPDATE sales_targets SET target_amount=$1, target_qty=$2, salesman_id=$3, salesman_name=$4, notes=$5, updated_at=NOW() WHERE target_id=$6 AND tenant_id=$7 RETURNING *`;
    const result = await this.invoiceRepo.query(sql, [dto.targetAmount||0, dto.targetQty||0, dto.salesmanId||null, dto.salesmanName||null, dto.notes||null, id, tenantId]);
    return result[0];
  }

  async deleteSalesTarget(tenantId: string, id: string) {
    await this.invoiceRepo.query(`DELETE FROM sales_targets WHERE target_id=$1 AND tenant_id=$2`, [id, tenantId]);
    return { success: true };
  }

  async getSalesVsTarget(tenantId: string, year: number, month?: number) {
    // Get targets
    const targetSql = `SELECT * FROM sales_targets WHERE tenant_id=$1 AND period_year=$2 ${month?'AND period_month=$3':''}`;
    const targetParams: any[] = [tenantId, year];
    if (month) targetParams.push(month);
    const targets = await this.invoiceRepo.query(targetSql, targetParams);

    // Get actual sales by salesman and month
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
    const actualParams: any[] = [tenantId, year];
    if (month) actualParams.push(month);
    const actuals = await this.invoiceRepo.query(actualSql, actualParams);

    // Overall actual by month
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

    // Build monthly comparison
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthly = months.map((name, i) => {
      const m = i + 1;
      const target = targets.find((t:any) => !t.salesman_id && Number(t.period_month) === m);
      const actual = monthlyActuals.find((a:any) => Number(a.month) === m);
      const targetAmt = Number(target?.target_amount || 0);
      const actualAmt = Number(actual?.actual_amount || 0);
      return {
        month: name, monthNum: m,
        target: targetAmt,
        actual: actualAmt,
        variance: actualAmt - targetAmt,
        achievement: targetAmt > 0 ? Math.round((actualAmt / targetAmt) * 100) : 0,
        invoiceCount: Number(actual?.invoice_count || 0),
      };
    });

    // Salesman comparison
    const salesmanTargets = targets.filter((t:any) => t.salesman_id);
    const salesmanActuals = actuals;
    const salesmanMap: Record<string, any> = {};
    salesmanTargets.forEach((t:any) => {
      const key = t.salesman_id || 'unassigned';
      if (!salesmanMap[key]) salesmanMap[key] = { salesmanId: t.salesman_id, salesmanName: t.salesman_name, target: 0, actual: 0 };
      salesmanMap[key].target += Number(t.target_amount || 0);
    });
    salesmanActuals.forEach((a:any) => {
      const key = a.salesman_id || 'unassigned';
      if (!salesmanMap[key]) salesmanMap[key] = { salesmanId: a.salesman_id, salesmanName: a.salesman_name, target: 0, actual: 0 };
      salesmanMap[key].actual += Number(a.actual_amount || 0);
    });
    const bySalesman = Object.values(salesmanMap).map((s:any) => ({
      ...s,
      variance: s.actual - s.target,
      achievement: s.target > 0 ? Math.round((s.actual / s.target) * 100) : 0,
    }));

    const totalTarget = monthly.reduce((s, m) => s + m.target, 0);
    const totalActual = monthly.reduce((s, m) => s + m.actual, 0);

    return {
      year, month: month||null, targets, monthly, bySalesman,
      summary: {
        totalTarget, totalActual,
        totalVariance: totalActual - totalTarget,
        achievement: totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0,
      }
    };
  }

  // ── Daily Report ──────────────────────────────────────────────
  async getDailyReport(tenantId: string, date?: string) {
    const reportDate = date || new Date().toISOString().slice(0, 10);
    const invoices = await this.invoiceRepo.createQueryBuilder("i").where("i.tenantId = :tid AND DATE(i.createdAt) = :d", { tid: tenantId, d: reportDate }).getMany();
    const receipts = await this.receiptRepo.createQueryBuilder("r").where("r.tenantId = :tid AND DATE(r.createdAt) = :d", { tid: tenantId, d: reportDate }).getMany();
    const quotations = await this.quotationRepo.createQueryBuilder("q").where("q.tenantId = :tid AND DATE(q.createdAt) = :d", { tid: tenantId, d: reportDate }).getMany();
    return {
      invoices, receipts, quotations,
      totalSales: invoices.reduce((s,i) => s + Number(i.totalAmount||0), 0),
      totalReceipts: receipts.reduce((s,r) => s + Number(r.amount||0), 0),
      totalVat: invoices.reduce((s,i) => s + Number(i.vatAmount||0), 0),
      invoiceCount: invoices.length, receiptCount: receipts.length,
    };
  }

  // ── Bank Reconciliation ───────────────────────────────────────
  async getBankReconciliation(tenantId: string, fromDate?: string, toDate?: string) {
    const rQb = this.receiptRepo.createQueryBuilder("r").where("r.tenantId = :tid", { tid: tenantId });
    if (fromDate) rQb.andWhere("r.receiptDate >= :fromDate", { fromDate });
    if (toDate) rQb.andWhere("r.receiptDate <= :toDate", { toDate });
    const receipts = await rQb.getMany();

    const vQb = this.voucherRepo.createQueryBuilder("v").where("v.tenantId = :tid", { tid: tenantId });
    if (fromDate) vQb.andWhere("v.voucherDate >= :fromDate", { fromDate });
    if (toDate) vQb.andWhere("v.voucherDate <= :toDate", { toDate });
    const paymentVouchers = await vQb.getMany();

    return {
      receipts, paymentVouchers,
      totalReceipts: receipts.reduce((s,r) => s + Number(r.amount||0), 0),
      totalPayments: paymentVouchers.reduce((s,v) => s + Number(v.amount||0), 0),
      openingBalance: 0,
    };
  }

  // ── Liquidation Projection ────────────────────────────────────
  async getLiquidationProjection(tenantId: string, currentCash: number, salaries: number, rent: number) {
    const now = new Date();
    const periods = [30, 60, 90];
    const result = [];
    for (const days of periods) {
      const futureDate = new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);
      const arResult = await this.invoiceRepo.createQueryBuilder("i")
        .select("SUM(i.balanceDue)", "total")
        .where("i.tenantId = :tid AND i.status NOT IN (:...s) AND i.dueDate <= :d", { tid: tenantId, s: ["PAID","CANCELLED"], d: futureDate })
        .getRawOne();
      const apResult = await this.purchaseInvoiceRepo.createQueryBuilder("p")
        .select("SUM(p.balanceDue)", "total")
        .where("p.tenantId = :tid AND p.status NOT IN (:...s) AND p.dueDate <= :d", { tid: tenantId, s: ["PAID","CANCELLED"], d: futureDate })
        .getRawOne();
      const expectedAR = Number(arResult?.total || 0);
      const expectedAP = Number(apResult?.total || 0);
      const salaryObligation = salaries * Math.ceil(days / 30);
      const rentObligation = rent * Math.ceil(days / 30);
      const totalInflows = currentCash + expectedAR;
      const totalObligations = expectedAP + salaryObligation + rentObligation;
      const netPosition = totalInflows - totalObligations;
      result.push({ period: days, expectedAR, expectedAP, salaryObligation, rentObligation, totalInflows, totalObligations, netPosition, fundingGap: Math.min(0, netPosition), status: netPosition >= 0 ? "SUFFICIENT" : "DEFICIT" });
    }
    return { periods: result, currentCash };
  }

  // ── Credit Risk Statement ─────────────────────────────────────
  async getCreditRiskStatement(tenantId: string) {
    const rows = await this.invoiceRepo.query(`
      SELECT
        i.customer_name as "customerName",
        a.account_id::text as "accountId",
        COALESCE(a.credit_limit, 0) as "creditLimit",
        COALESCE(a.credit_period_days, 30) as "creditPeriodDays",
        COALESCE(a.credit_blocked, false) as "creditBlocked",
        COALESCE(SUM(i.balance_due), 0) as "outstanding",
        COALESCE(SUM(CASE WHEN i.due_date < CURRENT_DATE AND i.balance_due > 0 THEN i.balance_due ELSE 0 END), 0) as "overdueAmount",
        COALESCE(MAX(CASE WHEN i.due_date < CURRENT_DATE AND i.balance_due > 0 THEN CURRENT_DATE - i.due_date ELSE 0 END), 0) as "maxDaysOverdue",
        COUNT(i.invoice_id) as "invoiceCount",
        COALESCE(SUM(i.total_amount), 0) as "totalInvoiced",
        COALESCE(SUM(i.paid_amount), 0) as "totalPaid"
      FROM sales_invoices i
      LEFT JOIN accounts a ON a.account_name = i.customer_name AND a.tenant_id::text = i.tenant_id
      WHERE i.tenant_id = $1 AND i.status NOT IN ('CANCELLED','DRAFT')
      GROUP BY i.customer_name, a.account_id, a.credit_limit, a.credit_period_days, a.credit_blocked
      ORDER BY "outstanding" DESC
    `, [tenantId]);

    const customers = rows.map((c: any) => {
      const outstanding = Number(c.outstanding || 0);
      const creditLimit = Number(c.creditLimit || 0);
      const overdueAmount = Number(c.overdueAmount || 0);
      const maxDaysOverdue = Number(c.maxDaysOverdue || 0);
      const utilization = creditLimit > 0 ? (outstanding / creditLimit) * 100 : 0;
      let riskScore = 0;
      if (overdueAmount > 0) riskScore += 30;
      if (maxDaysOverdue > 90) riskScore += 40;
      else if (maxDaysOverdue > 60) riskScore += 30;
      else if (maxDaysOverdue > 30) riskScore += 20;
      if (creditLimit > 0 && utilization > 100) riskScore += 40;
      else if (creditLimit > 0 && utilization > 80) riskScore += 20;
      const riskLevel = riskScore >= 70 ? "CRITICAL" : riskScore >= 40 ? "HIGH" : riskScore >= 20 ? "MEDIUM" : "LOW";
      return {
        customerName: c.customerName,
        accountId: c.accountId,
        creditLimit,
        creditPeriodDays: Number(c.creditPeriodDays || 30),
        creditBlocked: c.creditBlocked,
        outstanding,
        overdueAmount,
        maxDaysOverdue,
        invoiceCount: Number(c.invoiceCount || 0),
        totalInvoiced: Number(c.totalInvoiced || 0),
        totalPaid: Number(c.totalPaid || 0),
        utilization: Math.round(utilization),
        riskScore,
        riskLevel,
      };
    });
    return {
      customers,
      totalExposure: customers.reduce((s: number, c: any) => s + c.overdueAmount, 0),
      totalOutstanding: customers.reduce((s: number, c: any) => s + c.outstanding, 0),
      highRiskCount: customers.filter((c: any) => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length,
    };
  }

  // ── Warehouses ────────────────────────────────────────────────
  async getWarehouses(tenantId: string, search?: string) {
    const qb = this.warehouseRepo.createQueryBuilder('w')
      .where('w.tenantId = :tid AND w.isActive = true', { tid: tenantId });
    if (search) qb.andWhere('(w.warehouseName ILIKE :s OR w.warehouseCode ILIKE :s)', { s: `%${search}%` });
    return qb.orderBy('w.warehouseName', 'ASC').getMany();
  }
  async createWarehouse(tenantId: string, dto: any, userId: string) {
    const w = this.warehouseRepo.create({ ...dto, tenantId, createdBy: userId });
    return this.warehouseRepo.save(w);
  }
  async updateWarehouse(tenantId: string, id: string, dto: any) {
    await this.warehouseRepo.update({ warehouseId: id, tenantId }, dto);
    return this.warehouseRepo.findOne({ where: { warehouseId: id } });
  }
  async deleteWarehouse(tenantId: string, id: string) {
    await this.warehouseRepo.update({ warehouseId: id, tenantId }, { isActive: false });
    return { success: true };
  }

  // ── Warehouse Locations ───────────────────────────────────────
  async getLocations(tenantId: string, warehouseId?: string) {
    const qb = this.locationRepo.createQueryBuilder('l')
      .where('l.tenantId = :tid AND l.isActive = true', { tid: tenantId });
    if (warehouseId) qb.andWhere('l.warehouseId = :wid', { wid: warehouseId });
    return qb.orderBy('l.locationCode', 'ASC').getMany();
  }
  async createLocation(tenantId: string, dto: any) {
    const l = this.locationRepo.create({ ...dto, tenantId });
    return this.locationRepo.save(l);
  }
  async updateLocation(tenantId: string, id: string, dto: any) {
    await this.locationRepo.update({ locationId: id, tenantId }, dto);
    return this.locationRepo.findOne({ where: { locationId: id } });
  }
  async deleteLocation(tenantId: string, id: string) {
    await this.locationRepo.update({ locationId: id, tenantId }, { isActive: false });
    return { success: true };
  }

  // ── Stock Transfers ───────────────────────────────────────────
  async getStockTransfers(tenantId: string, page = 1, limit = 20, search?: string) {
    const qb = this.transferRepo.createQueryBuilder('t').where('t.tenantId = :tid', { tid: tenantId });
    if (search) qb.andWhere('(t.transferNumber ILIKE :s OR t.fromWarehouse ILIKE :s OR t.toWarehouse ILIKE :s)', { s: `%${search}%` });
    qb.orderBy('t.createdAt', 'DESC').skip((page-1)*limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
  async getStockTransfer(tenantId: string, id: string) {
    const t = await this.transferRepo.findOne({ where: { transferId: id, tenantId }, relations: ['items'] });
    if (!t) throw new NotFoundException('Stock Transfer not found');
    return t;
  }
  async createStockTransfer(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('ST', this.transferRepo, 'transferNumber');
    const { items, ...header } = dto;
    const t = this.transferRepo.create({ ...header, tenantId, transferNumber: number, createdBy: userId });
    const saved = await this.transferRepo.save(t) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.transferItemRepo.create({ ...item, transferId: saved.transferId, lineNumber: idx + 1 })
      );
      await this.transferItemRepo.save(lineItems);
    }
    return this.getStockTransfer(tenantId, saved.transferId);
  }
  async updateStockTransfer(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.transferRepo.update({ transferId: id, tenantId }, header);
    if (items) {
      await this.transferItemRepo.delete({ transferId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.transferItemRepo.create({ ...item, transferId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.transferItemRepo.save(lineItems);
    }
    return this.getStockTransfer(tenantId, id);
  }
  async confirmStockTransfer(tenantId: string, id: string, userId: string) {
    const transfer = await this.getStockTransfer(tenantId, id) as any;
    // A transfer is QUANTITY- and VALUE-neutral at company level: it only relocates stock.
    // It must NOT post a P&L journal and must NOT distort costing (no layer consume/recreate).
    // We move the per-location ledger from source to destination and record movement audit rows
    // at zero cost effect (stock_qty unchanged overall).
    for (const item of transfer.items) {
      if (!item.productId) continue;
      const qty = Number(item.quantity);
      const fromLoc = item.fromLocationId || transfer.fromLocationId;
      const toLoc = item.toLocationId || transfer.toLocationId;
      // Move location ledger: deduct at source, add at destination — quantity only.
      try {
        if (fromLoc) await this.deductLocationStockAt(tenantId, item.productId, fromLoc, qty);
        if (toLoc) await this.addLocationStock(tenantId, item.productId, toLoc, qty);
      } catch (e) { console.warn('Transfer location move failed:', (e as any)?.message); }
      // Audit movement rows (TRANSFER_OUT / TRANSFER_IN) — these do NOT change products.stock_qty
      // and do NOT touch cost layers, so total quantity and valuation are preserved.
      const moveOut = this.stockRepo.create({
        tenantId, productId: item.productId, movementType: 'TRANSFER_OUT', quantity: qty,
        referenceNumber: transfer.transferNumber, createdBy: userId,
        ...(fromLoc ? { warehouseId: fromLoc } : {}),
      });
      const moveIn = this.stockRepo.create({
        tenantId, productId: item.productId, movementType: 'TRANSFER_IN', quantity: qty,
        referenceNumber: transfer.transferNumber, createdBy: userId,
        ...(toLoc ? { warehouseId: toLoc } : {}),
      });
      await this.stockRepo.save([moveOut, moveIn]);
    }
    await this.transferRepo.update({ transferId: id, tenantId }, { status: 'COMPLETED' });
    return this.getStockTransfer(tenantId, id);
  }

  // Deduct location ledger at a SPECIFIC location (used by transfers — exact source location)
  async deductLocationStockAt(tenantId: string, productId: string, locationId: string, qty: number) {
    const rows = await this.productRepo.query(
      `SELECT stock_id::text as stock_id, quantity FROM product_warehouse_stock
       WHERE tenant_id::text = $1 AND product_id::text = $2 AND location_id::text = $3`,
      [tenantId, productId, locationId]
    );
    if (!rows.length) return;
    await this.productRepo.query(
      `UPDATE product_warehouse_stock SET quantity = quantity - $1,
         available_qty = quantity - $1 - reserved_qty, updated_at = now()
       WHERE stock_id::text = $2`,
      [qty, rows[0].stock_id]
    );
  }
  async deleteStockTransfer(tenantId: string, id: string) {
    await this.transferRepo.delete({ transferId: id, tenantId });
    return { success: true };
  }

  // ── Stock Adjustments ─────────────────────────────────────────
  async getStockAdjustments(tenantId: string, page = 1, limit = 20, search?: string) {
    const qb = this.adjustmentRepo.createQueryBuilder('a').where('a.tenantId = :tid', { tid: tenantId });
    if (search) qb.andWhere('(a.adjustmentNumber ILIKE :s OR a.reason ILIKE :s)', { s: `%${search}%` });
    qb.orderBy('a.createdAt', 'DESC').skip((page-1)*limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
  async getStockAdjustment(tenantId: string, id: string) {
    const a = await this.adjustmentRepo.findOne({ where: { adjustmentId: id, tenantId }, relations: ['items'] });
    if (!a) throw new NotFoundException('Stock Adjustment not found');
    return a;
  }
  async createStockAdjustment(tenantId: string, dto: any, userId: string) {
    const number = await this.generateNumber('ADJ', this.adjustmentRepo, 'adjustmentNumber');
    const { items, ...header } = dto;
    const a = this.adjustmentRepo.create({ ...header, tenantId, adjustmentNumber: number, createdBy: userId });
    const saved = await this.adjustmentRepo.save(a) as any;
    if (items?.length) {
      const lineItems = items.map((item: any, idx: number) =>
        this.adjustmentItemRepo.create({ ...item, adjustmentId: saved.adjustmentId, lineNumber: idx + 1 })
      );
      await this.adjustmentItemRepo.save(lineItems);
      if (dto.status === 'CONFIRMED') {
        const adjType = header.adjustmentType || 'IN';
        const isIncrease = adjType === 'IN';
        let totalValue = 0;
        for (const item of items) {
          if (!item.productId) continue;
          const qty = Number(item.quantity);
          if (isIncrease) {
            // Stock In: value at provided unit cost (or product cost). adjustStock creates a cost layer.
            const unitCost = Number(item.unitCost ?? 0);
            await this.adjustStock(tenantId, item.productId, qty, 'IN', number, userId, item.warehouseLocationId, unitCost);
            // Determine the value added (unit cost may have fallen back to product cost)
            let lineCost = unitCost * qty;
            if (!unitCost) {
              const pr = await this.productRepo.query(`SELECT COALESCE(avg_cost,cost_price,0) as c FROM products WHERE product_id::text=$1`, [item.productId]);
              lineCost = Number(pr[0]?.c || 0) * qty;
            }
            totalValue += lineCost;
          } else {
            // Stock Out: adjustStock computes issue cost (FIFO/AVCO) and returns it
            const res: any = await this.adjustStock(tenantId, item.productId, qty, 'OUT', number, userId, item.warehouseLocationId);
            totalValue += Number(res?.issueCost || 0);
          }
        }
        // GL journal at cost value
        if (totalValue > 0) {
          const adjDate = (header.adjustmentDate || header.date || new Date().toISOString()).slice(0,10);
          const lines = isIncrease
            ? [
                { accountCode: '1140', description: `Inventory adjustment (gain) - ${number}`, debitAmount: Number(totalValue.toFixed(3)), creditAmount: 0 },
                { accountCode: '4900', description: `Inventory Adjustment Gain - ${number}`, debitAmount: 0, creditAmount: Number(totalValue.toFixed(3)) },
              ]
            : [
                { accountCode: '5110', description: `Inventory Adjustment Loss - ${number}`, debitAmount: Number(totalValue.toFixed(3)), creditAmount: 0 },
                { accountCode: '1140', description: `Inventory adjustment (write-off) - ${number}`, debitAmount: 0, creditAmount: Number(totalValue.toFixed(3)) },
              ];
          await this.createAutoJournalEntry(tenantId, userId, {
            voucherNumber: number, description: `Stock Adjustment ${number}${header.reason ? ' - ' + header.reason : ''}`,
            voucherDate: adjDate, lines,
          });
        }
      }
    }
    return this.getStockAdjustment(tenantId, saved.adjustmentId);
  }
  async updateStockAdjustment(tenantId: string, id: string, dto: any) {
    const { items, ...header } = dto;
    await this.adjustmentRepo.update({ adjustmentId: id, tenantId }, header);
    if (items) {
      await this.adjustmentItemRepo.delete({ adjustmentId: id });
      const lineItems = items.map((item: any, idx: number) =>
        this.adjustmentItemRepo.create({ ...item, adjustmentId: id, lineNumber: idx + 1 })
      );
      if (lineItems.length) await this.adjustmentItemRepo.save(lineItems);
    }
    return this.getStockAdjustment(tenantId, id);
  }
  async deleteStockAdjustment(tenantId: string, id: string) {
    await this.adjustmentRepo.delete({ adjustmentId: id, tenantId });
    return { success: true };
  }

  // ── Auto Journal Entry Helper ────────────────────────────────
  private async createAutoJournalEntry(tenantId: string, userId: string, dto: {
    voucherNumber: string, description: string, voucherDate: string,
    lines: { accountCode: string, description: string, debitAmount: number, creditAmount: number }[]
  }) {
    try {
      console.log('[JV] Creating auto journal entry for:', dto.voucherNumber, 'tenant:', tenantId);
      // Get account IDs from codes
      const getAccountId = async (code: string) => {
        const acc = await this.coaRepo.findOne({ where: { tenantId, accountCode: code } } as any);
        return acc?.accountId || null;
      };

      const jvNumber = await this.generateNumber('JV', this.jvRepo, 'voucherNumber');
      const totalDebit = dto.lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0);
      const totalCredit = dto.lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0);

      const jv = this.jvRepo.create({
        tenantId, voucherNumber: jvNumber, voucherType: 'JOURNAL',
        description: dto.description, voucherDate: dto.voucherDate,
        status: 'POSTED', createdBy: userId, totalDebit, totalCredit,
        reference: dto.voucherNumber,
      } as any);
      const savedJV = await this.jvRepo.save(jv) as any;

      // Create lines
      for (let i = 0; i < dto.lines.length; i++) {
        const line = dto.lines[i];
        const acc = await this.coaRepo.findOne({ where: { tenantId, accountCode: line.accountCode } } as any);
        if (!acc) continue;
        await this.jvLineRepo.save(this.jvLineRepo.create({
          voucherId: savedJV.voucherId, lineNumber: i + 1,
          accountId: acc.accountId, accountCode: acc.accountCode,
          accountName: acc.accountName,
          description: line.description,
          debitAmount: line.debitAmount, creditAmount: line.creditAmount,
        } as any));
      }
      return savedJV;
    } catch (e: any) {
      console.error('Auto journal entry failed:', e?.message || e);
    }
  }


  // ── Opening Balance Engine (Phase 1) ──────────────────────────
  // Posts a balanced opening-balance journal dated to the migration cut-off.
  // Caller supplies the known opening lines; this method auto-inserts the
  // Opening Balance Equity (3900) contra line so the entry always balances.
  // Every opening-balance phase (stock, AR, AP, assets, bank) calls this.
  async postOpeningBalanceJournal(
    tenantId: string,
    userId: string,
    cutoffDate: string,
    lines: { accountCode: string; description?: string; debitAmount?: number; creditAmount?: number }[],
    narration?: string,
  ): Promise<{ voucherId: string; voucherNumber: string; totalDebit: number; totalCredit: number } | null> {
    const OBE_CODE = '3900';
    try {
      if (!lines || lines.length === 0) {
        throw new Error('No opening balance lines provided');
      }

      // 1. Compute totals of the supplied lines
      const sumDebit = lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0);
      const sumCredit = lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0);

      // 2. Determine the OBE balancing entry (rounded to 3 dp to match GL scale)
      const diff = Math.round((sumDebit - sumCredit) * 1000) / 1000;
      const allLines = [...lines];
      if (Math.abs(diff) > 0.0005) {
        // If supplied debits exceed credits, OBE takes the credit (and vice-versa)
        allLines.push({
          accountCode: OBE_CODE,
          description: 'Opening Balance Equity (contra)',
          debitAmount: diff < 0 ? Math.abs(diff) : 0,
          creditAmount: diff > 0 ? diff : 0,
        });
      }

      // 3. Resolve every account code up-front; fail loudly if any is missing
      const resolved: { accountId: string; accountCode: string; accountName: string;
                        description: string; debitAmount: number; creditAmount: number }[] = [];
      for (const l of allLines) {
        const acc = await this.coaRepo.findOne({ where: { tenantId, accountCode: l.accountCode } } as any);
        if (!acc) throw new Error(`Account ${l.accountCode} not found for tenant`);
        resolved.push({
          accountId: acc.accountId, accountCode: acc.accountCode, accountName: acc.accountName,
          description: l.description || narration || 'Opening balance',
          debitAmount: Number(l.debitAmount || 0), creditAmount: Number(l.creditAmount || 0),
        });
      }

      // 4. Final balance guard — must be balanced after OBE contra
      const tDr = resolved.reduce((s, l) => s + l.debitAmount, 0);
      const tCr = resolved.reduce((s, l) => s + l.creditAmount, 0);
      if (Math.abs(tDr - tCr) > 0.0005) {
        throw new Error(`Opening journal not balanced: Dr ${tDr} vs Cr ${tCr}`);
      }

      // 5. Create the posted voucher (type OPENING, dated to cut-off)
      const jvNumber = await this.generateNumber('OB', this.jvRepo, 'voucherNumber');
      const jv = this.jvRepo.create({
        tenantId, voucherNumber: jvNumber, voucherType: 'OPENING',
        description: narration || `Opening balance as at ${cutoffDate}`,
        voucherDate: cutoffDate, status: 'POSTED', isPosted: true,
        postedAt: new Date(), postedBy: userId, createdBy: userId,
        totalDebit: tDr, totalCredit: tCr, reference: 'OPENING',
      } as any);
      const savedJV = await this.jvRepo.save(jv) as any;

      // 6. Lines
      for (let i = 0; i < resolved.length; i++) {
        const l = resolved[i];
        await this.jvLineRepo.save(this.jvLineRepo.create({
          voucherId: savedJV.voucherId, lineNumber: i + 1,
          accountId: l.accountId, accountCode: l.accountCode, accountName: l.accountName,
          description: l.description, debitAmount: l.debitAmount, creditAmount: l.creditAmount,
          reference: 'OPENING',
        } as any));
      }

      return { voucherId: savedJV.voucherId, voucherNumber: jvNumber, totalDebit: tDr, totalCredit: tCr };
    } catch (e: any) {
      console.error('postOpeningBalanceJournal failed:', e?.message || e);
      throw e; // opening balances must fail loudly, not silently
    }
  }


  // ── Opening Stock (Phase 2) ────────────────────────────────────
  // Loads opening stock for regular AND consumable products, creating cost
  // layers (so COGS works) and posting one balanced opening journal
  // (Dr Inventory / Cr OBE) via the Phase 1 engine. This is the correct
  // migration path for stock on hand — no fake GRN required.
  async postOpeningStock(
    tenantId: string,
    userId: string,
    cutoffDate: string,
    items: { productId?: string; productCode?: string; quantity: number; unitCost: number }[],
    narration?: string,
  ): Promise<{ voucherNumber: string | null; itemsLoaded: number; totalValue: number; skipped: string[] }> {
    if (!items || items.length === 0) {
      throw new Error('No opening stock items provided');
    }

    const INVENTORY_CODE = '1140';
    let totalValue = 0;
    let itemsLoaded = 0;
    const skipped: string[] = [];
    const ref = `OPENING-STOCK-${cutoffDate}`;

    for (const it of items) {
      const qty = Number(it.quantity);
      const cost = Number(it.unitCost);
      if (!Number.isFinite(qty) || qty <= 0) { skipped.push(`${it.productCode || it.productId}: invalid qty`); continue; }
      if (!Number.isFinite(cost) || cost < 0) { skipped.push(`${it.productCode || it.productId}: invalid cost`); continue; }

      // Resolve the product
      let product: any = null;
      if (it.productId) {
        product = await this.productRepo.findOne({ where: { tenantId, productId: it.productId } } as any);
      } else if (it.productCode) {
        product = await this.productRepo.findOne({ where: { tenantId, productCode: it.productCode } } as any);
      }
      if (!product) { skipped.push(`${it.productCode || it.productId}: product not found`); continue; }

      const lineValue = Math.round(qty * cost * 1000) / 1000;

      try {
        if (product.productType === 'CONSUMABLE') {
          // Consumable opening stock -> consumable_stock (the correct consumables fix)
          await this.receiveConsumable(tenantId, product.productId, qty, ref, userId);
        } else if (product.productType === 'SERVICE') {
          skipped.push(`${product.productCode}: service items have no stock`); continue;
        } else {
          // Regular stock -> adjustStock IN creates the cost layer + updates qty
          await this.adjustStock(tenantId, product.productId, qty, 'IN', ref, userId, undefined, cost);
        }
        totalValue += lineValue;
        itemsLoaded += 1;
      } catch (e: any) {
        skipped.push(`${product.productCode}: ${e?.message || 'load failed'}`);
      }
    }

    // Post ONE opening journal for the total inventory value: Dr Inventory / Cr OBE
    let voucherNumber: string | null = null;
    if (totalValue > 0.0005) {
      const jv = await this.postOpeningBalanceJournal(
        tenantId, userId, cutoffDate,
        [{ accountCode: INVENTORY_CODE, description: 'Opening stock on hand', debitAmount: totalValue }],
        narration || `Opening stock as at ${cutoffDate}`,
      );
      voucherNumber = jv?.voucherNumber || null;
    }

    return { voucherNumber, itemsLoaded, totalValue, skipped };
  }


  // ── Opening AR (Phase 3) ───────────────────────────────────────
  // Loads unpaid customer invoices as INDIVIDUAL open items (real
  // sales_invoices rows) so aging, statements, credit checks and receipt
  // allocation all work. Posts the grand total to AR control / OBE.
  async postOpeningAR(
    tenantId: string,
    userId: string,
    cutoffDate: string,
    items: { invoiceNumber: string; invoiceDate: string; dueDate?: string;
             accountId?: string; customerName: string; totalAmount: number;
             outstandingAmount: number }[],
    narration?: string,
    partyTotals?: { customerName: string; total: number }[],
  ): Promise<any> {
    if (!items || items.length === 0) throw new Error('No open AR items provided');
    const AR_CODE = '1130';
    const loaded: any[] = []; const skipped: string[] = [];
    let grandOutstanding = 0;
    const perParty: Record<string, number> = {};

    let customersCreated = 0;
    for (const it of items) {
      const total = Number(it.totalAmount);
      const out = Number(it.outstandingAmount);
      if (!it.invoiceNumber) { skipped.push('(missing invoice number)'); continue; }
      if (!Number.isFinite(total) || total <= 0) { skipped.push(`${it.invoiceNumber}: invalid total`); continue; }
      if (!Number.isFinite(out) || out < 0 || out > total + 0.0005) { skipped.push(`${it.invoiceNumber}: invalid outstanding`); continue; }

      const paid = Math.round((total - out) * 1000) / 1000;
      const status = out <= 0.0005 ? 'PAID' : (paid > 0.0005 ? 'PARTIALLY_PAID' : 'SENT');
      const _cust = await this.findOrCreateCustomer(tenantId, it.customerName, it);
      if (_cust.created) customersCreated++;
      const _arAccountId = (it as any).accountId || _cust.id || null;
      try {
        await this.invoiceRepo.query(
          `INSERT INTO sales_invoices
             (tenant_id, invoice_number, invoice_date, due_date, account_id, contact_id, customer_name,
              customer_address, customer_email, customer_trn,
              subtotal, discount_amount, vat_rate, vat_amount, total_amount, paid_amount, balance_due,
              currency_code, exchange_rate, payment_terms, salesman_name,
              status, is_inventory, notes, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,false,$23,$24)`,
          [tenantId, it.invoiceNumber, it.invoiceDate, it.dueDate || it.invoiceDate,
           _arAccountId, (it as any).contactId || null, it.customerName,
           (it as any).customerAddress || null, (it as any).customerEmail || null, (it as any).customerTrn || null,
           Number((it as any).subtotal ?? total), Number((it as any).discountAmount || 0),
           Number((it as any).vatRate ?? 0), Number((it as any).vatAmount || 0),
           total, paid, out,
           (it as any).currencyCode || 'OMR', Number((it as any).exchangeRate || 1),
           (it as any).paymentTerms || null, (it as any).salesmanName || null, status,
           `${(it as any).notes ? (it as any).notes + ' | ' : ''}Opening balance (migrated) as at ${cutoffDate}`, userId]
        );
        if (out > 0.0005) grandOutstanding += out;
        perParty[it.customerName] = (perParty[it.customerName] || 0) + out;
        loaded.push({ invoiceNumber: it.invoiceNumber, outstanding: out, status });
      } catch (e: any) {
        skipped.push(`${it.invoiceNumber}: ${e?.message || 'insert failed'}`);
      }
    }

    // Per-party tally validation (if expected totals supplied)
    const tallyMismatches: any[] = [];
    if (partyTotals) {
      for (const pt of partyTotals) {
        const actual = Math.round((perParty[pt.customerName] || 0) * 1000) / 1000;
        const expected = Math.round(Number(pt.total) * 1000) / 1000;
        if (Math.abs(actual - expected) > 0.0005) {
          tallyMismatches.push({ customer: pt.customerName, expected, actual });
        }
      }
    }

    // Post grand total to AR control / OBE
    let voucherNumber: string | null = null;
    if (grandOutstanding > 0.0005) {
      const jv = await this.postOpeningBalanceJournal(
        tenantId, userId, cutoffDate,
        [{ accountCode: AR_CODE, description: 'Opening accounts receivable', debitAmount: grandOutstanding }],
        narration || `Opening AR as at ${cutoffDate}`,
      );
      voucherNumber = jv?.voucherNumber || null;
    }

    return { itemsLoaded: loaded.length, grandOutstanding, voucherNumber,
             perParty, tallyMismatches, skipped, customersCreated };
  }

  // ── Opening AP (Phase 3) ───────────────────────────────────────
  // Loads unpaid supplier bills as INDIVIDUAL open items (real
  // purchase_invoices rows). Posts the grand total to OBE / AP control.
  async postOpeningAP(
    tenantId: string,
    userId: string,
    cutoffDate: string,
    items: { invoiceNumber: string; invoiceDate: string; dueDate?: string;
             supplierId?: string; supplierName: string; totalAmount: number;
             outstandingAmount: number }[],
    narration?: string,
    partyTotals?: { supplierName: string; total: number }[],
  ): Promise<any> {
    if (!items || items.length === 0) throw new Error('No open AP items provided');
    const AP_CODE = '2110';
    const loaded: any[] = []; const skipped: string[] = [];
    let grandOutstanding = 0;
    let suppliersCreated = 0;
    const perParty: Record<string, number> = {};

    for (const it of items) {
      const total = Number(it.totalAmount);
      const out = Number(it.outstandingAmount);
      if (!it.invoiceNumber) { skipped.push('(missing bill number)'); continue; }
      if (!Number.isFinite(total) || total <= 0) { skipped.push(`${it.invoiceNumber}: invalid total`); continue; }
      if (!Number.isFinite(out) || out < 0 || out > total + 0.0005) { skipped.push(`${it.invoiceNumber}: invalid outstanding`); continue; }

      const paid = Math.round((total - out) * 1000) / 1000;
      const status = out <= 0.0005 ? 'PAID' : 'RECEIVED';
      const _supp = await this.findOrCreateSupplier(tenantId, it.supplierName, it);
      if (_supp.created) suppliersCreated++;
      const _apSupplierId = (it as any).supplierId || _supp.id || null;
      try {
        await this.purchaseInvoiceRepo.query(
          `INSERT INTO purchase_invoices
             (tenant_id, invoice_number, supplier_invoice_no, invoice_date, due_date, supplier_id, supplier_name,
              supplier_address, supplier_trn,
              subtotal, discount_amount, vat_rate, vat_amount, total_amount, paid_amount, balance_due,
              currency_code, exchange_rate, payment_terms, status, is_inventory, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,false,$21)`,
          [tenantId, it.invoiceNumber, (it as any).supplierInvoiceNo || it.invoiceNumber,
           it.invoiceDate, it.dueDate || it.invoiceDate,
           _apSupplierId, it.supplierName,
           (it as any).supplierAddress || null, (it as any).supplierTrn || null,
           Number((it as any).subtotal ?? total), Number((it as any).discountAmount || 0),
           Number((it as any).vatRate ?? 0), Number((it as any).vatAmount || 0),
           total, paid, out,
           (it as any).currencyCode || 'OMR', Number((it as any).exchangeRate || 1),
           (it as any).paymentTerms || null, status,
           `${(it as any).notes ? (it as any).notes + ' | ' : ''}Opening balance (migrated) as at ${cutoffDate}`]
        );
        if (out > 0.0005) grandOutstanding += out;
        perParty[it.supplierName] = (perParty[it.supplierName] || 0) + out;
        loaded.push({ invoiceNumber: it.invoiceNumber, outstanding: out, status });
      } catch (e: any) {
        skipped.push(`${it.invoiceNumber}: ${e?.message || 'insert failed'}`);
      }
    }

    const tallyMismatches: any[] = [];
    if (partyTotals) {
      for (const pt of partyTotals) {
        const actual = Math.round((perParty[pt.supplierName] || 0) * 1000) / 1000;
        const expected = Math.round(Number(pt.total) * 1000) / 1000;
        if (Math.abs(actual - expected) > 0.0005) {
          tallyMismatches.push({ supplier: pt.supplierName, expected, actual });
        }
      }
    }

    let voucherNumber: string | null = null;
    if (grandOutstanding > 0.0005) {
      const jv = await this.postOpeningBalanceJournal(
        tenantId, userId, cutoffDate,
        [{ accountCode: AP_CODE, description: 'Opening accounts payable', creditAmount: grandOutstanding }],
        narration || `Opening AP as at ${cutoffDate}`,
      );
      voucherNumber = jv?.voucherNumber || null;
    }

    return { itemsLoaded: loaded.length, grandOutstanding, voucherNumber,
             perParty, tallyMismatches, skipped, suppliersCreated };
  }


  // ── Opening Fixed Assets (Phase 4) ─────────────────────────────
  // Loads the existing fixed-asset register at migration. Each asset becomes
  // a real fixed_assets row (so depreciation continues correctly), carrying
  // its cost and accumulated depreciation to date. Posts the aggregate:
  // Dr Asset cost (1210) / Cr Accum Depreciation (1220) / net to OBE.
  async postOpeningFixedAssets(
    tenantId: string,
    userId: string,
    cutoffDate: string,
    assets: { assetName: string; category?: string; purchaseDate?: string;
              cost: number; accumulatedDepreciation?: number;
              usefulLifeYears?: number; salvageValue?: number;
              depreciationMethod?: string }[],
    narration?: string,
  ): Promise<any> {
    if (!assets || assets.length === 0) throw new Error('No opening assets provided');
    const ASSET_CODE = '1210';   // Property, Plant & Equipment
    const ACCUM_CODE = '1220';   // Accumulated Depreciation
    const loaded: any[] = []; const skipped: string[] = [];
    let totalCost = 0, totalAccum = 0;

    // Continue asset code numbering from the current max
    const cntRows = await this.fixedAssetRepo.query(
      `SELECT COUNT(*)::int AS c FROM fixed_assets WHERE tenant_id=$1`, [tenantId]);
    let seq = Number(cntRows[0]?.c || 0);

    for (const a of assets) {
      const cost = Number(a.cost);
      const accum = Number(a.accumulatedDepreciation || 0);
      if (!a.assetName) { skipped.push('(missing asset name)'); continue; }
      if (!Number.isFinite(cost) || cost <= 0) { skipped.push(`${a.assetName}: invalid cost`); continue; }
      if (!Number.isFinite(accum) || accum < 0 || accum > cost + 0.0005) { skipped.push(`${a.assetName}: invalid accumulated depreciation`); continue; }

      seq += 1;
      const assetCode = `AST-${String(seq).padStart(4, '0')}`;
      const bookValue = Math.round((cost - accum) * 1000) / 1000;
      try {
        await this.fixedAssetRepo.query(
          `INSERT INTO fixed_assets
             (tenant_id, asset_code, asset_name, category, sub_category, brand, model, serial_number,
              purchase_date, purchase_cost, supplier_name,
              useful_life_years, salvage_value, depreciation_method,
              accumulated_depreciation, current_book_value, status,
              location_name, department, assigned_to_name, warranty_expiry, insurance_expiry,
              coa_asset_account, coa_accum_depr_account, notes, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'ACTIVE',$17,$18,$19,$20,$21,$22,$23,$24,true)`,
          [tenantId, assetCode, a.assetName, a.category || 'General',
           (a as any).subCategory || null, (a as any).brand || null, (a as any).model || null, (a as any).serialNumber || null,
           a.purchaseDate || cutoffDate, cost, (a as any).supplierName || null,
           a.usefulLifeYears || null, a.salvageValue || 0,
           a.depreciationMethod || 'STRAIGHT_LINE',
           accum, bookValue,
           (a as any).locationName || null, (a as any).department || null, (a as any).assignedToName || null,
           (a as any).warrantyExpiry || null, (a as any).insuranceExpiry || null,
           ASSET_CODE, ACCUM_CODE,
           `Opening balance (migrated) as at ${cutoffDate}`]
        );
        totalCost += cost; totalAccum += accum;
        loaded.push({ assetCode, assetName: a.assetName, cost, accumulatedDepreciation: accum, bookValue });
      } catch (e: any) {
        skipped.push(`${a.assetName}: ${e?.message || 'insert failed'}`);
      }
    }

    // Post aggregate: Dr Asset cost, Cr Accum Dep; engine adds OBE for the net book value
    let voucherNumber: string | null = null;
    if (totalCost > 0.0005) {
      const lines: any[] = [
        { accountCode: ASSET_CODE, description: 'Opening fixed assets at cost', debitAmount: totalCost },
      ];
      if (totalAccum > 0.0005) {
        lines.push({ accountCode: ACCUM_CODE, description: 'Opening accumulated depreciation', creditAmount: totalAccum });
      }
      const jv = await this.postOpeningBalanceJournal(
        tenantId, userId, cutoffDate, lines,
        narration || `Opening fixed assets as at ${cutoffDate}`,
      );
      voucherNumber = jv?.voucherNumber || null;
    }

    return { assetsLoaded: loaded.length, totalCost, totalAccumulatedDepreciation: totalAccum,
             netBookValue: Math.round((totalCost - totalAccum) * 1000) / 1000,
             voucherNumber, loaded, skipped };
  }

  // ── Opening Direct GL (Phase 4) ────────────────────────────────
  // Catch-all for any remaining trial-balance accounts not covered by the
  // other phases — bank, cash, loans, prepayments, capital, retained
  // earnings, etc. Lines pass straight to the OBE engine, which balances them.
  async postOpeningGL(
    tenantId: string,
    userId: string,
    cutoffDate: string,
    lines: { accountCode: string; description?: string; debitAmount?: number; creditAmount?: number }[],
    narration?: string,
  ): Promise<any> {
    if (!lines || lines.length === 0) throw new Error('No opening GL lines provided');
    const jv = await this.postOpeningBalanceJournal(
      tenantId, userId, cutoffDate, lines,
      narration || `Opening GL balances as at ${cutoffDate}`,
    );
    return { voucherNumber: jv?.voucherNumber || null,
             totalDebit: jv?.totalDebit, totalCredit: jv?.totalCredit };
  }


  // ── Opening Trial Balance (Phase 5 verification) ───────────────
  // Returns the opening position: every account touched by OPENING journals
  // with its net debit/credit, plus totals and a balanced flag. Drives the
  // verification screen the customer confirms before going live.
  async getOpeningTrialBalance(tenantId: string): Promise<any> {
    const rows = await this.jvRepo.query(
      `SELECT jvl.account_code, jvl.account_name,
              SUM(jvl.debit_amount)  AS debit,
              SUM(jvl.credit_amount) AS credit
       FROM journal_voucher_lines jvl
       JOIN journal_vouchers jv ON jv.voucher_id = jvl.voucher_id
       WHERE jv.tenant_id = $1 AND jv.voucher_type = 'OPENING'
       GROUP BY jvl.account_code, jvl.account_name
       ORDER BY jvl.account_code`,
      [tenantId]
    );

    const lines = rows.map((r: any) => ({
      accountCode: r.account_code,
      accountName: r.account_name,
      debit: Number(r.debit || 0),
      credit: Number(r.credit || 0),
    }));
    const totalDebit  = Math.round(lines.reduce((s: number, l: any) => s + l.debit, 0) * 1000) / 1000;
    const totalCredit = Math.round(lines.reduce((s: number, l: any) => s + l.credit, 0) * 1000) / 1000;
    const difference  = Math.round((totalDebit - totalCredit) * 1000) / 1000;

    // OBE residual: a non-zero OBE balance means migration is partial / not yet reclassified
    const obe = lines.find((l: any) => l.accountCode === '3900');
    const obeBalance = obe ? Math.round((obe.credit - obe.debit) * 1000) / 1000 : 0;

    return {
      lines, totalDebit, totalCredit, difference,
      balanced: Math.abs(difference) < 0.0005,
      obeBalance,
      hasOpeningData: lines.length > 0,
    };
  }


  // ── Find-or-create master records for opening AR/AP (sub-ledger linkage) ──
  // The opening loaders store party names as text; these ensure a real
  // customer/supplier master exists and return its id to link on the invoice.
  // Accounting is unaffected (fixed control accounts 1130/2110); this only
  // populates the sub-ledger master so parties appear in pickers/statements.

  async findOrCreateCustomer(tenantId: string, name: string, rich: any = {}): Promise<{ id: string | null; created: boolean }> {
    if (!name || !name.trim()) return { id: null, created: false };
    const found = await this.invoiceRepo.query(
      `SELECT account_id::text AS id FROM accounts
       WHERE tenant_id::text = $1 AND account_name ILIKE $2 AND is_customer = true LIMIT 1`,
      [tenantId, name.trim()]
    );
    if (found?.[0]?.id) return { id: found[0].id, created: false };
    const ins = await this.invoiceRepo.query(
      `INSERT INTO accounts
         (tenant_id, account_name, is_customer, is_supplier, is_active, email, phone, address_line1, city, country_id)
       VALUES ($1::uuid, $2, true, false, true, $3, $4, $5, $6, null)
       RETURNING account_id::text AS id`,
      [tenantId, name.trim(), rich.customerEmail || null, rich.phone || null,
       rich.customerAddress || null, rich.city || null]
    );
    const id = ins?.[0]?.id || null;
    return { id, created: true };
  }

  async findOrCreateSupplier(tenantId: string, name: string, rich: any = {}): Promise<{ id: string | null; created: boolean }> {
    if (!name || !name.trim()) return { id: null, created: false };
    const found = await this.purchaseInvoiceRepo.query(
      `SELECT supplier_id::text AS id FROM suppliers
       WHERE tenant_id::text = $1 AND supplier_name ILIKE $2 LIMIT 1`,
      [tenantId, name.trim()]
    );
    if (found?.[0]?.id) return { id: found[0].id, created: false };
    const cnt = await this.purchaseInvoiceRepo.query(
      `SELECT COUNT(*)::int AS c FROM suppliers WHERE tenant_id::text = $1`, [tenantId]);
    const code = `SUP-${String(Number(cnt?.[0]?.c || 0) + 1).padStart(4, '0')}`;
    const ins = await this.purchaseInvoiceRepo.query(
      `INSERT INTO suppliers
         (tenant_id, supplier_code, supplier_name, is_supplier, is_active, trn, email, phone, address, city, country, payment_terms)
       VALUES ($1::uuid, $2, $3, true, true, $4, $5, $6, $7, $8, $9, $10)
       RETURNING supplier_id::text AS id`,
      [tenantId, code, name.trim(), rich.supplierTrn || null, rich.email || null, rich.phone || null,
       rich.supplierAddress || null, rich.city || null, rich.country || null, rich.paymentTerms || null]
    );
    const id = ins?.[0]?.id || null;
    return { id, created: true };
  }


  // ── AI Invoice Extraction (supplier invoice -> structured data) ──
  // Sends an uploaded supplier invoice (PDF/image, base64) to the Claude API
  // and returns structured purchase-invoice data for the user to review and
  // post. Never posts automatically. Matches/suggests a supplier via the
  // existing findOrCreateSupplier logic (match only here; creation happens
  // when the user saves the invoice).
  async extractInvoice(
    tenantId: string,
    fileBase64: string,
    mediaType: string,
  ): Promise<any> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('AI extraction is not configured (missing API key). Contact your administrator.');
    if (!fileBase64) throw new Error('No document provided.');

    const isPdf = (mediaType || '').includes('pdf');
    const docBlock = isPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } }
      : { type: 'image',    source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: fileBase64 } };

    const instruction = `You are an accounts-payable data extraction engine. Extract the supplier invoice in this document into STRICT JSON matching exactly this schema, and output ONLY the JSON (no prose, no markdown fences):

{
  "supplierName": string|null,
  "supplierTrn": string|null,
  "supplierAddress": string|null,
  "invoiceNumber": string|null,
  "invoiceDate": "YYYY-MM-DD"|null,
  "dueDate": "YYYY-MM-DD"|null,
  "currency": string|null,
  "paymentTerms": string|null,
  "lineItems": [
    { "description": string, "quantity": number|null, "unitPrice": number|null, "amount": number|null }
  ],
  "subtotal": number|null,
  "vatAmount": number|null,
  "vatRate": number|null,
  "total": number|null,
  "notes": string|null,
  "confidence": "high"|"medium"|"low"
}

Rules:
- Use null for any field you cannot find. NEVER guess or fabricate values.
- Dates must be ISO YYYY-MM-DD. If only a partial date is visible, use null.
- Numbers must be plain numbers (no currency symbols, no thousands separators).
- lineItems: one object per line on the invoice. If none are itemised, return [].
- currency: the ISO code if determinable (e.g. OMR, AED, USD), else the symbol/text seen, else null.
- confidence: "high" if the document is clearly a clean invoice and totals reconcile; "medium" if some fields are unclear; "low" if the image is poor or this may not be an invoice.
- Output the JSON object and nothing else.`;

    let raw: string;
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 2000,
          messages: [
            { role: 'user', content: [ docBlock as any, { type: 'text', text: instruction } ] },
          ],
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Extraction service error (${resp.status}): ${errText.slice(0, 300)}`);
      }
      const data: any = await resp.json();
      raw = (data?.content || []).map((b: any) => (b?.type === 'text' ? b.text : '')).join('').trim();
    } catch (e: any) {
      throw new Error(`Could not reach the extraction service: ${e?.message || e}`);
    }

    // Parse the JSON (strip any stray fences just in case)
    let parsed: any;
    try {
      const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new Error('The document was read but could not be parsed into invoice fields. Try a clearer scan.');
    }

    // Try to match an existing supplier by name (suggestion only; no creation here)
    let supplierMatch: any = null;
    if (parsed.supplierName) {
      const rows = await this.purchaseInvoiceRepo.query(
        `SELECT supplier_id::text AS id, supplier_name FROM suppliers
         WHERE tenant_id::text = $1 AND supplier_name ILIKE $2 LIMIT 1`,
        [tenantId, parsed.supplierName.trim()]
      );
      if (rows?.[0]) supplierMatch = { id: rows[0].id, name: rows[0].supplier_name, existing: true };
    }

    // Map to the purchase-invoice form shape the UI expects
    const prefill = {
      supplierName: parsed.supplierName || null,
      supplierTrn: parsed.supplierTrn || null,
      supplierAddress: parsed.supplierAddress || null,
      supplierId: supplierMatch?.id || null,
      invoiceNumber: parsed.invoiceNumber || null,
      supplierInvoiceNo: parsed.invoiceNumber || null,
      invoiceDate: parsed.invoiceDate || null,
      dueDate: parsed.dueDate || null,
      currencyCode: parsed.currency || 'OMR',
      paymentTerms: parsed.paymentTerms || null,
      subtotal: parsed.subtotal ?? null,
      vatAmount: parsed.vatAmount ?? null,
      vatRate: parsed.vatRate ?? null,
      totalAmount: parsed.total ?? null,
      notes: parsed.notes || null,
      items: Array.isArray(parsed.lineItems) ? parsed.lineItems.map((li: any) => ({
        description: li.description || '',
        quantity: li.quantity ?? null,
        unitPrice: li.unitPrice ?? null,
        amount: li.amount ?? null,
      })) : [],
    };

    return { prefill, supplierMatch, confidence: parsed.confidence || 'medium', rawExtracted: parsed };
  }


  // ── Recurring Expenses Engine ──────────────────────────────────
  // Generates due recurring entries (journals or bills) as DRAFT (or POSTED
  // per the schedule), idempotently. Safe to call from the daily cron AND the
  // manual trigger — the recurring_expense_log UNIQUE(recurring_id, period_date)
  // guarantees no period is ever generated twice. Catches up multiple overdue
  // periods in one run.

  private advanceDate(d: Date, frequency: string, interval: number, dayOfMonth?: number | null): Date {
    const n = new Date(d);
    const iv = Math.max(1, Number(interval) || 1);
    switch ((frequency || 'MONTHLY').toUpperCase()) {
      case 'WEEKLY':    n.setDate(n.getDate() + 7 * iv); break;
      case 'QUARTERLY': n.setMonth(n.getMonth() + 3 * iv); break;
      case 'YEARLY':    n.setFullYear(n.getFullYear() + iv); break;
      case 'MONTHLY':
      default:          n.setMonth(n.getMonth() + iv); break;
    }
    // Clamp to preferred day-of-month where applicable (handles short months)
    if (dayOfMonth && ['MONTHLY', 'QUARTERLY', 'YEARLY'].includes((frequency || 'MONTHLY').toUpperCase())) {
      const lastDay = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
      n.setDate(Math.min(Number(dayOfMonth), lastDay));
    }
    return n;
  }

  async generateDueRecurringItems(tenantId?: string): Promise<any> {
    const today = new Date().toISOString().slice(0, 10);
    // Pull active, due schedules (optionally scoped to a tenant)
    const params: any[] = [today];
    let where = `is_active = true AND next_due_date <= $1
                 AND (end_date IS NULL OR next_due_date <= end_date)
                 AND (max_occurrences IS NULL OR occurrences_generated < max_occurrences)`;
    if (tenantId) { where += ` AND tenant_id::text = $2`; params.push(tenantId); }
    const schedules = await this.jvRepo.query(
      `SELECT * FROM recurring_expenses WHERE ${where} ORDER BY next_due_date`, params);

    let generated = 0, skipped = 0, failed = 0;
    const details: any[] = [];

    // PG 'date' columns may hydrate as Date objects; normalize to YYYY-MM-DD strings
    const toDateStr = (v: any): string | null => {
      if (!v) return null;
      if (typeof v === 'string') return v.slice(0, 10);
      try { return new Date(v).toISOString().slice(0, 10); } catch { return null; }
    };
    for (const sc of schedules) {
      sc.next_due_date = toDateStr(sc.next_due_date);
      sc.end_date = toDateStr(sc.end_date);
      // Catch-up loop: generate every period due up to today (cap iterations defensively)
      let guard = 0;
      while (sc.next_due_date && sc.next_due_date <= today && guard < 60) {
        guard++;
        if (sc.max_occurrences && sc.occurrences_generated >= sc.max_occurrences) break;
        if (sc.end_date && sc.next_due_date > sc.end_date) break;

        const period = sc.next_due_date;
        const tid = sc.tenant_id;

        // Idempotency guard: claim the (recurring_id, period) slot FIRST.
        let logId: string | null = null;
        try {
          const ins = await this.jvRepo.query(
            `INSERT INTO recurring_expense_log
               (recurring_id, tenant_id, period_date, gen_type, status, amount)
             VALUES ($1,$2,$3,$4,'PENDING',$5)
             ON CONFLICT (recurring_id, period_date) DO NOTHING
             RETURNING log_id::text AS id`,
            [sc.recurring_id, tid, period, sc.gen_type, sc.amount]);
          logId = ins?.[0]?.id || null;
        } catch (e: any) {
          // unexpected — record and stop this schedule
          failed++; details.push({ name: sc.name, period, error: e?.message }); break;
        }

        if (!logId) {
          // Already generated for this period — skip, but still advance the schedule
          skipped++;
          const nd = this.advanceDate(new Date(period), sc.frequency, sc.interval_count, sc.day_of_month);
          sc.next_due_date = nd.toISOString().slice(0, 10);
          await this.jvRepo.query(
            `UPDATE recurring_expenses SET next_due_date = $1, updated_at = now() WHERE recurring_id = $2`,
            [sc.next_due_date, sc.recurring_id]);
          continue;
        }

        // Create the actual entry
        const status = (sc.post_mode === 'POSTED') ? 'POSTED' : 'DRAFT';
        const vat = Number(sc.vat_amount || 0);
        const amount = Number(sc.amount || 0);
        let resultType = sc.gen_type, resultId: string | null = null, resultNumber: string | null = null, errMsg: string | null = null;

        try {
          if (sc.gen_type === 'BILL') {
            // Draft (or posted) supplier bill
            let supplierId = sc.supplier_id || null;
            if (!supplierId && sc.supplier_name) {
              const oc = await this.findOrCreateSupplier(tid, sc.supplier_name, {});
              supplierId = oc.id;
            }
            const billNo = await this.generateNumber('PINV', this.purchaseInvoiceRepo, 'invoiceNumber');
            const total = amount + vat;
            const ins = await this.purchaseInvoiceRepo.query(
              `INSERT INTO purchase_invoices
                 (tenant_id, invoice_number, invoice_date, due_date, supplier_id, supplier_name,
                  subtotal, vat_rate, vat_amount, total_amount, paid_amount, balance_due,
                  currency_code, status, is_inventory, notes)
               VALUES ($1,$2,$3,$3,$4,$5,$6,$7,$8,$9,0,$9,$10,$11,false,$12)
               RETURNING invoice_id::text AS id, invoice_number`,
              [tid, billNo, period, supplierId, sc.supplier_name || 'Recurring Supplier',
               amount, sc.vat_rate || 0, vat, total, sc.currency_code || 'OMR', status,
               `Recurring: ${sc.name} (${period})`]);
            resultId = ins?.[0]?.id || null; resultNumber = ins?.[0]?.invoice_number || billNo;
          } else {
            // JOURNAL: Dr expense / Cr credit account (+ VAT input if any)
            const lines: any[] = [];
            lines.push({ accountCode: sc.expense_account_code, description: sc.name, debitAmount: amount, creditAmount: 0 });
            if (vat > 0) lines.push({ accountCode: '1160', description: `${sc.name} VAT`, debitAmount: vat, creditAmount: 0 });
            lines.push({ accountCode: sc.credit_account_code, description: sc.name, debitAmount: 0, creditAmount: amount + vat });

            const jvNumber = await this.generateNumber('JV', this.jvRepo, 'voucherNumber');
            const totalDebit = amount + vat, totalCredit = amount + vat;
            const jv = await this.jvRepo.save(this.jvRepo.create({
              tenantId: tid, voucherNumber: jvNumber, voucherType: 'RECURRING',
              description: `Recurring: ${sc.name} (${period})`, voucherDate: period,
              status, isPosted: status === 'POSTED', createdBy: sc.created_by,
              totalDebit, totalCredit, reference: `REC-${sc.name}`,
            } as any)) as any;
            for (let i = 0; i < lines.length; i++) {
              const acc = await this.coaRepo.findOne({ where: { tenantId: tid, accountCode: lines[i].accountCode } } as any);
              if (!acc) throw new Error(`Account ${lines[i].accountCode} not found`);
              await this.jvLineRepo.save(this.jvLineRepo.create({
                voucherId: jv.voucherId, lineNumber: i + 1, accountId: acc.accountId,
                accountCode: acc.accountCode, accountName: acc.accountName,
                description: lines[i].description, debitAmount: lines[i].debitAmount, creditAmount: lines[i].creditAmount,
              } as any));
            }
            resultId = jv.voucherId; resultNumber = jvNumber;
          }
          generated++;
        } catch (e: any) {
          errMsg = e?.message || 'generation failed'; failed++;
        }

        // Update the log with the outcome
        await this.jvRepo.query(
          `UPDATE recurring_expense_log
             SET result_type=$1, result_id=$2, result_number=$3, status=$4, error=$5, amount=$6
           WHERE log_id=$7`,
          [resultType, resultId, resultNumber, errMsg ? 'FAILED' : status, errMsg, amount + vat, logId]);

        details.push({ name: sc.name, period, type: sc.gen_type, number: resultNumber, status: errMsg ? 'FAILED' : status, error: errMsg });

        // Advance the schedule state (only if not failed; failed leaves due so it retries)
        if (!errMsg) {
          const nd = this.advanceDate(new Date(period), sc.frequency, sc.interval_count, sc.day_of_month);
          sc.next_due_date = nd.toISOString().slice(0, 10);
          sc.occurrences_generated = Number(sc.occurrences_generated || 0) + 1;
          await this.jvRepo.query(
            `UPDATE recurring_expenses
               SET next_due_date=$1, last_generated_date=$2, occurrences_generated=$3, updated_at=now()
             WHERE recurring_id=$4`,
            [sc.next_due_date, period, sc.occurrences_generated, sc.recurring_id]);
        } else {
          break; // stop catching up this schedule on failure; will retry next run
        }
      }
    }

    return { generated, skipped, failed, details, ranAt: new Date().toISOString() };
  }

  async getRecurringDueCount(tenantId: string): Promise<any> {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await this.jvRepo.query(
      `SELECT COUNT(*)::int AS due FROM recurring_expenses
       WHERE tenant_id::text = $1 AND is_active = true AND next_due_date <= $2
         AND (end_date IS NULL OR next_due_date <= end_date)
         AND (max_occurrences IS NULL OR occurrences_generated < max_occurrences)`,
      [tenantId, today]);
    return { due: rows?.[0]?.due || 0 };
  }


  // ── Recurring Expenses CRUD ────────────────────────────────────
  async createRecurringExpense(tenantId: string, dto: any, userId: string): Promise<any> {
    const start = dto.startDate || new Date().toISOString().slice(0, 10);
    const nextDue = dto.nextDueDate || start;  // first run defaults to start date
    const rows = await this.jvRepo.query(
      `INSERT INTO recurring_expenses
         (tenant_id, name, description, gen_type, amount, vat_rate, vat_amount, currency_code,
          expense_account_code, credit_account_code, supplier_id, supplier_name,
          frequency, interval_count, day_of_month, start_date, end_date, next_due_date,
          max_occurrences, post_mode, is_active, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       RETURNING recurring_id::text AS id`,
      [tenantId, dto.name, dto.description || null, dto.genType || 'JOURNAL',
       Number(dto.amount || 0), Number(dto.vatRate || 0), Number(dto.vatAmount || 0), dto.currencyCode || 'OMR',
       dto.expenseAccountCode || null, dto.creditAccountCode || null,
       dto.supplierId || null, dto.supplierName || null,
       dto.frequency || 'MONTHLY', Number(dto.intervalCount || 1), dto.dayOfMonth || null,
       start, dto.endDate || null, nextDue,
       dto.maxOccurrences || null, dto.postMode || 'DRAFT',
       dto.isActive !== false, dto.notes || null, userId]);
    return { id: rows?.[0]?.id, success: true };
  }

  async getRecurringExpenses(tenantId: string): Promise<any> {
    const rows = await this.jvRepo.query(
      `SELECT recurring_id::text AS id, name, description, gen_type, amount, vat_rate, vat_amount,
              currency_code, expense_account_code, credit_account_code, supplier_id::text AS supplier_id,
              supplier_name, frequency, interval_count, day_of_month, start_date, end_date,
              next_due_date, last_generated_date, occurrences_generated, max_occurrences,
              post_mode, is_active, notes, created_at
       FROM recurring_expenses WHERE tenant_id::text = $1 ORDER BY is_active DESC, next_due_date`,
      [tenantId]);
    return rows;
  }

  async getRecurringExpense(tenantId: string, id: string): Promise<any> {
    const rows = await this.jvRepo.query(
      `SELECT * FROM recurring_expenses WHERE tenant_id::text = $1 AND recurring_id::text = $2`,
      [tenantId, id]);
    if (!rows?.[0]) throw new NotFoundException('Recurring expense not found');
    return rows[0];
  }

  async updateRecurringExpense(tenantId: string, id: string, dto: any): Promise<any> {
    // Whitelist updatable columns (snake_case) <- (camelCase dto keys)
    const map: Record<string, string> = {
      name: 'name', description: 'description', genType: 'gen_type', amount: 'amount',
      vatRate: 'vat_rate', vatAmount: 'vat_amount', currencyCode: 'currency_code',
      expenseAccountCode: 'expense_account_code', creditAccountCode: 'credit_account_code',
      supplierId: 'supplier_id', supplierName: 'supplier_name',
      frequency: 'frequency', intervalCount: 'interval_count', dayOfMonth: 'day_of_month',
      startDate: 'start_date', endDate: 'end_date', nextDueDate: 'next_due_date',
      maxOccurrences: 'max_occurrences', postMode: 'post_mode', isActive: 'is_active', notes: 'notes',
    };
    const sets: string[] = []; const vals: any[] = []; let i = 1;
    for (const [k, col] of Object.entries(map)) {
      if (dto[k] !== undefined) { sets.push(`${col} = $${i++}`); vals.push(dto[k]); }
    }
    if (!sets.length) return { success: true, unchanged: true };
    sets.push(`updated_at = now()`);
    vals.push(tenantId); vals.push(id);
    await this.jvRepo.query(
      `UPDATE recurring_expenses SET ${sets.join(', ')} WHERE tenant_id::text = $${i++} AND recurring_id::text = $${i}`,
      vals);
    return { success: true };
  }

  async deleteRecurringExpense(tenantId: string, id: string): Promise<any> {
    // Soft-deactivate (keep history/log); hard delete only if never generated
    await this.jvRepo.query(
      `UPDATE recurring_expenses SET is_active = false, updated_at = now()
       WHERE tenant_id::text = $1 AND recurring_id::text = $2`, [tenantId, id]);
    return { success: true, deactivated: true };
  }

  async getRecurringExpenseLog(tenantId: string, id: string): Promise<any> {
    const rows = await this.jvRepo.query(
      `SELECT log_id::text AS id, period_date, generated_at, gen_type, result_type,
              result_id::text AS result_id, result_number, amount, status, error
       FROM recurring_expense_log WHERE tenant_id::text = $1 AND recurring_id::text = $2
       ORDER BY period_date DESC`, [tenantId, id]);
    return rows;
  }

  // ── Reports ───────────────────────────────────────────────────

  async getStockMovementReport(tenantId: string, productId?: string, from?: string, to?: string) {
    // Get all products
    const productQb = this.productRepo.createQueryBuilder('p').where('p.tenantId = :tenantId', { tenantId });
    if (productId) productQb.andWhere('p.productId = :productId', { productId });
    const products = await productQb.getMany();

    const report = await Promise.all(products.map(async (p) => {
      // Sales movements (from sales invoice items)
      const salesQb = this.invoiceItemRepo.createQueryBuilder('i')
        .innerJoin('sales_invoices', 'inv', 'inv.invoice_id = i.invoice_id')
        .select('SUM(i.quantity)', 'totalQty').addSelect('SUM(i.line_total)', 'totalValue')
        .where('inv.tenant_id = :tid AND i.product_id = :pid', { tid: tenantId, pid: p.productId });
      if (from) salesQb.andWhere('inv.invoice_date >= :from', { from });
      if (to) salesQb.andWhere('inv.invoice_date <= :to', { to });
      const salesData = await salesQb.getRawOne();

      // Purchase movements (from grn items)
      const purchQb = this.grnItemRepo.createQueryBuilder('g')
        .innerJoin('goods_receipt_notes', 'grn', 'grn.grn_id = g.grn_id')
        .select('SUM(g.quantity)', 'totalQty').addSelect('SUM(g.line_total)', 'totalValue')
        .where('grn.tenant_id = :tid AND g.product_id = :pid', { tid: tenantId, pid: p.productId });
      if (from) purchQb.andWhere('grn.grn_date >= :from', { from });
      if (to) purchQb.andWhere('grn.grn_date <= :to', { to });
      const purchData = await purchQb.getRawOne();

      // Stock adjustments
      const adjQb = this.stockRepo.createQueryBuilder('s')
        .select('SUM(CASE WHEN s.quantity > 0 THEN s.quantity ELSE 0 END)', 'inQty')
        .addSelect('SUM(CASE WHEN s.quantity < 0 THEN ABS(s.quantity) ELSE 0 END)', 'outQty')
        .where('s.tenantId = :tid AND s.productId = :pid', { tid: tenantId, pid: p.productId });
      const adjData = await adjQb.getRawOne();

      const salesQty = Number(salesData?.totalQty || 0);
      const salesValue = Number(salesData?.totalValue || 0);
      const purchQty = Number(purchData?.totalQty || 0);
      const purchValue = Number(purchData?.totalValue || 0);
      const adjIn = Number(adjData?.inQty || 0);
      const adjOut = Number(adjData?.outQty || 0);
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

  async getItemTransactionHistory(tenantId: string, productId: string) {
    const product = await this.productRepo.findOne({ where: { productId, tenantId } });
    if (!product) throw new Error('Product not found');

    const transactions: any[] = [];

    // Sales invoice items
    const salesItems = await this.invoiceItemRepo.createQueryBuilder('i')
      .innerJoinAndSelect('i.invoice', 'inv', 'inv.tenantId = :tid', { tid: tenantId })
      .where('i.productId = :pid', { pid: productId })
      .orderBy('inv.invoiceDate', 'DESC').getMany();
    salesItems.forEach((item: any) => transactions.push({
      date: item.invoice?.invoiceDate, type: 'SALE', reference: item.invoice?.invoiceNumber,
      party: item.invoice?.customerName, qty: -Number(item.quantity),
      unitPrice: Number(item.unitPrice), value: Number(item.lineTotal),
      direction: 'OUT',
    }));

    // GRN items
    const grnItems = await this.grnItemRepo.createQueryBuilder('g')
      .innerJoinAndSelect('g.grn', 'grn', 'grn.tenantId = :tid', { tid: tenantId })
      .where('g.productId = :pid', { pid: productId })
      .orderBy('grn.grnDate', 'DESC').getMany();
    grnItems.forEach((item: any) => transactions.push({
      date: item.grn?.grnDate, type: 'PURCHASE', reference: item.grn?.grnNumber,
      party: item.grn?.supplierName, qty: Number(item.quantity),
      unitPrice: Number(item.unitPrice), value: Number(item.lineTotal),
      direction: 'IN',
    }));

    // Stock adjustments
    const adjustments = await this.stockRepo.find({ where: { tenantId, productId }, order: { createdAt: 'DESC' } });
    adjustments.forEach((adj: any) => transactions.push({
      date: adj.createdAt, type: 'ADJUSTMENT', reference: adj.reference || 'ADJ',
      party: adj.adjustmentType, qty: Number(adj.quantity),
      unitPrice: Number(product.costPrice), value: Math.abs(Number(adj.quantity)) * Number(product.costPrice),
      direction: Number(adj.quantity) > 0 ? 'IN' : 'OUT',
    }));

    // Sort by date desc
    transactions.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    // Price analysis
    const salePrices = salesItems.map((i: any) => Number(i.unitPrice)).filter(p => p > 0);
    const purchPrices = grnItems.map((i: any) => Number(i.unitPrice)).filter(p => p > 0);

    return {
      product,
      transactions,
      summary: {
        totalSalesQty: salesItems.reduce((s: number, i: any) => s + Number(i.quantity), 0),
        totalSalesValue: salesItems.reduce((s: number, i: any) => s + Number(i.lineTotal), 0),
        totalPurchaseQty: grnItems.reduce((s: number, i: any) => s + Number(i.quantity), 0),
        totalPurchaseValue: grnItems.reduce((s: number, i: any) => s + Number(i.lineTotal), 0),
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

  async getGLLedger(tenantId: string, accountId: string, from?: string, to?: string) {
    const account = await this.coaRepo.findOne({ where: { accountId, tenantId } });
    if (!account) throw new Error('Account not found');

    // Journal entries linked to this account
    const jvQb = this.jvRepo.createQueryBuilder('jv')
      .leftJoinAndSelect('jv.lines', 'line')
      .where('jv.tenantId = :tid', { tid: tenantId })
      .andWhere('line.accountId = :aid', { aid: accountId });
    if (from) jvQb.andWhere('jv.voucherDate >= :from', { from });
    if (to) jvQb.andWhere('jv.voucherDate <= :to', { to });
    const journals = await jvQb.orderBy('jv.voucherDate', 'ASC').getMany();

    const transactions: any[] = [];
    journals.forEach((jv: any) => {
      jv.lines?.filter((l: any) => l.accountId === accountId).forEach((line: any) => {
        transactions.push({
          date: jv.voucherDate, type: 'JOURNAL', reference: jv.voucherNumber,
          description: line.description || jv.description,
          debit: Number(line.debitAmount || 0), credit: Number(line.creditAmount || 0),
        });
      });
    });

    // Sort by date
    transactions.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

    // Running balance
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

  async getAllCustomersStatement(tenantId: string) {
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

  async getAllSuppliersStatement(tenantId: string) {
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

  async getAccountLedger(tenantId: string, accountId?: string, customerName?: string, supplierName?: string, from?: string, to?: string) {
    const transactions: any[] = [];

    if (!supplierName) {
      // Sales invoices
      const invQb = this.invoiceRepo.createQueryBuilder('i').where('i.tenantId = :tid', { tid: tenantId });
      if (customerName) invQb.andWhere('i.customerName ILIKE :name', { name: `%${customerName}%` });
      if (from) invQb.andWhere('i.invoiceDate >= :from', { from });
      if (to) invQb.andWhere('i.invoiceDate <= :to', { to });
      const invoices = await invQb.orderBy('i.invoiceDate', 'ASC').getMany();
      invoices.forEach(inv => transactions.push({
        date: inv.invoiceDate, type: 'SALES INVOICE', reference: (inv as any).invoiceNumber,
        party: (inv as any).customerName, debit: Number((inv as any).totalAmount), credit: 0,
        status: (inv as any).status, balanceDue: Number((inv as any).balanceDue),
      }));

      // Receipts
      const rcptQb = this.receiptRepo.createQueryBuilder('r').where('r.tenantId = :tid', { tid: tenantId });
      if (customerName) rcptQb.andWhere('r.customerName ILIKE :name', { name: `%${customerName}%` });
      if (from) rcptQb.andWhere('r.receiptDate >= :from', { from });
      if (to) rcptQb.andWhere('r.receiptDate <= :to', { to });
      const receipts = await rcptQb.orderBy('r.receiptDate', 'ASC').getMany();
      receipts.forEach(r => transactions.push({
        date: (r as any).receiptDate, type: 'RECEIPT', reference: (r as any).receiptNumber,
        party: (r as any).customerName, debit: 0, credit: Number((r as any).amount),
        status: 'CONFIRMED', balanceDue: 0,
      }));
    }

    if (!customerName) {
      // Purchase invoices
      const pinvQb = this.purchaseInvoiceRepo.createQueryBuilder('i').where('i.tenantId = :tid', { tid: tenantId });
      if (supplierName) pinvQb.andWhere('i.supplierName ILIKE :name', { name: `%${supplierName}%` });
      if (from) pinvQb.andWhere('i.invoiceDate >= :from', { from });
      if (to) pinvQb.andWhere('i.invoiceDate <= :to', { to });
      const pinvoices = await pinvQb.orderBy('i.invoiceDate', 'ASC').getMany();
      pinvoices.forEach(inv => transactions.push({
        date: (inv as any).invoiceDate, type: 'PURCHASE INVOICE', reference: (inv as any).invoiceNumber,
        party: (inv as any).supplierName, debit: 0, credit: Number((inv as any).totalAmount),
        status: (inv as any).status, balanceDue: Number((inv as any).balanceDue),
      }));

      // Payment vouchers
      const pvQb = this.voucherRepo.createQueryBuilder('v').where('v.tenantId = :tid', { tid: tenantId });
      if (supplierName) pvQb.andWhere('v.supplierName ILIKE :name', { name: `%${supplierName}%` });
      if (from) pvQb.andWhere('v.voucherDate >= :from', { from });
      if (to) pvQb.andWhere('v.voucherDate <= :to', { to });
      const vouchers = await pvQb.orderBy('v.voucherDate', 'ASC').getMany();
      vouchers.forEach(v => transactions.push({
        date: (v as any).voucherDate, type: 'PAYMENT', reference: (v as any).voucherNumber,
        party: (v as any).supplierName, debit: Number((v as any).amount), credit: 0,
        status: 'CONFIRMED', balanceDue: 0,
      }));
    }

    // Sort by date
    transactions.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

    // Add running balance
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
  async getSalesReport(tenantId: string, from?: string, to?: string) {
    const qb = this.invoiceRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.items', 'item')
      .where('i.tenantId = :tid', { tid: tenantId });
    if (from) qb.andWhere('i.invoiceDate >= :from', { from });
    if (to) qb.andWhere('i.invoiceDate <= :to', { to });
    qb.orderBy('i.invoiceDate', 'DESC');
    const invoices = await qb.getMany();

    // By Customer
    const byCustomer: Record<string, any> = {};
    invoices.forEach((inv: any) => {
      const name = inv.customerName || 'Unknown';
      if (!byCustomer[name]) byCustomer[name] = { name, invoiceCount: 0, totalAmount: 0, paidAmount: 0, balanceDue: 0 };
      byCustomer[name].invoiceCount++;
      byCustomer[name].totalAmount += Number(inv.totalAmount || 0);
      byCustomer[name].paidAmount += Number(inv.paidAmount || 0);
      byCustomer[name].balanceDue += Number(inv.balanceDue || 0);
    });

    // By Product
    const byProduct: Record<string, any> = {};
    invoices.forEach((inv: any) => {
      (inv.items || []).forEach((item: any) => {
        const name = item.description || item.productId || 'Unknown';
        if (!byProduct[name]) byProduct[name] = { name, qty: 0, totalAmount: 0, invoiceCount: 0 };
        byProduct[name].qty += Number(item.quantity || 0);
        byProduct[name].totalAmount += Number(item.lineTotal || 0);
        byProduct[name].invoiceCount++;
      });
    });

    // By Month
    const byMonth: Record<string, any> = {};
    invoices.forEach((inv: any) => {
      const month = inv.invoiceDate ? inv.invoiceDate.toString().slice(0, 7) : 'Unknown';
      if (!byMonth[month]) byMonth[month] = { month, invoiceCount: 0, totalAmount: 0, paidAmount: 0 };
      byMonth[month].invoiceCount++;
      byMonth[month].totalAmount += Number(inv.totalAmount || 0);
      byMonth[month].paidAmount += Number(inv.paidAmount || 0);
    });

    const totalRevenue = invoices.reduce((s: number, i: any) => s + Number(i.totalAmount || 0), 0);
    const totalPaid = invoices.reduce((s: number, i: any) => s + Number(i.paidAmount || 0), 0);
    const totalBalance = invoices.reduce((s: number, i: any) => s + Number(i.balanceDue || 0), 0);

    return {
      summary: { totalInvoices: invoices.length, totalRevenue, totalPaid, totalBalance },
      byCustomer: Object.values(byCustomer).sort((a: any, b: any) => b.totalAmount - a.totalAmount),
      byProduct: Object.values(byProduct).sort((a: any, b: any) => b.totalAmount - a.totalAmount),
      byMonth: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v),
    };
  }

  async getPurchaseReport(tenantId: string, from?: string, to?: string) {
    const qb = this.purchaseInvoiceRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.items', 'item')
      .where('i.tenantId = :tid', { tid: tenantId });
    if (from) qb.andWhere('i.invoiceDate >= :from', { from });
    if (to) qb.andWhere('i.invoiceDate <= :to', { to });
    qb.orderBy('i.invoiceDate', 'DESC');
    const invoices = await qb.getMany();

    const bySupplier: Record<string, any> = {};
    invoices.forEach((inv: any) => {
      const name = inv.supplierName || 'Unknown';
      if (!bySupplier[name]) bySupplier[name] = { name, invoiceCount: 0, totalAmount: 0, paidAmount: 0, balanceDue: 0 };
      bySupplier[name].invoiceCount++;
      bySupplier[name].totalAmount += Number(inv.totalAmount || 0);
      bySupplier[name].paidAmount += Number(inv.paidAmount || 0);
      bySupplier[name].balanceDue += Number(inv.balanceDue || 0);
    });

    const byProduct: Record<string, any> = {};
    invoices.forEach((inv: any) => {
      (inv.items || []).forEach((item: any) => {
        const name = item.description || item.productId || 'Unknown';
        if (!byProduct[name]) byProduct[name] = { name, qty: 0, totalAmount: 0 };
        byProduct[name].qty += Number(item.quantity || 0);
        byProduct[name].totalAmount += Number(item.lineTotal || 0);
      });
    });

    const byMonth: Record<string, any> = {};
    invoices.forEach((inv: any) => {
      const month = inv.invoiceDate ? inv.invoiceDate.toString().slice(0, 7) : 'Unknown';
      if (!byMonth[month]) byMonth[month] = { month, invoiceCount: 0, totalAmount: 0 };
      byMonth[month].invoiceCount++;
      byMonth[month].totalAmount += Number(inv.totalAmount || 0);
    });

    const totalPurchases = invoices.reduce((s: number, i: any) => s + Number(i.totalAmount || 0), 0);
    const totalPaid = invoices.reduce((s: number, i: any) => s + Number(i.paidAmount || 0), 0);
    const totalBalance = invoices.reduce((s: number, i: any) => s + Number(i.balanceDue || 0), 0);

    return {
      summary: { totalInvoices: invoices.length, totalPurchases, totalPaid, totalBalance },
      bySupplier: Object.values(bySupplier).sort((a: any, b: any) => b.totalAmount - a.totalAmount),
      byProduct: Object.values(byProduct).sort((a: any, b: any) => b.totalAmount - a.totalAmount),
      byMonth: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v),
    };
  }

  async getTopCustomersSuppliers(tenantId: string, limit = 10) {
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

  async getFinancialReports(tenantId: string, from?: string, to?: string) {
    const tid = tenantId;

    // Get all COA accounts
    const accounts = await this.coaRepo.find({ where: { tenantId: tid, isActive: true } as any });

    // Get all journal voucher lines with account balances using raw SQL
    let rawSql = `
      SELECT l.account_code as "accountCode", l.account_name as "accountName",
             SUM(l.debit_amount) as "totalDebit", SUM(l.credit_amount) as "totalCredit"
      FROM journal_voucher_lines l
      JOIN journal_vouchers jv ON jv.voucher_id = l.voucher_id
      WHERE jv.tenant_id = $1 AND jv.status = 'POSTED'
    `;
    const params: any[] = [tid];
    if (from) { rawSql += ` AND jv.voucher_date >= $${params.length+1}`; params.push(from); }
    if (to) { rawSql += ` AND jv.voucher_date <= $${params.length+1}`; params.push(to); }
    rawSql += ` GROUP BY l.account_code, l.account_name ORDER BY l.account_code`;
    const balances = await this.jvLineRepo.query(rawSql, params);

    // Map balances by account code
    const balanceMap: Record<string, { debit: number, credit: number, balance: number }> = {};
    balances.forEach((b: any) => {
      const debit = Number(b.totalDebit || 0);
      const credit = Number(b.totalCredit || 0);
      balanceMap[b.accountCode] = { debit, credit, balance: debit - credit };
    });

    // Build account rows with balances
    const accountRows = accounts.filter(a => a.accountSubtype !== 'HEADER').map(acc => {
      const bal = balanceMap[acc.accountCode] || { debit: 0, credit: 0, balance: 0 };
      // Normal balance: ASSET/EXPENSE = Debit, LIABILITY/EQUITY/REVENUE = Credit
      const normalDebit = ['ASSET', 'EXPENSE'].includes(acc.accountType);
      const netBalance = normalDebit ? bal.balance : -bal.balance;
      return {
        accountId: acc.accountId, accountCode: acc.accountCode, accountName: acc.accountName,
        accountType: acc.accountType, accountSubtype: acc.accountSubtype,
        debit: bal.debit, credit: bal.credit, balance: netBalance,
      };
    });

    // Trial Balance
    const trialBalance = accountRows.filter(a => a.debit > 0 || a.credit > 0)
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

    // P&L
    const revenue = accountRows.filter(a => a.accountType === 'REVENUE' && a.accountSubtype !== 'HEADER');
    const cogs = accountRows.filter(a => a.accountType === 'EXPENSE' && ['COGS'].includes(a.accountSubtype || ''));
    const opex = accountRows.filter(a => a.accountType === 'EXPENSE' && ['OPERATING', 'Administration', 'Sales & Marketing Expenses', 'Finance Expenses', 'OTHER'].includes(a.accountSubtype || ''));
    const totalRevenue = revenue.reduce((s, a) => s + a.balance, 0);
    const totalCogs = cogs.reduce((s, a) => s + a.balance, 0);
    const grossProfit = totalRevenue - totalCogs;
    const totalOpex = opex.reduce((s, a) => s + a.balance, 0);
    const netProfit = grossProfit - totalOpex;

    // Balance Sheet
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

  // ── Consumables ──────────────────────────────────────────────
  async getConsumableStock(tenantId: string) {
    const sql = `
      SELECT cs.*, p.product_name, p.product_code, p.unit_of_measure, p.brand, p.category,
        CASE WHEN cs.qty_on_hand <= cs.min_qty THEN true ELSE false END as is_low_stock
      FROM consumable_stock cs
      JOIN products p ON p.product_id = cs.product_id
      WHERE cs.tenant_id = $1
      ORDER BY p.product_name`;
    return this.invoiceRepo.query(sql, [tenantId]);
  }

  async getConsumableTransactions(tenantId: string, productId?: string) {
    let sql = `
      SELECT ct.*, p.product_name, p.product_code, p.unit_of_measure
      FROM consumable_transactions ct
      JOIN products p ON p.product_id = ct.product_id
      WHERE ct.tenant_id = $1`;
    const params: any[] = [tenantId];
    if (productId) { sql += ` AND ct.product_id = $2`; params.push(productId); }
    sql += ` ORDER BY ct.created_at DESC LIMIT 200`;
    return this.invoiceRepo.query(sql, params);
  }

  async issueConsumable(tenantId: string, dto: any, userId: string) {
    const voucherNo = dto.referenceNo || await this.generateNumber('CIV', this.invoiceRepo, 'invoiceNumber').catch(() => 'CIV-' + Date.now());
    const today = new Date().toISOString().slice(0, 10);
    const issueType = dto.issueToType || (dto.project ? 'PROJECT' : dto.department ? 'DEPARTMENT' : 'EMPLOYEE');
    const deptLabel = dto.project ? `Project: ${dto.project}` : (dto.department || null);
    const lines = Array.isArray(dto.items) && dto.items.length ? dto.items : [{ productId: dto.productId, quantity: dto.quantity }];
    const results: any[] = [];
    for (const line of lines) {
      if (!line.productId || !Number(line.quantity)) continue;
      const stockResult = await this.invoiceRepo.query(
        `SELECT * FROM consumable_stock WHERE tenant_id=$1 AND product_id=$2`,
        [tenantId, line.productId]
      );
      if (!stockResult.length) throw new BadRequestException('Product not found in consumable stock');
      const stock = stockResult[0];
      const newQty = Number(stock.qty_on_hand) - Number(line.quantity);
      if (newQty < 0) throw new BadRequestException(`Insufficient stock for ${stock.product_name || 'item'}. Available: ${stock.qty_on_hand}`);
      await this.invoiceRepo.query(
        `UPDATE consumable_stock SET qty_on_hand=$1, last_issued_date=$2, updated_at=NOW() WHERE tenant_id=$3 AND product_id=$4`,
        [newQty, today, tenantId, line.productId]
      );
      await this.invoiceRepo.query(
        `INSERT INTO consumable_transactions (tenant_id, product_id, transaction_type, quantity, balance_qty, reference_no, department, issued_to_id, issued_to_name, reason, notes, created_by)
         VALUES ($1,$2,'ISSUE',$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [tenantId, line.productId, line.quantity, newQty, voucherNo, deptLabel, dto.issuedToId||null, dto.issuedToName||null, dto.reason||null, dto.notes||null, userId]
      );
      results.push({ productId: line.productId, remainingQty: newQty });
    }
    return { success: true, voucherNo, issueType, lines: results };
  }

  async receiveConsumable(tenantId: string, productId: string, quantity: number, referenceNo: string, userId: string) {
    // Check if stock record exists
    const existing = await this.invoiceRepo.query(
      `SELECT * FROM consumable_stock WHERE tenant_id=$1 AND product_id=$2`,
      [tenantId, productId]
    );

    if (existing.length) {
      const newQty = Number(existing[0].qty_on_hand) + Number(quantity);
      await this.invoiceRepo.query(
        `UPDATE consumable_stock SET qty_on_hand=$1, last_received_date=$2, updated_at=NOW() WHERE tenant_id=$3 AND product_id=$4`,
        [newQty, new Date().toISOString().slice(0,10), tenantId, productId]
      );
      await this.invoiceRepo.query(
        `INSERT INTO consumable_transactions (tenant_id, product_id, transaction_type, quantity, balance_qty, reference_no, created_by)
         VALUES ($1,$2,'RECEIPT',$3,$4,$5,$6)`,
        [tenantId, productId, quantity, newQty, referenceNo, userId]
      );
    } else {
      // Create new stock record
      const productResult = await this.invoiceRepo.query(
        `SELECT * FROM products WHERE product_id=$1`, [productId]
      );
      if (productResult.length) {
        await this.invoiceRepo.query(
          `INSERT INTO consumable_stock (tenant_id, product_id, product_name, product_code, qty_on_hand, unit_of_measure, last_received_date)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [tenantId, productId, productResult[0].product_name, productResult[0].product_code, quantity, productResult[0].unit_of_measure, new Date().toISOString().slice(0,10)]
        );
        await this.invoiceRepo.query(
          `INSERT INTO consumable_transactions (tenant_id, product_id, transaction_type, quantity, balance_qty, reference_no, created_by)
           VALUES ($1,$2,'RECEIPT',$3,$4,$5,$6)`,
          [tenantId, productId, quantity, quantity, referenceNo, userId]
        );
      }
    }
    return { success: true };
  }

  async getConsumableStats(tenantId: string) {
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

  // ── PO Asset Items ───────────────────────────────────────────
  async getPOAssetItems(tenantId: string) {
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
    // Expand items by remaining quantity so each unit shows separately
    const expanded: any[] = [];
    for (const item of items) {
      const remaining = Number(item.remaining || 1);
      for (let i = 0; i < remaining; i++) {
        expanded.push({
          ...item,
          id: `${item.id}-${i}`,
          baseId: item.id,
          unitIndex: i + 1,
          displayName: remaining > 1 ? `${item.description} (Unit ${i + 1} of ${Number(item.quantity)})` : item.description,
        });
      }
    }
    return expanded;
  }

  // ── Asset Brands ─────────────────────────────────────────────
  async getBrands(tenantId: string, category?: string) {
    let sql = `SELECT * FROM asset_brands WHERE tenant_id=$1 AND is_active=true`;
    const params: any[] = [tenantId];
    if (category) { sql += ` AND category=$2`; params.push(category); }
    sql += ` ORDER BY brand_name`;
    return this.invoiceRepo.query(sql, params);
  }

  async createBrand(tenantId: string, dto: any) {
    const sql = `INSERT INTO asset_brands (tenant_id, brand_name, category) VALUES ($1,$2,$3) RETURNING *`;
    const result = await this.invoiceRepo.query(sql, [tenantId, dto.brandName, dto.category||null]);
    return result[0];
  }

  async deleteBrand(tenantId: string, id: string) {
    await this.invoiceRepo.query(`UPDATE asset_brands SET is_active=false WHERE brand_id=$1 AND tenant_id=$2`, [id, tenantId]);
    return { success: true };
  }

  async createDraftAssetsFromPO(tenantId: string, poId: string, userId: string) {
    // Get PO with items
    const poResult = await this.invoiceRepo.query(`
      SELECT po.*, poi.* FROM purchase_orders po
      JOIN purchase_order_items poi ON poi.po_id = po.po_id
      WHERE po.po_id=$1 AND po.tenant_id=$2 AND poi.is_fixed_asset=true`, [poId, tenantId]);
    
    const assets = [];
    for (const item of poResult) {
      const count = await this.fixedAssetRepo.count({ where: { tenantId } as any });
      const assetCode = `AST-${String(count + assets.length + 1).padStart(4,'0')}`;
      const warrantyExpiry = item.warranty_months ? 
        new Date(new Date(item.expected_delivery || Date.now()).setMonth(new Date(item.expected_delivery || Date.now()).getMonth() + item.warranty_months)).toISOString().slice(0,10) : null;
      
      const asset = this.fixedAssetRepo.create({
        tenantId, assetCode, status: 'ACTIVE',
        assetName: item.description || item.product_name,
        category: item.asset_category || 'Other',
        brand: item.brand,
        model: item.model,
        serialNumber: item.serial_number,
        supplierName: item.supplier_name,
        purchaseDate: item.po_date || new Date().toISOString().slice(0,10),
        purchaseCost: Number(item.unit_price || 0),
        warrantyExpiry,
        invoiceNumber: item.po_number,
        currentBookValue: Number(item.unit_price || 0),
        usefulLifeYears: 5,
        depreciationMethod: 'STRAIGHT_LINE',
        createdBy: userId,
      } as any);
      const saved = await this.fixedAssetRepo.save(asset);
      assets.push(saved);
    }
    // Mark PO as asset draft created
    await this.invoiceRepo.query(`UPDATE purchase_orders SET asset_draft_created=true WHERE po_id=$1`, [poId]);
    return { created: assets.length, assets };
  }

  // ── Fixed Assets ─────────────────────────────────────────────

  async getAssets(tenantId: string, page = 1, limit = 20, search?: string, status?: string, category?: string) {
    const qb = this.fixedAssetRepo.createQueryBuilder('a').where('a.tenantId = :tid', { tid: tenantId });
    if (search) qb.andWhere('(a.assetName ILIKE :s OR a.assetCode ILIKE :s OR a.serialNumber ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('a.status = :status', { status });
    if (category) qb.andWhere('a.category = :category', { category });
    qb.orderBy('a.createdAt', 'DESC').skip((page-1)*limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getAsset(tenantId: string, id: string) {
    return this.fixedAssetRepo.findOne({ where: { assetId: id, tenantId } as any });
  }

  async createAsset(tenantId: string, dto: any, userId: string) {
    // Auto generate asset code
    const count = await this.fixedAssetRepo.count({ where: { tenantId } as any });
    const assetCode = dto.assetCode || `AST-${String(count + 1).padStart(4, '0')}`;
    // Calculate initial values
    const purchaseCost = Number(dto.purchaseCost || 0);
    const salvageValue = Number(dto.salvageValue || 0);
    const usefulLife = Number(dto.usefulLifeYears || 5);
    const depreciableAmount = purchaseCost - salvageValue;
    const annualDepreciation = usefulLife > 0 ? depreciableAmount / usefulLife : 0;
    const depreciationRate = purchaseCost > 0 ? (annualDepreciation / purchaseCost) * 100 : 0;
    const { poItemBaseId, ...assetDto } = dto;
    const asset = this.fixedAssetRepo.create({
      ...assetDto, tenantId, assetCode, createdBy: userId,
      currentBookValue: purchaseCost,
      depreciationRate,
      accumulatedDepreciation: 0,
    } as any);
    const saved = await this.fixedAssetRepo.save(asset) as any;
    // Increment assets_created counter on PO item if created from PO
    if (poItemBaseId) {
      await this.invoiceRepo.query(
        `UPDATE purchase_order_items SET assets_created = COALESCE(assets_created, 0) + 1 WHERE item_id = $1`,
        [poItemBaseId]
      );
    }
    // Auto journal entry: Dr Asset Account / Cr AP or Bank
    if (purchaseCost > 0 && dto.coaAssetAccount) {
      const creditAccount = dto.supplierName ? '2110' : '1120'; // AP or Bank
      await this.createAutoJournalEntry(tenantId, userId, {
        voucherNumber: assetCode, description: `Asset Purchase: ${dto.assetName}`,
        voucherDate: dto.purchaseDate || new Date().toISOString().slice(0,10),
        lines: [
          { accountCode: dto.coaAssetAccount, description: `Asset: ${dto.assetName}`, debitAmount: purchaseCost, creditAmount: 0 },
          { accountCode: creditAccount, description: `Purchase of ${dto.assetName}`, debitAmount: 0, creditAmount: purchaseCost },
        ],
      });
    }
    return saved;
  }

  async updateAsset(tenantId: string, id: string, dto: any) {
    await this.fixedAssetRepo.update({ assetId: id, tenantId } as any, dto);
    return this.fixedAssetRepo.findOne({ where: { assetId: id } as any });
  }

  async deleteAsset(tenantId: string, id: string) {
    await this.fixedAssetRepo.delete({ assetId: id, tenantId } as any);
    return { success: true };
  }

  async calculateDepreciation(tenantId: string, assetId: string, year: number, month: number, userId: string) {
    const asset = await this.fixedAssetRepo.findOne({ where: { assetId, tenantId } as any }) as any;
    if (!asset) throw new Error('Asset not found');
    const purchaseCost = Number(asset.purchaseCost || 0);
    const salvageValue = Number(asset.salvageValue || 0);
    const usefulLife = Number(asset.usefulLifeYears || 5);
    const accumulatedDepr = Number(asset.accumulatedDepreciation || 0);
    const currentValue = Number(asset.currentBookValue || purchaseCost);
    const depreciableAmount = purchaseCost - salvageValue;
    let monthlyDepr = 0;
    if (asset.depreciationMethod === 'STRAIGHT_LINE') {
      monthlyDepr = usefulLife > 0 ? depreciableAmount / (usefulLife * 12) : 0;
    } else if (asset.depreciationMethod === 'DECLINING_BALANCE') {
      const rate = Number(asset.depreciationRate || 0) / 100 / 12;
      monthlyDepr = currentValue * rate;
    }
    monthlyDepr = Math.min(monthlyDepr, Math.max(0, currentValue - salvageValue));
    const newAccumDepr = accumulatedDepr + monthlyDepr;
    const newBookValue = purchaseCost - newAccumDepr;
    // Save depreciation record
    const deprRecord = this.assetDeprRepo.create({
      tenantId, assetId, periodYear: year, periodMonth: month,
      openingValue: currentValue, depreciationAmount: monthlyDepr,
      closingValue: newBookValue, accumulatedDepreciation: newAccumDepr,
      status: 'POSTED', postedDate: new Date().toISOString().slice(0,10),
    } as any);
    await this.assetDeprRepo.save(deprRecord);
    // Update asset
    await this.fixedAssetRepo.update({ assetId } as any, {
      accumulatedDepreciation: newAccumDepr, currentBookValue: newBookValue,
    } as any);
    // Auto journal entry
    if (monthlyDepr > 0 && asset.coaDeprExpenseAccount && asset.coaAccumDeprAccount) {
      await this.createAutoJournalEntry(tenantId, userId, {
        voucherNumber: `DEPR-${assetId.slice(-6)}-${year}-${month}`,
        description: `Depreciation: ${asset.assetName} (${year}/${month})`,
        voucherDate: `${year}-${String(month).padStart(2,'0')}-01`,
        lines: [
          { accountCode: asset.coaDeprExpenseAccount, description: `Depreciation - ${asset.assetName}`, debitAmount: monthlyDepr, creditAmount: 0 },
          { accountCode: asset.coaAccumDeprAccount, description: `Accum. Depr - ${asset.assetName}`, debitAmount: 0, creditAmount: monthlyDepr },
        ],
      });
    }
    return deprRecord;
  }

  async runBulkDepreciation(tenantId: string, year: number, month: number, userId: string) {
    const assets = await this.fixedAssetRepo.find({ where: { tenantId, status: 'ACTIVE', isActive: true } as any });
    const results = [];
    for (const asset of assets) {
      try {
        const result = await this.calculateDepreciation(tenantId, (asset as any).assetId, year, month, userId);
        results.push({ assetId: (asset as any).assetId, assetName: (asset as any).assetName, status: 'success', amount: (result as any).depreciationAmount });
      } catch (e: any) {
        results.push({ assetId: (asset as any).assetId, assetName: (asset as any).assetName, status: 'error', error: e.message });
      }
    }
    return { processed: results.length, results };
  }

  async getDepreciationSchedule(tenantId: string, assetId: string) {
    return this.assetDeprRepo.find({ where: { tenantId, assetId } as any, order: { periodYear: 'DESC', periodMonth: 'DESC' } });
  }

  async getMaintenance(tenantId: string, assetId?: string, status?: string) {
    const where: any = { tenantId };
    if (assetId) where.assetId = assetId;
    if (status) where.status = status;
    return this.assetMaintRepo.find({ where, order: { scheduledDate: 'ASC' } });
  }

  async createMaintenance(tenantId: string, dto: any, userId: string) {
    const m = this.assetMaintRepo.create({ ...dto, tenantId, createdBy: userId } as any);
    const saved = await this.assetMaintRepo.save(m);
    // Update asset next maintenance date
    if (dto.assetId && dto.nextDueDate) {
      await this.fixedAssetRepo.update({ assetId: dto.assetId } as any, { nextMaintenanceDate: dto.nextDueDate } as any);
    }
    return saved;
  }

  async updateMaintenance(tenantId: string, id: string, dto: any) {
    await this.assetMaintRepo.update({ maintenanceId: id, tenantId } as any, dto);
    if (dto.status === 'COMPLETED' && dto.assetId) {
      await this.fixedAssetRepo.update({ assetId: dto.assetId } as any, {
        lastMaintenanceDate: dto.completedDate || new Date().toISOString().slice(0,10),
        nextMaintenanceDate: dto.nextDueDate,
        condition: dto.condition || 'GOOD',
      } as any);
    }
    return this.assetMaintRepo.findOne({ where: { maintenanceId: id } as any });
  }

  async getTransfers(tenantId: string, assetId?: string) {
    const where: any = { tenantId };
    if (assetId) where.assetId = assetId;
    return this.assetTransferRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async createTransfer(tenantId: string, dto: any, userId: string) {
    const t = this.assetTransferRepo.create({ ...dto, tenantId, createdBy: userId } as any);
    const saved = await this.assetTransferRepo.save(t);
    // Update asset location and assignment
    await this.fixedAssetRepo.update({ assetId: dto.assetId } as any, {
      department: dto.toDepartment,
      locationName: dto.toLocation,
      assignedToId: dto.toUserId,
      assignedToName: dto.toUserName,
    } as any);
    return saved;
  }

  async getAssetStats(tenantId: string) {
    const assets = await this.fixedAssetRepo.find({ where: { tenantId } as any });
    const totalAssets = assets.length;
    const totalCost = assets.reduce((s, a) => s + Number((a as any).purchaseCost || 0), 0);
    const totalBookValue = assets.reduce((s, a) => s + Number((a as any).currentBookValue || 0), 0);
    const totalAccumDepr = assets.reduce((s, a) => s + Number((a as any).accumulatedDepreciation || 0), 0);
    const byStatus = assets.reduce((acc: any, a) => { const s = (a as any).status || 'ACTIVE'; acc[s] = (acc[s]||0)+1; return acc; }, {});
    const byCategory = assets.reduce((acc: any, a) => { const c = (a as any).category || 'Uncategorized'; acc[c] = (acc[c]||0)+1; return acc; }, {});
    const dueForMaintenance = await this.assetMaintRepo.count({ where: { tenantId, status: 'SCHEDULED' } as any });
    const expiredWarranty = assets.filter((a:any) => a.warrantyExpiry && new Date(a.warrantyExpiry) < new Date()).length;
    return { totalAssets, totalCost, totalBookValue, totalAccumDepr, byStatus, byCategory, dueForMaintenance, expiredWarranty };
  }

  async getSalesmanReport(tenantId: string, from?: string, to?: string) {
    // Sales by salesman
    const qb = this.invoiceRepo.createQueryBuilder('i')
      .select('i.salesmanId', 'salesmanId')
      .addSelect('i.salesmanName', 'salesmanName')
      .addSelect('COUNT(*)', 'invoiceCount')
      .addSelect('SUM(i.totalAmount)', 'totalSales')
      .addSelect('SUM(i.paidAmount)', 'totalCollected')
      .addSelect('SUM(i.balanceDue)', 'totalOutstanding')
      .where('i.tenantId = :tid', { tid: tenantId })
      .andWhere('i.salesmanId IS NOT NULL');
    if (from) qb.andWhere('i.invoiceDate >= :from', { from });
    if (to) qb.andWhere('i.invoiceDate <= :to', { to });
    const bySalesman = await qb.groupBy('i.salesmanId, i.salesmanName')
      .orderBy('SUM(i.totalAmount)', 'DESC').getRawMany();

    // Quotations by salesman
    const qbQ = this.quotationRepo.createQueryBuilder('q')
      .select('q.salesmanId', 'salesmanId')
      .addSelect('q.salesmanName', 'salesmanName')
      .addSelect('COUNT(*)', 'quotationCount')
      .addSelect('SUM(q.totalAmount)', 'totalQuoted')
      .addSelect("COUNT(CASE WHEN q.status = 'CONVERTED' THEN 1 END)", "converted")
      .where('q.tenantId = :tid', { tid: tenantId })
      .andWhere('q.salesmanId IS NOT NULL');
    if (from) qbQ.andWhere('q.quotationDate >= :from', { from });
    if (to) qbQ.andWhere('q.quotationDate <= :to', { to });
    const quotationsBySalesman = await qbQ.groupBy('q.salesmanId, q.salesmanName')
      .orderBy('SUM(q.totalAmount)', 'DESC').getRawMany();

    // Customer visits by salesman
    const visits = await this.invoiceRepo.query(
      `SELECT salesman_id, salesman_name, COUNT(*) as visit_count 
       FROM customer_visits WHERE tenant_id = $1 
       GROUP BY salesman_id, salesman_name ORDER BY COUNT(*) DESC`,
      [tenantId]
    ).catch(() => []);

    return { bySalesman, quotationsBySalesman, visits };
  }

  async getStockReport(tenantId: string) {
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

  async getDashboardAnalytics(tenantId: string) {
    const t = { tenantId };
    const safe = async (fn: () => Promise<any>, fallback: any) => {
      try { return await fn(); } catch (e) { return fallback; }
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


  async signInPerson(tenantId: string, userId: string, dto: any) {
    const sig = this.sigRepo.create({
      tenantId,
      docType: dto.docType,
      docId: dto.docId,
      signerName: dto.signerName,
      signerTitle: dto.signerTitle || null,
      signatureImage: dto.signatureImage,
      gpsLat: dto.gpsLat ?? null,
      gpsLng: dto.gpsLng ?? null,
      ipAddress: dto.ipAddress || null,
      notes: dto.notes || null,
      createdBy: userId || null,
    });
    return this.sigRepo.save(sig);
  }

  async getSignatures(tenantId: string, docType: string, docId: string) {
    return this.sigRepo.find({
      where: { tenantId, docType, docId },
      order: { signedAt: 'DESC' },
    });
  }


  async getSignatureStatus(tenantId: string, docType: string) {
    const rows = await this.sigRepo.createQueryBuilder('s')
      .select('s.docId', 'docId')
      .addSelect('MAX(s.signerName)', 'signerName')
      .addSelect('MAX(s.signedAt)', 'signedAt')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.docType = :docType', { docType })
      .groupBy('s.docId')
      .getRawMany();
    return rows;
  }


  async getStockSummary(tenantId: string, filters: any = {}) {
    const qb = this.productRepo.createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId });
    if (filters.category) qb.andWhere('p.category = :category', { category: filters.category });
    if (filters.productType) qb.andWhere('p.productType = :pt', { pt: filters.productType });
    const products = await qb.orderBy('p.productName', 'ASC').getMany();

    const rows = products.map((p: any) => {
      const qty = Number(p.stockQty || 0);
      const cost = Number(p.costPrice || 0);
      const minQty = Number(p.minStockQty || 0);
      const value = qty * cost;
      let status = 'IN_STOCK';
      if (qty <= 0) status = 'OUT_OF_STOCK';
      else if (minQty > 0 && qty <= minQty) status = 'LOW_STOCK';
      return {
        productId: p.productId, productCode: p.productCode, productName: p.productName,
        category: p.category || '', productType: p.productType || 'STOCK',
        unitOfMeasure: p.unitOfMeasure, stockQty: qty, costPrice: cost,
        unitPrice: Number(p.unitPrice || 0), minStockQty: minQty, stockValue: value, status,
      };
    });

    const filtered = filters.status ? rows.filter((r) => r.status === filters.status) : rows;

    const summary = {
      totalSkus: filtered.length,
      totalStockValue: filtered.reduce((s2, r) => s2 + r.stockValue, 0),
      lowStockCount: rows.filter((r) => r.status === 'LOW_STOCK').length,
      outOfStockCount: rows.filter((r) => r.status === 'OUT_OF_STOCK').length,
      totalQty: filtered.reduce((s2, r) => s2 + r.stockQty, 0),
    };

    const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))].sort();
    return { rows: filtered, summary, categories };
  }


  // ═══════════════════════════════════════════════════════════
  // RFQ / VENDOR QUOTATION MODULE
  // ═══════════════════════════════════════════════════════════

  // RFQ number generator (raw SQL — RFQ tables are not TypeORM entities)
  private async generateRfqNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const rows = await this.poRepo.query(
      `SELECT MAX(rfq_number) AS max FROM rfqs WHERE tenant_id = $1 AND rfq_number LIKE $2`,
      [tenantId, `RFQ-${year}-%`]);
    let next = 1;
    const max = rows?.[0]?.max;
    if (max) {
      const last = parseInt(String(max).split('-').pop(), 10);
      if (!isNaN(last)) next = last + 1;
    }
    return `RFQ-${year}-${String(next).padStart(4, '0')}`;
  }

  private genRfqToken(): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    return crypto.randomBytes(48).toString('hex'); // 96 chars
  }

  // Create RFQ: header + items + invited vendors (status DRAFT; tokens generated, NOT emailed yet)
  async createRfq(tenantId: string, dto: any, userId: string): Promise<any> {
    const number = await this.generateRfqNumber(tenantId);
    const rfqRows = await this.poRepo.query(
      `INSERT INTO rfqs (tenant_id, rfq_number, title, description, status, response_deadline,
         currency_code, delivery_location_id, terms_text, created_by)
       VALUES ($1,$2,$3,$4,'DRAFT',$5,$6,$7,$8,$9)
       RETURNING rfq_id`,
      [tenantId, number, dto.title || 'Untitled RFQ', dto.description || null,
       dto.responseDeadline || null, dto.currencyCode || 'OMR',
       dto.deliveryLocationId || null, dto.termsText || null, userId]);
    const rfqId = rfqRows[0].rfq_id;

    // Items
    const items = dto.items || [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      await this.poRepo.query(
        `INSERT INTO rfq_items (rfq_id, tenant_id, product_id, item_code, description,
           quantity, unit_of_measure, spec_notes, line_number)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [rfqId, tenantId, it.productId || null, it.itemCode || null,
         it.description || '', Number(it.quantity) || 0, it.unitOfMeasure || null,
         it.specNotes || null, i + 1]);
    }

    // Invited vendors (each gets a unique token; expiry = deadline if set)
    const vendors = dto.vendors || [];
    for (const v of vendors) {
      await this.poRepo.query(
        `INSERT INTO rfq_vendors (rfq_id, tenant_id, supplier_id, vendor_name, vendor_email,
           access_token, status, token_expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,'INVITED',$7)`,
        [rfqId, tenantId, v.supplierId || null, v.vendorName || '',
         v.vendorEmail || '', this.genRfqToken(), dto.responseDeadline || null]);
    }

    return this.getRfq(tenantId, rfqId);
  }

  async getRfqs(tenantId: string, status?: string): Promise<any> {
    const params: any[] = [tenantId];
    let where = `r.tenant_id = $1`;
    if (status) { where += ` AND r.status = $2`; params.push(status); }
    const rows = await this.poRepo.query(
      `SELECT r.rfq_id AS "rfqId", r.rfq_number AS "rfqNumber", r.title, r.status,
              r.response_deadline AS "responseDeadline", r.currency_code AS "currencyCode",
              r.created_at AS "createdAt",
              (SELECT COUNT(*) FROM rfq_vendors v WHERE v.rfq_id = r.rfq_id) AS "vendorCount",
              (SELECT COUNT(*) FROM rfq_vendors v WHERE v.rfq_id = r.rfq_id AND v.status='SUBMITTED') AS "responseCount",
              (SELECT COUNT(*) FROM rfq_items i WHERE i.rfq_id = r.rfq_id) AS "itemCount"
       FROM rfqs r WHERE ${where} ORDER BY r.created_at DESC`,
      params);
    return rows;
  }

  async getRfq(tenantId: string, rfqId: string): Promise<any> {
    const head = await this.poRepo.query(
      `SELECT rfq_id AS "rfqId", rfq_number AS "rfqNumber", title, description, status,
              response_deadline AS "responseDeadline", currency_code AS "currencyCode",
              delivery_location_id AS "deliveryLocationId", terms_text AS "termsText",
              created_at AS "createdAt", awarded_at AS "awardedAt"
       FROM rfqs WHERE rfq_id = $1 AND tenant_id = $2`,
      [rfqId, tenantId]);
    if (!head.length) throw new BadRequestException('RFQ not found');
    const items = await this.poRepo.query(
      `SELECT rfq_item_id AS "rfqItemId", product_id AS "productId", item_code AS "itemCode",
              description, quantity, unit_of_measure AS "unitOfMeasure", spec_notes AS "specNotes",
              line_number AS "lineNumber"
       FROM rfq_items WHERE rfq_id = $1 ORDER BY line_number`,
      [rfqId]);
    const vendors = await this.poRepo.query(
      `SELECT rfq_vendor_id AS "rfqVendorId", supplier_id AS "supplierId", vendor_name AS "vendorName",
              vendor_email AS "vendorEmail", status, invited_at AS "invitedAt",
              submitted_at AS "submittedAt"
       FROM rfq_vendors WHERE rfq_id = $1 ORDER BY vendor_name`,
      [rfqId]);
    return { ...head[0], items, vendors };
  }

  async updateRfq(tenantId: string, rfqId: string, dto: any): Promise<any> {
    // Only DRAFT RFQs can be structurally edited
    const cur = await this.poRepo.query(
      `SELECT status FROM rfqs WHERE rfq_id = $1 AND tenant_id = $2`, [rfqId, tenantId]);
    if (!cur.length) throw new BadRequestException('RFQ not found');
    if (cur[0].status !== 'DRAFT')
      throw new BadRequestException('Only draft RFQs can be edited');

    await this.poRepo.query(
      `UPDATE rfqs SET title=$1, description=$2, response_deadline=$3, currency_code=$4,
         delivery_location_id=$5, terms_text=$6, updated_at=now()
       WHERE rfq_id=$7 AND tenant_id=$8`,
      [dto.title, dto.description || null, dto.responseDeadline || null,
       dto.currencyCode || 'OMR', dto.deliveryLocationId || null, dto.termsText || null,
       rfqId, tenantId]);

    if (dto.items) {
      await this.poRepo.query(`DELETE FROM rfq_items WHERE rfq_id=$1`, [rfqId]);
      for (let i = 0; i < dto.items.length; i++) {
        const it = dto.items[i];
        await this.poRepo.query(
          `INSERT INTO rfq_items (rfq_id, tenant_id, product_id, item_code, description,
             quantity, unit_of_measure, spec_notes, line_number)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [rfqId, tenantId, it.productId || null, it.itemCode || null, it.description || '',
           Number(it.quantity) || 0, it.unitOfMeasure || null, it.specNotes || null, i + 1]);
      }
    }
    // Vendor edits (add/remove) only while DRAFT — tokens preserved for existing
    if (dto.vendors) {
      const existing = await this.poRepo.query(
        `SELECT rfq_vendor_id AS id, supplier_id AS "supplierId", vendor_email AS "vendorEmail" FROM rfq_vendors WHERE rfq_id=$1`, [rfqId]);
      const keepEmails = new Set(dto.vendors.map((v: any) => (v.vendorEmail || '').toLowerCase()));
      // remove vendors no longer in the list
      for (const ex of existing) {
        if (!keepEmails.has((ex.vendorEmail || '').toLowerCase())) {
          await this.poRepo.query(`DELETE FROM rfq_vendors WHERE rfq_vendor_id=$1`, [ex.id]);
        }
      }
      const haveEmails = new Set(existing.map((e: any) => (e.vendorEmail || '').toLowerCase()));
      for (const v of dto.vendors) {
        if (!haveEmails.has((v.vendorEmail || '').toLowerCase())) {
          await this.poRepo.query(
            `INSERT INTO rfq_vendors (rfq_id, tenant_id, supplier_id, vendor_name, vendor_email,
               access_token, status, token_expires_at)
             VALUES ($1,$2,$3,$4,$5,$6,'INVITED',$7)`,
            [rfqId, tenantId, v.supplierId || null, v.vendorName || '', v.vendorEmail || '',
             this.genRfqToken(), dto.responseDeadline || null]);
        }
      }
    }
    return this.getRfq(tenantId, rfqId);
  }

  async deleteRfq(tenantId: string, rfqId: string): Promise<any> {
    const cur = await this.poRepo.query(
      `SELECT status FROM rfqs WHERE rfq_id=$1 AND tenant_id=$2`, [rfqId, tenantId]);
    if (!cur.length) throw new BadRequestException('RFQ not found');
    if (!['DRAFT', 'CANCELLED'].includes(cur[0].status))
      throw new BadRequestException('Only draft or cancelled RFQs can be deleted');
    await this.poRepo.query(`DELETE FROM rfqs WHERE rfq_id=$1 AND tenant_id=$2`, [rfqId, tenantId]);
    return { success: true };
  }

  async cancelRfq(tenantId: string, rfqId: string): Promise<any> {
    await this.poRepo.query(
      `UPDATE rfqs SET status='CANCELLED', updated_at=now() WHERE rfq_id=$1 AND tenant_id=$2`,
      [rfqId, tenantId]);
    return { success: true };
  }

    // Send RFQ invitations: email each invited vendor their unique quote link, move RFQ to SENT.
  async sendRfqInvitations(tenantId: string, rfqId: string, frontendBaseUrl?: string): Promise<any> {
    const rfqRows = await this.poRepo.query(
      `SELECT rfq_number AS "rfqNumber", title, status, response_deadline AS "responseDeadline"
       FROM rfqs WHERE rfq_id = $1 AND tenant_id = $2`, [rfqId, tenantId]);
    if (!rfqRows.length) throw new BadRequestException('RFQ not found');
    const rfq = rfqRows[0];
    if (!['DRAFT', 'SENT'].includes(rfq.status))
      throw new BadRequestException('Only draft or already-sent RFQs can have invitations sent');

    const vendors = await this.poRepo.query(
      `SELECT rfq_vendor_id AS "rfqVendorId", vendor_name AS "vendorName",
              vendor_email AS "vendorEmail", access_token AS "accessToken", status
       FROM rfq_vendors WHERE rfq_id = $1`, [rfqId]);
    const withEmail = vendors.filter((v: any) => v.vendorEmail && v.vendorEmail.includes('@'));
    if (!withEmail.length)
      throw new BadRequestException('No invited vendors have a valid email address');

    // Fetch tenant email config (same source the rest of the app uses)
    const tenantRows = await this.poRepo.query(
      `SELECT settings FROM tenants WHERE tenant_id = $1`, [tenantId]);
    const settings = tenantRows?.[0]?.settings || {};
    const cfg = settings.emailConfig;
    const base = (frontendBaseUrl || 'https://automatexion-crm-frontend.onrender.com').replace(/\/$/, '');

    let sent = 0, skipped = 0;
    const emailReady = cfg?.host && cfg?.username && cfg?.password;
    let transporter: any = null;
    let emailModuleOk = false;
    if (emailReady) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodemailer = require('nodemailer');
        transporter = nodemailer.createTransport({
          host: cfg.host, port: cfg.port || 587, secure: cfg.secure || false,
          auth: { user: cfg.username, pass: cfg.password },
        });
        emailModuleOk = true;
      } catch (e) {
        // nodemailer not available or transport init failed — fall back to copyable links
        transporter = null;
        emailModuleOk = false;
      }
    }

    const deadlineStr = rfq.responseDeadline
      ? new Date(rfq.responseDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'the stated deadline';

    for (const v of withEmail) {
      const link = `${base}/vendor-quote?token=${v.accessToken}`;
      if (transporter) {
        try {
          await transporter.sendMail({
            from: `"${cfg.fromName || 'Envoiso Procurement'}" <${cfg.fromEmail || cfg.username}>`,
            to: v.vendorEmail,
            subject: `Request for Quotation ${rfq.rfqNumber} — ${rfq.title}`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
                <h2 style="color:#0B2547">Request for Quotation</h2>
                <p>Dear ${v.vendorName || 'Supplier'},</p>
                <p>You are invited to submit a quotation for <strong>${rfq.rfqNumber} — ${rfq.title}</strong>.</p>
                <p>Please submit your prices using the secure link below. Responses are due by <strong>${deadlineStr}</strong>.</p>
                <p style="text-align:center;margin:28px 0">
                  <a href="${link}" style="background:#1A4D8F;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;display:inline-block">Submit Your Quote</a>
                </p>
                <p style="color:#666;font-size:13px">This link is unique to you. Please do not share it. It remains open until the deadline.</p>
                <p style="color:#999;font-size:12px">${cfg.signature || 'Sent via Envoiso'}</p>
              </div>`,
          });
          sent++;
        } catch (e) {
          skipped++;
        }
      } else {
        skipped++;
      }
      // mark invited regardless (token is valid; buyer can copy the link manually if email is off)
      await this.poRepo.query(
        `UPDATE rfq_vendors SET status = CASE WHEN status='INVITED' THEN 'INVITED' ELSE status END,
           invited_at = COALESCE(invited_at, now()) WHERE rfq_vendor_id = $1`, [v.rfqVendorId]);
    }

    await this.poRepo.query(
      `UPDATE rfqs SET status='SENT', updated_at=now() WHERE rfq_id=$1 AND tenant_id=$2`,
      [rfqId, tenantId]);

    const couldEmail = emailReady && emailModuleOk;
    return {
      success: true,
      sent, skipped,
      emailConfigured: !!couldEmail,
      message: couldEmail
        ? `Invitations sent to ${sent} vendor(s)${skipped ? `, ${skipped} failed` : ''}. The RFQ is now marked Sent.`
        : `The RFQ is marked Sent and each vendor's link is active. Email could not be sent automatically — open "Vendor links" to copy and share each link directly.`,
    };
  }

  // Return vendor links (so the buyer can copy/share manually, esp. when email is off)
  async getRfqVendorLinks(tenantId: string, rfqId: string, frontendBaseUrl?: string): Promise<any> {
    const base = (frontendBaseUrl || 'https://automatexion-crm-frontend.onrender.com').replace(/\/$/, '');
    const vendors = await this.poRepo.query(
      `SELECT vendor_name AS "vendorName", vendor_email AS "vendorEmail",
              access_token AS "accessToken", status
       FROM rfq_vendors WHERE rfq_id = $1 AND tenant_id = $2 ORDER BY vendor_name`,
      [rfqId, tenantId]);
    return vendors.map((v: any) => ({
      vendorName: v.vendorName, vendorEmail: v.vendorEmail, status: v.status,
      link: `${base}/vendor-quote?token=${v.accessToken}`,
    }));
  }

    // ═══════════════════════════════════════════════════════════
  // RFQ PUBLIC (vendor-facing, no auth — resolved entirely by token)
  // ═══════════════════════════════════════════════════════════

  // Resolve a vendor token to its RFQ context; throws generic error if invalid.
  private async resolveRfqToken(token: string): Promise<any> {
    if (!token || token.length < 20) throw new BadRequestException('This link is not valid.');
    const rows = await this.poRepo.query(
      `SELECT v.rfq_vendor_id AS "rfqVendorId", v.rfq_id AS "rfqId", v.tenant_id AS "tenantId",
              v.vendor_name AS "vendorName", v.vendor_email AS "vendorEmail", v.status AS "vendorStatus",
              v.token_expires_at AS "tokenExpiresAt",
              r.rfq_number AS "rfqNumber", r.title, r.description, r.status AS "rfqStatus",
              r.response_deadline AS "responseDeadline", r.currency_code AS "currencyCode",
              r.terms_text AS "termsText"
       FROM rfq_vendors v JOIN rfqs r ON r.rfq_id = v.rfq_id
       WHERE v.access_token = $1 LIMIT 1`,
      [token]);
    if (!rows.length) throw new BadRequestException('This link is not valid.');
    return rows[0];
  }

  private rfqIsOpen(ctx: any): boolean {
    if (['CANCELLED', 'AWARDED'].includes(ctx.rfqStatus)) return false;
    if (ctx.responseDeadline && new Date(ctx.responseDeadline) < new Date()) return false;
    return true;
  }

  // GET — vendor opens their link: RFQ details + their own draft/submitted quote (never others')
  async publicGetRfq(token: string): Promise<any> {
    const ctx = await this.resolveRfqToken(token);
    // mark VIEWED (first open) without clobbering later statuses
    if (ctx.vendorStatus === 'INVITED') {
      await this.poRepo.query(
        `UPDATE rfq_vendors SET status='VIEWED', viewed_at=COALESCE(viewed_at, now()) WHERE rfq_vendor_id=$1`,
        [ctx.rfqVendorId]);
    }
    const items = await this.poRepo.query(
      `SELECT rfq_item_id AS "rfqItemId", item_code AS "itemCode", description,
              quantity, unit_of_measure AS "unitOfMeasure", spec_notes AS "specNotes", line_number AS "lineNumber"
       FROM rfq_items WHERE rfq_id=$1 ORDER BY line_number`, [ctx.rfqId]);
    // existing quote (if any)
    const quoteRows = await this.poRepo.query(
      `SELECT quote_id AS "quoteId", validity_days AS "validityDays", payment_terms AS "paymentTerms",
              delivery_terms AS "deliveryTerms", overall_lead_days AS "overallLeadDays",
              vendor_notes AS "vendorNotes", is_submitted AS "isSubmitted", total_amount AS "totalAmount"
       FROM rfq_quotes WHERE rfq_vendor_id=$1 LIMIT 1`, [ctx.rfqVendorId]);
    let quoteLines: any[] = [];
    if (quoteRows.length) {
      quoteLines = await this.poRepo.query(
        `SELECT rfq_item_id AS "rfqItemId", unit_price AS "unitPrice", lead_time_days AS "leadTimeDays",
                brand_offered AS "brandOffered", line_notes AS "lineNotes"
         FROM rfq_quote_lines WHERE quote_id=$1`, [quoteRows[0].quoteId]);
    }
    return {
      rfqNumber: ctx.rfqNumber, title: ctx.title, description: ctx.description,
      responseDeadline: ctx.responseDeadline, currencyCode: ctx.currencyCode, termsText: ctx.termsText,
      vendorName: ctx.vendorName, vendorEmail: ctx.vendorEmail, vendorStatus: ctx.vendorStatus,
      isOpen: this.rfqIsOpen(ctx),
      closedReason: this.rfqIsOpen(ctx) ? null
        : (['CANCELLED','AWARDED'].includes(ctx.rfqStatus) ? 'This RFQ is closed.' : 'The response deadline has passed.'),
      items,
      quote: quoteRows[0] || null,
      quoteLines,
    };
  }

  // POST — save/update this vendor's quote (draft) until the deadline
  async publicSaveQuote(token: string, dto: any): Promise<any> {
    const ctx = await this.resolveRfqToken(token);
    if (!this.rfqIsOpen(ctx)) throw new BadRequestException('This RFQ is closed for new quotes.');

    // upsert quote header
    let quoteId: string;
    const existing = await this.poRepo.query(
      `SELECT quote_id FROM rfq_quotes WHERE rfq_vendor_id=$1 LIMIT 1`, [ctx.rfqVendorId]);
    const lines = dto.lines || [];
    const total = lines.reduce((s: number, l: any) => s + (Number(l.unitPrice)||0) * 0, 0); // recomputed below with qty

    if (existing.length) {
      quoteId = existing[0].quote_id;
      await this.poRepo.query(
        `UPDATE rfq_quotes SET validity_days=$1, payment_terms=$2, delivery_terms=$3,
           overall_lead_days=$4, vendor_notes=$5, updated_at=now() WHERE quote_id=$6`,
        [dto.validityDays||null, dto.paymentTerms||null, dto.deliveryTerms||null,
         dto.overallLeadDays||null, dto.vendorNotes||null, quoteId]);
      await this.poRepo.query(`DELETE FROM rfq_quote_lines WHERE quote_id=$1`, [quoteId]);
    } else {
      const ins = await this.poRepo.query(
        `INSERT INTO rfq_quotes (rfq_vendor_id, rfq_id, tenant_id, validity_days, payment_terms,
           delivery_terms, overall_lead_days, vendor_notes, is_submitted)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false) RETURNING quote_id`,
        [ctx.rfqVendorId, ctx.rfqId, ctx.tenantId, dto.validityDays||null, dto.paymentTerms||null,
         dto.deliveryTerms||null, dto.overallLeadDays||null, dto.vendorNotes||null]);
      quoteId = ins[0].quote_id;
    }

    // fetch item quantities to compute line totals
    const itemQtys = await this.poRepo.query(
      `SELECT rfq_item_id AS id, quantity FROM rfq_items WHERE rfq_id=$1`, [ctx.rfqId]);
    const qtyMap: any = {};
    for (const it of itemQtys) qtyMap[it.id] = Number(it.quantity) || 0;

    let grand = 0;
    for (const l of lines) {
      const lt = (Number(l.unitPrice)||0) * (qtyMap[l.rfqItemId] || 0);
      grand += lt;
      await this.poRepo.query(
        `INSERT INTO rfq_quote_lines (quote_id, rfq_item_id, tenant_id, unit_price, lead_time_days,
           brand_offered, line_notes, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [quoteId, l.rfqItemId, ctx.tenantId, Number(l.unitPrice)||0, l.leadTimeDays||null,
         l.brandOffered||null, l.lineNotes||null, lt]);
    }
    await this.poRepo.query(`UPDATE rfq_quotes SET total_amount=$1 WHERE quote_id=$2`, [grand, quoteId]);

    // mark vendor as DRAFT (working) if not yet submitted
    if (ctx.vendorStatus !== 'SUBMITTED') {
      await this.poRepo.query(`UPDATE rfq_vendors SET status='DRAFT' WHERE rfq_vendor_id=$1`, [ctx.rfqVendorId]);
    }
    return { success: true, total: grand, message: 'Your quote has been saved.' };
  }

  // POST — finalize submission
  async publicSubmitQuote(token: string, dto: any): Promise<any> {
    // save first (so submit captures the latest edits if sent together)
    if (dto && dto.lines) await this.publicSaveQuote(token, dto);
    const ctx = await this.resolveRfqToken(token);
    if (!this.rfqIsOpen(ctx)) throw new BadRequestException('This RFQ is closed.');
    const q = await this.poRepo.query(`SELECT quote_id FROM rfq_quotes WHERE rfq_vendor_id=$1 LIMIT 1`, [ctx.rfqVendorId]);
    if (!q.length) throw new BadRequestException('Please enter your quote before submitting.');
    await this.poRepo.query(
      `UPDATE rfq_quotes SET is_submitted=true, submitted_at=now() WHERE quote_id=$1`, [q[0].quote_id]);
    await this.poRepo.query(
      `UPDATE rfq_vendors SET status='SUBMITTED', submitted_at=now() WHERE rfq_vendor_id=$1`, [ctx.rfqVendorId]);
    return { success: true, message: 'Your quote has been submitted. Thank you.' };
  }

  // POST — vendor declines to quote
  async publicDeclineQuote(token: string): Promise<any> {
    const ctx = await this.resolveRfqToken(token);
    await this.poRepo.query(`UPDATE rfq_vendors SET status='DECLINED' WHERE rfq_vendor_id=$1`, [ctx.rfqVendorId]);
    return { success: true, message: 'You have declined this RFQ. Thank you for letting us know.' };
  }

    // Comparison matrix: all vendors' quotes aligned by RFQ item, with per-line and
  // total bests flagged. Used by the buyer's award screen.
  async getRfqComparison(tenantId: string, rfqId: string): Promise<any> {
    const head = await this.poRepo.query(
      `SELECT rfq_id AS "rfqId", rfq_number AS "rfqNumber", title, status,
              currency_code AS "currencyCode", response_deadline AS "responseDeadline"
       FROM rfqs WHERE rfq_id=$1 AND tenant_id=$2`, [rfqId, tenantId]);
    if (!head.length) throw new BadRequestException('RFQ not found');

    const items = await this.poRepo.query(
      `SELECT ri.rfq_item_id AS "rfqItemId", ri.item_code AS "itemCode", ri.description,
              ri.quantity, ri.unit_of_measure AS "unitOfMeasure", ri.line_number AS "lineNumber",
              ri.product_id AS "productId", p.location_id AS "defaultLocationId"
       FROM rfq_items ri LEFT JOIN products p ON p.product_id = ri.product_id
       WHERE ri.rfq_id=$1 ORDER BY ri.line_number`, [rfqId]);

    // Only vendors who have a quote (submitted or draft) appear in the comparison
    const vendors = await this.poRepo.query(
      `SELECT v.rfq_vendor_id AS "rfqVendorId", v.vendor_name AS "vendorName", v.status,
              v.submitted_at AS "submittedAt",
              q.quote_id AS "quoteId", q.total_amount AS "totalAmount",
              q.validity_days AS "validityDays", q.payment_terms AS "paymentTerms",
              q.delivery_terms AS "deliveryTerms", q.overall_lead_days AS "overallLeadDays",
              q.vendor_notes AS "vendorNotes", q.is_submitted AS "isSubmitted"
       FROM rfq_vendors v JOIN rfq_quotes q ON q.rfq_vendor_id=v.rfq_vendor_id
       WHERE v.rfq_id=$1 ORDER BY q.total_amount ASC NULLS LAST`, [rfqId]);

    // All quote lines for these quotes, keyed for fast lookup
    const allLines = await this.poRepo.query(
      `SELECT l.quote_id AS "quoteId", l.rfq_item_id AS "rfqItemId",
              l.unit_price AS "unitPrice", l.lead_time_days AS "leadTimeDays",
              l.brand_offered AS "brandOffered", l.line_notes AS "lineNotes", l.line_total AS "lineTotal"
       FROM rfq_quote_lines l
       WHERE l.quote_id IN (SELECT quote_id FROM rfq_quotes WHERE rfq_id=$1)`, [rfqId]);

    // index: lineMap[rfqItemId][quoteId] = lineData
    const lineMap: any = {};
    for (const ln of allLines) {
      (lineMap[ln.rfqItemId] ||= {})[ln.quoteId] = ln;
    }

    // Per-item: compute lowest price + fastest lead across vendors
    const itemRows = items.map((it: any) => {
      const perVendor = vendors.map((v: any) => {
        const ln = lineMap[it.rfqItemId]?.[v.quoteId];
        return ln ? {
          quoteId: v.quoteId,
          unitPrice: Number(ln.unitPrice),
          leadTimeDays: ln.leadTimeDays != null ? Number(ln.leadTimeDays) : null,
          brandOffered: ln.brandOffered,
          lineNotes: ln.lineNotes,
          lineTotal: Number(ln.lineTotal),
        } : { quoteId: v.quoteId, unitPrice: null, leadTimeDays: null, brandOffered: null, lineNotes: null, lineTotal: null };
      });
      const prices = perVendor.filter(p => p.unitPrice != null && p.unitPrice > 0).map(p => p.unitPrice as number);
      const leads = perVendor.filter(p => p.leadTimeDays != null).map(p => p.leadTimeDays as number);
      const lowestPrice = prices.length ? Math.min(...prices) : null;
      const fastestLead = leads.length ? Math.min(...leads) : null;
      return {
        rfqItemId: it.rfqItemId, itemCode: it.itemCode, description: it.description,
        quantity: Number(it.quantity), unitOfMeasure: it.unitOfMeasure, lineNumber: it.lineNumber,
        productId: it.productId || null, defaultLocationId: it.defaultLocationId || null,
        lowestPrice, fastestLead, perVendor,
      };
    });

    // Total bests
    const totals = vendors.map((v: any) => Number(v.totalAmount) || 0).filter(t => t > 0);
    const lowestTotal = totals.length ? Math.min(...totals) : null;

    return {
      ...head[0],
      items: itemRows,
      vendors: vendors.map((v: any) => ({
        rfqVendorId: v.rfqVendorId, quoteId: v.quoteId, vendorName: v.vendorName,
        status: v.status, isSubmitted: v.isSubmitted, submittedAt: v.submittedAt,
        totalAmount: Number(v.totalAmount) || 0,
        validityDays: v.validityDays, paymentTerms: v.paymentTerms,
        deliveryTerms: v.deliveryTerms, overallLeadDays: v.overallLeadDays, vendorNotes: v.vendorNotes,
        isLowestTotal: lowestTotal != null && Number(v.totalAmount) === lowestTotal,
      })),
      lowestTotal,
    };
  }

    // Award an RFQ -> create draft PO(s). Two modes:
  //   WHOLE  : one winning vendor gets all items (dto.rfqVendorId)
  //   SPLIT  : each item awarded to a chosen vendor (dto.lineAwards: [{rfqItemId, rfqVendorId}])
  //            -> one draft PO per winning vendor (grouped).
  async awardRfq(tenantId: string, rfqId: string, dto: any, userId: string): Promise<any> {
    const rfqRows = await this.poRepo.query(
      `SELECT rfq_id AS "rfqId", rfq_number AS "rfqNumber", status, currency_code AS "currencyCode",
              terms_text AS "termsText"
       FROM rfqs WHERE rfq_id=$1 AND tenant_id=$2`, [rfqId, tenantId]);
    if (!rfqRows.length) throw new BadRequestException('RFQ not found');
    const rfq = rfqRows[0];
    if (rfq.status === 'AWARDED') throw new BadRequestException('This RFQ has already been awarded');
    if (rfq.status === 'CANCELLED') throw new BadRequestException('This RFQ is cancelled');

    const items = await this.poRepo.query(
      `SELECT rfq_item_id AS "rfqItemId", product_id AS "productId", item_code AS "itemCode",
              description, quantity, unit_of_measure AS "unitOfMeasure"
       FROM rfq_items WHERE rfq_id=$1 ORDER BY line_number`, [rfqId]);
    const itemMap: any = {};
    for (const it of items) itemMap[it.rfqItemId] = it;

    // Build a map: rfqVendorId -> { vendorInfo, quoteLines{itemId->line} }
    const vendorRows = await this.poRepo.query(
      `SELECT v.rfq_vendor_id AS "rfqVendorId", v.supplier_id AS "supplierId",
              v.vendor_name AS "vendorName", v.vendor_email AS "vendorEmail",
              q.quote_id AS "quoteId"
       FROM rfq_vendors v JOIN rfq_quotes q ON q.rfq_vendor_id=v.rfq_vendor_id
       WHERE v.rfq_id=$1`, [rfqId]);
    const vendorMap: any = {};
    for (const v of vendorRows) vendorMap[v.rfqVendorId] = v;

    const quoteLines = await this.poRepo.query(
      `SELECT quote_id AS "quoteId", rfq_item_id AS "rfqItemId", unit_price AS "unitPrice"
       FROM rfq_quote_lines WHERE quote_id IN (SELECT quote_id FROM rfq_quotes WHERE rfq_id=$1)`, [rfqId]);
    const priceMap: any = {}; // priceMap[quoteId][rfqItemId] = unitPrice
    for (const l of quoteLines) (priceMap[l.quoteId] ||= {})[l.rfqItemId] = Number(l.unitPrice) || 0;

    // Resolve the award assignment -> list of {rfqItemId, rfqVendorId}
    let assignments: any[] = [];
    if (dto.mode === 'SPLIT') {
      if (!Array.isArray(dto.lineAwards) || !dto.lineAwards.length)
        throw new BadRequestException('No line awards provided for split award');
      assignments = dto.lineAwards.filter((a: any) => a.rfqItemId && a.rfqVendorId);
    } else {
      // WHOLE
      if (!dto.rfqVendorId) throw new BadRequestException('No winning vendor selected');
      assignments = items.map((it: any) => ({ rfqItemId: it.rfqItemId, rfqVendorId: dto.rfqVendorId }));
    }

    // Group assignments by winning vendor
    const byVendor: any = {};
    for (const a of assignments) {
      if (!vendorMap[a.rfqVendorId]) continue;
      (byVendor[a.rfqVendorId] ||= []).push(a.rfqItemId);
    }
    if (!Object.keys(byVendor).length) throw new BadRequestException('No valid awards to process');

    // Create one draft PO per winning vendor
    const createdPOs: any[] = [];
    for (const rfqVendorId of Object.keys(byVendor)) {
      const v = vendorMap[rfqVendorId];
      const itemIds: string[] = byVendor[rfqVendorId];
      const lineLocations = dto.lineLocations || {};
      const poItems = itemIds.map((iid) => {
        const it = itemMap[iid];
        const unitPrice = priceMap[v.quoteId]?.[iid] || 0;
        const qty = Number(it.quantity) || 0;
        return {
          productId: it.productId || null,
          itemCode: it.itemCode || null,
          description: it.description,
          unitOfMeasure: it.unitOfMeasure,
          quantity: qty,
          unitPrice,
          lineTotal: qty * unitPrice,
          warehouseLocationId: lineLocations[iid] || null,
        };
      });
      const subtotal = poItems.reduce((s, i) => s + i.lineTotal, 0);
      // Resolve supplier (use linked supplier_id; fall back to find-or-create for ad-hoc)
      let supplierId = v.supplierId;
      let supplierName = v.vendorName;
      if (!supplierId) {
        const oc = await this.findOrCreateSupplier(tenantId, v.vendorName, { email: v.vendorEmail });
        supplierId = oc.id;
      }
      const poDto: any = {
        supplierId, supplierName,
        supplierEmail: v.vendorEmail || null,
        poDate: new Date().toISOString().slice(0, 10),
        currencyCode: rfq.currencyCode || 'OMR',
        status: 'DRAFT',
        subtotal, taxableAmount: subtotal, vatRate: 0, vatAmount: 0, totalAmount: subtotal,
        terms_conditions: rfq.termsText || null,
        notes: `Awarded from ${rfq.rfqNumber}`,
        rfqId, rfqVendorId,
        items: poItems,
      };
      const po = await this.createPurchaseOrder(tenantId, poDto, userId);
      createdPOs.push({ poNumber: (po as any)?.poNumber, vendorName: supplierName, total: subtotal, items: poItems.length });
    }

    // Mark RFQ awarded
    await this.poRepo.query(
      `UPDATE rfqs SET status='AWARDED', awarded_at=now(), updated_at=now() WHERE rfq_id=$1 AND tenant_id=$2`,
      [rfqId, tenantId]);

    return {
      success: true,
      mode: dto.mode || 'WHOLE',
      posCreated: createdPOs.length,
      purchaseOrders: createdPOs,
      message: `${createdPOs.length} draft purchase order(s) created from ${rfq.rfqNumber}.`,
    };
  }

    // ── Product search field configuration (tenant-level, global) ───────────
  // Whitelist: only these entity props may ever be searched (SQL-safe).
  private readonly PRODUCT_SEARCH_WHITELIST: { key: string; prop: string; label: string }[] = [
    { key: 'name',        prop: 'productName',   label: 'Product Name' },
    { key: 'nameAr',      prop: 'productNameAr', label: 'Product Name (Arabic)' },
    { key: 'code',        prop: 'productCode',   label: 'Product Code' },
    { key: 'brand',       prop: 'brand',         label: 'Brand' },
    { key: 'category',    prop: 'category',      label: 'Category' },
    { key: 'barcode',     prop: 'barcode',       label: 'Barcode' },
    { key: 'partNumber',  prop: 'partNumber',    label: 'Part Number' },
    { key: 'modelNumber', prop: 'modelNumber',   label: 'Model Number' },
    { key: 'designNumber',prop: 'designNumber',  label: 'Design Number' },
    { key: 'manufacturer',prop: 'manufacturer',  label: 'Manufacturer' },
    { key: 'hsCode',      prop: 'hsCode',        label: 'HS Code' },
    { key: 'description', prop: 'description',   label: 'Description' },
  ];

  // Resolve which fields to search for a tenant (defaults to name + code).
  private async resolveProductSearchFields(tenantId: string): Promise<string[]> {
    try {
      const rows = await this.productRepo.query(
        `SELECT settings FROM tenants WHERE tenant_id = $1`, [tenantId]);
      let settings = rows?.[0]?.settings;
      if (typeof settings === 'string') { try { settings = JSON.parse(settings); } catch { settings = {}; } }
      const cfg = settings?.productSearchFields;
      if (Array.isArray(cfg) && cfg.length) {
        // keep only whitelisted keys
        const allowed = new Set(this.PRODUCT_SEARCH_WHITELIST.map(w => w.key));
        const props = cfg.filter((k: string) => allowed.has(k))
          .map((k: string) => this.PRODUCT_SEARCH_WHITELIST.find(w => w.key === k)!.prop);
        if (props.length) return props;
      }
    } catch { /* fall through to default */ }
    return ['productName', 'productCode']; // safe default
  }

  // GET current setting (keys + the full available list with labels)
  async getProductSearchSettings(tenantId: string): Promise<any> {
    const rows = await this.productRepo.query(
      `SELECT settings FROM tenants WHERE tenant_id = $1`, [tenantId]);
    let settings = rows?.[0]?.settings;
    if (typeof settings === 'string') { try { settings = JSON.parse(settings); } catch { settings = {}; } }
    const cfg = settings?.productSearchFields;
    const enabled = Array.isArray(cfg) && cfg.length ? cfg : ['name', 'code'];
    return {
      available: this.PRODUCT_SEARCH_WHITELIST.map(w => ({ key: w.key, label: w.label })),
      enabled,
    };
  }

  // PUT update the setting (merge into tenants.settings JSON, never clobbering emailConfig etc.)
  async updateProductSearchSettings(tenantId: string, fields: string[]): Promise<any> {
    const allowed = new Set(this.PRODUCT_SEARCH_WHITELIST.map(w => w.key));
    let clean = (Array.isArray(fields) ? fields : []).filter(k => allowed.has(k));
    // always keep at least name + code so search never returns nothing
    if (!clean.includes('name')) clean.unshift('name');
    if (!clean.includes('code')) clean.push('code');
    const rows = await this.productRepo.query(
      `SELECT settings FROM tenants WHERE tenant_id = $1`, [tenantId]);
    let settings = rows?.[0]?.settings;
    if (typeof settings === 'string') { try { settings = JSON.parse(settings); } catch { settings = {}; } }
    if (!settings || typeof settings !== 'object') settings = {};
    settings.productSearchFields = clean;
    await this.productRepo.query(
      `UPDATE tenants SET settings = $1 WHERE tenant_id = $2`,
      [JSON.stringify(settings), tenantId]);
    return { success: true, enabled: clean };
  }

    // ── Field Sales: Product Availability & Price ───────────────────────────
  // Mobile view for reps: searchable products with price + live stock per warehouse.
  // Uses the tenant's configured product search fields.
  async getFieldProductAvailability(tenantId: string, search?: string, limit = 50): Promise<any> {
    const params: any[] = [tenantId];
    let where = 'p.tenant_id = $1 AND p.is_active = true';
    if (search) {
      const fields = await this.resolveProductSearchFields(tenantId); // entity props
      // map entity props -> db columns for raw SQL
      const propToCol: any = {
        productName: 'product_name', productNameAr: 'product_name_ar', productCode: 'product_code',
        brand: 'brand', category: 'category', barcode: 'barcode', partNumber: 'part_number',
        modelNumber: 'model_number', designNumber: 'design_number', manufacturer: 'manufacturer',
        hsCode: 'hs_code', description: 'description',
      };
      const cols = fields.map(f => propToCol[f]).filter(Boolean);
      if (cols.length) {
        params.push(`%${search}%`);
        const ors = cols.map(c => `p.${c} ILIKE $${params.length}`).join(' OR ');
        where += ` AND (${ors})`;
      }
    }
    const rows = await this.productRepo.query(
      `SELECT p.product_id AS "productId", p.product_code AS "productCode",
              p.product_name AS "productName", p.brand, p.category,
              p.unit_of_measure AS "unitOfMeasure", p.unit_price AS "unitPrice",
              p.currency_code AS "currencyCode", p.is_inventory_item AS "isInventory",
              p.track_stock AS "trackStock",
              COALESCE((SELECT SUM(pws.available_qty) FROM product_warehouse_stock pws
                        WHERE pws.product_id = p.product_id), 0) AS "totalAvailable",
              p.min_stock_qty AS "minStock"
       FROM products p
       WHERE ${where}
       ORDER BY p.product_name ASC
       LIMIT ${Number(limit) || 50}`,
      params);
    return rows.map((r: any) => ({
      ...r,
      unitPrice: Number(r.unitPrice) || 0,
      totalAvailable: Number(r.totalAvailable) || 0,
      minStock: Number(r.minStock) || 0,
      // stock status only meaningful for stock-tracked inventory items
      stockTracked: !!(r.isInventory && r.trackStock),
    }));
  }

  // Per-warehouse breakdown for one product (tapped on the availability card)
  async getFieldProductStock(tenantId: string, productId: string): Promise<any> {
    const rows = await this.productRepo.query(
      `SELECT warehouse_name AS "warehouseName", location_code AS "locationCode",
              quantity, reserved_qty AS "reservedQty", available_qty AS "availableQty"
       FROM product_warehouse_stock
       WHERE tenant_id::text = $1::text AND product_id::text = $2::text
       ORDER BY warehouse_name`,
      [tenantId, productId]);
    return rows.map((r: any) => ({
      warehouseName: r.warehouseName, locationCode: r.locationCode,
      quantity: Number(r.quantity) || 0,
      reservedQty: Number(r.reservedQty) || 0,
      availableQty: Number(r.availableQty) || 0,
    }));
  }

    // ── Field Sales: Customer Snapshot ──────────────────────────────────────
  // List customers with outstanding-at-a-glance (show-all for now; rep scoping later).
  async getFieldCustomers(tenantId: string, search?: string, limit = 60): Promise<any> {
    const params: any[] = [tenantId];
    let where = `a.tenant_id::text = $1::text AND a.is_customer = true`;
    if (search) {
      params.push(`%${search}%`);
      where += ` AND a.account_name ILIKE $${params.length}`;
    }
    const rows = await this.invoiceRepo.query(
      `SELECT a.account_id AS "accountId", a.account_name AS "accountName",
              a.credit_limit AS "creditLimit", a.credit_blocked AS "creditBlocked",
              a.credit_block_reason AS "creditBlockReason", a.assigned_to AS "assignedTo",
              COALESCE((SELECT SUM(i.balance_due) FROM sales_invoices i
                        WHERE i.account_id = a.account_id::text AND i.tenant_id::text = a.tenant_id::text), 0) AS "outstanding",
              COALESCE((SELECT SUM(i.balance_due) FROM sales_invoices i
                        WHERE i.account_id = a.account_id::text AND i.tenant_id::text = a.tenant_id::text
                          AND i.balance_due > 0 AND i.due_date < CURRENT_DATE), 0) AS "overdue"
       FROM accounts a
       WHERE ${where}
       ORDER BY a.account_name ASC
       LIMIT ${Number(limit) || 60}`,
      params);
    return rows.map((r: any) => {
      const outstanding = Number(r.outstanding) || 0;
      const overdue = Number(r.overdue) || 0;
      const creditLimit = Number(r.creditLimit) || 0;
      let creditStatus = 'OK';
      if (r.creditBlocked) creditStatus = 'BLOCKED';
      else if (creditLimit > 0 && outstanding >= creditLimit) creditStatus = 'OVER_LIMIT';
      else if (creditLimit > 0 && outstanding >= creditLimit * 0.8) creditStatus = 'NEAR_LIMIT';
      return {
        accountId: r.accountId, accountName: r.accountName,
        creditLimit, creditBlocked: !!r.creditBlocked, creditBlockReason: r.creditBlockReason,
        assignedTo: r.assignedTo, outstanding, overdue, creditStatus,
      };
    });
  }

  // Full snapshot for one customer: credit, outstanding, aging, recent invoices, overdue.
  async getFieldCustomerSnapshot(tenantId: string, accountId: string): Promise<any> {
    const accRows = await this.invoiceRepo.query(
      `SELECT a.account_id AS "accountId", a.account_name AS "accountName",
              a.credit_limit AS "creditLimit", a.credit_period_days AS "creditPeriodDays",
              a.credit_blocked AS "creditBlocked", a.credit_block_reason AS "creditBlockReason"
       FROM accounts a WHERE a.account_id = $1 AND a.tenant_id::text = $2::text`,
      [accountId, tenantId]);
    if (!accRows.length) throw new BadRequestException('Customer not found');
    const acc = accRows[0];

    // Outstanding + aging buckets (by due_date vs today)
    const aging = await this.invoiceRepo.query(
      `SELECT
         COALESCE(SUM(balance_due),0) AS total,
         COALESCE(SUM(CASE WHEN due_date >= CURRENT_DATE OR due_date IS NULL THEN balance_due ELSE 0 END),0) AS current,
         COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE AND due_date >= CURRENT_DATE - 30 THEN balance_due ELSE 0 END),0) AS d30,
         COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE - 30 AND due_date >= CURRENT_DATE - 60 THEN balance_due ELSE 0 END),0) AS d60,
         COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE - 60 THEN balance_due ELSE 0 END),0) AS d90
       FROM sales_invoices
       WHERE account_id = $1 AND tenant_id::text = $2::text AND balance_due > 0`,
      [accountId, tenantId]);
    const ag = aging[0] || {};

    // Recent invoices (last 8)
    const recent = await this.invoiceRepo.query(
      `SELECT invoice_number AS "invoiceNumber", invoice_date AS "invoiceDate",
              due_date AS "dueDate", total_amount AS "totalAmount",
              paid_amount AS "paidAmount", balance_due AS "balanceDue", status
       FROM sales_invoices
       WHERE account_id = $1 AND tenant_id::text = $2::text
       ORDER BY invoice_date DESC NULLS LAST LIMIT 8`,
      [accountId, tenantId]);

    const outstanding = Number(ag.total) || 0;
    const creditLimit = Number(acc.creditLimit) || 0;
    let creditStatus = 'OK';
    if (acc.creditBlocked) creditStatus = 'BLOCKED';
    else if (creditLimit > 0 && outstanding >= creditLimit) creditStatus = 'OVER_LIMIT';
    else if (creditLimit > 0 && outstanding >= creditLimit * 0.8) creditStatus = 'NEAR_LIMIT';

    return {
      accountId: acc.accountId, accountName: acc.accountName,
      creditLimit, creditPeriodDays: Number(acc.creditPeriodDays) || 0,
      creditBlocked: !!acc.creditBlocked, creditBlockReason: acc.creditBlockReason,
      creditStatus,
      outstanding,
      available: creditLimit > 0 ? Math.max(creditLimit - outstanding, 0) : null,
      aging: {
        current: Number(ag.current) || 0,
        d30: Number(ag.d30) || 0,
        d60: Number(ag.d60) || 0,
        d90: Number(ag.d90) || 0,
      },
      recentInvoices: recent.map((i: any) => ({
        invoiceNumber: i.invoiceNumber, invoiceDate: i.invoiceDate, dueDate: i.dueDate,
        totalAmount: Number(i.totalAmount) || 0, paidAmount: Number(i.paidAmount) || 0,
        balanceDue: Number(i.balanceDue) || 0, status: i.status,
        overdue: i.balanceDue > 0 && i.dueDate && new Date(i.dueDate) < new Date(),
      })),
    };
  }

    // ── Field Sales: My Orders (rep's own quotations/orders) ────────────────
  async getFieldMyOrders(tenantId: string, userId: string, scope = 'mine', limit = 60): Promise<any> {
    const params: any[] = [tenantId];
    let where = 'q.tenant_id::text = $1::text';
    // scope=mine -> only this rep's; scope=all -> everyone (for managers)
    if (scope !== 'all' && userId) {
      params.push(userId);
      where += ` AND q.created_by::text = $${params.length}::text`;
    }
    const rows = await this.quotationRepo.query(
      `SELECT q.quotation_id AS "quotationId", q.quotation_number AS "orderNumber",
              q.quotation_date AS "orderDate", q.customer_name AS "customerName",
              q.account_id AS "accountId", q.total_amount AS "totalAmount", q.status
       FROM quotations q
       WHERE ${where}
       ORDER BY q.quotation_date DESC NULLS LAST, q.created_at DESC NULLS LAST
       LIMIT ${Number(limit) || 60}`,
      params);
    return rows.map((r: any) => ({
      quotationId: r.quotationId, orderNumber: r.orderNumber, orderDate: r.orderDate,
      customerName: r.customerName, accountId: r.accountId,
      totalAmount: Number(r.totalAmount) || 0, status: r.status || 'DRAFT',
    }));
  }

  // ── Field Sales: Collections to chase (outstanding invoices, worst first) ──
  async getFieldCollections(tenantId: string, onlyOverdue = false, limit = 100): Promise<any> {
    const rows = await this.invoiceRepo.query(
      `SELECT i.invoice_number AS "invoiceNumber", i.invoice_date AS "invoiceDate",
              i.due_date AS "dueDate", i.customer_name AS "customerName", i.account_id AS "accountId",
              i.total_amount AS "totalAmount", i.balance_due AS "balanceDue",
              CASE WHEN i.due_date IS NOT NULL AND i.due_date < CURRENT_DATE
                   THEN (CURRENT_DATE - i.due_date) ELSE 0 END AS "daysOverdue"
       FROM sales_invoices i
       WHERE i.tenant_id::text = $1::text AND i.balance_due > 0
       ${onlyOverdue ? 'AND i.due_date < CURRENT_DATE' : ''}
       ORDER BY (CASE WHEN i.due_date IS NOT NULL AND i.due_date < CURRENT_DATE
                      THEN (CURRENT_DATE - i.due_date) ELSE 0 END) DESC,
                i.balance_due DESC
       LIMIT ${Number(limit) || 100}`,
      [tenantId]);
    let totalOutstanding = 0, totalOverdue = 0;
    const items = rows.map((r: any) => {
      const bal = Number(r.balanceDue) || 0;
      const dov = Number(r.daysOverdue) || 0;
      totalOutstanding += bal;
      if (dov > 0) totalOverdue += bal;
      return {
        invoiceNumber: r.invoiceNumber, invoiceDate: r.invoiceDate, dueDate: r.dueDate,
        customerName: r.customerName, accountId: r.accountId,
        totalAmount: Number(r.totalAmount) || 0, balanceDue: bal, daysOverdue: dov,
      };
    });
    return { items, totalOutstanding, totalOverdue, count: items.length };
  }

    async getReorderReport(tenantId: string, filters: any = {}) {
    const qb = this.productRepo.createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId })
      .andWhere('p.trackStock = true');
    if (filters.category) qb.andWhere('p.category = :category', { category: filters.category });
    const products = await qb.orderBy('p.productName', 'ASC').getMany();

    const rows = products.map((p: any) => {
      const qty = Number(p.stockQty || 0);
      const reorderPoint = Number(p.reorderPoint || 0);
      const minQty = Number(p.minStockQty || 0);
      const trigger = reorderPoint > 0 ? reorderPoint : minQty;
      const reorderQty = Number(p.reorderQty || 0);
      const cost = Number(p.costPrice || 0);
      const needsReorder = trigger > 0 && qty <= trigger;
      const suggestedQty = reorderQty > 0 ? reorderQty : Math.max(trigger - qty, 0);
      return {
        productId: p.productId, productCode: p.productCode, productName: p.productName,
        category: p.category || '', unitOfMeasure: p.unitOfMeasure,
        stockQty: qty, reorderPoint, minStockQty: minQty, reorderQty,
        triggerLevel: trigger, suggestedQty, costPrice: cost,
        warehouseId: p.warehouseId || null, locationId: p.locationId || null,
        estimatedCost: suggestedQty * cost,
        needsReorder, isOut: qty <= 0,
      };
    }).filter((r) => r.needsReorder);

    const summary = {
      itemsToReorder: rows.length,
      outOfStock: rows.filter((r) => r.isOut).length,
      totalEstimatedCost: rows.reduce((s2, r) => s2 + r.estimatedCost, 0),
    };
    const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))].sort();
    return { rows, summary, categories };
  }


  // ── Bank Accounts ──────────────────────────────────────────────
  async getBankAccounts(tenantId: string) {
    return this.bankAccountRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } as any });
  }
  async getBankAccount(tenantId: string, id: string) {
    const acc = await this.bankAccountRepo.findOne({ where: { tenantId, bankAccountId: id } as any });
    if (!acc) throw new NotFoundException('Bank account not found');
    return acc;
  }
  async createBankAccount(tenantId: string, dto: any, userId: string) {
    const acc = this.bankAccountRepo.create({ ...dto, tenantId, createdBy: userId, currentBalance: dto.openingBalance || 0 } as any);
    return this.bankAccountRepo.save(acc);
  }
  async updateBankAccount(tenantId: string, id: string, dto: any) {
    await this.bankAccountRepo.update({ tenantId, bankAccountId: id } as any, dto);
    return this.getBankAccount(tenantId, id);
  }
  async deleteBankAccount(tenantId: string, id: string) {
    await this.bankAccountRepo.delete({ tenantId, bankAccountId: id } as any);
    return { success: true };
  }

  // ── Cheque Books ───────────────────────────────────────────────
  async getChequeBooks(tenantId: string, bankAccountId?: string) {
    const where: any = { tenantId };
    if (bankAccountId) where.bankAccountId = bankAccountId;
    return this.chequeBookRepo.find({ where, order: { createdAt: 'DESC' } as any });
  }
  async createChequeBook(tenantId: string, dto: any, userId: string) {
    const start = parseInt(dto.startLeafNo, 10);
    const end = parseInt(dto.endLeafNo, 10);
    if (isNaN(start) || isNaN(end) || end < start) throw new NotFoundException('Invalid leaf range');
    const totalLeaves = end - start + 1;
    const book = this.chequeBookRepo.create({ ...dto, tenantId, totalLeaves, createdBy: userId } as any) as any;
    const saved = await this.chequeBookRepo.save(book);
    const pad = dto.startLeafNo.length;
    const leaves = [];
    for (let i = start; i <= end; i++) {
      leaves.push(this.chequeLeafRepo.create({
        tenantId, chequeBookId: saved.chequeBookId, bankAccountId: dto.bankAccountId,
        leafNumber: String(i).padStart(pad, '0'), status: 'AVAILABLE',
      } as any));
    }
    await this.chequeLeafRepo.save(leaves);
    return saved;
  }
  async updateChequeBookStatus(tenantId: string, id: string, status: string) {
    await this.chequeBookRepo.update({ tenantId, chequeBookId: id } as any, { status });
    return { success: true };
  }
  async deleteChequeBook(tenantId: string, id: string) {
    const usedCount = await this.chequeLeafRepo.count({ where: { tenantId, chequeBookId: id, status: 'USED' } as any });
    if (usedCount > 0) throw new NotFoundException('Cannot delete: cheque book has used leaves');
    await this.chequeLeafRepo.delete({ tenantId, chequeBookId: id } as any);
    await this.chequeBookRepo.delete({ tenantId, chequeBookId: id } as any);
    return { success: true };
  }

  // ── Cheque Leaves ──────────────────────────────────────────────
  async getChequeLeaves(tenantId: string, chequeBookId?: string, status?: string) {
    const where: any = { tenantId };
    if (chequeBookId) where.chequeBookId = chequeBookId;
    if (status) where.status = status;
    return this.chequeLeafRepo.find({ where, order: { leafNumber: 'ASC' } as any });
  }
  async getNextAvailableLeaf(tenantId: string, bankAccountId: string) {
    return this.chequeLeafRepo.findOne({ where: { tenantId, bankAccountId, status: 'AVAILABLE' } as any, order: { leafNumber: 'ASC' } as any });
  }
  async voidChequeLeaf(tenantId: string, id: string, reason: string) {
    await this.chequeLeafRepo.update({ tenantId, leafId: id } as any, { status: 'CANCELLED', voidReason: reason });
    return { success: true };
  }
  async markLeafRealized(tenantId: string, id: string, date: string) {
    const leaf = await this.chequeLeafRepo.findOne({ where: { tenantId, leafId: id } as any });
    if (!leaf || leaf.status !== 'USED') throw new NotFoundException('Leaf not found or not in USED state');
    await this.chequeLeafRepo.update({ tenantId, leafId: id } as any, { status: 'REALIZED', realizedDate: date });
    return { success: true };
  }
  async markLeafReconciled(tenantId: string, id: string, date: string) {
    const leaf = await this.chequeLeafRepo.findOne({ where: { tenantId, leafId: id } as any });
    if (!leaf || leaf.status !== 'REALIZED') throw new NotFoundException('Leaf not found or not in REALIZED state');
    await this.chequeLeafRepo.update({ tenantId, leafId: id } as any, { status: 'RECONCILED', reconciledDate: date });
    return { success: true };
  }

  // ── Stock By Location Report ───────────────────────────────────
  async getStockByLocation(tenantId: string, warehouseId?: string) {
    // Read from product_warehouse_stock (the location stock ledger), joined to full hierarchy
    let query = `
      SELECT
        wl.location_id::text as location_id, wl.location_code, wl.location_name,
        wl.zone, wl.rack, wl.shelf, wl.bin,
        w.warehouse_id::text as warehouse_id, w.warehouse_name, w.warehouse_code,
        p.product_id::text as product_id, p.product_code, p.product_name, p.category, p.unit_of_measure,
        p.opening_stock,
        pws.quantity as qty_on_hand, pws.reserved_qty, pws.available_qty,
        pws.updated_at as last_movement
      FROM product_warehouse_stock pws
      JOIN products p ON p.product_id = pws.product_id AND p.tenant_id::text = $1
      JOIN warehouse_locations wl ON wl.location_id = pws.location_id
      JOIN warehouses w ON w.warehouse_id = wl.warehouse_id
      WHERE pws.tenant_id::text = $1 AND pws.quantity > 0
    `;
    const params: any[] = [tenantId];
    if (warehouseId) {
      params.push(warehouseId);
      query += ` AND w.warehouse_id::text = $${params.length}`;
    }
    query += ` ORDER BY w.warehouse_name, wl.zone NULLS FIRST, wl.rack NULLS FIRST, wl.shelf NULLS FIRST, wl.bin NULLS FIRST, wl.location_code, p.product_name`;
    const rows = await this.invoiceRepo.query(query, params);

    // Products with stock but NOT in any location ledger row (unassigned / no location)
    const unassignedQuery = `
      SELECT p.product_id::text as "productId", p.product_code as "productCode",
        p.product_name as "productName", p.category, p.unit_of_measure as "unitOfMeasure",
        p.stock_qty as "qtyOnHand", p.opening_stock as "openingStock"
      FROM products p
      WHERE p.tenant_id::text = $1 AND p.stock_qty > 0
        AND NOT EXISTS (
          SELECT 1 FROM product_warehouse_stock pws2
          WHERE pws2.product_id = p.product_id AND pws2.quantity > 0
        )
    `;
    const unassigned = await this.invoiceRepo.query(unassignedQuery, [tenantId]);

    // Group by warehouse > location > products
    const warehouseMap: any = {};
    for (const row of rows) {
      const wKey = row.warehouse_id;
      if (!warehouseMap[wKey]) warehouseMap[wKey] = { warehouseId: row.warehouse_id, warehouseName: row.warehouse_name, warehouseCode: row.warehouse_code, locations: {} };
      const lKey = row.location_id;
      if (!warehouseMap[wKey].locations[lKey]) warehouseMap[wKey].locations[lKey] = {
        locationId: row.location_id, locationCode: row.location_code, locationName: row.location_name,
        zone: row.zone, rack: row.rack, shelf: row.shelf, bin: row.bin,
        path: [row.zone, row.rack, row.shelf, row.bin].filter(Boolean).join(' / ') || row.location_code,
        products: []
      };
      warehouseMap[wKey].locations[lKey].products.push({
        productId: row.product_id, productCode: row.product_code, productName: row.product_name,
        category: row.category, unitOfMeasure: row.unit_of_measure,
        openingStock: Number(row.opening_stock || 0),
        qtyOnHand: Number(row.qty_on_hand), reservedQty: Number(row.reserved_qty || 0),
        availableQty: Number(row.available_qty || row.qty_on_hand),
        lastMovement: row.last_movement
      });
    }
    const result = Object.values(warehouseMap).map((w: any) => ({
      ...w, locations: Object.values(w.locations),
    }));
    return { warehouses: result, unassigned };
  }

  // ── Auto Credit Status Check ───────────────────────────────────
  async checkAndUpdateCreditStatus(tenantId: string, accountId: string, customerName?: string) {
    if (!accountId && !customerName) return;
    try {
      // Get account credit settings from core DB (same DB)
      let accResult;
      if (accountId) {
        accResult = await this.invoiceRepo.query(
          `SELECT account_id::text as account_id, credit_limit, credit_period_days, credit_blocked, credit_block_reason
           FROM accounts WHERE account_id::text = $1 AND tenant_id::text = $2`,
          [accountId, tenantId]
        );
      } else {
        accResult = await this.invoiceRepo.query(
          `SELECT account_id::text as account_id, credit_limit, credit_period_days, credit_blocked, credit_block_reason
           FROM accounts WHERE account_name ILIKE $1 AND tenant_id::text = $2 LIMIT 1`,
          [customerName, tenantId]
        );
      }
      if (!accResult.length) return;
      const acc = accResult[0];
      const creditLimit = Number(acc.credit_limit || 0);
      const creditPeriodDays = Number(acc.credit_period_days || 30);
      if (creditLimit === 0 && creditPeriodDays === 0) return; // no credit control set

      const resolvedId = accResult[0].account_id || accountId;
      const nameFilter = customerName || '';
      // Get outstanding balance - by account_id or customer_name
      const balResult = await this.invoiceRepo.query(
        `SELECT COALESCE(SUM(balance_due),0) as total_outstanding
         FROM sales_invoices
         WHERE tenant_id = $1
         AND (account_id::text = $2 OR (($2 = '' OR account_id IS NULL) AND customer_name ILIKE $3))
         AND status NOT IN ('CANCELLED','DRAFT')`,
        [tenantId, resolvedId || '', nameFilter || accResult[0]?.account_name || '']
      );
      const outstanding = Number(balResult[0]?.total_outstanding || 0);

      // Check for overdue invoices
      const overdueResult = await this.invoiceRepo.query(
        `SELECT COUNT(*) as overdue_count
         FROM sales_invoices
         WHERE tenant_id = $1
         AND (account_id::text = $2 OR (($2 = '' OR account_id IS NULL) AND customer_name ILIKE $3))
         AND status NOT IN ('PAID','CANCELLED','DRAFT')
         AND due_date < CURRENT_DATE`,
        [tenantId, resolvedId || '', nameFilter || accResult[0]?.account_name || '']
      );
      const overdueCount = Number(overdueResult[0]?.overdue_count || 0);

      const shouldBlock = (creditLimit > 0 && outstanding > creditLimit) || overdueCount > 0;
      const currentlyBlocked = acc.credit_blocked;
      const manualBlock = currentlyBlocked && acc.credit_block_reason && !acc.credit_block_reason.startsWith('AUTO:');

      const resolvedAccountId = acc.account_id || accountId;
      if (shouldBlock && !currentlyBlocked) {
        let reason = '';
        if (creditLimit > 0 && outstanding > creditLimit) reason = `AUTO: Outstanding OMR ${outstanding.toFixed(3)} exceeds credit limit OMR ${creditLimit.toFixed(3)}`;
        else reason = `AUTO: ${overdueCount} overdue invoice(s)`;
        await this.invoiceRepo.query(
          `UPDATE accounts SET credit_blocked = true, credit_block_reason = $1, credit_blocked_at = now() WHERE account_id::text = $2`,
          [reason, resolvedAccountId]
        );
      } else if (!shouldBlock && currentlyBlocked && !manualBlock) {
        // Auto-unblock only if it was auto-blocked
        await this.invoiceRepo.query(
          `UPDATE accounts SET credit_blocked = false, credit_block_reason = NULL, credit_blocked_at = NULL WHERE account_id::text = $1`,
          [resolvedAccountId]
        );
      }
    } catch(e) {
      console.warn('Credit check failed:', (e as any)?.message);
    }
  }

  // ── Bulk Credit Status Re-check (all customers) ────────────────
  async runBulkCreditCheck(tenantId: string) {
    try {
      // Get all accounts with credit limit set
      const accounts = await this.invoiceRepo.query(
        `SELECT account_id::text as account_id, account_name, credit_limit, credit_period_days
         FROM accounts WHERE tenant_id::text = $1 AND is_customer = true`,
        [tenantId]
      );
      let blocked = 0, unblocked = 0;
      for (const acc of accounts) {
        const before = await this.invoiceRepo.query(
          `SELECT credit_blocked, credit_block_reason FROM accounts WHERE account_id::text = $1`, [acc.account_id]
        );
        await this.checkAndUpdateCreditStatus(tenantId, acc.account_id, acc.account_name);
        const after = await this.invoiceRepo.query(
          `SELECT credit_blocked FROM accounts WHERE account_id::text = $1`, [acc.account_id]
        );
        if (!before[0]?.credit_blocked && after[0]?.credit_blocked) blocked++;
        if (before[0]?.credit_blocked && !after[0]?.credit_blocked) unblocked++;
      }
      return { checked: accounts.length, blocked, unblocked };
    } catch(e) {
      console.error('Bulk credit check error:', (e as any)?.message);
      return { error: (e as any)?.message };
    }
  }

  // ── PDC (Post-Dated Cheque) Management ─────────────────────────
  async getPdcCheques(tenantId: string, filters: any = {}) {
    let query = `
      SELECT r.receipt_id::text as "receiptId", r.receipt_number as "receiptNumber",
        r.customer_name as "customerName", r.amount, r.cheque_number as "chequeNumber",
        r.cheque_date as "chequeDate", r.cheque_bank_name as "chequeBankName",
        r.deposit_bank_account_id::text as "depositBankAccountId",
        r.cheque_status as "chequeStatus", r.receipt_date as "receiptDate",
        ba.account_name as "depositBankName",
        CASE WHEN r.cheque_date <= CURRENT_DATE THEN true ELSE false END as "isDue",
        (r.cheque_date - CURRENT_DATE) as "daysUntilDue"
      FROM receipts r
      LEFT JOIN bank_accounts ba ON ba.bank_account_id::text = r.deposit_bank_account_id::text
      WHERE r.tenant_id = $1 AND r.payment_method = 'CHEQUE'
      AND COALESCE(r.cheque_status, 'RECEIVED') = 'RECEIVED'
      AND r.status = 'POSTED'
    `;
    const params: any[] = [tenantId];
    if (filters.dueOnly === 'true' || filters.dueOnly === true) {
      query += ` AND r.cheque_date <= CURRENT_DATE`;
    }
    if (filters.upToDate) {
      params.push(filters.upToDate);
      query += ` AND r.cheque_date <= $${params.length}`;
    }
    query += ` ORDER BY r.cheque_date ASC`;
    return this.receiptRepo.query(query, params);
  }

  async getPdcDueCount(tenantId: string) {
    const r = await this.receiptRepo.query(
      `SELECT COUNT(*) as cnt FROM receipts
       WHERE tenant_id = $1 AND payment_method = 'CHEQUE'
       AND COALESCE(cheque_status,'RECEIVED') = 'RECEIVED'
       AND status = 'POSTED'
       AND cheque_date <= CURRENT_DATE`,
      [tenantId]
    );
    return { dueCount: Number(r[0]?.cnt || 0) };
  }

  async depositPdcCheques(tenantId: string, userId: string, receiptIds: string[], bankAccountId?: string) {
    if (!receiptIds?.length) throw new BadRequestException('No cheques selected for deposit');
    const depositDate = new Date().toISOString().slice(0,10);
    let deposited = 0;
    for (const receiptId of receiptIds) {
      const rows = await this.receiptRepo.query(
        `SELECT r.receipt_id::text as id, r.receipt_number, r.customer_name, r.amount,
          r.cheque_number, r.deposit_bank_account_id::text as bank_id,
          ba.gl_account_id::text as gl_code, ba.account_name as bank_name
         FROM receipts r
         LEFT JOIN bank_accounts ba ON ba.bank_account_id::text = COALESCE($3, r.deposit_bank_account_id::text)
         WHERE r.receipt_id::text = $1 AND r.tenant_id = $2`,
        [receiptId, tenantId, bankAccountId || null]
      );
      if (!rows.length) continue;
      const chq = rows[0];
      // Determine bank GL code — fallback to 1120 if not linked
      let bankGlCode = '1120';
      if (chq.gl_code) {
        const glRow = await this.receiptRepo.query(
          `SELECT account_code FROM chart_of_accounts WHERE account_id::text = $1`, [chq.gl_code]
        );
        if (glRow.length) bankGlCode = glRow[0].account_code;
      }
      // Journal: Dr Bank / Cr PDC
      const jvNumber = await this.generateNumber('JV', this.jvRepo, 'voucherNumber');
      await this.createAutoJournalEntry(tenantId, userId, {
        voucherNumber: jvNumber,
        description: `PDC Deposit - ${chq.customer_name} - Chq ${chq.cheque_number} (Rcpt ${chq.receipt_number})`,
        voucherDate: depositDate,
        lines: [
          { accountCode: bankGlCode, description: `Bank - PDC Deposit Chq ${chq.cheque_number}`, debitAmount: Number(chq.amount || 0), creditAmount: 0 },
          { accountCode: '1119', description: `Cheques in Hand (PDC) - ${chq.customer_name}`, debitAmount: 0, creditAmount: Number(chq.amount || 0) },
        ],
      });
      // Update receipt status and deposit bank if overridden
      await this.receiptRepo.query(
        `UPDATE receipts SET cheque_status = 'DEPOSITED'${bankAccountId ? ', deposit_bank_account_id = $2::uuid' : ''} WHERE receipt_id::text = $1`,
        bankAccountId ? [receiptId, bankAccountId] : [receiptId]
      );
      deposited++;
    }
    return { deposited, depositDate };
  }
}
