import { Repository } from 'typeorm';
import { CustomerVisitEntity } from './contacts.entity';
export declare class VisitsController {
    private visitRepo;
    constructor(visitRepo: Repository<CustomerVisitEntity>);
    getVisits(req: any, q: any): Promise<{
        data: CustomerVisitEntity[];
        total: number;
    }>;
    getMyVisits(req: any): Promise<CustomerVisitEntity[]>;
    getVisitStats(req: any, q: any): Promise<{
        total: number;
        todayCount: number;
        byStatus: any[];
        bySalesman: any[];
    }>;
    checkIn(req: any, dto: any): Promise<CustomerVisitEntity[]>;
    checkOut(req: any, id: string, dto: any): Promise<CustomerVisitEntity | {
        error: string;
    }>;
    updateVisit(req: any, id: string, dto: any): Promise<CustomerVisitEntity>;
    deleteVisit(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
