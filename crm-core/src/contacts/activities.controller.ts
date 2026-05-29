import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ActivityEntity } from './contacts.entity';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(@InjectRepository(ActivityEntity) private repo: Repository<ActivityEntity>) {}

  @Get()
  async getAll(@CurrentUser() user: any, @Query() q: any) {
    const page = parseInt(q.page) || 1;
    const limit = parseInt(q.limit) || 50;
    const qb = this.repo.createQueryBuilder('a').where('a.tenantId = :tid', { tid: user.tenantId });
    if (q.status) qb.andWhere('a.status = :status', { status: q.status });
    if (q.activityType) qb.andWhere('a.activityType = :type', { type: q.activityType });
    if (q.assignedTo) qb.andWhere('a.assignedTo = :uid', { uid: q.assignedTo });
    if (q.relatedToType) qb.andWhere('a.relatedToType = :rtype', { rtype: q.relatedToType });
    if (q.relatedToId) qb.andWhere('a.relatedToId = :rid', { rid: q.relatedToId });
    if (q.overdue === 'true') qb.andWhere("a.dueDate < NOW() AND a.status = 'PLANNED'");
    if (q.today === 'true') qb.andWhere("DATE(a.dueDate) = CURRENT_DATE");
    if (q.from) qb.andWhere('a.dueDate >= :from', { from: q.from });
    if (q.to) qb.andWhere('a.dueDate <= :to', { to: q.to });
    const total = await qb.getCount();
    const data = await qb.skip((page-1)*limit).take(limit).orderBy('a.dueDate','ASC').getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total/limit) };
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    return this.repo.save(this.repo.create({
      ...body, tenantId: user.tenantId,
      createdBy: user.userId, createdByName: user.fullName,
    }));
  }

  @Get('summary')
  async getSummary(@CurrentUser() user: any) {
    const tid = user.tenantId;
    const [planned, overdue, today, completed] = await Promise.all([
      this.repo.createQueryBuilder('a').where("a.tenantId = :tid AND a.status = 'PLANNED'", { tid }).getCount(),
      this.repo.createQueryBuilder('a').where("a.tenantId = :tid AND a.status = 'PLANNED' AND a.dueDate < NOW()", { tid }).getCount(),
      this.repo.createQueryBuilder('a').where("a.tenantId = :tid AND DATE(a.dueDate) = CURRENT_DATE", { tid }).getCount(),
      this.repo.createQueryBuilder('a').where("a.tenantId = :tid AND a.status = 'COMPLETED' AND DATE(a.completedDate) = CURRENT_DATE", { tid }).getCount(),
    ]);
    return { planned, overdue, today, completed };
  }

  @Get(':id')
  async getOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.repo.findOne({ where: { activityId: id, tenantId: user.tenantId } });
  }

  @Put(':id')
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    await this.repo.update(id, body);
    return this.repo.findOne({ where: { activityId: id } });
  }

  @Patch(':id/complete')
  async complete(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    await this.repo.update(id, { status: 'COMPLETED', completedDate: new Date(), outcome: body.outcome || 'COMPLETED' });
    return this.repo.findOne({ where: { activityId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    await this.repo.delete(id);
    return { message: 'Activity deleted' };
  }
}
