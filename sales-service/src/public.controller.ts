import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SalesService } from './sales.service';

// PUBLIC vendor-facing RFQ endpoints — NO auth guard.
// Everything is resolved from the per-vendor access token. Reached via the
// /sales-api proxy (prefix stripped) at /public/rfq/:token...
@Controller('public')
export class PublicController {
  constructor(private readonly svc: SalesService) {}

  @Get('rfq/:token')
  getRfq(@Param('token') token: string) {
    return this.svc.publicGetRfq(token);
  }

  @Post('rfq/:token/quote')
  saveQuote(@Param('token') token: string, @Body() dto: any) {
    return this.svc.publicSaveQuote(token, dto);
  }

  @Post('rfq/:token/submit')
  submitQuote(@Param('token') token: string, @Body() dto: any) {
    return this.svc.publicSubmitQuote(token, dto);
  }

  @Post('rfq/:token/decline')
  declineQuote(@Param('token') token: string) {
    return this.svc.publicDeclineQuote(token);
  }
}
