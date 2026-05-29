"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingEntity = exports.RiskEntity = exports.ChangeRequestEntity = exports.BudgetEntryEntity = exports.MilestoneEntity = exports.ResourceEntity = exports.TaskCommentEntity = exports.TaskDocumentEntity = exports.TaskEntity = exports.StageEntity = exports.ProjectEntity = void 0;
const typeorm_1 = require("typeorm");
let ProjectEntity = class ProjectEntity {
};
exports.ProjectEntity = ProjectEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'project_id' }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_number', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "projectNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_name' }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "projectName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opportunity_id', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "opportunityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opportunity_name', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "opportunityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'awarded_by_account_id', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "awardedByAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'awarded_by_name', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "awardedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_account_id', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "clientAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_name', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "clientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', nullable: true }),
    __metadata("design:type", Date)
], ProjectEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', nullable: true }),
    __metadata("design:type", Date)
], ProjectEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_value', type: 'decimal', precision: 18, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], ProjectEntity.prototype, "contractValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'PLANNING' }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health', default: 'GREEN' }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "health", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ProjectEntity.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_manager_id', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "projectManagerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_manager_name', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "projectManagerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'planned_budget', type: 'decimal', precision: 18, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], ProjectEntity.prototype, "plannedBudget", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_cost', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ProjectEntity.prototype, "actualCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ProjectEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProjectEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ProjectEntity.prototype, "updatedAt", void 0);
exports.ProjectEntity = ProjectEntity = __decorate([
    (0, typeorm_1.Entity)('pm_projects'),
    (0, typeorm_1.Index)(['tenantId'])
], ProjectEntity);
let StageEntity = class StageEntity {
};
exports.StageEntity = StageEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'stage_id' }),
    __metadata("design:type", String)
], StageEntity.prototype, "stageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], StageEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], StageEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stage_name' }),
    __metadata("design:type", String)
], StageEntity.prototype, "stageName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StageEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_index', default: 0 }),
    __metadata("design:type", Number)
], StageEntity.prototype, "orderIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', nullable: true }),
    __metadata("design:type", Date)
], StageEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', nullable: true }),
    __metadata("design:type", Date)
], StageEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'NOT_STARTED' }),
    __metadata("design:type", String)
], StageEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], StageEntity.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], StageEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], StageEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StageEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StageEntity.prototype, "updatedAt", void 0);
exports.StageEntity = StageEntity = __decorate([
    (0, typeorm_1.Entity)('pm_stages'),
    (0, typeorm_1.Index)(['projectId'])
], StageEntity);
let TaskEntity = class TaskEntity {
};
exports.TaskEntity = TaskEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'task_id' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stage_id', nullable: true }),
    __metadata("design:type", String)
], TaskEntity.prototype, "stageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_task_id', nullable: true }),
    __metadata("design:type", String)
], TaskEntity.prototype, "parentTaskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_number', nullable: true }),
    __metadata("design:type", String)
], TaskEntity.prototype, "taskNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_name' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "taskName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TaskEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'TODO' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority', default: 'MEDIUM' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to', nullable: true }),
    __metadata("design:type", String)
], TaskEntity.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to_name', nullable: true }),
    __metadata("design:type", String)
], TaskEntity.prototype, "assignedToName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', nullable: true }),
    __metadata("design:type", Date)
], TaskEntity.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', nullable: true }),
    __metadata("design:type", Date)
], TaskEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_date', nullable: true }),
    __metadata("design:type", Date)
], TaskEntity.prototype, "completedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_hours', type: 'decimal', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], TaskEntity.prototype, "estimatedHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_hours', type: 'decimal', precision: 8, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TaskEntity.prototype, "actualHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TaskEntity.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reassign_log', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], TaskEntity.prototype, "reassignLog", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_index', default: 0 }),
    __metadata("design:type", Number)
], TaskEntity.prototype, "orderIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], TaskEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], TaskEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TaskEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TaskEntity.prototype, "updatedAt", void 0);
exports.TaskEntity = TaskEntity = __decorate([
    (0, typeorm_1.Entity)('pm_tasks'),
    (0, typeorm_1.Index)(['projectId']),
    (0, typeorm_1.Index)(['stageId']),
    (0, typeorm_1.Index)(['assignedTo'])
], TaskEntity);
let TaskDocumentEntity = class TaskDocumentEntity {
};
exports.TaskDocumentEntity = TaskDocumentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'doc_id' }),
    __metadata("design:type", String)
], TaskDocumentEntity.prototype, "docId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], TaskDocumentEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_id' }),
    __metadata("design:type", String)
], TaskDocumentEntity.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], TaskDocumentEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_name' }),
    __metadata("design:type", String)
], TaskDocumentEntity.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_path' }),
    __metadata("design:type", String)
], TaskDocumentEntity.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', nullable: true }),
    __metadata("design:type", Number)
], TaskDocumentEntity.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', nullable: true }),
    __metadata("design:type", String)
], TaskDocumentEntity.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by', nullable: true }),
    __metadata("design:type", String)
], TaskDocumentEntity.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by_name', nullable: true }),
    __metadata("design:type", String)
], TaskDocumentEntity.prototype, "uploadedByName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TaskDocumentEntity.prototype, "createdAt", void 0);
exports.TaskDocumentEntity = TaskDocumentEntity = __decorate([
    (0, typeorm_1.Entity)('pm_task_documents')
], TaskDocumentEntity);
let TaskCommentEntity = class TaskCommentEntity {
};
exports.TaskCommentEntity = TaskCommentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'comment_id' }),
    __metadata("design:type", String)
], TaskCommentEntity.prototype, "commentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], TaskCommentEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_id' }),
    __metadata("design:type", String)
], TaskCommentEntity.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], TaskCommentEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comment_text', type: 'text' }),
    __metadata("design:type", String)
], TaskCommentEntity.prototype, "commentText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], TaskCommentEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_name', nullable: true }),
    __metadata("design:type", String)
], TaskCommentEntity.prototype, "createdByName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TaskCommentEntity.prototype, "createdAt", void 0);
exports.TaskCommentEntity = TaskCommentEntity = __decorate([
    (0, typeorm_1.Entity)('pm_task_comments')
], TaskCommentEntity);
let ResourceEntity = class ResourceEntity {
};
exports.ResourceEntity = ResourceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'resource_id' }),
    __metadata("design:type", String)
], ResourceEntity.prototype, "resourceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ResourceEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], ResourceEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], ResourceEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resource_name' }),
    __metadata("design:type", String)
], ResourceEntity.prototype, "resourceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role_on_project', nullable: true }),
    __metadata("design:type", String)
], ResourceEntity.prototype, "roleOnProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ResourceEntity.prototype, "hourlyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allocation_percent', type: 'decimal', precision: 5, scale: 2, default: 100 }),
    __metadata("design:type", Number)
], ResourceEntity.prototype, "allocationPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'join_date', nullable: true }),
    __metadata("design:type", Date)
], ResourceEntity.prototype, "joinDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_date', nullable: true }),
    __metadata("design:type", Date)
], ResourceEntity.prototype, "leaveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ResourceEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], ResourceEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ResourceEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ResourceEntity.prototype, "updatedAt", void 0);
exports.ResourceEntity = ResourceEntity = __decorate([
    (0, typeorm_1.Entity)('pm_resources'),
    (0, typeorm_1.Index)(['projectId'])
], ResourceEntity);
let MilestoneEntity = class MilestoneEntity {
};
exports.MilestoneEntity = MilestoneEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'milestone_id' }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "milestoneId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'milestone_name' }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "milestoneName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], MilestoneEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', nullable: true }),
    __metadata("design:type", Date)
], MilestoneEntity.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoiced_date', nullable: true }),
    __metadata("design:type", Date)
], MilestoneEntity.prototype, "invoicedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_date', nullable: true }),
    __metadata("design:type", Date)
], MilestoneEntity.prototype, "paidDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cr_date', nullable: true }),
    __metadata("design:type", Date)
], MilestoneEntity.prototype, "crDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area_module', nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "areaModule", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_scope', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "originalScope", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_change', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "requestedChange", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact_assessment', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "impactAssessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'classification', nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "classification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effort', nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "effort", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commercial', nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "commercial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'PENDING' }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'linked_stage_id', nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "linkedStageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_index', default: 0 }),
    __metadata("design:type", Number)
], MilestoneEntity.prototype, "orderIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], MilestoneEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], MilestoneEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MilestoneEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MilestoneEntity.prototype, "updatedAt", void 0);
exports.MilestoneEntity = MilestoneEntity = __decorate([
    (0, typeorm_1.Entity)('pm_milestones'),
    (0, typeorm_1.Index)(['projectId'])
], MilestoneEntity);
let BudgetEntryEntity = class BudgetEntryEntity {
};
exports.BudgetEntryEntity = BudgetEntryEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'entry_id' }),
    __metadata("design:type", String)
], BudgetEntryEntity.prototype, "entryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], BudgetEntryEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], BudgetEntryEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stage_id', nullable: true }),
    __metadata("design:type", String)
], BudgetEntryEntity.prototype, "stageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_type' }),
    __metadata("design:type", String)
], BudgetEntryEntity.prototype, "entryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category' }),
    __metadata("design:type", String)
], BudgetEntryEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BudgetEntryEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], BudgetEntryEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_date', nullable: true }),
    __metadata("design:type", Date)
], BudgetEntryEntity.prototype, "entryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference', nullable: true }),
    __metadata("design:type", String)
], BudgetEntryEntity.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], BudgetEntryEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BudgetEntryEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BudgetEntryEntity.prototype, "updatedAt", void 0);
exports.BudgetEntryEntity = BudgetEntryEntity = __decorate([
    (0, typeorm_1.Entity)('pm_budget_entries'),
    (0, typeorm_1.Index)(['projectId'])
], BudgetEntryEntity);
let ChangeRequestEntity = class ChangeRequestEntity {
};
exports.ChangeRequestEntity = ChangeRequestEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'cr_id' }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "crId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cr_number', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "crNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title' }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cr_date', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "crDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area_module', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "areaModule", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_scope', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "originalScope", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_change', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "requestedChange", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact_assessment', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "impactAssessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'classification', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "classification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effort', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "effort", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commercial', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "commercial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact_scope', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "impactScope", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact_budget', type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ChangeRequestEntity.prototype, "impactBudget", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact_timeline_days', default: 0 }),
    __metadata("design:type", Number)
], ChangeRequestEntity.prototype, "impactTimelineDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'PENDING' }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_by', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_by_name', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "requestedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_by', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_by_name', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "reviewedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_date', nullable: true }),
    __metadata("design:type", Date)
], ChangeRequestEntity.prototype, "reviewDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_notes', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "reviewNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ChangeRequestEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], ChangeRequestEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ChangeRequestEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ChangeRequestEntity.prototype, "updatedAt", void 0);
exports.ChangeRequestEntity = ChangeRequestEntity = __decorate([
    (0, typeorm_1.Entity)('pm_change_requests'),
    (0, typeorm_1.Index)(['projectId'])
], ChangeRequestEntity);
let RiskEntity = class RiskEntity {
};
exports.RiskEntity = RiskEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'risk_id' }),
    __metadata("design:type", String)
], RiskEntity.prototype, "riskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], RiskEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], RiskEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_title' }),
    __metadata("design:type", String)
], RiskEntity.prototype, "riskTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RiskEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likelihood', default: 'MEDIUM' }),
    __metadata("design:type", String)
], RiskEntity.prototype, "likelihood", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact', default: 'MEDIUM' }),
    __metadata("design:type", String)
], RiskEntity.prototype, "impact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_score', default: 0 }),
    __metadata("design:type", Number)
], RiskEntity.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mitigation_plan', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RiskEntity.prototype, "mitigationPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'OPEN' }),
    __metadata("design:type", String)
], RiskEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_id', nullable: true }),
    __metadata("design:type", String)
], RiskEntity.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_name', nullable: true }),
    __metadata("design:type", String)
], RiskEntity.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], RiskEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], RiskEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RiskEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], RiskEntity.prototype, "updatedAt", void 0);
exports.RiskEntity = RiskEntity = __decorate([
    (0, typeorm_1.Entity)('pm_risks'),
    (0, typeorm_1.Index)(['projectId'])
], RiskEntity);
let MeetingEntity = class MeetingEntity {
};
exports.MeetingEntity = MeetingEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'meeting_id' }),
    __metadata("design:type", String)
], MeetingEntity.prototype, "meetingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], MeetingEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], MeetingEntity.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title' }),
    __metadata("design:type", String)
], MeetingEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meeting_date', nullable: true }),
    __metadata("design:type", Date)
], MeetingEntity.prototype, "meetingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location', nullable: true }),
    __metadata("design:type", String)
], MeetingEntity.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attendees', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], MeetingEntity.prototype, "attendees", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agenda', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MeetingEntity.prototype, "agenda", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minutes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MeetingEntity.prototype, "minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_items', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], MeetingEntity.prototype, "actionItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], MeetingEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_name', nullable: true }),
    __metadata("design:type", String)
], MeetingEntity.prototype, "createdByName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MeetingEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MeetingEntity.prototype, "updatedAt", void 0);
exports.MeetingEntity = MeetingEntity = __decorate([
    (0, typeorm_1.Entity)('pm_meetings'),
    (0, typeorm_1.Index)(['projectId'])
], MeetingEntity);
//# sourceMappingURL=pm.entities.js.map