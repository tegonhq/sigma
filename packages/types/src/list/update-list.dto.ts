import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateListDto {
  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  favourite?: boolean;
}
