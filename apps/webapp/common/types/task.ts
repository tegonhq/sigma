export interface TaskType {
  id: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startTime: string;
  dueDate?: string;
  endTime: string;
  recurrence: string[];
  scheduleText?: string;
  status: string;
  metadata: string;
  workspaceId: string;
  pageId: string;
  listId?: string;
  parentId?: string;
}
