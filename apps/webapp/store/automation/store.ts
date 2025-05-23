import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { AutomationType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { Automation } from './models';

export const AutomationStore: IAnyStateTreeNode = types
  .model({
    automations: types.array(Automation),
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (automation: AutomationType, id: string) => {
      const indexToUpdate = self.automations.findIndex((obj) => obj.id === id);

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.automations[indexToUpdate] = {
          ...self.automations[indexToUpdate],
          ...automation,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.automations.push(automation);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.automations.findIndex((obj) => obj.id === id);

      if (indexToDelete !== -1) {
        self.automations.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const automations = yield sigmaDatabase.automations.toArray();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedAutomations: any = [...automations].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );

      self.automations = sortedAutomations;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    get getAutomations() {
      return self.automations;
    },
    getAutomationById(automationId: string) {
      return self.automations.find(
        (automation) => automation.id === automationId,
      );
    },
  }));

export interface AutomationStoreType {
  automations: AutomationType[];
  workspaceId: string;

  update: (automation: AutomationType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getAutomations: AutomationType[];
  getAutomationById: (id: string) => AutomationType;
}
