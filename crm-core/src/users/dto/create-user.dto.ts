// ─── create-user.dto.ts ───────────────────────────────────────────────────────
import {
  IsEmail, IsString, IsUUID, IsOptional,
  MinLength, MaxLength, IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(200)
  fullName: string;

  @ApiPropertyOptional({ example: 'جون دو' })
  @IsOptional()
  @IsString()
  fullNameAr?: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'UUID of user group to assign' })
  @IsUUID()
  userGroupId: string;

  @ApiPropertyOptional({ example: '+96812345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'en', enum: ['en', 'ar'] })
  @IsOptional()
  @IsIn(['en', 'ar'])
  language?: string;

  @ApiPropertyOptional({ example: 'Asia/Muscat' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
