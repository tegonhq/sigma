import type { ApplicationStoreType } from './application';

import Dexie from 'dexie';

import type {
  ActivityType,
  AgentWorklogType,
  AutomationType,
  ConversationHistoryType,
  ConversationType,
  IntegrationAccountType,
  ListType,
  PageType,
  StatusType,
  TaskOccurrenceType,
  TaskType,
} from 'common/types';
import type { WorkspaceType } from 'common/types';

import { MODELS } from './models';

export class SolDatabase extends Dexie {
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
  agentWorklogs: Dexie.Table<AgentWorklogType, string>;
  activities: Dexie.Table<ActivityType, string>;
  automations: Dexie.Table<AutomationType, string>;

  constructor(databaseName: string) {
    super(databaseName);

    this.version(40).stores({
      [MODELS.Workspace]: 'id,createdAt,updatedAt,name,slug,userId',
      [MODELS.IntegrationAccount]:
        'id,createdAt,updatedAt,accountId,settings,integratedById,integrationDefinitionId,workspaceId',
      [MODELS.Page]:
        'id,createdAt,updatedAt,archived,title,description,parentId,sortOrder,workspaceId,tags,type',
      [MODELS.Task]:
        'id,createdAt,updatedAt,source,status,metadata,workspaceId,pageId,integrationAccountId,startTime,endTime,recurrence,number,completedAt,listId,dueDate,remindAt,scheduleText,parentId',
      [MODELS.TaskOccurrence]:
        'id,createdAt,updatedAt,workspaceId,taskId,startTime,endTime,status',

      [MODELS.Conversation]:
        'id,createdAt,updatedAt,title,userId,workspaceId,pageId,taskId,unread',
      [MODELS.ConversationHistory]:
        'id,createdAt,updatedAt,message,userType,context,thoughts,userId,conversationId',
      [MODELS.List]: 'id,createdAt,updatedAt,pageId,icon,favourite',
      [MODELS.AgentWorklog]:
        'id,createdAt,updatedAt,modelName,modelId,state,type,workspaceId',
      [MODELS.Activity]:
        'id,createdAt,updatedAt,text,sourceURL,taskId,integrationAccountId,workspaceId,conversationId',
      [MODELS.Automation]:
        'id,createdAt,updatedAt,text,usedCount,mcps,integrationAccountIds,workspaceId',

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
    this.application = this.table('Application');
    this.agentWorklogs = this.table(MODELS.AgentWorklog);
    this.activities = this.table(MODELS.Activity);
    this.automations = this.table(MODELS.Automation);
  }
}

export let solDatabase: SolDatabase;

export function initDatabase(hash: number) {
  solDatabase = new SolDatabase(`Sol_${hash}`);
}

export async function resetDatabase() {
  localStorage.removeItem('lastSequenceId');

  if (solDatabase) {
    await solDatabase.delete();
  }
}
