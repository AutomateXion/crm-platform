"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("./entities/user.entity");
const user_group_entity_1 = require("./entities/user-group.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const audit_service_1 = require("../audit/audit.service");
let UsersService = class UsersService {
    constructor(userRepo, userGroupRepo, tenantRepo, auditService) {
        this.userRepo = userRepo;
        this.userGroupRepo = userGroupRepo;
        this.tenantRepo = tenantRepo;
        this.auditService = auditService;
    }
    async createUserGroup(tenantId, dto, createdBy) {
        const existing = await this.userGroupRepo.findOne({
            where: { tenantId, groupCode: dto.groupCode.toUpperCase() },
        });
        if (existing)
            throw new common_1.ConflictException(`Group code '${dto.groupCode}' already exists`);
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
    async getUserGroups(tenantId) {
        return this.userGroupRepo.find({
            where: { tenantId, isActive: true },
            order: { groupName: 'ASC' },
        });
    }
    async getUserGroup(tenantId, userGroupId) {
        const group = await this.userGroupRepo.findOne({ where: { userGroupId, tenantId } });
        if (!group)
            throw new common_1.NotFoundException('User group not found');
        return group;
    }
    async updateUserGroup(tenantId, userGroupId, dto, updatedBy) {
        const group = await this.getUserGroup(tenantId, userGroupId);
        if (group.isSystemGroup)
            throw new common_1.ForbiddenException('System groups cannot be modified');
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
    async deleteUserGroup(tenantId, userGroupId, deletedBy) {
        const group = await this.getUserGroup(tenantId, userGroupId);
        if (group.isSystemGroup)
            throw new common_1.ForbiddenException('System groups cannot be deleted');
        const userCount = await this.userRepo.count({ where: { tenantId, userGroupId } });
        if (userCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete: ${userCount} users are assigned to this group`);
        }
        await this.userGroupRepo.update(userGroupId, { isActive: false });
        await this.auditService.log({
            tenantId, userId: deletedBy, userName: '',
            module: 'core', action: 'DELETE',
            entityType: 'user_group', entityId: userGroupId,
            entityLabel: group.groupName,
        });
    }
    async createUser(tenantId, dto, createdBy) {
        const tenant = await this.tenantRepo.findOne({ where: { tenantId } });
        const userCount = await this.userRepo.count({ where: { tenantId, isActive: true } });
        if (userCount >= tenant.maxUsers) {
            throw new common_1.ForbiddenException(`User limit reached (${tenant.maxUsers}). Please upgrade your plan.`);
        }
        const existing = await this.userRepo.findOne({
            where: { tenantId, email: dto.email.toLowerCase() },
        });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const group = await this.userGroupRepo.findOne({
            where: { userGroupId: dto.userGroupId, tenantId },
        });
        if (!group)
            throw new common_1.NotFoundException('User group not found');
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
        delete saved.passwordHash;
        return saved;
    }
    async getUsers(tenantId, page = 1, limit = 20, search, userGroupId, isActive) {
        const query = this.userRepo.createQueryBuilder('u')
            .leftJoinAndSelect('u.userGroup', 'ug')
            .where('u.tenantId = :tenantId', { tenantId })
            .select([
            'u.userId', 'u.email', 'u.fullName', 'u.fullNameAr',
            'u.phone', 'u.avatarUrl', 'u.isActive', 'u.userGroupId',
            'u.lastLogin', 'u.createdAt', 'u.language', 'u.timezone',
            'ug.userGroupId', 'ug.groupName', 'ug.groupCode',
        ]);
        if (search) {
            query.andWhere('(u.fullName ILIKE :search OR u.email ILIKE :search)', { search: `%${search}%` });
        }
        if (userGroupId)
            query.andWhere('u.userGroupId = :userGroupId', { userGroupId });
        if (isActive !== undefined)
            query.andWhere('u.isActive = :isActive', { isActive });
        const total = await query.getCount();
        const data = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('u.fullName', 'ASC')
            .getMany();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getUser(tenantId, userId) {
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
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateUser(tenantId, userId, dto, updatedBy) {
        const user = await this.getUser(tenantId, userId);
        if (dto.email && dto.email !== user.email) {
            const existing = await this.userRepo.findOne({
                where: { tenantId, email: dto.email.toLowerCase() },
            });
            if (existing)
                throw new common_1.ConflictException('Email already in use');
            dto.email = dto.email.toLowerCase();
        }
        if (dto.userGroupId) {
            const group = await this.userGroupRepo.findOne({
                where: { userGroupId: dto.userGroupId, tenantId },
            });
            if (!group)
                throw new common_1.NotFoundException('User group not found');
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
    async resetPassword(tenantId, userId, newPassword, resetBy) {
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
    async toggleUserStatus(tenantId, userId, isActive, updatedBy) {
        await this.getUser(tenantId, userId);
        await this.userRepo.update(userId, { isActive });
        await this.auditService.log({
            tenantId, userId: updatedBy, userName: '',
            module: 'core', action: 'UPDATE',
            entityType: 'user', entityId: userId,
            entityLabel: isActive ? 'User Activated' : 'User Deactivated',
        });
    }
    async changeOwnPassword(userId, currentPassword, newPassword) {
        const user = await this.userRepo.findOne({
            where: { userId },
            select: ['userId', 'passwordHash'],
        });
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid)
            throw new common_1.BadRequestException('Current password is incorrect');
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.userRepo.update(userId, { passwordHash });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_group_entity_1.UserGroup)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map