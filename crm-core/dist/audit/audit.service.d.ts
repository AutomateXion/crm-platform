import { Model } from 'mongoose';
import { AuditLogDocument } from './audit-log.schema';
export interface AuditLogInput {
    tenantId: string;
    userId: string;
    userName: string;
    module: string;
    action: string;
    entityType: string;
    entityId: string;
    entityLabel?: string;
    changes?: {
        field: string;
        oldValue: string;
        newValue: any;
    }[];
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditService {
    private readonly auditModel;
    constructor(auditModel: Model<AuditLogDocument>);
    log(input: AuditLogInput): Promise<void>;
    getLogs(tenantId: string, filters: {
        userId?: string;
        module?: string;
        entityType?: string;
        entityId?: string;
        action?: string;
        from?: Date;
        to?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        data: (import("mongoose").FlattenMaps<AuditLogDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
