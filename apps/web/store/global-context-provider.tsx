'use client';

import { types } from 'mobx-state-tree';
import React from 'react';

import { ActivityStore, type ActivityStoreType } from './activity';
import {
  ApplicationStore,
  defaultApplicationStoreValue,
  type ApplicationStoreType,
} from './application';
import {
  IntegrationAccountsStore,
  type IntegrationAccountsStoreType,
} from './integration-accounts';
import { PagesStore, type PagesStoreType } from './pages';
import { TasksStore, type TasksStoreType } from './tasks';
import { WorkspaceStore, type WorkspaceStoreType } from './workspace';

const StoreContextModel = types.model({
  workspaceStore: WorkspaceStore,
  integrationAccountsStore: IntegrationAccountsStore,
  applicationStore: ApplicationStore,
  pagesStore: PagesStore,
  tasksStore: TasksStore,
  activityStore: ActivityStore,
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

  activityStore: {
    activities: [],
  },
});

export interface StoreContextInstanceType {
  applicationStore: ApplicationStoreType;
  workspaceStore: WorkspaceStoreType;
  integrationAccountsStore: IntegrationAccountsStoreType;
  pagesStore: PagesStoreType;
  tasksStore: TasksStoreType;
  activityStore: ActivityStoreType;
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
