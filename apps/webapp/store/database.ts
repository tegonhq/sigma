import type { ApplicationStoreType } from './application';

import Dexie from 'dexie';

import type {
  ConversationHistoryType,
  ConversationType,
  IntegrationAccountType,
  ListType,
  PageType,
  StatusType,
  TaskExternalLinkType,
  TaskOccurrenceType,
  TaskType,
} from 'common/types';
import type { WorkspaceType } from 'common/types';

import { MODELS } from './models';

export class SigmaDatabase extends Dexie {
  workspaces: Dexie.Table<WorkspaceType, string>;
  integrationAccounts: Dexie.Table<IntegrationAccountType, string>;
  pages: Dexie.Table<PageType, string>;
  statuses: Dexie.Table<StatusType, string>;
  tasks: Dexie.Table<Partial<TaskType>, string>;
  application: Dexie.Table<Partial<ApplicationStoreType>, string>;
  conversations: Dexie.Table<ConversationType, string>;
  conversationHistory: Dexie.Table<ConversationHistoryType, string>;
  lists: Dexie.Table<ListType, string>;
  taskOccurrences: Dexie.Table<TaskOccurrenceType, string>;
  taskExternalLinks: Dexie.Table<TaskExternalLinkType, string>;

  constructor(databaseName: string) {
    super(databaseName);

    this.version(29).stores({
      [MODELS.Workspace]: 'id,createdAt,updatedAt,name,slug,userId',
      [MODELS.IntegrationAccount]:
        'id,createdAt,updatedAt,accountId,settings,integratedById,integrationDefinitionId,workspaceId',
      [MODELS.Page]:
        'id,createdAt,updatedAt,archived,title,description,parentId,sortOrder,workspaceId,tags,type',
      [MODELS.Task]:
        'id,createdAt,updatedAt,sourceId,url,status,metadata,workspaceId,pageId,integrationAccountId,startTime,endTime,recurrence,number,completedAt,listId,dueDate,remindAt,scheduleText,parentId',
      [MODELS.TaskOccurrence]:
        'id,createdAt,updatedAt,workspaceId,pageId,taskId,startTime,endTime,status',
      [MODELS.TaskExternalLink]:
        'id,createdAt,updatedAt,taskId,integrationAccountId,url,sourceId',

      [MODELS.Conversation]:
        'id,createdAt,updatedAt,title,userId,workspaceId,pageId,taskId',
      [MODELS.ConversationHistory]:
        'id,createdAt,updatedAt,message,userType,context,thoughts,userId,conversationId',
      [MODELS.List]: 'id,createdAt,updatedAt,pageId,icon',

      Application: 'id,sidebarCollapsed,tabGroups,activeTabGroupId',
    });

    this.workspaces = this.table(MODELS.Workspace);
    this.integrationAccounts = this.table(MODELS.IntegrationAccount);
    this.pages = this.table(MODELS.Page);
    this.tasks = this.table(MODELS.Task);
    this.conversations = this.table(MODELS.Conversation);
    this.conversationHistory = this.table(MODELS.ConversationHistory);
    this.lists = this.table(MODELS.List);
    this.taskOccurrences = this.table(MODELS.TaskOccurrence);
    this.taskExternalLinks = this.table(MODELS.TaskExternalLink);
    this.application = this.table('Application');
  }
}

export let sigmaDatabase: SigmaDatabase;

export function initDatabase(hash: number) {
  sigmaDatabase = new SigmaDatabase(`Sigma_${hash}`);
}

export async function resetDatabase() {
  localStorage.removeItem('lastSequenceId');

  if (sigmaDatabase) {
    await sigmaDatabase.delete();
  }
}
