import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SubModule } from './sub-module.entity';

@Entity('modules')
export class AppModule {
  @PrimaryGeneratedColumn('uuid', { name: 'module_id' })
  moduleId: string;

  @Column({ name: 'module_code', length: 50, unique: true })
  moduleCode: string;

  @Column({ name: 'module_name', length: 100 })
  moduleName: string;

  @Column({ name: 'module_name_ar', length: 100, nullable: true })
  moduleNameAr: string;

  @Column({ name: 'module_icon', length: 100, nullable: true })
  moduleIcon: string;

  @Column({ name: 'module_color', length: 7, nullable: true })
  moduleColor: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_core', default: false })
  isCore: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => SubModule, sm => sm.module)
  subModules: SubModule[];
}
