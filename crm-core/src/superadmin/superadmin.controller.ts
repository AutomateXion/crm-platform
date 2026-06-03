import { Controller, Get, Post, Put, Param, Body, Request, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminService } from './superadmin.service';

@Controller('superadmin')
@UseGuards(JwtAuthGuard)
export class SuperAdminController {
  constructor(private readonly svc: SuperAdminService) {}

  private checkSuperAdmin(req: any) {
    if (!req.user?.isSuperAdmin) throw new UnauthorizedException('Super admin access required');
  }

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    this.checkSuperAdmin(req);
    return this.svc.getDashboard();
  }

  @Get('tenants')
  getTenants(@Request() req: any, @Query() q: any) {
    this.checkSuperAdmin(req);
    return this.svc.getTenants(q.search, q.plan, q.status);
  }

  @Post('tenants')
  createTenant(@Request() req: any, @Body() dto: any) {
    this.checkSuperAdmin(req);
    return this.svc.createTenant(dto);
  }

  @Put('tenants/:id')
  updateTenant(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    this.checkSuperAdmin(req);
    return this.svc.updateTenant(id, dto);
  }

  @Put('tenants/:id/suspend')
  suspendTenant(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    this.checkSuperAdmin(req);
    return this.svc.suspendTenant(id, dto.reason);
  }

  @Put('tenants/:id/activate')
  activateTenant(@Request() req: any, @Param('id') id: string) {
    this.checkSuperAdmin(req);
    return this.svc.activateTenant(id);
  }

  @Get('tenants/:id/stats')
  getTenantStats(@Request() req: any, @Param('id') id: string) {
    this.checkSuperAdmin(req);
    return this.svc.getTenantStats(id);
  }

  @Get('users')
  getUsers(@Request() req: any, @Query() q: any) {
    this.checkSuperAdmin(req);
    return this.svc.getUsers(q.tenantId, q.search);
  }

  @Put('users/:id/toggle')
  toggleUser(@Request() req: any, @Param('id') id: string) {
    this.checkSuperAdmin(req);
    return this.svc.toggleUser(id);
  }

  @Get('system-health')
  getSystemHealth(@Request() req: any) {
    this.checkSuperAdmin(req);
    return this.svc.getSystemHealth();
  }
}
