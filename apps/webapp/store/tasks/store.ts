import { isToday, isSameDay } from 'date-fns';
import { sort } from 'fast-sort';
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
    getTasks({ listId }: { listId?: string }) {
      return self.tasks.filter((task) => {
        const isListTask = listId ? task.listId === listId : true;
        return isListTask;
      });
    },
    getTasksForToday() {
      const tasks = self.tasks.filter((task) => {
        if (task.status === 'In Progress') {
          return true;
        }

        if (task.status === 'Done' || task.status === 'Canceled') {
          return task.completedAt && isToday(new Date(task.completedAt));
        }

        return false;
      });

      return sort(tasks).by([
        { desc: (task) => task.status === 'In Progress' },
        { desc: (task) => task.status === 'Done' },
        { desc: (task) => task.status === 'Canceled' },
      ]);
    },
    getTasksNotToday() {
      const tasks = self.tasks.filter((task) => {
        if (task.status === 'In Progress') {
          return false;
        }

        if (task.status === 'Done' || task.status === 'Canceled') {
          return !task.completedAt || !isToday(new Date(task.completedAt));
        }

        return true;
      });

      return sort(tasks).by([
        { desc: (task) => task.status === 'In Progress' },
        { desc: (task) => task.status === 'Done' },
        { desc: (task) => task.status === 'Canceled' },
      ]);
    },
    getCompletedTasksForDate(date: Date) {
      const tasks = self.tasks.filter((task) => {
        if (task.status === 'Done' || task.status === 'Canceled') {
          return task.completedAt && isSameDay(task.completedAt, date);
        }

        return false;
      });

      return sort(tasks).by([
        { desc: (task) => task.status === 'In Progress' },
        { desc: (task) => task.status === 'Done' },
        { desc: (task) => task.status === 'Canceled' },
      ]);
    },
    getTasksForDate(date: Date) {
      return self.tasks.filter((task) => {
        return task.dueDate && isSameDay(task.dueDate, date);
      });
    },
    getTasksNotCompleted() {
      const tasks = self.tasks.filter((task) => {
        if (task.status !== 'Done' && task.status !== 'Canceled') {
          return true;
        }

        return false;
      });

      return sort(tasks).by([{ desc: (task) => new Date(task.updatedAt) }]);
    },
    getTaskWithId(taskId: string) {
      return self.tasks.find((task: TaskType) => task.id === taskId);
    },
    getTaskForPage(pageId: string) {
      return self.tasks.find((task: TaskType) => task.pageId === pageId);
    },
    getLastTaskNumber() {
      const lastTask = sort(self.tasks)
        .by([{ asc: (task) => task.number }])
        .pop();

      return lastTask.number;
    },
  }));

export interface TasksStoreType {
  tasks: TaskType[];
  workspaceId: string;

  update: (task: TaskType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getTasks: (params: { listId?: string }) => TaskType[];
  getTaskWithId: (taskId: string) => TaskType;
  getTaskForPage: (pageId: string) => TaskType;
  getTasksForToday: () => TaskType[];
  getTasksNotToday: () => TaskType[];
  getLastTaskNumber: () => number;
  getCompletedTasksForDate: (date: Date) => TaskType[];
  getTasksForDate: (date: Date) => TaskType[];
  getTasksNotCompleted: () => TaskType[];
}
