import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserGroupDto {
  @ApiProperty({ example: 'SALES_MGR', description: 'Unique code (uppercase, no spaces)' })
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/, { message: 'Group code must be uppercase letters, numbers and underscores only' })
  groupCode: string;

  @ApiProperty({ example: 'Sales Manager' })
  @IsString()
  @MaxLength(100)
  groupName: string;

  @ApiPropertyOptional({ example: 'مدير المبيعات' })
  @IsOptional()
  @IsString()
  groupNameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateUserGroupDto {
  @IsOptional() @IsString() @MaxLength(100) groupName?: string;
  @IsOptional() @IsString() groupNameAr?: string;
  @IsOptional() @IsString() description?: string;
}
