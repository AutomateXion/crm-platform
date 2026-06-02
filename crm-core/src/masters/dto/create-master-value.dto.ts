import {
  IsString, IsOptional, IsBoolean, IsInt,
  IsHexColor, IsUUID, MaxLength, Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMasterValueDto {
  @ApiProperty({ example: 'TRADE_SHOW' })
  @IsString()
  @MaxLength(100)
  @Matches(/^[A-Z0-9_]+$/, { message: 'Value code must be uppercase letters, numbers and underscores' })
  valueCode: string;

  @ApiProperty({ example: 'Trade Show' })
  @IsString()
  @MaxLength(200)
  valueLabel: string;

  @ApiPropertyOptional({ example: 'معرض تجاري' })
  @IsOptional() @IsString() valueLabelAr?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional({ example: '#52c41a' })
  @IsOptional() @IsString() @MaxLength(7) colorCode?: string;

  @ApiPropertyOptional({ example: 'StarOutlined' })
  @IsOptional() @IsString() iconCode?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean() @Transform(({ value }) => value === true || value === "true") isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID() parentValueId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional() metadata?: Record<string, any>;
}

export class UpdateMasterValueDto {
  @IsOptional() @IsString() @MaxLength(200) valueLabel?: string;
  @IsOptional() @IsString() valueLabelAr?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @MaxLength(7) colorCode?: string;
  @IsOptional() @IsString() iconCode?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() @Transform(({ value }) => value === true || value === "true") isActive?: boolean;
  @IsOptional() metadata?: Record<string, any>;
}

export class ReorderMasterValuesDto {
  items: { valueId: string; sortOrder: number }[];
}

export class BulkGetValuesDto {
  @ApiProperty({ example: ['lead_sources', 'lead_statuses'] })
  categoryCodes: string[];
}
