import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  listId?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsArray()
  @IsOptional()
  recurrence?: string[];

  @IsString()
  @IsOptional()
  recurrenceText?: string;

  @IsString()
  @IsOptional()
  remindAt?: string;
}
