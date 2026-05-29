// ─── campaign.entity.ts ───────────────────────────────────────────────────────
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('campaigns')
@Index(['tenantId'])
export class Campaign {
  @PrimaryGeneratedColumn('uuid') campaignId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'campaign_name' }) campaignName: string;
  @Column({ name: 'campaign_type_id', nullable: true }) campaignTypeId: string;
  @Column({ name: 'status_id', nullable: true }) statusId: string;
  @Column({ name: 'start_date', nullable: true }) startDate: Date;
  @Column({ name: 'end_date', nullable: true }) endDate: Date;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true }) budget: number;
  @Column({ name: 'actual_spend', type: 'decimal', precision: 18, scale: 2, default: 0 }) actualSpend: number;
  @Column({ name: 'target_audience', nullable: true }) targetAudience: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'expected_leads', default: 0 }) expectedLeads: number;
  @Column({ name: 'actual_leads', default: 0 }) actualLeads: number;
  @Column({ name: 'expected_revenue', type: 'decimal', precision: 18, scale: 2, nullable: true }) expectedRevenue: number;
  @Column({ name: 'actual_revenue', type: 'decimal', precision: 18, scale: 2, default: 0 }) actualRevenue: number;
  @Column({ name: 'email_subject', nullable: true }) emailSubject: string;
  @Column({ name: 'email_body', nullable: true }) emailBody: string;
  @Column({ type: 'text', array: true, default: '{}' }) tags: string[];
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('campaign_members')
@Index(['campaignId'])
export class CampaignMember {
  @PrimaryGeneratedColumn('uuid') memberId: string;
  @Column({ name: 'campaign_id' }) campaignId: string;
  @Column({ name: 'contact_id', nullable: true }) contactId: string;
  @Column({ name: 'lead_id', nullable: true }) leadId: string;
  @Column({ nullable: true }) email: string;
  @Column({ name: 'full_name', nullable: true }) fullName: string;
  @Column({ default: 'ADDED' }) status: string;
  @Column({ name: 'sent_at', nullable: true }) sentAt: Date;
  @Column({ name: 'opened_at', nullable: true }) openedAt: Date;
  @Column({ name: 'clicked_at', nullable: true }) clickedAt: Date;
  @Column({ name: 'responded_at', nullable: true }) respondedAt: Date;
  @Column({ default: false }) converted: boolean;
  @Column({ name: 'converted_at', nullable: true }) convertedAt: Date;
  @Column({ default: false }) unsubscribed: boolean;
}
