// ─── ticket.dto.ts ────────────────────────────────────────────────────────────
import { IsString, IsOptional, IsUUID, IsBoolean, IsInt, Min, Max } from 'class-validator';

export class CreateTicketDto {
  @IsString() subject: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsUUID() contactId?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsUUID() priorityId?: string;
  @IsOptional() @IsString() priorityCode?: string;   // CRITICAL|HIGH|MEDIUM|LOW for SLA calc
  @IsOptional() @IsUUID() statusId?: string;
  @IsOptional() @IsUUID() slaTypeId?: string;
  @IsOptional() @IsUUID() teamId?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() tags?: string[];
  @IsOptional() customFields?: Record<string, any>;
}

export class UpdateTicketDto {
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID() statusId?: string;
  @IsOptional() @IsUUID() priorityId?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsUUID() teamId?: string;
  @IsOptional() tags?: string[];
}

export class AddCommentDto {
  @IsString() commentText: string;
  @IsOptional() @IsBoolean() isInternal?: boolean;
  @IsOptional() attachments?: any[];
}

export class ResolveTicketDto {
  @IsString() resolution: string;
  @IsOptional() @IsUUID() resolutionTypeId?: string;
}

export class SatisfactionDto {
  @IsInt() @Min(1) @Max(5) score: number;
  @IsOptional() @IsString() note?: string;
}
