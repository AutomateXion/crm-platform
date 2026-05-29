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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_service_1 = require("./permissions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const set_permissions_dto_1 = require("./dto/set-permissions.dto");
const copy_permissions_dto_1 = require("./dto/copy-permissions.dto");
const user_entity_1 = require("../users/entities/user.entity");
let PermissionsController = class PermissionsController {
    constructor(permissionsService) {
        this.permissionsService = permissionsService;
    }
    async getMyPermissions(user) {
        return this.permissionsService.getPermissionMap(user.tenantId, user.userGroupId);
    }
    async getModuleHierarchy() {
        return this.permissionsService.getModuleHierarchy();
    }
    async getPermissionsGrid(user, userGroupId) {
        return this.permissionsService.getPermissionsGrid(user.tenantId, userGroupId);
    }
    async setPermissions(user, dto) {
        await this.permissionsService.setPermissions(user.tenantId, dto, user.userId);
        return { message: 'Permissions saved successfully' };
    }
    async copyPermissions(user, dto) {
        await this.permissionsService.copyPermissions(user.tenantId, dto.sourceGroupId, dto.targetGroupId, user.userId);
        return { message: 'Permissions copied successfully' };
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)('my-map'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permission map for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getMyPermissions", null);
__decorate([
    (0, common_1.Get)('modules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full module/sub-module/page/field hierarchy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getModuleHierarchy", null);
__decorate([
    (0, common_1.Get)('grid/:userGroupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permission grid for a user group' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getPermissionsGrid", null);
__decorate([
    (0, common_1.Post)('set'),
    (0, swagger_1.ApiOperation)({ summary: 'Set permissions for a user group (replaces all existing)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        set_permissions_dto_1.SetPermissionsDto]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "setPermissions", null);
__decorate([
    (0, common_1.Post)('copy'),
    (0, swagger_1.ApiOperation)({ summary: 'Copy permissions from one user group to another' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        copy_permissions_dto_1.CopyPermissionsDto]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "copyPermissions", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, swagger_1.ApiTags)('Permissions'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('permissions'),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map