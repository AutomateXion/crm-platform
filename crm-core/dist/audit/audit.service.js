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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("./audit-log.schema");
let AuditService = class AuditService {
    constructor(auditModel) {
        this.auditModel = auditModel;
    }
    async log(input) {
        try {
            await this.auditModel.create({
                ...input,
                changes: input.changes?.map(c => ({
                    field: c.field,
                    oldValue: String(c.oldValue ?? ''),
                    newValue: String(c.newValue ?? ''),
                })) ?? [],
                timestamp: new Date(),
            });
        }
        catch (err) {
            console.error('Audit log error:', err.message);
        }
    }
    async getLogs(tenantId, filters) {
        const query = { tenantId };
        if (filters.userId)
            query.userId = filters.userId;
        if (filters.module)
            query.module = filters.module;
        if (filters.entityType)
            query.entityType = filters.entityType;
        if (filters.entityId)
            query.entityId = filters.entityId;
        if (filters.action)
            query.action = filters.action;
        if (filters.from || filters.to) {
            query.timestamp = {};
            if (filters.from)
                query.timestamp.$gte = filters.from;
            if (filters.to)
                query.timestamp.$lte = filters.to;
        }
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.auditModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
            this.auditModel.countDocuments(query),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuditService);
//# sourceMappingURL=audit.service.js.map