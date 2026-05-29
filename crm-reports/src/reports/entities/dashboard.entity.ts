import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('dashboards')
@Index(['tenantId'])
export class Dashboard {
  @PrimaryGeneratedColumn('uuid') dashboardId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'dashboard_name' }) dashboardName: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'jsonb', default: '[]' }) layout: any[];
  @Column({ name: 'is_default', default: false }) isDefault: boolean;
  @Column({ name: 'is_shared', default: false }) isShared: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('dashboard_widgets')
@Index(['dashboardId'])
export class DashboardWidget {
  @PrimaryGeneratedColumn('uuid') widgetId: string;
  @Column({ name: 'dashboard_id' }) dashboardId: string;
  @Column({ name: 'report_id', nullable: true }) reportId: string;
  @Column({ name: 'widget_type', nullable: true }) widgetType: string;
  @Column({ name: 'widget_title', nullable: true }) widgetTitle: string;
  @Column({ type: 'jsonb', default: '{}' }) config: Record<string, any>;
  @Column({ name: 'position_x', default: 0 }) positionX: number;
  @Column({ name: 'position_y', default: 0 }) positionY: number;
  @Column({ default: 4 }) width: number;
  @Column({ default: 3 }) height: number;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
}
