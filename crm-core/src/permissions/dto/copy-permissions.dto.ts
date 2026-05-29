import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CopyPermissionsDto {
  @ApiProperty()
  @IsUUID()
  sourceGroupId: string;

  @ApiProperty()
  @IsUUID()
  targetGroupId: string;
}
