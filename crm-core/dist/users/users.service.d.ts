import { Repository } from 'typeorm';
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
export declare class UsersService {
    private readonly userRepo;
    private readonly userGroupRepo;
    private readonly tenantRepo;
    private readonly auditService;
    constructor(userRepo: Repository<User>, userGroupRepo: Repository<UserGroup>, tenantRepo: Repository<Tenant>, auditService: AuditService);
    createUserGroup(tenantId: string, dto: CreateUserGroupDto, createdBy: string): Promise<UserGroup>;
    getUserGroups(tenantId: string): Promise<UserGroup[]>;
    getUserGroup(tenantId: string, userGroupId: string): Promise<UserGroup>;
    updateUserGroup(tenantId: string, userGroupId: string, dto: UpdateUserGroupDto, updatedBy: string): Promise<UserGroup>;
    deleteUserGroup(tenantId: string, userGroupId: string, deletedBy: string): Promise<void>;
    createUser(tenantId: string, dto: CreateUserDto, createdBy: string): Promise<User>;
    getUsers(tenantId: string, page?: number, limit?: number, search?: string, userGroupId?: string, isActive?: boolean): Promise<PaginatedResult<User>>;
    getUser(tenantId: string, userId: string): Promise<User>;
    updateUser(tenantId: string, userId: string, dto: UpdateUserDto, updatedBy: string): Promise<User>;
    resetPassword(tenantId: string, userId: string, newPassword: string, resetBy: string): Promise<void>;
    toggleUserStatus(tenantId: string, userId: string, isActive: boolean, updatedBy: string): Promise<void>;
    changeOwnPassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
