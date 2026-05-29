// ─── lead.dto.ts ──────────────────────────────────────────────────────────────
import { IsString, IsOptional, IsEmail, IsUUID, IsNumber, IsBoolean } from 'class-validator';

export class CreateLeadDto {
  @IsOptional() @IsUUID() titleId?: string;
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() jobTitle?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() mobile?: string;
  @IsOptional() @IsUUID() leadSourceId?: string;
  @IsOptional() @IsUUID() leadStatusId?: string;
  @IsOptional() @IsUUID() industryId?: string;
  @IsOptional() @IsUUID() countryId?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsNumber() estimatedValue?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() tags?: string[];
  @IsOptional() customFields?: Record<string, any>;
}

export class UpdateLeadDto extends CreateLeadDto {}

export class ConvertLeadDto {
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsUUID() contactId?: string;
  @IsOptional() @IsUUID() opportunityId?: string;
  @IsOptional() @IsUUID() convertedStatusId?: string;
}
