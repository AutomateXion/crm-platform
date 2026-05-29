import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UserGroup } from '../users/entities/user-group.entity';
import { User } from '../users/entities/user.entity';
export declare class TenantsService {
    private readonly tenantRepo;
    private readonly groupRepo;
    private readonly userRepo;
    constructor(tenantRepo: Repository<Tenant>, groupRepo: Repository<UserGroup>, userRepo: Repository<User>);
    getTenant(tenantId: string): Promise<Tenant>;
    updateTenant(tenantId: string, dto: UpdateTenantDto): Promise<Tenant>;
    updateActiveModules(tenantId: string, modules: string[]): Promise<Tenant>;
    createTenant(dto: CreateTenantDto): Promise<{
        tenant: Tenant;
        adminUser: User;
    }>;
    getAllTenants(): Promise<Tenant[]>;
}
