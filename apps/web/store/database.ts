'use client';

import type { ApplicationStoreType } from './application';

import Dexie from 'dexie';

import type {
  ActivityType,
  ConversationHistoryType,
  ConversationType,
  IntegrationAccountType,
  PageType,
  StatusType,
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
  activity: Dexie.Table<Partial<ActivityType>, string>;
  application: Dexie.Table<Partial<ApplicationStoreType>, string>;
  conversations: Dexie.Table<ConversationType, string>;
  conversationHistory: Dexie.Table<ConversationHistoryType, string>;

  constructor(databaseName: string) {
    super(databaseName);

    this.version(17).stores({
      [MODELS.Workspace]: 'id,createdAt,updatedAt,name,slug,userId',
      [MODELS.IntegrationAccount]:
        'id,createdAt,updatedAt,accountId,settings,integratedById,integrationDefinitionId,workspaceId',
      [MODELS.Page]:
        'id,createdAt,updatedAt,archived,title,description,parentId,sortOrder,workspaceId,tags,type',
      [MODELS.Task]:
        'id,createdAt,updatedAt,sourceId,url,status,metadata,workspaceId,pageId,integrationAccountId,dueDate',
      [MODELS.Activity]:
        'id,createdAt,updatedAt,type,eventData,name,workspaceId,integrationAccountId',
      [MODELS.Conversation]: 'id,createdAt,updatedAt,title,userId,workspaceId',
      [MODELS.ConversationHistory]:
        'id,createdAt,updatedAt,message,userType,context,thoughts,userId,conversationId',
      Application: 'id,sidebarCollapsed,tabGroups,activeTabGroupId',
    });

    this.workspaces = this.table(MODELS.Workspace);
    this.integrationAccounts = this.table(MODELS.IntegrationAccount);
    this.pages = this.table(MODELS.Page);
    this.tasks = this.table(MODELS.Task);
    this.activity = this.table(MODELS.Activity);
    this.conversations = this.table(MODELS.Conversation);
    this.conversationHistory = this.table(MODELS.ConversationHistory);
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
