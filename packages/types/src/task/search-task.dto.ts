import { IsOptional, IsString } from 'class-validator';

export class UnifiedSearchOptionsDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  page?: string;
}

export interface ParsedQuery {
  textSearch: string;
  filters: {
    status?: string;
    listId?: string;
    parentId?: string;
    dueDate?: { before?: Date; after?: Date };
    isSubtask?: boolean;
    number?: string;
    isUnplanned?: boolean;
    sourceURL?: string;
  };
}
