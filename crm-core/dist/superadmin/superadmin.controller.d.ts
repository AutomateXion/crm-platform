import { SuperAdminService } from './superadmin.service';
export declare class SuperAdminController {
    private readonly svc;
    constructor(svc: SuperAdminService);
    private checkSuperAdmin;
    getDashboard(req: any): Promise<{
        totalTenants: number;
        activeTenants: number;
        suspendedTenants: number;
        totalUsers: number;
        activeUsers: number;
        planCounts: any;
        totalInvoices: number;
        recentTenants: import("../tenants/entities/tenant.entity").Tenant[];
    }>;
    getTenants(req: any, q: any): Promise<{
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
    createTenant(req: any, dto: any): Promise<{
        tenant: any;
        message: string;
    }>;
    updateTenant(req: any, id: string, dto: any): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    suspendTenant(req: any, id: string, dto: any): Promise<{
        success: boolean;
    }>;
    activateTenant(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getTenantStats(req: any, id: string): Promise<{
        invoiceCount: number;
        invoiceTotal: number;
        userCount: number;
    }>;
    getUsers(req: any, q: any): Promise<import("../users/entities/user.entity").User[]>;
    toggleUser(req: any, id: string): Promise<{
        success: boolean;
        isActive: boolean;
    }>;
    getSystemHealth(req: any): Promise<{
        status: string;
        database: string;
        tenants: number;
        users: number;
        timestamp: string;
        uptime: number;
        nodeVersion: string;
    }>;
}
