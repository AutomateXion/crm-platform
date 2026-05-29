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
exports.ActivitiesController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const contacts_entity_1 = require("./contacts.entity");
let ActivitiesController = class ActivitiesController {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(user, q) {
        const page = parseInt(q.page) || 1;
        const limit = parseInt(q.limit) || 50;
        const qb = this.repo.createQueryBuilder('a').where('a.tenantId = :tid', { tid: user.tenantId });
        if (q.status)
            qb.andWhere('a.status = :status', { status: q.status });
        if (q.activityType)
            qb.andWhere('a.activityType = :type', { type: q.activityType });
        if (q.assignedTo)
            qb.andWhere('a.assignedTo = :uid', { uid: q.assignedTo });
        if (q.relatedToType)
            qb.andWhere('a.relatedToType = :rtype', { rtype: q.relatedToType });
        if (q.relatedToId)
            qb.andWhere('a.relatedToId = :rid', { rid: q.relatedToId });
        if (q.overdue === 'true')
            qb.andWhere("a.dueDate < NOW() AND a.status = 'PLANNED'");
        if (q.today === 'true')
            qb.andWhere("DATE(a.dueDate) = CURRENT_DATE");
        if (q.from)
            qb.andWhere('a.dueDate >= :from', { from: q.from });
        if (q.to)
            qb.andWhere('a.dueDate <= :to', { to: q.to });
        const total = await qb.getCount();
        const data = await qb.skip((page - 1) * limit).take(limit).orderBy('a.dueDate', 'ASC').getMany();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async create(user, body) {
        return this.repo.save(this.repo.create({
            ...body, tenantId: user.tenantId,
            createdBy: user.userId, createdByName: user.fullName,
        }));
    }
    async getSummary(user) {
        const tid = user.tenantId;
        const [planned, overdue, today, completed] = await Promise.all([
            this.repo.createQueryBuilder('a').where("a.tenantId = :tid AND a.status = 'PLANNED'", { tid }).getCount(),
            this.repo.createQueryBuilder('a').where("a.tenantId = :tid AND a.status = 'PLANNED' AND a.dueDate < NOW()", { tid }).getCount(),
            this.repo.createQueryBuilder('a').where("a.tenantId = :tid AND DATE(a.dueDate) = CURRENT_DATE", { tid }).getCount(),
            this.repo.createQueryBuilder('a').where("a.tenantId = :tid AND a.status = 'COMPLETED' AND DATE(a.completedDate) = CURRENT_DATE", { tid }).getCount(),
        ]);
        return { planned, overdue, today, completed };
    }
    async getOne(user, id) {
        return this.repo.findOne({ where: { activityId: id, tenantId: user.tenantId } });
    }
    async update(user, id, body) {
        await this.repo.update(id, body);
        return this.repo.findOne({ where: { activityId: id } });
    }
    async complete(user, id, body) {
        await this.repo.update(id, { status: 'COMPLETED', completedDate: new Date(), outcome: body.outcome || 'COMPLETED' });
        return this.repo.findOne({ where: { activityId: id } });
    }
    async remove(user, id) {
        await this.repo.delete(id);
        return { message: 'Activity deleted' };
    }
};
exports.ActivitiesController = ActivitiesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "complete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "remove", null);
exports.ActivitiesController = ActivitiesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('activities'),
    __param(0, (0, typeorm_1.InjectRepository)(contacts_entity_1.ActivityEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ActivitiesController);
//# sourceMappingURL=activities.controller.js.map