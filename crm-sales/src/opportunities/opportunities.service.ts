import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity, OpportunityProduct, OpportunityStageHistory } from './entities/opportunity.entity';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dto/opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity) private readonly repo: Repository<Opportunity>,
    @InjectRepository(OpportunityProduct) private readonly productRepo: Repository<OpportunityProduct>,
    @InjectRepository(OpportunityStageHistory) private readonly historyRepo: Repository<OpportunityStageHistory>,
  ) {}

  async create(tenantId: string, dto: CreateOpportunityDto, createdBy: string): Promise<Opportunity> {
    const count = await this.repo.count({ where: { tenantId } });
    const opportunityNumber = `OPP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const opp = await this.repo.save(
      this.repo.create({ ...dto, tenantId, opportunityNumber, createdBy }),
    );
    // Record initial stage
    await this.historyRepo.save(
      this.historyRepo.create({ opportunityId: opp.opportunityId, toStageId: dto.stageId, changedBy: createdBy }),
    );
    return opp;
  }

  async findAll(tenantId: string, params: {
    page?: number; limit?: number; search?: string;
    stageId?: string; accountId?: string; assignedTo?: string;
    closingThisMonth?: boolean;
  }) {
    const { page = 1, limit = 20, search, stageId, accountId, assignedTo, closingThisMonth } = params;
    const qb = this.repo.createQueryBuilder('o')
      .where('o.tenantId = :tenantId AND o.isActive = true', { tenantId });

    if (search) qb.andWhere('o.opportunityName ILIKE :s', { s: `%${search}%` });
    if (stageId) qb.andWhere('o.stageId = :stageId', { stageId });
    if (accountId) qb.andWhere('o.accountId = :accountId', { accountId });
    if (assignedTo) qb.andWhere('o.assignedTo = :assignedTo', { assignedTo });
    if (closingThisMonth) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      qb.andWhere('o.expectedClose BETWEEN :start AND :end', { start, end });
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit)
      .orderBy('o.expectedClose', 'ASC').getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, opportunityId: string): Promise<Opportunity> {
    const opp = await this.repo.findOne({ where: { opportunityId, tenantId, isActive: true } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    return opp;
  }

  async update(tenantId: string, opportunityId: string, dto: UpdateOpportunityDto, updatedBy: string): Promise<Opportunity> {
    const opp = await this.findOne(tenantId, opportunityId);
    // Track stage change
    if (dto.stageId && dto.stageId !== opp.stageId) {
      await this.historyRepo.save(
        this.historyRepo.create({
          opportunityId, fromStageId: opp.stageId,
          toStageId: dto.stageId, changedBy: updatedBy,
        }),
      );
    }
    Object.assign(opp, dto);
    return this.repo.save(opp);
  }

  async remove(tenantId: string, opportunityId: string): Promise<void> {
    await this.findOne(tenantId, opportunityId);
    await this.repo.update(opportunityId, { isActive: false });
  }

  async getProducts(opportunityId: string): Promise<OpportunityProduct[]> {
    return this.productRepo.find({ where: { opportunityId }, order: { sortOrder: 'ASC' } });
  }

  async saveProducts(opportunityId: string, products: Partial<OpportunityProduct>[]): Promise<OpportunityProduct[]> {
    await this.productRepo.delete({ opportunityId });
    const items = products.map((p, i) => {
      const total = (p.quantity || 1) * (p.unitPrice || 0) * (1 - (p.discountPct || 0) / 100);
      return this.productRepo.create({ ...p, opportunityId, totalPrice: total, sortOrder: i });
    });
    return this.productRepo.save(items);
  }

  // Sales forecasting: pipeline value grouped by stage
  async getForecast(tenantId: string, year: number, month?: number) {
    const qb = this.repo.createQueryBuilder('o')
      .select([
        'o.stageId as "stageId"',
        'COUNT(*) as count',
        'SUM(o.dealValue) as "totalValue"',
        'SUM(o.dealValue * o.probability / 100) as "weightedValue"',
      ])
      .where('o.tenantId = :tenantId AND o.isActive = true', { tenantId });

    if (month) {
      qb.andWhere('EXTRACT(YEAR FROM o.expectedClose) = :year AND EXTRACT(MONTH FROM o.expectedClose) = :month', { year, month });
    } else {
      qb.andWhere('EXTRACT(YEAR FROM o.expectedClose) = :year', { year });
    }

    return qb.groupBy('o.stageId').getRawMany();
  }

  async getPipelineByStage(tenantId: string) {
    return this.repo.createQueryBuilder('o')
      .select(['o.stageId as "stageId"', 'COUNT(*) as count', 'SUM(o.dealValue) as "totalValue"'])
      .where('o.tenantId = :tenantId AND o.isActive = true', { tenantId })
      .groupBy('o.stageId')
      .getRawMany();
  }

  async getStageHistory(opportunityId: string): Promise<OpportunityStageHistory[]> {
    return this.historyRepo.find({ where: { opportunityId }, order: { changedAt: 'DESC' } });
  }
}
