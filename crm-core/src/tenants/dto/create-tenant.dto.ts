// ─── create-tenant.dto.ts ─────────────────────────────────────────────────────
import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsString() @MaxLength(50) tenantCode: string;
  @IsString() @MaxLength(200) companyName: string;
  @IsEmail() adminEmail: string;
  @IsString() @MaxLength(200) adminName: string;
  @IsString() @MinLength(8) adminPassword: string;
  @IsOptional() @IsString() domain?: string;
  @IsOptional() @IsString() subscriptionPlan?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() currencyCode?: string;
  @IsOptional() @IsString() costingMethod?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() maxUsers?: number;
}

// ─── update-tenant.dto.ts ─────────────────────────────────────────────────────
export class UpdateTenantDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() primaryColor?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() dateFormat?: string;
  @IsOptional() @IsString() currencyCode?: string;
  @IsOptional() @IsString() costingMethod?: string;
  @IsOptional() @IsString() language?: string;
}
