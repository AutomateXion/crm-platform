import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid', { name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'tenant_code', length: 50, unique: true })
  tenantCode: string;

  @Column({ name: 'company_name', length: 200 })
  companyName: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ name: 'subscription_plan', length: 50, default: 'STARTER' })
  subscriptionPlan: string;

  @Column({ name: 'active_modules', type: 'text', array: true, default: '{}' })
  activeModules: string[];

  @Column({ default: 'Asia/Muscat' })
  timezone: string;

  @Column({ name: 'date_format', default: 'DD/MM/YYYY' })
  dateFormat: string;

  @Column({ name: 'currency_code', length: 3, default: 'OMR' })
  currencyCode: string;

  @Column({ name: 'costing_method', default: 'WEIGHTED_AVG', nullable: true })
  costingMethod: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;
  @Column({ name: 'address_line1', nullable: true }) addressLine1: string;
  @Column({ name: 'address_line2', nullable: true }) addressLine2: string;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true, default: 'Oman' }) country: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) website: string;
  @Column({ nullable: true }) trn: string;
  @Column({ name: 'po_box', nullable: true }) poBox: string;
  @Column({ nullable: true }) fax: string;
  @Column({ type: 'jsonb', nullable: true, default: '{}' }) settings: any;

  @Column({ name: 'primary_color', length: 7, default: '#1890ff' })
  primaryColor: string;

  @Column({ length: 5, default: 'en' })
  language: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'trial_ends_at', nullable: true })
  trialEndsAt: Date;

  @Column({ name: 'max_users', default: 10 })
  maxUsers: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
