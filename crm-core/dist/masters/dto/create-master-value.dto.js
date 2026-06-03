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
exports.BulkGetValuesDto = exports.ReorderMasterValuesDto = exports.UpdateMasterValueDto = exports.CreateMasterValueDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateMasterValueDto {
}
exports.CreateMasterValueDto = CreateMasterValueDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TRADE_SHOW' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.Matches)(/^[A-Z0-9_]+$/, { message: 'Value code must be uppercase letters, numbers and underscores' }),
    __metadata("design:type", String)
], CreateMasterValueDto.prototype, "valueCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Trade Show' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateMasterValueDto.prototype, "valueLabel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'معرض تجاري' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMasterValueDto.prototype, "valueLabelAr", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMasterValueDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#52c41a' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(7),
    __metadata("design:type", String)
], CreateMasterValueDto.prototype, "colorCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'StarOutlined' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMasterValueDto.prototype, "iconCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === "true"),
    __metadata("design:type", Boolean)
], CreateMasterValueDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMasterValueDto.prototype, "parentValueId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMasterValueDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateMasterValueDto.prototype, "metadata", void 0);
class UpdateMasterValueDto {
}
exports.UpdateMasterValueDto = UpdateMasterValueDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateMasterValueDto.prototype, "valueLabel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMasterValueDto.prototype, "valueLabelAr", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMasterValueDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(7),
    __metadata("design:type", String)
], UpdateMasterValueDto.prototype, "colorCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMasterValueDto.prototype, "iconCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMasterValueDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateMasterValueDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === "true"),
    __metadata("design:type", Boolean)
], UpdateMasterValueDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateMasterValueDto.prototype, "metadata", void 0);
class ReorderMasterValuesDto {
}
exports.ReorderMasterValuesDto = ReorderMasterValuesDto;
class BulkGetValuesDto {
}
exports.BulkGetValuesDto = BulkGetValuesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['lead_sources', 'lead_statuses'] }),
    __metadata("design:type", Array)
], BulkGetValuesDto.prototype, "categoryCodes", void 0);
//# sourceMappingURL=create-master-value.dto.js.map