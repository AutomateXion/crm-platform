import { SubModule } from './sub-module.entity';
export declare class AppModule {
    moduleId: string;
    moduleCode: string;
    moduleName: string;
    moduleNameAr: string;
    moduleIcon: string;
    moduleColor: string;
    sortOrder: number;
    isCore: boolean;
    isActive: boolean;
    description: string;
    createdAt: Date;
    subModules: SubModule[];
}
