import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { NotificationType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { Notification } from './models';

export const NotificationsStore: IAnyStateTreeNode = types
  .model({
    notifications: types.array(Notification),
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (notification: NotificationType, id: string) => {
      const indexToUpdate = self.notifications.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.notifications[indexToUpdate] = {
          ...self.notifications[indexToUpdate],
          ...notification,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.notifications.push(notification);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.notifications.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToDelete !== -1) {
        self.notifications.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const notifications = yield sigmaDatabase.notifications.toArray();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedNotifications: any = [...notifications].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );

      self.notifications = sortedNotifications;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    get getNotifications() {
      return self.notifications;
    },
  }));

export interface NotificationsStoreType {
  notifications: NotificationType[];
  workspaceId: string;

  update: (notification: NotificationType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getNotifications: NotificationType[];
}
