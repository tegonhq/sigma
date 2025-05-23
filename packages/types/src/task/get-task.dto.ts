import { IsArray, IsString } from 'class-validator';

export class TaskDto {
  @IsString()
  taskId: string;
}

export class TaskBySourceDto {
  @IsString()
  sourceURL: string;
}

export class ReccurenceInput {
  @IsString()
  text: string;

  @IsString()
  currentTime: string;

  @IsArray()
  taskIds: string[];
}
