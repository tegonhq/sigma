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
    loading: types.union(types.undefined, types.boolean),
  })
  .actions((self) => {
    const setLoading = (value: boolean) => {
      self.loading = value;
    };

    const update = (task: TaskType, id: string) => {
      self.loading = true;

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

      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (self as any).setLoading(false);
      }, 100);
    };
    const deleteById = (id: string) => {
      self.loading = true;

      const indexToDelete = self.tasks.findIndex((obj) => obj.id === id);

      if (indexToDelete !== -1) {
        self.tasks.splice(indexToDelete, 1);
      }
      self.loading = false;
    };

    const load = flow(function* () {
      self.loading = true;

      const tasks = yield sigmaDatabase.tasks.toArray();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedTasks: any = [...tasks].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );

      self.tasks = sortedTasks;
      self.loading = false;
    });

    return { update, deleteById, load, setLoading };
  })
  .views((self) => ({
    getTasks({ listId }: { listId?: string }) {
      return self.tasks.filter((task) => {
        const isListTask = listId ? task.listId === listId : true;
        return isListTask;
      });
    },
    getCompletedTasksForDate(date: Date) {
      const tasks = self.tasks.filter((task) => {
        if (task.status === 'Done' || task.status === 'Canceled') {
          return task.completedAt && isSameDay(task.completedAt, date);
        }

        return false;
      });

      return sort(tasks).by([
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
    getTaskWithIds(taskIds: string[], { listId }: { listId?: string }) {
      return self.tasks.filter((task: TaskType) => {
        const isListTask = listId ? task.listId === listId : true;
        return isListTask && taskIds.includes(task.id);
      });
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
  loading: boolean;

  update: (task: TaskType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getTasks: (params: { listId?: string }) => TaskType[];
  getTaskWithId: (taskId: string) => TaskType;
  getTaskWithIds: (taskIds: string[], {}) => TaskType[];
  getTaskForPage: (pageId: string) => TaskType;
  getLastTaskNumber: () => number;
  getCompletedTasksForDate: (date: Date) => TaskType[];
  getTasksForDate: (date: Date) => TaskType[];
  getTasksNotCompleted: () => TaskType[];
}
