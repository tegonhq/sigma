import {
  type IAnyStateTreeNode,
  type Instance,
  types,
  flow,
} from 'mobx-state-tree';

import { type StatusType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { Status } from './models';

export const StatusesStore: IAnyStateTreeNode = types
  .model({
    statuses: types.array(Status),
    teamId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (workflow: StatusType, id: string) => {
      const indexToUpdate = self.statuses.findIndex((obj) => obj.id === id);

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.statuses[indexToUpdate] = {
          ...self.statuses[indexToUpdate],
          ...workflow,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.statuses.push(workflow);
      }
    };

    const deleteById = (id: string) => {
      const indexToDelete = self.statuses.findIndex((obj) => obj.id === id);

      if (indexToDelete !== -1) {
        self.statuses.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const statuses = yield sigmaDatabase.statuses.toArray();

      self.statuses = statuses.map((workflow: StatusType) =>
        Status.create(workflow),
      );
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    getStatusWithId(workflowId: string) {
      return self.statuses.find(
        (workflow: StatusType) => workflow.id === workflowId,
      );
    },
    getStatussForWorkspace(workspaceId: string) {
      return self.statuses.filter(
        (workflow: StatusType) => workflow.workspaceId === workspaceId,
      );
    },
    getStatusByNames(value: string[]) {
      return value
        .map((name: string) => {
          const workflow = self.statuses.find(
            (workflow: StatusType) =>
              workflow.name.toLowerCase() === name.toLowerCase(),
          );

          return workflow?.id;
        })
        .filter(Boolean);
    },
  }));

export type StatusesStoreType = Instance<typeof StatusesStore>;
