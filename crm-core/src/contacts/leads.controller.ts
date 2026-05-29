import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LeadEntity, ContactEntity } from './contacts.entity';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(
    @InjectRepository(LeadEntity) private repo: Repository<LeadEntity>,
    @InjectRepository(ContactEntity) private contactRepo: Repository<ContactEntity>,
  ) {}

  @Get()
  async getAll(@CurrentUser() user: any, @Query() q: any) {
    const page = parseInt(q.page) || 1;
    const limit = parseInt(q.limit) || 20;
    const qb = this.repo.createQueryBuilder('l')
      .where('l.tenantId = :tid AND l.isActive = true', { tid: user.tenantId });
    if (q.search) {
      qb.andWhere('(l.firstName ILIKE :s OR l.lastName ILIKE :s OR l.companyName ILIKE :s OR l.email ILIKE :s)', { s: `%${q.search}%` });
    }
    if (q.leadStatusCode) qb.andWhere('l.leadStatusCode = :status', { status: q.leadStatusCode });
    if (q.accountId) qb.andWhere('l.accountId = :accountId', { accountId: q.accountId });
    if (q.converted === 'false') qb.andWhere('l.converted = false');
    const total = await qb.getCount();
    const data = await qb.skip((page-1)*limit).take(limit).orderBy('l.createdAt','DESC').getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total/limit) };
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    const count = await this.repo.count({ where: { tenantId: user.tenantId } });
    const leadNumber = `LEAD-${new Date().getFullYear()}-${String(count+1).padStart(5,'0')}`;
    return this.repo.save(this.repo.create({ ...body, tenantId: user.tenantId, leadNumber, createdBy: user.userId }));
  }

  @Get(':id')
  async getOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.repo.findOne({ where: { leadId: id, tenantId: user.tenantId } });
  }

  @Put(':id')
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    await this.repo.update(id, body);
    const lead = await this.repo.findOne({ where: { leadId: id } });

    // Sync changes to linked contact if exists
    if (lead && lead.contactId) {
      try {
        const parts = ([lead.firstName, lead.lastName].filter(Boolean).join(' ')).split(' ');
        await this.contactRepo.update(lead.contactId, {
          firstName: lead.firstName || undefined,
          lastName: lead.lastName || undefined,
          email: lead.email || undefined,
          mobile: lead.phone || undefined,
          jobTitle: lead.jobTitle || undefined,
        });
      } catch (e) {
        // Non-critical — log but don't fail
        console.warn('Contact sync failed:', e.message);
      }
    }

    return lead;
  }

  @Patch(':id')
  async patch(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    await this.repo.update(id, body);
    return this.repo.findOne({ where: { leadId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    await this.repo.update(id, { isActive: false });
    return { message: 'Lead deleted' };
  }
}
