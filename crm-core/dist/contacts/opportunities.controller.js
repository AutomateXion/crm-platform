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
exports.OpportunitiesController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const contacts_entity_1 = require("./contacts.entity");
let OpportunitiesController = class OpportunitiesController {
    constructor(repo, itemRepo) {
        this.repo = repo;
        this.itemRepo = itemRepo;
    }
    async getAll(user, q) {
        const page = parseInt(q.page) || 1;
        const limit = parseInt(q.limit) || 50;
        const qb = this.repo.createQueryBuilder("o")
            .where("o.tenantId = :tid AND o.isActive = true", { tid: user.tenantId });
        if (q.search)
            qb.andWhere("o.opportunityName ILIKE :s", { s: `%${q.search}%` });
        if (q.accountId)
            qb.andWhere("o.accountId = :aid", { aid: q.accountId });
        if (q.stageCode)
            qb.andWhere("o.stageCode = :stage", { stage: q.stageCode });
        const total = await qb.getCount();
        const data = await qb.skip((page - 1) * limit).take(limit).orderBy("o.createdAt", "DESC").getMany();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async create(user, body) {
        const count = await this.repo.count({ where: { tenantId: user.tenantId } });
        const num = `OPP-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
        const stageHistory = [{
                stage: body.stageCode || "PROSPECTING",
                enteredAt: new Date().toISOString(),
                stageDate: body.expectedClose || null,
                notes: "Initial stage",
            }];
        return this.repo.save(this.repo.create({
            ...body,
            tenantId: user.tenantId,
            opportunityNumber: num,
            createdBy: user.userId,
            originalCloseDate: body.expectedClose || null,
            stageEnteredAt: new Date(),
            stageHistory,
        }));
    }
    async getOne(user, id) {
        return this.repo.findOne({ where: { opportunityId: id, tenantId: user.tenantId } });
    }
    async update(user, id, body) {
        const existing = await this.repo.findOne({ where: { opportunityId: id, tenantId: user.tenantId } });
        if (!existing)
            return null;
        const originalCloseDate = existing.originalCloseDate || body.expectedClose || null;
        let stageHistory = Array.isArray(existing.stageHistory) ? [...existing.stageHistory] : [];
        if (body.stageCode && body.stageCode !== existing.stageCode) {
            stageHistory.push({
                stage: body.stageCode,
                enteredAt: new Date().toISOString(),
                stageDate: body.stageDate || body.expectedClose || null,
                notes: body.stageNotes || "",
            });
        }
        await this.repo.update(id, {
            ...body,
            originalCloseDate,
            stageHistory,
            stageEnteredAt: body.stageCode !== existing.stageCode ? new Date() : existing.stageEnteredAt,
        });
        return this.repo.findOne({ where: { opportunityId: id } });
    }
    async patch(user, id, body) {
        await this.repo.update(id, body);
        return this.repo.findOne({ where: { opportunityId: id } });
    }
    async remove(user, id) {
        await this.repo.update(id, { isActive: false });
        return { message: "Opportunity deleted" };
    }
    async getItems(id) {
        return this.itemRepo.find({ where: { opportunityId: id }, order: { lineNumber: 'ASC' } });
    }
    async saveItems(id, body) {
        await this.itemRepo.delete({ opportunityId: id });
        const items = (body.items || []).map((item, idx) => this.itemRepo.create({ ...item, opportunityId: id, lineNumber: idx + 1 }));
        if (items.length)
            await this.itemRepo.save(items);
        return this.itemRepo.find({ where: { opportunityId: id }, order: { lineNumber: 'ASC' } });
    }
};
exports.OpportunitiesController = OpportunitiesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OpportunitiesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OpportunitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OpportunitiesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OpportunitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OpportunitiesController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OpportunitiesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OpportunitiesController.prototype, "getItems", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OpportunitiesController.prototype, "saveItems", null);
exports.OpportunitiesController = OpportunitiesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("opportunities"),
    __param(0, (0, typeorm_1.InjectRepository)(contacts_entity_1.OpportunityEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(contacts_entity_1.OpportunityItemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OpportunitiesController);
//# sourceMappingURL=opportunities.controller.js.map