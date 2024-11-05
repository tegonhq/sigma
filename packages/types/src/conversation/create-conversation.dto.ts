import { IsObject, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsObject()
  context: any;

  @IsString()
  userId: string;
}
