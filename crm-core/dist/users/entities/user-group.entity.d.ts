import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class UserGroup {
    userGroupId: string;
    tenantId: string;
    groupCode: string;
    groupName: string;
    groupNameAr: string;
    isSystemGroup: boolean;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    tenant: Tenant;
}
