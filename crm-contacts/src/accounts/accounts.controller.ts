// ─── accounts.controller.ts ───────────────────────────────────────────────────
import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateNoteDto } from './dto/create-note.dto';

@ApiTags('Accounts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly svc: AccountsService) {}

  @Post()
  create(@CurrentUser() u: any, @Body() dto: CreateAccountDto) {
    return this.svc.create(u.tenantId, dto, u.userId);
  }

  @Get()
  findAll(@CurrentUser() u: any, @Query() query: any) {
    return this.svc.findAll(u.tenantId, query);
  }

  @Get('check-duplicate')
  checkDuplicate(@CurrentUser() u: any, @Query('name') name: string) {
    return this.svc.findDuplicates(u.tenantId, name);
  }

  @Get(':id')
  findOne(@CurrentUser() u: any, @Param('id') id: string) {
    return this.svc.findOne(u.tenantId, id);
  }

  @Get(':id/360')
  @ApiOperation({ summary: 'Get 360° view — account + contacts + notes + activities' })
  get360(@CurrentUser() u: any, @Param('id') id: string) {
    return this.svc.get360View(u.tenantId, id);
  }

  @Put(':id')
  update(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.svc.update(u.tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() u: any, @Param('id') id: string) {
    return this.svc.remove(u.tenantId, id).then(() => ({ message: 'Account deactivated' }));
  }

  @Post(':id/notes')
  addNote(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: CreateNoteDto) {
    return this.svc.addNote(u.tenantId, id, dto, u.userId);
  }

  @Get(':id/notes')
  getNotes(@CurrentUser() u: any, @Param('id') id: string) {
    return this.svc.getNotes(u.tenantId, id);
  }
}
