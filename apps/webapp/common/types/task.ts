export interface TaskType {
  id: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dueDate: string;
  sourceId: string | null;
  url: string | null;
  status: string;
  metadata: string;
  workspaceId: string;
  pageId: string;
  integrationAccountId: string | null;
}
