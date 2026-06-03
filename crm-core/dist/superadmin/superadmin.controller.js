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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const superadmin_service_1 = require("./superadmin.service");
let SuperAdminController = class SuperAdminController {
    constructor(svc) {
        this.svc = svc;
    }
    checkSuperAdmin(req) {
        if (!req.user?.isSuperAdmin)
            throw new common_1.UnauthorizedException('Super admin access required');
    }
    getDashboard(req) {
        this.checkSuperAdmin(req);
        return this.svc.getDashboard();
    }
    getTenants(req, q) {
        this.checkSuperAdmin(req);
        return this.svc.getTenants(q.search, q.plan, q.status);
    }
    createTenant(req, dto) {
        this.checkSuperAdmin(req);
        return this.svc.createTenant(dto);
    }
    updateTenant(req, id, dto) {
        this.checkSuperAdmin(req);
        return this.svc.updateTenant(id, dto);
    }
    suspendTenant(req, id, dto) {
        this.checkSuperAdmin(req);
        return this.svc.suspendTenant(id, dto.reason);
    }
    activateTenant(req, id) {
        this.checkSuperAdmin(req);
        return this.svc.activateTenant(id);
    }
    getTenantStats(req, id) {
        this.checkSuperAdmin(req);
        return this.svc.getTenantStats(id);
    }
    getUsers(req, q) {
        this.checkSuperAdmin(req);
        return this.svc.getUsers(q.tenantId, q.search);
    }
    toggleUser(req, id) {
        this.checkSuperAdmin(req);
        return this.svc.toggleUser(id);
    }
    getSystemHealth(req) {
        this.checkSuperAdmin(req);
        return this.svc.getSystemHealth();
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('tenants'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getTenants", null);
__decorate([
    (0, common_1.Post)('tenants'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "createTenant", null);
__decorate([
    (0, common_1.Put)('tenants/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Put)('tenants/:id/suspend'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "suspendTenant", null);
__decorate([
    (0, common_1.Put)('tenants/:id/activate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "activateTenant", null);
__decorate([
    (0, common_1.Get)('tenants/:id/stats'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getTenantStats", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Put)('users/:id/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "toggleUser", null);
__decorate([
    (0, common_1.Get)('system-health'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getSystemHealth", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('superadmin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [superadmin_service_1.SuperAdminService])
], SuperAdminController);
//# sourceMappingURL=superadmin.controller.js.map