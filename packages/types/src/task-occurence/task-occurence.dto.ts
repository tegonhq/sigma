import { IsString } from 'class-validator';

export class TaskOccurenceDto {
  @IsString()
  taskOccurenceId: string;
}
