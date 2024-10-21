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
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (status: StatusType, id: string) => {
      const indexToUpdate = self.statuses.findIndex((obj) => obj.id === id);

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.statuses[indexToUpdate] = {
          ...self.statuses[indexToUpdate],
          ...status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.statuses.push(status);
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

      self.statuses = statuses;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    getStatusWithId(statusId: string) {
      return self.statuses.find((status: StatusType) => status.id === statusId);
    },
    getStatussForWorkspace(workspaceId: string) {
      return self.statuses.filter(
        (status: StatusType) => status.workspaceId === workspaceId,
      );
    },
    getStatusByNames(value: string[]) {
      return value
        .map((name: string) => {
          const status = self.statuses.find(
            (status: StatusType) =>
              status.name.toLowerCase() === name.toLowerCase(),
          );

          return status?.id;
        })
        .filter(Boolean);
    },
  }));

export type StatusesStoreType = Instance<typeof StatusesStore> & {
  statues: StatusType[];
};
