import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomerVisitEntity } from './contacts.entity';

@UseGuards(JwtAuthGuard)
@Controller('visits')
export class VisitsController {
  constructor(
    @InjectRepository(CustomerVisitEntity) private visitRepo: Repository<CustomerVisitEntity>,
  ) {}

  @Get()
  async getVisits(@Request() req: any, @Query() q: any) {
    const tid = req.user.tenantId;
    const qb = this.visitRepo.createQueryBuilder('v').where('v.tenantId = :tid', { tid });
    if (q.salesmanId) qb.andWhere('v.salesmanId = :sid', { sid: q.salesmanId });
    if (q.accountId) qb.andWhere('v.accountId = :aid', { aid: q.accountId });
    if (q.status) qb.andWhere('v.status = :status', { status: q.status });
    if (q.from) qb.andWhere('v.visitDate >= :from', { from: q.from });
    if (q.to) qb.andWhere('v.visitDate <= :to', { to: q.to });
    qb.orderBy('v.visitDate', 'DESC').skip(((+q.page||1) - 1) * (+q.limit||20)).take(+q.limit||20);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  @Get('my-visits')
  async getMyVisits(@Request() req: any) {
    const tid = req.user.tenantId;
    const today = new Date();
    today.setHours(0,0,0,0);
    return this.visitRepo.createQueryBuilder('v')
      .where('v.tenantId = :tid AND v.salesmanId = :sid AND v.visitDate >= :today',
        { tid, sid: req.user.userId, today })
      .orderBy('v.visitDate', 'DESC').getMany();
  }

  @Get('stats')
  async getVisitStats(@Request() req: any, @Query() q: any) {
    const tid = req.user.tenantId;
    const total = await this.visitRepo.count({ where: { tenantId: tid } as any });
    const today = new Date(); today.setHours(0,0,0,0);
    const todayCount = await this.visitRepo.createQueryBuilder('v')
      .where('v.tenantId = :tid AND v.visitDate >= :today', { tid, today }).getCount();
    const byStatus = await this.visitRepo.createQueryBuilder('v')
      .select('v.status', 'status').addSelect('COUNT(*)', 'count')
      .where('v.tenantId = :tid', { tid }).groupBy('v.status').getRawMany();
    const bySalesman = await this.visitRepo.createQueryBuilder('v')
      .select('v.salesmanName', 'name').addSelect('COUNT(*)', 'count')
      .where('v.tenantId = :tid', { tid }).groupBy('v.salesmanName')
      .orderBy('COUNT(*)', 'DESC').limit(10).getRawMany();
    return { total, todayCount, byStatus, bySalesman };
  }

  @Post()
  async checkIn(@Request() req: any, @Body() dto: any) {
    const visit = this.visitRepo.create({
      ...dto,
      tenantId: req.user.tenantId,
      salesmanId: dto.salesmanId || req.user.userId,
      salesmanName: dto.salesmanName || req.user.fullName,
      visitDate: new Date(),
      status: 'CHECKED_IN',
    });
    return this.visitRepo.save(visit);
  }

  @Patch(':id/checkout')
  async checkOut(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    const visit = await this.visitRepo.findOne({ where: { visitId: id, tenantId: req.user.tenantId } as any });
    if (!visit) return { error: 'Not found' };
    const checkOutTime = new Date();
    const durationMinutes = Math.round((checkOutTime.getTime() - new Date(visit.visitDate).getTime()) / 60000);
    await this.visitRepo.update({ visitId: id } as any, {
      checkOutTime, durationMinutes, status: 'COMPLETED',
      outcome: dto.outcome, notes: dto.notes, nextAction: dto.nextAction, photos: dto.photos || [],
    } as any);
    return this.visitRepo.findOne({ where: { visitId: id } as any });
  }

  @Put(':id')
  async updateVisit(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    await this.visitRepo.update({ visitId: id, tenantId: req.user.tenantId } as any, dto);
    return this.visitRepo.findOne({ where: { visitId: id } as any });
  }

  @Delete(':id')
  async deleteVisit(@Request() req: any, @Param('id') id: string) {
    await this.visitRepo.delete({ visitId: id, tenantId: req.user.tenantId } as any);
    return { success: true };
  }
}
