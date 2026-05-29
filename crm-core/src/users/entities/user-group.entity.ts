import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('user_groups')
@Index(['tenantId', 'groupCode'], { unique: true })
export class UserGroup {
  @PrimaryGeneratedColumn('uuid', { name: 'user_group_id' })
  userGroupId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'group_code', length: 50 })
  groupCode: string;

  @Column({ name: 'group_name', length: 100 })
  groupName: string;

  @Column({ name: 'group_name_ar', length: 100, nullable: true })
  groupNameAr: string;

  @Column({ name: 'is_system_group', default: false })
  isSystemGroup: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
