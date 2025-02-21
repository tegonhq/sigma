import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { PageTypeEnum } from './page.entity';

export class GetPageByTitleDto {
  @IsString()
  title: string;

  @IsString()
  @IsEnum(PageTypeEnum)
  type: PageTypeEnum;

  @IsArray()
  @IsOptional()
  taskIds?: string[];
}
