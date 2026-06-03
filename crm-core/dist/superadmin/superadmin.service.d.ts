import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
export declare class SuperAdminService {
    private tenantRepo;
    private userRepo;
    constructor(tenantRepo: Repository<Tenant>, userRepo: Repository<User>);
    getDashboard(): Promise<{
        totalTenants: number;
        activeTenants: number;
        suspendedTenants: number;
        totalUsers: number;
        activeUsers: number;
        planCounts: any;
        totalInvoices: number;
        recentTenants: Tenant[];
    }>;
    getTenants(search?: string, plan?: string, status?: string): Promise<{
        userCount: any;
        invoiceCount: any;
        tenantId: string;
        tenantCode: string;
        companyName: string;
        domain: string;
        subscriptionPlan: string;
        activeModules: string[];
        timezone: string;
        dateFormat: string;
        currencyCode: string;
        logoUrl: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        country: string;
        phone: string;
        email: string;
        website: string;
        trn: string;
        poBox: string;
        fax: string;
        settings: any;
        primaryColor: string;
        language: string;
        isActive: boolean;
        trialEndsAt: Date;
        maxUsers: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createTenant(dto: any): Promise<{
        tenant: any;
        message: string;
    }>;
    updateTenant(id: string, dto: any): Promise<Tenant>;
    suspendTenant(id: string, reason: string): Promise<{
        success: boolean;
    }>;
    activateTenant(id: string): Promise<{
        success: boolean;
    }>;
    getTenantStats(id: string): Promise<{
        invoiceCount: number;
        invoiceTotal: number;
        userCount: number;
    }>;
    getUsers(tenantId?: string, search?: string): Promise<User[]>;
    toggleUser(id: string): Promise<{
        success: boolean;
        isActive: boolean;
    }>;
    getSystemHealth(): Promise<{
        status: string;
        database: string;
        tenants: number;
        users: number;
        timestamp: string;
        uptime: number;
        nodeVersion: string;
    }>;
}
