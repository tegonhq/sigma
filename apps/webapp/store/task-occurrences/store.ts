import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { TaskOccurrenceType } from 'common/types';

import { solDatabase } from 'store/database';

import { TaskOccurrenceArray } from './models';

export const TaskOccurrencesStore: IAnyStateTreeNode = types
  .model({
    taskOccurrences: types.map(TaskOccurrenceArray),
    taskOccurrencesArray: TaskOccurrenceArray,
    taskOccurrencesWithPages: types.map(TaskOccurrenceArray),
    workspaceId: types.union(types.string, types.undefined),
    loading: types.union(types.undefined, types.boolean),
  })
  .actions((self) => {
    const setLoading = (value: boolean) => {
      self.loading = value;
    };

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

      const indexToUpdateInArray = self.taskOccurrencesArray.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToUpdateInArray !== -1) {
        // Update the object at the found index with the new data
        self.taskOccurrencesArray[indexToUpdate] = {
          ...self.taskOccurrencesArray[indexToUpdate],
          ...taskOccurrence,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.taskOccurrencesArray.push(taskOccurrence);
      }

      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (self as any).setLoading(false);
      }, 100);
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

      const indexToDeleteInArray = self.taskOccurrencesArray.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToDeleteInArray !== -1) {
        self.taskOccurrencesArray.splice(indexToDeleteInArray, 1);
      }

      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (self as any).setLoading(false);
      }, 100);
    };

    const load = flow(function* () {
      self.loading = true;

      const taskOccurrences = yield solDatabase.taskOccurrences.toArray();

      taskOccurrences.forEach((taskOccurrence: TaskOccurrenceType) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (self as any).update(taskOccurrence, taskOccurrence.id);
      });

      self.loading = false;
    });

    return { update, deleteById, load, setLoading };
  })
  .views((self) => ({
    getTaskOccurrencesForTask(taskId: string): TaskOccurrenceType[] {
      return self.taskOccurrences.get(taskId) ?? [];
    },
    getTaskOccurrenceWithTaskAndId(taskId: string, id: string) {
      const taskOccurrences = self.taskOccurrences.get(taskId);

      if (taskOccurrences) {
        return taskOccurrences.find(
          (taskOccurrence) => taskOccurrence.id === id,
        );
      }

      return undefined;
    },
    getTaskOccurrencesForPage(pageId: string): TaskOccurrenceType[] {
      return self.taskOccurrencesWithPages.get(pageId) ?? [];
    },
    get getKeys() {
      return Array.from(self.taskOccurrences.keys());
    },
    get getTaskOccurrences() {
      return self.taskOccurrencesArray;
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
  getKeys: string[];
  getTaskOccurrences: TaskOccurrenceType[];

  getTaskOccurrencesForTask: (taskId: string) => TaskOccurrenceType[];
  getTaskOccurrenceWithTaskAndId: (
    taskId: string,
    id: string,
  ) => TaskOccurrenceType;
}
