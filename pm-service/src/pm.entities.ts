import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('pm_projects')
@Index(['tenantId'])
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'project_id' }) projectId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_number', nullable: true }) projectNumber: string;
  @Column({ name: 'project_name' }) projectName: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'opportunity_id', nullable: true }) opportunityId: string;
  @Column({ name: 'opportunity_name', nullable: true }) opportunityName: string;
  @Column({ name: 'awarded_by_account_id', nullable: true }) awardedByAccountId: string;
  @Column({ name: 'awarded_by_name', nullable: true }) awardedByName: string;
  @Column({ name: 'client_account_id', nullable: true }) clientAccountId: string;
  @Column({ name: 'client_name', nullable: true }) clientName: string;
  @Column({ name: 'start_date', nullable: true }) startDate: Date;
  @Column({ name: 'end_date', nullable: true }) endDate: Date;
  @Column({ name: 'contract_value', type: 'decimal', precision: 18, scale: 3, nullable: true }) contractValue: number;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'status', default: 'PLANNING' }) status: string;
  @Column({ name: 'health', default: 'GREEN' }) health: string;
  @Column({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 }) progress: number;
  @Column({ name: 'project_manager_id', nullable: true }) projectManagerId: string;
  @Column({ name: 'project_manager_name', nullable: true }) projectManagerName: string;
  @Column({ name: 'planned_budget', type: 'decimal', precision: 18, scale: 3, nullable: true }) plannedBudget: number;
  @Column({ name: 'actual_cost', type: 'decimal', precision: 18, scale: 3, default: 0 }) actualCost: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('pm_stages')
@Index(['projectId'])
export class StageEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'stage_id' }) stageId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'stage_name' }) stageName: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'order_index', default: 0 }) orderIndex: number;
  @Column({ name: 'start_date', nullable: true }) startDate: Date;
  @Column({ name: 'end_date', nullable: true }) endDate: Date;
  @Column({ name: 'status', default: 'NOT_STARTED' }) status: string;
  @Column({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 }) progress: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('pm_tasks')
@Index(['projectId'])
@Index(['stageId'])
@Index(['assignedTo'])
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'task_id' }) taskId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'stage_id', nullable: true }) stageId: string;
  @Column({ name: 'parent_task_id', nullable: true }) parentTaskId: string;
  @Column({ name: 'task_number', nullable: true }) taskNumber: string;
  @Column({ name: 'task_name' }) taskName: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'status', default: 'TODO' }) status: string;
  @Column({ name: 'priority', default: 'MEDIUM' }) priority: string;
  @Column({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @Column({ name: 'assigned_to_name', nullable: true }) assignedToName: string;
  @Column({ name: 'due_date', nullable: true }) dueDate: Date;
  @Column({ name: 'start_date', nullable: true }) startDate: Date;
  @Column({ name: 'completed_date', nullable: true }) completedDate: Date;
  @Column({ name: 'estimated_hours', type: 'decimal', precision: 8, scale: 2, nullable: true }) estimatedHours: number;
  @Column({ name: 'actual_hours', type: 'decimal', precision: 8, scale: 2, default: 0 }) actualHours: number;
  @Column({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 }) progress: number;
  @Column({ name: 'reassign_log', type: 'jsonb', default: '[]' }) reassignLog: any[];
  @Column({ name: 'order_index', default: 0 }) orderIndex: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('pm_task_documents')
export class TaskDocumentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'doc_id' }) docId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'task_id' }) taskId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'file_name' }) fileName: string;
  @Column({ name: 'file_path' }) filePath: string;
  @Column({ name: 'file_size', nullable: true }) fileSize: number;
  @Column({ name: 'mime_type', nullable: true }) mimeType: string;
  @Column({ name: 'uploaded_by', nullable: true }) uploadedBy: string;
  @Column({ name: 'uploaded_by_name', nullable: true }) uploadedByName: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('pm_task_comments')
export class TaskCommentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'comment_id' }) commentId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'task_id' }) taskId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'comment_text', type: 'text' }) commentText: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @Column({ name: 'created_by_name', nullable: true }) createdByName: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('pm_resources')
@Index(['projectId'])
export class ResourceEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'resource_id' }) resourceId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'user_id', nullable: true }) userId: string;
  @Column({ name: 'resource_name' }) resourceName: string;
  @Column({ name: 'role_on_project', nullable: true }) roleOnProject: string;
  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 3, default: 0 }) hourlyRate: number;
  @Column({ name: 'allocation_percent', type: 'decimal', precision: 5, scale: 2, default: 100 }) allocationPercent: number;
  @Column({ name: 'join_date', nullable: true }) joinDate: Date;
  @Column({ name: 'leave_date', nullable: true }) leaveDate: Date;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('pm_milestones')
@Index(['projectId'])
export class MilestoneEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'milestone_id' }) milestoneId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'milestone_name' }) milestoneName: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) amount: number;
  @Column({ name: 'due_date', nullable: true }) dueDate: Date;
  @Column({ name: 'invoiced_date', nullable: true }) invoicedDate: Date;
  @Column({ name: 'paid_date', nullable: true }) paidDate: Date;
  @Column({ name: 'cr_date', nullable: true }) crDate: Date;
  @Column({ name: 'area_module', nullable: true }) areaModule: string;
  @Column({ name: 'original_scope', type: 'text', nullable: true }) originalScope: string;
  @Column({ name: 'requested_change', type: 'text', nullable: true }) requestedChange: string;
  @Column({ name: 'impact_assessment', type: 'text', nullable: true }) impactAssessment: string;
  @Column({ name: 'classification', nullable: true }) classification: string;
  @Column({ name: 'effort', nullable: true }) effort: string;
  @Column({ name: 'commercial', nullable: true }) commercial: string;
  @Column({ name: 'status', default: 'PENDING' }) status: string;
  @Column({ name: 'linked_stage_id', nullable: true }) linkedStageId: string;
  @Column({ name: 'order_index', default: 0 }) orderIndex: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('pm_budget_entries')
@Index(['projectId'])
export class BudgetEntryEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'entry_id' }) entryId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'stage_id', nullable: true }) stageId: string;
  @Column({ name: 'entry_type' }) entryType: string;
  @Column({ name: 'category' }) category: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'amount', type: 'decimal', precision: 18, scale: 3, default: 0 }) amount: number;
  @Column({ name: 'entry_date', nullable: true }) entryDate: Date;
  @Column({ name: 'reference', nullable: true }) reference: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('pm_change_requests')
@Index(['projectId'])
export class ChangeRequestEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'cr_id' }) crId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'cr_number', nullable: true }) crNumber: string;
  @Column({ name: 'title' }) title: string;
  @Column({ name: 'description', type: 'text', nullable: true }) description: string;
  @Column({ name: 'cr_date', nullable: true }) crDate: string;
  @Column({ name: 'area_module', nullable: true }) areaModule: string;
  @Column({ name: 'original_scope', type: 'text', nullable: true }) originalScope: string;
  @Column({ name: 'requested_change', type: 'text', nullable: true }) requestedChange: string;
  @Column({ name: 'impact_assessment', type: 'text', nullable: true }) impactAssessment: string;
  @Column({ name: 'classification', nullable: true }) classification: string;
  @Column({ name: 'effort', nullable: true }) effort: string;
  @Column({ name: 'commercial', nullable: true }) commercial: string;
  @Column({ name: 'impact_scope', nullable: true }) impactScope: string;
  @Column({ name: 'impact_budget', type: 'decimal', precision: 18, scale: 3, default: 0 }) impactBudget: number;
  @Column({ name: 'impact_timeline_days', default: 0 }) impactTimelineDays: number;
  @Column({ name: 'status', default: 'PENDING' }) status: string;
  @Column({ name: 'requested_by', nullable: true }) requestedBy: string;
  @Column({ name: 'requested_by_name', nullable: true }) requestedByName: string;
  @Column({ name: 'reviewed_by', nullable: true }) reviewedBy: string;
  @Column({ name: 'reviewed_by_name', nullable: true }) reviewedByName: string;
  @Column({ name: 'review_date', nullable: true }) reviewDate: Date;
  @Column({ name: 'review_notes', nullable: true }) reviewNotes: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('pm_risks')
@Index(['projectId'])
export class RiskEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'risk_id' }) riskId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'risk_title' }) riskTitle: string;
  @Column({ name: 'description', type: 'text', nullable: true }) description: string;
  @Column({ name: 'likelihood', default: 'MEDIUM' }) likelihood: string;
  @Column({ name: 'impact', default: 'MEDIUM' }) impact: string;
  @Column({ name: 'risk_score', default: 0 }) riskScore: number;
  @Column({ name: 'mitigation_plan', type: 'text', nullable: true }) mitigationPlan: string;
  @Column({ name: 'status', default: 'OPEN' }) status: string;
  @Column({ name: 'owner_id', nullable: true }) ownerId: string;
  @Column({ name: 'owner_name', nullable: true }) ownerName: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('pm_meetings')
@Index(['projectId'])
export class MeetingEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'meeting_id' }) meetingId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'title' }) title: string;
  @Column({ name: 'meeting_date', nullable: true }) meetingDate: Date;
  @Column({ name: 'location', nullable: true }) location: string;
  @Column({ name: 'attendees', type: 'jsonb', default: '[]' }) attendees: any[];
  @Column({ name: 'agenda', type: 'text', nullable: true }) agenda: string;
  @Column({ name: 'minutes', type: 'text', nullable: true }) minutes: string;
  @Column({ name: 'action_items', type: 'jsonb', default: '[]' }) actionItems: any[];
  @Column({ name: 'agenda_items', type: 'jsonb', default: '[]' }) agendaItems: any[];
  @Column({ name: 'meeting_type', nullable: true }) meetingType: string;
  @Column({ name: 'next_meeting_date', type: 'date', nullable: true }) nextMeetingDate: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @Column({ name: 'created_by_name', nullable: true }) createdByName: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}


@Entity('pm_feasibility')
@Index(['projectId'])
export class FeasibilityEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'feasibility_id' }) feasibilityId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'project_id' }) projectId: string;
  @Column({ name: 'scenario_name', default: 'Base Case' }) scenarioName: string;
  @Column({ name: 'discount_rate', type: 'decimal', precision: 7, scale: 4, default: 10 }) discountRate: number;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'period_type', default: 'YEARLY' }) periodType: string;
  @Column({ name: 'initial_investment', type: 'decimal', precision: 18, scale: 3, default: 0 }) initialInvestment: number;
  @Column({ name: 'cash_flows', type: 'jsonb', default: '[]' }) cashFlows: any[];
  @Column({ name: 'npv', type: 'decimal', precision: 18, scale: 3, nullable: true }) npv: number;
  @Column({ name: 'irr', type: 'decimal', precision: 9, scale: 4, nullable: true }) irr: number;
  @Column({ name: 'roi', type: 'decimal', precision: 9, scale: 2, nullable: true }) roi: number;
  @Column({ name: 'payback_periods', type: 'decimal', precision: 9, scale: 2, nullable: true }) paybackPeriods: number;
  @Column({ name: 'profitability_index', type: 'decimal', precision: 9, scale: 4, nullable: true }) profitabilityIndex: number;
  @Column({ name: 'verdict', nullable: true }) verdict: string;
  @Column({ name: 'notes', type: 'text', nullable: true }) notes: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
