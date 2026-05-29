import { Repository } from 'typeorm';
import { AccountEntity, ContactEntity } from './contacts.entity';
export declare class ContactsController {
    private accountRepo;
    private contactRepo;
    constructor(accountRepo: Repository<AccountEntity>, contactRepo: Repository<ContactEntity>);
    getAccounts(user: any, q: any): Promise<{
        data: AccountEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    createAccount(user: any, body: any): Promise<AccountEntity[]>;
    getAccount(user: any, id: string): Promise<AccountEntity>;
    get360(user: any, id: string): Promise<{
        account: AccountEntity;
        contacts: ContactEntity[];
        notes: any[];
        totals: {
            contacts: number;
            notes: number;
        };
    }>;
    updateAccount(user: any, id: string, body: any): Promise<AccountEntity>;
    deleteAccount(user: any, id: string): Promise<{
        message: string;
    }>;
    getContacts(user: any, q: any): Promise<{
        data: ContactEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    createContact(user: any, body: any): Promise<ContactEntity[]>;
    getContact(user: any, id: string): Promise<ContactEntity>;
    updateContact(user: any, id: string, body: any): Promise<ContactEntity>;
    deleteContact(user: any, id: string): Promise<{
        message: string;
    }>;
}
