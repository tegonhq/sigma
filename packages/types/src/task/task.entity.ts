import { Activity } from '../activity';
import { JsonValue } from '../common';
import { Conversation } from '../conversation';
import { List } from '../list';
import { Page } from '../page';
import { TaskExternalLink } from '../task-external-link';
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
  deleted?: Date;

  number?: number;
  completedAt?: Date;

  status?: string;
  metadata?: JsonValue;

  startTime?: Date;
  endTime?: Date;
  recurrence?: string[];
  scheduleText?: string;
  dueDate?: Date;
  remindAt?: Date;
  tags?: string[];

  source?: TaskExternalLink;
  sourceExternalLinkId?: string;

  page?: Page;
  pageId: string;

  workspace?: Workspace;
  workspaceId: string;

  list?: List;
  listId?: string;

  parent?: Task;
  parentId?: string;
  subIssue?: Task[];

  taskOccurrence?: TaskOccurrence[];
  activity?: Activity[];
  taskExternalLink?: TaskExternalLink[];
  conversation?: Conversation[];
}
