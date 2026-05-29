// ─── ticket.entity.ts ─────────────────────────────────────────────────────────
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index, OneToMany,
} from 'typeorm';

@Entity('tickets')
@Index(['tenantId'])
@Index(['tenantId', 'statusId'])
@Index(['tenantId', 'assignedTo'])
@Index(['tenantId', 'accountId'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid') ticketId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'ticket_number', nullable: true }) ticketNumber: string;
  @Column() subject: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'contact_id', nullable: true }) contactId: string;
  @Column({ name: 'category_id', nullable: true }) categoryId: string;
  @Column({ name: 'priority_id', nullable: true }) priorityId: string;
  @Column({ name: 'status_id', nullable: true }) statusId: string;
  @Column({ name: 'sla_type_id', nullable: true }) slaTypeId: string;
  @Column({ name: 'sla_due_at', nullable: true }) slaDueAt: Date;
  @Column({ name: 'sla_breached', default: false }) slaBreached: boolean;
  @Column({ name: 'team_id', nullable: true }) teamId: string;
  @Column({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @Column({ name: 'first_response_at', nullable: true }) firstResponseAt: Date;
  @Column({ name: 'resolved_at', nullable: true }) resolvedAt: Date;
  @Column({ name: 'closed_at', nullable: true }) closedAt: Date;
  @Column({ nullable: true }) resolution: string;
  @Column({ name: 'resolution_type_id', nullable: true }) resolutionTypeId: string;
  @Column({ name: 'satisfaction_score', nullable: true }) satisfactionScore: number;
  @Column({ name: 'satisfaction_note', nullable: true }) satisfactionNote: string;
  @Column({ type: 'text', array: true, default: '{}' }) tags: string[];
  @Column({ name: 'custom_fields', type: 'jsonb', default: '{}' }) customFields: Record<string, any>;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('ticket_comments')
@Index(['ticketId'])
export class TicketComment {
  @PrimaryGeneratedColumn('uuid') commentId: string;
  @Column({ name: 'ticket_id' }) ticketId: string;
  @Column({ name: 'comment_text', type: 'text' }) commentText: string;
  @Column({ name: 'is_internal', default: false }) isInternal: boolean;
  @Column({ type: 'jsonb', default: '[]' }) attachments: any[];
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
