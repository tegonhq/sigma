import { Page } from '../page';
import { Task } from '../task/task.entity';

export enum TaskOccurrenceStatusEnum {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Done = 'Done',
  Cancelled = 'Cancelled',
}

export const TaskOccurrenceStatusType = {
  Todo: 'Todo',
  InProgress: 'InProgress',
  Done: 'Done',
  Cancelled: 'Cancelled',
};

export type TaskOccurrenceStatusType =
  (typeof TaskOccurrenceStatusType)[keyof typeof TaskOccurrenceStatusType];

export class TaskOccurrence {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted?: Date;

  startTime?: Date;
  endTime?: Date;
  status?: TaskOccurrenceStatusType;

  task: Task;
  taskId: string;

  page?: Page;
  pageId?: string;
}
