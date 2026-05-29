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
exports.Permission = exports.PermissionLevel = void 0;
const typeorm_1 = require("typeorm");
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel["FULL_ACCESS"] = "FA";
    PermissionLevel["VIEW_ONLY"] = "VO";
    PermissionLevel["HIDDEN"] = "HI";
    PermissionLevel["NO_ACCESS"] = "NA";
    PermissionLevel["MANDATORY"] = "MA";
})(PermissionLevel || (exports.PermissionLevel = PermissionLevel = {}));
let Permission = class Permission {
};
exports.Permission = Permission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'permission_id' }),
    __metadata("design:type", String)
], Permission.prototype, "permissionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], Permission.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_group_id' }),
    __metadata("design:type", String)
], Permission.prototype, "userGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_id', nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "moduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_module_id', nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "subModuleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'page_id', nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "pageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_id', nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "fieldId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'permission_level',
        type: 'varchar',
        length: 10,
        default: PermissionLevel.NO_ACCESS,
    }),
    __metadata("design:type", String)
], Permission.prototype, "permissionLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Permission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Permission.prototype, "updatedAt", void 0);
exports.Permission = Permission = __decorate([
    (0, typeorm_1.Entity)('permissions'),
    (0, typeorm_1.Index)(['tenantId', 'userGroupId', 'moduleId', 'subModuleId', 'pageId', 'fieldId'], { unique: true })
], Permission);
//# sourceMappingURL=permission.entity.js.map