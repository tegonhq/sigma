import { Spec, WorkspaceRequestParamsDto } from '@redplanethq/sol-sdk';
import { IsObject, IsString } from 'class-validator';

export class IntegrationDefinitionSpec {
  spec: Spec;
}

export class IntegrationDefinitionCreateBody extends WorkspaceRequestParamsDto {
  @IsObject()
  name: string;

  @IsString()
  icon: string;

  @IsString()
  clientId: string;

  @IsString()
  clientSecret: string;
}
