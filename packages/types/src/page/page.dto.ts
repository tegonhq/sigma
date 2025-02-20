import { IsString } from 'class-validator';

export class PageRequestParamsDto {
  @IsString()
  pageId: string;
}

export class EnhancePageResponse {
  title: string;
  description: string;
}
