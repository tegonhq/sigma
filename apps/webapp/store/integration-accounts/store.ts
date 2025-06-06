import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { IntegrationAccountType } from 'common/types';

import { solDatabase } from 'store/database';

import { IntegrationAccount } from './models';

export const IntegrationAccountsStore: IAnyStateTreeNode = types
  .model({
    integrationAccounts: types.array(IntegrationAccount),
    workspaceId: types.union(types.string, types.undefined),
    table: 'integrationAccounts',
  })
  .actions((self) => {
    const update = (integrationAccount: IntegrationAccountType, id: string) => {
      const indexToUpdate = self.integrationAccounts.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.integrationAccounts[indexToUpdate] = {
          ...self.integrationAccounts[indexToUpdate],
          ...integrationAccount,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.integrationAccounts.push(integrationAccount);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.integrationAccounts.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToDelete !== -1) {
        self.integrationAccounts.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const integrationAccounts =
        yield solDatabase.integrationAccounts.toArray();

      self.integrationAccounts = integrationAccounts;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    getAccountWithId(id: string) {
      return self.integrationAccounts.find(
        (integrationAccount: IntegrationAccountType) =>
          integrationAccount.id === id,
      );
    },
    getAccountWithIds(ids: string[]) {
      return self.integrationAccounts.filter(
        (integrationAccount: IntegrationAccountType) =>
          ids.includes(integrationAccount.id),
      );
    },
    getAccountForIntegrationDefinition(id: string) {
      return self.integrationAccounts.filter(
        (integrationAccount: IntegrationAccountType) =>
          integrationAccount.integrationDefinitionId === id,
      );
    },
  }));

export interface IntegrationAccountsStoreType {
  integrationAccounts: IntegrationAccountType[];
  workspaceId: string;

  update: (task: IntegrationAccountType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getAccountWithId: (id: string) => IntegrationAccountType;
}
