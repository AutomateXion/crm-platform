import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsService } from './campaigns/campaigns.service';
import { Campaign, CampaignMember } from './campaigns/entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, CampaignMember])],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class MarketingModule {}
