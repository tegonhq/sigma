import { IsString } from 'class-validator';

export class TaskOccurrenceDto {
  @IsString()
  taskOccurrenceId: string;
}
