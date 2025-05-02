import { IsString } from 'class-validator';

export class ListIdDto {
  @IsString()
  listId: string;
}
