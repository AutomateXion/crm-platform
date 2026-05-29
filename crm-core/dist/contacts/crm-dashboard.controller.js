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
exports.CrmDashboardController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const contacts_entity_1 = require("./contacts.entity");
let CrmDashboardController = class CrmDashboardController {
    constructor(leadRepo, oppRepo, accountRepo, contactRepo, activityRepo) {
        this.leadRepo = leadRepo;
        this.oppRepo = oppRepo;
        this.accountRepo = accountRepo;
        this.contactRepo = contactRepo;
        this.activityRepo = activityRepo;
    }
    async getDashboard(user) {
        const tid = user.tenantId;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const totalLeads = await this.leadRepo.count({ where: { tenantId: tid } });
        const leadsThisMonth = await this.leadRepo.createQueryBuilder('l')
            .where('l.tenantId = :tid AND l.createdAt >= :start', { tid, start: startOfMonth })
            .getCount();
        const leadsLastMonth = await this.leadRepo.createQueryBuilder('l')
            .where('l.tenantId = :tid AND l.createdAt >= :start AND l.createdAt <= :end', { tid, start: startOfLastMonth, end: endOfLastMonth })
            .getCount();
        const convertedLeads = await this.leadRepo.createQueryBuilder('l')
            .where('l.tenantId = :tid AND l.leadStatusCode = :s', { tid, s: 'CONVERTED' })
            .getCount();
        const leadsBySource = await this.leadRepo.createQueryBuilder('l')
            .select('l.leadSource', 'source')
            .addSelect('COUNT(*)', 'count')
            .where('l.tenantId = :tid', { tid })
            .groupBy('l.leadSource')
            .getRawMany();
        const leadsByStatus = await this.leadRepo.createQueryBuilder('l')
            .select('l.leadStatusCode', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('l.tenantId = :tid', { tid })
            .groupBy('l.leadStatusCode')
            .getRawMany();
        const totalOpps = await this.oppRepo.count({ where: { tenantId: tid, isActive: true } });
        const wonOpps = await this.oppRepo.createQueryBuilder('o')
            .where('o.tenantId = :tid AND o.stageCode = :s', { tid, s: 'CLOSED_WON' })
            .getCount();
        const lostOpps = await this.oppRepo.createQueryBuilder('o')
            .where('o.tenantId = :tid AND o.stageCode = :s', { tid, s: 'CLOSED_LOST' })
            .getCount();
        const pipelineResult = await this.oppRepo.createQueryBuilder('o')
            .select('SUM(o.dealValue)', 'total')
            .where('o.tenantId = :tid AND o.isActive = true AND o.stageCode NOT IN (:...closed)', { tid, closed: ['CLOSED_WON', 'CLOSED_LOST'] })
            .getRawOne();
        const pipelineValue = Number(pipelineResult?.total || 0);
        const wonResult = await this.oppRepo.createQueryBuilder('o')
            .select('SUM(o.dealValue)', 'total')
            .where('o.tenantId = :tid AND o.stageCode = :s', { tid, s: 'CLOSED_WON' })
            .getRawOne();
        const wonValue = Number(wonResult?.total || 0);
        const oppsByStage = await this.oppRepo.createQueryBuilder('o')
            .select('o.stageCode', 'stage')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(o.dealValue)', 'value')
            .where('o.tenantId = :tid AND o.isActive = true', { tid })
            .groupBy('o.stageCode')
            .getRawMany();
        const totalClosed = wonOpps + lostOpps;
        const winRate = totalClosed > 0 ? Math.round((wonOpps / totalClosed) * 100) : 0;
        const avgDealSize = wonOpps > 0 ? Math.round(wonValue / wonOpps) : 0;
        const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
        const totalAccounts = await this.accountRepo.count({ where: { tenantId: tid } });
        const accountsThisMonth = await this.accountRepo.createQueryBuilder('a')
            .where('a.tenantId = :tid AND a.createdAt >= :start', { tid, start: startOfMonth })
            .getCount();
        const topAccounts = await this.oppRepo.createQueryBuilder('o')
            .select('o.accountName', 'accountName')
            .addSelect('SUM(o.dealValue)', 'totalValue')
            .addSelect('COUNT(*)', 'oppCount')
            .where('o.tenantId = :tid AND o.isActive = true', { tid })
            .groupBy('o.accountName')
            .orderBy('SUM(o.dealValue)', 'DESC')
            .limit(5)
            .getRawMany();
        const totalContacts = await this.contactRepo.count({ where: { tenantId: tid } });
        const activitiesToday = await this.activityRepo.createQueryBuilder('a')
            .where('a.tenantId = :tid AND DATE(a.dueDate) = CURRENT_DATE', { tid })
            .getCount();
        const activitiesOverdue = await this.activityRepo.createQueryBuilder('a')
            .where('a.tenantId = :tid AND a.dueDate < NOW() AND a.status != :s', { tid, s: 'COMPLETED' })
            .getCount();
        const recentActivities = await this.activityRepo.createQueryBuilder('a')
            .where('a.tenantId = :tid', { tid })
            .orderBy('a.createdAt', 'DESC')
            .limit(5)
            .getMany();
        const monthlyLeads = await this.leadRepo.createQueryBuilder('l')
            .select("TO_CHAR(l.createdAt, 'Mon YY')", 'month')
            .addSelect('COUNT(*)', 'count')
            .where('l.tenantId = :tid AND l.createdAt >= :start', { tid, start: new Date(now.getFullYear(), now.getMonth() - 5, 1) })
            .groupBy("TO_CHAR(l.createdAt, 'Mon YY')")
            .orderBy("MIN(l.createdAt)", 'ASC')
            .getRawMany();
        return {
            leads: {
                total: totalLeads,
                thisMonth: leadsThisMonth,
                lastMonth: leadsLastMonth,
                converted: convertedLeads,
                conversionRate,
                bySource: leadsBySource,
                byStatus: leadsByStatus,
                monthlyTrend: monthlyLeads,
            },
            opportunities: {
                total: totalOpps,
                won: wonOpps,
                lost: lostOpps,
                pipelineValue,
                wonValue,
                winRate,
                avgDealSize,
                byStage: oppsByStage,
            },
            accounts: {
                total: totalAccounts,
                thisMonth: accountsThisMonth,
                top: topAccounts,
            },
            contacts: {
                total: totalContacts,
            },
            activities: {
                today: activitiesToday,
                overdue: activitiesOverdue,
                recent: recentActivities,
            },
        };
    }
};
exports.CrmDashboardController = CrmDashboardController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmDashboardController.prototype, "getDashboard", null);
exports.CrmDashboardController = CrmDashboardController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("crm-dashboard"),
    __param(0, (0, typeorm_1.InjectRepository)(contacts_entity_1.LeadEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(contacts_entity_1.OpportunityEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(contacts_entity_1.AccountEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(contacts_entity_1.ContactEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(contacts_entity_1.ActivityEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CrmDashboardController);
//# sourceMappingURL=crm-dashboard.controller.js.map