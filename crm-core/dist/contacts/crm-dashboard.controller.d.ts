import { Repository } from "typeorm";
import { LeadEntity, OpportunityEntity, AccountEntity, ContactEntity, ActivityEntity } from "./contacts.entity";
export declare class CrmDashboardController {
    private leadRepo;
    private oppRepo;
    private accountRepo;
    private contactRepo;
    private activityRepo;
    constructor(leadRepo: Repository<LeadEntity>, oppRepo: Repository<OpportunityEntity>, accountRepo: Repository<AccountEntity>, contactRepo: Repository<ContactEntity>, activityRepo: Repository<ActivityEntity>);
    getDashboard(user: any): Promise<{
        leads: {
            total: number;
            thisMonth: number;
            lastMonth: number;
            converted: number;
            conversionRate: number;
            bySource: any[];
            byStatus: any[];
            monthlyTrend: any[];
        };
        opportunities: {
            total: number;
            won: number;
            lost: number;
            pipelineValue: number;
            wonValue: number;
            winRate: number;
            avgDealSize: number;
            byStage: any[];
        };
        accounts: {
            total: number;
            thisMonth: number;
            top: any[];
        };
        contacts: {
            total: number;
        };
        activities: {
            today: number;
            overdue: number;
            recent: ActivityEntity[];
        };
    }>;
}
