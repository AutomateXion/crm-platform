import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets/tickets.service';
import { TicketsController } from './tickets/tickets.controller';
import { Ticket, TicketComment, TicketHistory, CannedResponse } from './tickets/entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketComment, TicketHistory, CannedResponse])],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class SupportModule {}
