export declare class MasterCategory {
    categoryId: string;
    categoryCode: string;
    categoryName: string;
    categoryNameAr: string;
    moduleId: string;
    isGlobal: boolean;
    description: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    values: MasterValue[];
}
export declare class MasterValue {
    valueId: string;
    categoryId: string;
    tenantId: string;
    valueCode: string;
    valueLabel: string;
    valueLabelAr: string;
    description: string;
    colorCode: string;
    iconCode: string;
    sortOrder: number;
    isDefault: boolean;
    isSystem: boolean;
    parentValueId: string;
    metadata: Record<string, any>;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    category: MasterCategory;
}
