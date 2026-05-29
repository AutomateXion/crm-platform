import { PermissionLevel } from '../entities/permission.entity';
export declare class PermissionEntryDto {
    moduleId?: string;
    subModuleId?: string;
    pageId?: string;
    fieldId?: string;
    permissionLevel: PermissionLevel;
}
export declare class SetPermissionsDto {
    userGroupId: string;
    permissions: PermissionEntryDto[];
}
