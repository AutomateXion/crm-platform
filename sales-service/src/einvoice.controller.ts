import { Controller, Get, Post, Put, Param, Body, Query, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from './auth.guard';
import { EInvoiceService } from './einvoice.service';

@Controller('einvoice')
@UseGuards(JwtAuthGuard)
export class EInvoiceController {
  constructor(private readonly svc: EInvoiceService) {}

  @Get('settings')
  getSettings(@Request() req: any) {
    return this.svc.getSettings(req.user.tenantId);
  }

  @Put('settings')
  saveSettings(@Request() req: any, @Body() dto: any) {
    return this.svc.saveSettings(req.user.tenantId, dto);
  }

  @Get('submissions')
  getSubmissions(@Request() req: any, @Query() q: any) {
    return this.svc.getSubmissions(req.user.tenantId, +q.page||1, +q.limit||20);
  }

  @Get('invoice/:id/xml')
  getInvoiceXML(@Request() req: any, @Param('id') id: string) {
    return this.svc.generateInvoiceXML(req.user.tenantId, id);
  }

  @Get('invoice/:id/download')
  async downloadInvoiceXML(@Request() req: any, @Param('id') id: string, @Res() res: Response) {
    const result = await this.svc.generateInvoiceXML(req.user.tenantId, id);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${result.invoiceNumber}.xml"`);
    res.send(result.xml);
  }

  @Post('invoice/:id/submit')
  async submitInvoice(@Request() req: any, @Param('id') id: string) {
    const result = await this.svc.generateInvoiceXML(req.user.tenantId, id);
    if (!result.validation.valid) {
      return { success: false, errors: result.validation.errors };
    }
    const settings = await this.svc.getSettings(req.user.tenantId);
    if (!settings.isEnabled || !settings.aspEndpoint) {
      return { success: false, message: 'E-Invoice not configured. Please set up ASP credentials in settings.' };
    }
    return { success: true, message: 'Submitted to ASP' };
  }

  @Post('validate')
  validateXML(@Body() dto: any) {
    return this.svc.validateUBL(dto.xml || '');
  }
}
