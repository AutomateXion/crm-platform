import { IsString, IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator';

export class SuperAdminCreateTenantDto {
  @IsString() @MaxLength(50) tenantCode: string;
  @IsString() @MaxLength(200) companyName: string;

  // Company contact
  @IsOptional() @IsEmail({}, { message: 'Company email must be a valid email address' }) email?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(100) country?: string;

  // Plan
  @IsOptional() @IsString() subscriptionPlan?: string;
  @IsOptional() maxUsers?: number;

  // Admin user
  @IsEmail({}, { message: 'Admin email must be a valid email address' }) adminEmail: string;
  @IsOptional() @IsString() @MaxLength(200) adminName?: string;
  @IsOptional() @IsString() @MinLength(6) adminPassword?: string;
}
