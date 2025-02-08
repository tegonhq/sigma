import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsString()
  @IsOptional()
  integrationAccountId?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

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
