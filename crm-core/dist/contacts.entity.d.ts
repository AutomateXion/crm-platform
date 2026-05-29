export declare class AccountEntity {
    accountId: string;
    tenantId: string;
    accountName: string;
    phone: string;
    email: string;
    website: string;
    city: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ContactEntity {
    contactId: string;
    tenantId: string;
    accountId: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    mobile: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
