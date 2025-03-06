import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

import {
  TaskOccurrenceStatusEnum,
  TaskOccurrenceStatusType,
} from './task-occurence.entity';

export class UpdateTaskOccurenceDTO {
  @IsArray()
  taskIds: string[];

  @IsArray()
  taskOccurenceIds: string[];

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsEnum(TaskOccurrenceStatusEnum)
  status?: TaskOccurrenceStatusType;
}
