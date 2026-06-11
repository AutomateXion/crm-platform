import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccountEntity, ContactEntity } from './contacts.entity';

@UseGuards(JwtAuthGuard)
@Controller()
export class ContactsController {
  constructor(
    @InjectRepository(AccountEntity) private accountRepo: Repository<AccountEntity>,
    @InjectRepository(ContactEntity) private contactRepo: Repository<ContactEntity>,
  ) {}

  @Get('accounts')
  async getAccounts(@CurrentUser() user: any, @Query() q: any) {
    const page = parseInt(q.page) || 1;
    const limit = parseInt(q.limit) || 20;
    const qb = this.accountRepo.createQueryBuilder('a')
      .where('a.tenantId = :tid AND a.isActive = true', { tid: user.tenantId });
    if (q.search) qb.andWhere('a.accountName ILIKE :s', { s: `%${q.search}%` });
    if (q.isSupplier === 'true') qb.andWhere('a.isSupplier = true');
    if (q.isCustomer === 'true') qb.andWhere('a.isCustomer = true');
    const total = await qb.getCount();
    const data = await qb.skip((page-1)*limit).take(limit).orderBy('a.accountName','ASC').getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total/limit) };
  }

  @Post('accounts')
  async createAccount(@CurrentUser() user: any, @Body() body: any) {
    const account: any = await this.accountRepo.save(this.accountRepo.create({ ...body, tenantId: user.tenantId, createdBy: user.userId }) as any);
    // Auto-create a primary contact from the account's contactPerson
    if (body.contactPerson && body.contactPerson.trim()) {
      const parts = body.contactPerson.trim().split(' ');
      const firstName = parts.shift();
      const lastName = parts.join(' ') || null;
      try {
        await this.contactRepo.save(this.contactRepo.create({
          accountId: account.accountId,
          firstName,
          lastName,
          email: body.email || null,
          phone: body.phone || null,
          tenantId: user.tenantId,
          createdBy: user.userId,
        } as any));
      } catch (e) {
        console.warn('Could not auto-create contact:', (e as any)?.message);
      }
    }
    return account;
  }

  @Get('accounts/:id')
  async getAccount(@CurrentUser() user: any, @Param('id') id: string) {
    return this.accountRepo.findOne({ where: { accountId: id, tenantId: user.tenantId } });
  }

  @Get('accounts/:id/360')
  async get360(@CurrentUser() user: any, @Param('id') id: string) {
    const account = await this.accountRepo.findOne({ where: { accountId: id, tenantId: user.tenantId } });
    const contacts = await this.contactRepo.find({ where: { accountId: id, tenantId: user.tenantId, isActive: true } });
    return { account, contacts, notes: [], totals: { contacts: contacts.length, notes: 0 } };
  }

  @Put('accounts/:id')
  async updateAccount(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    await this.accountRepo.update(id, body);
    return this.accountRepo.findOne({ where: { accountId: id } });
  }

  @Delete('accounts/:id')
  async deleteAccount(@CurrentUser() user: any, @Param('id') id: string) {
    await this.accountRepo.update(id, { isActive: false });
    return { message: 'Account deactivated' };
  }

  @Get('contacts')
  async getContacts(@CurrentUser() user: any, @Query() q: any) {
    const page = parseInt(q.page) || 1;
    const limit = parseInt(q.limit) || 20;
    const qb = this.contactRepo.createQueryBuilder('c')
      .where('c.tenantId = :tid AND c.isActive = true', { tid: user.tenantId });
    if (q.search) qb.andWhere("(c.firstName ILIKE :s OR c.lastName ILIKE :s OR c.email ILIKE :s)", { s: `%${q.search}%` });
    if (q.accountId) qb.andWhere('c.accountId = :aid', { aid: q.accountId });
    const total = await qb.getCount();
    const data = await qb.skip((page-1)*limit).take(limit).orderBy('c.lastName','ASC').getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total/limit) };
  }

  @Post('contacts')
  async createContact(@CurrentUser() user: any, @Body() body: any) {
    return this.contactRepo.save(this.contactRepo.create({ ...body, tenantId: user.tenantId, createdBy: user.userId }));
  }

  @Get('contacts/:id')
  async getContact(@CurrentUser() user: any, @Param('id') id: string) {
    return this.contactRepo.findOne({ where: { contactId: id, tenantId: user.tenantId } });
  }

  @Put('contacts/:id')
  async updateContact(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    await this.contactRepo.update(id, body);
    return this.contactRepo.findOne({ where: { contactId: id } });
  }

  @Delete('contacts/:id')
  async deleteContact(@CurrentUser() user: any, @Param('id') id: string) {
    await this.contactRepo.update(id, { isActive: false });
    return { message: 'Contact deactivated' };
  }
}
