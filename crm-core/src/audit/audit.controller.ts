// ─── audit.controller.ts ─────────────────────────────────────────────────────
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Audit Trail')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit trail logs with filters' })
  async getLogs(
    @CurrentUser() user: User,
    @Query('userId') userId?: string,
    @Query('module') module?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.auditService.getLogs(user.tenantId, {
      userId, module, entityType, entityId, action,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: +page, limit: +limit,
    });
  }
}
