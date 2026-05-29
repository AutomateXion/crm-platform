import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindManyOptions } from 'typeorm';
import { Account, AccountNote } from './entities/account.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account) private readonly accountRepo: Repository<Account>,
    @InjectRepository(AccountNote) private readonly noteRepo: Repository<AccountNote>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
  ) {}

  async create(tenantId: string, dto: CreateAccountDto, createdBy: string): Promise<Account> {
    const account = this.accountRepo.create({ ...dto, tenantId, createdBy });
    return this.accountRepo.save(account);
  }

  async findAll(tenantId: string, params: {
    page?: number; limit?: number; search?: string;
    accountTypeId?: string; industryId?: string; assignedTo?: string;
  }) {
    const { page = 1, limit = 20, search, accountTypeId, industryId, assignedTo } = params;

    const qb = this.accountRepo.createQueryBuilder('a')
      .where('a.tenantId = :tenantId AND a.isActive = true', { tenantId });

    if (search) qb.andWhere('a.accountName ILIKE :s OR a.email ILIKE :s', { s: `%${search}%` });
    if (accountTypeId) qb.andWhere('a.accountTypeId = :accountTypeId', { accountTypeId });
    if (industryId) qb.andWhere('a.industryId = :industryId', { industryId });
    if (assignedTo) qb.andWhere('a.assignedTo = :assignedTo', { assignedTo });

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit)
      .orderBy('a.accountName', 'ASC').getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, accountId: string): Promise<Account> {
    const account = await this.accountRepo.findOne({ where: { accountId, tenantId, isActive: true } });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  // 360° view: account + all related records
  async get360View(tenantId: string, accountId: string) {
    const account = await this.findOne(tenantId, accountId);
    const [contacts, notes] = await Promise.all([
      this.contactRepo.find({ where: { tenantId, accountId, isActive: true }, order: { isPrimary: 'DESC', firstName: 'ASC' } }),
      this.noteRepo.find({ where: { tenantId, accountId }, order: { isPinned: 'DESC', createdAt: 'DESC' } }),
    ]);
    return { account, contacts, notes, totals: { contacts: contacts.length, notes: notes.length } };
  }

  async update(tenantId: string, accountId: string, dto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(tenantId, accountId);
    Object.assign(account, dto);
    return this.accountRepo.save(account);
  }

  async remove(tenantId: string, accountId: string): Promise<void> {
    await this.findOne(tenantId, accountId);
    await this.accountRepo.update(accountId, { isActive: false });
  }

  async addNote(tenantId: string, accountId: string, dto: CreateNoteDto, createdBy: string): Promise<AccountNote> {
    await this.findOne(tenantId, accountId);
    return this.noteRepo.save(this.noteRepo.create({ ...dto, tenantId, accountId, createdBy }));
  }

  async getNotes(tenantId: string, accountId: string): Promise<AccountNote[]> {
    return this.noteRepo.find({
      where: { tenantId, accountId },
      order: { isPinned: 'DESC', createdAt: 'DESC' },
    });
  }

  async findDuplicates(tenantId: string, accountName: string): Promise<Account[]> {
    return this.accountRepo.find({
      where: { tenantId, accountName: ILike(`%${accountName}%`), isActive: true },
      take: 5,
    });
  }
}
