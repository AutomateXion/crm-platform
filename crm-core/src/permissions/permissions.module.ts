import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from './entities/permission.entity';
import { AppModule as CrmModule } from './entities/module.entity';
import { SubModule, Page, Field } from './entities/sub-module.entity';
import { UserGroup } from '../users/entities/user-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, CrmModule, SubModule, Page, Field, UserGroup]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
