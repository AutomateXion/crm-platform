// ─── tenants.controller.ts ────────────────────────────────────────────────────
import { Controller, Get, Put, Patch, Post, Body, UseGuards, SetMetadata, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';

@ApiTags('Tenants')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current tenant settings' })
  async getMyTenant(@CurrentUser() user: User) {
    return this.tenantsService.getTenant(user.tenantId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update tenant settings (logo, colors, formats)' })
  async updateTenant(@CurrentUser() user: User, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.updateTenant(user.tenantId, dto);
  }

  @Patch('me/modules')
  @ApiOperation({ summary: 'Update active modules for tenant' })
  async updateModules(@CurrentUser() user: User, @Body('modules') modules: string[]) {
    return this.tenantsService.updateActiveModules(user.tenantId, modules);
  }

  @Get('company-settings')
  async getCompanySettings(@CurrentUser() user: User) {
    return this.tenantsService.getTenant(user.tenantId);
  }

  @Put('company-settings')
  async updateCompanySettings(@CurrentUser() user: User, @Body() dto: any) {
    return this.tenantsService.updateTenant(user.tenantId, dto);
  }

  @Get('accounting-config')
  async getAccountingConfig(@CurrentUser() user: User) {
    return this.tenantsService.getAccountingConfig(user.tenantId);
  }

  @Post('accounting-config')
  async saveAccountingConfig(@CurrentUser() user: User, @Body() dto: any) {
    return this.tenantsService.saveAccountingConfig(user.tenantId, dto);
  }

  @Get('email-config')
  async getEmailConfig(@CurrentUser() user: User) {
    return this.tenantsService.getEmailConfig(user.tenantId);
  }

  @Post('email-config')
  async saveEmailConfig(@CurrentUser() user: User, @Body() dto: any) {
    return this.tenantsService.saveEmailConfig(user.tenantId, dto);
  }

  @Post('email-config/test')
  async testEmailConfig(@CurrentUser() user: User, @Body() dto: any) {
    return this.tenantsService.testEmailConfig(user.tenantId, dto.to);
  }

  // System-level: provision new tenant (called by super admin only)
  @Post('provision')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Provision a new tenant (super admin only)' })
  async provisionTenant(@Body() dto: CreateTenantDto) {
    return this.tenantsService.createTenant(dto);
  }
}
