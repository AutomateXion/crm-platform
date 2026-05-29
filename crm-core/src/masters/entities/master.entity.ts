import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Index, OneToMany,
} from 'typeorm';

// ─── MasterCategory ───────────────────────────────────────────────────────────
@Entity('master_categories')
export class MasterCategory {
  @PrimaryGeneratedColumn('uuid', { name: 'category_id' })
  categoryId: string;

  @Column({ name: 'category_code', length: 50, unique: true })
  categoryCode: string;

  @Column({ name: 'category_name', length: 100 })
  categoryName: string;

  @Column({ name: 'category_name_ar', length: 100, nullable: true })
  categoryNameAr: string;

  @Column({ name: 'module_id', nullable: true })
  moduleId: string;

  @Column({ name: 'is_global', default: false })
  isGlobal: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => MasterValue, v => v.category)
  values: MasterValue[];
}

// ─── MasterValue ──────────────────────────────────────────────────────────────
@Entity('master_values')
@Index(['categoryId', 'tenantId', 'valueCode'], { unique: true })
export class MasterValue {
  @PrimaryGeneratedColumn('uuid', { name: 'value_id' })
  valueId: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;   // NULL = global value shared by all tenants

  @Column({ name: 'value_code', length: 100 })
  valueCode: string;

  @Column({ name: 'value_label', length: 200 })
  valueLabel: string;

  @Column({ name: 'value_label_ar', length: 200, nullable: true })
  valueLabelAr: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'color_code', length: 7, nullable: true })
  colorCode: string;

  @Column({ name: 'icon_code', length: 50, nullable: true })
  iconCode: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;   // System values cannot be deleted

  @Column({ name: 'parent_value_id', nullable: true })
  parentValueId: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => MasterCategory, c => c.values)
  @JoinColumn({ name: 'category_id' })
  category: MasterCategory;
}
