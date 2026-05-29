import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class UpdateMasterValueDto {
  @IsOptional() @IsString() valueLabel?: string;
  @IsOptional() @IsString() valueLabelAr?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() colorCode?: string;
  @IsOptional() @IsString() iconCode?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() metadata?: Record<string, any>;
}
