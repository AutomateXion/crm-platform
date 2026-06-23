import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { UserGroup } from './entities/user-group.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { AuditService } from '../audit/audit.service';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepo: Repository<UserGroup>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly auditService: AuditService,
  ) {}

  // ═══════════════════════════════════════════════════════════════
  // USER GROUPS
  // ═══════════════════════════════════════════════════════════════

  async createUserGroup(tenantId: string, dto: CreateUserGroupDto, createdBy: string): Promise<UserGroup> {
    const existing = await this.userGroupRepo.findOne({
      where: { tenantId, groupCode: dto.groupCode.toUpperCase() },
    });
    if (existing) throw new ConflictException(`Group code '${dto.groupCode}' already exists`);

    const group = this.userGroupRepo.create({
      tenantId,
      groupCode: dto.groupCode.toUpperCase(),
      groupName: dto.groupName,
      groupNameAr: dto.groupNameAr,
      description: dto.description,
      isSystemGroup: false,
    });

    const saved = await this.userGroupRepo.save(group);

    await this.auditService.log({
      tenantId, userId: createdBy, userName: '',
      module: 'core', action: 'CREATE',
      entityType: 'user_group', entityId: saved.userGroupId,
      entityLabel: saved.groupName,
    });

    return saved;
  }

  async getUserGroups(tenantId: string): Promise<UserGroup[]> {
    return this.userGroupRepo.find({
      where: { tenantId, isActive: true },
      order: { groupName: 'ASC' },
    });
  }

  async getUserGroup(tenantId: string, userGroupId: string): Promise<UserGroup> {
    const group = await this.userGroupRepo.findOne({ where: { userGroupId, tenantId } });
    if (!group) throw new NotFoundException('User group not found');
    return group;
  }

  async updateUserGroup(
    tenantId: string, userGroupId: string,
    dto: UpdateUserGroupDto, updatedBy: string,
  ): Promise<UserGroup> {
    const group = await this.getUserGroup(tenantId, userGroupId);
    if (group.isSystemGroup) throw new ForbiddenException('System groups cannot be modified');

    Object.assign(group, dto);
    const saved = await this.userGroupRepo.save(group);

    await this.auditService.log({
      tenantId, userId: updatedBy, userName: '',
      module: 'core', action: 'UPDATE',
      entityType: 'user_group', entityId: userGroupId,
      entityLabel: group.groupName,
    });

    return saved;
  }

  async deleteUserGroup(tenantId: string, userGroupId: string, deletedBy: string): Promise<void> {
    const group = await this.getUserGroup(tenantId, userGroupId);
    if (group.isSystemGroup) throw new ForbiddenException('System groups cannot be deleted');

    const userCount = await this.userRepo.count({ where: { tenantId, userGroupId } });
    if (userCount > 0) {
      throw new BadRequestException(`Cannot delete: ${userCount} users are assigned to this group`);
    }

    await this.userGroupRepo.update(userGroupId, { isActive: false });

    await this.auditService.log({
      tenantId, userId: deletedBy, userName: '',
      module: 'core', action: 'DELETE',
      entityType: 'user_group', entityId: userGroupId,
      entityLabel: group.groupName,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════

  async createUser(tenantId: string, dto: CreateUserDto, createdBy: string): Promise<User> {
    // Check tenant user limit
    const tenant = await this.tenantRepo.findOne({ where: { tenantId } });
    const userCount = await this.userRepo.count({ where: { tenantId, isActive: true } });
    if (userCount >= tenant.maxUsers) {
      throw new ForbiddenException(
        `User limit reached (${tenant.maxUsers}). Please upgrade your plan.`,
      );
    }

    // Check email uniqueness
    const existing = await this.userRepo.findOne({
      where: { tenantId, email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already in use');

    // Validate user group belongs to tenant
    const group = await this.userGroupRepo.findOne({
      where: { userGroupId: dto.userGroupId, tenantId },
    });
    if (!group) throw new NotFoundException('User group not found');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      tenantId,
      userGroupId: dto.userGroupId,
      email: dto.email.toLowerCase(),
      fullName: dto.fullName,
      fullNameAr: dto.fullNameAr,
      phone: dto.phone,
      language: dto.language || 'en',
      timezone: dto.timezone,
      passwordHash,
      isActive: true,
      createdBy,
    });

    const saved = await this.userRepo.save(user);

    await this.auditService.log({
      tenantId, userId: createdBy, userName: '',
      module: 'core', action: 'CREATE',
      entityType: 'user', entityId: saved.userId,
      entityLabel: saved.email,
    });

    // Remove sensitive fields before returning
    delete saved.passwordHash;
    return saved;
  }

  async getUsers(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    userGroupId?: string,
    isActive?: boolean,
  ): Promise<PaginatedResult<User>> {
    const query = this.userRepo.createQueryBuilder('u')
      .leftJoinAndSelect('u.userGroup', 'ug')
      .where('u.tenantId = :tenantId', { tenantId })
      .select([
        'u.userId', 'u.email', 'u.fullName', 'u.fullNameAr',
        'u.phone', 'u.avatarUrl', 'u.isActive', 'u.userGroupId',
        'u.lastLogin', 'u.createdAt', 'u.language', 'u.timezone',
        'u.lockedUntil', 'u.failedLoginCount',
        'ug.userGroupId', 'ug.groupName', 'ug.groupCode',
      ]);

    if (search) {
      query.andWhere(
        '(u.fullName ILIKE :search OR u.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (userGroupId) query.andWhere('u.userGroupId = :userGroupId', { userGroupId });
    if (isActive !== undefined) query.andWhere('u.isActive = :isActive', { isActive });

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('u.fullName', 'ASC')
      .getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUser(tenantId: string, userId: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { userId, tenantId },
      relations: ['userGroup'],
      select: {
        userId: true, email: true, fullName: true, fullNameAr: true,
        phone: true, avatarUrl: true, isActive: true, userGroupId: true,
        language: true, timezone: true, twoFactorEnabled: true,
        lastLogin: true, loginCount: true, createdAt: true, updatedAt: true,
        userGroup: { userGroupId: true, groupName: true, groupCode: true },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(
    tenantId: string, userId: string,
    dto: UpdateUserDto, updatedBy: string,
  ): Promise<User> {
    const user = await this.getUser(tenantId, userId);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { tenantId, email: dto.email.toLowerCase() },
      });
      if (existing) throw new ConflictException('Email already in use');
      dto.email = dto.email.toLowerCase();
    }

    if (dto.userGroupId) {
      const group = await this.userGroupRepo.findOne({
        where: { userGroupId: dto.userGroupId, tenantId },
      });
      if (!group) throw new NotFoundException('User group not found');
    }

    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);

    await this.auditService.log({
      tenantId, userId: updatedBy, userName: '',
      module: 'core', action: 'UPDATE',
      entityType: 'user', entityId: userId,
      entityLabel: user.email,
      changes: Object.keys(dto).map(field => ({ field, oldValue: '', newValue: dto[field] })),
    });

    return saved;
  }

  async unlockUser(
    tenantId: string, userId: string, unlockedBy: string,
  ): Promise<void> {
    await this.getUser(tenantId, userId);
    await this.userRepo.update(userId, { failedLoginCount: 0, lockedUntil: null });

    await this.auditService.log({
      tenantId, userId: unlockedBy, userName: '',
      module: 'core', action: 'UPDATE',
      entityType: 'user', entityId: userId,
    });
  }

  async resetPassword(
    tenantId: string, userId: string,
    newPassword: string, resetBy: string,
  ): Promise<void> {
    await this.getUser(tenantId, userId);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, { passwordHash, failedLoginCount: 0, lockedUntil: null });

    await this.auditService.log({
      tenantId, userId: resetBy, userName: '',
      module: 'core', action: 'UPDATE',
      entityType: 'user', entityId: userId,
      entityLabel: 'Password Reset',
    });
  }

  async toggleUserStatus(
    tenantId: string, userId: string, isActive: boolean, updatedBy: string,
  ): Promise<void> {
    await this.getUser(tenantId, userId);
    await this.userRepo.update(userId, { isActive });

    await this.auditService.log({
      tenantId, userId: updatedBy, userName: '',
      module: 'core', action: 'UPDATE',
      entityType: 'user', entityId: userId,
      entityLabel: isActive ? 'User Activated' : 'User Deactivated',
    });
  }

  async changeOwnPassword(
    userId: string, currentPassword: string, newPassword: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { userId },
      select: ['userId', 'passwordHash'],
    });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, { passwordHash });
  }
}
