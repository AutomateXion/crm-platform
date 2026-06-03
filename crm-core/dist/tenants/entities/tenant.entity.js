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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
let Tenant = class Tenant {
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'tenant_id' }),
    __metadata("design:type", String)
], Tenant.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_code', length: 50, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "tenantCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_name', length: 200 }),
    __metadata("design:type", String)
], Tenant.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "domain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subscription_plan', length: 50, default: 'STARTER' }),
    __metadata("design:type", String)
], Tenant.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'active_modules', type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Tenant.prototype, "activeModules", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Asia/Muscat' }),
    __metadata("design:type", String)
], Tenant.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_format', default: 'DD/MM/YYYY' }),
    __metadata("design:type", String)
], Tenant.prototype, "dateFormat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', length: 3, default: 'OMR' }),
    __metadata("design:type", String)
], Tenant.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logo_url', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line1', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line2', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'Oman' }),
    __metadata("design:type", String)
], Tenant.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "trn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'po_box', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "poBox", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "fax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, default: '{}' }),
    __metadata("design:type", Object)
], Tenant.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_color', length: 7, default: '#1890ff' }),
    __metadata("design:type", String)
], Tenant.prototype, "primaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 5, default: 'en' }),
    __metadata("design:type", String)
], Tenant.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trial_ends_at', nullable: true }),
    __metadata("design:type", Date)
], Tenant.prototype, "trialEndsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_users', default: 10 }),
    __metadata("design:type", Number)
], Tenant.prototype, "maxUsers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Tenant.prototype, "updatedAt", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)('tenants')
], Tenant);
//# sourceMappingURL=tenant.entity.js.map