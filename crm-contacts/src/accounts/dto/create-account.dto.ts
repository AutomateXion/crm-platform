import { IsString, IsOptional, IsEmail, IsUUID, IsNumber, MaxLength } from 'class-validator';

export class CreateAccountDto {
  @IsString() @MaxLength(200) accountName: string;
  @IsOptional() @IsUUID() accountTypeId?: string;
  @IsOptional() @IsUUID() industryId?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsUUID() countryId?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsNumber() annualRevenue?: number;
  @IsOptional() @IsNumber() employeeCount?: number;
  @IsOptional() @IsUUID() parentAccountId?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() tags?: string[];
  @IsOptional() customFields?: Record<string, any>;
}

export class UpdateAccountDto extends CreateAccountDto {}

export class CreateNoteDto {
  @IsString() noteText: string;
  @IsOptional() @IsUUID() noteTypeId?: string;
  @IsOptional() isPinned?: boolean;
}

export class CreateContactDto {
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsUUID() titleId?: string;
  @IsString() @MaxLength(100) firstName: string;
  @IsString() @MaxLength(100) lastName: string;
  @IsOptional() @IsString() jobTitle?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() mobile?: string;
  @IsOptional() @IsUUID() contactRoleId?: string;
  @IsOptional() @IsString() linkedinUrl?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() tags?: string[];
  @IsOptional() customFields?: Record<string, any>;
  @IsOptional() doNotContact?: boolean;
  @IsOptional() doNotEmail?: boolean;
}

export class UpdateContactDto extends CreateContactDto {}
