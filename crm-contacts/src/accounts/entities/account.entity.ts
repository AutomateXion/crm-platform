import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, ManyToOne, JoinColumn,
} from 'typeorm';

// ─── Account Entity ───────────────────────────────────────────────────────────
@Entity('accounts')
@Index(['tenantId'])
@Index(['tenantId', 'accountName'])
export class Account {
  @PrimaryGeneratedColumn('uuid') accountId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'account_name', length: 200 }) accountName: string;
  @Column({ name: 'account_type_id', nullable: true }) accountTypeId: string;
  @Column({ name: 'industry_id', nullable: true }) industryId: string;
  @Column({ nullable: true }) website: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) email: string;
  @Column({ name: 'address_line1', nullable: true }) addressLine1: string;
  @Column({ name: 'address_line2', nullable: true }) addressLine2: string;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true }) state: string;
  @Column({ name: 'country_id', nullable: true }) countryId: string;
  @Column({ name: 'postal_code', nullable: true }) postalCode: string;
  @Column({ name: 'annual_revenue', type: 'decimal', precision: 18, scale: 2, nullable: true }) annualRevenue: number;
  @Column({ name: 'employee_count', nullable: true }) employeeCount: number;
  @Column({ name: 'parent_account_id', nullable: true }) parentAccountId: string;
  @Column({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'text', array: true, default: '{}' }) tags: string[];
  @Column({ name: 'custom_fields', type: 'jsonb', default: '{}' }) customFields: Record<string, any>;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ─── Contact Entity ───────────────────────────────────────────────────────────
@Entity('contacts')
@Index(['tenantId'])
@Index(['tenantId', 'email'])
export class Contact {
  @PrimaryGeneratedColumn('uuid') contactId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'title_id', nullable: true }) titleId: string;
  @Column({ name: 'first_name', length: 100 }) firstName: string;
  @Column({ name: 'last_name', length: 100 }) lastName: string;
  @Column({ name: 'job_title', nullable: true }) jobTitle: string;
  @Column({ nullable: true }) department: string;
  @Column({ nullable: true }) email: string;
  @Column({ name: 'email_secondary', nullable: true }) emailSecondary: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) mobile: string;
  @Column({ name: 'contact_role_id', nullable: true }) contactRoleId: string;
  @Column({ name: 'date_of_birth', nullable: true }) dateOfBirth: Date;
  @Column({ name: 'linkedin_url', nullable: true }) linkedinUrl: string;
  @Column({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'text', array: true, default: '{}' }) tags: string[];
  @Column({ name: 'custom_fields', type: 'jsonb', default: '{}' }) customFields: Record<string, any>;
  @Column({ name: 'is_primary', default: false }) isPrimary: boolean;
  @Column({ name: 'do_not_contact', default: false }) doNotContact: boolean;
  @Column({ name: 'do_not_email', default: false }) doNotEmail: boolean;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ─── AccountNote Entity ───────────────────────────────────────────────────────
@Entity('account_notes')
export class AccountNote {
  @PrimaryGeneratedColumn('uuid') noteId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'contact_id', nullable: true }) contactId: string;
  @Column({ name: 'note_type_id', nullable: true }) noteTypeId: string;
  @Column({ name: 'note_text', type: 'text' }) noteText: string;
  @Column({ name: 'is_pinned', default: false }) isPinned: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
