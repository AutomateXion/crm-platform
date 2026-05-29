import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MastersService } from './masters.service';
import { MastersController } from './masters.controller';
import { MasterCategory, MasterValue } from './entities/master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MasterCategory, MasterValue])],
  controllers: [MastersController],
  providers: [MastersService],
  exports: [MastersService],
})
export class MastersModule {}
