import { JsonValue } from '../common';
import {
  IntegrationDefinition,
  PublicIntegrationDefinition,
} from '../integration-definition';
import { User } from '../user';
import { Workspace } from '../workspace';

export class IntegrationAccount {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  integrationConfiguration?: JsonValue;
  accountId: string | null;
  settings: JsonValue | null;
  isActive: boolean;
  integratedBy?: User;
  integratedById: string;
  integrationDefinition?: IntegrationDefinition | PublicIntegrationDefinition;
  integrationDefinitionId: string;
  workspace?: Workspace;
  workspaceId: string;
}

export interface IntegrationAccountWithToken extends IntegrationAccount {
  token: string;
}
