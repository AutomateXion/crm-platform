import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Ticket, TicketComment } from './entities/ticket.entity';
import { CreateTicketDto, UpdateTicketDto, AddCommentDto, ResolveTicketDto } from './dto/ticket.dto';

const SLA_HOURS: Record<string, number> = {
  CRITICAL: 4, HIGH: 8, MEDIUM: 24, LOW: 48,
};

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private readonly repo: Repository<Ticket>,
    @InjectRepository(TicketComment) private readonly commentRepo: Repository<TicketComment>,
  ) {}

  async create(tenantId: string, dto: CreateTicketDto, createdBy: string): Promise<Ticket> {
    const count = await this.repo.count({ where: { tenantId } });
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    // Calculate SLA due date based on priority
    let slaDueAt: Date | null = null;
    if (dto.priorityCode) {
      const hours = SLA_HOURS[dto.priorityCode] ?? 24;
      slaDueAt = new Date(Date.now() + hours * 3600 * 1000);
    }

    const ticket = await this.repo.save(
      this.repo.create({ ...dto, tenantId, ticketNumber, slaDueAt, createdBy }),
    );
    return ticket;
  }

  async findAll(tenantId: string, params: {
    page?: number; limit?: number; search?: string;
    statusId?: string; priorityId?: string; assignedTo?: string;
    accountId?: string; slaBreached?: boolean; teamId?: string;
  }) {
    const { page = 1, limit = 20, search, statusId, priorityId, assignedTo, accountId, slaBreached, teamId } = params;
    const qb = this.repo.createQueryBuilder('t')
      .where('t.tenantId = :tenantId AND t.isActive = true', { tenantId });

    if (search) qb.andWhere('(t.subject ILIKE :s OR t.ticketNumber ILIKE :s)', { s: `%${search}%` });
    if (statusId) qb.andWhere('t.statusId = :statusId', { statusId });
    if (priorityId) qb.andWhere('t.priorityId = :priorityId', { priorityId });
    if (assignedTo) qb.andWhere('t.assignedTo = :assignedTo', { assignedTo });
    if (accountId) qb.andWhere('t.accountId = :accountId', { accountId });
    if (teamId) qb.andWhere('t.teamId = :teamId', { teamId });
    if (slaBreached !== undefined) qb.andWhere('t.slaBreached = :slaBreached', { slaBreached });

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit)
      .orderBy('t.createdAt', 'DESC').getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, ticketId: string): Promise<Ticket> {
    const ticket = await this.repo.findOne({ where: { ticketId, tenantId, isActive: true } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(tenantId: string, ticketId: string, dto: UpdateTicketDto, updatedBy: string): Promise<Ticket> {
    const ticket = await this.findOne(tenantId, ticketId);
    // Track first response
    if (!ticket.firstResponseAt && dto.statusId !== ticket.statusId) {
      dto['firstResponseAt'] = new Date();
    }
    Object.assign(ticket, dto);
    return this.repo.save(ticket);
  }

  async resolve(tenantId: string, ticketId: string, dto: ResolveTicketDto, resolvedBy: string): Promise<Ticket> {
    const ticket = await this.findOne(tenantId, ticketId);
    ticket.resolvedAt = new Date();
    ticket.resolution = dto.resolution;
    ticket.resolutionTypeId = dto.resolutionTypeId;
    return this.repo.save(ticket);
  }

  async close(tenantId: string, ticketId: string): Promise<Ticket> {
    const ticket = await this.findOne(tenantId, ticketId);
    ticket.closedAt = new Date();
    return this.repo.save(ticket);
  }

  async addComment(tenantId: string, ticketId: string, dto: AddCommentDto, createdBy: string): Promise<TicketComment> {
    await this.findOne(tenantId, ticketId);
    if (!dto.isInternal && !dto.commentText.trim()) {
      throw new BadRequestException('Comment text cannot be empty');
    }
    return this.commentRepo.save(
      this.commentRepo.create({ ticketId, ...dto, createdBy }),
    );
  }

  async getComments(tenantId: string, ticketId: string, includeInternal: boolean): Promise<TicketComment[]> {
    await this.findOne(tenantId, ticketId);
    const qb = this.commentRepo.createQueryBuilder('c')
      .where('c.ticketId = :ticketId', { ticketId });
    if (!includeInternal) qb.andWhere('c.isInternal = false');
    return qb.orderBy('c.createdAt', 'ASC').getMany();
  }

  async submitSatisfaction(tenantId: string, ticketId: string, score: number, note?: string): Promise<Ticket> {
    if (score < 1 || score > 5) throw new BadRequestException('Score must be between 1 and 5');
    const ticket = await this.findOne(tenantId, ticketId);
    ticket.satisfactionScore = score;
    ticket.satisfactionNote = note;
    return this.repo.save(ticket);
  }

  // Check and mark SLA breaches (called by a scheduled job)
  async checkSlaBreaches(tenantId: string): Promise<number> {
    const result = await this.repo.createQueryBuilder()
      .update(Ticket)
      .set({ slaBreached: true })
      .where('tenantId = :tenantId AND slaDueAt < NOW() AND slaBreached = false AND closedAt IS NULL', { tenantId })
      .execute();
    return result.affected || 0;
  }

  // Summary stats for dashboard
  async getSummary(tenantId: string) {
    const [open, breached, resolvedToday, avgResolutionHours] = await Promise.all([
      this.repo.count({ where: { tenantId, isActive: true } }),
      this.repo.count({ where: { tenantId, slaBreached: true, isActive: true } }),
      this.repo.createQueryBuilder('t')
        .where('t.tenantId = :tenantId AND DATE(t.resolvedAt) = CURRENT_DATE', { tenantId })
        .getCount(),
      this.repo.createQueryBuilder('t')
        .select("AVG(EXTRACT(EPOCH FROM (t.resolvedAt - t.createdAt))/3600)", 'avg')
        .where('t.tenantId = :tenantId AND t.resolvedAt IS NOT NULL', { tenantId })
        .getRawOne(),
    ]);
    return {
      open, breached, resolvedToday,
      avgResolutionHours: Math.round(avgResolutionHours?.avg || 0),
    };
  }

  // Ticket volume by category for reports
  async getVolumeByCategory(tenantId: string) {
    return this.repo.createQueryBuilder('t')
      .select(['t.categoryId as "categoryId"', 'COUNT(*) as count'])
      .where('t.tenantId = :tenantId AND t.isActive = true', { tenantId })
      .groupBy('t.categoryId')
      .getRawMany();
  }
}
