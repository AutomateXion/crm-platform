import { AuditService } from './audit.service';
import { User } from '../users/entities/user.entity';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getLogs(user: User, userId?: string, module?: string, entityType?: string, entityId?: string, action?: string, from?: string, to?: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").FlattenMaps<import("./audit-log.schema").AuditLogDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
