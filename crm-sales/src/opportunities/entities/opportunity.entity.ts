// ─── opportunity.entity.ts ────────────────────────────────────────────────────
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index, OneToMany,
} from 'typeorm';

@Entity('opportunities')
@Index(['tenantId'])
@Index(['tenantId', 'stageId'])
@Index(['tenantId', 'assignedTo'])
export class Opportunity {
  @PrimaryGeneratedColumn('uuid') opportunityId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'opportunity_number', nullable: true }) opportunityNumber: string;
  @Column({ name: 'opportunity_name' }) opportunityName: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'contact_id', nullable: true }) contactId: string;
  @Column({ name: 'lead_id', nullable: true }) leadId: string;
  @Column({ name: 'stage_id' }) stageId: string;
  @Column({ name: 'deal_value', type: 'decimal', precision: 18, scale: 2, nullable: true }) dealValue: number;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ default: 0 }) probability: number;
  @Column({ name: 'expected_close', nullable: true }) expectedClose: Date;
  @Column({ name: 'actual_close', nullable: true }) actualClose: Date;
  @Column({ name: 'lost_reason_id', nullable: true }) lostReasonId: string;
  @Column({ nullable: true }) competitor: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'next_step', nullable: true }) nextStep: string;
  @Column({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @Column({ type: 'text', array: true, default: '{}' }) tags: string[];
  @Column({ name: 'custom_fields', type: 'jsonb', default: '{}' }) customFields: Record<string, any>;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('opportunity_products')
export class OpportunityProduct {
  @PrimaryGeneratedColumn('uuid') opProductId: string;
  @Column({ name: 'opportunity_id' }) opportunityId: string;
  @Column({ name: 'product_name' }) productName: string;
  @Column({ name: 'product_code', nullable: true }) productCode: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 2, nullable: true }) unitPrice: number;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'total_price', type: 'decimal', precision: 18, scale: 2, nullable: true }) totalPrice: number;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
}

@Entity('opportunity_stage_history')
export class OpportunityStageHistory {
  @PrimaryGeneratedColumn('uuid') historyId: string;
  @Column({ name: 'opportunity_id' }) opportunityId: string;
  @Column({ name: 'from_stage_id', nullable: true }) fromStageId: string;
  @Column({ name: 'to_stage_id' }) toStageId: string;
  @Column({ name: 'changed_by', nullable: true }) changedBy: string;
  @CreateDateColumn({ name: 'changed_at' }) changedAt: Date;
  @Column({ nullable: true }) notes: string;
}
