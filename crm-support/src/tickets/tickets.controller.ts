import {
  Controller, Get, Post, Put, Patch, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTicketDto, UpdateTicketDto, AddCommentDto, ResolveTicketDto, SatisfactionDto } from './dto/ticket.dto';

@ApiTags('Support Tickets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly svc: TicketsService) {}

  @Post()
  create(@CurrentUser() u: any, @Body() dto: CreateTicketDto) {
    return this.svc.create(u.tenantId, dto, u.userId);
  }

  @Get()
  findAll(@CurrentUser() u: any, @Query() query: any) {
    return this.svc.findAll(u.tenantId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Dashboard KPIs for support' })
  getSummary(@CurrentUser() u: any) {
    return this.svc.getSummary(u.tenantId);
  }

  @Get('by-category')
  getVolumeByCategory(@CurrentUser() u: any) {
    return this.svc.getVolumeByCategory(u.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() u: any, @Param('id') id: string) {
    return this.svc.findOne(u.tenantId, id);
  }

  @Put(':id')
  update(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.svc.update(u.tenantId, id, dto, u.userId);
  }

  @Patch(':id/resolve')
  resolve(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: ResolveTicketDto) {
    return this.svc.resolve(u.tenantId, id, dto, u.userId);
  }

  @Patch(':id/close')
  close(@CurrentUser() u: any, @Param('id') id: string) {
    return this.svc.close(u.tenantId, id);
  }

  @Post(':id/comments')
  addComment(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: AddCommentDto) {
    return this.svc.addComment(u.tenantId, id, dto, u.userId);
  }

  @Get(':id/comments')
  getComments(
    @CurrentUser() u: any,
    @Param('id') id: string,
    @Query('internal') internal: string,
  ) {
    return this.svc.getComments(u.tenantId, id, internal === 'true');
  }

  @Patch(':id/satisfaction')
  submitSatisfaction(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: SatisfactionDto) {
    return this.svc.submitSatisfaction(u.tenantId, id, dto.score, dto.note);
  }
}
