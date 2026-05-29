// ─── login.dto.ts ─────────────────────────────────────────────────────────────
import { IsEmail, IsString, MinLength, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'ACME_CORP', description: 'Your company tenant code' })
  @IsString()
  tenantCode: string;

  @ApiPropertyOptional({ example: '123456', description: '6-digit 2FA code if enabled' })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  twoFactorCode?: string;
}
