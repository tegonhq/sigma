import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { ActivityType } from 'common/types';

import { solDatabase } from 'store/database';

import { Activity } from './models';

export const ActivityStore: IAnyStateTreeNode = types
  .model({
    activities: types.array(Activity),
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (activity: ActivityType, id: string) => {
      const indexToUpdate = self.activities.findIndex((obj) => obj.id === id);

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.activities[indexToUpdate] = {
          ...self.activities[indexToUpdate],
          ...activity,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.activities.push(activity);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.activities.findIndex((obj) => obj.id === id);

      if (indexToDelete !== -1) {
        self.activities.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const activities = yield solDatabase.activities.toArray();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedActivitys: any = [...activities].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );

      self.activities = sortedActivitys;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    get getActivities() {
      return self.activities;
    },
    getActivityById(activityId: string) {
      return self.activities.find((activity) => activity.id === activityId);
    },
    getActivityForConversation(conversationId: string) {
      return self.activities.find(
        (activity) => activity.conversationId === conversationId,
      );
    },
  }));

export interface ActivityStoreType {
  activities: ActivityType[];
  workspaceId: string;

  update: (activity: ActivityType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getActivities: ActivityType[];
  getActivityById: (id: string) => ActivityType;
  getActivityForConversation: (conversationId: string) => ActivityType;
}
