export interface TaskType {
  id: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startTime: string;
  endTime: string;
  recurrence: string[];
  sourceId: string | null;
  url: string | null;
  status: string;
  metadata: string;
  workspaceId: string;
  pageId: string;
  integrationAccountId: string | null;
  listId?: string;
}
