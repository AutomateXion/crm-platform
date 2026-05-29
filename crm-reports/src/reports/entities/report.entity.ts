import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('saved_reports')
@Index(['tenantId'])
export class SavedReport {
  @PrimaryGeneratedColumn('uuid') reportId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'report_name' }) reportName: string;
  @Column({ name: 'module_code', nullable: true }) moduleCode: string;
  @Column({ name: 'report_type', nullable: true }) reportType: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'jsonb', default: '{}' }) filters: Record<string, any>;
  @Column({ name: 'columns_config', type: 'jsonb', default: '[]' }) columnsConfig: any[];
  @Column({ type: 'jsonb', default: '{}' }) grouping: Record<string, any>;
  @Column({ type: 'jsonb', default: '{}' }) sorting: Record<string, any>;
  @Column({ name: 'chart_config', type: 'jsonb', default: '{}' }) chartConfig: Record<string, any>;
  @Column({ name: 'is_shared', default: false }) isShared: boolean;
  @Column({ name: 'is_system', default: false }) isSystem: boolean;
  @Column({ nullable: true }) category: string;
  @Column({ name: 'run_count', default: 0 }) runCount: number;
  @Column({ name: 'last_run_at', nullable: true }) lastRunAt: Date;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
