import { IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsString()
  sourceURL?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsString()
  integrationAccountId: string;
}
