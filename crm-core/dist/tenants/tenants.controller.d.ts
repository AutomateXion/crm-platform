import { TenantsService } from './tenants.service';
import { User } from '../users/entities/user.entity';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getMyTenant(user: User): Promise<import("./entities/tenant.entity").Tenant>;
    updateTenant(user: User, dto: UpdateTenantDto): Promise<import("./entities/tenant.entity").Tenant>;
    updateModules(user: User, modules: string[]): Promise<import("./entities/tenant.entity").Tenant>;
    getCompanySettings(user: User): Promise<import("./entities/tenant.entity").Tenant>;
    updateCompanySettings(user: User, dto: any): Promise<import("./entities/tenant.entity").Tenant>;
    getAccountingConfig(user: User): Promise<any>;
    saveAccountingConfig(user: User, dto: any): Promise<{
        success: boolean;
        config: any;
    }>;
    getEmailConfig(user: User): Promise<any>;
    saveEmailConfig(user: User, dto: any): Promise<{
        success: boolean;
        config: any;
    }>;
    testEmailConfig(user: User, dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    provisionTenant(dto: CreateTenantDto): Promise<{
        tenant: import("./entities/tenant.entity").Tenant;
        adminUser: User;
    }>;
}
