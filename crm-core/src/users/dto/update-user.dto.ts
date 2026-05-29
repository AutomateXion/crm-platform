// ─── update-user.dto.ts ───────────────────────────────────────────────────────
import { IsEmail, IsString, IsUUID, IsOptional, MaxLength, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(200) fullName?: string;
  @IsOptional() @IsString() fullNameAr?: string;
  @IsOptional() @IsUUID() userGroupId?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsIn(['en', 'ar']) language?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}
