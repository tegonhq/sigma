'use client';

import { types } from 'mobx-state-tree';
import React from 'react';

import {
  IntegrationAccountsStore,
  type IntegrationAccountsStoreType,
} from './integration-accounts';
import { LabelsStore, type LabelsStoreType } from './labels';
import { WorkspaceStore, type WorkspaceStoreType } from './workspace';
import {
  ApplicationStore,
  defaultApplicationStoreValue,
  type ApplicationStoreType,
} from './application';

const StoreContextModel = types.model({
  labelsStore: LabelsStore,
  workspaceStore: WorkspaceStore,
  integrationAccountsStore: IntegrationAccountsStore,
  applicationStore: ApplicationStore,
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
});

export type StoreContextInstanceType = {
  labelsStore: LabelsStoreType;
  applicationStore: ApplicationStoreType;
  workspaceStore: WorkspaceStoreType;
  integrationAccountsStore: IntegrationAccountsStoreType;
};
export const StoreContext =
  React.createContext<null | StoreContextInstanceType>(null);

export function useContextStore(): StoreContextInstanceType {
  const store = React.useContext(StoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
