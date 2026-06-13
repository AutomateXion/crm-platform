import { Module } from '@nestjs/common';
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
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'crm_jwt_super_secret_2024_change_in_production',
    }),
  ],
  controllers: [SalesController, EInvoiceController],
  providers: [SalesService, EInvoiceService, JwtStrategy],
})
export class AppModule {}
