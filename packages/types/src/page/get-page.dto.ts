import { IsEnum, IsString } from 'class-validator';

import { PageTypeEnum } from './page.entity';

export class GetPageByTitleDto {
  @IsString()
  title: string;

  @IsString()
  @IsEnum(PageTypeEnum)
  type: PageTypeEnum;
}
