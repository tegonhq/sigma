import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTaskOccurenceDTO {
  @IsArray()
  taskIds: string[];

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsString()
  @IsOptional()
  pageId?: string;
}
