import { JsonValue } from '../common';
import { IntegrationAccount } from '../integration-account';
import { Workspace } from '../workspace';

export class Activity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;

  type: string;
  eventData: JsonValue;
  name: string;

  integrationAccount?: IntegrationAccount | null;
  integrationAccountId?: string | null;

  workspace?: Workspace | null;
  workspaceId: string;
}
