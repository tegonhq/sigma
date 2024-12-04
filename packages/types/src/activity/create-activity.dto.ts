import { IsObject, IsString } from 'class-validator';

import { type JsonObject } from '../common';

export class CreateActivityDto {
  @IsString()
  type: string;

  @IsObject()
  eventData: JsonObject;

  @IsString()
  name: string;
}
