import { IsString, IsOptional } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() primaryColor?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() dateFormat?: string;
  @IsOptional() @IsString() currencyCode?: string;
  @IsOptional() @IsString() costingMethod?: string;
  @IsOptional() @IsString() language?: string;
}
