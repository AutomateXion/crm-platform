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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const master_entity_1 = require("./entities/master.entity");
const master_entity_2 = require("./entities/master.entity");
let MastersService = class MastersService {
    constructor(categoryRepo, valueRepo) {
        this.categoryRepo = categoryRepo;
        this.valueRepo = valueRepo;
    }
    async getCategories(moduleCode) {
        const query = this.categoryRepo.createQueryBuilder('c')
            .where('c.isActive = true')
            .orderBy('c.sortOrder', 'ASC');
        if (moduleCode) {
            query.leftJoin('modules', 'm', 'm.module_id = c.module_id')
                .andWhere('m.module_code = :moduleCode', { moduleCode });
        }
        return query.getMany();
    }
    async getCategory(categoryCode) {
        const cat = await this.categoryRepo.findOne({ where: { categoryCode, isActive: true } });
        if (!cat)
            throw new common_1.NotFoundException(`Category '${categoryCode}' not found`);
        return cat;
    }
    async getValues(categoryCode, tenantId) {
        const category = await this.getCategory(categoryCode);
        return this.valueRepo.find({
            where: [
                { categoryId: category.categoryId, tenantId: (0, typeorm_2.IsNull)(), isActive: true },
                { categoryId: category.categoryId, tenantId, isActive: true },
            ],
            order: { sortOrder: 'ASC', valueLabel: 'ASC' },
        });
    }
    async getAllWithValues(tenantId) {
        const categories = await this.categoryRepo.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC' },
        });
        for (const cat of categories) {
            cat.values = await this.valueRepo.find({
                where: [
                    { categoryId: cat.categoryId, tenantId: (0, typeorm_2.IsNull)(), isActive: true },
                    { categoryId: cat.categoryId, tenantId, isActive: true },
                ],
                order: { sortOrder: 'ASC' },
            });
        }
        return categories;
    }
    async createValue(tenantId, categoryCode, dto, createdBy) {
        const category = await this.getCategory(categoryCode);
        const existing = await this.valueRepo.findOne({
            where: { categoryId: category.categoryId, tenantId, valueCode: dto.valueCode.toUpperCase() },
        });
        if (existing)
            throw new common_1.ConflictException(`Value code '${dto.valueCode}' already exists`);
        const value = this.valueRepo.create({
            categoryId: category.categoryId,
            tenantId,
            valueCode: dto.valueCode.toUpperCase(),
            valueLabel: dto.valueLabel,
            valueLabelAr: dto.valueLabelAr,
            description: dto.description,
            colorCode: dto.colorCode,
            iconCode: dto.iconCode,
            isDefault: dto.isDefault || false,
            parentValueId: dto.parentValueId,
            metadata: dto.metadata || {},
            sortOrder: dto.sortOrder || 0,
            createdBy,
            updatedAt: new Date(),
        });
        if (dto.isDefault) {
            await this.valueRepo.update({ categoryId: category.categoryId, tenantId }, { isDefault: false });
        }
        return this.valueRepo.save(value);
    }
    async updateValue(tenantId, valueId, dto) {
        const value = await this.valueRepo.findOne({ where: { valueId } });
        if (!value)
            throw new common_1.NotFoundException('Value not found');
        if (value.isSystem && !value.tenantId) {
            throw new common_1.ForbiddenException('System values cannot be modified');
        }
        if (dto.isDefault) {
            await this.valueRepo.update({ categoryId: value.categoryId, tenantId }, { isDefault: false });
        }
        Object.assign(value, dto, { updatedAt: new Date() });
        return this.valueRepo.save(value);
    }
    async deleteValue(tenantId, valueId) {
        const value = await this.valueRepo.findOne({ where: { valueId } });
        if (!value)
            throw new common_1.NotFoundException('Value not found');
        if (value.isSystem)
            throw new common_1.ForbiddenException('System values cannot be deleted');
        if (!value.tenantId)
            throw new common_1.ForbiddenException('Global values cannot be deleted');
        if (value.tenantId !== tenantId)
            throw new common_1.ForbiddenException('Access denied');
        await this.valueRepo.update(valueId, { isActive: false });
    }
    async reorderValues(tenantId, dto) {
        for (const item of dto.items) {
            await this.valueRepo.update(item.valueId, { sortOrder: item.sortOrder });
        }
    }
    async getBulkValues(tenantId, categoryCodes) {
        const result = {};
        for (const code of categoryCodes) {
            try {
                result[code] = await this.getValues(code, tenantId);
            }
            catch {
                result[code] = [];
            }
        }
        return result;
    }
};
exports.MastersService = MastersService;
exports.MastersService = MastersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(master_entity_1.MasterCategory)),
    __param(1, (0, typeorm_1.InjectRepository)(master_entity_2.MasterValue)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MastersService);
//# sourceMappingURL=masters.service.js.map