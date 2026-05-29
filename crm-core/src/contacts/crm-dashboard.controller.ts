import { Controller, Get, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import {
  LeadEntity, OpportunityEntity, AccountEntity, ContactEntity, ActivityEntity
} from "./contacts.entity";

@UseGuards(JwtAuthGuard)
@Controller("crm-dashboard")
export class CrmDashboardController {
  constructor(
    @InjectRepository(LeadEntity) private leadRepo: Repository<LeadEntity>,
    @InjectRepository(OpportunityEntity) private oppRepo: Repository<OpportunityEntity>,
    @InjectRepository(AccountEntity) private accountRepo: Repository<AccountEntity>,
    @InjectRepository(ContactEntity) private contactRepo: Repository<ContactEntity>,
    @InjectRepository(ActivityEntity) private activityRepo: Repository<ActivityEntity>,
  ) {}

  @Get()
  async getDashboard(@CurrentUser() user: any) {
    const tid = user.tenantId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ── Leads ─────────────────────────────────────────────────
    const totalLeads = await this.leadRepo.count({ where: { tenantId: tid } });
    const leadsThisMonth = await this.leadRepo.createQueryBuilder('l')
      .where('l.tenantId = :tid AND l.createdAt >= :start', { tid, start: startOfMonth })
      .getCount();
    const leadsLastMonth = await this.leadRepo.createQueryBuilder('l')
      .where('l.tenantId = :tid AND l.createdAt >= :start AND l.createdAt <= :end', 
        { tid, start: startOfLastMonth, end: endOfLastMonth })
      .getCount();
    const convertedLeads = await this.leadRepo.createQueryBuilder('l')
      .where('l.tenantId = :tid AND l.leadStatusCode = :s', { tid, s: 'CONVERTED' })
      .getCount();

    // Lead source breakdown
    const leadsBySource = await this.leadRepo.createQueryBuilder('l')
      .select('l.lead_source_code', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('l.tenantId = :tid', { tid })
      .groupBy('l.lead_source_code')
      .getRawMany();

    // Lead status breakdown
    const leadsByStatus = await this.leadRepo.createQueryBuilder('l')
      .select('l.lead_status_code', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('l.tenantId = :tid', { tid })
      .groupBy('l.lead_status_code')
      .getRawMany();

    // ── Opportunities ─────────────────────────────────────────
    const totalOpps = await this.oppRepo.count({ where: { tenantId: tid, isActive: true } });
    const wonOpps = await this.oppRepo.createQueryBuilder('o')
      .where('o.tenantId = :tid AND o.stageCode = :s', { tid, s: 'CLOSED_WON' })
      .getCount();
    const lostOpps = await this.oppRepo.createQueryBuilder('o')
      .where('o.tenantId = :tid AND o.stageCode = :s', { tid, s: 'CLOSED_LOST' })
      .getCount();

    // Pipeline value
    const pipelineResult = await this.oppRepo.createQueryBuilder('o')
      .select('SUM(o.dealValue)', 'total')
      .where('o.tenantId = :tid AND o.isActive = true AND o.stageCode NOT IN (:...closed)', 
        { tid, closed: ['CLOSED_WON', 'CLOSED_LOST'] })
      .getRawOne();
    const pipelineValue = Number(pipelineResult?.total || 0);

    // Won value
    const wonResult = await this.oppRepo.createQueryBuilder('o')
      .select('SUM(o.dealValue)', 'total')
      .where('o.tenantId = :tid AND o.stageCode = :s', { tid, s: 'CLOSED_WON' })
      .getRawOne();
    const wonValue = Number(wonResult?.total || 0);

    // Opportunities by stage
    const oppsByStage = await this.oppRepo.createQueryBuilder('o')
      .select('o.stage_code', 'stage')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(o.dealValue)', 'value')
      .where('o.tenantId = :tid AND o.isActive = true', { tid })
      .groupBy('o.stage_code')
      .getRawMany();

    // Win rate
    const totalClosed = wonOpps + lostOpps;
    const winRate = totalClosed > 0 ? Math.round((wonOpps / totalClosed) * 100) : 0;

    // Avg deal size
    const avgDealSize = wonOpps > 0 ? Math.round(wonValue / wonOpps) : 0;

    // Conversion rate (leads to opps)
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // ── Accounts ──────────────────────────────────────────────
    const totalAccounts = await this.accountRepo.count({ where: { tenantId: tid } });
    const accountsThisMonth = await this.accountRepo.createQueryBuilder('a')
      .where('a.tenantId = :tid AND a.createdAt >= :start', { tid, start: startOfMonth })
      .getCount();

    // Top accounts by opportunity value
    const topAccounts = await this.oppRepo.createQueryBuilder('o')
      .select('o.account_name', 'accountName')
      .addSelect('SUM(o.dealValue)', 'totalValue')
      .addSelect('COUNT(*)', 'oppCount')
      .where('o.tenantId = :tid AND o.isActive = true', { tid })
      .groupBy('o.account_name')
      .orderBy('SUM(o.dealValue)', 'DESC')
      .limit(5)
      .getRawMany();

    // ── Activities ────────────────────────────────────────────
    const totalContacts = await this.contactRepo.count({ where: { tenantId: tid } });
    const activitiesToday = await this.activityRepo.createQueryBuilder('a')
      .where('a.tenantId = :tid AND DATE(a.dueDate) = CURRENT_DATE', { tid })
      .getCount();
    const activitiesOverdue = await this.activityRepo.createQueryBuilder('a')
      .where('a.tenantId = :tid AND a.dueDate < NOW() AND a.status != :s', { tid, s: 'COMPLETED' })
      .getCount();

    // Recent activities
    const recentActivities = await this.activityRepo.createQueryBuilder('a')
      .where('a.tenantId = :tid', { tid })
      .orderBy('a.createdAt', 'DESC')
      .limit(5)
      .getMany();

    // Monthly leads trend (last 6 months)
    const monthlyLeads = await this.leadRepo.createQueryBuilder('l')
      .select("TO_CHAR(l.createdAt, 'Mon YY')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('l.tenantId = :tid AND l.createdAt >= :start', 
        { tid, start: new Date(now.getFullYear(), now.getMonth() - 5, 1) })
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
}
