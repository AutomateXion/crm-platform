import { Repository } from "typeorm";
import { OpportunityEntity, OpportunityItemEntity } from "./contacts.entity";
export declare class OpportunitiesController {
    private repo;
    private itemRepo;
    constructor(repo: Repository<OpportunityEntity>, itemRepo: Repository<OpportunityItemEntity>);
    getAll(user: any, q: any): Promise<{
        data: OpportunityEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(user: any, body: any): Promise<OpportunityEntity[]>;
    getOne(user: any, id: string): Promise<OpportunityEntity>;
    update(user: any, id: string, body: any): Promise<OpportunityEntity>;
    patch(user: any, id: string, body: any): Promise<OpportunityEntity>;
    remove(user: any, id: string): Promise<{
        message: string;
    }>;
    getItems(id: string): Promise<OpportunityItemEntity[]>;
    saveItems(id: string, body: any): Promise<OpportunityItemEntity[]>;
}
