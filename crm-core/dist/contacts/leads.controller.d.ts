import { Repository } from 'typeorm';
import { LeadEntity, ContactEntity } from './contacts.entity';
export declare class LeadsController {
    private repo;
    private contactRepo;
    constructor(repo: Repository<LeadEntity>, contactRepo: Repository<ContactEntity>);
    getAll(user: any, q: any): Promise<{
        data: LeadEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(user: any, body: any): Promise<LeadEntity[]>;
    getOne(user: any, id: string): Promise<LeadEntity>;
    update(user: any, id: string, body: any): Promise<LeadEntity>;
    patch(user: any, id: string, body: any): Promise<LeadEntity>;
    remove(user: any, id: string): Promise<{
        message: string;
    }>;
}
