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
exports.MastersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const masters_service_1 = require("./masters.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const create_master_value_dto_1 = require("./dto/create-master-value.dto");
let MastersController = class MastersController {
    constructor(mastersService) {
        this.mastersService = mastersService;
    }
    async getCategories(moduleCode) {
        return this.mastersService.getCategories(moduleCode);
    }
    async getAllWithValues(user) {
        return this.mastersService.getAllWithValues(user.tenantId);
    }
    async getBulkValues(user, dto) {
        return this.mastersService.getBulkValues(user.tenantId, dto.categoryCodes);
    }
    async getValues(user, categoryCode) {
        return this.mastersService.getValues(categoryCode, user.tenantId);
    }
    async createValue(user, categoryCode, dto) {
        return this.mastersService.createValue(user.tenantId, categoryCode, dto, user.userId);
    }
    async updateValue(user, valueId, dto) {
        return this.mastersService.updateValue(user.tenantId, valueId, dto);
    }
    async deleteValue(user, valueId) {
        await this.mastersService.deleteValue(user.tenantId, valueId);
        return { message: 'Value deactivated successfully' };
    }
    async reorderValues(user, dto) {
        await this.mastersService.reorderValues(user.tenantId, dto);
        return { message: 'Order saved' };
    }
};
exports.MastersController = MastersController;
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all master categories' }),
    (0, swagger_1.ApiQuery)({ name: 'module', required: false }),
    __param(0, (0, common_1.Query)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MastersController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('all-with-values'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all categories with their values (admin page)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MastersController.prototype, "getAllWithValues", null);
__decorate([
    (0, common_1.Post)('bulk-values'),
    (0, swagger_1.ApiOperation)({ summary: 'Get values for multiple categories in one request' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, create_master_value_dto_1.BulkGetValuesDto]),
    __metadata("design:returntype", Promise)
], MastersController.prototype, "getBulkValues", null);
__decorate([
    (0, common_1.Get)(':categoryCode/values'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all values for a category' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('categoryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], MastersController.prototype, "getValues", null);
__decorate([
    (0, common_1.Post)(':categoryCode/values'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new master value' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('categoryCode')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, create_master_value_dto_1.CreateMasterValueDto]),
    __metadata("design:returntype", Promise)
], MastersController.prototype, "createValue", null);
__decorate([
    (0, common_1.Put)('values/:valueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a master value' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('valueId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, create_master_value_dto_1.UpdateMasterValueDto]),
    __metadata("design:returntype", Promise)
], MastersController.prototype, "updateValue", null);
__decorate([
    (0, common_1.Delete)('values/:valueId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a master value' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('valueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], MastersController.prototype, "deleteValue", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder master values via drag-drop' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, create_master_value_dto_1.ReorderMasterValuesDto]),
    __metadata("design:returntype", Promise)
], MastersController.prototype, "reorderValues", null);
exports.MastersController = MastersController = __decorate([
    (0, swagger_1.ApiTags)('Masters'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('masters'),
    __metadata("design:paramtypes", [masters_service_1.MastersService])
], MastersController);
//# sourceMappingURL=masters.controller.js.map