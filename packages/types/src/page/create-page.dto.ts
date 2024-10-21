import { IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  sortOrder: string;
}
