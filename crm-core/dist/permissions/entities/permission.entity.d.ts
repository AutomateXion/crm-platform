export declare enum PermissionLevel {
    FULL_ACCESS = "FA",
    VIEW_ONLY = "VO",
    HIDDEN = "HI",
    NO_ACCESS = "NA",
    MANDATORY = "MA"
}
export declare class Permission {
    permissionId: string;
    tenantId: string;
    userGroupId: string;
    moduleId: string;
    subModuleId: string;
    pageId: string;
    fieldId: string;
    permissionLevel: PermissionLevel;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
