import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── User Groups ─────────────────────────────────────────────

  @Post('groups')
  @ApiOperation({ summary: 'Create a new user group (role)' })
  async createUserGroup(@CurrentUser() user: User, @Body() dto: CreateUserGroupDto) {
    return this.usersService.createUserGroup(user.tenantId, dto, user.userId);
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all user groups for tenant' })
  async getUserGroups(@CurrentUser() user: User) {
    return this.usersService.getUserGroups(user.tenantId);
  }

  @Get('groups/:id')
  @ApiOperation({ summary: 'Get a specific user group' })
  async getUserGroup(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.getUserGroup(user.tenantId, id);
  }

  @Put('groups/:id')
  @ApiOperation({ summary: 'Update user group' })
  async updateUserGroup(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateUserGroupDto,
  ) {
    return this.usersService.updateUserGroup(user.tenantId, id, dto, user.userId);
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Deactivate user group' })
  async deleteUserGroup(@CurrentUser() user: User, @Param('id') id: string) {
    await this.usersService.deleteUserGroup(user.tenantId, id, user.userId);
    return { message: 'User group deactivated' };
  }

  // ─── Users ───────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async createUser(@CurrentUser() user: User, @Body() dto: CreateUserDto) {
    return this.usersService.createUser(user.tenantId, dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'userGroupId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getUsers(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('userGroupId') userGroupId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.usersService.getUsers(user.tenantId, +page, +limit, search, userGroupId, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user' })
  async getUser(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.getUser(user.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(user.tenantId, id, dto, user.userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate user' })
  async toggleStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    await this.usersService.toggleUserStatus(user.tenantId, id, isActive, user.userId);
    return { message: `User ${isActive ? 'activated' : 'deactivated'}` };
  }

  @Patch(':id/reset-password')
  @ApiOperation({ summary: 'Admin reset user password' })
  async resetPassword(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.usersService.resetPassword(user.tenantId, id, newPassword, user.userId);
    return { message: 'Password reset successfully' };
  }

  @Patch('me/change-password')
  @ApiOperation({ summary: 'Change own password' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    await this.usersService.changeOwnPassword(
      user.userId, body.currentPassword, body.newPassword,
    );
    return { message: 'Password changed successfully' };
  }
}
