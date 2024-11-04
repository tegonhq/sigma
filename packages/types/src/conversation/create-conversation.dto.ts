import { IsObject, IsString } from 'class-validator';

import { JsonValue } from '../common';

export class CreateConversationDto {
  @IsObject()
  context: JsonValue;

  @IsString()
  userId: string;
}
