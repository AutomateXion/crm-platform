import { Module, Injectable } from '@nestjs/common';
import { ScheduleModule, Cron } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
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
  FixedAssetEntity, AssetDepreciationEntity, AssetMaintenanceEntity, AssetTransferEntity, DocumentSignatureEntity,
  BankAccountEntity, ChequeBookEntity, ChequeLeafEntity,
} from './sales.entities';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { EInvoiceService } from './einvoice.service';
import { EInvoiceController } from './einvoice.controller';
import { JwtStrategy } from './auth.guard';

@Injectable()
export class RecurringScheduler {
  constructor(private readonly sales: SalesService) {}

  // Daily at 02:00 server time: generate all due recurring items across tenants.
  // Idempotent (recurring_expense_log unique guard) so safe even if it overlaps
  // a manual trigger or runs after the service was asleep.
  @Cron('0 2 * * *')
  async handleDailyRecurring() {
    try {
      const res = await this.sales.generateDueRecurringItems();
      // eslint-disable-next-line no-console
      console.log('[RECURRING CRON] generated:', res?.generated, 'skipped:', res?.skipped, 'failed:', res?.failed);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('[RECURRING CRON] error:', e?.message || e);
    }
  }
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'crm_postgres_core',
      port: 5432,
      username: process.env.DB_USER || 'crm_user',
      password: process.env.DB_PASS || 'crm_password_2024',
      database: process.env.DB_NAME || 'crm_core',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      entities: [
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
        FixedAssetEntity, AssetDepreciationEntity, AssetMaintenanceEntity, AssetTransferEntity, DocumentSignatureEntity,
        BankAccountEntity, ChequeBookEntity, ChequeLeafEntity,
      ],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([
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
      FixedAssetEntity, AssetDepreciationEntity, AssetMaintenanceEntity, AssetTransferEntity, DocumentSignatureEntity,
      BankAccountEntity, ChequeBookEntity, ChequeLeafEntity,
    ]),
    ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'crm_jwt_super_secret_2024_change_in_production',
    }),
  ],
  controllers: [SalesController, EInvoiceController],
  providers: [SalesService, EInvoiceService, JwtStrategy, RecurringScheduler],
})
export class AppModule {}
