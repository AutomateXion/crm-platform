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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenants_service_1 = require("./tenants.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const update_tenant_dto_1 = require("./dto/update-tenant.dto");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
let TenantsController = class TenantsController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async getMyTenant(user) {
        return this.tenantsService.getTenant(user.tenantId);
    }
    async updateTenant(user, dto) {
        return this.tenantsService.updateTenant(user.tenantId, dto);
    }
    async updateModules(user, modules) {
        return this.tenantsService.updateActiveModules(user.tenantId, modules);
    }
    async getCompanySettings(user) {
        return this.tenantsService.getTenant(user.tenantId);
    }
    async updateCompanySettings(user, dto) {
        return this.tenantsService.updateTenant(user.tenantId, dto);
    }
    async getAccountingConfig(user) {
        return this.tenantsService.getAccountingConfig(user.tenantId);
    }
    async saveAccountingConfig(user, dto) {
        return this.tenantsService.saveAccountingConfig(user.tenantId, dto);
    }
    async getEmailConfig(user) {
        return this.tenantsService.getEmailConfig(user.tenantId);
    }
    async saveEmailConfig(user, dto) {
        return this.tenantsService.saveEmailConfig(user.tenantId, dto);
    }
    async testEmailConfig(user, dto) {
        return this.tenantsService.testEmailConfig(user.tenantId, dto.to);
    }
    async provisionTenant(dto) {
        return this.tenantsService.createTenant(dto);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current tenant settings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getMyTenant", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant settings (logo, colors, formats)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, update_tenant_dto_1.UpdateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Patch)('me/modules'),
    (0, swagger_1.ApiOperation)({ summary: 'Update active modules for tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('modules')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Array]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateModules", null);
__decorate([
    (0, common_1.Get)('company-settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getCompanySettings", null);
__decorate([
    (0, common_1.Put)('company-settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateCompanySettings", null);
__decorate([
    (0, common_1.Get)('accounting-config'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getAccountingConfig", null);
__decorate([
    (0, common_1.Post)('accounting-config'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "saveAccountingConfig", null);
__decorate([
    (0, common_1.Get)('email-config'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getEmailConfig", null);
__decorate([
    (0, common_1.Post)('email-config'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "saveEmailConfig", null);
__decorate([
    (0, common_1.Post)('email-config/test'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "testEmailConfig", null);
__decorate([
    (0, common_1.Post)('provision'),
    (0, common_1.SetMetadata)('isPublic', true),
    (0, swagger_1.ApiOperation)({ summary: 'Provision a new tenant (super admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "provisionTenant", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Tenants'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map