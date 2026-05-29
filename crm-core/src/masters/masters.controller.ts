import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { MastersService } from './masters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  CreateMasterValueDto,
  UpdateMasterValueDto,
  ReorderMasterValuesDto,
  BulkGetValuesDto,
} from './dto/create-master-value.dto';

@ApiTags('Masters')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  // GET /api/v1/masters/categories
  @Get('categories')
  @ApiOperation({ summary: 'Get all master categories' })
  @ApiQuery({ name: 'module', required: false })
  async getCategories(@Query('module') moduleCode?: string) {
    return this.mastersService.getCategories(moduleCode);
  }

  // GET /api/v1/masters/all-with-values
  // Returns everything — used by admin Master Management page
  @Get('all-with-values')
  @ApiOperation({ summary: 'Get all categories with their values (admin page)' })
  async getAllWithValues(@CurrentUser() user: User) {
    return this.mastersService.getAllWithValues(user.tenantId);
  }

  // POST /api/v1/masters/bulk-values
  // Used by module pages to fetch all needed dropdowns in one call
  @Post('bulk-values')
  @ApiOperation({ summary: 'Get values for multiple categories in one request' })
  async getBulkValues(@CurrentUser() user: User, @Body() dto: BulkGetValuesDto) {
    return this.mastersService.getBulkValues(user.tenantId, dto.categoryCodes);
  }

  // GET /api/v1/masters/:categoryCode/values
  @Get(':categoryCode/values')
  @ApiOperation({ summary: 'Get all values for a category' })
  async getValues(
    @CurrentUser() user: User,
    @Param('categoryCode') categoryCode: string,
  ) {
    return this.mastersService.getValues(categoryCode, user.tenantId);
  }

  // POST /api/v1/masters/:categoryCode/values
  @Post(':categoryCode/values')
  @ApiOperation({ summary: 'Create a new master value' })
  async createValue(
    @CurrentUser() user: User,
    @Param('categoryCode') categoryCode: string,
    @Body() dto: CreateMasterValueDto,
  ) {
    return this.mastersService.createValue(user.tenantId, categoryCode, dto, user.userId);
  }

  // PUT /api/v1/masters/values/:valueId
  @Put('values/:valueId')
  @ApiOperation({ summary: 'Update a master value' })
  async updateValue(
    @CurrentUser() user: User,
    @Param('valueId') valueId: string,
    @Body() dto: UpdateMasterValueDto,
  ) {
    return this.mastersService.updateValue(user.tenantId, valueId, dto);
  }

  // DELETE /api/v1/masters/values/:valueId
  @Delete('values/:valueId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a master value' })
  async deleteValue(@CurrentUser() user: User, @Param('valueId') valueId: string) {
    await this.mastersService.deleteValue(user.tenantId, valueId);
    return { message: 'Value deactivated successfully' };
  }

  // PATCH /api/v1/masters/reorder
  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder master values via drag-drop' })
  async reorderValues(@CurrentUser() user: User, @Body() dto: ReorderMasterValuesDto) {
    await this.mastersService.reorderValues(user.tenantId, dto);
    return { message: 'Order saved' };
  }
}
