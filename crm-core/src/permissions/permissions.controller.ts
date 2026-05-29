import {
  Controller, Get, Post, Body, Param,
  UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SetPermissionsDto } from './dto/set-permissions.dto';
import { CopyPermissionsDto } from './dto/copy-permissions.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // GET /api/v1/permissions/my-map
  // Called by frontend on login to load full permission map
  @Get('my-map')
  @ApiOperation({ summary: 'Get permission map for current user' })
  async getMyPermissions(@CurrentUser() user: User) {
    return this.permissionsService.getPermissionMap(user.tenantId, user.userGroupId);
  }

  // GET /api/v1/permissions/modules
  // Returns full module hierarchy (used by permission matrix UI)
  @Get('modules')
  @ApiOperation({ summary: 'Get full module/sub-module/page/field hierarchy' })
  async getModuleHierarchy() {
    return this.permissionsService.getModuleHierarchy();
  }

  // GET /api/v1/permissions/grid/:userGroupId
  // Returns the permission grid for a user group (for the admin UI)
  @Get('grid/:userGroupId')
  @ApiOperation({ summary: 'Get permission grid for a user group' })
  async getPermissionsGrid(
    @CurrentUser() user: User,
    @Param('userGroupId') userGroupId: string,
  ) {
    return this.permissionsService.getPermissionsGrid(user.tenantId, userGroupId);
  }

  // POST /api/v1/permissions/set
  // Save the full permission matrix for a user group
  @Post('set')
  @ApiOperation({ summary: 'Set permissions for a user group (replaces all existing)' })
  async setPermissions(
    @CurrentUser() user: User,
    @Body() dto: SetPermissionsDto,
  ) {
    await this.permissionsService.setPermissions(user.tenantId, dto, user.userId);
    return { message: 'Permissions saved successfully' };
  }

  // POST /api/v1/permissions/copy
  // Copy permissions from one group to another
  @Post('copy')
  @ApiOperation({ summary: 'Copy permissions from one user group to another' })
  async copyPermissions(
    @CurrentUser() user: User,
    @Body() dto: CopyPermissionsDto,
  ) {
    await this.permissionsService.copyPermissions(
      user.tenantId,
      dto.sourceGroupId,
      dto.targetGroupId,
      user.userId,
    );
    return { message: 'Permissions copied successfully' };
  }
}
