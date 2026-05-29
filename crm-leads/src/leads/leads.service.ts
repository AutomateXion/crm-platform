import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead) private readonly repo: Repository<Lead>,
  ) {}

  async create(tenantId: string, dto: CreateLeadDto, createdBy: string): Promise<Lead> {
    const count = await this.repo.count({ where: { tenantId } });
    const leadNumber = `LEAD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    return this.repo.save(this.repo.create({ ...dto, tenantId, leadNumber, createdBy }));
  }

  async findAll(tenantId: string, params: {
    page?: number; limit?: number; search?: string;
    statusId?: string; sourceId?: string; assignedTo?: string; converted?: boolean;
  }) {
    const { page = 1, limit = 20, search, statusId, sourceId, assignedTo, converted } = params;
    const qb = this.repo.createQueryBuilder('l')
      .where('l.tenantId = :tenantId AND l.isActive = true', { tenantId });

    if (search) {
      qb.andWhere(
        "(l.firstName ILIKE :s OR l.lastName ILIKE :s OR l.companyName ILIKE :s OR l.email ILIKE :s)",
        { s: `%${search}%` },
      );
    }
    if (statusId) qb.andWhere('l.leadStatusId = :statusId', { statusId });
    if (sourceId) qb.andWhere('l.leadSourceId = :sourceId', { sourceId });
    if (assignedTo) qb.andWhere('l.assignedTo = :assignedTo', { assignedTo });
    if (converted !== undefined) qb.andWhere('l.converted = :converted', { converted });

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit)
      .orderBy('l.createdAt', 'DESC').getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, leadId: string): Promise<Lead> {
    const lead = await this.repo.findOne({ where: { leadId, tenantId, isActive: true } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(tenantId: string, leadId: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(tenantId, leadId);
    Object.assign(lead, dto);
    return this.repo.save(lead);
  }

  async remove(tenantId: string, leadId: string): Promise<void> {
    await this.findOne(tenantId, leadId);
    await this.repo.update(leadId, { isActive: false });
  }

  // Lead Conversion: create Account + Contact + Opportunity from a lead
  async convertLead(tenantId: string, leadId: string, dto: ConvertLeadDto, convertedBy: string) {
    const lead = await this.findOne(tenantId, leadId);
    if (lead.converted) throw new BadRequestException('Lead is already converted');

    // Mark lead as converted — actual account/contact/opportunity creation
    // is handled by the respective modules. This service stores the IDs.
    await this.repo.update(leadId, {
      converted: true,
      convertedAt: new Date(),
      convertedAccountId: dto.accountId,
      convertedContactId: dto.contactId,
      convertedOpportunityId: dto.opportunityId,
      leadStatusId: dto.convertedStatusId,
    });

    return {
      message: 'Lead converted successfully',
      leadId,
      accountId: dto.accountId,
      contactId: dto.contactId,
      opportunityId: dto.opportunityId,
    };
  }

  // Pipeline counts: group leads by status for Kanban board
  async getPipelineCounts(tenantId: string): Promise<any[]> {
    return this.repo.createQueryBuilder('l')
      .select(['l.leadStatusId as "statusId"', 'COUNT(*) as count', 'SUM(l.estimatedValue) as "totalValue"'])
      .where('l.tenantId = :tenantId AND l.isActive = true AND l.converted = false', { tenantId })
      .groupBy('l.leadStatusId')
      .getRawMany();
  }
}
