// ─── audit.service.ts ────────────────────────────────────────────────────────
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

export interface AuditLogInput {
  tenantId: string;
  userId: string;
  userName: string;
  module: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel?: string;
  changes?: { field: string; oldValue: string; newValue: any }[];
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.auditModel.create({
        ...input,
        changes: input.changes?.map(c => ({
          field: c.field,
          oldValue: String(c.oldValue ?? ''),
          newValue: String(c.newValue ?? ''),
        })) ?? [],
        timestamp: new Date(),
      });
    } catch (err) {
      // Audit logging should never break the main flow
      console.error('Audit log error:', err.message);
    }
  }

  async getLogs(
    tenantId: string,
    filters: {
      userId?: string;
      module?: string;
      entityType?: string;
      entityId?: string;
      action?: string;
      from?: Date;
      to?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const query: any = { tenantId };
    if (filters.userId) query.userId = filters.userId;
    if (filters.module) query.module = filters.module;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.entityId) query.entityId = filters.entityId;
    if (filters.action) query.action = filters.action;
    if (filters.from || filters.to) {
      query.timestamp = {};
      if (filters.from) query.timestamp.$gte = filters.from;
      if (filters.to) query.timestamp.$lte = filters.to;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.auditModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      this.auditModel.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
