import { IsString } from 'class-validator';

export class TaskDto {
  @IsString()
  taskId: string;
}

export class TaskBySourceDto {
  @IsString()
  sourceId: string;
}

export class ReccurenceInput {
  @IsString()
  text: string;

  @IsString()
  currentTime: string;
}
