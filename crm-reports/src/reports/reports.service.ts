import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedReport } from './entities/report.entity';
import { Dashboard, DashboardWidget } from './entities/dashboard.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(SavedReport) private readonly reportRepo: Repository<SavedReport>,
    @InjectRepository(Dashboard) private readonly dashboardRepo: Repository<Dashboard>,
    @InjectRepository(DashboardWidget) private readonly widgetRepo: Repository<DashboardWidget>,
  ) {}

  // ─── Reports ──────────────────────────────────────────────────
  async getSystemReports(): Promise<SavedReport[]> {
    return this.reportRepo.find({ where: { isSystem: true }, order: { category: 'ASC', reportName: 'ASC' } });
  }

  async getMyReports(tenantId: string, createdBy: string): Promise<SavedReport[]> {
    return this.reportRepo.find({
      where: [
        { tenantId, createdBy },
        { tenantId, isShared: true },
      ],
      order: { lastRunAt: 'DESC' },
    });
  }

  async saveReport(tenantId: string, dto: Partial<SavedReport>, createdBy: string): Promise<SavedReport> {
    return this.reportRepo.save(
      this.reportRepo.create({ ...dto, tenantId, createdBy }),
    );
  }

  async deleteReport(reportId: string): Promise<void> {
    await this.reportRepo.delete(reportId);
  }

  // ─── Dashboards ───────────────────────────────────────────────
  async getDashboards(tenantId: string, userId: string): Promise<Dashboard[]> {
    return this.dashboardRepo.find({
      where: [{ tenantId, createdBy: userId }, { tenantId, isShared: true }],
      order: { isDefault: 'DESC', dashboardName: 'ASC' },
    });
  }

  async getDashboard(dashboardId: string): Promise<Dashboard & { widgets: DashboardWidget[] }> {
    const dashboard = await this.dashboardRepo.findOne({ where: { dashboardId } }) as any;
    if (!dashboard) return null;
    dashboard.widgets = await this.widgetRepo.find({
      where: { dashboardId },
      order: { sortOrder: 'ASC' },
    });
    return dashboard;
  }

  async saveDashboard(tenantId: string, dto: Partial<Dashboard>, widgets: Partial<DashboardWidget>[], createdBy: string): Promise<Dashboard> {
    const dashboard = await this.dashboardRepo.save(
      this.dashboardRepo.create({ ...dto, tenantId, createdBy }),
    );
    if (widgets?.length) {
      await this.widgetRepo.delete({ dashboardId: dashboard.dashboardId });
      await this.widgetRepo.save(
        widgets.map((w, i) => this.widgetRepo.create({ ...w, dashboardId: dashboard.dashboardId, sortOrder: i })),
      );
    }
    return dashboard;
  }

  // ─── KPI Data (aggregated across modules via direct queries) ──
  // In production this would query each module's DB via microservice calls
  // Here we return structured mock data matching the real schema
  async getKpiData(tenantId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    // This method would call each module service in production
    // Returns the data structure consumed by the frontend charts
    return {
      period,
      leads: {
        total: 248, new: 32, converted: 18, conversionRate: 7.3,
        bySource: [
          { source: 'Website', count: 82 },
          { source: 'Referral', count: 64 },
          { source: 'Cold Call', count: 41 },
          { source: 'Trade Show', count: 38 },
          { source: 'Social Media', count: 23 },
        ],
      },
      sales: {
        pipelineValue: 284000, wonValue: 94500, lostValue: 42000,
        winRate: 69.1, avgDealSize: 18900,
        byStage: [
          { stage: 'Prospecting', count: 34, value: 82000 },
          { stage: 'Qualification', count: 18, value: 61000 },
          { stage: 'Proposal', count: 11, value: 74000 },
          { stage: 'Negotiation', count: 7, value: 45000 },
          { stage: 'Closed Won', count: 5, value: 22000 },
        ],
        monthlyRevenue: [
          { month: 'Jan', revenue: 42000, target: 50000 },
          { month: 'Feb', revenue: 38000, target: 50000 },
          { month: 'Mar', revenue: 61000, target: 55000 },
          { month: 'Apr', revenue: 54000, target: 55000 },
          { month: 'May', revenue: 72000, target: 60000 },
          { month: 'Jun', revenue: 68000, target: 60000 },
        ],
      },
      support: {
        open: 17, resolved: 142, breached: 3, avgResolutionHours: 14,
        slaCompliance: 97.8, satisfactionAvg: 4.2,
        byPriority: [
          { priority: 'Critical', count: 2 },
          { priority: 'High', count: 5 },
          { priority: 'Medium', count: 7 },
          { priority: 'Low', count: 3 },
        ],
      },
      activities: {
        total: 386, completed: 318, overdue: 12,
        byType: [
          { type: 'Call', count: 142 },
          { type: 'Email', count: 98 },
          { type: 'Meeting', count: 67 },
          { type: 'Demo', count: 34 },
          { type: 'Task', count: 45 },
        ],
      },
    };
  }
}
