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
exports.UserGroup = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../../tenants/entities/tenant.entity");
let UserGroup = class UserGroup {
};
exports.UserGroup = UserGroup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'user_group_id' }),
    __metadata("design:type", String)
], UserGroup.prototype, "userGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], UserGroup.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'group_code', length: 50 }),
    __metadata("design:type", String)
], UserGroup.prototype, "groupCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'group_name', length: 100 }),
    __metadata("design:type", String)
], UserGroup.prototype, "groupName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'group_name_ar', length: 100, nullable: true }),
    __metadata("design:type", String)
], UserGroup.prototype, "groupNameAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_system_group', default: false }),
    __metadata("design:type", Boolean)
], UserGroup.prototype, "isSystemGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserGroup.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], UserGroup.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserGroup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserGroup.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], UserGroup.prototype, "tenant", void 0);
exports.UserGroup = UserGroup = __decorate([
    (0, typeorm_1.Entity)('user_groups'),
    (0, typeorm_1.Index)(['tenantId', 'groupCode'], { unique: true })
], UserGroup);
//# sourceMappingURL=user-group.entity.js.map