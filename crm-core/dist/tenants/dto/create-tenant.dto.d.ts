export declare class CreateTenantDto {
    tenantCode: string;
    companyName: string;
    adminEmail: string;
    adminName: string;
    adminPassword: string;
    domain?: string;
    subscriptionPlan?: string;
    timezone?: string;
    currencyCode?: string;
    language?: string;
    maxUsers?: number;
}
export declare class UpdateTenantDto {
    companyName?: string;
    logoUrl?: string;
    primaryColor?: string;
    timezone?: string;
    dateFormat?: string;
    currencyCode?: string;
    language?: string;
}
