import { IsString } from 'class-validator';

export class PageRequestParamsDto {
  @IsString()
  pageId: string;
}
