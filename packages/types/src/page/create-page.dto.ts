import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PageTypeEnum } from './page.entity';

export class CreatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  htmlDescription?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  sortOrder: string;

  @IsString()
  @IsEnum(['Default', 'Daily'])
  type: PageTypeEnum;
}
