import { types } from 'mobx-state-tree';
import React from 'react';

import { ActivityStore, type ActivityStoreType } from './activity';
import {
  AgentWorklogsStore,
  type AgentWorklogStoreType,
} from './agent-worklog';
import {
  ApplicationStore,
  defaultApplicationStoreValue,
  type ApplicationStoreType,
} from './application';
import { AutomationStore, type AutomationStoreType } from './automation';
import {
  CommonStore,
  defaultCommonStoreValue,
  type CommonStoreType,
} from './common';
import {
  ConversationHistoryStore,
  type ConversationHistoryStoreType,
} from './conversation-history';
import {
  ConversationsStore,
  type ConversationStoreType,
} from './conversations';
import {
  IntegrationAccountsStore,
  type IntegrationAccountsStoreType,
} from './integration-accounts';
import { ListsStore, type ListsStoreType } from './lists';
import { PagesStore, type PagesStoreType } from './pages';
import {
  TaskOccurrencesStore,
  type TaskOccurrencesStoreType,
} from './task-occurrences';
import { TasksStore, type TasksStoreType } from './tasks';
import { WorkspaceStore, type WorkspaceStoreType } from './workspace';

const StoreContextModel = types.model({
  commonStore: CommonStore,

  conversationsStore: ConversationsStore,
  conversationHistoryStore: ConversationHistoryStore,
  workspaceStore: WorkspaceStore,
  integrationAccountsStore: IntegrationAccountsStore,
  applicationStore: ApplicationStore,
  pagesStore: PagesStore,
  tasksStore: TasksStore,
  listsStore: ListsStore,
  taskOccurrencesStore: TaskOccurrencesStore,
  agentWorklogsStore: AgentWorklogsStore,
  activitesStore: ActivityStore,
  automationsStore: AutomationStore,
});

export const storeContextStore = StoreContextModel.create({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applicationStore: defaultApplicationStoreValue as any,

  workspaceStore: {
    workspace: undefined,
  },

  integrationAccountsStore: {
    integrationAccounts: [],
    workspaceId: undefined,
  },

  pagesStore: {
    pages: [],
  },

  tasksStore: {
    tasks: [],
  },
  taskOccurrencesStore: {
    taskOccurrences: {},
    taskOccurrencesWithPages: {},
  },

  conversationsStore: {
    conversations: [],
  },
  conversationHistoryStore: {
    conversationHistory: [],
  },
  listsStore: {
    lists: [],
  },
  commonStore: defaultCommonStoreValue,
  agentWorklogsStore: {
    agentWorklogs: [],
  },
  activitesStore: {
    activities: [],
  },
  automationsStore: {
    automations: [],
  },
});

export interface StoreContextInstanceType {
  applicationStore: ApplicationStoreType;
  workspaceStore: WorkspaceStoreType;
  integrationAccountsStore: IntegrationAccountsStoreType;
  pagesStore: PagesStoreType;
  tasksStore: TasksStoreType;
  conversationsStore: ConversationStoreType;
  conversationHistoryStore: ConversationHistoryStoreType;
  commonStore: CommonStoreType;
  listsStore: ListsStoreType;
  taskOccurrencesStore: TaskOccurrencesStoreType;
  agentWorklogsStore: AgentWorklogStoreType;
  activitesStore: ActivityStoreType;
  automationsStore: AutomationStoreType;
}
export const StoreContext =
  React.createContext<null | StoreContextInstanceType>(null);

export function useContextStore(): StoreContextInstanceType {
  const store = React.useContext(StoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }

  return store;
}
