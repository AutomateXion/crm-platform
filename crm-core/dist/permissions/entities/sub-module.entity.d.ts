import { AppModule } from './module.entity';
export declare class SubModule {
    subModuleId: string;
    moduleId: string;
    subModuleCode: string;
    subModuleName: string;
    subModuleNameAr: string;
    sortOrder: number;
    isActive: boolean;
    module: AppModule;
    pages: Page[];
}
export declare class Page {
    pageId: string;
    subModuleId: string;
    pageCode: string;
    pageName: string;
    pageNameAr: string;
    pageRoute: string;
    sortOrder: number;
    isActive: boolean;
    subModule: SubModule;
    fields: Field[];
}
export declare class Field {
    fieldId: string;
    pageId: string;
    fieldCode: string;
    fieldLabel: string;
    fieldLabelAr: string;
    fieldType: string;
    sortOrder: number;
    isSystem: boolean;
    isActive: boolean;
    page: Page;
}
