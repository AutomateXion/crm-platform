import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports/reports.service';
import { SavedReport } from './reports/entities/report.entity';
import { Dashboard, DashboardWidget } from './reports/entities/dashboard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedReport, Dashboard, DashboardWidget])],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
