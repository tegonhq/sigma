import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { TaskExternalLinkType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { TaskExternalLinks } from './models';

export const TaskExternalLinksStore: IAnyStateTreeNode = types
  .model({
    taskExternalLinks: types.map(TaskExternalLinks),
  })
  .actions((self) => {
    const update = (taskExternalLink: TaskExternalLinkType, id: string) => {
      const taskId = taskExternalLink.taskId;
      if (!self.taskExternalLinks.has(taskId)) {
        self.taskExternalLinks.set(taskId, TaskExternalLinks.create([]));
      }

      const taskExternalLinksArray = self.taskExternalLinks.get(taskId);
      const indexToUpdate = taskExternalLinksArray.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        taskExternalLinksArray[indexToUpdate] = {
          ...taskExternalLinksArray[indexToUpdate],
          ...taskExternalLink,
        };
      } else {
        taskExternalLinksArray.push(taskExternalLink);
      }
    };
    const deleteById = (id: string) => {
      // Iterate through all task occurrences arrays in the map
      for (const [
        taskId,
        taskExternalLinksArray,
      ] of self.taskExternalLinks.entries()) {
        const indexToDelete = taskExternalLinksArray.findIndex(
          (obj) => obj.id === id,
        );

        if (indexToDelete !== -1) {
          taskExternalLinksArray.splice(indexToDelete, 1);
          // If the task occurrences array is empty, we can remove it from the map
          if (taskExternalLinksArray.length === 0) {
            self.taskExternalLinks.delete(taskId);
          }
          break; // Exit loop once we've found and deleted the task occurrence
        }
      }
    };

    const load = flow(function* () {
      const taskExternalLinks = yield sigmaDatabase.taskExternalLinks.toArray();

      taskExternalLinks.forEach((taskExternalLink: TaskExternalLinkType) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (self as any).update(taskExternalLink, taskExternalLink.id);
      });
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    getExternalLinksForTask({
      taskId,
    }: {
      taskId?: string;
    }): TaskExternalLinkType[] {
      return self.taskExternalLinks.get(taskId) ?? [];
    },
  }));

export interface TaskExternalLinksStoreType {
  taskExternalLinks: TaskExternalLinkType[];

  update: (taskExternalLink: TaskExternalLinkType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getExternalLinksForTask: (params: {
    taskId?: string;
  }) => TaskExternalLinkType[];
}
