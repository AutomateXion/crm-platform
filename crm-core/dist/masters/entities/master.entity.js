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
exports.MasterValue = exports.MasterCategory = void 0;
const typeorm_1 = require("typeorm");
let MasterCategory = class MasterCategory {
};
exports.MasterCategory = MasterCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'category_id' }),
    __metadata("design:type", String)
], MasterCategory.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_code', length: 50, unique: true }),
    __metadata("design:type", String)
], MasterCategory.prototype, "categoryCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_name', length: 100 }),
    __metadata("design:type", String)
], MasterCategory.prototype, "categoryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_name_ar', length: 100, nullable: true }),
    __metadata("design:type", String)
], MasterCategory.prototype, "categoryNameAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_id', nullable: true }),
    __metadata("design:type", String)
], MasterCategory.prototype, "moduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_global', default: false }),
    __metadata("design:type", Boolean)
], MasterCategory.prototype, "isGlobal", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MasterCategory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], MasterCategory.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], MasterCategory.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MasterCategory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MasterValue, v => v.category),
    __metadata("design:type", Array)
], MasterCategory.prototype, "values", void 0);
exports.MasterCategory = MasterCategory = __decorate([
    (0, typeorm_1.Entity)('master_categories')
], MasterCategory);
let MasterValue = class MasterValue {
};
exports.MasterValue = MasterValue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'value_id' }),
    __metadata("design:type", String)
], MasterValue.prototype, "valueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", String)
], MasterValue.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', nullable: true }),
    __metadata("design:type", String)
], MasterValue.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'value_code', length: 100 }),
    __metadata("design:type", String)
], MasterValue.prototype, "valueCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'value_label', length: 200 }),
    __metadata("design:type", String)
], MasterValue.prototype, "valueLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'value_label_ar', length: 200, nullable: true }),
    __metadata("design:type", String)
], MasterValue.prototype, "valueLabelAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MasterValue.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'color_code', length: 7, nullable: true }),
    __metadata("design:type", String)
], MasterValue.prototype, "colorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'icon_code', length: 50, nullable: true }),
    __metadata("design:type", String)
], MasterValue.prototype, "iconCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], MasterValue.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    __metadata("design:type", Boolean)
], MasterValue.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_system', default: false }),
    __metadata("design:type", Boolean)
], MasterValue.prototype, "isSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_value_id', nullable: true }),
    __metadata("design:type", String)
], MasterValue.prototype, "parentValueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], MasterValue.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], MasterValue.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], MasterValue.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MasterValue.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at', nullable: true }),
    __metadata("design:type", Date)
], MasterValue.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MasterCategory, c => c.values),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", MasterCategory)
], MasterValue.prototype, "category", void 0);
exports.MasterValue = MasterValue = __decorate([
    (0, typeorm_1.Entity)('master_values'),
    (0, typeorm_1.Index)(['categoryId', 'tenantId', 'valueCode'], { unique: true })
], MasterValue);
//# sourceMappingURL=master.entity.js.map