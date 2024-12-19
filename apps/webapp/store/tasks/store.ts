import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { TaskType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { Task } from './models';

export const TasksStore: IAnyStateTreeNode = types
  .model({
    tasks: types.array(Task),
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (task: TaskType, id: string) => {
      const indexToUpdate = self.tasks.findIndex((obj) => obj.id === id);

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.tasks[indexToUpdate] = {
          ...self.tasks[indexToUpdate],
          ...task,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.tasks.push(task);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.tasks.findIndex((obj) => obj.id === id);

      if (indexToDelete !== -1) {
        self.tasks.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const tasks = yield sigmaDatabase.tasks.toArray();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedTasks: any = [...tasks].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );

      self.tasks = sortedTasks;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    get getTasks() {
      return self.tasks;
    },
    getTasksWithNoIntegration() {
      return self.tasks.filter((task: TaskType) => !task.integrationAccountId);
    },
    getTasksWithIntegration(integrationAccountId: string) {
      return self.tasks.filter(
        (task: TaskType) => task.integrationAccountId === integrationAccountId,
      );
    },
    getTaskWithId(taskId: string) {
      return self.tasks.find((task: TaskType) => task.id === taskId);
    },
    getTaskForPage(pageId: string) {
      return self.tasks.find((task: TaskType) => task.pageId === pageId);
    },
  }));

export interface TasksStoreType {
  tasks: TaskType[];
  workspaceId: string;

  update: (task: TaskType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getTasks: TaskType[];
  getTaskWithId: (taskId: string) => TaskType;
  getTasksWithNoIntegration: () => TaskType[];
  getTasksWithIntegration: (integrationAccountId: string) => TaskType[];
  getTaskForPage: (pageId: string) => TaskType;
}
