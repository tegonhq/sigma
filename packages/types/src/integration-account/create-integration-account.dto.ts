import { IsObject, IsOptional, IsString } from 'class-validator';

import { type JsonObject } from '../common';

export class CreateIntegrationAccountDto {
  @IsString()
  integrationDefinitionId: string;

  @IsObject()
  config: JsonObject;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsObject()
  @IsOptional()
  settings?: JsonObject;

  @IsString()
  @IsOptional()
  userId?: string;
}
