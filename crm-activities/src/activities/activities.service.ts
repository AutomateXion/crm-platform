import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity) private readonly repo: Repository<Activity>,
  ) {}

  async create(tenantId: string, dto: CreateActivityDto, createdBy: string): Promise<Activity> {
    return this.repo.save(this.repo.create({ ...dto, tenantId, createdBy }));
  }

  async findAll(tenantId: string, params: {
    page?: number; limit?: number;
    assignedTo?: string; status?: string; typeId?: string;
    relatedToType?: string; relatedToId?: string;
    from?: Date; to?: Date; overdue?: boolean;
  }) {
    const { page = 1, limit = 50, assignedTo, status, typeId, relatedToType, relatedToId, from, to, overdue } = params;
    const qb = this.repo.createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId });

    if (assignedTo) qb.andWhere('a.assignedTo = :assignedTo', { assignedTo });
    if (status) qb.andWhere('a.status = :status', { status });
    if (typeId) qb.andWhere('a.activityTypeId = :typeId', { typeId });
    if (relatedToType) qb.andWhere('a.relatedToType = :relatedToType', { relatedToType });
    if (relatedToId) qb.andWhere('a.relatedToId = :relatedToId', { relatedToId });
    if (from) qb.andWhere('a.dueDate >= :from', { from });
    if (to) qb.andWhere('a.dueDate <= :to', { to });
    if (overdue) {
      qb.andWhere("a.dueDate < NOW() AND a.status = 'PLANNED'");
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit)
      .orderBy('a.dueDate', 'ASC').getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, activityId: string): Promise<Activity> {
    const a = await this.repo.findOne({ where: { activityId, tenantId } });
    if (!a) throw new NotFoundException('Activity not found');
    return a;
  }

  async update(tenantId: string, activityId: string, dto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(tenantId, activityId);
    Object.assign(activity, dto);
    if (dto.status === 'COMPLETED' && !activity.completedDate) {
      activity.completedDate = new Date();
    }
    return this.repo.save(activity);
  }

  async complete(tenantId: string, activityId: string, outcomeId: string): Promise<Activity> {
    return this.update(tenantId, activityId, { status: 'COMPLETED', outcomeId, completedDate: new Date() } as any);
  }

  async remove(tenantId: string, activityId: string): Promise<void> {
    await this.findOne(tenantId, activityId);
    await this.repo.delete(activityId);
  }

  // Calendar view: get activities for a date range
  async getCalendar(tenantId: string, start: Date, end: Date, assignedTo?: string) {
    const qb = this.repo.createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId })
      .andWhere('a.dueDate BETWEEN :start AND :end', { start, end });
    if (assignedTo) qb.andWhere('a.assignedTo = :assignedTo', { assignedTo });
    return qb.orderBy('a.dueDate', 'ASC').getMany();
  }

  // Summary stats per user (used in dashboard)
  async getSummary(tenantId: string, userId?: string) {
    const qb = this.repo.createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId });
    if (userId) qb.andWhere('a.assignedTo = :userId', { userId });

    const [planned, overdue, completedToday] = await Promise.all([
      qb.clone().andWhere("a.status = 'PLANNED'").getCount(),
      qb.clone().andWhere("a.status = 'PLANNED' AND a.dueDate < NOW()").getCount(),
      qb.clone().andWhere("a.status = 'COMPLETED' AND DATE(a.completedDate) = CURRENT_DATE").getCount(),
    ]);

    return { planned, overdue, completedToday };
  }
}
