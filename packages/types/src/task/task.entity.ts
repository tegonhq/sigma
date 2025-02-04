import { JsonValue } from '../common';
import { IntegrationAccount } from '../integration-account';
import { Page } from '../page';
import { TaskOccurrence } from '../task-occurence/task-occurence.entity';
import { Workspace } from '../workspace';

export enum TaskType {
  NORMAL = 'NORMAL',
  SCHEDULED = 'SCHEDULED',
  INSTRUCTION = 'INSTRUCTION',
}

export interface TaskMetadata {
  type: TaskType;
}

export class Task {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  sourceId?: string;
  url?: string;
  status?: string;
  metadata?: JsonValue;

  startTime?: Date;
  endTime?: Date;
  recurrence?: string[];
  recurrenceText?: string;

  pageId?: string;
  page?: Page;

  integrationAccountId?: string;
  integrationAccount?: IntegrationAccount;

  workspace?: Workspace;
  workspaceId?: string;

  taskOccurence?: TaskOccurrence[];
}
