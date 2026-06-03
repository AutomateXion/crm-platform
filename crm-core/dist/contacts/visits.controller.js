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
exports.VisitsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const contacts_entity_1 = require("./contacts.entity");
let VisitsController = class VisitsController {
    constructor(visitRepo) {
        this.visitRepo = visitRepo;
    }
    async getVisits(req, q) {
        const tid = req.user.tenantId;
        const qb = this.visitRepo.createQueryBuilder('v').where('v.tenantId = :tid', { tid });
        if (q.salesmanId)
            qb.andWhere('v.salesmanId = :sid', { sid: q.salesmanId });
        if (q.accountId)
            qb.andWhere('v.accountId = :aid', { aid: q.accountId });
        if (q.status)
            qb.andWhere('v.status = :status', { status: q.status });
        if (q.from)
            qb.andWhere('v.visitDate >= :from', { from: q.from });
        if (q.to)
            qb.andWhere('v.visitDate <= :to', { to: q.to });
        qb.orderBy('v.visitDate', 'DESC').skip(((+q.page || 1) - 1) * (+q.limit || 20)).take(+q.limit || 20);
        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }
    async getMyVisits(req) {
        const tid = req.user.tenantId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.visitRepo.createQueryBuilder('v')
            .where('v.tenantId = :tid AND v.salesmanId = :sid AND v.visitDate >= :today', { tid, sid: req.user.userId, today })
            .orderBy('v.visitDate', 'DESC').getMany();
    }
    async getVisitStats(req, q) {
        const tid = req.user.tenantId;
        const total = await this.visitRepo.count({ where: { tenantId: tid } });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await this.visitRepo.createQueryBuilder('v')
            .where('v.tenantId = :tid AND v.visitDate >= :today', { tid, today }).getCount();
        const byStatus = await this.visitRepo.createQueryBuilder('v')
            .select('v.status', 'status').addSelect('COUNT(*)', 'count')
            .where('v.tenantId = :tid', { tid }).groupBy('v.status').getRawMany();
        const bySalesman = await this.visitRepo.createQueryBuilder('v')
            .select('v.salesmanName', 'name').addSelect('COUNT(*)', 'count')
            .where('v.tenantId = :tid', { tid }).groupBy('v.salesmanName')
            .orderBy('COUNT(*)', 'DESC').limit(10).getRawMany();
        return { total, todayCount, byStatus, bySalesman };
    }
    async checkIn(req, dto) {
        const visit = this.visitRepo.create({
            ...dto,
            tenantId: req.user.tenantId,
            salesmanId: dto.salesmanId || req.user.userId,
            salesmanName: dto.salesmanName || req.user.fullName,
            visitDate: new Date(),
            status: 'CHECKED_IN',
        });
        return this.visitRepo.save(visit);
    }
    async checkOut(req, id, dto) {
        const visit = await this.visitRepo.findOne({ where: { visitId: id, tenantId: req.user.tenantId } });
        if (!visit)
            return { error: 'Not found' };
        const checkOutTime = new Date();
        const durationMinutes = Math.round((checkOutTime.getTime() - new Date(visit.visitDate).getTime()) / 60000);
        await this.visitRepo.update({ visitId: id }, {
            checkOutTime, durationMinutes, status: 'COMPLETED',
            outcome: dto.outcome, notes: dto.notes, nextAction: dto.nextAction, photos: dto.photos || [],
        });
        return this.visitRepo.findOne({ where: { visitId: id } });
    }
    async updateVisit(req, id, dto) {
        await this.visitRepo.update({ visitId: id, tenantId: req.user.tenantId }, dto);
        return this.visitRepo.findOne({ where: { visitId: id } });
    }
    async deleteVisit(req, id) {
        await this.visitRepo.delete({ visitId: id, tenantId: req.user.tenantId });
        return { success: true };
    }
};
exports.VisitsController = VisitsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "getVisits", null);
__decorate([
    (0, common_1.Get)('my-visits'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "getMyVisits", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "getVisitStats", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Patch)(':id/checkout'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "updateVisit", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "deleteVisit", null);
exports.VisitsController = VisitsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('visits'),
    __param(0, (0, typeorm_1.InjectRepository)(contacts_entity_1.CustomerVisitEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VisitsController);
//# sourceMappingURL=visits.controller.js.map