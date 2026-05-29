import { Document } from 'mongoose';
export type AuditLogDocument = AuditLog & Document;
export declare class AuditLog {
    tenantId: string;
    userId: string;
    userName: string;
    module: string;
    action: string;
    entityType: string;
    entityId: string;
    entityLabel: string;
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
    }[];
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}
export declare const AuditLogSchema: import("mongoose").Schema<AuditLog, import("mongoose").Model<AuditLog, any, any, any, Document<unknown, any, AuditLog> & AuditLog & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditLog, Document<unknown, {}, import("mongoose").FlatRecord<AuditLog>> & import("mongoose").FlatRecord<AuditLog> & {
    _id: import("mongoose").Types.ObjectId;
}>;
