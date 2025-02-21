import { IsString } from 'class-validator';

export class PageRequestParamsDto {
  @IsString()
  pageId: string;
}

export class EnhancePageResponse {
  title: string;
  description: string;
}

export const PageSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  deleted: true,
  archived: true,

  title: true,
  description: true,
  descriptionBinary: true,

  sortOrder: true,
  parentId: true,

  type: true,
  tags: true,

  workspaceId: true,
};
