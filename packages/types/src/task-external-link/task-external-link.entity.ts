import { JsonValue } from '../common';
import { IntegrationAccount } from '../integration-account';
import { Task } from '../task';

export class TaskExternalLink {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted?: Date;

  taskId: string;
  task: Task;
  metadata: JsonValue;

  sourceId?: string;
  url: string;

  integrationAccount: IntegrationAccount;
  integrationAccountId: string;

  sourceFor: Task[];
}
