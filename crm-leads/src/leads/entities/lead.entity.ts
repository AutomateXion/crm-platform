import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('leads')
@Index(['tenantId'])
@Index(['tenantId', 'leadStatusId'])
@Index(['tenantId', 'assignedTo'])
export class Lead {
  @PrimaryGeneratedColumn('uuid') leadId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'lead_number', nullable: true }) leadNumber: string;
  @Column({ name: 'title_id', nullable: true }) titleId: string;
  @Column({ name: 'first_name', nullable: true }) firstName: string;
  @Column({ name: 'last_name', nullable: true }) lastName: string;
  @Column({ name: 'company_name', nullable: true }) companyName: string;
  @Column({ name: 'job_title', nullable: true }) jobTitle: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) mobile: string;
  @Column({ name: 'lead_source_id', nullable: true }) leadSourceId: string;
  @Column({ name: 'lead_status_id', nullable: true }) leadStatusId: string;
  @Column({ name: 'industry_id', nullable: true }) industryId: string;
  @Column({ name: 'country_id', nullable: true }) countryId: string;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true }) website: string;
  @Column({ name: 'estimated_value', type: 'decimal', precision: 18, scale: 2, nullable: true }) estimatedValue: number;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'lead_score', default: 0 }) leadScore: number;
  @Column({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @Column({ type: 'text', array: true, default: '{}' }) tags: string[];
  @Column({ name: 'custom_fields', type: 'jsonb', default: '{}' }) customFields: Record<string, any>;
  @Column({ default: false }) converted: boolean;
  @Column({ name: 'converted_at', nullable: true }) convertedAt: Date;
  @Column({ name: 'converted_account_id', nullable: true }) convertedAccountId: string;
  @Column({ name: 'converted_contact_id', nullable: true }) convertedContactId: string;
  @Column({ name: 'converted_opportunity_id', nullable: true }) convertedOpportunityId: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
