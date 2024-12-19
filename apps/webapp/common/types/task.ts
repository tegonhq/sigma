export interface TaskType {
  id: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  sourceId: string | null;
  url: string | null;
  status: string;
  metadata: string;
  workspaceId: string;
  pageId: string;
  integrationAccountId: string | null;
}
