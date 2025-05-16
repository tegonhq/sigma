import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UnifiedSearchOptionsDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
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
  };
}
