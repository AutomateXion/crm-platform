import { Repository } from 'typeorm';
import { Permission, PermissionLevel } from './entities/permission.entity';
import { AppModule } from './entities/module.entity';
import { SubModule, Page, Field } from './entities/sub-module.entity';
import { UserGroup } from '../users/entities/user-group.entity';
import { SetPermissionsDto } from './dto/set-permissions.dto';
export interface PermissionMap {
    modules: Record<string, ModulePermission>;
}
export interface ModulePermission {
    level: PermissionLevel;
    subModules: Record<string, SubModulePermission>;
}
export interface SubModulePermission {
    level: PermissionLevel;
    pages: Record<string, PagePermission>;
}
export interface PagePermission {
    level: PermissionLevel;
    fields: Record<string, PermissionLevel>;
}
export declare class PermissionsService {
    private readonly permissionRepo;
    private readonly moduleRepo;
    private readonly subModuleRepo;
    private readonly pageRepo;
    private readonly fieldRepo;
    private readonly userGroupRepo;
    constructor(permissionRepo: Repository<Permission>, moduleRepo: Repository<AppModule>, subModuleRepo: Repository<SubModule>, pageRepo: Repository<Page>, fieldRepo: Repository<Field>, userGroupRepo: Repository<UserGroup>);
    getPermissionMap(tenantId: string, userGroupId: string): Promise<PermissionMap>;
    setPermissions(tenantId: string, dto: SetPermissionsDto, createdBy: string): Promise<void>;
    copyPermissions(tenantId: string, sourceGroupId: string, targetGroupId: string, createdBy: string): Promise<void>;
    getModuleHierarchy(): Promise<AppModule[]>;
    getPermissionsGrid(tenantId: string, userGroupId: string): Promise<{
        group: UserGroup;
        hierarchy: AppModule[];
        permMap: {
            [k: string]: PermissionLevel;
        };
    }>;
    canAccessModule(tenantId: string, userGroupId: string, moduleCode: string): Promise<boolean>;
    invalidatePermissionCache(tenantId: string, userGroupId: string): Promise<void>;
    invalidateTenantCache(tenantId: string): Promise<void>;
}
