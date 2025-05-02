import { Task } from '../task';

export interface Summary {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  archived: Date | null;
  content: string;
  taskId: string;
  task: Task;
}
