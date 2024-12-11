import { JsonValue } from '../common';
import { IntegrationAccount } from '../integration-account';

export enum TaskType {
  NORMAL = 'NORMAL',
  SCHEDULED = 'SCHEDULED',
  INSTRUCTION = 'INSTRUCTION',
}

export interface TaskMetadata {
  type: TaskType;
  schedule?: string;
}

export class Task {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  sourceId?: string;
  url?: string;
  status?: string;
  metadata?: JsonValue;

  pageId: string;
  integrationAccountId?: string;
  integrationAccount?: IntegrationAccount;
}
