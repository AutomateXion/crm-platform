import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsController } from './contacts.controller';
import { LeadsController } from './leads.controller';
import { OpportunitiesController } from './opportunities.controller';
import { ActivitiesController } from './activities.controller';
import { CrmDashboardController } from './crm-dashboard.controller';
import { VisitsController } from './visits.controller';
import { AccountEntity, ContactEntity, LeadEntity, OpportunityEntity, ActivityEntity, OpportunityItemEntity, CustomerVisitEntity } from './contacts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    AccountEntity, ContactEntity, LeadEntity, OpportunityEntity,
    ActivityEntity, OpportunityItemEntity, CustomerVisitEntity
  ])],
  controllers: [
    ContactsController, LeadsController, OpportunitiesController,
    ActivitiesController, CrmDashboardController, VisitsController
  ],
})
export class ContactsInlineModule {}
