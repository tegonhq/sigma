import { Task } from '../task';

export interface Suggestion {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  content: string;
  taskId: string;
  task: Task;
}
