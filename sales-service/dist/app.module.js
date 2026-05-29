"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const sales_entities_1 = require("./sales.entities");
const sales_controller_1 = require("./sales.controller");
const sales_service_1 = require("./sales.service");
const auth_guard_1 = require("./auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'crm_postgres_core',
                port: 5432,
                username: process.env.DB_USER || 'crm_user',
                password: process.env.DB_PASS || 'crm_password_2024',
                database: process.env.DB_NAME || 'crm_core',
                entities: [
                    sales_entities_1.ProductEntity, sales_entities_1.StockMovementEntity, sales_entities_1.ExchangeRateEntity,
                    sales_entities_1.QuotationEntity, sales_entities_1.QuotationItemEntity,
                    sales_entities_1.DeliveryNoteEntity, sales_entities_1.DeliveryNoteItemEntity,
                    sales_entities_1.SalesInvoiceEntity, sales_entities_1.SalesInvoiceItemEntity,
                    sales_entities_1.ReceiptEntity, sales_entities_1.SalesReturnEntity, sales_entities_1.SalesReturnItemEntity,
                    sales_entities_1.ChartOfAccountEntity,
                    sales_entities_1.SupplierEntity,
                    sales_entities_1.PurchaseOrderEntity, sales_entities_1.PurchaseOrderItemEntity,
                    sales_entities_1.GoodsReceiptNoteEntity, sales_entities_1.GoodsReceiptNoteItemEntity,
                    sales_entities_1.PurchaseInvoiceEntity, sales_entities_1.PurchaseInvoiceItemEntity,
                    sales_entities_1.PaymentVoucherEntity,
                    sales_entities_1.PurchaseReturnEntity, sales_entities_1.PurchaseReturnItemEntity,
                ],
                synchronize: false,
            }),
            typeorm_1.TypeOrmModule.forFeature([
                sales_entities_1.ProductEntity, sales_entities_1.StockMovementEntity, sales_entities_1.ExchangeRateEntity,
                sales_entities_1.QuotationEntity, sales_entities_1.QuotationItemEntity,
                sales_entities_1.DeliveryNoteEntity, sales_entities_1.DeliveryNoteItemEntity,
                sales_entities_1.SalesInvoiceEntity, sales_entities_1.SalesInvoiceItemEntity,
                sales_entities_1.ReceiptEntity, sales_entities_1.SalesReturnEntity, sales_entities_1.SalesReturnItemEntity,
                sales_entities_1.ChartOfAccountEntity,
                sales_entities_1.SupplierEntity,
                sales_entities_1.PurchaseOrderEntity, sales_entities_1.PurchaseOrderItemEntity,
                sales_entities_1.GoodsReceiptNoteEntity, sales_entities_1.GoodsReceiptNoteItemEntity,
                sales_entities_1.PurchaseInvoiceEntity, sales_entities_1.PurchaseInvoiceItemEntity,
                sales_entities_1.PaymentVoucherEntity,
                sales_entities_1.PurchaseReturnEntity, sales_entities_1.PurchaseReturnItemEntity,
            ]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'crm_jwt_super_secret_2024_change_in_production',
            }),
        ],
        controllers: [sales_controller_1.SalesController],
        providers: [sales_service_1.SalesService, auth_guard_1.JwtStrategy],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map