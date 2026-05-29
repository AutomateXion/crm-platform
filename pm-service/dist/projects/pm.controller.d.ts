import { Repository } from 'typeorm';
import { ProjectEntity, StageEntity, TaskEntity, TaskDocumentEntity, TaskCommentEntity, ResourceEntity, MilestoneEntity, BudgetEntryEntity, ChangeRequestEntity, RiskEntity, MeetingEntity } from '../pm.entities';
export declare class ProjectsController {
    private repo;
    constructor(repo: Repository<ProjectEntity>);
    getAll(u: any, q: any): Promise<{
        data: ProjectEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getOne(u: any, id: string): Promise<ProjectEntity>;
    create(u: any, body: any): Promise<ProjectEntity[]>;
    update(u: any, id: string, body: any): Promise<ProjectEntity>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
}
export declare class StagesController {
    private repo;
    private taskRepo;
    private projectRepo;
    constructor(repo: Repository<StageEntity>, taskRepo: Repository<TaskEntity>, projectRepo: Repository<ProjectEntity>);
    getAll(u: any, q: any): Promise<StageEntity[]>;
    create(u: any, body: any): Promise<StageEntity[]>;
    update(u: any, id: string, body: any): Promise<StageEntity>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
    reorder(u: any, body: {
        stages: {
            stageId: string;
            orderIndex: number;
        }[];
    }): Promise<{
        message: string;
    }>;
    private recalcProjectProgress;
}
export declare class TasksController {
    private repo;
    private stageRepo;
    private projectRepo;
    constructor(repo: Repository<TaskEntity>, stageRepo: Repository<StageEntity>, projectRepo: Repository<ProjectEntity>);
    getAll(u: any, q: any): Promise<TaskEntity[]>;
    getOne(u: any, id: string): Promise<TaskEntity>;
    create(u: any, body: any): Promise<TaskEntity[]>;
    update(u: any, id: string, body: any): Promise<TaskEntity>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
    private recalcStageProgress;
}
export declare class TaskDocumentsController {
    private repo;
    constructor(repo: Repository<TaskDocumentEntity>);
    getAll(u: any, q: any): Promise<TaskDocumentEntity[]>;
    upload(u: any, file: any, body: any): Promise<TaskDocumentEntity>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
}
export declare class TaskCommentsController {
    private repo;
    constructor(repo: Repository<TaskCommentEntity>);
    getAll(u: any, q: any): Promise<TaskCommentEntity[]>;
    create(u: any, body: any): Promise<TaskCommentEntity[]>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
}
export declare class ResourcesController {
    private repo;
    constructor(repo: Repository<ResourceEntity>);
    getAll(u: any, q: any): Promise<ResourceEntity[]>;
    create(u: any, body: any): Promise<ResourceEntity[]>;
    update(u: any, id: string, body: any): Promise<ResourceEntity>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
}
export declare class MilestonesController {
    private repo;
    constructor(repo: Repository<MilestoneEntity>);
    getAll(u: any, q: any): Promise<MilestoneEntity[]>;
    create(u: any, body: any): Promise<MilestoneEntity[]>;
    update(u: any, id: string, body: any): Promise<MilestoneEntity>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
}
export declare class BudgetController {
    private repo;
    private projectRepo;
    constructor(repo: Repository<BudgetEntryEntity>, projectRepo: Repository<ProjectEntity>);
    getAll(u: any, q: any): Promise<BudgetEntryEntity[]>;
    getSummary(u: any, projectId: string): Promise<{
        plannedBudget: number;
        plannedCost: number;
        actualCost: number;
        variance: number;
        variancePercent: number;
        isOverBudget: boolean;
    }>;
    create(u: any, body: any): Promise<BudgetEntryEntity[]>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
}
export declare class ChangeRequestsController {
    private repo;
    constructor(repo: Repository<ChangeRequestEntity>);
    getAll(u: any, q: any): Promise<ChangeRequestEntity[]>;
    create(u: any, body: any): Promise<ChangeRequestEntity[]>;
    update(u: any, id: string, body: any): Promise<ChangeRequestEntity>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
}
export declare class RisksController {
    private repo;
    constructor(repo: Repository<RiskEntity>);
    getAll(u: any, q: any): Promise<RiskEntity[]>;
    create(u: any, body: any): Promise<RiskEntity[]>;
    update(u: any, id: string, body: any): Promise<RiskEntity>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
}
export declare class MeetingsController {
    private repo;
    constructor(repo: Repository<MeetingEntity>);
    getAll(u: any, q: any): Promise<MeetingEntity[]>;
    create(u: any, body: any): Promise<MeetingEntity[]>;
    update(u: any, id: string, body: any): Promise<MeetingEntity>;
    remove(u: any, id: string): Promise<{
        message: string;
    }>;
}
export declare class DashboardController {
    private projectRepo;
    private taskRepo;
    private milestoneRepo;
    private crRepo;
    private riskRepo;
    constructor(projectRepo: Repository<ProjectEntity>, taskRepo: Repository<TaskEntity>, milestoneRepo: Repository<MilestoneEntity>, crRepo: Repository<ChangeRequestEntity>, riskRepo: Repository<RiskEntity>);
    getDashboard(u: any): Promise<{
        summary: {
            totalProjects: number;
            activeProjects: number;
            completedProjects: number;
            totalTasks: number;
            doneTasks: number;
            overdueTasks: number;
            pendingMilestones: number;
            pendingCRs: number;
            highRisks: number;
        };
        recentProjects: ProjectEntity[];
        overdueTasks: TaskEntity[];
        upcomingMilestones: MilestoneEntity[];
        pendingCRs: ChangeRequestEntity[];
        highRisks: RiskEntity[];
    }>;
}
export declare class PmDashboardController {
    private projectRepo;
    private taskRepo;
    private milestoneRepo;
    private riskRepo;
    private budgetRepo;
    private resourceRepo;
    constructor(projectRepo: Repository<ProjectEntity>, taskRepo: Repository<TaskEntity>, milestoneRepo: Repository<MilestoneEntity>, riskRepo: Repository<RiskEntity>, budgetRepo: Repository<BudgetEntryEntity>, resourceRepo: Repository<ResourceEntity>);
    getDashboard(u: any): Promise<{
        projects: {
            total: number;
            active: number;
            completed: number;
            atRisk: number;
            byStatus: any[];
            byHealth: any[];
            budget: {
                total: number;
                actual: number;
            };
            recent: ProjectEntity[];
        };
        tasks: {
            total: number;
            completed: number;
            overdue: number;
            dueToday: number;
            completionRate: number;
            byStatus: any[];
        };
        milestones: {
            total: number;
            completed: number;
            overdue: number;
        };
        risks: {
            total: number;
            high: number;
            bySeverity: any[];
        };
        resources: {
            total: number;
        };
    }>;
}
