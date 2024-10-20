'use client';

import { types } from 'mobx-state-tree';
import React from 'react';

import {
  ApplicationStore,
  defaultApplicationStoreValue,
  type ApplicationStoreType,
} from './application';
import {
  IntegrationAccountsStore,
  type IntegrationAccountsStoreType,
} from './integration-accounts';
import { LabelsStore, type LabelsStoreType } from './labels';
import { PagesStore, type PagesStoreType } from './pages';
import { StatusesStore, type StatusesStoreType } from './status';
import { WorkspaceStore, type WorkspaceStoreType } from './workspace';

const StoreContextModel = types.model({
  labelsStore: LabelsStore,
  workspaceStore: WorkspaceStore,
  integrationAccountsStore: IntegrationAccountsStore,
  applicationStore: ApplicationStore,
  statuesStore: StatusesStore,
  pagesStore: PagesStore,
});

export const storeContextStore = StoreContextModel.create({
  labelsStore: {
    labels: [],
    workspaceId: undefined,
  },

  applicationStore: defaultApplicationStoreValue,

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

  statuesStore: {
    statues: [],
  },
});

export interface StoreContextInstanceType {
  labelsStore: LabelsStoreType;
  applicationStore: ApplicationStoreType;
  workspaceStore: WorkspaceStoreType;
  integrationAccountsStore: IntegrationAccountsStoreType;
  statusesStore: StatusesStoreType;
  pagesStore: PagesStoreType;
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
