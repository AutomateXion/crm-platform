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
exports.Field = exports.Page = exports.SubModule = void 0;
const typeorm_1 = require("typeorm");
const module_entity_1 = require("./module.entity");
let SubModule = class SubModule {
};
exports.SubModule = SubModule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'sub_module_id' }),
    __metadata("design:type", String)
], SubModule.prototype, "subModuleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_id' }),
    __metadata("design:type", String)
], SubModule.prototype, "moduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_module_code', length: 50 }),
    __metadata("design:type", String)
], SubModule.prototype, "subModuleCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_module_name', length: 100 }),
    __metadata("design:type", String)
], SubModule.prototype, "subModuleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_module_name_ar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SubModule.prototype, "subModuleNameAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], SubModule.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], SubModule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_entity_1.AppModule, m => m.subModules),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_entity_1.AppModule)
], SubModule.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Page, p => p.subModule),
    __metadata("design:type", Array)
], SubModule.prototype, "pages", void 0);
exports.SubModule = SubModule = __decorate([
    (0, typeorm_1.Entity)('sub_modules'),
    (0, typeorm_1.Index)(['moduleId', 'subModuleCode'], { unique: true })
], SubModule);
let Page = class Page {
};
exports.Page = Page;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'page_id' }),
    __metadata("design:type", String)
], Page.prototype, "pageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_module_id' }),
    __metadata("design:type", String)
], Page.prototype, "subModuleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'page_code', length: 50 }),
    __metadata("design:type", String)
], Page.prototype, "pageCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'page_name', length: 100 }),
    __metadata("design:type", String)
], Page.prototype, "pageName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'page_name_ar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "pageNameAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'page_route', length: 200, nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "pageRoute", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], Page.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Page.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SubModule, sm => sm.pages),
    (0, typeorm_1.JoinColumn)({ name: 'sub_module_id' }),
    __metadata("design:type", SubModule)
], Page.prototype, "subModule", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Field, f => f.page),
    __metadata("design:type", Array)
], Page.prototype, "fields", void 0);
exports.Page = Page = __decorate([
    (0, typeorm_1.Entity)('pages'),
    (0, typeorm_1.Index)(['subModuleId', 'pageCode'], { unique: true })
], Page);
let Field = class Field {
};
exports.Field = Field;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'field_id' }),
    __metadata("design:type", String)
], Field.prototype, "fieldId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'page_id' }),
    __metadata("design:type", String)
], Field.prototype, "pageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_code', length: 100 }),
    __metadata("design:type", String)
], Field.prototype, "fieldCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_label', length: 100 }),
    __metadata("design:type", String)
], Field.prototype, "fieldLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_label_ar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Field.prototype, "fieldLabelAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_type', length: 50 }),
    __metadata("design:type", String)
], Field.prototype, "fieldType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], Field.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_system', default: false }),
    __metadata("design:type", Boolean)
], Field.prototype, "isSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Field.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Page, p => p.fields),
    (0, typeorm_1.JoinColumn)({ name: 'page_id' }),
    __metadata("design:type", Page)
], Field.prototype, "page", void 0);
exports.Field = Field = __decorate([
    (0, typeorm_1.Entity)('fields'),
    (0, typeorm_1.Index)(['pageId', 'fieldCode'], { unique: true })
], Field);
//# sourceMappingURL=sub-module.entity.js.map