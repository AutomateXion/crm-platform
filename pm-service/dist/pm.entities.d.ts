export declare class ProjectEntity {
    projectId: string;
    tenantId: string;
    projectNumber: string;
    projectName: string;
    description: string;
    opportunityId: string;
    opportunityName: string;
    awardedByAccountId: string;
    awardedByName: string;
    clientAccountId: string;
    clientName: string;
    startDate: Date;
    endDate: Date;
    contractValue: number;
    currencyCode: string;
    status: string;
    health: string;
    progress: number;
    projectManagerId: string;
    projectManagerName: string;
    plannedBudget: number;
    actualCost: number;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class StageEntity {
    stageId: string;
    tenantId: string;
    projectId: string;
    stageName: string;
    description: string;
    orderIndex: number;
    startDate: Date;
    endDate: Date;
    status: string;
    progress: number;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TaskEntity {
    taskId: string;
    tenantId: string;
    projectId: string;
    stageId: string;
    parentTaskId: string;
    taskNumber: string;
    taskName: string;
    description: string;
    status: string;
    priority: string;
    assignedTo: string;
    assignedToName: string;
    dueDate: Date;
    startDate: Date;
    completedDate: Date;
    estimatedHours: number;
    actualHours: number;
    progress: number;
    reassignLog: any[];
    orderIndex: number;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TaskDocumentEntity {
    docId: string;
    tenantId: string;
    taskId: string;
    projectId: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    uploadedByName: string;
    createdAt: Date;
}
export declare class TaskCommentEntity {
    commentId: string;
    tenantId: string;
    taskId: string;
    projectId: string;
    commentText: string;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
}
export declare class ResourceEntity {
    resourceId: string;
    tenantId: string;
    projectId: string;
    userId: string;
    resourceName: string;
    roleOnProject: string;
    hourlyRate: number;
    allocationPercent: number;
    joinDate: Date;
    leaveDate: Date;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class MilestoneEntity {
    milestoneId: string;
    tenantId: string;
    projectId: string;
    milestoneName: string;
    description: string;
    amount: number;
    dueDate: Date;
    invoicedDate: Date;
    paidDate: Date;
    crDate: Date;
    areaModule: string;
    originalScope: string;
    requestedChange: string;
    impactAssessment: string;
    classification: string;
    effort: string;
    commercial: string;
    status: string;
    linkedStageId: string;
    orderIndex: number;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BudgetEntryEntity {
    entryId: string;
    tenantId: string;
    projectId: string;
    stageId: string;
    entryType: string;
    category: string;
    description: string;
    amount: number;
    entryDate: Date;
    reference: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ChangeRequestEntity {
    crId: string;
    tenantId: string;
    projectId: string;
    crNumber: string;
    title: string;
    description: string;
    crDate: string;
    areaModule: string;
    originalScope: string;
    requestedChange: string;
    impactAssessment: string;
    classification: string;
    effort: string;
    commercial: string;
    impactScope: string;
    impactBudget: number;
    impactTimelineDays: number;
    status: string;
    requestedBy: string;
    requestedByName: string;
    reviewedBy: string;
    reviewedByName: string;
    reviewDate: Date;
    reviewNotes: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RiskEntity {
    riskId: string;
    tenantId: string;
    projectId: string;
    riskTitle: string;
    description: string;
    likelihood: string;
    impact: string;
    riskScore: number;
    mitigationPlan: string;
    status: string;
    ownerId: string;
    ownerName: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class MeetingEntity {
    meetingId: string;
    tenantId: string;
    projectId: string;
    title: string;
    meetingDate: Date;
    location: string;
    attendees: any[];
    agenda: string;
    minutes: string;
    actionItems: any[];
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    updatedAt: Date;
}
