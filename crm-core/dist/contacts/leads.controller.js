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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const contacts_entity_1 = require("./contacts.entity");
let LeadsController = class LeadsController {
    constructor(repo, contactRepo) {
        this.repo = repo;
        this.contactRepo = contactRepo;
    }
    async getAll(user, q) {
        const page = parseInt(q.page) || 1;
        const limit = parseInt(q.limit) || 20;
        const qb = this.repo.createQueryBuilder('l')
            .where('l.tenantId = :tid AND l.isActive = true', { tid: user.tenantId });
        if (q.search) {
            qb.andWhere('(l.firstName ILIKE :s OR l.lastName ILIKE :s OR l.companyName ILIKE :s OR l.email ILIKE :s)', { s: `%${q.search}%` });
        }
        if (q.leadStatusCode)
            qb.andWhere('l.leadStatusCode = :status', { status: q.leadStatusCode });
        if (q.accountId)
            qb.andWhere('l.accountId = :accountId', { accountId: q.accountId });
        if (q.converted === 'false')
            qb.andWhere('l.converted = false');
        const total = await qb.getCount();
        const data = await qb.skip((page - 1) * limit).take(limit).orderBy('l.createdAt', 'DESC').getMany();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async create(user, body) {
        const count = await this.repo.count({ where: { tenantId: user.tenantId } });
        const leadNumber = `LEAD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
        return this.repo.save(this.repo.create({ ...body, tenantId: user.tenantId, leadNumber, createdBy: user.userId }));
    }
    async getOne(user, id) {
        return this.repo.findOne({ where: { leadId: id, tenantId: user.tenantId } });
    }
    async update(user, id, body) {
        await this.repo.update(id, body);
        const lead = await this.repo.findOne({ where: { leadId: id } });
        if (lead && lead.contactId) {
            try {
                const parts = ([lead.firstName, lead.lastName].filter(Boolean).join(' ')).split(' ');
                await this.contactRepo.update(lead.contactId, {
                    firstName: lead.firstName || undefined,
                    lastName: lead.lastName || undefined,
                    email: lead.email || undefined,
                    mobile: lead.phone || undefined,
                    jobTitle: lead.jobTitle || undefined,
                });
            }
            catch (e) {
                console.warn('Contact sync failed:', e.message);
            }
        }
        return lead;
    }
    async patch(user, id, body) {
        await this.repo.update(id, body);
        return this.repo.findOne({ where: { leadId: id } });
    }
    async remove(user, id) {
        await this.repo.update(id, { isActive: false });
        return { message: 'Lead deleted' };
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "remove", null);
exports.LeadsController = LeadsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('leads'),
    __param(0, (0, typeorm_1.InjectRepository)(contacts_entity_1.LeadEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(contacts_entity_1.ContactEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map