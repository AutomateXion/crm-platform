export declare class CreateMasterValueDto {
    valueCode: string;
    valueLabel: string;
    valueLabelAr?: string;
    description?: string;
    colorCode?: string;
    iconCode?: string;
    isDefault?: boolean;
    parentValueId?: string;
    sortOrder?: number;
    metadata?: Record<string, any>;
}
export declare class UpdateMasterValueDto {
    valueLabel?: string;
    valueLabelAr?: string;
    description?: string;
    colorCode?: string;
    iconCode?: string;
    isDefault?: boolean;
    sortOrder?: number;
    isActive?: boolean;
    metadata?: Record<string, any>;
}
export declare class ReorderMasterValuesDto {
    items: {
        valueId: string;
        sortOrder: number;
    }[];
}
export declare class BulkGetValuesDto {
    categoryCodes: string[];
}
