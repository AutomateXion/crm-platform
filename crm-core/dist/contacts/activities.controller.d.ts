import { Repository } from 'typeorm';
import { ActivityEntity } from './contacts.entity';
export declare class ActivitiesController {
    private repo;
    constructor(repo: Repository<ActivityEntity>);
    getAll(user: any, q: any): Promise<{
        data: ActivityEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(user: any, body: any): Promise<ActivityEntity[]>;
    getSummary(user: any): Promise<{
        planned: number;
        overdue: number;
        today: number;
        completed: number;
    }>;
    getOne(user: any, id: string): Promise<ActivityEntity>;
    update(user: any, id: string, body: any): Promise<ActivityEntity>;
    complete(user: any, id: string, body: any): Promise<ActivityEntity>;
    remove(user: any, id: string): Promise<{
        message: string;
    }>;
}
