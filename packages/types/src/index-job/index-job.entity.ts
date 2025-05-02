import { JsonObject } from '../common';
import { IntegrationAccount } from '../integration-account';
import { Workspace } from '../workspace';

export class IndexJob {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;

  type: string;
  status: string;
  sourceId: string;
  metadata?: JsonObject;

  integrationAccount: IntegrationAccount;
  integrationAccountId: string;

  workspace?: Workspace;
  workspaceId: string;
}
