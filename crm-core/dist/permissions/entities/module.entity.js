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
exports.AppModule = void 0;
const typeorm_1 = require("typeorm");
const sub_module_entity_1 = require("./sub-module.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'module_id' }),
    __metadata("design:type", String)
], AppModule.prototype, "moduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_code', length: 50, unique: true }),
    __metadata("design:type", String)
], AppModule.prototype, "moduleCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_name', length: 100 }),
    __metadata("design:type", String)
], AppModule.prototype, "moduleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_name_ar', length: 100, nullable: true }),
    __metadata("design:type", String)
], AppModule.prototype, "moduleNameAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_icon', length: 100, nullable: true }),
    __metadata("design:type", String)
], AppModule.prototype, "moduleIcon", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_color', length: 7, nullable: true }),
    __metadata("design:type", String)
], AppModule.prototype, "moduleColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], AppModule.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_core', default: false }),
    __metadata("design:type", Boolean)
], AppModule.prototype, "isCore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], AppModule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AppModule.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AppModule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sub_module_entity_1.SubModule, sm => sm.module),
    __metadata("design:type", Array)
], AppModule.prototype, "subModules", void 0);
exports.AppModule = AppModule = __decorate([
    (0, typeorm_1.Entity)('modules')
], AppModule);
//# sourceMappingURL=module.entity.js.map