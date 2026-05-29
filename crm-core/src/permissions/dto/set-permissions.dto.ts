// ─── set-permissions.dto.ts ───────────────────────────────────────────────────
import { IsUUID, IsArray, ValidateNested, IsString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionLevel } from '../entities/permission.entity';

export class PermissionEntryDto {
  @IsOptional() @IsUUID() moduleId?: string;
  @IsOptional() @IsUUID() subModuleId?: string;
  @IsOptional() @IsUUID() pageId?: string;
  @IsOptional() @IsUUID() fieldId?: string;

  @IsEnum(PermissionLevel)
  permissionLevel: PermissionLevel;
}

export class SetPermissionsDto {
  @ApiProperty()
  @IsUUID()
  userGroupId: string;

  @ApiProperty({ type: [PermissionEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionEntryDto)
  permissions: PermissionEntryDto[];
}
