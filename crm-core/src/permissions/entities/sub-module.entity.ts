import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, OneToMany, Index,
} from 'typeorm';
import { AppModule } from './module.entity';

// ─── SubModule ────────────────────────────────────────────────────────────────
@Entity('sub_modules')
@Index(['moduleId', 'subModuleCode'], { unique: true })
export class SubModule {
  @PrimaryGeneratedColumn('uuid', { name: 'sub_module_id' })
  subModuleId: string;

  @Column({ name: 'module_id' })
  moduleId: string;

  @Column({ name: 'sub_module_code', length: 50 })
  subModuleCode: string;

  @Column({ name: 'sub_module_name', length: 100 })
  subModuleName: string;

  @Column({ name: 'sub_module_name_ar', length: 100, nullable: true })
  subModuleNameAr: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => AppModule, m => m.subModules)
  @JoinColumn({ name: 'module_id' })
  module: AppModule;

  @OneToMany(() => Page, p => p.subModule)
  pages: Page[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
@Entity('pages')
@Index(['subModuleId', 'pageCode'], { unique: true })
export class Page {
  @PrimaryGeneratedColumn('uuid', { name: 'page_id' })
  pageId: string;

  @Column({ name: 'sub_module_id' })
  subModuleId: string;

  @Column({ name: 'page_code', length: 50 })
  pageCode: string;

  @Column({ name: 'page_name', length: 100 })
  pageName: string;

  @Column({ name: 'page_name_ar', length: 100, nullable: true })
  pageNameAr: string;

  @Column({ name: 'page_route', length: 200, nullable: true })
  pageRoute: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => SubModule, sm => sm.pages)
  @JoinColumn({ name: 'sub_module_id' })
  subModule: SubModule;

  @OneToMany(() => Field, f => f.page)
  fields: Field[];
}

// ─── Field ────────────────────────────────────────────────────────────────────
@Entity('fields')
@Index(['pageId', 'fieldCode'], { unique: true })
export class Field {
  @PrimaryGeneratedColumn('uuid', { name: 'field_id' })
  fieldId: string;

  @Column({ name: 'page_id' })
  pageId: string;

  @Column({ name: 'field_code', length: 100 })
  fieldCode: string;

  @Column({ name: 'field_label', length: 100 })
  fieldLabel: string;

  @Column({ name: 'field_label_ar', length: 100, nullable: true })
  fieldLabelAr: string;

  @Column({ name: 'field_type', length: 50 })
  fieldType: string; // text, number, date, dropdown, email, phone, textarea, boolean, currency

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Page, p => p.fields)
  @JoinColumn({ name: 'page_id' })
  page: Page;
}
