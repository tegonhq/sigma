import { IsArray, IsString } from 'class-validator';

export class GetIntegrationAccountByNames {
  @IsArray()
  integrations: string[];

  @IsString()
  workspaceId: string;
}
