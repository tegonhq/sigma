import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { TaskOccurrenceType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { TaskOccurrenceArray } from './models';

export const TaskOccurrencesStore: IAnyStateTreeNode = types
  .model({
    taskOccurrences: types.map(TaskOccurrenceArray),
    taskOccurrencesWithPages: types.map(TaskOccurrenceArray),
    workspaceId: types.union(types.string, types.undefined),
    loading: types.union(types.undefined, types.boolean),
  })
  .actions((self) => {
    const update = (taskOccurrence: TaskOccurrenceType, id: string) => {
      self.loading = true;

      const taskId = taskOccurrence.taskId;
      if (!self.taskOccurrences.has(taskId)) {
        self.taskOccurrences.set(taskId, TaskOccurrenceArray.create([]));
      }

      const taskOccurrencesArray = self.taskOccurrences.get(taskId);
      const indexToUpdate = taskOccurrencesArray.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        taskOccurrencesArray[indexToUpdate] = {
          ...taskOccurrencesArray[indexToUpdate],
          ...taskOccurrence,
        };
      } else {
        taskOccurrencesArray.push(taskOccurrence);
      }

      // Populate based on a page
      const pageId = taskOccurrence.pageId;
      if (!self.taskOccurrencesWithPages.has(pageId)) {
        self.taskOccurrencesWithPages.set(
          pageId,
          TaskOccurrenceArray.create([]),
        );
      }

      const taskOccurrencesByPageArray =
        self.taskOccurrencesWithPages.get(pageId);
      const indexToUpd = taskOccurrencesByPageArray.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToUpd !== -1) {
        // Update the object at the found index with the new data
        taskOccurrencesByPageArray[indexToUpd] = {
          ...taskOccurrencesByPageArray[indexToUpd],
          ...taskOccurrence,
        };
      } else {
        taskOccurrencesByPageArray.push(taskOccurrence);
      }

      self.loading = false;
    };
    const deleteById = (id: string) => {
      self.loading = true;

      // Iterate through all task occurrences arrays in the map
      for (const [
        taskId,
        taskOccurrencesArray,
      ] of self.taskOccurrences.entries()) {
        const indexToDelete = taskOccurrencesArray.findIndex(
          (obj) => obj.id === id,
        );

        if (indexToDelete !== -1) {
          taskOccurrencesArray.splice(indexToDelete, 1);
          // If the task occurrences array is empty, we can remove it from the map
          if (taskOccurrencesArray.length === 0) {
            self.taskOccurrences.delete(taskId);
          }
          break; // Exit loop once we've found and deleted the task occurrence
        }
      }

      // Delete based on a page
      for (const [
        pageId,
        taskOccurrencesArray,
      ] of self.taskOccurrencesWithPages.entries()) {
        const indexToDelete = taskOccurrencesArray.findIndex(
          (obj) => obj.id === id,
        );

        if (indexToDelete !== -1) {
          taskOccurrencesArray.splice(indexToDelete, 1);
          // If the task occurrences array is empty, we can remove it from the map
          if (taskOccurrencesArray.length === 0) {
            self.taskOccurrencesWithPages.delete(pageId);
          }
          break; // Exit loop once we've found and deleted the task occurrence
        }
      }

      self.loading = false;
    };

    const load = flow(function* () {
      self.loading = true;

      const taskOccurrences = yield sigmaDatabase.taskOccurrences.toArray();

      taskOccurrences.forEach((taskOccurrence: TaskOccurrenceType) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (self as any).update(taskOccurrence, taskOccurrence.id);
      });
      self.loading = false;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    getTaskOccurrencesForTask(taskId: string) {
      return self.taskOccurrences.get(taskId);
    },
    getTaskOccurrencesForPage(pageId: string) {
      return self.taskOccurrencesWithPages.get(pageId);
    },
  }));

export interface TaskOccurrencesStoreType {
  taskOccurrences: Record<string, TaskOccurrenceType[]>;
  taskOccurrencesWithPages: Record<string, TaskOccurrenceType[]>;
  workspaceId: string;
  loading: boolean;

  update: (task: TaskOccurrenceType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getTaskOccurrencesForTask: (taskId: string) => TaskOccurrenceType[];
  getTaskOccurrencesForPage: (pageId: string) => TaskOccurrenceType[];
}
