import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserGroupDto {
  @IsOptional() @IsString() @MaxLength(100) groupName?: string;
  @IsOptional() @IsString() groupNameAr?: string;
  @IsOptional() @IsString() description?: string;
}
