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
  FixedAssetEntity, AssetDepreciationEntity, AssetMaintenanceEntity, AssetTransferEntity,
} from './sales.entities';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
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
        FixedAssetEntity, AssetDepreciationEntity, AssetMaintenanceEntity, AssetTransferEntity,
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
      FixedAssetEntity, AssetDepreciationEntity, AssetMaintenanceEntity, AssetTransferEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'crm_jwt_super_secret_2024_change_in_production',
    }),
  ],
  controllers: [SalesController],
  providers: [SalesService, JwtStrategy],
})
export class AppModule {}
