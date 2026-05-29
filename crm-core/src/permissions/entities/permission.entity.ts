import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum PermissionLevel {
  FULL_ACCESS = 'FA',   // Can view and edit
  VIEW_ONLY   = 'VO',   // Can see, cannot change
  HIDDEN      = 'HI',   // Element not visible at all
  NO_ACCESS   = 'NA',   // Module/page blocked
  MANDATORY   = 'MA',   // Field is mandatory (combined with FA)
}

@Entity('permissions')
@Index(['tenantId', 'userGroupId', 'moduleId', 'subModuleId', 'pageId', 'fieldId'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid', { name: 'permission_id' })
  permissionId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'user_group_id' })
  userGroupId: string;

  @Column({ name: 'module_id', nullable: true })
  moduleId: string;

  @Column({ name: 'sub_module_id', nullable: true })
  subModuleId: string;

  @Column({ name: 'page_id', nullable: true })
  pageId: string;

  @Column({ name: 'field_id', nullable: true })
  fieldId: string;

  @Column({
    name: 'permission_level',
    type: 'varchar',
    length: 10,
    default: PermissionLevel.NO_ACCESS,
  })
  permissionLevel: PermissionLevel;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
