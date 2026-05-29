// ─── activity.entity.ts ───────────────────────────────────────────────────────
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('activities')
@Index(['tenantId'])
@Index(['tenantId', 'assignedTo'])
@Index(['tenantId', 'dueDate'])
@Index(['relatedToType', 'relatedToId'])
export class Activity {
  @PrimaryGeneratedColumn('uuid') activityId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'activity_type_id' }) activityTypeId: string;
  @Column() subject: string;
  @Column({ nullable: true }) description: string;
  @Column({ default: 'PLANNED' }) status: string; // PLANNED | COMPLETED | CANCELLED
  @Column({ name: 'outcome_id', nullable: true }) outcomeId: string;
  @Column({ default: 'MEDIUM' }) priority: string;
  @Column({ name: 'due_date', nullable: true }) dueDate: Date;
  @Column({ name: 'start_date', nullable: true }) startDate: Date;
  @Column({ name: 'completed_date', nullable: true }) completedDate: Date;
  @Column({ name: 'duration_minutes', nullable: true }) durationMinutes: number;
  @Column({ nullable: true }) location: string;
  @Column({ name: 'related_to_type', nullable: true }) relatedToType: string;
  @Column({ name: 'related_to_id', nullable: true }) relatedToId: string;
  @Column({ name: 'related_to_name', nullable: true }) relatedToName: string;
  @Column({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @Column({ name: 'is_private', default: false }) isPrivate: boolean;
  @Column({ name: 'reminder_minutes', nullable: true }) reminderMinutes: number;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
