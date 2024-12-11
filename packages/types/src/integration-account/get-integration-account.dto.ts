import { IsArray } from 'class-validator';

export class GetIntegrationAccountByNames {
  @IsArray()
  integrations: string[];
}
