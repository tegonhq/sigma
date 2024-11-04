import { IsObject, IsOptional } from 'class-validator';

import { JsonValue } from '../common';

export class UpdateConversationDto {
  @IsOptional()
  @IsObject()
  context?: JsonValue;
}
