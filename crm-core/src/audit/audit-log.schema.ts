// ─── audit-log.schema.ts ──────────────────────────────────────────────────────
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ collection: 'audit_logs', timestamps: true })
export class AuditLog {
  @Prop({ required: true, index: true }) tenantId: string;
  @Prop({ required: true, index: true }) userId: string;
  @Prop() userName: string;
  @Prop({ required: true, index: true }) module: string;
  @Prop({ required: true }) action: string; // CREATE | UPDATE | DELETE | LOGIN | LOGOUT | EXPORT
  @Prop({ index: true }) entityType: string;
  @Prop({ index: true }) entityId: string;
  @Prop() entityLabel: string;
  @Prop({ type: [{ field: String, oldValue: String, newValue: String }], default: [] })
  changes: { field: string; oldValue: string; newValue: string }[];
  @Prop() ipAddress: string;
  @Prop() userAgent: string;
  @Prop({ index: true, default: Date.now }) timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
