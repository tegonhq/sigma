import { IsString, IsOptional, IsEnum } from 'class-validator';

import {
  TaskOccurrenceStatusEnum,
  TaskOccurrenceStatusType,
} from './task-occurence.entity';

export class UpdateTaskOccurenceDTO {
  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsEnum(TaskOccurrenceStatusEnum)
  status?: TaskOccurrenceStatusType;
}
