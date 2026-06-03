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
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const permissions_module_1 = require("./permissions/permissions.module");
const masters_module_1 = require("./masters/masters.module");
const superadmin_module_1 = require("./superadmin/superadmin.module");
const tenants_module_1 = require("./tenants/tenants.module");
const audit_module_1 = require("./audit/audit.module");
const contacts_module_1 = require("./contacts/contacts.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 5432),
                    database: config.get('DB_NAME', 'crm_core'),
                    username: config.get('DB_USER', 'crm_user'),
                    password: config.get('DB_PASS', 'crm_password_2024'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: false,
                    logging: config.get('NODE_ENV') === 'development',
                    ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
                    extra: {
                        max: 20,
                        idleTimeoutMillis: 30000,
                    },
                }),
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    uri: config.get('MONGO_URI', 'mongodb://localhost:27017/crm_audit'),
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([
                { name: 'short', ttl: 1000, limit: 10 },
                { name: 'medium', ttl: 10000, limit: 100 },
                { name: 'long', ttl: 60000, limit: 300 },
            ]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            permissions_module_1.PermissionsModule,
            masters_module_1.MastersModule,
            tenants_module_1.TenantsModule,
            superadmin_module_1.SuperAdminModule,
            audit_module_1.AuditModule,
            contacts_module_1.ContactsInlineModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map