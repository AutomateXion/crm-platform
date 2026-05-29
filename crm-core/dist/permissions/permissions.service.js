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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("./entities/permission.entity");
const module_entity_1 = require("./entities/module.entity");
const sub_module_entity_1 = require("./entities/sub-module.entity");
const user_group_entity_1 = require("../users/entities/user-group.entity");
let PermissionsService = class PermissionsService {
    constructor(permissionRepo, moduleRepo, subModuleRepo, pageRepo, fieldRepo, userGroupRepo) {
        this.permissionRepo = permissionRepo;
        this.moduleRepo = moduleRepo;
        this.subModuleRepo = subModuleRepo;
        this.pageRepo = pageRepo;
        this.fieldRepo = fieldRepo;
        this.userGroupRepo = userGroupRepo;
    }
    async getPermissionMap(tenantId, userGroupId) {
        const permissions = await this.permissionRepo.find({
            where: { tenantId, userGroupId },
        });
        const modules = await this.moduleRepo.find({
            where: { isActive: true },
            relations: ['subModules', 'subModules.pages', 'subModules.pages.fields'],
            order: { sortOrder: 'ASC' },
        });
        const map = { modules: {} };
        for (const mod of modules) {
            const modPerm = permissions.find(p => p.moduleId === mod.moduleId && !p.subModuleId && !p.pageId && !p.fieldId);
            const modLevel = modPerm?.permissionLevel ?? permission_entity_1.PermissionLevel.NO_ACCESS;
            map.modules[mod.moduleCode] = {
                level: modLevel,
                subModules: {},
            };
            for (const sub of mod.subModules || []) {
                const subPerm = permissions.find(p => p.subModuleId === sub.subModuleId && !p.pageId && !p.fieldId);
                const subLevel = subPerm?.permissionLevel ?? modLevel;
                map.modules[mod.moduleCode].subModules[sub.subModuleCode] = {
                    level: subLevel,
                    pages: {},
                };
                for (const page of sub.pages || []) {
                    const pagePerm = permissions.find(p => p.pageId === page.pageId && !p.fieldId);
                    const pageLevel = pagePerm?.permissionLevel ?? subLevel;
                    const fieldMap = {};
                    for (const field of page.fields || []) {
                        const fieldPerm = permissions.find(p => p.fieldId === field.fieldId);
                        fieldMap[field.fieldCode] = fieldPerm?.permissionLevel ?? pageLevel;
                    }
                    map.modules[mod.moduleCode].subModules[sub.subModuleCode].pages[page.pageCode] = {
                        level: pageLevel,
                        fields: fieldMap,
                    };
                }
            }
        }
        return map;
    }
    async setPermissions(tenantId, dto, createdBy) {
        await this.permissionRepo.delete({
            tenantId,
            userGroupId: dto.userGroupId,
        });
        const perms = dto.permissions.map(p => ({
            tenantId,
            userGroupId: dto.userGroupId,
            moduleId: p.moduleId || null,
            subModuleId: p.subModuleId || null,
            pageId: p.pageId || null,
            fieldId: p.fieldId || null,
            permissionLevel: p.permissionLevel,
            createdBy,
        }));
        await this.permissionRepo.save(perms);
        await this.invalidatePermissionCache(tenantId, dto.userGroupId);
    }
    async copyPermissions(tenantId, sourceGroupId, targetGroupId, createdBy) {
        const sourcePerms = await this.permissionRepo.find({
            where: { tenantId, userGroupId: sourceGroupId },
        });
        await this.permissionRepo.delete({ tenantId, userGroupId: targetGroupId });
        const newPerms = sourcePerms.map(p => ({
            tenantId,
            userGroupId: targetGroupId,
            moduleId: p.moduleId,
            subModuleId: p.subModuleId,
            pageId: p.pageId,
            fieldId: p.fieldId,
            permissionLevel: p.permissionLevel,
            createdBy,
        }));
        await this.permissionRepo.save(newPerms);
        await this.invalidatePermissionCache(tenantId, targetGroupId);
    }
    async getModuleHierarchy() {
        return this.moduleRepo.find({
            where: { isActive: true },
            relations: ['subModules', 'subModules.pages', 'subModules.pages.fields'],
            order: { sortOrder: 'ASC' },
        });
    }
    async getPermissionsGrid(tenantId, userGroupId) {
        const group = await this.userGroupRepo.findOne({
            where: { userGroupId, tenantId },
        });
        if (!group)
            throw new common_1.NotFoundException('User group not found');
        const hierarchy = await this.getModuleHierarchy();
        const permissions = await this.permissionRepo.find({
            where: { tenantId, userGroupId },
        });
        const permMap = new Map(permissions.map(p => {
            const key = [p.moduleId, p.subModuleId, p.pageId, p.fieldId]
                .filter(Boolean).join(':');
            return [key, p.permissionLevel];
        }));
        return {
            group,
            hierarchy,
            permMap: Object.fromEntries(permMap),
        };
    }
    async canAccessModule(tenantId, userGroupId, moduleCode) {
        const map = await this.getPermissionMap(tenantId, userGroupId);
        const modPerm = map.modules[moduleCode];
        return modPerm && modPerm.level !== permission_entity_1.PermissionLevel.NO_ACCESS && modPerm.level !== permission_entity_1.PermissionLevel.HIDDEN;
    }
    async invalidatePermissionCache(tenantId, userGroupId) {
    }
    async invalidateTenantCache(tenantId) {
        const groups = await this.userGroupRepo.find({ where: { tenantId } });
        for (const group of groups) {
            await this.invalidatePermissionCache(tenantId, group.userGroupId);
        }
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(1, (0, typeorm_1.InjectRepository)(module_entity_1.AppModule)),
    __param(2, (0, typeorm_1.InjectRepository)(sub_module_entity_1.SubModule)),
    __param(3, (0, typeorm_1.InjectRepository)(sub_module_entity_1.Page)),
    __param(4, (0, typeorm_1.InjectRepository)(sub_module_entity_1.Field)),
    __param(5, (0, typeorm_1.InjectRepository)(user_group_entity_1.UserGroup)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map