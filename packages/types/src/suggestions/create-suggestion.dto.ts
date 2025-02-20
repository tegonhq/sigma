import { IsString } from 'class-validator';

export class CreateSuggestionDto {
  @IsString()
  content: string;

  @IsString()
  taskId: string;
}
