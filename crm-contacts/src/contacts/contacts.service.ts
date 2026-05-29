import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from '../accounts/dto/create-account.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) private readonly repo: Repository<Contact>,
  ) {}

  async create(tenantId: string, dto: CreateContactDto, createdBy: string): Promise<Contact> {
    return this.repo.save(this.repo.create({ ...dto, tenantId, createdBy }));
  }

  async findAll(tenantId: string, params: {
    page?: number; limit?: number; search?: string;
    accountId?: string; assignedTo?: string; doNotContact?: boolean;
  }) {
    const { page = 1, limit = 20, search, accountId, assignedTo, doNotContact } = params;
    const qb = this.repo.createQueryBuilder('c')
      .where('c.tenantId = :tenantId AND c.isActive = true', { tenantId });

    if (search) {
      qb.andWhere(
        "(c.firstName || ' ' || c.lastName ILIKE :s OR c.email ILIKE :s OR c.phone ILIKE :s)",
        { s: `%${search}%` },
      );
    }
    if (accountId) qb.andWhere('c.accountId = :accountId', { accountId });
    if (assignedTo) qb.andWhere('c.assignedTo = :assignedTo', { assignedTo });
    if (doNotContact !== undefined) qb.andWhere('c.doNotContact = :dnc', { dnc: doNotContact });

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit).take(limit)
      .orderBy('c.lastName', 'ASC').addOrderBy('c.firstName', 'ASC')
      .getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, contactId: string): Promise<Contact> {
    const c = await this.repo.findOne({ where: { contactId, tenantId, isActive: true } });
    if (!c) throw new NotFoundException('Contact not found');
    return c;
  }

  async update(tenantId: string, contactId: string, dto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(tenantId, contactId);
    Object.assign(contact, dto);
    return this.repo.save(contact);
  }

  async remove(tenantId: string, contactId: string): Promise<void> {
    await this.findOne(tenantId, contactId);
    await this.repo.update(contactId, { isActive: false });
  }
}
