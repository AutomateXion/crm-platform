// ─── campaigns.service.ts ─────────────────────────────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignMember } from './entities/campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign) private readonly repo: Repository<Campaign>,
    @InjectRepository(CampaignMember) private readonly memberRepo: Repository<CampaignMember>,
  ) {}

  async create(tenantId: string, dto: Partial<Campaign>, createdBy: string): Promise<Campaign> {
    return this.repo.save(this.repo.create({ ...dto, tenantId, createdBy }));
  }

  async findAll(tenantId: string, params: { page?: number; limit?: number; search?: string; statusId?: string }) {
    const { page = 1, limit = 20, search, statusId } = params;
    const qb = this.repo.createQueryBuilder('c').where('c.tenantId = :tenantId AND c.isActive = true', { tenantId });
    if (search) qb.andWhere('c.campaignName ILIKE :s', { s: `%${search}%` });
    if (statusId) qb.andWhere('c.statusId = :statusId', { statusId });
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).orderBy('c.createdAt', 'DESC').getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, campaignId: string): Promise<Campaign> {
    const c = await this.repo.findOne({ where: { campaignId, tenantId, isActive: true } });
    if (!c) throw new NotFoundException('Campaign not found');
    return c;
  }

  async update(tenantId: string, campaignId: string, dto: Partial<Campaign>): Promise<Campaign> {
    const campaign = await this.findOne(tenantId, campaignId);
    Object.assign(campaign, dto);
    return this.repo.save(campaign);
  }

  async remove(tenantId: string, campaignId: string): Promise<void> {
    await this.findOne(tenantId, campaignId);
    await this.repo.update(campaignId, { isActive: false });
  }

  async clone(tenantId: string, campaignId: string, createdBy: string): Promise<Campaign> {
    const original = await this.findOne(tenantId, campaignId);
    const { campaignId: _, createdAt, updatedAt, ...rest } = original as any;
    return this.repo.save(this.repo.create({
      ...rest,
      campaignName: `Copy of ${original.campaignName}`,
      actualLeads: 0, actualSpend: 0, actualRevenue: 0,
      createdBy,
    }));
  }

  async addMembers(campaignId: string, members: Partial<CampaignMember>[]): Promise<CampaignMember[]> {
    const items = members.map(m => this.memberRepo.create({ ...m, campaignId }));
    return this.memberRepo.save(items);
  }

  async getMembers(campaignId: string, params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 50, status } = params;
    const qb = this.memberRepo.createQueryBuilder('m').where('m.campaignId = :campaignId', { campaignId });
    if (status) qb.andWhere('m.status = :status', { status });
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total };
  }

  async getStats(campaignId: string) {
    const stats = await this.memberRepo.createQueryBuilder('m')
      .select(['m.status as status', 'COUNT(*) as count'])
      .where('m.campaignId = :campaignId', { campaignId })
      .groupBy('m.status')
      .getRawMany();
    const total = stats.reduce((s: number, r: any) => s + Number(r.count), 0);
    return { stats, total };
  }
}
