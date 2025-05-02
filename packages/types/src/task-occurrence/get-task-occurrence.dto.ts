import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

import {
  TaskOccurrenceStatusEnum,
  TaskOccurrenceStatusType,
} from './task-occurrence.entity';
import { DateFilterType } from '../common';

export class GetTaskOccurrenceDTO {
  @IsString()
  @IsOptional()
  taskId?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsEnum(DateFilterType)
  startTimeFilter?: DateFilterType;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsEnum(DateFilterType)
  endTimeFilter?: DateFilterType;

  @IsOptional()
  @IsEnum(TaskOccurrenceStatusEnum)
  status?: TaskOccurrenceStatusType;
}
