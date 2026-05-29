import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {
  ProjectEntity, StageEntity, TaskEntity, TaskDocumentEntity,
  TaskCommentEntity, ResourceEntity, MilestoneEntity, BudgetEntryEntity,
  ChangeRequestEntity, RiskEntity, MeetingEntity,
} from './pm.entities';
import { JwtStrategy } from './auth.guard';
import {
  ProjectsController, StagesController, TasksController,
  TaskDocumentsController, TaskCommentsController, ResourcesController,
  MilestonesController, BudgetController, ChangeRequestsController,
  RisksController, MeetingsController, DashboardController,
} from './projects/pm.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres-core',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'crm_core',
      username: process.env.DB_USER || 'crm_user',
      password: process.env.DB_PASS || 'crm_password_2024',
      entities: [
        ProjectEntity, StageEntity, TaskEntity, TaskDocumentEntity,
        TaskCommentEntity, ResourceEntity, MilestoneEntity, BudgetEntryEntity,
        ChangeRequestEntity, RiskEntity, MeetingEntity,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      ProjectEntity, StageEntity, TaskEntity, TaskDocumentEntity,
      TaskCommentEntity, ResourceEntity, MilestoneEntity, BudgetEntryEntity,
      ChangeRequestEntity, RiskEntity, MeetingEntity,
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'crm_jwt_super_secret_2024_change_in_production',
    }),
  ],
  controllers: [
    ProjectsController, StagesController, TasksController,
    TaskDocumentsController, TaskCommentsController, ResourcesController,
    MilestonesController, BudgetController, ChangeRequestsController,
    RisksController, MeetingsController, DashboardController,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
