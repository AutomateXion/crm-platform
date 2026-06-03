import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { UserGroup } from './user-group.entity';

@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'user_group_id', nullable: true })
  userGroupId: string;

  @Column({ length: 255 })
  email: string;

  @Column({ name: 'full_name', length: 200 })
  fullName: string;

  @Column({ name: 'full_name_ar', length: 200, nullable: true })
  fullNameAr: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
  @Column({ name: 'is_super_admin', default: false }) isSuperAdmin: boolean;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'email_verify_token', nullable: true })
  emailVerifyToken: string;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', nullable: true })
  passwordResetExpires: Date;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', nullable: true, select: false })
  twoFactorSecret: string;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @Column({ name: 'login_count', default: 0 })
  loginCount: number;

  @Column({ name: 'failed_login_count', default: 0 })
  failedLoginCount: number;

  @Column({ name: 'locked_until', nullable: true })
  lockedUntil: Date;

  @Column({ nullable: true })
  timezone: string;

  @Column({ length: 5, default: 'en' })
  language: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => UserGroup)
  @JoinColumn({ name: 'user_group_id' })
  userGroup: UserGroup;
}
